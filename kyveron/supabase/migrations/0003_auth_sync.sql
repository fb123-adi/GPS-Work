-- Reference data and Supabase auth integration.

insert into roles (name, description) values
  ('super_admin', 'Full access, including staff roles and settings'),
  ('catalog_manager', 'Products, collections, images, inventory'),
  ('order_manager', 'Orders, fulfilment, cancellations, refunds, returns'),
  ('support_agent', 'Customer lookup, tickets, returns; no refunds or catalogue edits'),
  ('marketing_editor', 'Content, journal, homepage, discounts'),
  ('analyst', 'Read-only dashboards and exports (no customer PII export)')
on conflict (name) do nothing;

-- On Supabase, mirror every auth.users row into public.users so foreign keys
-- work and staff roles can be attached. Skipped on plain Postgres.
do $$
begin
  if exists (select 1 from information_schema.tables
             where table_schema = 'auth' and table_name = 'users') then
    execute $f$
      create or replace function public.handle_auth_user() returns trigger
      language plpgsql security definer set search_path = public as $b$
      begin
        insert into public.users (id, email, phone, email_verified_at, auth_provider)
        values (new.id, new.email, new.phone, new.email_confirmed_at,
                coalesce(new.raw_app_meta_data->>'provider', 'email'))
        on conflict (id) do update set
          email = excluded.email,
          phone = coalesce(excluded.phone, public.users.phone),
          email_verified_at = excluded.email_verified_at;
        insert into public.profiles (user_id, full_name)
        values (new.id, new.raw_user_meta_data->>'full_name')
        on conflict (user_id) do nothing;
        return new;
      end $b$
    $f$;
    execute 'drop trigger if exists on_auth_user_changed on auth.users';
    execute 'create trigger on_auth_user_changed after insert or update of email, phone, email_confirmed_at on auth.users for each row execute function public.handle_auth_user()';
  end if;
end $$;
