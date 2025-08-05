-- Remove the problematic atomic case creation function
DROP FUNCTION IF EXISTS public.create_case_atomic(uuid, text, text, text, numeric, text, date);

-- Create a simple, reliable function for case creation
CREATE OR REPLACE FUNCTION public.create_case_simple(
  p_user_id uuid,
  p_title text,
  p_description text,
  p_scam_type text,
  p_amount numeric,
  p_currency text DEFAULT 'USD',
  p_incident_date date DEFAULT NULL
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_case_id uuid;
  new_case_number text;
  result json;
BEGIN
  -- Generate a simple, unique case number
  new_case_number := 'CASE-' || EXTRACT(YEAR FROM NOW()) || '-' || EXTRACT(EPOCH FROM NOW())::bigint;
  
  -- Insert the case
  INSERT INTO public.cases (
    user_id,
    title,
    description,
    scam_type,
    amount,
    currency,
    incident_date,
    case_number,
    status
  ) VALUES (
    p_user_id,
    p_title,
    p_description,
    p_scam_type,
    p_amount,
    p_currency,
    p_incident_date,
    new_case_number,
    'pending'
  ) RETURNING id INTO new_case_id;

  -- Return success with case details
  result := json_build_object(
    'success', true,
    'case_id', new_case_id,
    'case_number', new_case_number
  );
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Return error
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;