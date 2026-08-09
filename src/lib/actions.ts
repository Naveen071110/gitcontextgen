'use server';

import { parseGitHubUrl, fetchGitHubRepoDetails } from './github';
import { generateClaudeContext, generateMermaidArchitecture, generateReleaseNotes } from './ai-engine';
import { RepositoryAnalysisResult } from './types';
import { MockStore } from './mockStore';
import { sendBroadcastEmail } from './resend';

// Global in-memory cache for analyzed repositories (24-hour TTL with max size limit)
const analysisCache = new Map<string, { data: RepositoryAnalysisResult; timestamp: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_CACHE_SIZE = 100;

function setInCache(key: string, value: { data: RepositoryAnalysisResult; timestamp: number }) {
  if (analysisCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = analysisCache.keys().next().value;
    if (oldestKey) analysisCache.delete(oldestKey);
  }
  analysisCache.set(key, value);
}

export async function analyzeRepositoryAction(repoUrl: string, userToken?: string): Promise<{ success: boolean; data?: RepositoryAnalysisResult; cached?: boolean; error?: string }> {
  try {
    if (!repoUrl || typeof repoUrl !== 'string') {
      return { success: false, error: 'Please enter a valid GitHub repository URL.' };
    }

    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      return { success: false, error: 'Invalid GitHub URL. Format example: https://github.com/owner/repository' };
    }

    const cacheKey = `${parsed.owner}/${parsed.repo}`.toLowerCase();
    const existingCache = analysisCache.get(cacheKey);

    // 0. Cache Check: Return instant response if analyzed within 24 hours
    if (existingCache && Date.now() - existingCache.timestamp < CACHE_TTL_MS) {
      return { success: true, data: existingCache.data, cached: true };
    }

    // 1. Fetch Repository File Tree & Details
    const repoInfo = await fetchGitHubRepoDetails(parsed.owner, parsed.repo, userToken);

    // 2. Concurrently run DeepSeek API for Context & Architecture Diagram
    const [contextMarkdown, mermaidArchitecture] = await Promise.all([
      generateClaudeContext(
        `${repoInfo.owner}/${repoInfo.repo}`,
        repoInfo.fileTreeSummary,
        repoInfo.readmeContent,
        repoInfo.manifestContent
      ),
      generateMermaidArchitecture(
        `${repoInfo.owner}/${repoInfo.repo}`,
        repoInfo.fileTreeSummary,
        repoInfo.readmeContent,
        repoInfo.manifestContent
      ),
    ]);

    const result: RepositoryAnalysisResult = {
      repoUrl: `https://github.com/${repoInfo.owner}/${repoInfo.repo}`,
      owner: repoInfo.owner,
      repo: repoInfo.repo,
      defaultBranch: repoInfo.defaultBranch,
      fileTreeSummary: repoInfo.fileTreeSummary,
      readmeContent: repoInfo.readmeContent,
      contextMarkdown,
      mermaidArchitecture,
      analyzedAt: new Date().toISOString(),
    };

    // Store in global cache with eviction handling
    setInCache(cacheKey, { data: result, timestamp: Date.now() });

    return { success: true, data: result, cached: false };
  } catch (err: any) {
    console.error('Error analyzing repository:', err);
    return {
      success: false,
      error: err?.message || 'Failed to analyze repository. Please verify the URL and try again.',
    };
  }
}

export async function saveProjectAction(payload: {
  repoUrl: string;
  contextMarkdown: string;
  mermaidArchitecture: string;
  brandingColor?: string;
  userId?: string;
}): Promise<{ success: boolean; projectId?: string; slug?: string; error?: string }> {
  try {
    const parsed = parseGitHubUrl(payload.repoUrl);
    const repoName = parsed ? parsed.repo : 'my-repo';
    const slug = (repoName + '-' + Math.random().toString(36).substring(2, 6)).toLowerCase();

    // Save project using local store (with Supabase fallback capability)
    const project = MockStore.saveProject(
      {
        user_id: payload.userId || 'user_demo',
        repo_url: payload.repoUrl,
        slug,
        branding_color: payload.brandingColor || '#6366f1',
      },
      payload.contextMarkdown,
      payload.mermaidArchitecture
    );

    return {
      success: true,
      projectId: project.id,
      slug: project.slug,
    };
  } catch (err: any) {
    console.error('Error saving project:', err);
    return { success: false, error: err?.message || 'Failed to save project.' };
  }
}

export async function subscribeEmailAction(
  projectId: string,
  email: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    MockStore.addSubscriber(projectId, email);
    return { success: true, message: 'Successfully subscribed to release notifications!' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to subscribe.' };
  }
}

export async function triggerManualReleaseAction(
  projectId: string,
  versionTag: string,
  commitSummary: string
): Promise<{ success: boolean; releaseId?: string; emailsSent?: number; error?: string }> {
  try {
    const project = MockStore.getProjectById(projectId);
    if (!project) {
      return { success: false, error: 'Project not found.' };
    }

    const commits = [
      { message: commitSummary || 'Performance improvements and bug fixes', author: 'RepoPulse Bot' }
    ];

    // Generate release notes via DeepSeek API
    const repoName = project.repo_url.replace('https://github.com/', '');
    const generatedNotes = await generateReleaseNotes(repoName, commits);

    // Save to Release history
    const release = MockStore.addRelease(projectId, versionTag, commitSummary, generatedNotes);

    // Fetch subscribers & send broadcast email via Resend
    const subscribers = MockStore.getSubscribers(projectId);
    const emails = subscribers.map(s => s.email);

    if (emails.length > 0) {
      await sendBroadcastEmail({
        to: emails,
        subject: `[${repoName}] Release ${versionTag} is live!`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px;">
            <h1 style="color: #6366f1; margin-top: 0;">🚀 Release Update: ${versionTag}</h1>
            <p style="color: #94a3b8;">Repository: <strong>${repoName}</strong></p>
            <hr style="border-color: #334155;" />
            <div style="line-height: 1.6; font-size: 15px;">
              ${generatedNotes.replace(/\n/g, '<br/>')}
            </div>
            <hr style="border-color: #334155; margin-top: 24px;" />
            <p style="font-size: 12px; color: #64748b;">You are receiving this email because you subscribed to updates for ${repoName}.</p>
          </div>
        `,
      });
    }

    return {
      success: true,
      releaseId: release.id,
      emailsSent: emails.length,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to trigger release.' };
  }
}

export async function deleteProjectAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    MockStore.deleteProject(id);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete project.' };
  }
}
