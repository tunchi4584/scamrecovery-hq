
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  type: string;
  email: string;
  message: string;
  userName?: string;
  caseTitle?: string;
  amount?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, email, message, userName, caseTitle, amount }: NotificationRequest = await req.json();

    let subject = '';
    let htmlContent = '';
    const adminEmail = 'admin@scamrecovery.com'; // Replace with actual admin email

    if (type === 'new_user') {
      subject = '🎉 New User Registration - Scam Recovery';
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">New User Registration</h1>
          </div>
          <div style="padding: 20px; background-color: #f8f9fa;">
            <h2 style="color: #333;">📋 Registration Details</h2>
            <p style="font-size: 16px; color: #555;">
              A new user has registered on the Scam Recovery platform:
            </p>
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Name:</strong> ${userName || 'Not provided'}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Registration Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p style="color: #666;">
              Please review the new user registration and ensure they have access to the appropriate resources.
            </p>
          </div>
        </div>
      `;
    } else if (type === 'new_case') {
      subject = '🚨 New Case Submission - Scam Recovery';
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">New Case Submission</h1>
          </div>
          <div style="padding: 20px; background-color: #f8f9fa;">
            <h2 style="color: #333;">📋 Case Details</h2>
            <p style="font-size: 16px; color: #555;">
              A new recovery case has been submitted:
            </p>
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Case Title:</strong> ${caseTitle || 'Not specified'}</p>
              <p><strong>Submitted by:</strong> ${email}</p>
              <p><strong>Amount:</strong> $${amount?.toLocaleString() || '0'}</p>
              <p><strong>Submission Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <div style="text-align: center; margin: 20px 0;">
              <a href="https://scamrecovery-hq.lovable.app/admin/dashboard" 
                 style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Review Case in Admin Dashboard
              </a>
            </div>
            <p style="color: #666;">
              Please review this case promptly and update the status as needed.
            </p>
          </div>
        </div>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: 'Scam Recovery HQ <notifications@resend.dev>',
      to: [adminEmail],
      subject: subject,
      html: htmlContent,
    });

    console.log('Admin notification sent successfully:', emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin notification sent successfully'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error sending admin notification:', error);
    
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
