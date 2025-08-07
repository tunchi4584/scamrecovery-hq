-- URGENT FIX: Remove case status restrictions from amount_recovered calculations
-- This ensures admin-set recovery amounts are preserved regardless of case status

CREATE OR REPLACE FUNCTION public.update_user_balance_stats(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $function$
DECLARE
    total_amount_all_cases NUMERIC := 0;
    calculated_amount_lost NUMERIC := 0;
    total_case_count INTEGER := 0;
    completed_case_count INTEGER := 0;
    pending_case_count INTEGER := 0;
    existing_recovery_amount NUMERIC := 0;
    existing_recovery_notes TEXT := '';
BEGIN
    -- Calculate totals from cases (excluding amount_recovered calculation)
    SELECT 
        COALESCE(SUM(amount), 0), -- Total amount from all cases
        COUNT(*),
        COUNT(CASE WHEN status IN ('resolved', 'complete') THEN 1 END),
        COUNT(CASE WHEN status IN ('pending', 'in_progress', 'under_review') THEN 1 END)
    INTO 
        total_amount_all_cases,
        total_case_count,
        completed_case_count,
        pending_case_count
    FROM public.cases 
    WHERE user_id = p_user_id;

    -- Get existing admin-set recovery amount and notes to preserve them
    SELECT 
        COALESCE(amount_recovered, 0),
        COALESCE(recovery_notes, '')
    INTO existing_recovery_amount, existing_recovery_notes
    FROM public.balances 
    WHERE user_id = p_user_id;

    -- Calculate amount lost as total amount - admin-set recovered amount
    calculated_amount_lost := total_amount_all_cases - existing_recovery_amount;

    -- Upsert balance record, preserving admin-set recovery amounts
    INSERT INTO public.balances (
        user_id, 
        amount_lost, 
        amount_recovered, 
        total_cases, 
        completed_cases, 
        pending_cases,
        recovery_notes,
        updated_at
    ) VALUES (
        p_user_id, 
        calculated_amount_lost,
        existing_recovery_amount, -- PRESERVE admin-set amount
        total_case_count, 
        completed_case_count, 
        pending_case_count,
        existing_recovery_notes, -- PRESERVE admin-set notes
        NOW()
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        amount_lost = EXCLUDED.amount_lost,
        -- CRITICAL: Do NOT update amount_recovered - preserve admin values
        total_cases = EXCLUDED.total_cases,
        completed_cases = EXCLUDED.completed_cases,
        pending_cases = EXCLUDED.pending_cases,
        -- CRITICAL: Do NOT update recovery_notes - preserve admin values
        updated_at = EXCLUDED.updated_at;
END;
$function$;