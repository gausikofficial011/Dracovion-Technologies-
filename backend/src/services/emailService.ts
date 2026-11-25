import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

// Lazy transporter creation
let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;

  // Option 1: Gmail OAuth2 via Google Cloud Project credentials
  if (env.GMAIL_USER && env.GMAIL_REFRESH_TOKEN && env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    logger.info('Initializing Gmail API transport via Google OAuth2 credentials...');
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: env.GMAIL_USER,
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        refreshToken: env.GMAIL_REFRESH_TOKEN,
      },
    });
    return transporter;
  }

  // Option 2: Gmail SMTP via 16-character Google App Password
  if (env.GMAIL_USER && env.GMAIL_APP_PASSWORD) {
    logger.info('Initializing Gmail SMTP transport via Google App Password...');
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.GMAIL_USER,
        pass: env.GMAIL_APP_PASSWORD,
      },
    });
    return transporter;
  }

  logger.warn('Gmail credentials not configured in .env (GMAIL_USER, GMAIL_APP_PASSWORD). Emails will be logged to console.');
  return null;
}

const FROM_HEADER = `"Dracovion Technologies" <${env.GMAIL_USER || 'no-reply@dracovion.com'}>`;

function getEmailTemplate(content: string, title = 'Dracovion Technologies'): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #050609; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #E7E9EE; }
    .wrapper { max-width: 600px; margin: 0 auto; background-color: #080A0E; border: 1px solid #D6A94F; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #0A0D13 0%, #11151D 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid #292E38; }
    .logo { color: #D6A94F; font-size: 24px; font-weight: 800; letter-spacing: 3px; }
    .subtitle { color: #9299A6; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; margin-top: 4px; }
    .body { padding: 36px 32px; }
    .footer { background-color: #050609; padding: 24px; text-align: center; font-size: 11px; color: #9299A6; border-top: 1px solid #292E38; }
    .otp-box { background: linear-gradient(135deg, #11151D 0%, #15191F 100%); border: 1.5px solid #FFBD55; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
    .otp-code { font-size: 36px; font-weight: 900; letter-spacing: 12px; color: #FFBD55; font-family: monospace; }
    .btn { display: inline-block; background: linear-gradient(90deg, #D6A94F 0%, #FFBD55 100%); color: #080A0E !important; padding: 14px 32px; border-radius: 10px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-size: 12px; letter-spacing: 1.5px; }
    .badge { display: inline-block; background: rgba(214, 169, 79, 0.15); border: 1px solid #D6A94F; color: #F5D18A; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-family: monospace; }
  </style>
</head>
<body>
  <div style="padding: 24px 12px;">
    <div class="wrapper">
      <div class="header">
        <div class="logo">DRACOVION&#174;</div>
        <div class="subtitle">Technologies &#8226; Tamil Nadu, India</div>
      </div>
      <div class="body">
        ${content}
      </div>
      <div class="footer">
        <p style="margin: 0 0 8px 0;">&#169; ${new Date().getFullYear()} Dracovion Technologies. Engineering the Future. Building Beyond Limits.</p>
        <p style="margin: 0; color: #626976;">This is an automated operational notification. Please do not reply directly.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Send a 6-digit OTP email for client email confirmation / login.
 */
export async function sendOTPEmail(to: string, otp: string, purpose: string): Promise<void> {
  const purposeText =
    purpose === 'email_verification'
      ? 'confirm your email address'
      : purpose === 'login'
      ? 'sign in to your Dracovion account'
      : 'reset your account password';

  const html = getEmailTemplate(`
    <h2 style="color: #FFFFFF; font-size: 20px; margin-top: 0;">Verification Code</h2>
    <p style="color: #B7BBC4; font-size: 14px; line-height: 1.6;">
      Use the one-time code below to ${purposeText}. This code is valid for <strong>15 minutes</strong>.
    </p>
    <div class="otp-box">
      <div style="color: #9299A6; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px;">Your 6-Digit OTP</div>
      <div class="otp-code">${otp}</div>
    </div>
    <p style="color: #9299A6; font-size: 12px; line-height: 1.5;">
      If you did not request this verification code, please ignore this email. No action is required and your account remains secure.
    </p>
  `, 'Your Dracovion Verification Code');

  await sendMail({
    to,
    subject: `[Dracovion] Your Verification Code: ${otp}`,
    html,
    text: `Your Dracovion Technologies verification code is ${otp}. It expires in 15 minutes.`,
  });
}

/**
 * Welcome email sent after client account confirmation.
 */
export async function sendWelcomeEmail(to: string, fullName: string): Promise<void> {
  const html = getEmailTemplate(`
    <h2 style="color: #FFFFFF; font-size: 22px; margin-top: 0;">Welcome, ${fullName}</h2>
    <p style="color: #B7BBC4; font-size: 14px; line-height: 1.6;">
      Your Dracovion Technologies client account has been successfully created and verified.
    </p>
    <p style="color: #B7BBC4; font-size: 14px; line-height: 1.6;">
      From your client portal, you can:
    </p>
    <ul style="color: #B7BBC4; font-size: 13px; line-height: 1.8;">
      <li>Place custom orders for websites, mobile apps, and enterprise software</li>
      <li>Track project progress and milestones in real-time</li>
      <li>Review transparent quotations and formal tax invoices</li>
      <li>Communicate directly with your assigned project engineers</li>
    </ul>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${env.CLIENT_URL}/portal/order/new" class="btn">Place Your First Order &#8594;</a>
    </div>
  `, 'Welcome to Dracovion Technologies');

  await sendMail({
    to,
    subject: `Welcome to Dracovion Technologies, ${fullName}!`,
    html,
    text: `Welcome to Dracovion Technologies, ${fullName}! Your account has been verified. Visit ${env.CLIENT_URL}/portal/dashboard to access your portal.`,
  });
}

/**
 * Sent to client when a project order is placed.
 */
export async function sendOrderConfirmationEmail(
  to: string,
  fullName: string,
  orderNumber: string,
  projectTitle: string
): Promise<void> {
  const html = getEmailTemplate(`
    <span class="badge">ORDER CONFIRMED</span>
    <h2 style="color: #FFFFFF; font-size: 20px; margin: 12px 0 8px 0;">We've Received Your Order</h2>
    <p style="color: #B7BBC4; font-size: 14px; line-height: 1.6;">
      Dear ${fullName}, thank you for choosing Dracovion Technologies. Your project order has been queued for immediate review.
    </p>
    <div style="background-color: #11151D; border: 1px solid #292E38; border-radius: 10px; padding: 18px; margin: 20px 0;">
      <div style="color: #9299A6; font-size: 11px; text-transform: uppercase;">Order Number</div>
      <div style="color: #FFBD55; font-size: 18px; font-weight: 700; font-family: monospace; margin: 2px 0 12px 0;">${orderNumber}</div>
      <div style="color: #9299A6; font-size: 11px; text-transform: uppercase;">Project Title</div>
      <div style="color: #FFFFFF; font-size: 14px; font-weight: 600;">${projectTitle}</div>
    </div>
    <p style="color: #B7BBC4; font-size: 13px; line-height: 1.6;">
      Our leadership team (Owner, CEO) and lead engineers have been notified. An engineer will be assigned to review your scope within 24 hours.
    </p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${env.CLIENT_URL}/portal/order/${orderNumber}" class="btn">Track Order Live &#8594;</a>
    </div>
  `, `Order Confirmed: ${orderNumber}`);

  await sendMail({
    to,
    subject: `[Dracovion] Order Received: ${orderNumber} - ${projectTitle}`,
    html,
    text: `Order ${orderNumber} received: ${projectTitle}. Track it at ${env.CLIENT_URL}/portal/order/${orderNumber}`,
  });
}

/**
 * Sent to staff (Owner, CEO, Employees) when a client places a new order.
 */
export async function sendStaffNewOrderNotification(
  to: string,
  staffName: string,
  orderNumber: string,
  projectTitle: string,
  clientName: string,
  category: string
): Promise<void> {
  const html = getEmailTemplate(`
    <span class="badge" style="border-color: #52D69A; color: #52D69A;">NEW CLIENT ORDER</span>
    <h2 style="color: #FFFFFF; font-size: 20px; margin: 12px 0 8px 0;">New Project Order Alert</h2>
    <p style="color: #B7BBC4; font-size: 14px; line-height: 1.6;">
      Hello ${staffName}, a new project order has just been submitted on the platform.
    </p>
    <div style="background-color: #11151D; border: 1px solid #292E38; border-radius: 10px; padding: 18px; margin: 20px 0;">
      <div style="color: #9299A6; font-size: 11px; text-transform: uppercase;">Order Number</div>
      <div style="color: #FFBD55; font-size: 18px; font-weight: 700; font-family: monospace; margin: 2px 0 10px 0;">${orderNumber}</div>
      <div style="color: #9299A6; font-size: 11px; text-transform: uppercase;">Client</div>
      <div style="color: #FFFFFF; font-size: 14px; font-weight: 600; margin-bottom: 10px;">${clientName}</div>
      <div style="color: #9299A6; font-size: 11px; text-transform: uppercase;">Project</div>
      <div style="color: #FFFFFF; font-size: 14px; font-weight: 600; margin-bottom: 10px;">${projectTitle}</div>
      <div style="color: #9299A6; font-size: 11px; text-transform: uppercase;">Category</div>
      <div style="color: #78BFFF; font-size: 13px; font-family: monospace;">${category}</div>
    </div>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${env.CLIENT_URL}/workspace/orders" class="btn">View &amp; Accept in Workspace &#8594;</a>
    </div>
  `, `New Order: ${orderNumber}`);

  await sendMail({
    to,
    subject: `[Workspace Alert] New Order ${orderNumber} placed by ${clientName}`,
    html,
    text: `New order ${orderNumber} (${projectTitle}) placed by ${clientName}. Check workspace at ${env.CLIENT_URL}/workspace/orders`,
  });
}

/**
 * Sent to client when order status changes.
 */
export async function sendOrderStatusUpdateEmail(
  to: string,
  fullName: string,
  orderNumber: string,
  projectTitle: string,
  newStatus: string,
  note: string
): Promise<void> {
  const html = getEmailTemplate(`
    <span class="badge">STATUS UPDATE</span>
    <h2 style="color: #FFFFFF; font-size: 20px; margin: 12px 0 8px 0;">Order Status Changed</h2>
    <p style="color: #B7BBC4; font-size: 14px; line-height: 1.6;">
      Dear ${fullName}, your project order <strong>${orderNumber}</strong> (${projectTitle}) has been updated.
    </p>
    <div style="background-color: #11151D; border: 1px solid #292E38; border-radius: 10px; padding: 18px; margin: 20px 0;">
      <div style="color: #9299A6; font-size: 11px; text-transform: uppercase;">New Status</div>
      <div style="color: #52D69A; font-size: 18px; font-weight: 700; text-transform: uppercase; margin: 4px 0 12px 0;">${newStatus.replace(/_/g, ' ')}</div>
      ${note ? `
        <div style="color: #9299A6; font-size: 11px; text-transform: uppercase;">Note from Team</div>
        <div style="color: #E7E9EE; font-size: 13px; line-height: 1.5; margin-top: 4px;">${note}</div>
      ` : ''}
    </div>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${env.CLIENT_URL}/portal/order/${orderNumber}" class="btn">View Order &#8594;</a>
    </div>
  `, `Order Update: ${orderNumber}`);

  await sendMail({
    to,
    subject: `[Dracovion] Status Update for Order ${orderNumber}: ${newStatus.replace(/_/g, ' ').toUpperCase()}`,
    html,
    text: `Status update for order ${orderNumber}: ${newStatus}. View at ${env.CLIENT_URL}/portal/order/${orderNumber}`,
  });
}

interface MailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

async function sendMail(opts: MailOptions): Promise<void> {
  try {
    const t = getTransporter();
    if (!t) {
      logger.info(`[DEV EMAIL to ${opts.to}]: ${opts.subject}\n${opts.text}`);
      return;
    }

    await t.sendMail({
      from: FROM_HEADER,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });
    logger.info(`Email successfully dispatched to ${opts.to}: "${opts.subject}"`);
  } catch (err: any) {
    logger.error(`Failed to send email to ${opts.to}: ${err.message}`);
    // Non-fatal: do not throw, email delivery failure should not crash API
  }
}
