-- Remove the phone contact (assuming this is the emergency hotline)
DELETE FROM public.contacts 
WHERE platform = 'phone' AND label = 'Call';