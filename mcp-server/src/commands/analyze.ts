import { analyzeLocalDirectory, CodebaseAnalysis } from '../localScanner.js';
import { analyzeRemoteGitHubRepo, isGitHubUrl } from '../remoteScanner.js';

export interface AnalyzeOptions {
  json?: boolean;
  exclude?: string[];
}

export async function executeAnalyze(targetPath?: string, options: AnalyzeOptions = {}): Promise<void> {
  const resolvedPath = targetPath ? targetPath.trim() : process.cwd();
  const customExcludes = options.exclude || [];

  let analysis: CodebaseAnalysis;
  if (isGitHubUrl(resolvedPath)) {
    if (!options.json) console.log(`🌐 Scanning remote GitHub repository: ${resolvedPath}...`);
    analysis = await analyzeRemoteGitHubRepo(resolvedPath);
  } else {
    if (!options.json) console.log(`📁 Scanning local directory: ${resolvedPath}...`);
    analysis = await analyzeLocalDirectory(resolvedPath, customExcludes);
  }

  if (options.json) {
    console.log(JSON.stringify(analysis, null, 2));
    return;
  }

  console.log('\n' + '='.repeat(72));
  console.log(`📊 Codebase Analysis Summary: ${analysis.name}`);
  console.log('='.repeat(72));
  console.log(`- Path: ${analysis.path}`);
  console.log(`- Type: ${analysis.isRemote ? 'Remote GitHub Repository' : 'Local Directory'}`);
  console.log(`- Files Indexed: ${analysis.filesIndexed}`);
  console.log(`- Directories: ${analysis.directories.length}`);
  console.log(`- Entry Points: ${analysis.entryPoints.join(', ') || 'Auto-detected'}`);
  console.log(`- License: ${analysis.licenseSpdx || 'Unknown'}`);
  console.log(`- Ecosystem: ${analysis.manifest.ecosystem}`);
  console.log(`- Dependencies (${analysis.manifest.dependencies.length}): ${analysis.manifest.dependencies.slice(0, 10).join(', ')}${analysis.manifest.dependencies.length > 10 ? '...' : ''}`);
  console.log(`- Dev Dependencies (${analysis.manifest.devDependencies.length}): ${analysis.manifest.devDependencies.slice(0, 8).join(', ')}${analysis.manifest.devDependencies.length > 8 ? '...' : ''}`);
  console.log(`- Scripts (${Object.keys(analysis.manifest.scripts).length}): ${Object.keys(analysis.manifest.scripts).join(', ')}`);
  console.log('='.repeat(72) + '\n');
}
