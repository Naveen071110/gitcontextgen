import * as fs from 'fs';
import * as path from 'path';

export type WordPressProjectType = 'core' | 'plugin' | 'theme' | 'block' | 'unknown';

export interface WordPressDetection {
  isWordPress: boolean;
  type: WordPressProjectType;
  name?: string;
  version?: string;
  textDomain?: string;
  description?: string;
  author?: string;
  hasWpConfig: boolean;
  hasWpContent: boolean;
  hasBlockJson: boolean;
  hasTelex: boolean;
  hasWpCli: boolean;
  mainFile?: string;
  confidence: number;
}

/**
 * Scans a local directory or list of file paths to identify WordPress projects
 * (Core installations, Plugins, Themes, and Gutenberg/Telex blocks).
 */
export function detectWordPress(targetDir: string, knownFiles?: string[]): WordPressDetection {
  const result: WordPressDetection = {
    isWordPress: false,
    type: 'unknown',
    hasWpConfig: false,
    hasWpContent: false,
    hasBlockJson: false,
    hasTelex: false,
    hasWpCli: false,
    confidence: 0,
  };

  if (!fs.existsSync(targetDir)) {
    return result;
  }

  // 1. Check for core files and indicators
  const wpConfigPath = path.join(targetDir, 'wp-config.php');
  const wpConfigSamplePath = path.join(targetDir, 'wp-config-sample.php');
  const wpContentDir = path.join(targetDir, 'wp-content');
  const wpIncludesDir = path.join(targetDir, 'wp-includes');
  const wpCliYml = path.join(targetDir, 'wp-cli.yml');
  const wpCliLocalYml = path.join(targetDir, 'wp-cli.local.yml');

  if (fs.existsSync(wpConfigPath) || fs.existsSync(wpConfigSamplePath)) {
    result.hasWpConfig = true;
    result.isWordPress = true;
    result.type = 'core';
    result.confidence = Math.max(result.confidence, 95);
  }

  if (fs.existsSync(wpContentDir) || fs.existsSync(wpIncludesDir)) {
    result.hasWpContent = true;
    result.isWordPress = true;
    if (result.type === 'unknown') result.type = 'core';
    result.confidence = Math.max(result.confidence, 90);
  }

  if (fs.existsSync(wpCliYml) || fs.existsSync(wpCliLocalYml)) {
    result.hasWpCli = true;
    result.isWordPress = true;
    result.confidence = Math.max(result.confidence, 80);
  }

  // 2. Check for Theme metadata in style.css
  const styleCssPath = path.join(targetDir, 'style.css');
  if (fs.existsSync(styleCssPath)) {
    try {
      const content = fs.readFileSync(styleCssPath, 'utf-8');
      const themeNameMatch = content.match(/Theme Name:\s*([^\r\n*]+)/i);
      if (themeNameMatch) {
        result.isWordPress = true;
        result.type = 'theme';
        result.name = themeNameMatch[1].trim();
        result.mainFile = 'style.css';
        result.confidence = 99;

        const versionMatch = content.match(/Version:\s*([^\r\n*]+)/i);
        if (versionMatch) result.version = versionMatch[1].trim();

        const domainMatch = content.match(/Text Domain:\s*([^\r\n*]+)/i);
        if (domainMatch) result.textDomain = domainMatch[1].trim();

        const authorMatch = content.match(/Author:\s*([^\r\n*]+)/i);
        if (authorMatch) result.author = authorMatch[1].trim();

        const descMatch = content.match(/Description:\s*([^\r\n*]+)/i);
        if (descMatch) result.description = descMatch[1].trim();
      }
    } catch {}
  }

  // 3. Check for Plugin metadata in .php files
  try {
    const files = knownFiles || fs.readdirSync(targetDir);
    for (const file of files) {
      if (!file.endsWith('.php')) continue;

      const fullPath = path.isAbsolute(file) ? file : path.join(targetDir, file);
      if (!fs.existsSync(fullPath)) continue;

      try {
        const stat = fs.statSync(fullPath);
        if (!stat.isFile() || stat.size > 500000) continue; // Skip huge files

        const content = fs.readFileSync(fullPath, 'utf-8').slice(0, 8000);
        const pluginNameMatch = content.match(/Plugin Name:\s*([^\r\n*]+)/i);
        if (pluginNameMatch) {
          result.isWordPress = true;
          result.type = 'plugin';
          result.name = pluginNameMatch[1].trim();
          result.mainFile = path.relative(targetDir, fullPath);
          result.confidence = 100;

          const versionMatch = content.match(/Version:\s*([^\r\n*]+)/i);
          if (versionMatch) result.version = versionMatch[1].trim();

          const domainMatch = content.match(/Text Domain:\s*([^\r\n*]+)/i);
          if (domainMatch) result.textDomain = domainMatch[1].trim();

          const authorMatch = content.match(/Author:\s*([^\r\n*]+)/i);
          if (authorMatch) result.author = authorMatch[1].trim();

          const descMatch = content.match(/Description:\s*([^\r\n*]+)/i);
          if (descMatch) result.description = descMatch[1].trim();
          break;
        }
      } catch {}
    }
  } catch {}

  // 4. Check for Block, Gutenberg & Telex indicators
  const blockJsonPath = path.join(targetDir, 'block.json');
  const srcBlockJsonPath = path.join(targetDir, 'src', 'block.json');
  const srcBlocksDir = path.join(targetDir, 'src', 'blocks');
  const telexJsonPath = path.join(targetDir, 'telex.json');

  if (fs.existsSync(blockJsonPath) || fs.existsSync(srcBlockJsonPath) || fs.existsSync(srcBlocksDir)) {
    result.hasBlockJson = true;
    if (result.type === 'unknown') {
      result.isWordPress = true;
      result.type = 'block';
      result.confidence = Math.max(result.confidence, 85);
    }
  }

  if (fs.existsSync(telexJsonPath)) {
    result.hasTelex = true;
    result.isWordPress = true;
    result.confidence = Math.max(result.confidence, 90);
  }

  // Check package.json for WordPress / Telex dependencies
  const pkgJsonPath = path.join(targetDir, 'package.json');
  if (fs.existsSync(pkgJsonPath)) {
    try {
      const pkgContent = fs.readFileSync(pkgJsonPath, 'utf-8');
      if (pkgContent.includes('@automattic/telex') || pkgContent.includes('telex')) {
        result.hasTelex = true;
        result.isWordPress = true;
      }
      if (pkgContent.includes('@wordpress/scripts') || pkgContent.includes('@wordpress/blocks')) {
        result.hasBlockJson = true;
        result.isWordPress = true;
        if (result.type === 'unknown') {
          result.type = 'block';
          result.confidence = Math.max(result.confidence, 85);
        }
      }
    } catch {}
  }

  return result;
}


export interface LaravelDetection {
  isLaravel: boolean;
  hasArtisan: boolean;
  version?: string;
  hasComposerJson: boolean;
  hasRoutesWeb: boolean;
  hasRoutesApi: boolean;
  confidence: number;
}

export interface ReactNextDetection {
  isNext: boolean;
  isReact: boolean;
  routerType?: 'app' | 'pages' | 'mixed';
  version?: string;
  confidence: number;
}

export interface ComprehensiveFrameworkDetection {
  wordpress: WordPressDetection;
  laravel: LaravelDetection;
  reactNext: ReactNextDetection;
  primary: 'wordpress' | 'laravel' | 'nextjs' | 'react' | 'generic';
}

/**
 * Scans for Laravel framework markers (artisan, composer.json, routes/web.php)
 */
export function detectLaravel(targetDir: string, knownFiles?: string[]): LaravelDetection {
  const result: LaravelDetection = {
    isLaravel: false,
    hasArtisan: false,
    hasComposerJson: false,
    hasRoutesWeb: false,
    hasRoutesApi: false,
    confidence: 0,
  };

  if (!fs.existsSync(targetDir)) return result;

  const artisanPath = path.join(targetDir, 'artisan');
  if (fs.existsSync(artisanPath)) {
    result.hasArtisan = true;
    result.isLaravel = true;
    result.confidence = Math.max(result.confidence, 95);
  }

  const composerPath = path.join(targetDir, 'composer.json');
  if (fs.existsSync(composerPath)) {
    result.hasComposerJson = true;
    try {
      const composer = JSON.parse(fs.readFileSync(composerPath, 'utf-8'));
      const reqs = { ...(composer.require || {}), ...(composer['require-dev'] || {}) };
      if (reqs['laravel/framework']) {
        result.isLaravel = true;
        result.version = reqs['laravel/framework'];
        result.confidence = 100;
      }
    } catch {}
  }

  const routesWeb = path.join(targetDir, 'routes', 'web.php');
  if (fs.existsSync(routesWeb)) {
    result.hasRoutesWeb = true;
    result.confidence = Math.max(result.confidence, 80);
  }

  const routesApi = path.join(targetDir, 'routes', 'api.php');
  if (fs.existsSync(routesApi)) {
    result.hasRoutesApi = true;
    result.confidence = Math.max(result.confidence, 80);
  }

  return result;
}

/**
 * Scans for Next.js and React architecture and router models
 */
export function detectReactNext(targetDir: string, knownFiles?: string[]): ReactNextDetection {
  const result: ReactNextDetection = {
    isNext: false,
    isReact: false,
    confidence: 0,
  };

  if (!fs.existsSync(targetDir)) return result;

  const pkgPath = path.join(targetDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      if (deps['react']) {
        result.isReact = true;
        result.version = deps['react'];
        result.confidence = Math.max(result.confidence, 85);
      }
      if (deps['next']) {
        result.isNext = true;
        result.version = deps['next'];
        result.confidence = 100;
      }
    } catch {}
  }

  const hasAppRouter = fs.existsSync(path.join(targetDir, 'src', 'app')) || fs.existsSync(path.join(targetDir, 'app'));
  const hasPagesRouter = fs.existsSync(path.join(targetDir, 'src', 'pages')) || fs.existsSync(path.join(targetDir, 'pages'));

  if (hasAppRouter && hasPagesRouter) {
    result.routerType = 'mixed';
  } else if (hasAppRouter) {
    result.routerType = 'app';
  } else if (hasPagesRouter) {
    result.routerType = 'pages';
  }

  return result;
}

/**
 * Unified Auto-Technology Framework Detection (Agency tier deliverable)
 */
export function detectFrameworks(targetDir: string, knownFiles?: string[]): ComprehensiveFrameworkDetection {
  const wordpress = detectWordPress(targetDir, knownFiles);
  const laravel = detectLaravel(targetDir, knownFiles);
  const reactNext = detectReactNext(targetDir, knownFiles);

  let primary: 'wordpress' | 'laravel' | 'nextjs' | 'react' | 'generic' = 'generic';
  if (wordpress.isWordPress && wordpress.confidence >= 80) {
    primary = 'wordpress';
  } else if (laravel.isLaravel && laravel.confidence >= 80) {
    primary = 'laravel';
  } else if (reactNext.isNext) {
    primary = 'nextjs';
  } else if (reactNext.isReact) {
    primary = 'react';
  }

  return {
    wordpress,
    laravel,
    reactNext,
    primary,
  };
}
