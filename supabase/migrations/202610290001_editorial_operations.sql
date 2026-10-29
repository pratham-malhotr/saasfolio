-- Additive migration. Staff mutations require a confirmed account, AAL2 and
-- database-owned permissions, even when the RPC is called outside the website.
create table public.staff_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'editor', 'reviewer')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.audit_events (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index audit_events_created_at on public.audit_events(created_at desc, id desc);
create table public.catalog_entries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('brand', 'guide', 'offer')),
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 100),
  payload jsonb not null check (jsonb_typeof(payload) = 'object' and octet_length(payload::text) <= 100000),
  state text not null default 'draft' check (state in ('draft', 'in_review', 'approved', 'published', 'retired')),
  revision integer not null default 1 check (revision > 0),
  edited_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  approved_revision integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(kind, slug)
);
create table public.source_observations (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.catalog_entries(id),
  entry_revision integer not null,
  source_url text not null,
  content_hash text,
  status text not null check (status in ('ok', 'blocked', 'evidence_changed', 'unavailable')),
  checked_at timestamptz not null default now(),
  unique(entry_id, entry_revision)
);
create table public.catalog_revisions (
  entry_id uuid not null references public.catalog_entries(id),
  revision integer not null,
  payload jsonb not null,
  edited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key(entry_id,revision)
);
create table public.catalog_publications (
  kind text not null,
  slug text not null,
  payload jsonb not null,
  revision integer not null,
  retired boolean not null default false,
  published_at timestamptz not null default now(),
  primary key(kind, slug)
);
create table public.catalog_release (
  singleton boolean primary key default true check(singleton),
  revision bigint not null default 0,
  published_at timestamptz
);
insert into public.catalog_release(singleton) values(true);
create table public.deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  state text not null default 'prepared' check(state in ('prepared', 'completed')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.staff_members enable row level security;
alter table public.audit_events enable row level security;
alter table public.catalog_entries enable row level security;
alter table public.source_observations enable row level security;
alter table public.catalog_revisions enable row level security;
alter table public.catalog_publications enable row level security;
alter table public.catalog_release enable row level security;
alter table public.deletion_requests enable row level security;
revoke all on public.staff_members, public.audit_events, public.catalog_entries, public.source_observations, public.catalog_publications, public.catalog_release, public.deletion_requests from anon, authenticated;
revoke all on public.catalog_revisions from anon, authenticated;
grant select, insert on public.catalog_revisions to service_role;
grant select, insert, update, delete on public.staff_members, public.catalog_entries, public.source_observations, public.catalog_publications, public.catalog_release, public.deletion_requests to service_role;
grant select, insert on public.audit_events to service_role;
grant usage, select on sequence public.audit_events_id_seq to service_role;

create function public.staff_permission(allowed_roles text[], require_mfa boolean default true)
returns text language plpgsql security definer set search_path = '' as $$
declare selected_role text;
begin
  if auth.uid() is null or not exists(select 1 from auth.users where id = auth.uid() and email_confirmed_at is not null) then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  select role into selected_role from public.staff_members where user_id = auth.uid() and active;
  if selected_role is null or not (selected_role = any(allowed_roles)) then
    raise exception 'Insufficient staff permission' using errcode = '42501';
  end if;
  if require_mfa and coalesce(auth.jwt()->>'aal', '') <> 'aal2' then
    raise exception 'Multi-factor authentication required' using errcode = '42501';
  end if;
  return selected_role;
end $$;
revoke all on function public.staff_permission(text[], boolean) from public, anon, authenticated;

create function public.staff_self()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare selected_role text;
begin
  if auth.uid() is null then return null; end if;
  if not exists(select 1 from auth.users where id = auth.uid() and email_confirmed_at is not null) then return null; end if;
  select role into selected_role from public.staff_members where user_id = auth.uid() and active;
  if selected_role is null then return null; end if;
  return jsonb_build_object('role', selected_role, 'mfaVerified', coalesce(auth.jwt()->>'aal', '') = 'aal2');
end $$;
revoke all on function public.staff_self() from public, anon;
grant execute on function public.staff_self() to authenticated;

-- The server calls this only for a provider-confirmed ADMIN_EMAILS account.
-- It seeds the first owner; later assignments go through owner-only RPCs.
create function public.bootstrap_staff_owner(target_user uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(72910511);
  if exists(select 1 from public.staff_members where user_id = target_user) then return false; end if;
  if exists(select 1 from public.staff_members where role = 'owner' and active) then return false; end if;
  if not exists(select 1 from auth.users where id = target_user and email_confirmed_at is not null) then return false; end if;
  insert into public.staff_members(user_id, role) values(target_user, 'owner');
  insert into public.audit_events(actor_id,action,entity_type,entity_id) values(target_user,'staff.bootstrap','staff',target_user::text);
  return true;
end $$;
revoke all on function public.bootstrap_staff_owner(uuid) from public, anon, authenticated;
grant execute on function public.bootstrap_staff_owner(uuid) to service_role;

create function public.guard_last_owner()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(72910511);
  if old.role = 'owner' and old.active and (tg_op = 'DELETE' or new.role <> 'owner' or not new.active)
    and (select count(*) from public.staff_members where role='owner' and active) <= 1 then
      raise exception 'A remaining active owner is required' using errcode='23514';
  end if;
  if tg_op='DELETE' then return old; end if;
  return new;
end $$;
revoke all on function public.guard_last_owner() from public, anon, authenticated;
create trigger protect_last_owner before update or delete on public.staff_members for each row execute function public.guard_last_owner();

create function public.manage_staff(target_email text, target_role text, target_active boolean default true)
returns void language plpgsql security definer set search_path = '' as $$
declare target uuid;
begin
  perform public.staff_permission(array['owner']);
  if target_role not in ('owner','editor','reviewer') or target_active is null then raise exception 'Invalid staff role' using errcode='22023'; end if;
  select id into target from auth.users where lower(email)=lower(trim(target_email)) and email_confirmed_at is not null;
  if target is null then raise exception 'A confirmed account is required' using errcode='22023'; end if;
  insert into public.staff_members(user_id,role,active) values(target,target_role,target_active)
    on conflict(user_id) do update set role=excluded.role,active=excluded.active,updated_at=now();
  insert into public.audit_events(actor_id,action,entity_type,entity_id,details)
    values(auth.uid(),'staff.updated','staff',target::text,jsonb_build_object('role',target_role,'active',target_active));
end $$;
revoke all on function public.manage_staff(text,text,boolean) from public, anon;
grant execute on function public.manage_staff(text,text,boolean) to authenticated;

create function public.list_staff()
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  perform public.staff_permission(array['owner']);
  return coalesce((select jsonb_agg(jsonb_build_object('userId',s.user_id,'email',u.email,'role',s.role,'active',s.active) order by s.created_at) from public.staff_members s join auth.users u on u.id=s.user_id),'[]'::jsonb);
end $$;
revoke all on function public.list_staff() from public, anon;
grant execute on function public.list_staff() to authenticated;

create function public.validate_catalog_payload(entry_kind text, p jsonb)
returns boolean language plpgsql immutable set search_path = '' as $$
declare allowed text[]; item jsonb;
begin
  if p is null or jsonb_typeof(p)<>'object' then return false; end if;
  if exists(select 1 from jsonb_each(p) e where jsonb_typeof(e.value) is distinct from case when e.key=any(array['keyFeatures','decisionRows','sections','redemptionSteps','relatedSlugs','faqs','sourceNotes','sources','savingsOptions','evidence']) then 'array' when e.key='discountPercentage' then 'number' else 'string' end) then return false; end if;
  if entry_kind='brand' then
    allowed:=array['name','categorySlug','website','pricingUrl','description','longDescription','keyFeatures','pricingModel','reviewedAt'];
    if not(p ?& allowed) then return false; end if;
    if char_length(coalesce(p->>'name','')) not between 2 and 100 or char_length(coalesce(p->>'description',''))<60 or char_length(coalesce(p->>'longDescription',''))<200 or jsonb_typeof(p->'keyFeatures')<>'array' or jsonb_array_length(p->'keyFeatures')<3 then return false; end if;
    if p->>'website' !~ '^https://' or p->>'pricingUrl' !~ '^https://' or p->>'pricingModel' not in ('Paid','Freemium','Free Trial','Open Source') then return false; end if;
    if p->>'categorySlug' not in ('ai-tools','marketing','crm-sales','dev-tools','design','analytics','hosting','finance','productivity','security','ecommerce','project-management') then return false; end if;
  elsif entry_kind='guide' then
    allowed:=array['reviewedAt','sourceUrl','searchTitle','metaDescription','intro','summary','bestDiscountAnswer','decisionRows','sections','redemptionSteps','relatedSlugs','faqs','sourceNotes','sources','savingsOptions','billingModel'];
    if not(p ?& array['reviewedAt','sourceUrl','searchTitle','metaDescription','intro','summary','bestDiscountAnswer','decisionRows','sections','redemptionSteps','relatedSlugs','faqs','sourceNotes']) then return false; end if;
    if char_length(coalesce(p->>'metaDescription','')) not between 70 and 155 or char_length(coalesce(p->>'bestDiscountAnswer',''))<150 or p->>'sourceUrl' !~ '^https://' then return false; end if;
    if jsonb_typeof(p->'sections')<>'array' or jsonb_array_length(p->'sections')<4 or jsonb_typeof(p->'redemptionSteps')<>'array' or jsonb_array_length(p->'redemptionSteps')<>4 or jsonb_typeof(p->'faqs')<>'array' or jsonb_array_length(p->'faqs')<3 then return false; end if;
  elsif entry_kind='offer' then
    allowed:=array['toolSlug','title','dealType','code','discountPercentage','discountKind','sourceKind','sourceUrl','destinationUrl','evidence','terms','expiryDate'];
    if not(p ?& array['toolSlug','title','dealType','discountPercentage','sourceKind','sourceUrl','destinationUrl','evidence','terms']) then return false; end if;
    if p->>'toolSlug' !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or char_length(coalesce(p->>'title',''))<10 or char_length(coalesce(p->>'terms',''))<80 or p->>'dealType' not in ('coupon','offer','free_trial','free_plan','lifetime') then return false; end if;
    if p->>'sourceKind' not in ('vendor','coupon-site') or p->>'sourceUrl' !~ '^https://' or p->>'destinationUrl' !~ '^https://' or jsonb_typeof(p->'evidence')<>'array' or jsonb_array_length(p->'evidence')<1 then return false; end if;
    if jsonb_typeof(p->'discountPercentage')<>'number' or (p->>'discountPercentage')::numeric not between 0 and 100 then return false; end if;
    if p->>'dealType'='coupon' and coalesce(p->>'code','') !~ '^[A-Za-z0-9_-]{3,48}$' then return false; end if;
    if p->>'dealType'<>'coupon' and coalesce(p->>'code','')<>'' then return false; end if;
    for item in select * from jsonb_array_elements(p->'evidence') loop
      if jsonb_typeof(item)<>'string' or char_length(item#>>'{}')<3 then return false; end if;
    end loop;
  else return false;
  end if;
  return (p-allowed)='{}'::jsonb;
exception when others then return false;
end $$;
revoke all on function public.validate_catalog_payload(text,jsonb) from public, anon, authenticated;

create function public.save_catalog_entry(entry_kind text, entry_slug text, entry_payload jsonb, expected_revision integer default 0)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare item public.catalog_entries; selected_role text;
begin
  selected_role := public.staff_permission(array['owner','editor']);
  if entry_kind not in ('brand','guide','offer') or entry_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or char_length(entry_slug)>100
    or not public.validate_catalog_payload(entry_kind,entry_payload) or octet_length(entry_payload::text)>100000 then raise exception 'Invalid catalog entry' using errcode='22023'; end if;
  select * into item from public.catalog_entries where kind=entry_kind and slug=entry_slug for update;
  if found then
    if item.revision <> expected_revision then raise exception 'Revision conflict' using errcode='40001'; end if;
    if entry_kind='offer' and item.payload->>'toolSlug' is distinct from entry_payload->>'toolSlug' then raise exception 'Offer identity is immutable' using errcode='23514'; end if;
    update public.catalog_entries set payload=entry_payload,state='draft',revision=revision+1,edited_by=auth.uid(),approved_by=null,approved_revision=null,updated_at=now()
      where id=item.id returning * into item;
  else
    if expected_revision<>0 then raise exception 'Revision conflict' using errcode='40001'; end if;
    insert into public.catalog_entries(kind,slug,payload,edited_by) values(entry_kind,entry_slug,entry_payload,auth.uid()) returning * into item;
  end if;
  insert into public.catalog_revisions(entry_id,revision,payload,edited_by) values(item.id,item.revision,item.payload,auth.uid());
  insert into public.audit_events(actor_id,action,entity_type,entity_id,details) values(auth.uid(),'catalog.saved',entry_kind,item.id::text,jsonb_build_object('slug',entry_slug,'revision',item.revision));
  return to_jsonb(item);
end $$;
revoke all on function public.save_catalog_entry(text,text,jsonb,integer) from public, anon;
grant execute on function public.save_catalog_entry(text,text,jsonb,integer) to authenticated;

create function public.list_catalog_entries(before_time timestamptz default null, before_id uuid default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  perform public.staff_permission(array['owner','editor','reviewer']);
  return coalesce((select jsonb_agg(to_jsonb(items)) from (select * from public.catalog_entries where before_time is null or (updated_at,id)<(before_time,before_id) order by updated_at desc,id desc limit 50) items),'[]'::jsonb);
end $$;
revoke all on function public.list_catalog_entries(timestamptz,uuid) from public, anon;
grant execute on function public.list_catalog_entries(timestamptz,uuid) to authenticated;

create function public.catalog_entry_details(target_entry uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  perform public.staff_permission(array['owner','editor','reviewer']);
  return (select to_jsonb(e) from public.catalog_entries e where id=target_entry);
end $$;
revoke all on function public.catalog_entry_details(uuid) from public, anon;
grant execute on function public.catalog_entry_details(uuid) to authenticated;

create function public.catalog_transition(entry_id uuid, expected_revision integer, transition text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare item public.catalog_entries; proof public.source_observations; selected_role text;
begin
  selected_role := public.staff_permission(array['owner','editor','reviewer']);
  select * into item from public.catalog_entries where id=entry_id for update;
  if not found then raise exception 'Entry not found' using errcode='P0002'; end if;
  if item.revision<>expected_revision then raise exception 'Revision conflict' using errcode='40001'; end if;
  if transition='submit' then
    if selected_role not in ('owner','editor') or item.state<>'draft' then raise exception 'Invalid submission' using errcode='42501'; end if;
    update public.catalog_entries set state='in_review',updated_at=now() where id=entry_id;
  elsif transition='reject' then
    if selected_role not in ('owner','reviewer') or item.state not in ('in_review','approved') then raise exception 'Invalid review' using errcode='42501'; end if;
    update public.catalog_entries set state='draft',approved_by=null,approved_revision=null,updated_at=now() where id=entry_id;
  elsif transition='approve' then
    if selected_role not in ('owner','reviewer') or item.state<>'in_review' or item.edited_by=auth.uid() then raise exception 'Independent review required' using errcode='42501'; end if;
    if item.kind='offer' then
      select * into proof from public.source_observations where source_observations.entry_id=item.id and entry_revision=item.revision;
      if not found or proof.status<>'ok' or proof.checked_at < now()-interval '14 days' then raise exception 'Current source evidence required' using errcode='23514'; end if;
    end if;
    update public.catalog_entries set state='approved',approved_by=auth.uid(),approved_revision=revision,updated_at=now() where id=entry_id;
  elsif transition='publish' then
    if selected_role<>'owner' or item.state<>'approved' or item.approved_revision<>item.revision or item.approved_by is null or item.edited_by is null or item.approved_by=item.edited_by then raise exception 'Approved revision required' using errcode='42501'; end if;
    if item.kind='offer' then
      select * into proof from public.source_observations where source_observations.entry_id=item.id and entry_revision=item.revision;
      if not found or proof.status<>'ok' or proof.checked_at < now()-interval '14 days' or proof.checked_at>now() then raise exception 'Current source evidence required' using errcode='23514'; end if;
      if nullif(item.payload->>'expiryDate','') is not null and (item.payload->>'expiryDate')::timestamptz<=now() then raise exception 'Offer expired' using errcode='23514'; end if;
      item.payload := item.payload || jsonb_build_object('checkedAt',proof.checked_at,'contentHash',proof.content_hash);
    end if;
    insert into public.catalog_publications(kind,slug,payload,revision) values(item.kind,item.slug,item.payload,item.revision)
      on conflict(kind,slug) do update set payload=excluded.payload,revision=excluded.revision,retired=false,published_at=now();
    update public.catalog_entries set state='published',updated_at=now() where id=entry_id;
    update public.catalog_release set revision=revision+1,published_at=now();
  elsif transition='retire' then
    if selected_role<>'owner' or not exists(select 1 from public.catalog_publications where kind=item.kind and slug=item.slug and not retired) then raise exception 'Active publication required' using errcode='42501'; end if;
    update public.catalog_publications set retired=true,published_at=now() where kind=item.kind and slug=item.slug;
    update public.catalog_entries set state='retired',updated_at=now() where id=entry_id;
    update public.catalog_release set revision=revision+1,published_at=now();
  else raise exception 'Invalid transition' using errcode='22023';
  end if;
  insert into public.audit_events(actor_id,action,entity_type,entity_id,details) values(auth.uid(),'catalog.'||transition,item.kind,item.id::text,jsonb_build_object('slug',item.slug,'revision',item.revision));
  return (select to_jsonb(e) from public.catalog_entries e where id=entry_id);
end $$;
revoke all on function public.catalog_transition(uuid,integer,text) from public, anon;
grant execute on function public.catalog_transition(uuid,integer,text) to authenticated;

create function public.record_source_observation(target_entry uuid, target_revision integer, checked_url text, fingerprint text, outcome text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not exists(select 1 from public.catalog_entries where id=target_entry and revision=target_revision and state='in_review') then raise exception 'Revision conflict' using errcode='40001'; end if;
  if outcome not in ('ok','blocked','evidence_changed','unavailable') or checked_url !~ '^https://' or (outcome='ok' and (fingerprint is null or fingerprint !~ '^[a-f0-9]{64}$')) then raise exception 'Invalid observation' using errcode='22023'; end if;
  insert into public.source_observations(entry_id,entry_revision,source_url,content_hash,status) values(target_entry,target_revision,checked_url,fingerprint,outcome)
    on conflict(entry_id,entry_revision) do update set source_url=excluded.source_url,content_hash=excluded.content_hash,status=excluded.status,checked_at=now();
end $$;
revoke all on function public.record_source_observation(uuid,integer,text,text,text) from public, anon, authenticated;
grant execute on function public.record_source_observation(uuid,integer,text,text,text) to service_role;

create function public.catalog_revision_history(target_entry uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  perform public.staff_permission(array['owner','editor','reviewer']);
  return coalesce((select jsonb_agg(to_jsonb(items)) from (select revision,payload,created_at from public.catalog_revisions where entry_id=target_entry order by revision desc limit 50) items),'[]'::jsonb);
end $$;
revoke all on function public.catalog_revision_history(uuid) from public, anon;
grant execute on function public.catalog_revision_history(uuid) to authenticated;

create function public.restore_catalog_revision(target_entry uuid, expected_revision integer, restore_revision integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare item public.catalog_entries; previous jsonb;
begin
  perform public.staff_permission(array['owner','editor']);
  select * into item from public.catalog_entries where id=target_entry for update;
  if not found then raise exception 'Entry not found' using errcode='P0002'; end if;
  if item.revision<>expected_revision then raise exception 'Revision conflict' using errcode='40001'; end if;
  select payload into previous from public.catalog_revisions where entry_id=target_entry and revision=restore_revision;
  if previous is null then raise exception 'Revision not found' using errcode='P0002'; end if;
  return public.save_catalog_entry(item.kind,item.slug,previous,expected_revision);
end $$;
revoke all on function public.restore_catalog_revision(uuid,integer,integer) from public, anon;
grant execute on function public.restore_catalog_revision(uuid,integer,integer) to authenticated;

-- Only approved public fields are exported. Staff identities, drafts, private
-- inquiries and source-observation internals are never part of this response.
create function public.public_catalog_snapshot()
returns jsonb language sql security definer set search_path = '' as $$
  select jsonb_build_object('schemaVersion',1,'revision',r.revision,'publishedAt',r.published_at,'entries',
    coalesce((select jsonb_agg(jsonb_build_object('kind',p.kind,'slug',p.slug,'payload',p.payload,'revision',p.revision,'retired',p.retired,'publishedAt',p.published_at) order by p.kind,p.slug) from public.catalog_publications p),'[]'::jsonb))
  from public.catalog_release r where singleton;
$$;
revoke all on function public.public_catalog_snapshot() from public;
grant execute on function public.public_catalog_snapshot() to anon, authenticated, service_role;

create function public.review_inquiries(before_time timestamptz default null, before_id uuid default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  perform public.staff_permission(array['owner','reviewer']);
  return coalesce((select jsonb_agg(to_jsonb(items)) from (select id,kind,email,payload,status,created_at,updated_at from public.inquiries
    where before_time is null or (created_at,id)<(before_time,before_id) order by created_at desc,id desc limit 50) items),'[]'::jsonb);
end $$;
revoke all on function public.review_inquiries(timestamptz,uuid) from public, anon;
grant execute on function public.review_inquiries(timestamptz,uuid) to authenticated;

create function public.update_inquiry_status(target_id uuid, previous_status text, next_status text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform public.staff_permission(array['owner','reviewer']);
  if next_status not in ('pending','reviewing','resolved','rejected') then raise exception 'Invalid status' using errcode='22023'; end if;
  update public.inquiries set status=next_status,updated_at=now() where id=target_id and status=previous_status;
  if not found then raise exception 'Revision conflict' using errcode='40001'; end if;
  insert into public.audit_events(actor_id,action,entity_type,entity_id,details) values(auth.uid(),'inquiry.status','inquiry',target_id::text,jsonb_build_object('from',previous_status,'to',next_status));
end $$;
revoke all on function public.update_inquiry_status(uuid,text,text) from public, anon;
grant execute on function public.update_inquiry_status(uuid,text,text) to authenticated;

create function public.list_audit_events(before_id bigint default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  perform public.staff_permission(array['owner','reviewer']);
  return coalesce((select jsonb_agg(to_jsonb(items)) from (select * from public.audit_events where before_id is null or id<before_id order by id desc limit 100) items),'[]'::jsonb);
end $$;
revoke all on function public.list_audit_events(bigint) from public, anon;
grant execute on function public.list_audit_events(bigint) to authenticated;

create function public.platform_readiness()
returns jsonb language sql security definer set search_path = '' as $$
  select jsonb_build_object('ready',to_regclass('public.saved_items') is not null and to_regclass('public.inquiries') is not null and to_regclass('public.staff_members') is not null and to_regclass('public.catalog_publications') is not null,'schemaVersion',2);
$$;
revoke all on function public.platform_readiness() from public, anon, authenticated;
grant execute on function public.platform_readiness() to service_role;
