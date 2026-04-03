-- ============================================
-- Smart Money Manager - Supabase SQL Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  currency text default 'IDR',
  has_paid boolean default false,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- Transactions table
-- ============================================
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text check (type in ('income', 'expense')) not null,
  amount numeric(15,2) not null,
  description text not null,
  category text not null,
  date date not null,
  notes text,
  currency text default 'IDR',
  created_at timestamptz default now()
);

alter table public.transactions enable row level security;

create policy "Users can manage own transactions"
  on public.transactions for all using (auth.uid() = user_id);

-- ============================================
-- Loans table
-- ============================================
create table public.loans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  loan_type text not null,
  total_amount numeric(15,2) not null,
  remaining_amount numeric(15,2) not null,
  monthly_payment numeric(15,2),
  interest_rate numeric(5,2),
  start_date date,
  due_date date,
  lender text,
  notes text,
  status text default 'active' check (status in ('active', 'paid')),
  currency text default 'IDR',
  created_at timestamptz default now()
);

alter table public.loans enable row level security;

create policy "Users can manage own loans"
  on public.loans for all using (auth.uid() = user_id);

-- ============================================
-- Indexes for performance
-- ============================================
create index transactions_user_date on public.transactions(user_id, date desc);
create index loans_user_id on public.loans(user_id);

-- ============================================
-- Reminders table (for email reminders)
-- ============================================
create table public.reminders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  amount numeric(15,2),
  category text,
  remind_day int check (remind_day between 1 and 31),
  remind_email text,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.reminders enable row level security;

create policy "Users can manage own reminders"
  on public.reminders for all using (auth.uid() = user_id);

-- ============================================
-- Loan payments checklist table
-- ============================================
create table public.loan_payments (
  id uuid default gen_random_uuid() primary key,
  loan_id uuid references public.loans(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  month int not null,
  year int not null,
  paid_at timestamptz default now(),
  unique(loan_id, month, year)
);

alter table public.loan_payments enable row level security;

create policy "Users can manage own loan payments"
  on public.loan_payments for all using (auth.uid() = user_id);
