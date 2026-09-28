-- Row-level security. The Next.js server performs its own authorization on
-- every request; these policies are the database-level backstop for any
-- access made with a user's JWT (Supabase client, PostgREST, or the server's
-- withUserRls() helper). The anon key alone can read published catalogue
-- data and nothing else.

create or replace function public.has_role(wanted staff_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from user_roles ur
    join users u on u.id = ur.user_id and u.deleted_at is null
    where ur.user_id = auth.uid() and ur.role = any(wanted)
  )
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from user_roles where user_id = auth.uid())
$$;

revoke all on function public.has_role(staff_role[]) from public;
grant execute on function public.has_role(staff_role[]) to anon, authenticated;
grant execute on function public.is_staff() to anon, authenticated;

-- Enable RLS everywhere. Tables without a policy are unreachable through
-- user-level roles (webhook_events, email_outbox, rate_limits, local_*).
do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- The server's own connection is the table owner, which bypasses RLS; it
-- enforces authorization in application code (src/lib/auth/rbac.ts).

-- Baseline privileges (Supabase grants these by default; plain Postgres
-- needs them explicitly). RLS then narrows rows.
grant select on categories, collections, collection_products, products,
  product_images, reviews, journal_posts, content_pages, faqs, exchange_rates
  to anon, authenticated;

-- Cost price is never readable by customers: column-level grant without it.
revoke all on product_variants from anon, authenticated;
grant select (id, product_id, sku, size, colour, colour_hex, price_minor,
  compare_at_minor, currency, stock_on_hand, reserved, low_stock_threshold,
  is_available, sort_order, created_at, updated_at, deleted_at)
  on product_variants to anon, authenticated;

grant select, insert, update on profiles, addresses, carts, cart_items,
  wishlists, wishlist_items, review_votes to authenticated;
grant delete on cart_items, wishlist_items, review_votes to authenticated;
grant select, insert on reviews, returns, return_items to authenticated;
grant select on users, orders, order_items, order_status_history, payments,
  refunds, shipments, consent_records to authenticated;
grant select on admin_audit_logs, contact_tickets, coupons, inventory_movements,
  user_roles to authenticated;

-- ---------------------------------------------------------------------------
-- Public catalogue
-- ---------------------------------------------------------------------------
create policy categories_read on categories for select using (true);

create policy collections_read on collections for select
  using ((status = 'published' and deleted_at is null) or is_staff());

create policy products_read on products for select
  using ((status = 'published' and deleted_at is null
          and (publish_at is null or publish_at <= now())) or is_staff());

create policy product_images_read on product_images for select
  using (exists (select 1 from products p where p.id = product_id));

create policy product_variants_read on product_variants for select
  using (deleted_at is null and exists (select 1 from products p where p.id = product_id));

create policy collection_products_read on collection_products for select
  using (exists (select 1 from products p where p.id = product_id));

create policy reviews_read on reviews for select
  using (status = 'published' or user_id = auth.uid() or is_staff());
create policy reviews_insert on reviews for insert
  with check (user_id = auth.uid() and status = 'pending');

create policy journal_read on journal_posts for select
  using ((status = 'published' and deleted_at is null and published_at <= now()) or is_staff());

create policy content_pages_read on content_pages for select
  using (status = 'published' or is_staff());

create policy faqs_read on faqs for select using (status = 'published' or is_staff());
create policy exchange_rates_read on exchange_rates for select using (true);

-- ---------------------------------------------------------------------------
-- Customer-owned data
-- ---------------------------------------------------------------------------
create policy users_self on users for select using (id = auth.uid() or is_staff());

create policy profiles_self on profiles for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy profiles_staff on profiles for select
  using (has_role(array['super_admin','support_agent','order_manager']::staff_role[]));

create policy addresses_self on addresses for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy carts_self on carts for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy cart_items_self on cart_items for all
  using (exists (select 1 from carts c where c.id = cart_id and c.user_id = auth.uid()))
  with check (exists (select 1 from carts c where c.id = cart_id and c.user_id = auth.uid()));

create policy wishlists_self on wishlists for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy wishlist_items_self on wishlist_items for all
  using (exists (select 1 from wishlists w where w.id = wishlist_id and w.user_id = auth.uid()))
  with check (exists (select 1 from wishlists w where w.id = wishlist_id and w.user_id = auth.uid()));

create policy review_votes_self on review_votes for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Orders are read-only to customers; all writes go through the server.
create policy orders_self on orders for select
  using (user_id = auth.uid()
    or has_role(array['super_admin','order_manager','support_agent','analyst']::staff_role[]));
create policy order_items_self on order_items for select
  using (exists (select 1 from orders o where o.id = order_id));
create policy order_history_self on order_status_history for select
  using (exists (select 1 from orders o where o.id = order_id));
create policy payments_self on payments for select
  using (exists (select 1 from orders o where o.id = order_id));
create policy refunds_self on refunds for select
  using (exists (select 1 from orders o where o.id = order_id));
create policy shipments_self on shipments for select
  using (exists (select 1 from orders o where o.id = order_id));

create policy returns_self on returns for select
  using (user_id = auth.uid() or has_role(array['super_admin','order_manager','support_agent']::staff_role[]));
create policy returns_insert on returns for insert
  with check (user_id = auth.uid() and status = 'requested'
    and exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid()));
create policy return_items_self on return_items for select
  using (exists (select 1 from returns r where r.id = return_id));
create policy return_items_insert on return_items for insert
  with check (exists (select 1 from returns r where r.id = return_id and r.user_id = auth.uid()));

create policy consent_self on consent_records for select using (user_id = auth.uid());

-- Staff-only reads (writes always go through audited server actions).
create policy audit_read on admin_audit_logs for select
  using (has_role(array['super_admin']::staff_role[]));
create policy tickets_staff on contact_tickets for select
  using (has_role(array['super_admin','support_agent']::staff_role[]));
create policy coupons_staff on coupons for select
  using (has_role(array['super_admin','marketing_editor','order_manager','analyst']::staff_role[]));
create policy inventory_staff on inventory_movements for select
  using (has_role(array['super_admin','catalog_manager','analyst']::staff_role[]));
create policy user_roles_self on user_roles for select
  using (user_id = auth.uid() or has_role(array['super_admin']::staff_role[]));
