import { CodebaseAnalysis } from './localScanner.js';

export function isGitHubUrl(urlOrPath: string): boolean {
  return /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+/i.test(urlOrPath.trim());
}

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/i);
  if (!match) return null;
  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, ''),
  };
}

/**
 * Fetches repository structure from public GitHub REST API
 */
export async function analyzeRemoteGitHubRepo(url: string): Promise<CodebaseAnalysis> {
  const parsed = parseGitHubUrl(url);
  if (!parsed) {
    throw new Error(`Invalid GitHub repository URL: ${url}`);
  }

  const { owner, repo } = parsed;
  const repoApiUrl = `https://api.github.com/repos/${owner}/${repo}`;
  const headers: Record<string, string> = {
    'User-Agent': 'GitContextGen-MCP-Server/1.0',
    'Accept': 'application/vnd.github.v3+json',
  };

  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const repoRes = await fetch(repoApiUrl, {
    headers,
    signal: AbortSignal.timeout(10000),
  });
  if (!repoRes.ok) {
    if (repoRes.status === 403 || repoRes.status === 429) {
      throw new Error(`GitHub API rate limit exceeded. Please set GITHUB_TOKEN environment variable.`);
    }
    throw new Error(`GitHub API returned ${repoRes.status}: Repository may be private or not found.`);
  }

  const repoData = (await repoRes.json()) as { default_branch?: string; license?: { spdx_id?: string } };
  const defaultBranch = repoData.default_branch || 'main';

  // Fetch Git Tree
  const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`;
  const treeRes = await fetch(treeUrl, {
    headers,
    signal: AbortSignal.timeout(10000),
  });
  let files: string[] = [];
  let directories: string[] = [];

  if (treeRes.ok) {
    const treeData = (await treeRes.json()) as { tree?: Array<{ path: string; type: string }> };
    if (treeData.tree && Array.isArray(treeData.tree)) {
      files = treeData.tree.filter((item) => item.type === 'blob').map((item) => item.path);
      directories = treeData.tree.filter((item) => item.type === 'tree').map((item) => item.path);
    }
  } else {
    throw new Error(`Failed to retrieve repository git tree: HTTP ${treeRes.status}`);
  }

  // Fetch package.json if present
  let manifestContent = '';
  let ecosystem: 'npm' | 'PyPI' | 'crates.io' | 'Go' | 'wordpress' | 'unknown' = 'unknown';
  const dependencies: string[] = [];
  const devDependencies: string[] = [];
  const scripts: Record<string, string> = {};

  if (files.includes('package.json')) {
    ecosystem = 'npm';
    try {
      const rawPkg = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/package.json`, {
        headers,
        signal: AbortSignal.timeout(10000),
      });
      if (rawPkg.ok) {
        manifestContent = await rawPkg.text();
        const pkg = JSON.parse(manifestContent);
        if (pkg.dependencies) dependencies.push(...Object.keys(pkg.dependencies));
        if (pkg.devDependencies) devDependencies.push(...Object.keys(pkg.devDependencies));
        if (pkg.scripts) Object.assign(scripts, pkg.scripts);
      }
    } catch {}
  } else if (files.includes('pyproject.toml') || files.includes('requirements.txt')) {
    ecosystem = 'PyPI';
  } else if (files.includes('Cargo.toml')) {
    ecosystem = 'crates.io';
  } else if (files.includes('go.mod')) {
    ecosystem = 'Go';
  }

  // Fetch README if present
  let readmeContent = '';
  const readmeFile = files.find((f) => /^readme(\.md)?$/i.test(f));
  if (readmeFile) {
    try {
      const rawReadme = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${readmeFile}`, {
        headers,
        signal: AbortSignal.timeout(10000),
      });
      if (rawReadme.ok) {
        readmeContent = await rawReadme.text();
      }
    } catch {}
  }

  // Detect WordPress in remote files
  let wpDetection: import('./analyzer/detector.js').WordPressDetection | undefined = undefined;
  const hasWpConfig = files.includes('wp-config.php') || files.includes('wp-config-sample.php');
  const hasWpContent = files.some((f) => f.startsWith('wp-content/'));
  const hasStyleCss = files.includes('style.css');
  const hasBlockJson = files.includes('block.json') || files.includes('src/block.json');
  const hasTelex = files.includes('telex.json');
  const hasWpCli = files.includes('wp-cli.yml') || files.includes('wp-cli.local.yml');
  const phpFiles = files.filter((f) => f.endsWith('.php') && !f.includes('/'));

  if (hasWpConfig || hasWpContent || hasStyleCss || hasBlockJson || hasTelex || hasWpCli || phpFiles.length > 0) {
    let wpName: string | undefined = undefined;
    let wpType: import('./analyzer/detector.js').WordPressProjectType = 'unknown';

    if (hasWpConfig || hasWpContent) {
      wpType = 'core';
    }

    // Check style.css for Theme Name
    if (hasStyleCss) {
      try {
        const rawStyle = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/style.css`, {
          headers,
          signal: AbortSignal.timeout(10000),
        });
        if (rawStyle.ok) {
          const styleText = await rawStyle.text();
          const themeMatch = styleText.match(/Theme Name:\s*([^\r\n*]+)/i);
          if (themeMatch) {
            wpName = themeMatch[1].trim();
            wpType = 'theme';
          }
        }
      } catch {}
    }

    // Check root PHP files for Plugin Name
    if (!wpName && phpFiles.length > 0) {
      for (const phpFile of phpFiles.slice(0, 3)) {
        try {
          const rawPhp = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${phpFile}`, {
            headers,
            signal: AbortSignal.timeout(10000),
          });
          if (rawPhp.ok) {
            const phpText = await rawPhp.text();
            const pluginMatch = phpText.match(/Plugin Name:\s*([^\r\n*]+)/i);
            if (pluginMatch) {
              wpName = pluginMatch[1].trim();
              wpType = 'plugin';
              break;
            }
          }
        } catch {}
      }
    }

    if (hasBlockJson && wpType === 'unknown') {
      wpType = 'block';
    }

    const isWp = Boolean(hasWpConfig || hasWpContent || wpName || hasBlockJson || hasTelex || hasWpCli);
    if (isWp) {
      ecosystem = 'wordpress';
      wpDetection = {
        isWordPress: true,
        type: wpType,
        name: wpName,
        hasWpConfig,
        hasWpContent,
        hasBlockJson,
        hasTelex,
        hasWpCli,
        confidence: wpName ? 100 : 85,
      };
    }
  }

  return {
    path: url,
    isRemote: true,
    name: wpDetection?.name || repo,
    filesIndexed: files.length,
    directories: directories.slice(0, 30),
    entryPoints: files.filter((f) => /^(src\/)?(index|main|app\/page|functions)\.(tsx|jsx|ts|js|py|rs|go|php)$/i.test(f)),
    manifest: {
      ecosystem,
      dependencies,
      devDependencies,
      scripts,
      manifestContent: manifestContent.slice(0, 2000),
    },
    fileTreeSummary: files.slice(0, 150).join('\n'),
    readmeContent: readmeContent.slice(0, 3000),
    licenseSpdx: repoData.license?.spdx_id || undefined,
    wordpress: wpDetection,
  };
}
