import { NextResponse } from 'next/server';
import { generateReleaseNotes } from '@/lib/gemini';
import { MockStore } from '@/lib/mockStore';
import { sendBroadcastEmail } from '@/lib/resend';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const projectId = url.searchParams.get('project_id') || 'demo-project-123';

    const payload = await request.json();

    // Check if event is a GitHub push event with commits
    const commits = payload.commits || [];
    const ref = payload.ref || 'refs/heads/main';

    if (commits.length === 0) {
      return NextResponse.json({
        message: 'No commits detected in payload. Webhook acknowledged.',
        received: true
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

    // 2. Generate Release Notes using DeepSeek API (with Audience Tone setting)
    const tone = project?.audience_tone || 'technical';
    const generatedNotes = await generateReleaseNotes(repoName, formattedCommits, tone);

    // 3. Create Release entry
    const tag = `v1.${Date.now().toString().slice(-4)}`;
    const summary = formattedCommits[0]?.message || 'Automated GitHub push updates';

    const release = MockStore.addRelease(projectId, tag, summary, generatedNotes);

    // 4. Broadcast via Email to all Subscribers
    const subscribers = MockStore.getSubscribers(projectId);
    const subscriberEmails = subscribers.map(s => s.email);

    if (subscriberEmails.length > 0) {
      await sendBroadcastEmail({
        to: subscriberEmails,
        subject: `[${repoName}] Automated Release ${tag} is live!`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0b0f19; color: #f8fafc; padding: 24px; border-radius: 12px;">
            <h1 style="color: #6366f1; margin-top: 0;">🚀 Automatic Release: ${tag}</h1>
            <p style="color: #94a3b8;">Repository: <strong>${repoName}</strong> (${ref})</p>
            <p style="color: #94a3b8;">Audience Tone: <strong>${tone.toUpperCase()}</strong></p>
            <hr style="border-color: #1e293b;" />
            <div style="line-height: 1.6; font-size: 14px;">
              ${generatedNotes.replace(/\n/g, '<br/>')}
            </div>
            <hr style="border-color: #1e293b; margin-top: 24px;" />
            <p style="font-size: 11px; color: #64748b;">GitContextGen • Automated Release Engine</p>
          </div>
        `,
      });
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
