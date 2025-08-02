-- Drop and recreate the create_case_atomic function to fix the variable issue
DROP FUNCTION IF EXISTS create_case_atomic(UUID, TEXT, TEXT, TEXT, NUMERIC);

CREATE OR REPLACE FUNCTION create_case_atomic(
  p_user_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_scam_type TEXT,
  p_amount NUMERIC
)
RETURNS TABLE(
  case_id UUID,
  case_number TEXT,
  success BOOLEAN,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_case_id UUID;
  new_case_number TEXT;
  balance_exists BOOLEAN := false;
BEGIN
  -- Generate case number with timestamp
  new_case_number := 'CASE-' || EXTRACT(YEAR FROM NOW()) || '-' || EXTRACT(EPOCH FROM NOW())::BIGINT;
  
  -- Insert the case
  INSERT INTO cases (
    user_id,
    title,
    description,
    scam_type,
    amount,
    case_number,
    status
  ) VALUES (
    p_user_id,
    p_title,
    p_description,
    p_scam_type,
    p_amount,
    new_case_number,
    'pending'
  ) RETURNING id INTO new_case_id;

  -- Check if balance record exists
  SELECT EXISTS(
    SELECT 1 FROM balances WHERE user_id = p_user_id
  ) INTO balance_exists;
  
  IF NOT balance_exists THEN
    -- Create initial balance record
    INSERT INTO balances (
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
  ELSE
    -- Update existing balance record
    UPDATE balances 
    SET 
      amount_lost = amount_lost + p_amount,
      total_cases = total_cases + 1,
      pending_cases = pending_cases + 1,
      updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;

  -- Return success result
  RETURN QUERY SELECT 
    new_case_id,
    new_case_number,
    true,
    ''::TEXT;

EXCEPTION
  WHEN OTHERS THEN
    -- Return error result
    RETURN QUERY SELECT 
      NULL::UUID,
      ''::TEXT,
      false,
      SQLERRM;
END;
$$;