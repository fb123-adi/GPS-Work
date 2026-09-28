-- Compatibility shim so the same migrations run on Supabase and on plain
-- Postgres (local development, CI, self-hosted). On Supabase every object
-- below already exists and each statement is a no-op.

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin bypassrls;
  end if;
end $$;

create schema if not exists auth;

do $$
begin
  if not exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'auth' and p.proname = 'uid'
  ) then
    -- Mirrors Supabase: the JWT subject is exposed via a request setting.
    execute $f$
      create function auth.uid() returns uuid language sql stable as
      'select nullif(current_setting(''request.jwt.claim.sub'', true), '''')::uuid'
    $f$;
  end if;
end $$;

grant usage on schema auth to anon, authenticated;
grant usage on schema public to anon, authenticated, service_role;
