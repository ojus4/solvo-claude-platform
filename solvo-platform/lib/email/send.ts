// lib/email/send.ts
// SERVER SIDE ONLY — never import this file in client components

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
const FROM_NAME = process.env.RESEND_FROM_NAME ?? "SOLVO";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const FROM_ADDRESS = `${FROM_NAME} <${FROM_EMAIL}>`;

type EmailResult = Promise<{ success: boolean; error?: string }>;

// ─────────────────────────────────────────────────────────────────────────────
// Shared HTML building blocks
// ─────────────────────────────────────────────────────────────────────────────

function htmlWrapper(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SOLVO</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
          ${body}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function logoHeader(): string {
  return `
  <tr>
    <td style="background-color:#1B4FFF;padding:24px 32px;">
      <span style="font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">SOLVO</span>
    </td>
  </tr>`;
}

function ctaButton(label: string, href: string, color: string = "#1B4FFF"): string {
  return `
  <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td>
        <a href="${href}" target="_blank"
           style="display:inline-block;background-color:${color};color:#ffffff;text-decoration:none;
                  font-size:15px;font-weight:700;padding:12px 24px;border-radius:6px;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;
}

function sharedFooter(): string {
  return `
  <tr>
    <td style="padding:24px 32px;border-top:1px solid #e5e7eb;">
      <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">
        Questions? Reply to this email — we read every message.
      </p>
      <p style="margin:0 0 8px;font-size:13px;color:#6b7280;font-weight:600;">
        SOLVO — Career Guidance for Indian Students
      </p>
      <p style="margin:0;font-size:12px;color:#9ca3af;">
        You received this because you signed up at solvo.in
      </p>
    </td>
  </tr>`;
}

function getISTDateTime(): string {
  return new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getISTDate(): string {
  return new Date().toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNCTION 1: sendWelcomeEmail
// ─────────────────────────────────────────────────────────────────────────────

export async function sendWelcomeEmail({
  to,
  fullName,
}: {
  to: string;
  fullName: string;
}): EmailResult {
  const greeting = fullName?.trim() ? fullName.trim() : "there";

  const html = htmlWrapper(`
    ${logoHeader()}
    <tr>
      <td style="padding:32px 32px 0;">
        <h1 style="margin:0 0 16px;font-size:22px;color:#111827;">Hi ${greeting}! 👋</h1>
        <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
          Welcome to SOLVO — India's first career intelligence platform built specifically
          for students like you.
        </p>
        <p style="margin:0 0 8px;font-size:15px;color:#374151;line-height:1.6;">
          You now have access to three powerful free tools:
        </p>
        <table cellpadding="0" cellspacing="0" style="margin:8px 0 20px;">
          <tr>
            <td style="padding:6px 0;">
              <span style="color:#1B4FFF;font-weight:700;">✦</span>
              <span style="font-size:14px;color:#374151;margin-left:8px;">
                <strong>Career Assessment</strong> — Discover your personality, interests, and aptitude
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;">
              <span style="color:#1B4FFF;font-weight:700;">✦</span>
              <span style="font-size:14px;color:#374151;margin-left:8px;">
                <strong>Skill Library</strong> — Find the exact courses employers want
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;">
              <span style="color:#1B4FFF;font-weight:700;">✦</span>
              <span style="font-size:14px;color:#374151;margin-left:8px;">
                <strong>Job Market Analyzer</strong> — See real hiring trends across Indian cities
              </span>
            </td>
          </tr>
        </table>
        <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
          Your next step is to take the <strong>free career assessment</strong>. It takes about
          28 minutes and will tell you exactly which careers suit you best.
        </p>
        ${ctaButton("Start Your Free Assessment →", `${SITE_URL}/test`)}
      </td>
    </tr>
    ${sharedFooter()}
  `);

  const text = `Hi ${greeting}!

Welcome to SOLVO — India's first career intelligence platform built specifically for students like you.

You now have access to three powerful free tools:
- Career Assessment — Discover your personality, interests, and aptitude
- Skill Library — Find the exact courses employers want
- Job Market Analyzer — See real hiring trends across Indian cities

Your next step is to take the free career assessment. It takes about 28 minutes and will tell you exactly which careers suit you best.

Start your assessment here: ${SITE_URL}/test

Questions? Reply to this email — we read every message.
SOLVO — Career Guidance for Indian Students
You received this because you signed up at solvo.in`;

  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to, // <--- OVERRIDE FOR TESTING
      subject: "Welcome to SOLVO — Your Career Journey Starts Here",
      html,
      text,
    });

    if (error) {
      console.error("[sendWelcomeEmail] Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[sendWelcomeEmail] Caught exception:", message);
    return { success: false, error: message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNCTION 2: sendAssessmentCompleteEmail
// ─────────────────────────────────────────────────────────────────────────────

export async function sendAssessmentCompleteEmail({
  to,
  fullName,
  recommendedCareers,
}: {
  to: string;
  fullName: string;
  recommendedCareers: string[];
}): EmailResult {
  const greeting = fullName?.trim() || "there";

  const careerListHTML = recommendedCareers
    .map(
      (career) => `
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#374151;">
          ✅ <strong>${career}</strong>
        </td>
      </tr>`
    )
    .join("");

  const careerListText = recommendedCareers.map((c) => `  ✓ ${c}`).join("\n");

  const html = htmlWrapper(`
    ${logoHeader()}
    <tr>
      <td style="padding:32px 32px 0;">
        <h1 style="margin:0 0 16px;font-size:22px;color:#111827;">Hi ${greeting},</h1>
        <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
          🎉 <strong>Congratulations!</strong> You have completed your career assessment.
        </p>
        <p style="margin:0 0 12px;font-size:15px;color:#374151;line-height:1.6;">
          Based on your personality, interests, and aptitude, your top career matches are:
        </p>
        <table cellpadding="0" cellspacing="0" style="margin:0 0 20px;padding:16px;background-color:#f0f4ff;border-radius:6px;width:100%;">
          ${careerListHTML}
        </table>
        <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
          Your full report — including your <strong>personality profile</strong>,
          <strong>interest analysis</strong>, and <strong>aptitude breakdown</strong> — is ready
          to download from your dashboard.
        </p>
        ${ctaButton("View My Results →", `${SITE_URL}/dashboard`)}
        
        <!-- Upgrade upsell box -->
        <table cellpadding="0" cellspacing="0" style="width:100%;margin:8px 0 24px;background-color:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;">
          <tr>
            <td style="padding:24px;">
              <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#111827;">
                Want to unlock your complete career roadmap?
              </p>
              <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">
                The <strong>Achiever Plan</strong> includes your step-by-step roadmap,
                all premium career reports, and private community access.
              </p>
              <p style="margin:0 0 16px;font-size:16px;font-weight:800;color:#1B4FFF;">
                Achiever Plan — ₹99 one-time
              </p>
              ${ctaButton("Unlock My Roadmap →", `${SITE_URL}/checkout`, "#FF6B35")}
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ${sharedFooter()}
  `);

  const text = `Hi ${greeting},

Congratulations! You have completed your career assessment.

Based on your personality, interests, and aptitude, your top career matches are:
${careerListText}

Your full report — including your personality profile, interest analysis, and aptitude breakdown — is ready to download from your dashboard.

View your results: ${SITE_URL}/dashboard

---
Want to unlock your complete career roadmap?

The Achiever Plan includes your step-by-step roadmap, all premium career reports, and private community access.
Achiever Plan — ₹99 one-time

Unlock your roadmap: ${SITE_URL}/checkout

---
Questions? Reply to this email — we read every message.
SOLVO — Career Guidance for Indian Students
You received this because you signed up at solvo.in`;

  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: "Your SOLVO Career Report is Ready",
      html,
      text,
    });

    if (error) {
      console.error("[sendAssessmentCompleteEmail] Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[sendAssessmentCompleteEmail] Caught exception:", message);
    return { success: false, error: message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNCTION 3: sendApplicationReceivedEmail
// ─────────────────────────────────────────────────────────────────────────────

export async function sendApplicationReceivedEmail({
  to,
  fullName,
  tier,
}: {
  to: string;
  fullName: string;
  tier: "achiever" | "accelerator";
}): EmailResult {
  const greeting = fullName?.trim() || "there";
  const tierLabel =
    tier === "achiever" ? "Achiever (₹99)" : "Accelerator (₹999/month)";

  const html = htmlWrapper(`
    ${logoHeader()}
    <tr>
      <td style="padding:32px 32px 0;">
        <h1 style="margin:0 0 16px;font-size:22px;color:#111827;">Hi ${greeting},</h1>
        <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
          Thank you for applying for the SOLVO <strong>${tierLabel}</strong> Plan!
        </p>
        <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
          We review all applications personally and will get back to you
          <strong>within 48 hours</strong>.
        </p>
        <p style="margin:0 0 12px;font-size:15px;color:#374151;">
          If you are selected, we will send you:
        </p>
        <table cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
          <tr>
            <td style="padding:5px 0;font-size:14px;color:#374151;">
              📋 Your personalised onboarding instructions
            </td>
          </tr>
          <tr>
            <td style="padding:5px 0;font-size:14px;color:#374151;">
              💳 Payment details (UPI / bank transfer)
            </td>
          </tr>
          <tr>
            <td style="padding:5px 0;font-size:14px;color:#374151;">
              ⚡ Access to your premium features immediately after payment
            </td>
          </tr>
        </table>
        <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
          In the meantime, you can continue using SOLVO's free tools:
        </p>
        ${ctaButton("Go to My Dashboard →", `${SITE_URL}/dashboard`)}
        <p style="margin:0 0 32px;font-size:14px;color:#6b7280;">
          Have questions? WhatsApp us or reply to this email.
        </p>
      </td>
    </tr>
    ${sharedFooter()}
  `);

  const text = `Hi ${greeting},

Thank you for applying for the SOLVO ${tierLabel} Plan!

We review all applications personally and will get back to you within 48 hours.

If you are selected, we will send you:
- Your personalised onboarding instructions
- Payment details (UPI / bank transfer)
- Access to your premium features immediately after payment

In the meantime, you can continue using SOLVO's free tools:
${SITE_URL}/dashboard

Have questions? WhatsApp us or reply to this email.

---
Questions? Reply to this email — we read every message.
SOLVO — Career Guidance for Indian Students
You received this because you signed up at solvo.in`;

  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: "We received your SOLVO application",
      html,
      text,
    });

    if (error) {
      console.error("[sendApplicationReceivedEmail] Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[sendApplicationReceivedEmail] Caught exception:", message);
    return { success: false, error: message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNCTION 4: sendAdminNewApplicationAlert
// ─────────────────────────────────────────────────────────────────────────────

export async function sendAdminNewApplicationAlert({
  applicantEmail,
  applicantName,
  tier,
  message,
  source,
}: {
  applicantEmail: string;
  applicantName: string;
  tier: "achiever" | "accelerator";
  message?: string;
  source?: string;
}): EmailResult {
  const adminTo = process.env.RESEND_FROM_EMAIL ?? "";
  const timestamp = getISTDateTime();

  const tierDisplay = tier === "achiever" ? "Achiever (₹99)" : "Accelerator (₹999/month)";

  const html = htmlWrapper(`
    <tr>
      <td style="padding:24px 32px;background-color:#1B4FFF;">
        <span style="font-size:22px;font-weight:900;color:#ffffff;">SOLVO Admin Alert</span>
      </td>
    </tr>
    <tr>
      <td style="padding:32px;">
        <h2 style="margin:0 0 20px;font-size:18px;color:#111827;">
          🔔 New Plan Application Received
        </h2>
        <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:10px 12px;font-size:13px;font-weight:700;color:#6b7280;background-color:#f9fafb;width:30%;">Name</td>
            <td style="padding:10px 12px;font-size:14px;color:#111827;">${applicantName}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:10px 12px;font-size:13px;font-weight:700;color:#6b7280;background-color:#f9fafb;">Email</td>
            <td style="padding:10px 12px;font-size:14px;color:#111827;">
              <a href="mailto:${applicantEmail}" style="color:#1B4FFF;">${applicantEmail}</a>
            </td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:10px 12px;font-size:13px;font-weight:700;color:#6b7280;background-color:#f9fafb;">Tier Applied</td>
            <td style="padding:10px 12px;font-size:14px;color:#111827;">${tierDisplay}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:10px 12px;font-size:13px;font-weight:700;color:#6b7280;background-color:#f9fafb;">Message</td>
            <td style="padding:10px 12px;font-size:14px;color:#111827;">${message ?? "No message provided"}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:10px 12px;font-size:13px;font-weight:700;color:#6b7280;background-color:#f9fafb;">Source</td>
            <td style="padding:10px 12px;font-size:14px;color:#111827;">${source ?? "Unknown"}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;font-size:13px;font-weight:700;color:#6b7280;background-color:#f9fafb;">Time (IST)</td>
            <td style="padding:10px 12px;font-size:14px;color:#111827;">${timestamp}</td>
          </tr>
        </table>

        ${ctaButton("View All Applications →", `${SITE_URL}/admin/users`)}

        <p style="margin:0;font-size:13px;color:#6b7280;">
          Reply directly to this email to contact the applicant.
        </p>
      </td>
    </tr>
  `);

  const text = `🔔 New Plan Application Received

Name: ${applicantName}
Email: ${applicantEmail}
Tier Applied: ${tierDisplay}
Message: ${message ?? "No message provided"}
Source: ${source ?? "Unknown"}
Time (IST): ${timestamp}

View all applications: ${SITE_URL}/admin/users

Reply to this email to contact the applicant directly.`;

  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: adminTo,
      replyTo: applicantEmail,
      subject: `🔔 New SOLVO Application — ${tier} from ${applicantName}`,
      html,
      text,
    });

    if (error) {
      console.error("[sendAdminNewApplicationAlert] Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[sendAdminNewApplicationAlert] Caught exception:", message);
    return { success: false, error: message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNCTION 5: sendPaymentConfirmationEmail
// ─────────────────────────────────────────────────────────────────────────────

export async function sendPaymentConfirmationEmail({
  to,
  fullName,
  tier,
  amountPaise,
  orderId,
}: {
  to: string;
  fullName: string;
  tier: "achiever" | "accelerator";
  amountPaise: number;
  orderId: string;
}): EmailResult {
  const greeting = fullName?.trim() || "there";
  const amountINR = (amountPaise / 100).toLocaleString("en-IN");
  const tierLabel = tier === "achiever" ? "Achiever" : "Accelerator";
  const currentDate = getISTDate();

  const achieverFeatures = `
    <tr><td style="padding:5px 0;font-size:14px;color:#374151;">✅ Your complete career roadmap (step-by-step)</td></tr>
    <tr><td style="padding:5px 0;font-size:14px;color:#374151;">✅ Full personality, interest, and aptitude analysis</td></tr>
    <tr><td style="padding:5px 0;font-size:14px;color:#374151;">✅ All 5 career path roadmaps</td></tr>
    <tr><td style="padding:5px 0;font-size:14px;color:#374151;">✅ 12 months of job market data</td></tr>
    <tr><td style="padding:5px 0;font-size:14px;color:#374151;">✅ Private SOLVO community access</td></tr>
  `;

  const acceleratorFeatures = `
    ${achieverFeatures}
    <tr><td style="padding:5px 0;font-size:14px;color:#374151;">✅ Personal career coach assigned to you</td></tr>
    <tr><td style="padding:5px 0;font-size:14px;color:#374151;">✅ 1-on-1 monthly coaching sessions</td></tr>
    <tr><td style="padding:5px 0;font-size:14px;color:#374151;">✅ Mock interview preparation</td></tr>
    <tr><td style="padding:5px 0;font-size:14px;color:#374151;">✅ Daily study schedule planning</td></tr>
  `;

  const featuresHTML =
    tier === "achiever" ? achieverFeatures : acceleratorFeatures;

  const achieverFeaturesText = [
    "✓ Your complete career roadmap (step-by-step)",
    "✓ Full personality, interest, and aptitude analysis",
    "✓ All 5 career path roadmaps",
    "✓ 12 months of job market data",
    "✓ Private SOLVO community access",
  ];

  const acceleratorFeaturesText = [
    ...achieverFeaturesText,
    "✓ Personal career coach assigned to you",
    "✓ 1-on-1 monthly coaching sessions",
    "✓ Mock interview preparation",
    "✓ Daily study schedule planning",
  ];

  const featuresText = (
    tier === "achiever" ? achieverFeaturesText : acceleratorFeaturesText
  ).join("\n");

  const html = htmlWrapper(`
    ${logoHeader()}
    <tr>
      <td style="padding:32px 32px 0;">
        <h1 style="margin:0 0 8px;font-size:22px;color:#111827;">Hi ${greeting},</h1>

        <!-- Success banner -->
        <table cellpadding="0" cellspacing="0" style="width:100%;margin:16px 0 24px;background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;">
          <tr>
            <td style="padding:16px 20px;">
              <p style="margin:0;font-size:16px;font-weight:700;color:#15803d;">
                ✅ Your payment has been confirmed!
              </p>
            </td>
          </tr>
        </table>

        <!-- Receipt box -->
        <table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 24px;background-color:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;">
          <tr>
            <td style="padding:20px;">
              <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">
                Payment Receipt
              </p>
              <table cellpadding="0" cellspacing="0" style="width:100%;">
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#6b7280;width:40%;">Plan</td>
                  <td style="padding:6px 0;font-size:14px;font-weight:600;color:#111827;">SOLVO ${tierLabel}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#6b7280;">Amount paid</td>
                  <td style="padding:6px 0;font-size:14px;font-weight:600;color:#111827;">₹${amountINR}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#6b7280;">Order ID</td>
                  <td style="padding:6px 0;font-size:14px;font-weight:600;color:#111827;word-break:break-all;">${orderId}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#6b7280;">Date</td>
                  <td style="padding:6px 0;font-size:14px;font-weight:600;color:#111827;">${currentDate}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <p style="margin:0 0 12px;font-size:15px;color:#374151;line-height:1.6;">
          Your <strong>${tierLabel}</strong> plan is now active.
          Here is what you can access right now:
        </p>
        <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
          ${featuresHTML}
        </table>

        ${ctaButton("Access My Dashboard →", `${SITE_URL}/dashboard`)}
      </td>
    </tr>

    <tr>
      <td style="padding:24px 32px;border-top:1px solid #e5e7eb;">
        <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">
          Keep this email as your payment receipt.
        </p>
        <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">
          Questions? Reply to this email.
        </p>
        <p style="margin:0 0 8px;font-size:13px;color:#6b7280;font-weight:600;">
          SOLVO — Career Guidance for Indian Students
        </p>
        <p style="margin:0;font-size:12px;color:#9ca3af;">
          You received this because you signed up at solvo.in
        </p>
      </td>
    </tr>
  `);

  const text = `Hi ${greeting},

✅ Your payment has been confirmed!

PAYMENT RECEIPT
───────────────
Plan:       SOLVO ${tierLabel}
Amount:     ₹${amountINR}
Order ID:   ${orderId}
Date:       ${currentDate}

Your ${tierLabel} plan is now active. Here is what you can access right now:

${featuresText}

Access your dashboard: ${SITE_URL}/dashboard

---
Keep this email as your payment receipt.
Questions? Reply to this email.
SOLVO — Career Guidance for Indian Students
You received this because you signed up at solvo.in`;

  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: `Payment Confirmed — Welcome to SOLVO ${tierLabel}!`,
      html,
      text,
    });

    if (error) {
      console.error("[sendPaymentConfirmationEmail] Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[sendPaymentConfirmationEmail] Caught exception:", message);
    return { success: false, error: message };
  }
}