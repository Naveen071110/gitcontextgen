'use server';

import { parseGitHubUrl, fetchGitHubRepoDetails } from './github';
import { generateClaudeContext, generateMermaidArchitecture, generateReleaseNotes, calculateReadinessScore, generateContextExport, ExportFormat } from './ai-engine';
import { RepositoryAnalysisResult } from './types';
import { MockStore } from './mockStore';
import { sendBroadcastEmail } from './resend';
import { auditPackageVulnerabilities } from './integrations/osv';
import { generateKrokiDiagramUrls } from './integrations/kroki';
import { auditEcosystemFrameworks } from './integrations/registries';
import { generateReadinessRadarChartUrl } from './integrations/quickchart';
import { getLicenseGuardrail } from './integrations/licenses';

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

    // 0. Cache Check: Return instant response if analyzed within 24 hours
    if (existingCache && Date.now() - existingCache.timestamp < CACHE_TTL_MS) {
      return { success: true, data: existingCache.data, cached: true };
    }

    // 1. Fetch Repository File Tree, SPDX License & Manifest Details
    const repoInfo = await fetchGitHubRepoDetails(parsed.owner, parsed.repo, userToken);

    // 2. Concurrently execute AI Context Synthesis, Mermaid Architecture, and OSV Vulnerability Audit
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

    // 3. Compute Kroki serverless diagram links
    const krokiUrls = generateKrokiDiagramUrls(mermaidArchitecture, repoInfo.repo);

    // 4. Calculate evidence-backed readiness scores incorporating OSV & SPDX data
    const readinessResult = calculateReadinessScore(
      repoInfo.fileTreeSummary,
      repoInfo.manifestContent,
      repoInfo.readmeContent,
      vulnSummary.totalVulnerabilities,
      repoInfo.licenseSpdx
    );

    // 5. Generate QuickChart Radar Chart visual scorecard
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

    // 6. Assemble complete repository analysis payload
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

    // Store in global cache
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
        audience_tone: 'technical',
      },
      payload.contextMarkdown,
      payload.mermaidArchitecture
    );

    return { success: true, projectId: project.id, slug: project.slug };
  } catch (err: any) {
    console.error('Error saving project:', err);
    return { success: false, error: err?.message || 'Failed to save project.' };
  }
}

export async function deleteProjectAction(projectId: string): Promise<{ success: boolean; error?: string }> {
  try {
    MockStore.deleteProject(projectId);
    return { success: true };
  } catch (err: any) {
    console.error('Error deleting project:', err);
    return { success: false, error: err?.message || 'Failed to delete project.' };
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
    const project = MockStore.getProjectById(payload.projectId);
    if (!project) {
      return { success: false, error: 'Project not found.' };
    }

    const generatedNotes = await generateReleaseNotes(
      project.repo_url,
      payload.versionTag,
      payload.diffSummary || payload.commitSummary || 'Routine features, bug fixes, and performance updates.',
      payload.audienceTone || project.audience_tone || 'technical'
    );

    const release = MockStore.addRelease(
      payload.projectId,
      payload.versionTag,
      payload.commitSummary || 'Routine updates',
      generatedNotes
    );

    // Notify all project subscribers asynchronously
    const subscribers = MockStore.getSubscribers(payload.projectId);
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
            <p style="margin-top: 16px;"><a href="https://repopulse-ai.singhnaveen360.workers.dev/p/${project.slug}" style="color: #6366f1;">View Showcase Changelog →</a></p>
          </div>`,
        }).catch(e => console.error(`Failed to send email to ${sub.email}:`, e));
      }
    }

    return { success: true, releaseId: release.id };
  } catch (err: any) {
    console.error('Error publishing release:', err);
    return { success: false, error: err?.message || 'Failed to publish release notes.' };
  }
}

export async function addSubscriberAction(
  projectId: string,
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    MockStore.addSubscriber(projectId, email);
    return { success: true };
  } catch (err: any) {
    console.error('Error adding subscriber:', err);
    return { success: false, error: err?.message || 'Failed to subscribe.' };
  }
}

// Alias for public changelog page
export const subscribeEmailAction = addSubscriberAction;
