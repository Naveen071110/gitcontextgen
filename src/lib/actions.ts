'use server';

import { parseGitHubUrl, fetchGitHubRepoDetails } from './github';
import { generateClaudeContext, generateMermaidArchitecture, generateReleaseNotes, calculateReadinessScore, generateContextExport, ExportFormat } from './ai-engine';
import { RepositoryAnalysisResult } from './types';
import {
  getUserProjects,
  getProjectById,
  createProject,
  deleteProjectDb,
  saveDocAssets,
  getDocAssets,
  getReleases,
  addReleaseDb,
  getSubscribers,
  addSubscriberDb,
} from './db';
import { sendBroadcastEmail } from './resend';
import { auditPackageVulnerabilities } from './integrations/osv';
import { generateKrokiDiagramUrls } from './integrations/kroki';
import { auditEcosystemFrameworks } from './integrations/registries';
import { generateReadinessRadarChartUrl } from './integrations/quickchart';
import { getLicenseGuardrail } from './integrations/licenses';
import { createClient } from './supabase/server';
import { validateRepoCreationLimit, getUserEntitlements } from './entitlements';

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

export async function analyzeRepositoryAction(
  repoUrl: string,
  userToken?: string
): Promise<{ success: boolean; data?: RepositoryAnalysisResult; cached?: boolean; error?: string }> {
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

    if (existingCache && Date.now() - existingCache.timestamp < CACHE_TTL_MS) {
      return { success: true, data: existingCache.data, cached: true };
    }

    const repoInfo = await fetchGitHubRepoDetails(parsed.owner, parsed.repo, userToken);

    const [contextMarkdown, mermaidArchitecture, vulnSummary, frameworkInsights] = await Promise.all([
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
      auditPackageVulnerabilities(repoInfo.parsedDependencies, repoInfo.ecosystem),
      auditEcosystemFrameworks(repoInfo.parsedDependencies, repoInfo.ecosystem),
    ]);

    const krokiUrls = generateKrokiDiagramUrls(mermaidArchitecture, repoInfo.repo);

    const readinessResult = calculateReadinessScore(
      repoInfo.fileTreeSummary,
      repoInfo.manifestContent,
      repoInfo.readmeContent,
      vulnSummary.totalVulnerabilities,
      repoInfo.licenseSpdx
    );

    const radarChartUrl = generateReadinessRadarChartUrl(
      {
        overallScore: readinessResult.overallScore,
        setupScore: readinessResult.setupClarity.score,
        testScore: readinessResult.testClarity.score,
        archScore: readinessResult.architectureClarity.score,
        safetyScore: readinessResult.boundarySafety.score,
        multiAgentScore: readinessResult.multiAgentCoverage.score,
      },
      repoInfo.repo
    );

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
      licenseSpdx: repoInfo.licenseSpdx || undefined,
      radarChartUrl,
      krokiDiagramUrls: krokiUrls,
      vulnerabilityCount: vulnSummary.totalVulnerabilities,
      criticalVulnerabilityCount: vulnSummary.criticalCount,
    };

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

export async function switchExportFormatAction(
  repoName: string,
  fileTreeSummary: string,
  format: ExportFormat,
  readmeContent?: string
): Promise<{ success: boolean; content?: string; error?: string }> {
  try {
    const content = await generateContextExport(repoName, fileTreeSummary, format, readmeContent);
    return { success: true, content };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to generate context export format.' };
  }
}

// ---------------------------------------------------------------------------
// Server actions using Supabase persistence (replaces MockStore)
// ---------------------------------------------------------------------------

export async function getUserProjectsAction(): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const projects = await getUserProjects();
    return { success: true, data: projects };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to load projects.' };
  }
}

export async function getProjectAction(projectId: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const project = await getProjectById(projectId);
    if (!project) return { success: false, error: 'Project not found or access denied.' };
    return { success: true, data: project };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to load project.' };
  }
}

export async function getDocAssetsAction(projectId: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const assets = await getDocAssets(projectId);
    return { success: true, data: assets };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to load document assets.' };
  }
}

export async function getReleasesAction(projectId: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const releases = await getReleases(projectId);
    return { success: true, data: releases };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to load releases.' };
  }
}

const subscriberRateLimit = new Map<string, { count: number; expires: number }>();

export async function saveProjectAction(payload: {
  repoUrl: string;
  contextMarkdown: string;
  mermaidArchitecture: string;
  brandingColor?: string;
}): Promise<{ success: boolean; projectId?: string; slug?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized: You must be signed in with GitHub to save a workspace.' };
    }

    // Enforce tier repository creation limits (Starter: 1, Pro: 5, Agency: Unlimited)
    const limitCheck = await validateRepoCreationLimit(user.id);
    if (!limitCheck.allowed) {
      return { success: false, error: limitCheck.error || 'Plan limit exceeded. Please upgrade your plan.' };
    }

    const parsed = parseGitHubUrl(payload.repoUrl);
    const repoName = parsed ? parsed.repo : 'my-repo';
    const slug = (repoName + '-' + Math.random().toString(36).substring(2, 6)).toLowerCase();

    const project = await createProject({
      user_id: user.id,
      repo_url: payload.repoUrl,
      slug,
      branding_color: payload.brandingColor || '#6366f1',
      audience_tone: 'technical',
    });

    await saveDocAssets(project.id, payload.contextMarkdown, payload.mermaidArchitecture);

    return { success: true, projectId: project.id, slug: project.slug };
  } catch (err: unknown) {
    console.error('Error saving project:', err);
    return { success: false, error: (err as any)?.message || 'Failed to securely save project workspace.' };
  }
}

export async function getUserEntitlementsAction(): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: true, data: { tier: 'FREE', maxRepos: 1, currentRepoCount: 0, canCreateRepo: true } };
    }
    const entitlements = await getUserEntitlements(user.id);
    return { success: true, data: entitlements };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to load user entitlements.' };
  }
}


export async function deleteProjectAction(projectId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized: Please sign in to delete workspaces.' };
    }

    const deleted = await deleteProjectDb(projectId);
    if (!deleted) {
      return { success: false, error: 'Failed to delete workspace or access denied.' };
    }

    return { success: true };
  } catch (err: unknown) {
    console.error('Error deleting project:', err);
    return { success: false, error: 'Failed to delete workspace.' };
  }
}

export async function publishReleaseAction(payload: {
  projectId: string;
  versionTag: string;
  commitSummary?: string;
  diffSummary?: string;
  audienceTone?: 'technical' | 'marketing';
}): Promise<{ success: boolean; releaseId?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized: Please sign in to publish releases.' };
    }

    const project = await getProjectById(payload.projectId);
    if (!project) {
      return { success: false, error: 'Project workspace not found.' };
    }

    const generatedNotes = await generateReleaseNotes(
      project.repo_url,
      payload.versionTag,
      payload.diffSummary || payload.commitSummary || 'Routine features, bug fixes, and performance updates.',
      payload.audienceTone || project.audience_tone || 'technical'
    );

    const release = await addReleaseDb(
      payload.projectId,
      payload.versionTag,
      payload.commitSummary || 'Routine updates',
      generatedNotes
    );

    const subscribers = await getSubscribers(payload.projectId);
    if (subscribers.length > 0) {
      const parsed = parseGitHubUrl(project.repo_url);
      const repoName = parsed ? `${parsed.owner}/${parsed.repo}` : 'Repository';

      for (const sub of subscribers) {
        sendBroadcastEmail({
          to: [sub.email],
          subject: `🚀 [${repoName}] Release ${payload.versionTag} Published`,
          html: `<div style="font-family: sans-serif; background: #0a0a0a; color: #fff; padding: 24px; border-radius: 12px;">
            <h2 style="color: #06b6d4;">${repoName} ${payload.versionTag}</h2>
            <div style="background: #171717; padding: 16px; border-radius: 8px; font-family: monospace; white-space: pre-wrap;">
              ${generatedNotes}
            </div>
            <p style="margin-top: 16px;"><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://gitcontextgen.com'}/p/${project.slug}" style="color: #6366f1;">View Showcase Changelog →</a></p>
          </div>`,
        }).catch((e: unknown) => console.error(`Failed to send email to ${sub.email}:`, e));
      }
    }

    return { success: true, releaseId: release.id };
  } catch (err: unknown) {
    console.error('Error publishing release:', err);
    return { success: false, error: 'Failed to publish release notes.' };
  }
}

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export async function addSubscriberAction(
  projectId: string,
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || cleanEmail.length > 254 || !EMAIL_REGEX.test(cleanEmail)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    const project = await getProjectById(projectId);
    if (!project) {
      return { success: false, error: 'Target workspace not found.' };
    }

    const now = Date.now();
    const rateKey = projectId;
    const entry = subscriberRateLimit.get(rateKey);
    if (entry && entry.expires > now) {
      if (entry.count >= 5) {
        return { success: false, error: 'Too many subscription requests. Please try again in a moment.' };
      }
      entry.count++;
    } else {
      subscriberRateLimit.set(rateKey, { count: 1, expires: now + 60000 });
    }

    await addSubscriberDb(projectId, cleanEmail);
    return { success: true };
  } catch (err: unknown) {
    console.error('Error adding subscriber:', err);
    return { success: false, error: 'Failed to subscribe.' };
  }
}

export const subscribeEmailAction = addSubscriberAction;
