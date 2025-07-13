
-- Create a more comprehensive cases table structure
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS case_number TEXT UNIQUE;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS scam_type TEXT;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS evidence TEXT;

-- Create a function to generate unique case numbers
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER := 1;
BEGIN
    LOOP
        new_number := 'CASE-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(counter::TEXT, 6, '0');
        
        -- Check if this number already exists
        IF NOT EXISTS (SELECT 1 FROM public.cases WHERE case_number = new_number) THEN
            RETURN new_number;
        END IF;
        
        counter := counter + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate case numbers
CREATE OR REPLACE FUNCTION set_case_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.case_number IS NULL THEN
        NEW.case_number := generate_case_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_case_number ON public.cases;
CREATE TRIGGER trigger_set_case_number
    BEFORE INSERT ON public.cases
    FOR EACH ROW
    EXECUTE FUNCTION set_case_number();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cases_case_number ON public.cases(case_number);
CREATE INDEX IF NOT EXISTS idx_cases_status ON public.cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_user_id_status ON public.cases(user_id, status);

-- Update balances table to have better structure
ALTER TABLE public.balances ADD COLUMN IF NOT EXISTS total_cases INTEGER DEFAULT 0;
ALTER TABLE public.balances ADD COLUMN IF NOT EXISTS completed_cases INTEGER DEFAULT 0;
ALTER TABLE public.balances ADD COLUMN IF NOT EXISTS pending_cases INTEGER DEFAULT 0;

-- Create function to update user balance statistics
CREATE OR REPLACE FUNCTION update_user_balance_stats(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    total_amount_lost NUMERIC := 0;
    total_amount_recovered NUMERIC := 0;
    total_case_count INTEGER := 0;
    completed_case_count INTEGER := 0;
    pending_case_count INTEGER := 0;
BEGIN
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
    WHERE user_id = p_user_id;

    -- Get recovered amount from existing balance record
    SELECT COALESCE(amount_recovered, 0) 
    INTO total_amount_recovered
    FROM public.balances 
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
        total_cases = EXCLUDED.total_cases,
        completed_cases = EXCLUDED.completed_cases,
        pending_cases = EXCLUDED.pending_cases,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update balance stats when cases change
CREATE OR REPLACE FUNCTION trigger_update_balance_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle INSERT and UPDATE
    IF TG_OP IN ('INSERT', 'UPDATE') THEN
        PERFORM update_user_balance_stats(NEW.user_id);
        
        -- If status changed to resolved/complete, send notification
        IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
            -- Call the notification function
            PERFORM pg_notify('case_status_updated', json_build_object(
                'case_id', NEW.id,
                'user_id', NEW.user_id,
                'old_status', OLD.status,
                'new_status', NEW.status,
                'case_number', NEW.case_number,
                'title', NEW.title,
                'amount', NEW.amount
            )::text);
        END IF;
    END IF;
    
    -- Handle DELETE
    IF TG_OP = 'DELETE' THEN
        PERFORM update_user_balance_stats(OLD.user_id);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_case_balance_update ON public.cases;
CREATE TRIGGER trigger_case_balance_update
    AFTER INSERT OR UPDATE OR DELETE ON public.cases
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_balance_stats();
