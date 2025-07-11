
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
  status?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, email, message, userName, caseTitle, amount, status }: NotificationRequest = await req.json();

    let subject = '';
    let htmlContent = '';
    let toEmail = '';
    const adminEmail = 'assetrecovery36@gmail.com';

    if (type === 'new_user') {
      subject = '🎉 New User Registration - Scam Recovery';
      toEmail = adminEmail;
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
      toEmail = adminEmail;
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
    } else if (type === 'submission_update') {
      subject = '📋 Submission Status Update - Scam Recovery';
      toEmail = email; // Send to the user who submitted
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Submission Update</h1>
          </div>
          <div style="padding: 20px; background-color: #f8f9fa;">
            <h2 style="color: #333;">Hello ${userName || 'Valued Client'},</h2>
            <p style="font-size: 16px; color: #555;">
              We have an update regarding your scam recovery submission:
            </p>
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Case Type:</strong> ${caseTitle || 'Not specified'}</p>
              <p><strong>Amount:</strong> $${amount?.toLocaleString() || '0'}</p>
              <p><strong>Current Status:</strong> <span style="color: ${status === 'resolved' ? '#28a745' : status === 'in-progress' ? '#007bff' : status === 'rejected' ? '#dc3545' : '#ffc107'}; font-weight: bold;">${status?.toUpperCase() || 'PENDING'}</span></p>
              <p><strong>Update Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #1565c0;"><strong>Message:</strong> ${message}</p>
            </div>
            <p style="color: #666;">
              If you have any questions about this update, please don't hesitate to contact our support team.
            </p>
            <div style="text-align: center; margin: 20px 0;">
              <p style="color: #666; font-size: 14px;">
                Best regards,<br>
                Asset Recovery Team<br>
                <a href="mailto:assetrecovery36@gmail.com" style="color: #007bff;">assetrecovery36@gmail.com</a>
              </p>
            </div>
          </div>
        </div>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: 'Asset Recovery <assetrecovery36@gmail.com>',
      to: [toEmail],
      subject: subject,
      html: htmlContent,
    });

    console.log('Email sent successfully:', emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email sent successfully',
        to: toEmail
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error sending email:', error);
    
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
