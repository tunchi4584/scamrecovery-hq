
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
    const { caseId, description, scamType, amount } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Simple AI analysis logic (in a real implementation, you'd use OpenAI or similar)
    const analysis = analyzeCase(description, scamType, amount);

    // Update the case with analysis results
    const { error } = await supabase
      .from('cases')
      .update({
        status: analysis.recommendedStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', caseId);

    if (error) {
      throw new Error(`Database update failed: ${error.message}`);
    }

    console.log(`Case ${caseId} analyzed successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysis,
        message: 'Case analyzed successfully'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in AI case analyzer:', error);
    
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

function analyzeCase(description: string, scamType: string, amount: number) {
  // Simple rule-based analysis (replace with actual AI/ML in production)
  let riskScore = 0;
  let recommendedStatus = 'pending';
  let recoveryProbability = 0;

  // Analyze based on scam type
  const scamTypeAnalysis = {
    'Investment Scam': { risk: 0.7, recovery: 0.6 },
    'Romance Scam': { risk: 0.8, recovery: 0.3 },
    'Tech Support Scam': { risk: 0.6, recovery: 0.7 },
    'Cryptocurrency Scam': { risk: 0.9, recovery: 0.4 },
    'Online Shopping Scam': { risk: 0.5, recovery: 0.8 },
    'Identity Theft': { risk: 0.8, recovery: 0.5 },
    'Phishing Scam': { risk: 0.7, recovery: 0.6 },
    'Business Email Compromise': { risk: 0.8, recovery: 0.7 },
    'Other': { risk: 0.6, recovery: 0.5 }
  };

  const analysis = scamTypeAnalysis[scamType as keyof typeof scamTypeAnalysis] || scamTypeAnalysis['Other'];
  riskScore = analysis.risk;
  recoveryProbability = analysis.recovery;

  // Adjust based on amount
  if (amount > 100000) {
    recoveryProbability += 0.1; // Higher amounts often have better recovery chances
  } else if (amount < 1000) {
    recoveryProbability -= 0.1; // Lower amounts might be harder to recover
  }

  // Adjust based on description length and detail
  if (description.length > 500) {
    recoveryProbability += 0.05; // More detailed descriptions help
  }

  // Determine recommended status
  if (recoveryProbability > 0.7) {
    recommendedStatus = 'in_progress';
  } else if (recoveryProbability < 0.3) {
    recommendedStatus = 'pending'; // Needs more investigation
  } else {
    recommendedStatus = 'in_progress';
  }

  // Ensure probabilities are within bounds
  recoveryProbability = Math.max(0.1, Math.min(0.9, recoveryProbability));

  return {
    riskScore: Math.round(riskScore * 100),
    recoveryProbability: Math.round(recoveryProbability * 100),
    recommendedStatus,
    insights: generateInsights(scamType, amount, recoveryProbability),
    nextSteps: generateNextSteps(scamType, recommendedStatus)
  };
}

function generateInsights(scamType: string, amount: number, recoveryProbability: number): string[] {
  const insights = [];

  if (scamType === 'Cryptocurrency Scam') {
    insights.push('Cryptocurrency transactions are often irreversible, but blockchain analysis may help trace funds');
  }

  if (amount > 50000) {
    insights.push('High-value cases often receive priority attention from law enforcement');
  }

  if (recoveryProbability > 0.7) {
    insights.push('Strong recovery potential based on case characteristics');
  } else if (recoveryProbability < 0.4) {
    insights.push('Recovery may be challenging, but investigation is still worthwhile');
  }

  return insights;
}

function generateNextSteps(scamType: string, status: string): string[] {
  const steps = [];

  if (status === 'in_progress') {
    steps.push('Initiate contact with relevant financial institutions');
    steps.push('Begin documentation and evidence collection');
  }

  if (scamType === 'Investment Scam' || scamType === 'Cryptocurrency Scam') {
    steps.push('Contact regulatory authorities (SEC, CFTC)');
  }

  steps.push('File report with appropriate law enforcement agencies');
  steps.push('Begin asset tracing and recovery procedures');

  return steps;
}
