-- Remove any constraints or defaults related to evidence field that might be causing issues
-- Check if evidence field is causing validation issues
ALTER TABLE public.cases ALTER COLUMN evidence DROP NOT NULL;
ALTER TABLE public.cases ALTER COLUMN evidence DROP DEFAULT;