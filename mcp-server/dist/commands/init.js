import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as readline from 'readline/promises';
import { analyzeLocalDirectory } from '../localScanner.js';
import { generateRules } from '../rulesEngine.js';
export async function executeInit(options = {}) {
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
    console.log('\n🔍 Environment Detection:');
    console.log(`   - Git Repository: ${hasGit ? '✅ Detected' : '⚠️ Not detected (.git missing)'}`);
    console.log(`   - Cursor IDE Configuration: ${hasCursorRules ? '✅ Detected (.cursor/rules)' : '⚪ Not configured'}`);
    console.log(`   - VS Code Configuration: ${hasVsCode ? '✅ Detected (.vscode/)' : '⚪ Not configured'}`);
    console.log(`   - Claude CLI Settings: ${hasClaudeConfig ? '✅ Detected (~/.claude.json)' : '⚪ Not found'}`);
    let rl = null;
    if (!isAuto) {
        rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    }
    const ask = async (prompt, defaultYes = true) => {
        if (isAuto)
            return true;
        if (!rl)
            return defaultYes;
        const answer = await rl.question(prompt);
        const trimmed = answer.trim().toLowerCase();
        if (!trimmed)
            return defaultYes;
        return trimmed === 'y' || trimmed === 'yes';
    };
    try {
        // 2. Rule Configuration (.cursor/rules/project-rules.mdc & CLAUDE.md)
        const cursorRulesDir = path.join(targetDir, '.cursor', 'rules');
        const mdcPath = path.join(cursorRulesDir, 'project-rules.mdc');
        const claudePath = path.join(targetDir, 'CLAUDE.md');
        const mdcExists = fs.existsSync(mdcPath);
        const claudeExists = fs.existsSync(claudePath);
        let proceedWithRules = true;
        if ((mdcExists || claudeExists) && !isForce && !isAuto) {
            console.log('\n⚠️  Existing rule files detected in this workspace:');
            if (mdcExists)
                console.log(`   - ${path.relative(targetDir, mdcPath)}`);
            if (claudeExists)
                console.log(`   - ${path.relative(targetDir, claudePath)}`);
            proceedWithRules = await ask('\nOverwrite existing rule files with fresh analysis? [y/N]: ', false);
        }
        else if (!isAuto) {
            proceedWithRules = await ask('\nBootstrap synchronized project rules (CLAUDE.md & .cursor/rules/*.mdc)? [Y/n]: ', true);
        }
        if (proceedWithRules) {
            console.log('\n📦 Analyzing repository structure...');
            const analysis = await analyzeLocalDirectory(targetDir);
            if (!fs.existsSync(cursorRulesDir)) {
                fs.mkdirSync(cursorRulesDir, { recursive: true });
            }
            const cursorResult = generateRules(analysis, 'cursor');
            fs.writeFileSync(mdcPath, cursorResult.content, 'utf-8');
            console.log(`✅ Generated: .cursor/rules/project-rules.mdc (with alwaysApply: true)`);
            const claudeResult = generateRules(analysis, 'claude');
            fs.writeFileSync(claudePath, claudeResult.content, 'utf-8');
            console.log(`✅ Generated: CLAUDE.md (synchronized single source of truth)`);
        }
        else {
            console.log('⚪ Rule bootstrapping skipped.');
        }
        // 3. MCP Registration (~/.claude.json)
        let registerClaude = true;
        if (!isAuto) {
            registerClaude = await ask('\nRegister GitContextGen as global MCP server in Claude Code CLI (~/.claude.json)? [Y/n]: ', true);
        }
        if (registerClaude) {
            try {
                let claudeConfig = {};
                if (fs.existsSync(claudeConfigPath)) {
                    try {
                        const raw = fs.readFileSync(claudeConfigPath, 'utf-8');
                        claudeConfig = JSON.parse(raw);
                    }
                    catch {
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
            }
            catch (err) {
                console.warn(`⚠️  Could not write ~/.claude.json: ${err.message}`);
            }
        }
        // 4. Cursor / VS Code / Claude Desktop instructions
        console.log('\n' + '-'.repeat(72));
        console.log('ℹ️  To configure GitContextGen in Cursor or Claude Desktop:');
        console.log('Add the following block to your MCP configuration settings:');
        console.log(JSON.stringify({
            mcpServers: {
                gitcontextgen: {
                    command: 'gitcontextgen',
                    args: ['mcp'],
                },
            },
        }, null, 2));
        console.log('-'.repeat(72));
        console.log('\n' + '='.repeat(72));
        console.log('🎉 GitContextGen initialization completed successfully!');
        console.log('='.repeat(72) + '\n');
    }
    finally {
        if (rl) {
            rl.close();
        }
    }
}
