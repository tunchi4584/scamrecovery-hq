-- Fix the user_record variable issue in the trigger function
CREATE OR REPLACE FUNCTION public.update_user_balance_on_case_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    target_user_id UUID;
    total_case_amount NUMERIC := 0;
    recovery_amount NUMERIC := 0;
    case_counts RECORD;
BEGIN
    -- Get the user_id from either NEW or OLD record
    IF TG_OP = 'DELETE' THEN
        target_user_id := OLD.user_id;
    ELSE
        target_user_id := NEW.user_id;
    END IF;

    -- Calculate total amount lost from all cases for this user
    SELECT COALESCE(SUM(amount), 0) INTO total_case_amount
    FROM public.cases 
    WHERE user_id = target_user_id;

    -- Calculate recovered amount (cases with status in_progress, approved, or complete have their amounts as recovered)
    SELECT COALESCE(SUM(amount), 0) INTO recovery_amount
    FROM public.cases 
    WHERE user_id = target_user_id 
    AND status IN ('in_progress', 'under_review', 'approved', 'complete');

    -- Get case counts
    SELECT 
        COUNT(*) as total_cases,
        COUNT(CASE WHEN status IN ('complete', 'resolved') THEN 1 END) as completed_cases,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_cases
    INTO case_counts
    FROM public.cases 
    WHERE user_id = target_user_id;

    -- Update or insert balance record
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
        total_case_amount, 
        recovery_amount, 
        case_counts.total_cases, 
        case_counts.completed_cases, 
        case_counts.pending_cases,
        now()
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        amount_lost = EXCLUDED.amount_lost,
        amount_recovered = EXCLUDED.amount_recovered,
        total_cases = EXCLUDED.total_cases,
        completed_cases = EXCLUDED.completed_cases,
        pending_cases = EXCLUDED.pending_cases,
        updated_at = now();

    RETURN COALESCE(NEW, OLD);
END;
$$;