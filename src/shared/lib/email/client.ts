// ============================================
// OCCHIALE - Email Client (Resend)
// Transactional email sending
// ============================================

/**
 * Lightweight email client using Resend HTTP API.
 * No SDK dependency — uses fetch directly.
 *
 * Requires RESEND_API_KEY environment variable.
 * Default from: noreply@occhiale.com.br (configurable via RESEND_FROM_EMAIL)
 */

const RESEND_API_URL = "https://api.resend.com/emails";

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
}

interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

export async function sendEmail(
  params: SendEmailParams
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — email not sent:", params.subject);
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  const fromEmail =
    params.from ??
    process.env.RESEND_FROM_EMAIL ??
    "Occhiale <noreply@occhiale.com.br>";

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: Array.isArray(params.to) ? params.to : [params.to],
        subject: params.subject,
        html: params.html,
        text: params.text,
        reply_to: params.replyTo,
        tags: params.tags,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Resend API error:", response.status, errorBody);
      return {
        success: false,
        error: `Resend API error: ${response.status}`,
      };
    }

    const data = (await response.json()) as { id: string };
    return { success: true, id: data.id };
  } catch (err) {
    console.error("Failed to send email:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
