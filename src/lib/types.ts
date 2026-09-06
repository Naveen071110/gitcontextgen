export interface Project {
  id: string;
  user_id?: string;
  repo_url: string;
  slug: string;
  webhook_secret: string;
  branding_color: string;
  audience_tone?: 'technical' | 'marketing';
  created_at?: string;
}

export interface DocAsset {
  id: string;
  project_id: string;
  type: 'context' | 'architecture';
  content: string;
  updated_at: string;
}

export interface Release {
  id: string;
  project_id: string;
  version_tag: string;
  commit_summary?: string;
  generated_notes: string;
  created_at: string;
}

export interface Subscriber {
  id: string;
  project_id: string;
  email: string;
  created_at: string;
}

export interface GitHubFile {
  path: string;
  mode?: string;
  type: 'tree' | 'blob';
  sha?: string;
  size?: number;
  url?: string;
}

export interface RepositoryAnalysisResult {
  repoUrl: string;
  owner: string;
  repo: string;
  defaultBranch: string;
  fileTreeSummary: string;
  readmeContent?: string;
  contextMarkdown: string;
  mermaidArchitecture: string;
  analyzedAt: string;
  licenseSpdx?: string;
  radarChartUrl?: string;
  krokiDiagramUrls?: {
    svgUrl: string;
    pngUrl: string;
    embedMarkdown: string;
  };
  vulnerabilityCount?: number;
  criticalVulnerabilityCount?: number;
  wordpress?: import('../analyzer/detector').WordPressDetection;
}

export interface SandboxState {
  repoUrl: string;
  analysis: RepositoryAnalysisResult | null;
  isLoading: boolean;
  error: string | null;
}

export type SubscriptionTier = 'FREE' | 'STARTER' | 'PRO' | 'AGENCY';
export type SubscriptionStatus = 'active' | 'on_hold' | 'cancelled' | 'expired';

export interface UserSubscription {
  id: string;
  user_id: string;
  customer_id?: string;
  subscription_id?: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  current_period_end?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DfyOnboarding {
  id: string;
  user_id?: string;
  payment_id: string;
  customer_email?: string;
  customer_name?: string;
  status: 'pending_scheduling' | 'scheduled' | 'completed' | 'refunded';
  meeting_url?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

