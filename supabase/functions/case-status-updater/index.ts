
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { caseId, newStatus, notes, recoveredAmount } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update case status
    const updateData: any = {
      status: newStatus,
      updated_at: new Date().toISOString()
    };

    // If amount is recovered, update the amount field
    if (recoveredAmount !== undefined && recoveredAmount > 0) {
      updateData.amount = recoveredAmount;
    }

    const { data: updatedCase, error } = await supabase
      .from('cases')
      .update(updateData)
      .eq('id', caseId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update case: ${error.message}`);
    }

    // Log the status change
    console.log(`Case ${caseId} status updated to ${newStatus}`);
    if (notes) {
      console.log(`Notes: ${notes}`);
    }
    if (recoveredAmount) {
      console.log(`Recovery amount: $${recoveredAmount}`);
    }

    // If case is resolved, you could trigger additional actions here
    if (newStatus === 'resolved') {
      // Could send notification email, update user balance, etc.
      console.log(`Case ${caseId} has been resolved with recovery of $${recoveredAmount || 0}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        case: updatedCase,
        message: `Case status updated to ${newStatus}`
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error updating case status:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
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
