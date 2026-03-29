-- Fix: allow any authenticated user to answer community questions (recipient_id is null)
-- Run this in Supabase SQL Editor

create policy "questions_answer_community" on public.questions
  for update
  using (recipient_id is null and auth.uid() is not null)
  with check (recipient_id is null and auth.uid() is not null);
