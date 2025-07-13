-- Add admin notes functionality to cases table
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS last_updated_by UUID;

-- Create case_updates table for tracking case progress
CREATE TABLE IF NOT EXISTS public.case_updates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    status TEXT,
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on case_updates
ALTER TABLE public.case_updates ENABLE ROW LEVEL SECURITY;

-- Create policies for case_updates
CREATE POLICY "Users can view updates for their own cases"
ON public.case_updates
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.cases 
        WHERE cases.id = case_updates.case_id 
        AND cases.user_id = auth.uid()
    )
);

CREATE POLICY "Admins can manage all case updates"
ON public.case_updates
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Function to add case update
CREATE OR REPLACE FUNCTION public.add_case_update(
    p_case_id UUID,
    p_message TEXT,
    p_status TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    update_id UUID;
BEGIN
    -- Check if user has permission (admin or case owner)
    IF NOT (
        has_role(auth.uid(), 'admin'::app_role) OR
        EXISTS (
            SELECT 1 FROM public.cases 
            WHERE id = p_case_id 
            AND user_id = auth.uid()
        )
    ) THEN
        RAISE EXCEPTION 'Insufficient permissions';
    END IF;
    
    -- Insert the update
    INSERT INTO public.case_updates (case_id, message, status, updated_by)
    VALUES (p_case_id, p_message, p_status, auth.uid())
    RETURNING id INTO update_id;
    
    -- Update case status if provided
    IF p_status IS NOT NULL THEN
        UPDATE public.cases 
        SET status = p_status, 
            last_updated_by = auth.uid(),
            updated_at = now()
        WHERE id = p_case_id;
    END IF;
    
    RETURN update_id;
END;
$$;