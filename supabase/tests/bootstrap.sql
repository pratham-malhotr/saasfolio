-- Disposable test database only. Reproduces PostgREST's signed-claim helpers;
-- this is not a replacement for production Supabase Auth or delivery testing.
do $$ begin
  if not exists(select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
  if not exists(select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
  if not exists(select 1 from pg_roles where rolname='service_role') then create role service_role nologin bypassrls; end if;
end $$;
create schema auth;
create table auth.users(id uuid primary key, email text unique, email_confirmed_at timestamptz, raw_user_meta_data jsonb default '{}');
create table auth.mfa_factors(id uuid primary key default gen_random_uuid(),user_id uuid references auth.users(id) on delete cascade,status text not null);
create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
create function auth.uid() returns uuid language sql stable as $$ select nullif(auth.jwt()->>'sub','')::uuid $$;
grant usage on schema auth,public to anon,authenticated,service_role;
grant select on auth.users to service_role;
insert into auth.users(id,email,email_confirmed_at) values
('00000000-0000-4000-8000-000000000001','owner@example.test',now()),
('00000000-0000-4000-8000-000000000002','editor@example.test',now()),
('00000000-0000-4000-8000-000000000003','reviewer@example.test',now()),
('00000000-0000-4000-8000-000000000004','visitor@example.test',now()),
('00000000-0000-4000-8000-000000000005','pending@example.test',null),
('00000000-0000-4000-8000-000000000006','second-owner@example.test',now());
update auth.users set raw_user_meta_data='{"role":"owner","isAdmin":true}' where email='visitor@example.test';
create function public.test_assert(ok boolean, label text) returns void language plpgsql as $$ begin if ok is distinct from true then raise exception 'Assertion failed: %',label; end if; end $$;
create function public.test_denied(statement text, expected_code text default '42501') returns void language plpgsql as $$
begin
  begin execute statement;
  exception when others then
    if sqlstate=expected_code then return; end if;
    raise exception 'Unexpected SQLSTATE % (expected %)',sqlstate,expected_code;
  end;
  raise exception 'Expected a rejected operation';
end $$;
