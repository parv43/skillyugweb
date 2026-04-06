alter table public.slot_bookings
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists email text,
  add column if not exists grade_class text,
  add column if not exists promo_code text,
  add column if not exists amount_paid integer,
  add column if not exists currency text default 'INR',
  add column if not exists razorpay_order_id text,
  add column if not exists razorpay_payment_id text,
  add column if not exists payment_status text,
  add column if not exists created_at timestamptz not null default now();

create unique index if not exists slot_bookings_razorpay_payment_id_key
  on public.slot_bookings (razorpay_payment_id)
  where razorpay_payment_id is not null;
