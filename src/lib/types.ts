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
}

export interface SandboxState {
  repoUrl: string;
  analysis: RepositoryAnalysisResult | null;
  isLoading: boolean;
  error: string | null;
}
