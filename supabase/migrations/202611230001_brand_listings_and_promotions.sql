create table public.brand_listings (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid unique references public.inquiries(id) on delete set null,
  host text not null unique check (host ~ '^[a-z0-9][a-z0-9.-]*[.][a-z0-9-]+$' and char_length(host) <= 253),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 100),
  catalog_slug text,
  name text not null,
  website text not null,
  category_slug text not null,
  description text not null,
  pricing_model text not null,
  approval_method text not null check (approval_method in ('automatic', 'manual')),
  approved_at timestamptz not null default now(),
  hidden_at timestamptz,
  sponsored_from timestamptz,
  sponsored_until timestamptz,
  check ((sponsored_from is null and sponsored_until is null) or
    (sponsored_from is not null and sponsored_until is not null and sponsored_until > sponsored_from))
);

alter table public.brand_listings enable row level security;
revoke all on public.brand_listings from public, anon, authenticated;
grant all on public.brand_listings to service_role;

-- The caller proves domain control or explicitly reviews the original source.
-- Lock the inquiry so approval, duplicate detection and resolution happen together.
create function public.approve_brand_listing(
  receipt uuid, reviewed_at timestamptz, listing_host text, listing_slug text,
  reviewed_catalog_slug text, method text
) returns uuid language plpgsql security invoker set search_path = '' as $$
declare queued public.inquiries%rowtype; listing uuid;
begin
  select * into queued from public.inquiries where id = receipt for update;
  if not found or queued.kind <> 'submission' or queued.payload->>'submissionType' is distinct from 'brand'
    or queued.status = 'rejected' or queued.payload @> '{"redacted":true}'::jsonb then
    return null;
  end if;
  select id into listing from public.brand_listings where inquiry_id = receipt and hidden_at is null;
  if found then return listing; end if;
  if queued.updated_at is distinct from reviewed_at or queued.status not in ('pending', 'reviewing') then return null; end if;
  insert into public.brand_listings (
    inquiry_id, host, slug, catalog_slug, name, website, category_slug, description, pricing_model, approval_method
  ) values (
    receipt, listing_host, listing_slug, reviewed_catalog_slug, queued.payload->>'toolName', queued.payload->>'websiteUrl',
    queued.payload->>'categorySlug', queued.payload->>'tagline', queued.payload->>'pricingModel', method
  ) on conflict do nothing returning id into listing;
  if listing is not null then
    update public.inquiries set status = 'resolved', updated_at = now() where id = receipt;
  end if;
  return listing;
end $$;

create function public.list_brand_directory()
returns table (slug text, catalog_slug text, host text, name text, website text, category_slug text, description text, pricing_model text, sponsored boolean)
language sql stable security invoker set search_path = '' as $$
  select b.slug, b.catalog_slug, b.host, b.name, b.website, b.category_slug, b.description, b.pricing_model,
    coalesce(b.sponsored_from <= now() and b.sponsored_until > now(), false)
  from public.brand_listings b where b.hidden_at is null order by b.name, b.slug;
$$;

revoke all on function public.approve_brand_listing(uuid,timestamptz,text,text,text,text),
  public.list_brand_directory() from public, anon, authenticated;
grant execute on function public.approve_brand_listing(uuid,timestamptz,text,text,text,text),
  public.list_brand_directory() to service_role;

notify pgrst, 'reload schema';
