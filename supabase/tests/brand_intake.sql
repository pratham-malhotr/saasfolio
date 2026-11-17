begin;
do $$
declare key uuid := gen_random_uuid(); first_id uuid; retry_id uuid; sample_payload jsonb := '{"submissionType":"brand","toolName":"Disposable intake test","contactName":"Test Owner","consent":true}';
begin
 if has_function_privilege('anon','public.save_brand_submission(uuid,text,jsonb,text)','EXECUTE') or
    has_function_privilege('authenticated','public.save_brand_submission(uuid,text,jsonb,text)','EXECUTE') then
   raise exception 'Public clients must not execute private brand storage';
 end if;
 if has_table_privilege('anon','public.inquiries','SELECT') or has_table_privilege('authenticated','public.inquiries','SELECT') then
   raise exception 'Contact information must remain private';
 end if;
 set local role service_role;
 first_id := public.save_brand_submission(key,'owner@example.com',sample_payload,repeat('a',64));
 retry_id := public.save_brand_submission(key,'owner@example.com',sample_payload,repeat('a',64));
 if first_id is distinct from retry_id then raise exception 'Retry returned a different reference'; end if;
 if (select count(*) from public.inquiries where submission_key=key) <> 1 then raise exception 'Retry duplicated the saved brand'; end if;
 if not exists(select 1 from public.inquiries where id=first_id and email='owner@example.com' and status='pending' and public.inquiries.payload=sample_payload) then raise exception 'Saved contact, product or review status differs'; end if;
 begin
   perform public.save_brand_submission(key,'other@example.com',sample_payload,repeat('b',64));
   raise exception 'Different content reused a receipt';
 exception when unique_violation then null; end;
 begin
   perform public.save_brand_submission(gen_random_uuid(),'owner@example.com','{"submissionType":"code"}',repeat('a',64));
   raise exception 'Wrong kind was accepted';
 exception when invalid_parameter_value then null; end;
 update public.inquiries set email='deleted-account@invalid',payload='{"redacted":true}' where id=first_id;
 if exists(select 1 from public.inquiries where id=first_id and (submission_key is not null or submission_fingerprint is not null)) then raise exception 'Redaction retained receipt metadata'; end if;
 begin
   insert into public.inquiries(kind,email,payload,submission_key) values('submission','test@example.com','{}',gen_random_uuid());
   raise exception 'An incomplete retry identity was accepted';
 exception when check_violation then null; end;
 reset role;
end $$;
rollback;
