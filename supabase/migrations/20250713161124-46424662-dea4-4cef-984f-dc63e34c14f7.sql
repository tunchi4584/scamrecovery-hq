-- Step 1: Clean up duplicate balance records, keeping the most recent one
DELETE FROM public.balances 
WHERE id NOT IN (
    SELECT DISTINCT ON (user_id) id 
    FROM public.balances 
    ORDER BY user_id, updated_at DESC
);

-- Step 2: Now add the unique constraint
ALTER TABLE public.balances ADD CONSTRAINT balances_user_id_unique UNIQUE (user_id);

-- Step 3: Temporarily disable the trigger to avoid issues during case creation
DROP TRIGGER IF EXISTS trigger_update_balance_stats ON public.cases;

-- Step 4: Create a simpler trigger that just updates stats without ON CONFLICT complexity
CREATE OR REPLACE FUNCTION public.simple_update_balance_stats()
RETURNS TRIGGER AS $$
DECLARE
    total_amount_lost NUMERIC := 0;
    total_case_count INTEGER := 0;
    completed_case_count INTEGER := 0;
    pending_case_count INTEGER := 0;
    target_user_id UUID;
BEGIN
    -- Determine which user_id to update
    IF TG_OP = 'DELETE' THEN
        target_user_id := OLD.user_id;
    ELSE
        target_user_id := NEW.user_id;
    END IF;

    -- Calculate totals from cases
    SELECT 
        COALESCE(SUM(amount), 0),
        COUNT(*),
        COUNT(CASE WHEN status IN ('resolved', 'complete') THEN 1 END),
        COUNT(CASE WHEN status IN ('pending', 'in_progress', 'under_review') THEN 1 END)
    INTO 
        total_amount_lost,
        total_case_count,
        completed_case_count,
        pending_case_count
    FROM public.cases 
    WHERE user_id = target_user_id;

    -- Update or insert balance record
    IF EXISTS (SELECT 1 FROM public.balances WHERE user_id = target_user_id) THEN
        UPDATE public.balances 
        SET 
            amount_lost = total_amount_lost,
            total_cases = total_case_count,
            completed_cases = completed_case_count,
            pending_cases = pending_case_count,
            updated_at = NOW()
        WHERE user_id = target_user_id;
    ELSE
        INSERT INTO public.balances (
            user_id, 
            amount_lost, 
            amount_recovered, 
            total_cases, 
            completed_cases, 
            pending_cases
        ) VALUES (
            target_user_id, 
            total_amount_lost, 
            0, 
            total_case_count, 
            completed_case_count, 
            pending_case_count
        );
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create the new trigger
CREATE TRIGGER simple_balance_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.cases
    FOR EACH ROW EXECUTE FUNCTION simple_update_balance_stats();