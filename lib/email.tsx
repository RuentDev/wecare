import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@denteria.com";
const CLINIC_NAME = "Denteria Dental Clinic";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${CLINIC_NAME} <${FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      console.error("Email send error:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

// Email Templates
export function appointmentConfirmationEmail(data: {
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  serviceName: string;
  dentistName: string;
  locationName: string;
  locationAddress: string;
}) {
  const subject = `Appointment Confirmation - ${data.appointmentDate}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #18afd3 0%, #0d8fb0 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Denteria</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Your Trusted Dental Care Partner</p>
  </div>
  
  <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
    <h2 style="color: #18afd3; margin-top: 0;">Appointment Confirmed!</h2>
    
    <p>Dear ${data.patientName},</p>
    
    <p>Your dental appointment has been successfully scheduled. Here are the details:</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #18afd3; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #666; width: 120px;">Date:</td>
          <td style="padding: 8px 0; font-weight: 600;">${data.appointmentDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Time:</td>
          <td style="padding: 8px 0; font-weight: 600;">${data.appointmentTime}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Service:</td>
          <td style="padding: 8px 0; font-weight: 600;">${data.serviceName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Dentist:</td>
          <td style="padding: 8px 0; font-weight: 600;">${data.dentistName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Location:</td>
          <td style="padding: 8px 0; font-weight: 600;">${data.locationName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Address:</td>
          <td style="padding: 8px 0;">${data.locationAddress}</td>
        </tr>
      </table>
    </div>
    
    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; color: #92400e;"><strong>Important Reminders:</strong></p>
      <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #92400e;">
        <li>Please arrive 10-15 minutes before your scheduled appointment</li>
        <li>Bring your insurance card and valid ID</li>
        <li>If you need to cancel or reschedule, please do so at least 24 hours in advance</li>
      </ul>
    </div>
    
    <p>If you have any questions, please don't hesitate to contact us.</p>
    
    <p>We look forward to seeing you!</p>
    
    <p style="margin-bottom: 0;">Best regards,<br><strong>The Denteria Team</strong></p>
  </div>
  
  <div style="background: #1e293b; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
    <p style="color: #94a3b8; margin: 0; font-size: 14px;">
      Denteria Dental Clinic<br>
      Phone: (555) 123-4567 | Email: contact@denteria.com
    </p>
  </div>
</body>
</html>
  `;

  const text = `
Appointment Confirmation - Denteria Dental Clinic

Dear ${data.patientName},

Your dental appointment has been successfully scheduled.

Appointment Details:
- Date: ${data.appointmentDate}
- Time: ${data.appointmentTime}
- Service: ${data.serviceName}
- Dentist: ${data.dentistName}
- Location: ${data.locationName}
- Address: ${data.locationAddress}

Important Reminders:
- Please arrive 10-15 minutes before your scheduled appointment
- Bring your insurance card and valid ID
- If you need to cancel or reschedule, please do so at least 24 hours in advance

If you have any questions, please don't hesitate to contact us.

We look forward to seeing you!

Best regards,
The Denteria Team

Denteria Dental Clinic
Phone: (555) 123-4567 | Email: contact@denteria.com
  `;

  return { subject, html, text };
}

export function appointmentReminderEmail(data: {
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  serviceName: string;
  dentistName: string;
  locationName: string;
  locationAddress: string;
}) {
  const subject = `Reminder: Dental Appointment Tomorrow - ${data.appointmentTime}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #18afd3 0%, #0d8fb0 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Denteria</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Appointment Reminder</p>
  </div>
  
  <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
    <h2 style="color: #18afd3; margin-top: 0;">Your Appointment is Tomorrow!</h2>
    
    <p>Dear ${data.patientName},</p>
    
    <p>This is a friendly reminder about your upcoming dental appointment.</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #18afd3; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #666; width: 120px;">Date:</td>
          <td style="padding: 8px 0; font-weight: 600;">${data.appointmentDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Time:</td>
          <td style="padding: 8px 0; font-weight: 600;">${data.appointmentTime}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Service:</td>
          <td style="padding: 8px 0; font-weight: 600;">${data.serviceName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Dentist:</td>
          <td style="padding: 8px 0; font-weight: 600;">${data.dentistName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Location:</td>
          <td style="padding: 8px 0; font-weight: 600;">${data.locationName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Address:</td>
          <td style="padding: 8px 0;">${data.locationAddress}</td>
        </tr>
      </table>
    </div>
    
    <p>Please remember to arrive 10-15 minutes early and bring your insurance card and valid ID.</p>
    
    <p>We look forward to seeing you!</p>
    
    <p style="margin-bottom: 0;">Best regards,<br><strong>The Denteria Team</strong></p>
  </div>
  
  <div style="background: #1e293b; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
    <p style="color: #94a3b8; margin: 0; font-size: 14px;">
      Need to reschedule? Contact us at (555) 123-4567
    </p>
  </div>
</body>
</html>
  `;

  return { subject, html };
}

export function appointmentCancellationEmail(data: {
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  serviceName: string;
}) {
  const subject = `Appointment Cancelled - ${data.appointmentDate}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #18afd3 0%, #0d8fb0 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Denteria</h1>
  </div>
  
  <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
    <h2 style="color: #dc2626; margin-top: 0;">Appointment Cancelled</h2>
    
    <p>Dear ${data.patientName},</p>
    
    <p>Your dental appointment has been cancelled as requested.</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626; margin: 20px 0;">
      <p style="margin: 0;"><strong>Cancelled Appointment:</strong></p>
      <p style="margin: 10px 0 0 0;">
        ${data.serviceName}<br>
        ${data.appointmentDate} at ${data.appointmentTime}
      </p>
    </div>
    
    <p>If you'd like to reschedule, please visit our website or give us a call.</p>
    
    <p style="margin-bottom: 0;">Best regards,<br><strong>The Denteria Team</strong></p>
  </div>
  
  <div style="background: #1e293b; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
    <p style="color: #94a3b8; margin: 0; font-size: 14px;">
      Denteria Dental Clinic | (555) 123-4567
    </p>
  </div>
</body>
</html>
  `;

  return { subject, html };
}

// Send appointment confirmation
export async function sendAppointmentConfirmation(
  email: string,
  data: Parameters<typeof appointmentConfirmationEmail>[0],
) {
  const { subject, html, text } = appointmentConfirmationEmail(data);
  return sendEmail({ to: email, subject, html, text });
}

// Send appointment reminder
export async function sendAppointmentReminder(
  email: string,
  data: Parameters<typeof appointmentReminderEmail>[0],
) {
  const { subject, html } = appointmentReminderEmail(data);
  return sendEmail({ to: email, subject, html });
}

// Send cancellation notice
export async function sendAppointmentCancellation(
  email: string,
  data: Parameters<typeof appointmentCancellationEmail>[0],
) {
  const { subject, html } = appointmentCancellationEmail(data);
  return sendEmail({ to: email, subject, html });
}

export function passwordResetEmail(data: {
  userName: string;
  resetLink: string;
}) {
  const subject = "Reset Your Denteria Password";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #18afd3 0%, #0d8fb0 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Denteria</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Security Notification</p>
  </div>
  
  <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
    <h2 style="color: #18afd3; margin-top: 0;">Password Reset Request</h2>
    
    <p>Dear ${data.userName},</p>
    
    <p>We received a request to reset the password for your Denteria account. Click the button below to set a new password:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.resetLink}" style="background-color: #18afd3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
    </div>
    
    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; color: #92400e; font-size: 14px;"><strong>Note:</strong> This link will expire in 1 hour. If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
    </div>
    
    <p>If the button doesn't work, copy and paste the following link into your browser:</p>
    <p style="word-break: break-all; font-size: 14px; color: #666;">${data.resetLink}</p>
    
    <p style="margin-bottom: 0;">Best regards,<br><strong>The Denteria Team</strong></p>
  </div>
  
  <div style="background: #1e293b; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
    <p style="color: #94a3b8; margin: 0; font-size: 14px;">
      Denteria Dental Clinic<br>
      This is an automated message, please do not reply.
    </p>
  </div>
</body>
</html>
  `;

  const text = `
Reset Your Denteria Password

Dear ${data.userName},

We received a request to reset the password for your Denteria account. 
Please use the link below to set a new password (the link expires in 1 hour):

${data.resetLink}

If you did not request a password reset, please ignore this email.

Best regards,
The Denteria Team
  `;

  return { subject, html, text };
}

// Send password reset link
export async function sendPasswordResetLink(
  email: string,
  data: Parameters<typeof passwordResetEmail>[0],
) {
  const { subject, html, text } = passwordResetEmail(data);
  return sendEmail({ to: email, subject, html, text });
}
