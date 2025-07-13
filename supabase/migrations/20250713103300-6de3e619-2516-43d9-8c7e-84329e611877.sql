
-- Add unique constraint on user_id in balances table
ALTER TABLE public.balances ADD CONSTRAINT balances_user_id_unique UNIQUE (user_id);
