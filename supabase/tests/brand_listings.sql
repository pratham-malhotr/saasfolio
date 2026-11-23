begin;
do $$
declare
  receipt uuid;
  duplicate_receipt uuid;
  reviewed_at timestamptz;
  listing uuid;
  draft jsonb := '{"submissionType":"brand","toolName":"Directory test brand","websiteUrl":"https://directory.example.com","categorySlug":"productivity","tagline":"A fictional brand for directory testing.","pricingModel":"Paid","contactName":"Private contact"}';
begin
  if has_table_privilege('anon', 'public.brand_listings', 'SELECT') or
     has_table_privilege('authenticated', 'public.brand_listings', 'UPDATE') or
     has_function_privilege('anon', 'public.approve_brand_listing(uuid,timestamptz,text,text,text,text)', 'EXECUTE') or
     has_function_privilege('authenticated', 'public.list_brand_directory()', 'EXECUTE') then
    raise exception 'Visitors must use the public directory projection and cannot approve or sponsor listings';
  end if;

  set local role service_role;
  insert into public.inquiries(kind,email,payload) values('submission','owner@example.com',draft)
    returning id, updated_at into receipt, reviewed_at;
  if public.approve_brand_listing(receipt, reviewed_at - interval '1 second', 'directory.example.com', 'directory-test-brand', null, 'automatic') is not null then
    raise exception 'Approval must use the current inquiry version';
  end if;
  listing := public.approve_brand_listing(receipt, reviewed_at, 'directory.example.com', 'directory-test-brand', null, 'automatic');
  if listing is null or not exists (select 1 from public.inquiries where id = receipt and status = 'resolved') then
    raise exception 'Approval did not create a listing and resolve the inquiry';
  end if;
  if listing is distinct from public.approve_brand_listing(receipt, reviewed_at, 'directory.example.com', 'directory-test-brand', null, 'automatic') then
    raise exception 'Approval retry should reuse the existing listing';
  end if;
  insert into public.inquiries(kind,email,payload) values('submission','second@example.com',draft)
    returning id, updated_at into duplicate_receipt, reviewed_at;
  if public.approve_brand_listing(duplicate_receipt, reviewed_at, 'directory.example.com', 'duplicate-test-brand', null, 'manual') is not null then
    raise exception 'A duplicate domain received a second listing';
  end if;
  if not exists(select 1 from public.list_brand_directory() d where d.slug = 'directory-test-brand' and not d.sponsored
    and not to_jsonb(d) ?| array['receipt', 'inquiry_id', 'email', 'contactName']) then
    raise exception 'An approved listing must project only public content and start without sponsorship';
  end if;

  update public.brand_listings set sponsored_from = now() - interval '1 day', sponsored_until = now() + interval '1 month' where id = listing;
  if not exists(select 1 from public.list_brand_directory() where slug = 'directory-test-brand' and sponsored) then
    raise exception 'The active sponsorship was not applied';
  end if;
  update public.brand_listings set sponsored_from = now() - interval '2 days', sponsored_until = now() - interval '1 day' where id = listing;
  if not exists(select 1 from public.list_brand_directory() where slug = 'directory-test-brand' and not sponsored) then
    raise exception 'An expired sponsorship affected ranking or removed the listing';
  end if;
  update public.brand_listings set hidden_at = now() where id = listing;
  if exists(select 1 from public.list_brand_directory() where slug = 'directory-test-brand') then
    raise exception 'A hidden listing is still displayed';
  end if;
  reset role;
end $$;
rollback;
