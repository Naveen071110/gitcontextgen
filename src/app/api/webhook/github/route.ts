import { NextResponse } from 'next/server';
import { generateReleaseNotes } from '@/lib/ai-engine';
import { MockStore } from '@/lib/mockStore';
import { sendBroadcastEmail } from '@/lib/resend';

export const dynamic = 'force-dynamic';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validates GitHub HMAC-SHA256 signature using Web Crypto API (Universal Edge & Node)
 */
async function verifyGitHubSignature(secret: string, headerSignature: string | null, rawBody: string): Promise<boolean> {
  if (!headerSignature || !headerSignature.startsWith('sha256=')) {
    return false;
  }
  const expectedSig = headerSignature.slice(7);
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));
  const hexSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  if (expectedSig.length !== hexSignature.length) return false;
  let diff = 0;
  for (let i = 0; i < hexSignature.length; i++) {
    diff |= expectedSig.charCodeAt(i) ^ hexSignature.charCodeAt(i);
  }
  return diff === 0;
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const projectId = url.searchParams.get('project_id') || 'demo-project-123';
    const signature = request.headers.get('x-hub-signature-256');
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;

    const rawBody = await request.text();

    // 0. Enforce HMAC Signature Security if secret is configured
    if (webhookSecret) {
      const isValid = await verifyGitHubSignature(webhookSecret, signature, rawBody);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Unauthorized: Invalid or missing X-Hub-Signature-256 HMAC signature.' },
          { status: 401 }
        );
      }
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    // Check if event is a GitHub push event with commits
    const commits = payload.commits || [];
    const ref = payload.ref || 'refs/heads/main';

    if (commits.length === 0) {
      return NextResponse.json({
        message: 'No commits detected in payload. Webhook acknowledged.',
        received: true,
      });
    }

    const project = MockStore.getProjectById(projectId);
    const repoName = payload.repository?.full_name || (project ? project.repo_url.replace('https://github.com/', '') : 'repository');

    // 1. Format commit messages
    const formattedCommits = commits.map((c: any) => ({
      message: c.message || 'Updated code',
      author: c.author?.name || c.committer?.name || 'Developer',
      sha: c.id ? c.id.substring(0, 7) : undefined,
    }));

    // 2. Generate Release Notes using AI Engine (with Audience Tone setting)
    const tone = project?.audience_tone || 'technical';
    const generatedNotes = await generateReleaseNotes(repoName, formattedCommits, tone);

    // 3. Create Release entry
    const tag = `v1.${Date.now().toString().slice(-4)}`;
    const summary = formattedCommits[0]?.message || 'Automated GitHub push updates';

    const release = MockStore.addRelease(projectId, tag, summary, generatedNotes);

    // 4. Broadcast via Email to all Subscribers individually for privacy & reliability
    const subscribers = MockStore.getSubscribers(projectId);
    const subscriberEmails = subscribers.map((s) => s.email).filter(Boolean);

    if (subscriberEmails.length > 0) {
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0b0f19; color: #f8fafc; padding: 24px; border-radius: 12px;">
          <h1 style="color: #6366f1; margin-top: 0;">🚀 Automatic Release: ${escapeHtml(tag)}</h1>
          <p style="color: #94a3b8;">Repository: <strong>${escapeHtml(repoName)}</strong> (${escapeHtml(ref)})</p>
          <p style="color: #94a3b8;">Audience Tone: <strong>${escapeHtml(tone.toUpperCase())}</strong></p>
          <hr style="border-color: #1e293b;" />
          <div style="line-height: 1.6; font-size: 14px;">
            ${escapeHtml(generatedNotes).replace(/\n/g, '<br/>')}
          </div>
          <hr style="border-color: #1e293b; margin-top: 24px;" />
          <p style="font-size: 11px; color: #64748b;">GitContextGen • Automated Release Engine</p>
        </div>
      `;

      // Broadcast individual emails to prevent subscriber email disclosure
      await Promise.allSettled(
        subscriberEmails.slice(0, 50).map((email) =>
          sendBroadcastEmail({
            to: [email],
            subject: `[${repoName}] Automated Release ${tag} is live!`,
            html: emailHtml,
          })
        )
      );
    }

    return NextResponse.json({
      success: true,
      releaseId: release.id,
      versionTag: tag,
      subscribersNotified: subscriberEmails.length,
    });
  } catch (err: any) {
    console.error('Error handling GitHub push webhook:', err);
    return NextResponse.json(
      { error: err?.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
