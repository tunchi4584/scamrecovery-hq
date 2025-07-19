-- Update the balance stats function to calculate amount_recovered from completed cases
CREATE OR REPLACE FUNCTION public.simple_update_balance_stats()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
    total_amount_lost NUMERIC := 0;
    total_amount_recovered NUMERIC := 0;
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
        COALESCE(SUM(CASE WHEN status IN ('resolved', 'complete') THEN amount ELSE 0 END), 0),
        COUNT(*),
        COUNT(CASE WHEN status IN ('resolved', 'complete') THEN 1 END),
        COUNT(CASE WHEN status IN ('pending', 'in_progress', 'under_review') THEN 1 END)
    INTO 
        total_amount_lost,
        total_amount_recovered,
        total_case_count,
        completed_case_count,
        pending_case_count
    FROM public.cases 
    WHERE user_id = target_user_id;

    -- Use proper UPSERT to avoid duplicate key violations
    INSERT INTO public.balances (
        user_id, 
        amount_lost, 
        amount_recovered, 
        total_cases, 
        completed_cases, 
        pending_cases,
        updated_at
    ) VALUES (
        target_user_id, 
        total_amount_lost, 
        total_amount_recovered, 
        total_case_count, 
        completed_case_count, 
        pending_case_count,
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        amount_lost = EXCLUDED.amount_lost,
        amount_recovered = EXCLUDED.amount_recovered,
        total_cases = EXCLUDED.total_cases,
        completed_cases = EXCLUDED.completed_cases,
        pending_cases = EXCLUDED.pending_cases,
        updated_at = EXCLUDED.updated_at;

    RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Create trigger for cases table to auto-update balance stats
DROP TRIGGER IF EXISTS trigger_update_balance_stats ON public.cases;
CREATE TRIGGER trigger_update_balance_stats
    AFTER INSERT OR UPDATE OR DELETE ON public.cases
    FOR EACH ROW EXECUTE FUNCTION simple_update_balance_stats();