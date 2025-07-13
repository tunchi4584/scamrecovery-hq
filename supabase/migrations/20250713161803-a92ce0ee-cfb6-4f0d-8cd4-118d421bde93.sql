-- Remove all triggers on cases table to eliminate any issues
DROP TRIGGER IF EXISTS trigger_update_balance_stats ON public.cases;
DROP TRIGGER IF EXISTS simple_balance_stats_trigger ON public.cases;
DROP TRIGGER IF EXISTS set_case_number_trigger ON public.cases;

-- Simplify the case number generation trigger only
CREATE OR REPLACE FUNCTION public.set_case_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.case_number IS NULL THEN
        NEW.case_number := 'CASE-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(EXTRACT(EPOCH FROM NOW())::TEXT, 10, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add only the case number trigger
CREATE TRIGGER set_case_number_trigger
    BEFORE INSERT ON public.cases
    FOR EACH ROW EXECUTE FUNCTION set_case_number();