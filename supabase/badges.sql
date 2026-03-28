-- Run this in Supabase SQL Editor

-- Add verification and badge fields to profiles
alter table public.profiles
  add column if not exists is_verified boolean default false not null,
  add column if not exists badge text default null;

-- Valid badge values (enforced by check constraint):
-- 'google_dev', 'microsoft_dev', 'meta_dev', 'apple_dev',
-- 'open_source', 'content_creator', 'designer', 'student',
-- 'security', 'ai_researcher', 'indie_dev', 'streamer'

alter table public.profiles
  add constraint profiles_badge_check
  check (badge is null or badge in (
    'google_dev', 'microsoft_dev', 'meta_dev', 'apple_dev',
    'amazon_dev', 'netflix_dev', 'open_source', 'content_creator',
    'designer', 'student', 'security', 'ai_researcher',
    'indie_dev', 'streamer'
  ));
