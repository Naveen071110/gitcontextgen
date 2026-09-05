import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

export interface LintOptions {
  strict?: boolean;
  stagedOnly?: boolean;
  json?: boolean;
}

export interface LintIssue {
  category: 'CURSOR_RULES' | 'SYNC_DRIFT' | 'SECURITY_LEAK';
  severity: 'ERROR' | 'WARNING';
  file: string;
  message: string;
  remediation: string;
}

export interface LintReport {
  passed: boolean;
  totalChecks: number;
  errorsCount: number;
  warningsCount: number;
  issues: LintIssue[];
  durationMs: number;
}

const SENSITIVE_FILE_REGEX =
  /\.(pem|key|pkcs12|pfx|p12|kdb|sqlite|sqlite3|rdb|env(\..+)?)$|^(id_rsa|id_dsa|id_ecdsa|id_ed25519|secrets?|credentials|service-account|master\.key)$/i;

const IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  '.open-next',
  '.wrangler',
  'dist',
  'build',
  'out',
  'coverage',
  '.turbo',
  '.cache',
  'vendor',
  '.venv',
  'venv',
]);

function isFileGitIgnored(filePath: string, repoRoot: string): boolean {
  try {
    const rel = path.relative(repoRoot, filePath).replace(/\\/g, '/');
    execSync(`git check-ignore -q -- "${rel}"`, {
      cwd: repoRoot,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return true; // Exit code 0 means gitignored
  } catch {
    return false;
  }
}

/**
 * Sweeps directory recursively for sensitive files, ignoring standard build artifacts and gitignored files
 */
function scanWorkspaceForSensitiveFiles(dir: string, baseDir: string = dir): string[] {
  const leaks: string[] = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!IGNORE_DIRS.has(entry.name)) {
          leaks.push(...scanWorkspaceForSensitiveFiles(path.join(dir, entry.name), baseDir));
        }
      } else if (entry.isFile()) {
        const basename = entry.name;
        // Whitelist standard environment templates
        if (/^\.env\.(example|sample|template)$/i.test(basename)) {
          continue;
        }
        if (SENSITIVE_FILE_REGEX.test(basename)) {
          const fullPath = path.join(dir, entry.name);
          if (!isFileGitIgnored(fullPath, baseDir)) {
            leaks.push(path.relative(baseDir, fullPath));
          }
        }
      }
    }
  } catch {}
  return leaks;
}

/**
 * Executes the continuous integration rule linter
 */
export async function executeLint(
  targetPath?: string,
  options: LintOptions = {}
): Promise<LintReport> {
  const startTime = Date.now();
  const repoRoot = path.resolve(targetPath || process.cwd());
  const issues: LintIssue[] = [];
  let totalChecks = 0;

  console.log('\n' + '='.repeat(72));
  console.log('🔍 GitContextGen Continuous Integration Rule & Security Linter');
  console.log(`📂 Scanning Workspace: ${repoRoot}`);
  console.log('='.repeat(72) + '\n');

  // --------------------------------------------------------------------------
  // Vector 1: Cursor Rules Validation (.cursor/rules/*.mdc)
  // --------------------------------------------------------------------------
  totalChecks++;
  const cursorRulesDir = path.join(repoRoot, '.cursor', 'rules');
  const legacyCursorRules = path.join(repoRoot, '.cursorrules');

  let mdcFiles: string[] = [];
  if (fs.existsSync(cursorRulesDir)) {
    try {
      mdcFiles = fs
        .readdirSync(cursorRulesDir)
        .filter((f) => f.endsWith('.mdc'))
        .map((f) => path.join(cursorRulesDir, f));
    } catch {
      mdcFiles = [];
    }
  }

  if (mdcFiles.length === 0 && !fs.existsSync(legacyCursorRules)) {
    issues.push({
      category: 'CURSOR_RULES',
      severity: 'ERROR',
      file: '.cursor/rules/',
      message: 'No Cursor rules (.mdc) or legacy .cursorrules detected in workspace.',
      remediation: 'Run "gitcontextgen init" to bootstrap synchronized .cursor/rules/project-rules.mdc.',
    });
  } else {
    for (const mdcPath of mdcFiles) {
      totalChecks++;
      const relPath = path.relative(repoRoot, mdcPath);
      try {
        const content = fs.readFileSync(mdcPath, 'utf-8');
        const yamlMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);

        if (!yamlMatch) {
          issues.push({
            category: 'CURSOR_RULES',
            severity: 'ERROR',
            file: relPath,
            message: 'Missing or malformed YAML frontmatter (must begin and end with "---").',
            remediation: 'Ensure file starts with valid YAML frontmatter containing description and alwaysApply.',
          });
          continue;
        }

        const frontmatter = yamlMatch[1];

        // Description check
        const descMatch = frontmatter.match(/description:\s*(.+)/);
        if (!descMatch || !descMatch[1].trim()) {
          issues.push({
            category: 'CURSOR_RULES',
            severity: 'ERROR',
            file: relPath,
            message: 'YAML frontmatter is missing a required non-empty "description:" field.',
            remediation: 'Add "description: <concise summary of rules purpose>" to frontmatter.',
          });
        }

        // Mandatory alwaysApply: true check
        if (!frontmatter.includes('alwaysApply: true')) {
          issues.push({
            category: 'CURSOR_RULES',
            severity: 'ERROR',
            file: relPath,
            message: 'Mandatory directive "alwaysApply: true" is missing from YAML frontmatter.',
            remediation: 'Set "alwaysApply: true" in frontmatter to ensure rule applies consistently across Cursor AI sessions.',
          });
        }
      } catch (err: any) {
        issues.push({
          category: 'CURSOR_RULES',
          severity: 'ERROR',
          file: relPath,
          message: `Unable to read rule file: ${err.message}`,
          remediation: 'Check file read permissions.',
        });
      }
    }
  }

  // --------------------------------------------------------------------------
  // Vector 2: Bidirectional Rule Harmonization & Drift Check
  // --------------------------------------------------------------------------
  totalChecks++;
  const claudeMdPath = path.join(repoRoot, 'CLAUDE.md');
  const agentsMdPath = path.join(repoRoot, 'AGENTS.md');
  const hasClaudeMd = fs.existsSync(claudeMdPath);
  const hasAgentsMd = fs.existsSync(agentsMdPath);

  if (!hasClaudeMd && !hasAgentsMd) {
    issues.push({
      category: 'SYNC_DRIFT',
      severity: 'WARNING',
      file: 'CLAUDE.md / AGENTS.md',
      message: 'Workspace lacks unified AI context specification (CLAUDE.md or AGENTS.md).',
      remediation: 'Run "gitcontextgen init" to generate synchronized root context files.',
    });
  } else {
    // Cross-link checks between .cursor/rules and CLAUDE.md
    if (hasClaudeMd && mdcFiles.length > 0) {
      totalChecks++;
      const claudeContent = fs.readFileSync(claudeMdPath, 'utf-8');
      const mentionsRules =
        claudeContent.includes('.cursor') ||
        claudeContent.includes('rules') ||
        claudeContent.includes('.mdc') ||
        claudeContent.includes('project-rules');

      if (!mentionsRules) {
        issues.push({
          category: 'SYNC_DRIFT',
          severity: 'WARNING',
          file: 'CLAUDE.md',
          message: 'CLAUDE.md does not cross-reference .cursor/rules/*.mdc rules as single source of truth.',
          remediation: 'Reference .cursor/rules/ in CLAUDE.md to maintain rule portability across Claude & Cursor.',
        });
      }

      // Check if primary mdc references CLAUDE.md or project rules
      for (const mdcPath of mdcFiles) {
        const content = fs.readFileSync(mdcPath, 'utf-8');
        if (!content.includes('CLAUDE.md') && !content.includes('single source of truth')) {
          issues.push({
            category: 'SYNC_DRIFT',
            severity: 'WARNING',
            file: path.relative(repoRoot, mdcPath),
            message: 'Cursor rule file does not establish harmonization link with CLAUDE.md.',
            remediation: 'Add reference to CLAUDE.md in .mdc body to avoid specification divergence.',
          });
        }
      }
    }
  }

  // --------------------------------------------------------------------------
  // Vector 3: Security & Credential Leak Scanner
  // --------------------------------------------------------------------------
  totalChecks++;
  let stagedFiles: string[] = [];
  try {
    const raw = execSync('git diff --cached --name-only', {
      cwd: repoRoot,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (raw) {
      stagedFiles = raw
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);
    }
  } catch {
    stagedFiles = [];
  }

  // Check staged files first
  if (stagedFiles.length > 0) {
    for (const file of stagedFiles) {
      const basename = path.basename(file);
      if (/^\.env\.(example|sample|template)$/i.test(basename)) {
        continue;
      }
      if (SENSITIVE_FILE_REGEX.test(basename) || SENSITIVE_FILE_REGEX.test(file)) {
        issues.push({
          category: 'SECURITY_LEAK',
          severity: 'ERROR',
          file,
          message: `Staged file matches sensitive credential or private key pattern.`,
          remediation: `Unstage immediately: "git reset HEAD ${file}" and add to .gitignore.`,
        });
      }
    }
  }

  // If not running strictly staged-only, also inspect untracked/unstaged sensitive files in root
  if (!options.stagedOnly) {
    totalChecks++;
    const workspaceLeaks = scanWorkspaceForSensitiveFiles(repoRoot);
    for (const leak of workspaceLeaks) {
      // Don't duplicate if already reported in staged
      if (!issues.some((i) => i.file === leak)) {
        issues.push({
          category: 'SECURITY_LEAK',
          severity: 'ERROR',
          file: leak,
          message: `Sensitive credential, private key, or local database file found in workspace.`,
          remediation: `Ensure "${leak}" is added to .gitignore so it is never committed.`,
        });
      }
    }
  }

  // --------------------------------------------------------------------------
  // Diagnostics Summary Output
  // --------------------------------------------------------------------------
  const durationMs = Date.now() - startTime;
  const errors = issues.filter((i) => i.severity === 'ERROR');
  const warnings = issues.filter((i) => i.severity === 'WARNING');
  const passed = errors.length === 0;

  if (options.json) {
    const report: LintReport = {
      passed,
      totalChecks,
      errorsCount: errors.length,
      warningsCount: warnings.length,
      issues,
      durationMs,
    };
    console.log(JSON.stringify(report, null, 2));
    return report;
  }

  // Formatted Console Report
  console.log('📋 Lint Inspection Results:');
  console.log(`   - Cursor Rule Files Checked: ${mdcFiles.length}`);
  console.log(`   - Staged Git Files Checked: ${stagedFiles.length}`);
  console.log(`   - Total Validations: ${totalChecks}`);
  console.log(`   - Execution Duration: ${durationMs}ms\n`);

  if (issues.length === 0) {
    console.log('✅ [CURSOR-RULES]        100% Compliant: Valid YAML frontmatter & alwaysApply: true');
    console.log('✅ [RULE-HARMONIZATION]  100% Compliant: Zero drift detected between IDE rule sets');
    console.log('✅ [SECURITY-GUARD]      100% Clean: Zero sensitive credential leaks detected');
    console.log('\n' + '='.repeat(72));
    console.log('🎉 ALL CI LINT CHECKS PASSED (Exit code 0)');
    console.log('='.repeat(72) + '\n');
  } else {
    for (const issue of issues) {
      const badge =
        issue.severity === 'ERROR' ? '❌ [ERROR]' : '⚠️  [WARN]';
      console.error(`${badge} [${issue.category}] ${issue.file}`);
      console.error(`   Message:     ${issue.message}`);
      console.error(`   Remediation: ${issue.remediation}\n`);
    }

    console.log('='.repeat(72));
    if (passed) {
      console.log(`⚠️  LINT PASSED WITH ${warnings.length} WARNING(S) (Exit code 0)`);
    } else {
      console.error(`❌ LINT FAILED: ${errors.length} ERROR(S), ${warnings.length} WARNING(S) (Exit code 1)`);
    }
    console.log('='.repeat(72) + '\n');
  }

  return {
    passed,
    totalChecks,
    errorsCount: errors.length,
    warningsCount: warnings.length,
    issues,
    durationMs,
  };
}
