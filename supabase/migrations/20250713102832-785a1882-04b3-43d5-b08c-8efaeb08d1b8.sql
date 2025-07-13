
-- Allow users to insert their own balance records
CREATE POLICY "Users can create their own balance record"
ON public.balances
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own balance records  
CREATE POLICY "Users can view their own balance"
ON public.balances
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to update their own balance records
CREATE POLICY "Users can update their own balance"
ON public.balances
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
