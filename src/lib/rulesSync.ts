import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface SyncResult {
  synchronized: boolean;
  sourceFile: string;
  targetFile: string;
  direction: 'claude-to-cursor' | 'cursor-to-claude';
  timestamp: number;
}

const fileHashes = new Map<string, string>();
const writeLocks = new Set<string>();

function getHash(content: string): string {
  return crypto.createHash('sha256').update(content.trim()).digest('hex');
}

/**
 * Extracts and preserves YAML frontmatter from a Cursor .mdc rule file
 */
export function parseMdcFrontmatter(content: string): { frontmatter: string; body: string; alwaysApply: boolean } {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return {
      frontmatter: '---\ndescription: Synchronized Project Rules & Architectural Guardrails\nglobs: *\nalwaysApply: true\n---',
      body: content.trim(),
      alwaysApply: true,
    };
  }

  const rawFrontmatter = match[1];
  const body = match[2].trim();
  const hasAlwaysApply = /alwaysApply:\s*true/i.test(rawFrontmatter);

  // Ensure alwaysApply: true is strictly preserved
  let adjustedFrontmatter = rawFrontmatter;
  if (!hasAlwaysApply) {
    adjustedFrontmatter = rawFrontmatter + '\nalwaysApply: true';
  }

  return {
    frontmatter: `---\n${adjustedFrontmatter.trim()}\n---`,
    body,
    alwaysApply: true,
  };
}

/**
 * Synchronizes rule specifications bidirectionally between CLAUDE.md and .cursor/rules/*.mdc
 */
export function synchronizeRules(workspaceDir: string): SyncResult[] {
  const results: SyncResult[] = [];
  const claudePath = path.join(workspaceDir, 'CLAUDE.md');
  const cursorRulesDir = path.join(workspaceDir, '.cursor', 'rules');
  const mdcPath = path.join(cursorRulesDir, 'project-rules.mdc');
  const legacyCursorPath = path.join(workspaceDir, '.cursorrules');

  const claudeExists = fs.existsSync(claudePath);
  const mdcExists = fs.existsSync(mdcPath);
  const legacyExists = fs.existsSync(legacyCursorPath);

  if (!claudeExists && !mdcExists && !legacyExists) {
    return results;
  }

  const claudeContent = claudeExists ? fs.readFileSync(claudePath, 'utf-8') : '';
  const mdcContent = mdcExists ? fs.readFileSync(mdcPath, 'utf-8') : '';

  const claudeHash = claudeContent ? getHash(claudeContent) : '';
  const mdcHash = mdcContent ? getHash(mdcContent) : '';

  const prevClaudeHash = fileHashes.get(claudePath);
  const prevMdcHash = fileHashes.get(mdcPath);

  // 1. CLAUDE.md changed -> propagate to .cursor/rules/project-rules.mdc
  if (claudeExists && claudeHash !== prevClaudeHash && !writeLocks.has(mdcPath)) {
    if (!fs.existsSync(cursorRulesDir)) {
      fs.mkdirSync(cursorRulesDir, { recursive: true });
    }

    const currentMdc = mdcExists ? fs.readFileSync(mdcPath, 'utf-8') : '';
    const { frontmatter } = parseMdcFrontmatter(currentMdc);

    const updatedMdcContent = `${frontmatter}

# .cursor/rules/project-rules.mdc — Synchronized AI Guidelines

> **Single Source of Truth**: Synchronized bidirectionally with [CLAUDE.md](../../CLAUDE.md).
> Cursor agent rules are enforced globally via \`alwaysApply: true\`.

${claudeContent.replace(/^# .*?\n/, '')}
`.trim();

    try {
      writeLocks.add(mdcPath);
      fs.writeFileSync(mdcPath, updatedMdcContent, 'utf-8');
      fileHashes.set(mdcPath, getHash(updatedMdcContent));
      fileHashes.set(claudePath, claudeHash);

      results.push({
        synchronized: true,
        sourceFile: claudePath,
        targetFile: mdcPath,
        direction: 'claude-to-cursor',
        timestamp: Date.now(),
      });
    } finally {
      setTimeout(() => writeLocks.delete(mdcPath), 250);
    }
  }
  // 2. .cursor/rules/project-rules.mdc changed -> propagate to CLAUDE.md
  else if (mdcExists && mdcHash !== prevMdcHash && !writeLocks.has(claudePath)) {
    const { body } = parseMdcFrontmatter(mdcContent);

    const updatedClaudeContent = `# CLAUDE.md - Development Guide & Invariants
<!-- Synchronized from .cursor/rules/project-rules.mdc with alwaysApply: true -->

> **Cursor & Claude Interoperability**: Synchronized with .cursor/rules/project-rules.mdc.

${body.replace(/^# .*?\n/, '')}
`.trim();

    try {
      writeLocks.add(claudePath);
      fs.writeFileSync(claudePath, updatedClaudeContent, 'utf-8');
      fileHashes.set(claudePath, getHash(updatedClaudeContent));
      fileHashes.set(mdcPath, mdcHash);

      results.push({
        synchronized: true,
        sourceFile: mdcPath,
        targetFile: claudePath,
        direction: 'cursor-to-claude',
        timestamp: Date.now(),
      });
    } finally {
      setTimeout(() => writeLocks.delete(claudePath), 250);
    }
  }

  return results;
}

/**
 * Starts an active file watcher monitoring CLAUDE.md and Cursor rules
 */
export function watchRules(
  workspaceDir: string,
  onSync?: (results: SyncResult[]) => void
): { stop: () => void } {
  // Initial sync hash hydration
  synchronizeRules(workspaceDir);

  const interval = setInterval(() => {
    try {
      const results = synchronizeRules(workspaceDir);
      if (results.length > 0 && onSync) {
        onSync(results);
      }
    } catch (err) {
      console.error('[Rules Sync Watcher Error]:', err);
    }
  }, 1000);

  return {
    stop: () => clearInterval(interval),
  };
}
