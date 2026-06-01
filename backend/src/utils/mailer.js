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

module.exports = { sendCredentialEmail };
