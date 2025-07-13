
-- First, let's check if the constraint exists and add it if it doesn't
-- This will ensure the ON CONFLICT clause in the update_user_balance_stats function works
DO $$
BEGIN
    -- Check if the unique constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'balances_user_id_unique' 
        AND table_name = 'balances'
    ) THEN
        -- Add the unique constraint
        ALTER TABLE public.balances ADD CONSTRAINT balances_user_id_unique UNIQUE (user_id);
    END IF;
END $$;

-- Also ensure we have the trigger that calls this function
DROP TRIGGER IF EXISTS trigger_update_balance_stats ON public.cases;
CREATE TRIGGER trigger_update_balance_stats
    AFTER INSERT OR UPDATE OR DELETE ON public.cases
    FOR EACH ROW EXECUTE FUNCTION trigger_update_balance_stats();
