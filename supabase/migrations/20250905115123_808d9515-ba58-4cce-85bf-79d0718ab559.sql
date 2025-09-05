-- Add amount_recovered column to cases table
ALTER TABLE public.cases 
ADD COLUMN amount_recovered NUMERIC DEFAULT 0 NOT NULL;

-- Add recovery_notes column to cases table for notes per case
ALTER TABLE public.cases 
ADD COLUMN recovery_notes TEXT;

-- Update the balance calculation function to sum from individual cases
CREATE OR REPLACE FUNCTION public.update_user_balance_stats(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    total_amount_all_cases NUMERIC := 0;
    calculated_amount_recovered NUMERIC := 0;
    calculated_amount_lost NUMERIC := 0;
    total_case_count INTEGER := 0;
    completed_case_count INTEGER := 0;
    pending_case_count INTEGER := 0;
BEGIN
    -- Calculate totals from cases
    SELECT 
        COALESCE(SUM(amount), 0), -- Total amount from all cases
        COALESCE(SUM(amount_recovered), 0), -- Total recovered from individual cases
        COUNT(*),
        COUNT(CASE WHEN status IN ('resolved', 'complete') THEN 1 END),
        COUNT(CASE WHEN status IN ('pending', 'in_progress', 'under_review') THEN 1 END)
    INTO 
        total_amount_all_cases,
        calculated_amount_recovered,
        total_case_count,
        completed_case_count,
        pending_case_count
    FROM public.cases 
    WHERE user_id = p_user_id;

    -- Calculate amount lost as total amount - recovered amount
    calculated_amount_lost := total_amount_all_cases - calculated_amount_recovered;

    -- Upsert balance record using calculated values from cases
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
        calculated_amount_recovered,
        total_case_count, 
        completed_case_count, 
        pending_case_count,
        'Updated from individual case recoveries',
        NOW()
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        amount_lost = EXCLUDED.amount_lost,
        amount_recovered = EXCLUDED.amount_recovered,
        total_cases = EXCLUDED.total_cases,
        completed_cases = EXCLUDED.completed_cases,
        pending_cases = EXCLUDED.pending_cases,
        recovery_notes = EXCLUDED.recovery_notes,
        updated_at = EXCLUDED.updated_at;
END;
$function$;