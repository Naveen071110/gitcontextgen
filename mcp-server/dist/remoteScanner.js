export function isGitHubUrl(urlOrPath) {
    return /github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/i.test(urlOrPath);
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
    const repoRes = await fetch(repoApiUrl, { headers });
    if (!repoRes.ok) {
        throw new Error(`GitHub API returned ${repoRes.status}: Repository may be private or rate-limited.`);
    }
    const repoData = await repoRes.json();
    const defaultBranch = repoData.default_branch || 'main';
    // Fetch Git Tree
    const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`;
    const treeRes = await fetch(treeUrl, { headers });
    let files = [];
    let directories = [];
    if (treeRes.ok) {
        const treeData = await treeRes.json();
        if (treeData.tree && Array.isArray(treeData.tree)) {
            files = treeData.tree.filter((item) => item.type === 'blob').map((item) => item.path);
            directories = treeData.tree.filter((item) => item.type === 'tree').map((item) => item.path);
        }
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
            const rawPkg = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/package.json`, { headers });
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
    const readmeFile = files.find(f => /^readme(\.md)?$/i.test(f));
    if (readmeFile) {
        try {
            const rawReadme = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${readmeFile}`, { headers });
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
        entryPoints: files.filter(f => /^(src\/)?(index|main|app\/page)\.(ts|js|py|rs|go)$/i.test(f)),
        manifest: {
            ecosystem,
            dependencies,
            devDependencies,
            scripts,
            manifestContent,
        },
        fileTreeSummary: files.slice(0, 150).join('\n'),
        readmeContent: readmeContent.slice(0, 3000),
        licenseSpdx: repoData.license?.spdx_id || undefined,
    };
}
