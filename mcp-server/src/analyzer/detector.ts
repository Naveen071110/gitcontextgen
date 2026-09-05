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
