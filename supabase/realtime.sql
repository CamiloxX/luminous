-- Enable Realtime for the questions table
-- Run this in Supabase SQL Editor

alter publication supabase_realtime add table public.questions;
