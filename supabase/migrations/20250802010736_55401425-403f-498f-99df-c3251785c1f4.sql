-- Create the create_case_atomic function
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
  user_balance_record RECORD;
BEGIN
  -- Generate case number with timestamp and UUID
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

  -- Get or create user balance record
  SELECT * INTO user_balance_record 
  FROM balances 
  WHERE user_id = p_user_id;
  
  IF user_balance_record IS NULL THEN
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
    new_case_id as case_id,
    new_case_number as case_number,
    true as success,
    ''::TEXT as error_message;

EXCEPTION
  WHEN OTHERS THEN
    -- Return error result
    RETURN QUERY SELECT 
      NULL::UUID as case_id,
      ''::TEXT as case_number,
      false as success,
      SQLERRM as error_message;
END;
$$;