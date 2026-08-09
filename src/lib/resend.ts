export interface SendEmailPayload {
  to: string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendBroadcastEmail(payload: SendEmailPayload): Promise<{ success: boolean; data?: any; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = payload.from || process.env.RESEND_FROM_EMAIL || 'updates@repopulse.ai';

  if (!apiKey) {
    console.log('[Resend Mock Dispatch] RESEND_API_KEY is not configured in .env.local.');
    console.log(`[Resend Mock Email] To: ${payload.to.join(', ')} | Subject: ${payload.subject}`);
    return {
      success: true,
      data: { id: 'mock_email_id_' + Date.now(), message: 'Mock email logged to server console.' }
    };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `Resend API returned status ${response.status}`,
      };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('Error dispatching email via Resend API:', err);
    return { success: false, error: err?.message || 'Failed to send email broadcast.' };
  }
}
