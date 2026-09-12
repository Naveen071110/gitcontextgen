import { GitHubFile } from './types';

export interface ParsedRepoUrl {
  owner: string;
  repo: string;
}

const GITHUB_NAME_REGEX = /^[a-zA-Z0-9_.-]+$/;
const DEFAULT_FETCH_TIMEOUT_MS = 10000;

export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 20000,
  errorMessage: string = 'Operation timed out'
): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      const err: any = new Error(errorMessage);
      err.status = 504;
      err.name = 'TimeoutError';
      reject(err);
    }, timeoutMs);
  });

  return Promise.race([
    promise.then((res) => {
      clearTimeout(timer);
      return res;
    }),
    timeoutPromise,
  ]);
}


export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = DEFAULT_FETCH_TIMEOUT_MS
): Promise<Response> {
  const signal = options.signal || AbortSignal.timeout(timeoutMs);
  return fetch(url, { ...options, signal });
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

    if (owner && repo && GITHUB_NAME_REGEX.test(owner) && GITHUB_NAME_REGEX.test(repo)) {
      return { owner, repo };
    }
    return null;
  } catch {
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
    // OpenAI / Anthropic / AI API keys
    .replace(/sk-[0-9a-zA-Z]{32,}/g, '[REDACTED_API_KEY]')
    .replace(/sk-ant-[0-9a-zA-Z]{32,}/g, '[REDACTED_ANTHROPIC_KEY]')
    .replace(/sk-proj-[0-9a-zA-Z]{32,}/g, '[REDACTED_OPENAI_KEY]')
    // Private Key blocks (RSA, EC, OPENSSH, DSA, PGP)
    .replace(/-----BEGIN (?:[A-Z0-9_-]+ )?PRIVATE KEY-----[\s\S]*?-----END (?:[A-Z0-9_-]+ )?PRIVATE KEY-----/g, '[REDACTED_PRIVATE_KEY]')
    // SSH coordinates and keys
    .replace(/ssh-(?:rsa|dss|ed25519)\s+[A-Za-z0-9+/=]{40,}/g, '[REDACTED_SSH_KEY]')
    // AWS Secret Access Key or unquoted environment assignments
    .replace(/(AWS_SECRET_ACCESS_KEY|AWS_ACCESS_KEY_ID|SECRET_KEY|API_KEY|AUTH_TOKEN|ACCESS_TOKEN|PRIVATE_KEY|PASSWORD|WEBHOOK_SECRET|DATABASE_URL|SUPABASE_KEY|DODO_API_KEY)\s*[:=]\s*["']?([^\s\r\n"']+)["']?/gi, '$1="[REDACTED_SECRET]"')
    // Generic API Key / Secret assignments in config text
    .replace(/(?:api_key|secret_key|auth_token|access_token|password)\s*[:=]\s*["'][^"']+["']/gi, '$1: "[REDACTED_SECRET]"');
}

export const MAX_SCAN_FILE_SIZE_BYTES = 500 * 1024; // 500 KB ceiling to prevent ReDoS
const VENDOR_PATH_REGEX = /(?:^|[\\/])(node_modules|dist|build|\.next|\.open-next|vendor|wp-includes|wp-admin|out|coverage)[\\/]/i;

/**
 * ReDoS-Safe Secret Sanitizer with file size and vendor directory gating
 */
export function safeSanitizeSecrets(content: string, filePath: string = 'file'): string {
  if (!content) return '';

  const byteLength = Buffer.byteLength(content, 'utf8');
  const filename = filePath.split(/[\\/]/).pop() || filePath;

  if (byteLength > MAX_SCAN_FILE_SIZE_BYTES || VENDOR_PATH_REGEX.test(filePath)) {
    return `// [File: ${filename} size exceeded 500KB - skipped credentials scan for performance]\n`;
  }

  return sanitizeSecrets(content);
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
  recentCommits?: Array<{ message: string; author?: string; sha?: string; date?: string }>;
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
  const repoRes = await fetchWithTimeout(`https://api.github.com/repos/${owner}/${repo}`, {
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
  const treeRes = await withTimeout(
    fetchWithTimeout(treeUrl, { headers, next: { revalidate: 3600 } }, 18000),
    20000,
    'GitHub tree request timed out'
  );

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

  // 3, 4, 5. Fetch README, Manifest, and Commits in parallel
  let readmeContent = '';
  let manifestContent = '';
  let parsedDependencies: Record<string, string> = {};
  let ecosystem: 'npm' | 'PyPI' | 'crates.io' | 'Go' = 'npm';
  let recentCommits: Array<{ message: string; author?: string; sha?: string; date?: string }> = [];

  const hasPkgJson = filteredTree.some(item => item.path === 'package.json');
  const hasReqs = filteredTree.some(item => item.path === 'requirements.txt' || item.path === 'pyproject.toml');
  const hasCargo = filteredTree.some(item => item.path === 'Cargo.toml');
  const hasGoMod = filteredTree.some(item => item.path === 'go.mod');

  const [readmeResult, manifestResult, commitsResult] = await Promise.allSettled([
    // A: README
    (async () => {
      try {
        const readmeRes = await fetchWithTimeout(
          `https://api.github.com/repos/${owner}/${repo}/readme`,
          { headers: { ...headers, Accept: 'application/vnd.github.v3.raw' }, next: { revalidate: 3600 } },
          6000
        );
        if (readmeRes.ok) return await readmeRes.text();
      } catch {}
      return '';
    })(),

    // B: Manifest
    (async () => {
      let content = '';
      let deps: Record<string, string> = {};
      let eco: 'npm' | 'PyPI' | 'crates.io' | 'Go' = 'npm';

      try {
        if (hasPkgJson) {
          const pkgRes = await fetchWithTimeout(
            `https://api.github.com/repos/${owner}/${repo}/contents/package.json`,
            { headers: { ...headers, Accept: 'application/vnd.github.v3.raw' }, next: { revalidate: 3600 } },
            6000
          );
          if (pkgRes.ok) {
            content = await pkgRes.text();
            try {
              const pkgJson = JSON.parse(content);
              deps = {
                ...(pkgJson.dependencies || {}),
                ...(pkgJson.devDependencies || {}),
              };
              eco = 'npm';
            } catch {}
          }
        } else if (hasReqs) {
          eco = 'PyPI';
          const reqRes = await fetchWithTimeout(
            `https://api.github.com/repos/${owner}/${repo}/contents/requirements.txt`,
            { headers: { ...headers, Accept: 'application/vnd.github.v3.raw' }, next: { revalidate: 3600 } },
            6000
          );
          if (reqRes.ok) {
            content = await reqRes.text();
            const lines = content.split('\n');
            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed && !trimmed.startsWith('#')) {
                const depName = trimmed.split(/[=<>~]/)[0].trim();
                if (depName) deps[depName] = '*';
              }
            }
          }
        } else if (hasCargo) {
          eco = 'crates.io';
          const cargoRes = await fetchWithTimeout(
            `https://api.github.com/repos/${owner}/${repo}/contents/Cargo.toml`,
            { headers: { ...headers, Accept: 'application/vnd.github.v3.raw' }, next: { revalidate: 3600 } },
            6000
          );
          if (cargoRes.ok) {
            content = await cargoRes.text();
          }
        } else if (hasGoMod) {
          eco = 'Go';
          const goRes = await fetchWithTimeout(
            `https://api.github.com/repos/${owner}/${repo}/contents/go.mod`,
            { headers: { ...headers, Accept: 'application/vnd.github.v3.raw' }, next: { revalidate: 3600 } },
            6000
          );
          if (goRes.ok) {
            content = await goRes.text();
          }
        }
      } catch {}

      return { content, deps, eco };
    })(),

    // C: Recent Commits
    (async () => {
      try {
        const commitsRes = await fetchWithTimeout(
          `https://api.github.com/repos/${owner}/${repo}/commits?per_page=10`,
          { headers, next: { revalidate: 3600 } },
          5000
        );
        if (commitsRes.ok) {
          const commitsData = await commitsRes.json();
          if (Array.isArray(commitsData)) {
            return commitsData.map((c: any) => ({
              message: c.commit?.message || '',
              author: c.commit?.author?.name,
              sha: c.sha ? c.sha.slice(0, 7) : undefined,
              date: c.commit?.author?.date,
            }));
          }
        }
      } catch {}
      return [];
    })(),
  ]);

  if (readmeResult.status === 'fulfilled' && readmeResult.value) {
    readmeContent = readmeResult.value;
  }
  if (manifestResult.status === 'fulfilled' && manifestResult.value) {
    manifestContent = manifestResult.value.content;
    parsedDependencies = manifestResult.value.deps;
    ecosystem = manifestResult.value.eco;
  }
  if (commitsResult.status === 'fulfilled' && commitsResult.value) {
    recentCommits = commitsResult.value;
  }

  // Apply secret sanitization
  const sanitizedReadme = safeSanitizeSecrets(readmeContent, 'README.md');
  const sanitizedManifest = safeSanitizeSecrets(manifestContent, 'manifest');

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
    recentCommits,
  };
}
