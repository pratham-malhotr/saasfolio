-- Private, retry-safe brand intake. The same key and content return one receipt.
alter table public.inquiries add column submission_key uuid unique;
alter table public.inquiries add column submission_fingerprint text;
alter table public.inquiries add constraint inquiry_submission_key_pair check (
  (submission_key is null and submission_fingerprint is null) or
  (submission_key is not null and submission_fingerprint is not null and submission_fingerprint ~ '^[a-f0-9]{64}$' and kind = 'submission')
);

create function public.save_brand_submission(request_key uuid, request_email text, request_payload jsonb, request_fingerprint text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare receipt uuid; prior_fingerprint text;
begin
  if request_key is null or request_email is null or length(request_email) > 254 or
     request_payload is null or request_payload->>'submissionType' is distinct from 'brand' or
     request_fingerprint is null or request_fingerprint !~ '^[a-f0-9]{64}$' then
    raise exception 'Invalid submission' using errcode = '22023';
  end if;
  insert into public.inquiries (kind, email, payload, submission_key, submission_fingerprint)
    values ('submission', request_email, request_payload, request_key, request_fingerprint)
    on conflict (submission_key) do nothing returning id into receipt;
  if receipt is not null then return receipt; end if;
  select id, submission_fingerprint into receipt, prior_fingerprint
    from public.inquiries where submission_key = request_key;
  if receipt is null or prior_fingerprint is distinct from request_fingerprint then
    raise exception 'Submission key already used for different content' using errcode = '23505';
  end if;
  return receipt;
end $$;
revoke all on function public.save_brand_submission(uuid,text,jsonb,text) from public, anon, authenticated;
grant execute on function public.save_brand_submission(uuid,text,jsonb,text) to service_role;

create or replace function public.platform_readiness()
returns jsonb language sql security definer set search_path = '' as $$
  select jsonb_build_object('ready',
    to_regclass('public.saved_items') is not null and to_regclass('public.inquiries') is not null and
    to_regclass('public.staff_members') is not null and to_regclass('public.catalog_publications') is not null and
    to_regclass('public.email_delivery_events') is not null and to_regclass('auth.mfa_factors') is not null and
    to_regprocedure('public.save_brand_submission(uuid,text,jsonb,text)') is not null,
    'schemaVersion',4);
$$;

-- Existing privacy cleanup redacts payloads. Clear retry metadata with them.
create function public.clear_redacted_submission_receipt()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.payload @> '{"redacted":true}'::jsonb then
    new.submission_key := null;
    new.submission_fingerprint := null;
  end if;
  return new;
end $$;
revoke all on function public.clear_redacted_submission_receipt() from public,anon,authenticated;
create trigger clear_redacted_submission_receipt before update of payload on public.inquiries
  for each row execute function public.clear_redacted_submission_receipt();
