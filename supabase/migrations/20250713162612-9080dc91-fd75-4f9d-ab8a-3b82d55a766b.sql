-- Phase 1: Database Cleanup & Repair

-- Fix all existing NULL case numbers with a simpler approach
UPDATE public.cases 
SET case_number = 'CASE-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(EXTRACT(EPOCH FROM NOW())::TEXT, 10, '0') || '-' || id::TEXT
WHERE case_number IS NULL;

-- Make case_number NOT NULL
ALTER TABLE public.cases ALTER COLUMN case_number SET NOT NULL;

-- Recalculate all balance statistics correctly
WITH case_stats AS (
    SELECT 
        user_id,
        COALESCE(SUM(amount), 0) as total_lost,
        COUNT(*) as total_cases,
        COUNT(CASE WHEN status IN ('resolved', 'complete') THEN 1 END) as completed_cases,
        COUNT(CASE WHEN status IN ('pending', 'in_progress', 'under_review') THEN 1 END) as pending_cases
    FROM public.cases 
    GROUP BY user_id
)
UPDATE public.balances 
SET 
    amount_lost = COALESCE(case_stats.total_lost, 0),
    total_cases = COALESCE(case_stats.total_cases, 0),
    completed_cases = COALESCE(case_stats.completed_cases, 0),
    pending_cases = COALESCE(case_stats.pending_cases, 0),
    updated_at = NOW()
FROM case_stats 
WHERE balances.user_id = case_stats.user_id;

-- Phase 2: Create Atomic Case Creation Function
CREATE OR REPLACE FUNCTION public.create_case_atomic(
    p_user_id UUID,
    p_title TEXT,
    p_description TEXT,
    p_scam_type TEXT,
    p_amount NUMERIC
) RETURNS TABLE(
    case_id UUID,
    case_number TEXT,
    success BOOLEAN,
    error_message TEXT
) AS $$
DECLARE
    new_case_id UUID;
    new_case_number TEXT;
BEGIN
    -- Generate unique case number
    new_case_number := 'CASE-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(EXTRACT(EPOCH FROM NOW())::TEXT, 10, '0');
    
    -- Insert new case
    INSERT INTO public.cases (
        user_id, 
        title, 
        description, 
        scam_type, 
        amount, 
        status,
        case_number
    ) VALUES (
        p_user_id, 
        p_title, 
        p_description, 
        p_scam_type, 
        p_amount, 
        'pending',
        new_case_number
    ) RETURNING id INTO new_case_id;
    
    -- Update or insert balance record atomically
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
        p_amount, 
        0, 
        1, 
        0, 
        1,
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        amount_lost = balances.amount_lost + p_amount,
        total_cases = balances.total_cases + 1,
        pending_cases = balances.pending_cases + 1,
        updated_at = NOW();
    
    -- Return success
    RETURN QUERY SELECT 
        new_case_id,
        new_case_number,
        true as success,
        ''::TEXT as error_message;
        
EXCEPTION WHEN OTHERS THEN
    -- Return error
    RETURN QUERY SELECT 
        NULL::UUID,
        ''::TEXT,
        false as success,
        SQLERRM as error_message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;