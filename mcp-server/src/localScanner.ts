import * as fs from 'fs';
import * as path from 'path';

export interface CodebaseAnalysis {
  path: string;
  isRemote: boolean;
  name: string;
  filesIndexed: number;
  directories: string[];
  entryPoints: string[];
  manifest: {
    ecosystem: 'npm' | 'PyPI' | 'crates.io' | 'Go' | 'unknown';
    dependencies: string[];
    devDependencies: string[];
    scripts: Record<string, string>;
    manifestContent?: string;
  };
  fileTreeSummary: string;
  readmeContent?: string;
  licenseSpdx?: string;
}

const DEFAULT_IGNORES = new Set([
  'node_modules',
  '.git',
  '.next',
  '.open-next',
  'dist',
  'build',
  'out',
  'coverage',
  '.turbo',
  '.cache',
  '__pycache__',
  '.pytest_cache',
  '.venv',
  'venv',
  'target',
  '.wrangler',
  '.gemini',
  '.idea',
  '.vscode',
]);

/**
 * Scans a local directory and creates a comprehensive codebase analysis
 */
export async function analyzeLocalDirectory(
  targetPath: string,
  customExcludes: string[] = []
): Promise<CodebaseAnalysis> {
  const resolvedPath = path.resolve(targetPath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Target path does not exist: ${resolvedPath}`);
  }

  const stat = fs.statSync(resolvedPath);
  if (!stat.isDirectory()) {
    throw new Error(`Target path is not a directory: ${resolvedPath}`);
  }

  const excludesSet = new Set([...DEFAULT_IGNORES, ...customExcludes]);
  const indexedFiles: string[] = [];
  const directoriesSet = new Set<string>();

  function walk(currentDir: string, relativeDir: string = '', depth: number = 0) {
    if (depth > 8) return; // Guard against deep recursion

    let entries: fs.Dirent[] = [];
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const name = entry.name;
      if (excludesSet.has(name) || name.startsWith('.')) {
        continue;
      }

      const relPath = relativeDir ? `${relativeDir}/${name}` : name;
      const fullPath = path.join(currentDir, name);

      if (entry.isDirectory()) {
        directoriesSet.add(relPath);
        walk(fullPath, relPath, depth + 1);
      } else if (entry.isFile()) {
        indexedFiles.push(relPath);
      }
    }
  }

  walk(resolvedPath, '', 0);

  // Extract Manifest Data
  let ecosystem: 'npm' | 'PyPI' | 'crates.io' | 'Go' | 'unknown' = 'unknown';
  const dependencies: string[] = [];
  const devDependencies: string[] = [];
  const scripts: Record<string, string> = {};
  let manifestContent = '';

  const pkgJsonPath = path.join(resolvedPath, 'package.json');
  const pyprojectPath = path.join(resolvedPath, 'pyproject.toml');
  const reqsPath = path.join(resolvedPath, 'requirements.txt');
  const cargoPath = path.join(resolvedPath, 'Cargo.toml');
  const goModPath = path.join(resolvedPath, 'go.mod');

  if (fs.existsSync(pkgJsonPath)) {
    ecosystem = 'npm';
    try {
      manifestContent = fs.readFileSync(pkgJsonPath, 'utf-8');
      const pkg = JSON.parse(manifestContent);
      if (pkg.dependencies) dependencies.push(...Object.keys(pkg.dependencies));
      if (pkg.devDependencies) devDependencies.push(...Object.keys(pkg.devDependencies));
      if (pkg.scripts) Object.assign(scripts, pkg.scripts);
    } catch {}
  } else if (fs.existsSync(pyprojectPath)) {
    ecosystem = 'PyPI';
    try {
      manifestContent = fs.readFileSync(pyprojectPath, 'utf-8');
    } catch {}
  } else if (fs.existsSync(reqsPath)) {
    ecosystem = 'PyPI';
    try {
      manifestContent = fs.readFileSync(reqsPath, 'utf-8');
      const lines = manifestContent.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          dependencies.push(trimmed.split(/[=<>~]/)[0].trim());
        }
      }
    } catch {}
  } else if (fs.existsSync(cargoPath)) {
    ecosystem = 'crates.io';
    try {
      manifestContent = fs.readFileSync(cargoPath, 'utf-8');
    } catch {}
  } else if (fs.existsSync(goModPath)) {
    ecosystem = 'Go';
    try {
      manifestContent = fs.readFileSync(goModPath, 'utf-8');
    } catch {}
  }

  // Extract README
  let readmeContent = '';
  const possibleReadmes = ['README.md', 'readme.md', 'README.txt', 'README'];
  for (const r of possibleReadmes) {
    const rPath = path.join(resolvedPath, r);
    if (fs.existsSync(rPath)) {
      try {
        readmeContent = fs.readFileSync(rPath, 'utf-8');
        break;
      } catch {}
    }
  }

  // Extract License SPDX if available
  let licenseSpdx: string | undefined = undefined;
  const licensePath = path.join(resolvedPath, 'LICENSE');
  if (fs.existsSync(licensePath)) {
    try {
      const licText = fs.readFileSync(licensePath, 'utf-8');
      if (licText.includes('MIT License')) licenseSpdx = 'MIT';
      else if (licText.includes('Apache License') && licText.includes('2.0')) licenseSpdx = 'Apache-2.0';
      else if (licText.includes('GNU GENERAL PUBLIC LICENSE') && licText.includes('Version 3')) licenseSpdx = 'GPL-3.0';
      else if (licText.includes('BSD 3-Clause')) licenseSpdx = 'BSD-3-Clause';
    } catch {}
  }

  // Detect Entry Points
  const entryPoints: string[] = [];
  const commonEntries = [
    'src/index.ts',
    'src/index.js',
    'src/main.ts',
    'src/main.js',
    'src/app/page.tsx',
    'src/app/page.js',
    'src/app/layout.tsx',
    'app/page.tsx',
    'index.ts',
    'index.js',
    'main.py',
    'app.py',
    'src/main.rs',
    'main.go',
  ];
  for (const entry of commonEntries) {
    if (indexedFiles.includes(entry)) {
      entryPoints.push(entry);
    }
  }

  // Build tree summary (capped to top 150 files for token efficiency)
  const fileTreeSummary = indexedFiles.slice(0, 150).join('\n');

  return {
    path: resolvedPath,
    isRemote: false,
    name: path.basename(resolvedPath),
    filesIndexed: indexedFiles.length,
    directories: Array.from(directoriesSet).slice(0, 30),
    entryPoints,
    manifest: {
      ecosystem,
      dependencies: dependencies.slice(0, 50),
      devDependencies: devDependencies.slice(0, 30),
      scripts,
      manifestContent: manifestContent.slice(0, 2000),
    },
    fileTreeSummary,
    readmeContent: readmeContent.slice(0, 3000),
    licenseSpdx,
  };
}
