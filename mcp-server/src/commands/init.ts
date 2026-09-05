import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as readline from 'readline/promises';
import { analyzeLocalDirectory } from '../localScanner.js';
import { generateRules } from '../rulesEngine.js';
import { detectWordPress } from '../analyzer/detector.js';
import { recordGitWorkingState, safeWriteWithVerification } from '../utils/fileLock.js';

export interface InitOptions {
  silent?: boolean;
  yes?: boolean;
  force?: boolean;
}

export async function executeInit(options: InitOptions = {}): Promise<void> {
  const isAuto = Boolean(options.silent || options.yes);
  const isForce = Boolean(options.force);
  const targetDir = process.cwd();

  console.log('\n' + '='.repeat(72));
  console.log('⚡ GitContextGen Workspace Initialization Wizard');
  console.log('='.repeat(72));

  // 1. Environment Detection
  const hasGit = fs.existsSync(path.join(targetDir, '.git'));
  const hasCursorRules = fs.existsSync(path.join(targetDir, '.cursorrules')) || fs.existsSync(path.join(targetDir, '.cursor', 'rules'));
  const hasVsCode = fs.existsSync(path.join(targetDir, '.vscode'));
  const claudeConfigPath = path.join(os.homedir(), '.claude.json');
  const hasClaudeConfig = fs.existsSync(claudeConfigPath);

  // WordPress Environment Detection
  const wpDetection = detectWordPress(targetDir);
  const isWordPress = wpDetection.isWordPress;

  console.log('\n🔍 Environment Detection:');
  console.log(`   - Git Repository: ${hasGit ? '✅ Detected' : '⚠️ Not detected (.git missing)'}`);
  console.log(`   - Cursor IDE Configuration: ${hasCursorRules ? '✅ Detected (.cursor/rules)' : '⚪ Not configured'}`);
  console.log(`   - VS Code Configuration: ${hasVsCode ? '✅ Detected (.vscode/)' : '⚪ Not configured'}`);
  console.log(`   - Claude CLI Settings: ${hasClaudeConfig ? '✅ Detected (~/.claude.json)' : '⚪ Not found'}`);
  if (isWordPress) {
    console.log(`   - WordPress Architecture: ✅ Detected (${wpDetection.type.toUpperCase()}${wpDetection.name ? ': ' + wpDetection.name : ''})`);
    if (wpDetection.hasBlockJson) console.log(`     ↳ Gutenberg block.json schema active`);
    if (wpDetection.hasTelex) console.log(`     ↳ Automattic Telex compatibility enabled`);
    if (wpDetection.hasWpCli) console.log(`     ↳ wp-cli configuration detected`);
  }

  let rl: readline.Interface | null = null;
  if (!isAuto) {
    rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  }

  const ask = async (prompt: string, defaultYes = true): Promise<boolean> => {
    if (isAuto) return true;
    if (!rl) return defaultYes;
    const answer = await rl.question(prompt);
    const trimmed = answer.trim().toLowerCase();
    if (!trimmed) return defaultYes;
    return trimmed === 'y' || trimmed === 'yes';
  };

  try {
    // 2. Rule Configuration (.cursor/rules/wordpress.mdc or project-rules.mdc & CLAUDE.md)
    const cursorRulesDir = path.join(targetDir, '.cursor', 'rules');
    const mdcFilename = isWordPress ? 'wordpress.mdc' : 'project-rules.mdc';
    const mdcPath = path.join(cursorRulesDir, mdcFilename);
    const claudePath = path.join(targetDir, 'CLAUDE.md');

    const mdcExists = fs.existsSync(mdcPath);
    const claudeExists = fs.existsSync(claudePath);

    let proceedWithRules = true;
    if ((mdcExists || claudeExists) && !isForce && !isAuto) {
      console.log('\n⚠️  Existing rule files detected in this workspace:');
      if (mdcExists) console.log(`   - ${path.relative(targetDir, mdcPath)}`);
      if (claudeExists) console.log(`   - ${path.relative(targetDir, claudePath)}`);
      proceedWithRules = await ask('\nOverwrite existing rule files with fresh analysis? [y/N]: ', false);
    } else if (!isAuto) {
      if (isWordPress) {
        proceedWithRules = await ask('\nWe detected a WordPress workspace! Would you like to generate WordPress-optimized Cursor (.mdc) and Claude Code (CLAUDE.md) rules? [Y/n]: ', true);
      } else {
        proceedWithRules = await ask('\nBootstrap synchronized project rules (CLAUDE.md & .cursor/rules/*.mdc)? [Y/n]: ', true);
      }
    }

    if (proceedWithRules) {
      console.log('\n📦 Analyzing repository structure...');
      const mdcSnapshot = recordGitWorkingState(mdcPath, targetDir);
      const claudeSnapshot = recordGitWorkingState(claudePath, targetDir);

      const analysis = await analyzeLocalDirectory(targetDir);

      if (!fs.existsSync(cursorRulesDir)) {
        fs.mkdirSync(cursorRulesDir, { recursive: true });
      }

      if (isWordPress) {
        const cursorResult = generateRules(analysis, 'wordpress');
        await safeWriteWithVerification(mdcPath, cursorResult.content, mdcSnapshot, { force: isForce });
        console.log(`✅ Generated: .cursor/rules/wordpress.mdc (with alwaysApply: true)`);

        const claudeResult = generateRules(analysis, 'claude');
        await safeWriteWithVerification(claudePath, claudeResult.content, claudeSnapshot, { force: isForce });
        console.log(`✅ Generated: CLAUDE.md (containing wp-cli sequences & context maps)`);
      } else {
        const cursorResult = generateRules(analysis, 'cursor');
        await safeWriteWithVerification(mdcPath, cursorResult.content, mdcSnapshot, { force: isForce });
        console.log(`✅ Generated: .cursor/rules/project-rules.mdc (with alwaysApply: true)`);

        const claudeResult = generateRules(analysis, 'claude');
        await safeWriteWithVerification(claudePath, claudeResult.content, claudeSnapshot, { force: isForce });
        console.log(`✅ Generated: CLAUDE.md (synchronized single source of truth)`);
      }
    } else {
      console.log('⚪ Rule bootstrapping skipped.');
    }

    // 3. MCP Registration (~/.claude.json)
    let registerClaude = true;
    if (!isAuto) {
      registerClaude = await ask('\nRegister GitContextGen as global MCP server in Claude Code CLI (~/.claude.json)? [Y/n]: ', true);
    }

    if (registerClaude) {
      try {
        let claudeConfig: Record<string, any> = {};
        if (fs.existsSync(claudeConfigPath)) {
          try {
            const raw = fs.readFileSync(claudeConfigPath, 'utf-8');
            claudeConfig = JSON.parse(raw);
          } catch {
            claudeConfig = {};
          }
        }

        if (!claudeConfig.mcpServers || typeof claudeConfig.mcpServers !== 'object') {
          claudeConfig.mcpServers = {};
        }

        claudeConfig.mcpServers.gitcontextgen = {
          command: 'gitcontextgen',
          args: ['mcp'],
        };

        fs.writeFileSync(claudeConfigPath, JSON.stringify(claudeConfig, null, 2), 'utf-8');
        console.log(`✅ Registered: GitContextGen MCP server registered in ${claudeConfigPath}`);
      } catch (err: unknown) {
        console.warn(`⚠️  Could not write ~/.claude.json: ${(err as Error).message}`);
      }
    }

    // 4. Cursor / VS Code / Claude Desktop instructions
    console.log('\n' + '-'.repeat(72));
    console.log('ℹ️  To configure GitContextGen in Cursor or Claude Desktop:');
    console.log('Add the following block to your MCP configuration settings:');
    console.log(
      JSON.stringify(
        {
          mcpServers: {
            gitcontextgen: {
              command: 'gitcontextgen',
              args: ['mcp'],
            },
          },
        },
        null,
        2
      )
    );
    console.log('-'.repeat(72));

    console.log('\n' + '='.repeat(72));
    console.log('🎉 GitContextGen initialization completed successfully!');
    console.log('='.repeat(72) + '\n');
  } finally {
    if (rl) {
      rl.close();
    }
  }
}
