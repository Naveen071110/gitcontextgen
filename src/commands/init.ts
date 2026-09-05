import * as fs from 'fs';
import * as path from 'path';
import { detectWordPress, WordPressDetection } from '../analyzer/detector';
import { getWordPressCursorRules, getWordPressClaudeRules } from '../rules/presets/wordpress';

export interface InitOptions {
  silent?: boolean;
  yes?: boolean;
  force?: boolean;
}

/**
 * Onboarding initialization helper for WordPress and multi-agent context generation
 */
export async function executeInit(options: InitOptions = {}): Promise<{
  isWordPress: boolean;
  wordpress?: WordPressDetection;
  generatedFiles: string[];
}> {
  const targetDir = process.cwd();
  const wpDetection = detectWordPress(targetDir);
  const generatedFiles: string[] = [];

  const cursorRulesDir = path.join(targetDir, '.cursor', 'rules');
  if (!fs.existsSync(cursorRulesDir)) {
    fs.mkdirSync(cursorRulesDir, { recursive: true });
  }

  if (wpDetection.isWordPress) {
    const mdcPath = path.join(cursorRulesDir, 'wordpress.mdc');
    const claudePath = path.join(targetDir, 'CLAUDE.md');

    const mdcContent = getWordPressCursorRules({
      name: wpDetection.name,
      type: wpDetection.type,
      version: wpDetection.version,
      textDomain: wpDetection.textDomain,
      hasWpCli: wpDetection.hasWpCli,
      hasTelex: wpDetection.hasTelex,
      hasBlockJson: wpDetection.hasBlockJson,
    });
    fs.writeFileSync(mdcPath, mdcContent, 'utf-8');
    generatedFiles.push(mdcPath);

    const claudeContent = getWordPressClaudeRules({
      name: wpDetection.name,
      type: wpDetection.type,
      version: wpDetection.version,
      textDomain: wpDetection.textDomain,
      hasWpCli: wpDetection.hasWpCli,
      hasTelex: wpDetection.hasTelex,
      hasBlockJson: wpDetection.hasBlockJson,
    });
    fs.writeFileSync(claudePath, claudeContent, 'utf-8');
    generatedFiles.push(claudePath);
  }

  return {
    isWordPress: wpDetection.isWordPress,
    wordpress: wpDetection.isWordPress ? wpDetection : undefined,
    generatedFiles,
  };
}
