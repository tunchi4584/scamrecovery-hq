import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Contact {
  id: string;
  platform: string;
  label: string;
  value: string;
  icon_type: string;
  is_active: boolean;
  display_order: number;
}

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      // @ts-ignore - contacts table exists but not in types yet
      const { data, error } = await (supabase as any)
        .from('contacts')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setContacts((data as unknown as Contact[]) || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      // Fallback to default contacts if database fails
      setContacts([
        {
          id: '1',
          platform: 'phone',
          label: 'Call',
          value: '+17622035587',
          icon_type: 'phone',
          is_active: true,
          display_order: 1
        },
        {
          id: '2',
          platform: 'email',
          label: 'Email',
          value: 'assetrecovery36@gmail.com',
          icon_type: 'email',
          is_active: true,
          display_order: 2
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return { contacts, loading, refetch: fetchContacts };
}