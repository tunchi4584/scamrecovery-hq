
-- Update admin credentials - first remove the old admin role if it exists
DELETE FROM public.user_roles WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'admin@scamrecovery.com'
);

-- Add admin role for the new admin email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'mwangik2455@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- If the user doesn't exist in auth.users yet, we'll handle that after they sign up
-- The admin role will be automatically assigned when they first register
