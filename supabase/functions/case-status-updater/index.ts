
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Case status updater triggered');

    // Listen for PostgreSQL notifications
    const channel = supabase.channel('case_status_updates');
    
    channel.on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'cases'
    }, async (payload) => {
      console.log('Case update received:', payload);
      
      if (payload.eventType === 'UPDATE') {
        const caseData = payload.new;
        
        // Get user profile information
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, email')
          .eq('id', caseData.user_id)
          .single();

        if (profile) {
          // Send email notification
          const notificationData = {
            type: 'submission_update',
            email: profile.email,
            userName: profile.name,
            caseTitle: caseData.title,
            amount: caseData.amount,
            status: caseData.status,
            message: `Your case "${caseData.title}" status has been updated to: ${caseData.status.replace('_', ' ').toUpperCase()}`
          };

          console.log('Sending email notification:', notificationData);

          await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-admin-notification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
            },
            body: JSON.stringify(notificationData)
          });
        }
      }
    });

    channel.subscribe();

    return new Response(
      JSON.stringify({ message: 'Case status updater is running' }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in case status updater:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
