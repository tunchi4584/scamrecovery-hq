-- Phase 1: Database Cleanup & Repair

-- Fix all existing NULL case numbers
UPDATE public.cases 
SET case_number = 'CASE-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD((EXTRACT(EPOCH FROM created_at) + row_number() OVER (ORDER BY created_at))::TEXT, 10, '0')
WHERE case_number IS NULL;

-- Make case_number NOT NULL with proper default
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
    existing_balance_record RECORD;
BEGIN
    -- Start transaction (implicit in function)
    
    -- Generate case number
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
    
    -- Get existing balance record
    SELECT * INTO existing_balance_record 
    FROM public.balances 
    WHERE user_id = p_user_id;
    
    -- Update or insert balance record
    IF existing_balance_record IS NOT NULL THEN
        UPDATE public.balances 
        SET 
            amount_lost = COALESCE(amount_lost, 0) + p_amount,
            total_cases = COALESCE(total_cases, 0) + 1,
            pending_cases = COALESCE(pending_cases, 0) + 1,
            updated_at = NOW()
        WHERE user_id = p_user_id;
    ELSE
        INSERT INTO public.balances (
            user_id, 
            amount_lost, 
            amount_recovered, 
            total_cases, 
            completed_cases, 
            pending_cases
        ) VALUES (
            p_user_id, 
            p_amount, 
            0, 
            1, 
            0, 
            1
        );
    END IF;
    
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

-- Phase 3: Update balance stats trigger for future updates
CREATE OR REPLACE FUNCTION public.update_balance_on_case_change()
RETURNS TRIGGER AS $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Determine user_id to update
    IF TG_OP = 'DELETE' THEN
        target_user_id := OLD.user_id;
    ELSE
        target_user_id := NEW.user_id;
    END IF;
    
    -- Recalculate balance stats for this user
    WITH case_stats AS (
        SELECT 
            COALESCE(SUM(amount), 0) as total_lost,
            COUNT(*) as total_cases,
            COUNT(CASE WHEN status IN ('resolved', 'complete') THEN 1 END) as completed_cases,
            COUNT(CASE WHEN status IN ('pending', 'in_progress', 'under_review') THEN 1 END) as pending_cases
        FROM public.cases 
        WHERE user_id = target_user_id
    )
    INSERT INTO public.balances (
        user_id, 
        amount_lost, 
        amount_recovered, 
        total_cases, 
        completed_cases, 
        pending_cases,
        updated_at
    ) 
    SELECT 
        target_user_id,
        case_stats.total_lost,
        0, -- Keep existing amount_recovered
        case_stats.total_cases,
        case_stats.completed_cases,
        case_stats.pending_cases,
        NOW()
    FROM case_stats
    ON CONFLICT (user_id) DO UPDATE SET
        amount_lost = EXCLUDED.amount_lost,
        total_cases = EXCLUDED.total_cases,
        completed_cases = EXCLUDED.completed_cases,
        pending_cases = EXCLUDED.pending_cases,
        updated_at = NOW();
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for balance updates on case changes (excluding INSERT since we handle that in the function)
DROP TRIGGER IF EXISTS update_balance_on_case_change ON public.cases;
CREATE TRIGGER update_balance_on_case_change
    AFTER UPDATE OR DELETE ON public.cases
    FOR EACH ROW EXECUTE FUNCTION update_balance_on_case_change();