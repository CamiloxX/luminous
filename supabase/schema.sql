-- ============================================================
-- Luminous — Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ============================================================
-- PROFILES
-- ============================================================
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     text unique not null,
  display_name text,
  bio          text,
  avatar_url   text,
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- QUESTIONS
-- ============================================================
create table public.questions (
  id            uuid primary key default gen_random_uuid(),
  recipient_id  uuid not null references public.profiles(id) on delete cascade,
  sender_id     uuid references public.profiles(id) on delete set null,
  content       text not null check (char_length(content) between 1 and 500),
  is_anonymous  boolean default true not null,
  answer        text,
  answered_at   timestamptz,
  likes_count   integer default 0 not null,
  answers_count integer default 0 not null,
  created_at    timestamptz default now() not null
);

-- ============================================================
-- LIKES
-- ============================================================
create table public.likes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  created_at  timestamptz default now() not null,
  unique(user_id, question_id)
);

-- Keep likes_count in sync
create or replace function public.update_likes_count()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' then
    update public.questions set likes_count = likes_count + 1 where id = new.question_id;
  elsif TG_OP = 'DELETE' then
    update public.questions set likes_count = likes_count - 1 where id = old.question_id;
  end if;
  return null;
end;
$$;

create trigger on_like_change
  after insert or delete on public.likes
  for each row execute procedure public.update_likes_count();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles  enable row level security;
alter table public.questions enable row level security;
alter table public.likes     enable row level security;

-- Profiles: anyone can read, only owner can update
create policy "profiles_read"   on public.profiles for select using (true);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- Questions: anyone can read answered questions; recipient sees all; anyone can insert (anonymous)
create policy "questions_read_public" on public.questions
  for select using (answer is not null or recipient_id = auth.uid() or sender_id = auth.uid());

create policy "questions_insert" on public.questions
  for insert with check (true);

create policy "questions_answer" on public.questions
  for update using (auth.uid() = recipient_id);

-- Likes: anyone can read, authenticated users can like/unlike
create policy "likes_read"   on public.likes for select using (true);
create policy "likes_insert" on public.likes for insert with check (auth.uid() = user_id);
create policy "likes_delete" on public.likes for delete using (auth.uid() = user_id);

-- ============================================================
-- INDEXES
-- ============================================================
create index on public.questions (recipient_id, created_at desc);
create index on public.questions (created_at desc);
create index on public.likes (question_id);
