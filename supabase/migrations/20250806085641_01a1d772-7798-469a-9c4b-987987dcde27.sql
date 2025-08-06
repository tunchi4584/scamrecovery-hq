-- Update the trigger function to NOT automatically calculate recovery amount
-- Only calculate case counts and total lost amount, preserve manual recovery amounts
CREATE OR REPLACE FUNCTION public.update_user_balance_on_case_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    target_user_id UUID;
    total_case_amount NUMERIC := 0;
    case_counts RECORD;
    existing_recovery_amount NUMERIC := 0;
    existing_notes TEXT := '';
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

    -- Get case counts
    SELECT 
        COUNT(*) as total_cases,
        COUNT(CASE WHEN status IN ('complete', 'resolved') THEN 1 END) as completed_cases,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_cases
    INTO case_counts
    FROM public.cases 
    WHERE user_id = target_user_id;

    -- Get existing recovery amount and notes to preserve admin-set values
    SELECT 
        COALESCE(amount_recovered, 0),
        COALESCE(recovery_notes, '')
    INTO existing_recovery_amount, existing_notes
    FROM public.balances 
    WHERE user_id = target_user_id;

    -- Update or insert balance record, preserving manual recovery amounts
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
        target_user_id, 
        total_case_amount, 
        existing_recovery_amount, -- Preserve existing recovery amount
        case_counts.total_cases, 
        case_counts.completed_cases, 
        case_counts.pending_cases,
        existing_notes, -- Preserve existing notes
        now()
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        amount_lost = EXCLUDED.amount_lost,
        -- Do NOT update amount_recovered here - preserve admin-set values
        total_cases = EXCLUDED.total_cases,
        completed_cases = EXCLUDED.completed_cases,
        pending_cases = EXCLUDED.pending_cases,
        -- Do NOT update recovery_notes here - preserve admin-set values
        updated_at = now();

    RETURN COALESCE(NEW, OLD);
END;
$$;