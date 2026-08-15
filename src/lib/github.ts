import { GitHubFile } from './types';

export interface ParsedRepoUrl {
  owner: string;
  repo: string;
}

export function parseGitHubUrl(url: string): ParsedRepoUrl | null {
  try {
    const cleaned = url.trim().replace(/\/$/, '');
    const regex = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/]+)$|^([^\/]+)\/([^\/]+)$/i;
    const match = cleaned.match(regex);

    if (!match) return null;

    const owner = match[1] || match[3];
    let repo = match[2] || match[4];
    if (repo && repo.endsWith('.git')) {
      repo = repo.slice(0, -4);
    }

    if (owner && repo) {
      return { owner, repo };
    }
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Strips secrets, API keys, credentials, and tokens from text content
 */
export function sanitizeSecrets(text: string): string {
  if (!text) return '';
  
  return text
    // Stripe keys
    .replace(/(?:sk|pk|rk)_(?:live|test)_[0-9a-zA-Z]{24,}/g, '[REDACTED_STRIPE_KEY]')
    // AWS Access Keys
    .replace(/AKIA[0-9A-Z]{16}/g, '[REDACTED_AWS_KEY]')
    // GitHub Tokens
    .replace(/(?:ghp|gho|ghu|ghs|ghr)_[0-9a-zA-Z]{36}/g, '[REDACTED_GITHUB_TOKEN]')
    .replace(/github_pat_[0-9a-zA-Z]{22}_[0-9a-zA-Z]{59}/g, '[REDACTED_GITHUB_PAT]')
    // OpenAI / DeepSeek API keys
    .replace(/sk-[0-9a-zA-Z]{32,}/g, '[REDACTED_API_KEY]')
    .replace(/sk-proj-[0-9a-zA-Z]{32,}/g, '[REDACTED_OPENAI_KEY]')
    // Private Key blocks
    .replace(/-----BEGIN (?:RSA )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA )?PRIVATE KEY-----/g, '[REDACTED_PRIVATE_KEY]')
    // Generic API Key / Secret assignments in config text
    .replace(/(?:api_key|secret_key|auth_token|access_token|password)\s*[:=]\s*["'][^"']+["']/gi, '$1: "[REDACTED_SECRET]"');
}

export interface FetchRepoDetailsResult {
  owner: string;
  repo: string;
  defaultBranch: string;
  description: string;
  language: string;
  stars: number;
  fileTreeSummary: string;
  readmeContent: string;
  manifestContent: string;
  totalFiles: number;
  licenseSpdx: string | null;
  parsedDependencies: Record<string, string>;
  ecosystem: 'npm' | 'PyPI' | 'crates.io' | 'Go';
}

export async function fetchGitHubRepoDetails(
  owner: string,
  repo: string,
  userToken?: string
): Promise<FetchRepoDetailsResult> {
  const headers: Record<string, string> = {
    'User-Agent': 'RepoPulse-AI-App',
    'Accept': 'application/vnd.github.v3+json',
  };

  const activeToken = userToken || process.env.GITHUB_TOKEN;
  if (activeToken) {
    headers['Authorization'] = `Bearer ${activeToken}`;
  }

  // 1. Fetch Repository Info
  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers,
    next: { revalidate: 3600 },
  });

  if (!repoRes.ok) {
    if (repoRes.status === 404) {
      throw new Error(`Repository "${owner}/${repo}" was not found or is private.`);
    }
    if (repoRes.status === 403) {
      throw new Error(`GitHub API rate limit exceeded. Please try again in a few minutes or configure GITHUB_TOKEN.`);
    }
    throw new Error(`Failed to fetch repository information (HTTP ${repoRes.status}).`);
  }

  const repoData = await repoRes.json();
  const defaultBranch = repoData.default_branch || 'main';
  const licenseSpdx: string | null = repoData.license?.spdx_id && repoData.license?.spdx_id !== 'NOASSERTION'
    ? repoData.license.spdx_id
    : null;

  // 2. Fetch Recursive Git Tree
  const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`;
  const treeRes = await fetch(treeUrl, { headers, next: { revalidate: 3600 } });

  let fileTree: GitHubFile[] = [];
  if (treeRes.ok) {
    const treeData = await treeRes.json();
    fileTree = (treeData.tree || []) as GitHubFile[];
  }

  // Filter out noisy directories
  const filteredTree = fileTree.filter(item => {
    const p = item.path;
    return !p.includes('node_modules/') &&
           !p.includes('.git/') &&
           !p.includes('.next/') &&
           !p.includes('dist/') &&
           !p.includes('build/') &&
           !p.includes('vendor/') &&
           !p.startsWith('.idea/') &&
           !p.startsWith('.vscode/');
  });

  const treeSummaryLines = filteredTree
    .slice(0, 300)
    .map(f => `${f.type === 'tree' ? '[DIR]' : '[FILE]'} ${f.path}`);
  
  if (filteredTree.length > 300) {
    treeSummaryLines.push(`... and ${filteredTree.length - 300} more files`);
  }

  // 3. Fetch README if present
  let readmeContent = '';
  try {
    const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers: { ...headers, 'Accept': 'application/vnd.github.v3.raw' },
      next: { revalidate: 3600 }
    });
    if (readmeRes.ok) {
      readmeContent = await readmeRes.text();
    }
  } catch (e) {
    // README fetch optional
  }

  // 4. Fetch manifest (package.json, requirements.txt, Cargo.toml)
  let manifestContent = '';
  let parsedDependencies: Record<string, string> = {};
  let ecosystem: 'npm' | 'PyPI' | 'crates.io' | 'Go' = 'npm';

  try {
    const pkgRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/package.json`, {
      headers: { ...headers, 'Accept': 'application/vnd.github.v3.raw' },
      next: { revalidate: 3600 }
    });
    if (pkgRes.ok) {
      manifestContent = await pkgRes.text();
      try {
        const pkgJson = JSON.parse(manifestContent);
        parsedDependencies = {
          ...(pkgJson.dependencies || {}),
          ...(pkgJson.devDependencies || {}),
        };
        ecosystem = 'npm';
      } catch (jsonErr) {
        // Ignore JSON parse error
      }
    }
  } catch (e) {
    // Optional
  }

  // Apply secret sanitization
  const sanitizedReadme = sanitizeSecrets(readmeContent);
  const sanitizedManifest = sanitizeSecrets(manifestContent);

  return {
    owner,
    repo,
    defaultBranch,
    description: repoData.description || 'No description provided.',
    language: repoData.language || 'TypeScript/JavaScript',
    stars: repoData.stargazers_count || 0,
    fileTreeSummary: treeSummaryLines.join('\n'),
    readmeContent: sanitizedReadme.slice(0, 3000),
    manifestContent: sanitizedManifest.slice(0, 2000),
    totalFiles: filteredTree.length,
    licenseSpdx,
    parsedDependencies,
    ecosystem,
  };
}
