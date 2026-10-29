alter table public.deletion_requests add column account_ref uuid;
alter table public.deletion_requests add column email text;
create unique index deletion_requests_active_account on public.deletion_requests(account_ref) where state='prepared';
create table public.email_delivery_events (
  event_id text primary key,
  provider_message_id text,
  event_type text not null,
  received_at timestamptz not null default now()
);
alter table public.email_delivery_events enable row level security;
revoke all on public.email_delivery_events from anon,authenticated;
grant select,insert on public.email_delivery_events to service_role;
alter table public.newsletter_subscribers add column delivery_suppressed boolean not null default false;
alter table public.newsletter_subscribers add column suppression_reason text;
alter table public.newsletter_subscribers add column updated_at timestamptz not null default now();

create function public.preserve_delivery_suppression()
returns trigger language plpgsql set search_path='' as $$
begin
  if tg_op='UPDATE' and old.delivery_suppressed then new.delivery_suppressed:=true; new.suppression_reason:=old.suppression_reason; end if;
  if new.delivery_suppressed then new.status:='unsubscribed'; new.confirmation_hash:=null; end if;
  return new;
end $$;
revoke all on function public.preserve_delivery_suppression() from public,anon,authenticated;
create trigger protect_delivery_suppression before insert or update on public.newsletter_subscribers for each row execute function public.preserve_delivery_suppression();

create function public.prepare_account_deletion()
returns uuid language plpgsql security definer set search_path = '' as $$
declare address text; request_id uuid; needs_mfa boolean; fresh_primary boolean; fresh_second boolean;
begin
  select email into address from auth.users where id=auth.uid() and email_confirmed_at is not null;
  if address is null then raise exception 'Confirmed authentication required' using errcode='42501'; end if;
  select exists(select 1 from auth.mfa_factors where user_id=auth.uid() and status='verified') into needs_mfa;
  select exists(select 1 from jsonb_array_elements(coalesce(auth.jwt()->'amr','[]'::jsonb)) a where a->>'method' in ('password','oauth','otp') and (a->>'timestamp')::numeric between extract(epoch from now())-300 and extract(epoch from now())+30) into fresh_primary;
  select exists(select 1 from jsonb_array_elements(coalesce(auth.jwt()->'amr','[]'::jsonb)) a where a->>'method'='totp' and (a->>'timestamp')::numeric between extract(epoch from now())-300 and extract(epoch from now())+30) into fresh_second;
  if not fresh_primary or (needs_mfa and (coalesce(auth.jwt()->>'aal','')<>'aal2' or not fresh_second)) then raise exception 'Recent sign-in and required MFA must be completed' using errcode='42501'; end if;
  perform pg_advisory_xact_lock(72910511);
  if exists(select 1 from public.staff_members where user_id=auth.uid() and role='owner' and active) and (select count(*) from public.staff_members where role='owner' and active)<=1 then raise exception 'Transfer the last owner role before account deletion' using errcode='23514'; end if;
  insert into public.deletion_requests(user_id,account_ref,email) values(auth.uid(),auth.uid(),address)
    on conflict(account_ref) where state='prepared' do update set email=excluded.email returning id into request_id;
  return request_id;
end $$;
revoke all on function public.prepare_account_deletion() from public,anon;
grant execute on function public.prepare_account_deletion() to authenticated;

create function public.complete_account_deletion(request_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare item public.deletion_requests;
begin
  select * into item from public.deletion_requests where id=request_id for update;
  if not found then raise exception 'Request not found' using errcode='P0002'; end if;
  if item.state='completed' then return; end if;
  if item.user_id is not null or exists(select 1 from auth.users where id=item.account_ref) then raise exception 'Account deletion has not completed' using errcode='23514'; end if;
  update public.inquiries set email='deleted-account@invalid',payload=jsonb_build_object('redacted',true),updated_at=now()
    where lower(email)=lower(item.email) or payload->'submittedBy'->>'id'=item.account_ref::text;
  delete from public.newsletter_subscribers where lower(email)=lower(item.email);
  update public.deletion_requests set state='completed',account_ref=null,email=null,completed_at=now() where id=request_id;
end $$;
revoke all on function public.complete_account_deletion(uuid) from public,anon,authenticated;
grant execute on function public.complete_account_deletion(uuid) to service_role;

create function public.record_email_delivery(event_key text, message_id text, event_name text, recipients text[])
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if char_length(event_key) not between 1 and 200 or event_name not in ('email.delivered','email.bounced','email.complained','email.failed','email.delivery_delayed') or coalesce(array_length(recipients,1),0)>100 then raise exception 'Invalid delivery event' using errcode='22023'; end if;
  insert into public.email_delivery_events(event_id,provider_message_id,event_type) values(event_key,left(message_id,200),event_name) on conflict do nothing;
  if not found then return false; end if;
  if event_name in ('email.bounced','email.complained') then
    update public.newsletter_subscribers set delivery_suppressed=true,suppression_reason=event_name,status='unsubscribed',confirmation_hash=null,updated_at=now() where lower(email)=any(select lower(value) from unnest(recipients) value);
  end if;
  return true;
end $$;
revoke all on function public.record_email_delivery(text,text,text,text[]) from public,anon,authenticated;
grant execute on function public.record_email_delivery(text,text,text,text[]) to service_role;

-- Retention is opt-in. Null policy values delete no inquiries/subscriptions.
-- A dry run reports counts; completed user-deletion requests are always repaired.
create function public.platform_maintenance(dry_run boolean default true, inquiry_days integer default null, pending_days integer default null, unsubscribed_days integer default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare expired_limits bigint; old_inquiries bigint; old_pending bigint; old_unsubscribed bigint; repairs bigint; item record;
begin
  if (inquiry_days is not null and inquiry_days not between 30 and 3650) or (pending_days is not null and pending_days not between 2 and 365) or (unsubscribed_days is not null and unsubscribed_days not between 30 and 3650) or dry_run is null then raise exception 'Invalid retention policy' using errcode='22023'; end if;
  select count(*) into expired_limits from public.request_limits where window_start<now()-interval '2 days';
  select count(*) into old_inquiries from public.inquiries where inquiry_days is not null and status in ('resolved','rejected') and updated_at<now()-make_interval(days=>inquiry_days);
  select count(*) into old_pending from public.newsletter_subscribers where pending_days is not null and status='pending' and created_at<now()-make_interval(days=>pending_days);
  -- Suppression records remain to prevent accidental re-mailing after a bounce.
  select count(*) into old_unsubscribed from public.newsletter_subscribers where unsubscribed_days is not null and status='unsubscribed' and not delivery_suppressed and updated_at<now()-make_interval(days=>unsubscribed_days);
  select count(*) into repairs from public.deletion_requests where state='prepared' and user_id is null;
  if not dry_run then
    delete from public.request_limits where window_start<now()-interval '2 days';
    delete from public.inquiries where inquiry_days is not null and status in ('resolved','rejected') and updated_at<now()-make_interval(days=>inquiry_days);
    delete from public.newsletter_subscribers where (pending_days is not null and status='pending' and created_at<now()-make_interval(days=>pending_days)) or (unsubscribed_days is not null and status='unsubscribed' and not delivery_suppressed and updated_at<now()-make_interval(days=>unsubscribed_days));
    for item in select id from public.deletion_requests where state='prepared' and user_id is null loop perform public.complete_account_deletion(item.id); end loop;
  end if;
  return jsonb_build_object('dryRun',dry_run,'expiredLimitRows',expired_limits,'resolvedInquiries',old_inquiries,'pendingSubscriptions',old_pending,'unsubscribedRecords',old_unsubscribed,'accountDeletionRepairs',repairs);
end $$;
revoke all on function public.platform_maintenance(boolean,integer,integer,integer) from public,anon,authenticated;
grant execute on function public.platform_maintenance(boolean,integer,integer,integer) to service_role;

create or replace function public.platform_readiness()
returns jsonb language sql security definer set search_path = '' as $$
  select jsonb_build_object('ready',to_regclass('public.saved_items') is not null and to_regclass('public.inquiries') is not null and to_regclass('public.staff_members') is not null and to_regclass('public.catalog_publications') is not null and to_regclass('public.email_delivery_events') is not null and to_regclass('auth.mfa_factors') is not null,'schemaVersion',3);
$$;
