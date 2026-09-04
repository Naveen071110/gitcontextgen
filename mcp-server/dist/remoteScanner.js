export function isGitHubUrl(urlOrPath) {
    return /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+/i.test(urlOrPath.trim());
}
export function parseGitHubUrl(url) {
    const match = url.match(/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/i);
    if (!match)
        return null;
    return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, ''),
    };
}
/**
 * Fetches repository structure from public GitHub REST API
 */
export async function analyzeRemoteGitHubRepo(url) {
    const parsed = parseGitHubUrl(url);
    if (!parsed) {
        throw new Error(`Invalid GitHub repository URL: ${url}`);
    }
    const { owner, repo } = parsed;
    const repoApiUrl = `https://api.github.com/repos/${owner}/${repo}`;
    const headers = {
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
    const repoData = (await repoRes.json());
    const defaultBranch = repoData.default_branch || 'main';
    // Fetch Git Tree
    const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`;
    const treeRes = await fetch(treeUrl, {
        headers,
        signal: AbortSignal.timeout(10000),
    });
    let files = [];
    let directories = [];
    if (treeRes.ok) {
        const treeData = (await treeRes.json());
        if (treeData.tree && Array.isArray(treeData.tree)) {
            files = treeData.tree.filter((item) => item.type === 'blob').map((item) => item.path);
            directories = treeData.tree.filter((item) => item.type === 'tree').map((item) => item.path);
        }
    }
    else {
        throw new Error(`Failed to retrieve repository git tree: HTTP ${treeRes.status}`);
    }
    // Fetch package.json if present
    let manifestContent = '';
    let ecosystem = 'unknown';
    const dependencies = [];
    const devDependencies = [];
    const scripts = {};
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
                if (pkg.dependencies)
                    dependencies.push(...Object.keys(pkg.dependencies));
                if (pkg.devDependencies)
                    devDependencies.push(...Object.keys(pkg.devDependencies));
                if (pkg.scripts)
                    Object.assign(scripts, pkg.scripts);
            }
        }
        catch { }
    }
    else if (files.includes('pyproject.toml') || files.includes('requirements.txt')) {
        ecosystem = 'PyPI';
    }
    else if (files.includes('Cargo.toml')) {
        ecosystem = 'crates.io';
    }
    else if (files.includes('go.mod')) {
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
        }
        catch { }
    }
    return {
        path: url,
        isRemote: true,
        name: repo,
        filesIndexed: files.length,
        directories: directories.slice(0, 30),
        entryPoints: files.filter((f) => /^(src\/)?(index|main|app\/page)\.(tsx|jsx|ts|js|py|rs|go)$/i.test(f)),
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
    };
}
