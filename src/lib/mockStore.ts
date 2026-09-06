import { Project, DocAsset, Release, Subscriber, UserSubscription, DfyOnboarding } from './types';

// In-memory global store with globalThis persistence
const globalObj = globalThis as unknown as {
  __memoryProjects?: Map<string, Project>;
  __memoryDocAssets?: Map<string, DocAsset[]>;
  __memoryReleases?: Map<string, Release[]>;
  __memorySubscribers?: Map<string, Subscriber[]>;
  __memorySubscriptions?: Map<string, UserSubscription>;
  __memoryDfyOnboardings?: Map<string, DfyOnboarding>;
};

const memoryProjects: Map<string, Project> = globalObj.__memoryProjects || (globalObj.__memoryProjects = new Map());
const memoryDocAssets: Map<string, DocAsset[]> = globalObj.__memoryDocAssets || (globalObj.__memoryDocAssets = new Map());
const memoryReleases: Map<string, Release[]> = globalObj.__memoryReleases || (globalObj.__memoryReleases = new Map());
const memorySubscribers: Map<string, Subscriber[]> = globalObj.__memorySubscribers || (globalObj.__memorySubscribers = new Map());
const memorySubscriptions: Map<string, UserSubscription> = globalObj.__memorySubscriptions || (globalObj.__memorySubscriptions = new Map());
const memoryDfyOnboardings: Map<string, DfyOnboarding> = globalObj.__memoryDfyOnboardings || (globalObj.__memoryDfyOnboardings = new Map());

// Seed mock project for immediate demo/testing
const sampleId = 'demo-project-123';
const sampleSlug = 'repopulse-ai-demo';

if (!memoryProjects.has(sampleId)) {
  memoryProjects.set(sampleId, {
    id: sampleId,
    user_id: 'demo-user-1',
    repo_url: 'https://github.com/repopulse/repopulse-ai',
    slug: sampleSlug,
    webhook_secret: 'whsec_repopulse_demo_secret_2026',
    branding_color: '#6366f1',
    created_at: new Date().toISOString(),
  });
}

memoryDocAssets.set(sampleId, [
  {
    id: 'asset-1',
    project_id: sampleId,
    type: 'context',
    content: `# CLAUDE.md - GitContextGen Development Guide

## Project Overview
**GitContextGen** is a production-ready Next.js 16 App Router application for AI repository context generation, Mermaid.js architecture visualization, and release automation.

- **Stack**: Next.js 16, Tailwind CSS v4, Lucide React, Supabase PostgreSQL, Sonnet 5 / Claude Code, Resend API.
- **Goal**: Help developers maintain CLAUDE.md & AGENT_README.md context files and automate release note emails upon GitHub push events.

---

## Key Commands
\`\`\`bash
npm run dev
npm run build
npm run lint
\`\`\``,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'asset-2',
    project_id: sampleId,
    type: 'architecture',
    content: `graph TD
    subgraph Client ["Frontend Client"]
        Hero["Sandbox Landing Hero"]
        ContextView["CLAUDE.md Viewer"]
        MermaidMap["Mermaid Diagram View"]
    end

    subgraph Backend ["Next.js Server"]
        Actions["Server Actions"]
        Webhook["GitHub Push Webhook"]
    end

    subgraph Integrations ["AI & Email Engine"]
        Gemini["Google Gemini 3.6 Flash"]
        Resend["Resend Email API"]
    end

    Hero --> Actions
    Actions --> Gemini
    Actions --> MermaidMap
    Webhook --> Gemini
    Webhook --> Resend`,
    updated_at: new Date().toISOString(),
  }
]);

memoryReleases.set(sampleId, [
  {
    id: 'rel-1',
    project_id: sampleId,
    version_tag: 'v1.2.0',
    commit_summary: 'Added Mermaid.js interactive viewer & dark mode glassmorphism',
    generated_notes: `## 🚀 Release v1.2.0

### 🌟 New Features
- **Mermaid.js Client Renderer**: Instant architecture map visualization with zoom and export options.
- **Zero-Login Sandbox**: Evaluate public repositories instantly without signup walls.

### 🛠️ Fixes & Refactoring
- Optimized Next.js Server Action response latency for GitHub tree fetching.
- Added loading state skeletons during Gemini 3.6 Flash AI processing.`,
    created_at: new Date().toISOString(),
  }
]);

memorySubscribers.set(sampleId, [
  {
    id: 'sub-1',
    project_id: sampleId,
    email: 'developer@example.com',
    created_at: new Date().toISOString(),
  }
]);

export const MockStore = {
  getProjects(userId?: string) {
    const list = Array.from(memoryProjects.values());
    if (userId) {
      return list.filter(p => p.user_id === userId);
    }
    return list;
  },

  getProjectById(id: string) {
    return memoryProjects.get(id) || Array.from(memoryProjects.values()).find(p => p.id === id || p.slug === id);
  },

  getProjectBySlug(slug: string) {
    return Array.from(memoryProjects.values()).find(p => p.slug === slug);
  },

  saveProject(project: Partial<Project>, contextDoc?: string, archDoc?: string) {
    const id = project.id || 'proj_' + crypto.randomUUID().slice(0, 9);
    const slug = project.slug || (project.repo_url ? project.repo_url.split('/').pop()?.toLowerCase() || 'repo-app' : 'my-repo');
    
    const newProject: Project = {
      id,
      user_id: project.user_id || 'user_demo',
      repo_url: project.repo_url || 'https://github.com/example/repo',
      slug,
      webhook_secret: project.webhook_secret || 'whsec_' + crypto.randomUUID().slice(0, 12),
      branding_color: project.branding_color || '#6366f1',
      created_at: new Date().toISOString(),
    };

    memoryProjects.set(id, newProject);

    if (contextDoc || archDoc) {
      const assets: DocAsset[] = [];
      if (contextDoc) {
        assets.push({
          id: 'asset_ctx_' + id,
          project_id: id,
          type: 'context',
          content: contextDoc,
          updated_at: new Date().toISOString(),
        });
      }
      if (archDoc) {
        assets.push({
          id: 'asset_arch_' + id,
          project_id: id,
          type: 'architecture',
          content: archDoc,
          updated_at: new Date().toISOString(),
        });
      }
      memoryDocAssets.set(id, assets);
    }

    return newProject;
  },

  deleteProject(id: string) {
    memoryProjects.delete(id);
    memoryDocAssets.delete(id);
    memoryReleases.delete(id);
    memorySubscribers.delete(id);
    return true;
  },

  getDocAssets(projectId: string) {
    return memoryDocAssets.get(projectId) || [];
  },

  getReleases(projectId: string) {
    return memoryReleases.get(projectId) || [];
  },

  addRelease(projectId: string, versionTag: string, summary: string, generatedNotes: string) {
    const releases = memoryReleases.get(projectId) || [];
    const newRelease: Release = {
      id: 'rel_' + crypto.randomUUID().slice(0, 9),
      project_id: projectId,
      version_tag: versionTag,
      commit_summary: summary,
      generated_notes: generatedNotes,
      created_at: new Date().toISOString(),
    };
    releases.unshift(newRelease);
    memoryReleases.set(projectId, releases);
    return newRelease;
  },

  getSubscribers(projectId: string) {
    return memorySubscribers.get(projectId) || [];
  },

  addSubscriber(projectId: string, email: string) {
    const list = memorySubscribers.get(projectId) || [];
    if (!list.some(s => s.email.toLowerCase() === email.toLowerCase())) {
      const sub: Subscriber = {
        id: 'sub_' + crypto.randomUUID().slice(0, 9),
        project_id: projectId,
        email,
        created_at: new Date().toISOString(),
      };
      list.push(sub);
      memorySubscribers.set(projectId, list);
      return sub;
    }
    return list.find(s => s.email.toLowerCase() === email.toLowerCase())!;
  },

  getUserSubscription(userId: string): UserSubscription | null {
    return memorySubscriptions.get(userId) || null;
  },

  upsertUserSubscription(payload: Partial<UserSubscription> & { user_id: string; tier: UserSubscription['tier'] }): UserSubscription {
    const existing = memorySubscriptions.get(payload.user_id);
    const updated: UserSubscription = {
      id: existing?.id || 'sub_' + crypto.randomUUID().slice(0, 8),
      user_id: payload.user_id,
      customer_id: payload.customer_id || existing?.customer_id,
      subscription_id: payload.subscription_id || existing?.subscription_id,
      tier: payload.tier,
      status: payload.status || existing?.status || 'active',
      current_period_end: payload.current_period_end || existing?.current_period_end,
      created_at: existing?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memorySubscriptions.set(payload.user_id, updated);
    return updated;
  },

  addDfyOnboarding(payload: Partial<DfyOnboarding> & { payment_id: string }): DfyOnboarding {
    const dfy: DfyOnboarding = {
      id: 'dfy_' + crypto.randomUUID().slice(0, 8),
      user_id: payload.user_id,
      payment_id: payload.payment_id,
      customer_email: payload.customer_email,
      customer_name: payload.customer_name,
      status: payload.status || 'pending_scheduling',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryDfyOnboardings.set(payload.payment_id, dfy);
    return dfy;
  },

  getDfyOnboardings(): DfyOnboarding[] {
    return Array.from(memoryDfyOnboardings.values());
  },

  clearAll() {
    memoryProjects.clear();
    memoryDocAssets.clear();
    memoryReleases.clear();
    memorySubscribers.clear();
    memorySubscriptions.clear();
    memoryDfyOnboardings.clear();
  }
};
