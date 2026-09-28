-- Kyveron core schema.
-- Money is stored as bigint minor units (paise for INR). Never floats.
-- Runs on Supabase Postgres and on plain Postgres 15+ (a compatibility shim
-- for Supabase's auth schema lives in 0000_compat.sql).

create extension if not exists pgcrypto;
create extension if not exists citext;
create extension if not exists pg_trgm;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type order_status as enum (
  'pending_payment','payment_failed','paid','confirmed','processing','packed',
  'shipped','out_for_delivery','delivered','cancellation_requested','cancelled',
  'return_requested','returned','refund_pending','refunded','payment_disputed'
);
create type payment_status as enum (
  'created','authorized','captured','failed','cancelled','refunded',
  'partially_refunded','disputed'
);
create type refund_status as enum ('pending','processed','failed');
create type publish_status as enum ('draft','published','archived');
create type gender_fit as enum ('men','women','unisex','kids');
create type staff_role as enum (
  'super_admin','catalog_manager','order_manager','support_agent',
  'marketing_editor','analyst'
);
create type return_status as enum (
  'requested','approved','rejected','received','refunded','exchanged','closed'
);
create type ticket_status as enum ('open','pending','resolved','closed');

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- Identity
-- users mirrors the identity provider (Supabase auth.users in production).
-- ---------------------------------------------------------------------------
create table users (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  phone text,
  email_verified_at timestamptz,
  auth_provider text not null default 'email',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create trigger users_updated before update on users for each row execute function set_updated_at();

-- Only used by the development-only local auth driver. Supabase stores
-- credentials itself; this table stays empty in production.
create table local_credentials (
  user_id uuid primary key references users(id) on delete cascade,
  password_hash text not null,
  failed_attempts int not null default 0,
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

create table local_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  user_agent text
);
create index local_sessions_user_idx on local_sessions(user_id);

create table local_tokens (
  token_hash text primary key,
  user_id uuid not null references users(id) on delete cascade,
  purpose text not null check (purpose in ('verify_email','reset_password')),
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table profiles (
  user_id uuid primary key references users(id) on delete cascade,
  full_name text,
  preferred_currency char(3) not null default 'INR',
  preferred_country char(2) not null default 'IN',
  preferred_size text,
  marketing_email boolean not null default false,
  marketing_whatsapp boolean not null default false,
  deletion_requested_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated before update on profiles for each row execute function set_updated_at();

create table roles (
  name staff_role primary key,
  description text not null
);

create table user_roles (
  user_id uuid not null references users(id) on delete cascade,
  role staff_role not null references roles(name),
  granted_by uuid references users(id),
  granted_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  label text,
  full_name text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  landmark text,
  city text not null,
  state text not null,
  postal_code text not null,
  country char(2) not null default 'IN',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index addresses_user_idx on addresses(user_id) where deleted_at is null;
create trigger addresses_updated before update on addresses for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Catalogue
-- ---------------------------------------------------------------------------
create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  sort_order int not null default 0
);

create table collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  banner_url text,
  banner_alt text,
  status publish_status not null default 'draft',
  sort_order int not null default 0,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create trigger collections_updated before update on collections for each row execute function set_updated_at();

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  subtitle text,
  description text not null default '',
  category_id uuid references categories(id),
  gender gender_fit not null default 'unisex',
  material text,
  care text,
  fit text,
  fit_notes text,
  seo_title text,
  seo_description text,
  status publish_status not null default 'draft',
  publish_at timestamptz,
  is_featured boolean not null default false,
  is_performance boolean not null default false,
  tax_code text not null default 'apparel',
  -- Denormalised for fast listing; maintained by trigger from variants.
  min_price_minor bigint,
  max_price_minor bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  search tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(name,'')), 'A') ||
    setweight(to_tsvector('simple', coalesce(subtitle,'')), 'B') ||
    setweight(to_tsvector('simple', coalesce(material,'')), 'C') ||
    setweight(to_tsvector('simple', coalesce(description,'')), 'D')
  ) stored
);
create index products_status_idx on products(status, publish_at) where deleted_at is null;
create index products_category_idx on products(category_id);
create index products_search_idx on products using gin(search);
create index products_name_trgm_idx on products using gin (name gin_trgm_ops);
create trigger products_updated before update on products for each row execute function set_updated_at();

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  storage_path text,
  alt text not null,
  colour text,
  width int,
  height int,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index product_images_product_idx on product_images(product_id, sort_order);

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  sku text not null unique,
  size text not null,
  colour text not null,
  colour_hex text,
  price_minor bigint not null check (price_minor >= 0),
  compare_at_minor bigint check (compare_at_minor is null or compare_at_minor > price_minor),
  cost_minor bigint check (cost_minor is null or cost_minor >= 0),
  currency char(3) not null default 'INR',
  stock_on_hand int not null default 0 check (stock_on_hand >= 0),
  reserved int not null default 0 check (reserved >= 0),
  low_stock_threshold int not null default 3,
  is_available boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint reserved_within_stock check (reserved <= stock_on_hand),
  unique (product_id, size, colour)
);
create index product_variants_product_idx on product_variants(product_id) where deleted_at is null;
create trigger product_variants_updated before update on product_variants for each row execute function set_updated_at();

create or replace function refresh_product_price_range() returns trigger
language plpgsql as $$
declare pid uuid := coalesce(new.product_id, old.product_id);
begin
  update products p set
    min_price_minor = s.mn, max_price_minor = s.mx
  from (select min(price_minor) mn, max(price_minor) mx
        from product_variants where product_id = pid and deleted_at is null) s
  where p.id = pid;
  return null;
end $$;
create trigger product_variants_price_range
  after insert or update of price_minor, deleted_at or delete on product_variants
  for each row execute function refresh_product_price_range();

create table collection_products (
  collection_id uuid not null references collections(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  sort_order int not null default 0,
  primary key (collection_id, product_id)
);
create index collection_products_product_idx on collection_products(product_id);

create table inventory_movements (
  id bigint generated always as identity primary key,
  variant_id uuid not null references product_variants(id),
  delta int not null,
  reason text not null check (reason in (
    'initial','restock','adjustment','damaged','sale','return','reservation',
    'reservation_release','correction')),
  note text,
  order_id uuid,
  actor_id uuid references users(id),
  stock_after int not null,
  created_at timestamptz not null default now()
);
create index inventory_movements_variant_idx on inventory_movements(variant_id, created_at desc);

create table back_in_stock_requests (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references product_variants(id) on delete cascade,
  email citext not null,
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (variant_id, email)
);

-- ---------------------------------------------------------------------------
-- Carts and wishlists (server is the source of truth, never localStorage)
-- ---------------------------------------------------------------------------
create table carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  coupon_code citext,
  currency char(3) not null default 'INR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  converted_at timestamptz
);
create unique index carts_one_open_per_user on carts(user_id) where user_id is not null and converted_at is null;
create trigger carts_updated before update on carts for each row execute function set_updated_at();

create table cart_items (
  cart_id uuid not null references carts(id) on delete cascade,
  variant_id uuid not null references product_variants(id) on delete cascade,
  quantity int not null check (quantity between 1 and 10),
  added_at timestamptz not null default now(),
  primary key (cart_id, variant_id)
);

create table wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table wishlist_items (
  wishlist_id uuid not null references wishlists(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  variant_id uuid references product_variants(id) on delete set null,
  added_at timestamptz not null default now(),
  primary key (wishlist_id, product_id)
);

-- ---------------------------------------------------------------------------
-- Discounts
-- ---------------------------------------------------------------------------
create table coupons (
  id uuid primary key default gen_random_uuid(),
  code citext not null unique,
  description text,
  kind text not null check (kind in ('percent','fixed')),
  value int not null check (value > 0),
  max_discount_minor bigint,
  min_subtotal_minor bigint not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  usage_limit int,
  per_customer_limit int,
  first_order_only boolean not null default false,
  exclude_sale_items boolean not null default false,
  applies_to_product_ids uuid[],
  applies_to_collection_ids uuid[],
  is_active boolean not null default true,
  created_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint percent_range check (kind <> 'percent' or value <= 90)
);
create trigger coupons_updated before update on coupons for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  cart_id uuid references carts(id) on delete set null,
  user_id uuid references users(id) on delete set null,
  email citext not null,
  phone text not null,
  status order_status not null default 'pending_payment',
  currency char(3) not null default 'INR',
  -- Rate from base currency to order currency at creation. Historic orders
  -- never change when rates move.
  fx_rate numeric(18,8) not null default 1,
  subtotal_minor bigint not null check (subtotal_minor >= 0),
  discount_minor bigint not null default 0 check (discount_minor >= 0),
  shipping_minor bigint not null default 0 check (shipping_minor >= 0),
  tax_minor bigint not null default 0 check (tax_minor >= 0),
  tax_inclusive boolean not null default true,
  total_minor bigint not null check (total_minor >= 0),
  coupon_code citext,
  shipping_method text not null,
  shipping_address jsonb not null,
  billing_address jsonb not null,
  payment_method text,
  idempotency_key text not null unique,
  reservation_expires_at timestamptz,
  stock_committed boolean not null default false,
  needs_review boolean not null default false,
  review_reason text,
  estimated_delivery_from date,
  estimated_delivery_to date,
  terms_version text,
  placed_ip inet,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz,
  cancelled_at timestamptz,
  constraint total_consistent check (
    total_minor = subtotal_minor - discount_minor + shipping_minor
      + case when tax_inclusive then 0 else tax_minor end)
);
create index orders_user_idx on orders(user_id, created_at desc);
create index orders_email_idx on orders(email);
create index orders_status_idx on orders(status, created_at desc);
create index orders_reservation_idx on orders(reservation_expires_at) where status in ('pending_payment','payment_failed');
create trigger orders_updated before update on orders for each row execute function set_updated_at();

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  variant_id uuid references product_variants(id) on delete set null,
  product_id uuid references products(id) on delete set null,
  sku text not null,
  product_name text not null,
  size text not null,
  colour text not null,
  image_url text,
  unit_price_minor bigint not null check (unit_price_minor >= 0),
  compare_at_minor bigint,
  quantity int not null check (quantity > 0),
  discount_minor bigint not null default 0,
  tax_rate numeric(5,2) not null default 0,
  tax_minor bigint not null default 0,
  line_total_minor bigint not null,
  returned_quantity int not null default 0
);
create index order_items_order_idx on order_items(order_id);
create index order_items_sku_idx on order_items(sku);

create table order_status_history (
  id bigint generated always as identity primary key,
  order_id uuid not null references orders(id) on delete cascade,
  from_status order_status,
  to_status order_status not null,
  actor_id uuid references users(id),
  actor_type text not null check (actor_type in ('customer','staff','system','gateway')),
  note text,
  created_at timestamptz not null default now()
);
create index order_status_history_order_idx on order_status_history(order_id, created_at);

create table order_notes (
  id bigint generated always as identity primary key,
  order_id uuid not null references orders(id) on delete cascade,
  author_id uuid not null references users(id),
  body text not null,
  created_at timestamptz not null default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  provider text not null check (provider in ('razorpay','mock','cod')),
  gateway_order_id text unique,
  gateway_payment_id text unique,
  signature_verified boolean not null default false,
  status payment_status not null default 'created',
  amount_minor bigint not null,
  currency char(3) not null,
  method text,
  error_code text,
  error_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  authorized_at timestamptz,
  captured_at timestamptz,
  failed_at timestamptz
);
create index payments_order_idx on payments(order_id);
create trigger payments_updated before update on payments for each row execute function set_updated_at();

create table refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  payment_id uuid references payments(id),
  gateway_refund_id text unique,
  amount_minor bigint not null check (amount_minor > 0),
  currency char(3) not null,
  status refund_status not null default 'pending',
  reason text,
  initiated_by uuid references users(id),
  created_at timestamptz not null default now(),
  processed_at timestamptz
);
create index refunds_order_idx on refunds(order_id);

create table shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  courier text not null,
  tracking_number text not null,
  tracking_url text,
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_by uuid references users(id),
  created_at timestamptz not null default now()
);
create index shipments_order_idx on shipments(order_id);

create table coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references coupons(id),
  order_id uuid not null unique references orders(id) on delete cascade,
  user_id uuid references users(id),
  email citext not null,
  discount_minor bigint not null,
  -- pending until the order is paid; released if payment never arrives.
  state text not null default 'pending' check (state in ('pending','confirmed','released')),
  created_at timestamptz not null default now()
);
create index coupon_redemptions_coupon_idx on coupon_redemptions(coupon_id, state);

-- ---------------------------------------------------------------------------
-- Returns
-- ---------------------------------------------------------------------------
create table returns (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  user_id uuid references users(id),
  kind text not null check (kind in ('return','exchange')),
  status return_status not null default 'requested',
  reason text not null,
  details text,
  resolution text not null check (resolution in ('original_payment','store_credit','exchange')),
  evidence_paths text[] not null default '{}',
  staff_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index returns_order_idx on returns(order_id);
create trigger returns_updated before update on returns for each row execute function set_updated_at();

create table return_items (
  return_id uuid not null references returns(id) on delete cascade,
  order_item_id uuid not null references order_items(id),
  quantity int not null check (quantity > 0),
  exchange_variant_id uuid references product_variants(id),
  primary key (return_id, order_item_id)
);

-- ---------------------------------------------------------------------------
-- Reviews
-- ---------------------------------------------------------------------------
create table reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  order_item_id uuid references order_items(id),
  rating int not null check (rating between 1 and 5),
  title text,
  body text not null,
  fit_feedback text check (fit_feedback in ('runs_small','true_to_size','runs_large')),
  is_verified_purchase boolean not null default false,
  status text not null default 'pending' check (status in ('pending','published','rejected')),
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);
create index reviews_product_idx on reviews(product_id) where status = 'published';

create table review_votes (
  review_id uuid not null references reviews(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  helpful boolean not null,
  primary key (review_id, user_id)
);

-- ---------------------------------------------------------------------------
-- Marketing, support, content
-- ---------------------------------------------------------------------------
create table newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email citext unique,
  whatsapp text unique,
  source text,
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  check (email is not null or whatsapp is not null)
);

create table contact_tickets (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  user_id uuid references users(id),
  name text not null,
  email citext not null,
  phone text,
  order_number text,
  category text not null,
  message text not null,
  status ticket_status not null default 'open',
  assigned_to uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger contact_tickets_updated before update on contact_tickets for each row execute function set_updated_at();

create table journal_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  body text not null default '',
  cover_url text,
  cover_alt text,
  author_name text,
  status publish_status not null default 'draft',
  published_at timestamptz,
  seo_title text,
  seo_description text,
  preview_token text not null default encode(gen_random_bytes(16), 'hex'),
  created_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create trigger journal_posts_updated before update on journal_posts for each row execute function set_updated_at();

-- Editable legal/trust pages and homepage blocks.
create table content_pages (
  slug text primary key,
  title text not null,
  body text not null default '',
  version text not null default '0.1-draft',
  effective_date date,
  needs_legal_review boolean not null default true,
  status publish_status not null default 'published',
  seo_description text,
  updated_by uuid references users(id),
  updated_at timestamptz not null default now()
);

create table content_blocks (
  key text primary key,
  data jsonb not null,
  draft_data jsonb,
  updated_by uuid references users(id),
  updated_at timestamptz not null default now()
);

create table faqs (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  question text not null,
  answer text not null,
  sort_order int not null default 0,
  status publish_status not null default 'published'
);

-- ---------------------------------------------------------------------------
-- Audit, webhooks, consent, operational tables
-- ---------------------------------------------------------------------------
create table admin_audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references users(id),
  action text not null,
  entity_type text not null,
  entity_id text,
  before jsonb,
  after jsonb,
  ip inet,
  created_at timestamptz not null default now()
);
create index admin_audit_logs_entity_idx on admin_audit_logs(entity_type, entity_id);
create index admin_audit_logs_created_idx on admin_audit_logs(created_at desc);

create table webhook_events (
  id bigint generated always as identity primary key,
  provider text not null,
  event_id text not null,
  event_type text not null,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  error text,
  unique (provider, event_id)
);

create table consent_records (
  id bigint generated always as identity primary key,
  user_id uuid references users(id) on delete set null,
  subject text not null,          -- email, phone, or anonymous consent id
  purpose text not null,          -- cookies_analytics, cookies_marketing, marketing_email, terms, privacy
  granted boolean not null,
  policy_version text not null,
  source text not null,
  ip inet,
  user_agent text,
  created_at timestamptz not null default now()
);
create index consent_records_subject_idx on consent_records(subject, purpose, created_at desc);

create table email_outbox (
  id bigint generated always as identity primary key,
  dedupe_key text unique,
  to_email citext not null,
  subject text not null,
  html text not null,
  text_body text not null,
  status text not null default 'queued' check (status in ('queued','sent','failed','logged')),
  provider_id text,
  error text,
  attempts int not null default 0,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create table rate_limits (
  key text primary key,
  window_start timestamptz not null,
  hits int not null
);

create table exchange_rates (
  currency char(3) primary key,
  rate_from_inr numeric(18,8) not null check (rate_from_inr > 0),
  source text not null default 'manual',
  updated_at timestamptz not null default now()
);

create table store_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
