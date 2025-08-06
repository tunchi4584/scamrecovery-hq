-- Enable real-time updates for the balances table
ALTER TABLE public.balances REPLICA IDENTITY FULL;

-- Add the balances table to the realtime publication if not already added
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'balances'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.balances;
    END IF;
END $$;