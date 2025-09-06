-- Update all existing user balance stats to calculate from individual case recoveries
DO $$
DECLARE
    user_record RECORD;
BEGIN
    -- Loop through all users who have cases
    FOR user_record IN 
        SELECT DISTINCT user_id FROM public.cases
    LOOP
        -- Update their balance stats using the function
        PERFORM public.update_user_balance_stats(user_record.user_id);
    END LOOP;
END $$;