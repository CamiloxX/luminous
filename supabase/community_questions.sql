-- Run this in Supabase SQL Editor

-- Allow questions without a specific recipient (community questions)
alter table public.questions
  alter column recipient_id drop not null;
