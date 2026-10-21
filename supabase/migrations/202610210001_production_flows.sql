-- Run once in the Supabase SQL editor or through the Supabase CLI.
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('contact', 'advertise', 'submission')),
  email text not null,
  payload jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'reviewing', 'resolved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.inquiries enable row level security;
revoke all on public.inquiries from anon, authenticated;
grant all on public.inquiries to service_role;

create table if not exists public.saved_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('deal', 'article')),
  slug text not null check (char_length(slug) between 1 and 200),
  created_at timestamptz not null default now(),
  primary key (user_id, kind, slug)
);
alter table public.saved_items enable row level security;
create policy "Users manage their saved items" on public.saved_items
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
revoke all on public.saved_items from anon, authenticated;
grant select, insert, update, delete on public.saved_items to authenticated;

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  status text not null default 'pending' check (status in ('pending', 'active', 'unsubscribed')),
  confirmation_hash text unique,
  confirmation_expires_at timestamptz,
  unsubscribe_hash text unique,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  consent_version text not null default '2026-10-21'
);
alter table public.newsletter_subscribers enable row level security;
revoke all on public.newsletter_subscribers from anon, authenticated;
grant all on public.newsletter_subscribers to service_role;

create table if not exists public.request_limits (
  key text primary key,
  hits integer not null,
  window_start timestamptz not null
);
alter table public.request_limits enable row level security;
revoke all on public.request_limits from anon, authenticated;
grant all on public.request_limits to service_role;

create or replace function public.consume_request_limit(bucket_key text, max_attempts integer, window_seconds integer)
returns boolean language plpgsql security definer set search_path = '' as $$
declare total integer;
begin
  if max_attempts < 1 or max_attempts > 100 or window_seconds < 1 or window_seconds > 86400 then return false; end if;
  insert into public.request_limits as limits (key, hits, window_start)
    values (bucket_key, 1, now())
    on conflict (key) do update set
      hits = case when limits.window_start <= now() - make_interval(secs => window_seconds) then 1 else least(limits.hits + 1, max_attempts + 1) end,
      window_start = case when limits.window_start <= now() - make_interval(secs => window_seconds) then now() else limits.window_start end
    returning hits into total;
  return total <= max_attempts;
end;
$$;
revoke all on function public.consume_request_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_request_limit(text, integer, integer) to service_role;
create index if not exists inquiries_created_at on public.inquiries(created_at desc);
