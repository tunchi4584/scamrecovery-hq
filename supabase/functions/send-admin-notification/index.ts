
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
    console.log('Received notification request');
    const requestBody = await req.json();
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const { type, email, message, userName, caseTitle, amount, status }: NotificationRequest = requestBody;

    if (!type || !email) {
      console.error('Missing required fields:', { type, email });
      throw new Error('Missing required fields: type and email');
    }

    let subject = '';
    let htmlContent = '';
    let toEmail = '';
    const adminEmail = 'assetrecovery36@gmail.com';
    const fromEmail = 'Asset Recovery <assetrecovery36@gmail.com>';

    console.log('Processing notification type:', type);

    if (type === 'new_user') {
      subject = '🎉 New User Registration - Scam Recovery';
      toEmail = adminEmail;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">New User Registration</h1>
          </div>
          <div style="padding: 30px; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
            <h2 style="color: #333; margin-top: 0;">📋 Registration Details</h2>
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              A new user has registered on the Scam Recovery platform:
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <p style="margin: 8px 0;"><strong>Name:</strong> ${userName || 'Not provided'}</p>
              <p style="margin: 8px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 8px 0;"><strong>Registration Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              Please review the new user registration and ensure they have access to the appropriate resources.
            </p>
          </div>
        </div>
      `;
    } else if (type === 'new_case') {
      subject = '🚨 New Case Submission - Scam Recovery';
      toEmail = adminEmail;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">New Case Submission</h1>
          </div>
          <div style="padding: 30px; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
            <h2 style="color: #333; margin-top: 0;">📋 Case Details</h2>
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              A new recovery case has been submitted:
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f093fb;">
              <p style="margin: 8px 0;"><strong>Case Title:</strong> ${caseTitle || 'Not specified'}</p>
              <p style="margin: 8px 0;"><strong>Submitted by:</strong> ${email}</p>
              <p style="margin: 8px 0;"><strong>Amount:</strong> $${amount?.toLocaleString() || '0'}</p>
              <p style="margin: 8px 0;"><strong>Submission Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://scamrecovery-hq.lovable.app/admin/submissions" 
                 style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Review Case in Admin Dashboard
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              Please review this case promptly and update the status as needed.
            </p>
          </div>
        </div>
      `;
    } else if (type === 'submission_update') {
      subject = '📋 Important Update on Your Scam Recovery Case';
      toEmail = email; // Send to the user who submitted
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Case Status Update</h1>
          </div>
          <div style="padding: 30px; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${userName || 'Valued Client'},</h2>
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              We have an important update regarding your scam recovery submission:
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4facfe;">
              <p style="margin: 8px 0;"><strong>Case Type:</strong> ${caseTitle || 'Recovery Case'}</p>
              <p style="margin: 8px 0;"><strong>Amount:</strong> $${amount?.toLocaleString() || '0'}</p>
              <p style="margin: 8px 0;"><strong>Current Status:</strong> 
                <span style="color: ${
                  status === 'resolved' ? '#28a745' : 
                  status === 'in-progress' ? '#007bff' : 
                  status === 'rejected' ? '#dc3545' : '#ffc107'
                }; font-weight: bold; text-transform: uppercase;">
                  ${status?.replace('-', ' ') || 'PENDING'}
                </span>
              </p>
              <p style="margin: 8px 0;"><strong>Update Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
              <p style="margin: 0; color: #1565c0; line-height: 1.6;"><strong>Update Message:</strong></p>
              <p style="margin: 10px 0 0 0; color: #1565c0; line-height: 1.6;">${message || 'Status updated by admin team.'}</p>
            </div>
            
            ${status === 'resolved' ? `
              <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
                <p style="margin: 0; color: #2e7d32; font-weight: bold;">🎉 Great News!</p>
                <p style="margin: 10px 0 0 0; color: #2e7d32; line-height: 1.6;">Your case has been successfully resolved. We will be in touch with you regarding the next steps.</p>
              </div>
            ` : status === 'in-progress' ? `
              <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
                <p style="margin: 0; color: #1565c0; font-weight: bold;">🔍 Case In Progress</p>
                <p style="margin: 10px 0 0 0; color: #1565c0; line-height: 1.6;">Our team is actively working on your case. We will keep you updated on our progress.</p>
              </div>
            ` : ''}
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              If you have any questions about this update, please don't hesitate to contact our support team at assetrecovery36@gmail.com.
            </p>
            <div style="text-align: center; margin: 30px 0; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                Best regards,<br>
                <strong>Asset Recovery Team</strong><br>
                <a href="mailto:assetrecovery36@gmail.com" style="color: #007bff; text-decoration: none;">assetrecovery36@gmail.com</a>
              </p>
            </div>
          </div>
        </div>
      `;
    } else {
      console.error('Unknown notification type:', type);
      throw new Error(`Unknown notification type: ${type}`);
    }

    console.log('Preparing to send email:');
    console.log('- To:', toEmail);
    console.log('- Subject:', subject);
    console.log('- From:', fromEmail);

    const emailResponse = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: subject,
      html: htmlContent,
    });

    console.log('Email sent successfully:', emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email sent successfully',
        to: toEmail,
        subject: subject,
        emailId: emailResponse.data?.id
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
        error: error.message,
        details: error.stack,
        timestamp: new Date().toISOString()
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
