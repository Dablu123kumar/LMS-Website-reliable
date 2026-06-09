const nodemailer = require('nodemailer');

/**
 * Create a reusable nodemailer transporter.
 * Returns null if SMTP is not configured.
 */
function createTransporter() {
  const host = process.env.EMAIL_HOST;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!host || !user || !pass || user === 'your-email@gmail.com') {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: { user, pass },
  });
}

/**
 * Send LMS credentials to the student's email after purchase.
 * Returns true on success, false if SMTP not configured or send fails.
 */
async function sendCredentialEmail(to, username, password, courseTitle) {
  const transporter = createTransporter();
  if (!transporter) {
    console.log('[Mailer] SMTP not configured — skipping email to', to);
    return false;
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0; padding:0; background:#0a0c23; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:520px; margin:40px auto; background:linear-gradient(135deg,#141835,#0a0c23); border:1px solid rgba(99,102,241,0.3); border-radius:16px; padding:40px 32px; color:#fff;">
    <div style="text-align:center; margin-bottom:24px;">
      <span style="font-size:2rem;">🎓</span>
      <h1 style="font-size:1.5rem; margin:8px 0 0; background:linear-gradient(90deg,#6366f1,#06b6d4); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">
        Welcome to LearnHub!
      </h1>
    </div>

    <p style="color:rgba(255,255,255,0.75); font-size:0.95rem; line-height:1.6; text-align:center;">
      Your enrollment in <strong style="color:#06b6d4;">${courseTitle}</strong> is confirmed! Here are your LMS Dashboard login credentials.
    </p>

    <div style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:20px; margin:24px 0;">
      <table style="width:100%; border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0; color:rgba(255,255,255,0.5); font-size:0.9rem;">LMS Username</td>
          <td style="padding:8px 0; text-align:right; color:#06b6d4; font-weight:bold; font-size:0.95rem;">${username}</td>
        </tr>
        <tr>
          <td style="padding:8px 0; color:rgba(255,255,255,0.5); font-size:0.9rem;">LMS Password</td>
          <td style="padding:8px 0; text-align:right; color:#6366f1; font-weight:bold; font-size:0.95rem; font-family:monospace;">${password}</td>
        </tr>
      </table>
    </div>

    <div style="background:rgba(251,191,36,0.1); border:1px solid rgba(251,191,36,0.25); border-radius:8px; padding:12px 16px; margin-bottom:24px;">
      <p style="margin:0; color:#fbbf24; font-size:0.82rem;">
        ⚠️ Please save these credentials securely. The password cannot be recovered later.
      </p>
    </div>

    <div style="text-align:center;">
      <a href="${frontendUrl}/lms/login" style="display:inline-block; padding:12px 32px; background:#6366f1; color:#fff; text-decoration:none; border-radius:8px; font-weight:600; font-size:0.95rem; box-shadow:0 4px 12px rgba(99,102,241,0.3);">
        Go to LMS Dashboard →
      </a>
    </div>

    <hr style="border:none; border-top:1px solid rgba(255,255,255,0.08); margin:28px 0 16px;" />
    <p style="color:rgba(255,255,255,0.3); font-size:0.75rem; text-align:center; margin:0;">
      This is an automated email from LearnHub. Do not reply.
    </p>
  </div>
</body>
</html>
  `.trim();

  try {
    await transporter.sendMail({
      from: `"LearnHub" <${process.env.EMAIL_USER}>`,
      to,
      subject: `🎓 Your LMS Credentials — ${courseTitle}`,
      html,
    });
    console.log('[Mailer] Credential email sent to', to);
    return true;
  } catch (err) {
    console.error('[Mailer] Failed to send email:', err.message);
    return false;
  }
}

/**
 * Send an email alert to the admin's Gmail when a new inquiry is received.
 */
async function sendInquiryAlertEmail(inquiry) {
  const transporter = createTransporter();
  if (!transporter) {
    console.log('[Mailer] SMTP not configured — skipping inquiry alert email');
    return false;
  }

  const { name, email, phone, subject, course, message, type, createdAt } = inquiry;
  const adminEmail = process.env.EMAIL_USER; // send to self

  const formattedDate = new Date(createdAt || Date.now()).toLocaleString('en-US', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0; padding:0; background:#0a0c23; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:600px; margin:40px auto; background:linear-gradient(135deg,#141835,#0a0c23); border:1px solid rgba(99,102,241,0.3); border-radius:16px; padding:40px 32px; color:#fff;">
    <div style="text-align:center; margin-bottom:24px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:20px;">
      <span style="font-size:2rem;">📩</span>
      <h1 style="font-size:1.5rem; margin:8px 0 0; background:linear-gradient(90deg,#ff8c00,#ef4444); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">
        New Inquiry Received
      </h1>
      <p style="color:rgba(255,255,255,0.5); font-size:0.8rem; margin:4px 0 0;">Source: ${type.replace('_', ' ')}</p>
    </div>

    <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:10px; padding:24px; margin-bottom:24px;">
      <table style="width:100%; border-collapse:collapse;">
        <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
          <td style="padding:10px 0; color:rgba(255,255,255,0.4); font-size:0.85rem; width:140px;">Name</td>
          <td style="padding:10px 0; color:#fff; font-weight:bold; font-size:0.9rem;">${name}</td>
        </tr>
        <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
          <td style="padding:10px 0; color:rgba(255,255,255,0.4); font-size:0.85rem;">Email</td>
          <td style="padding:10px 0; color:#06b6d4; font-size:0.9rem;"><a href="mailto:${email}" style="color:#06b6d4; text-decoration:none;">${email}</a></td>
        </tr>
        <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
          <td style="padding:10px 0; color:rgba(255,255,255,0.4); font-size:0.85rem;">Phone</td>
          <td style="padding:10px 0; color:#10b981; font-weight:bold; font-size:0.9rem;">${phone || 'N/A'}</td>
        </tr>
        ${subject ? `
        <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
          <td style="padding:10px 0; color:rgba(255,255,255,0.4); font-size:0.85rem;">Subject</td>
          <td style="padding:10px 0; color:#fff; font-size:0.9rem;">${subject}</td>
        </tr>` : ''}
        ${course ? `
        <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
          <td style="padding:10px 0; color:rgba(255,255,255,0.4); font-size:0.85rem;">Course of Interest</td>
          <td style="padding:10px 0; color:#f59e0b; font-weight:bold; font-size:0.9rem;">${course}</td>
        </tr>` : ''}
        <tr>
          <td style="padding:10px 0; color:rgba(255,255,255,0.4); font-size:0.85rem;">Received At</td>
          <td style="padding:10px 0; color:rgba(255,255,255,0.6); font-size:0.85rem;">${formattedDate}</td>
        </tr>
      </table>
    </div>

    ${message ? `
    <div style="background:rgba(99,102,241,0.05); border:1px solid rgba(99,102,241,0.15); border-radius:10px; padding:20px; margin-bottom:24px;">
      <h3 style="margin:0 0 10px; font-size:0.85rem; color:#6366f1; text-transform:uppercase; letter-spacing:0.5px;">Message Detail</h3>
      <p style="margin:0; color:rgba(255,255,255,0.85); font-size:0.9rem; line-height:1.6; white-space:pre-wrap;">${message}</p>
    </div>` : ''}

    <div style="text-align:center; margin-top:32px;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/inquiries" style="display:inline-block; padding:12px 32px; background:#6366f1; color:#fff; text-decoration:none; border-radius:8px; font-weight:600; font-size:0.95rem; box-shadow:0 4px 12px rgba(99,102,241,0.3);">
        View on Admin Dashboard →
      </a>
    </div>

    <hr style="border:none; border-top:1px solid rgba(255,255,255,0.08); margin:28px 0 16px;" />
    <p style="color:rgba(255,255,255,0.3); font-size:0.75rem; text-align:center; margin:0;">
      LearnHub Notification Hub
    </p>
  </div>
</body>
</html>
  `.trim();

  try {
    await transporter.sendMail({
      from: `"LearnHub Notifications" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `🔔 New Lead/Inquiry: ${name} — ${subject || course || 'General Query'}`,
      html,
    });
    console.log('[Mailer] Inquiry alert email sent to admin:', adminEmail);
    return true;
  } catch (err) {
    console.error('[Mailer] Failed to send inquiry alert email:', err.message);
    return false;
  }
}

module.exports = { sendCredentialEmail, sendInquiryAlertEmail };
