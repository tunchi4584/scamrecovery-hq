-- Fix the balance calculation logic to properly separate lost vs recovered amounts
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
    -- amount_lost should only be from pending/in_progress/under_review cases
    -- amount_recovered should be from resolved/complete cases
    SELECT 
        COALESCE(SUM(CASE WHEN status IN ('pending', 'in_progress', 'under_review') THEN amount ELSE 0 END), 0),
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

-- Also update the update_user_balance_stats function for consistency
CREATE OR REPLACE FUNCTION public.update_user_balance_stats(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $function$
DECLARE
    total_amount_lost NUMERIC := 0;
    total_amount_recovered NUMERIC := 0;
    total_case_count INTEGER := 0;
    completed_case_count INTEGER := 0;
    pending_case_count INTEGER := 0;
BEGIN
    -- Calculate totals from cases
    -- amount_lost should only be from pending/in_progress/under_review cases
    -- amount_recovered should be from resolved/complete cases
    SELECT 
        COALESCE(SUM(CASE WHEN status IN ('pending', 'in_progress', 'under_review') THEN amount ELSE 0 END), 0),
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
    WHERE user_id = p_user_id;

    -- Upsert balance record
    INSERT INTO public.balances (
        user_id, 
        amount_lost, 
        amount_recovered, 
        total_cases, 
        completed_cases, 
        pending_cases,
        updated_at
    ) VALUES (
        p_user_id, 
        total_amount_lost, 
        total_amount_recovered, 
        total_case_count, 
        completed_case_count, 
        pending_case_count,
        NOW()
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        amount_lost = EXCLUDED.amount_lost,
        amount_recovered = EXCLUDED.amount_recovered,
        total_cases = EXCLUDED.total_cases,
        completed_cases = EXCLUDED.completed_cases,
        pending_cases = EXCLUDED.pending_cases,
        updated_at = NOW();
END;
$function$;

-- Recalculate the balance for the test user to fix the current data
SELECT update_user_balance_stats('ebf176f2-3efc-4811-a3b8-cba7b68a3e26');