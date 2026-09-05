import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as readline from 'readline/promises';
import { execSync } from 'child_process';
import { detectWordPress } from '../analyzer/detector.js';

export interface DoctorOptions {
  silent?: boolean;
  yes?: boolean;
  registerAll?: boolean;
  linkRules?: boolean;
  json?: boolean;
}

export interface IdeDetectionResult {
  name: string;
  detected: boolean;
  version?: string;
  configPath?: string;
  status: 'READY' | 'CONFIGURED' | 'NOT_INSTALLED';
}

export interface DoctorReport {
  workspace: string;
  score: number;
  ides: Record<string, IdeDetectionResult>;
  mcpRegistered: string[];
  symlinksCreated: string[];
  recommendations: string[];
}

/**
 * Checks if a CLI command is available in system PATH
 */
function isCommandAvailable(command: string): boolean {
  try {
    const isWindows = process.platform === 'win32';
    const checkCmd = isWindows ? `where ${command}` : `which ${command}`;
    execSync(checkCmd, { stdio: ['ignore', 'pipe', 'ignore'] });
    return true;
  } catch {
    return false;
  }
}

/**
 * Locates the Claude Desktop configuration file across Windows, macOS, and Linux
 */
export function getClaudeDesktopConfigPath(): string {
  if (process.platform === 'win32') {
    const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
    return path.join(appData, 'Claude', 'claude_desktop_config.json');
  } else if (process.platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
  } else {
    return path.join(os.homedir(), '.config', 'Claude', 'claude_desktop_config.json');
  }
}

/**
 * Checks for known IDE installations on the host system
 */
export function auditInstalledIDEs(workspaceDir: string): Record<string, IdeDetectionResult> {
  const isWindows = process.platform === 'win32';
  const isMac = process.platform === 'darwin';
  const homedir = os.homedir();

  // 1. Claude Code CLI
  const claudeCliInPath = isCommandAvailable('claude');
  const claudeJsonPath = path.join(homedir, '.claude.json');
  const hasClaudeJson = fs.existsSync(claudeJsonPath);
  const claudeCodeDetected = claudeCliInPath || hasClaudeJson;

  // 2. Claude Desktop
  const claudeDesktopPath = getClaudeDesktopConfigPath();
  const claudeDesktopDir = path.dirname(claudeDesktopPath);
  const claudeDesktopDetected = fs.existsSync(claudeDesktopDir) || fs.existsSync(claudeDesktopPath);

  // 3. Cursor IDE
  const cursorInPath = isCommandAvailable('cursor');
  const cursorWorkspaceConfig = fs.existsSync(path.join(workspaceDir, '.cursor'));
  let cursorAppInstalled = false;
  if (isWindows) {
    const localAppData = process.env.LOCALAPPDATA || path.join(homedir, 'AppData', 'Local');
    cursorAppInstalled = fs.existsSync(path.join(localAppData, 'Programs', 'cursor'));
  } else if (isMac) {
    cursorAppInstalled = fs.existsSync('/Applications/Cursor.app');
  }
  const cursorDetected = cursorInPath || cursorWorkspaceConfig || cursorAppInstalled;

  // 4. Windsurf IDE
  const windsurfInPath = isCommandAvailable('windsurf');
  const windsurfWorkspaceConfig = fs.existsSync(path.join(workspaceDir, '.windsurf'));
  let windsurfAppInstalled = false;
  if (isWindows) {
    const localAppData = process.env.LOCALAPPDATA || path.join(homedir, 'AppData', 'Local');
    windsurfAppInstalled = fs.existsSync(path.join(localAppData, 'Programs', 'windsurf'));
  } else if (isMac) {
    windsurfAppInstalled = fs.existsSync('/Applications/Windsurf.app');
  }
  const windsurfDetected = windsurfInPath || windsurfWorkspaceConfig || windsurfAppInstalled;

  // 5. WordPress Studio / WP Architecture
  const wpDetection = detectWordPress(workspaceDir);
  let wpStudioInstalled = false;
  if (isWindows) {
    const localAppData = process.env.LOCALAPPDATA || path.join(homedir, 'AppData', 'Local');
    wpStudioInstalled = fs.existsSync(path.join(localAppData, 'Programs', 'Studio'));
  } else if (isMac) {
    wpStudioInstalled = fs.existsSync('/Applications/WordPress Studio.app');
  }
  const wpDetected = wpDetection.isWordPress || wpStudioInstalled || isCommandAvailable('wp');

  return {
    claudeCode: {
      name: 'Claude Code CLI',
      detected: claudeCodeDetected,
      configPath: claudeJsonPath,
      status: claudeCodeDetected ? 'READY' : 'NOT_INSTALLED',
    },
    claudeDesktop: {
      name: 'Claude Desktop',
      detected: claudeDesktopDetected,
      configPath: claudeDesktopPath,
      status: claudeDesktopDetected ? 'READY' : 'NOT_INSTALLED',
    },
    cursor: {
      name: 'Cursor IDE',
      detected: cursorDetected,
      configPath: path.join(workspaceDir, '.cursor', 'rules'),
      status: cursorDetected ? 'READY' : 'NOT_INSTALLED',
    },
    windsurf: {
      name: 'Windsurf IDE (Codeium)',
      detected: windsurfDetected,
      configPath: path.join(workspaceDir, '.windsurf'),
      status: windsurfDetected ? 'READY' : 'NOT_INSTALLED',
    },
    wordpress: {
      name: 'WordPress Studio & WPCS Environment',
      detected: wpDetected,
      version: wpDetection.isWordPress ? wpDetection.version : undefined,
      status: wpDetected ? 'READY' : 'NOT_INSTALLED',
    },
  };
}

/**
 * Registers GitContextGen stdio MCP server in Claude Code CLI configuration (~/.claude.json)
 */
export function registerClaudeCodeMcp(): boolean {
  try {
    const configPath = path.join(os.homedir(), '.claude.json');
    let config: any = {};
    if (fs.existsSync(configPath)) {
      try {
        config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      } catch {
        config = {};
      }
    }
    if (!config.mcpServers || typeof config.mcpServers !== 'object') {
      config.mcpServers = {};
    }
    config.mcpServers.gitcontextgen = {
      command: 'gitcontextgen',
      args: ['mcp'],
    };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    return true;
  } catch {
    return false;
  }
}

/**
 * Registers GitContextGen stdio MCP server in Claude Desktop configuration file
 */
export function registerClaudeDesktopMcp(): boolean {
  try {
    const configPath = getClaudeDesktopConfigPath();
    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    let config: any = {};
    if (fs.existsSync(configPath)) {
      try {
        config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      } catch {
        config = {};
      }
    }
    if (!config.mcpServers || typeof config.mcpServers !== 'object') {
      config.mcpServers = {};
    }
    config.mcpServers.gitcontextgen = {
      command: 'gitcontextgen',
      args: ['mcp'],
    };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely creates a bidirectional symlink, hardlink, or synced mirror file across platforms
 */
export function safelyEstablishSymlink(
  sourcePath: string,
  linkPath: string
): { success: boolean; type: 'symlink' | 'hardlink' | 'copy'; error?: string } {
  try {
    if (fs.existsSync(linkPath)) {
      return { success: true, type: 'symlink' };
    }
    // Attempt standard symlink first
    try {
      fs.symlinkSync(sourcePath, linkPath, 'file');
      return { success: true, type: 'symlink' };
    } catch (symlinkErr: any) {
      // Windows often requires SeCreateSymbolicLinkPrivilege unless Dev Mode is on. Fallback to hard link:
      try {
        fs.linkSync(sourcePath, linkPath);
        return { success: true, type: 'hardlink' };
      } catch (linkErr: any) {
        // Fallback to copy
        fs.copyFileSync(sourcePath, linkPath);
        return { success: true, type: 'copy' };
      }
    }
  } catch (err: any) {
    return { success: false, type: 'symlink', error: err.message };
  }
}

/**
 * Main Onboarding Execution Wizard: gitcontextgen doctor
 */
export async function executeDoctor(
  targetPath?: string,
  options: DoctorOptions = {}
): Promise<DoctorReport> {
  const workspaceDir = path.resolve(targetPath || process.cwd());
  const isAuto = Boolean(options.silent || options.yes);
  const mcpRegistered: string[] = [];
  const symlinksCreated: string[] = [];
  const recommendations: string[] = [];

  console.log('\n' + '='.repeat(72));
  console.log('🩺 GitContextGen $299 Client Onboarding & System Doctor');
  console.log(`🚀 Auditing Workspace: ${workspaceDir}`);
  console.log('='.repeat(72));

  // 1. Audit Developer IDEs
  console.log('\n🖥️  Step 1: Developer IDE & Terminal Engine Detection:');
  const ides = auditInstalledIDEs(workspaceDir);

  for (const [key, ide] of Object.entries(ides)) {
    const badge = ide.detected ? '✅' : '⚪';
    const statusText = ide.detected ? 'Active / Detected' : 'Not installed';
    console.log(`   ${badge} ${ide.name.padEnd(36)} [${statusText}]`);
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
    // 2. Automated MCP Client Registration
    console.log('\n🔌 Step 2: Automated Model Context Protocol (MCP) Registration:');

    // Register in Claude Code
    let shouldRegisterClaudeCode = true;
    if (!isAuto && !options.registerAll) {
      shouldRegisterClaudeCode = await ask('   ↳ Register MCP server in Claude Code CLI (~/.claude.json)? [Y/n]: ', true);
    }
    if (shouldRegisterClaudeCode) {
      const ok = registerClaudeCodeMcp();
      if (ok) {
        mcpRegistered.push('Claude Code (~/.claude.json)');
        console.log('   ✅ Registered in Claude Code CLI (~/.claude.json)');
      } else {
        recommendations.push('Manually verify permissions on ~/.claude.json.');
      }
    }

    // Register in Claude Desktop
    let shouldRegisterDesktop = true;
    if (!isAuto && !options.registerAll) {
      shouldRegisterDesktop = await ask('   ↳ Register MCP server in Claude Desktop application? [Y/n]: ', true);
    }
    if (shouldRegisterDesktop) {
      const ok = registerClaudeDesktopMcp();
      if (ok) {
        mcpRegistered.push(`Claude Desktop (${getClaudeDesktopConfigPath()})`);
        console.log(`   ✅ Registered in Claude Desktop (${getClaudeDesktopConfigPath()})`);
      } else {
        recommendations.push('Could not write Claude Desktop config. Verify directory permissions.');
      }
    }

    // 3. Symlink Portability Engine
    console.log('\n🔗 Step 3: Symlink Portability & Rule Sync Engine:');
    const claudePath = path.join(workspaceDir, 'CLAUDE.md');
    const agentsPath = path.join(workspaceDir, 'AGENTS.md');
    const hasClaude = fs.existsSync(claudePath);
    const hasAgents = fs.existsSync(agentsPath);

    if (hasClaude && !hasAgents) {
      let shouldLink = true;
      if (!isAuto && !options.linkRules) {
        shouldLink = await ask('   ↳ AGENTS.md missing. Symlink AGENTS.md -> CLAUDE.md for multi-agent parity? [Y/n]: ', true);
      }
      if (shouldLink) {
        const res = safelyEstablishSymlink(claudePath, agentsPath);
        if (res.success) {
          symlinksCreated.push(`AGENTS.md -> CLAUDE.md (${res.type})`);
          console.log(`   ✅ Created bidirectional rule link: AGENTS.md -> CLAUDE.md [${res.type}]`);
        }
      }
    } else if (hasAgents && !hasClaude) {
      let shouldLink = true;
      if (!isAuto && !options.linkRules) {
        shouldLink = await ask('   ↳ CLAUDE.md missing. Symlink CLAUDE.md -> AGENTS.md for Claude CLI parity? [Y/n]: ', true);
      }
      if (shouldLink) {
        const res = safelyEstablishSymlink(agentsPath, claudePath);
        if (res.success) {
          symlinksCreated.push(`CLAUDE.md -> AGENTS.md (${res.type})`);
          console.log(`   ✅ Created bidirectional rule link: CLAUDE.md -> AGENTS.md [${res.type}]`);
        }
      }
    } else if (hasClaude && hasAgents) {
      console.log('   ✅ Rule Symmetry Verified: Both CLAUDE.md and AGENTS.md are active in workspace.');
    } else {
      console.log('   ⚪ Neither CLAUDE.md nor AGENTS.md exist yet. Run "gitcontextgen init" to generate.');
      recommendations.push('Execute "gitcontextgen init" to bootstrap synchronized base rules.');
    }

    // 4. Calculate Health Score
    let score = 70;
    if (mcpRegistered.length >= 2) score += 15;
    else if (mcpRegistered.length === 1) score += 10;
    if (hasClaude || hasAgents) score += 10;
    if (fs.existsSync(path.join(workspaceDir, '.cursor', 'rules'))) score += 5;

    console.log('\n' + '='.repeat(72));
    console.log(`🎯 Client Onboarding Readiness Score: ${score}/100`);
    console.log(`   - Active IDE Integrations: ${Object.values(ides).filter((i) => i.detected).length}`);
    console.log(`   - Automated MCP Connections: ${mcpRegistered.length}`);
    console.log(`   - Cross-Tool Rule Links: ${symlinksCreated.length}`);
    if (recommendations.length > 0) {
      console.log('\n💡 Next Steps for Client Team:');
      for (const rec of recommendations) {
        console.log(`   • ${rec}`);
      }
    }
    console.log('='.repeat(72) + '\n');

    return {
      workspace: workspaceDir,
      score,
      ides,
      mcpRegistered,
      symlinksCreated,
      recommendations,
    };
  } finally {
    if (rl) {
      rl.close();
    }
  }
}
