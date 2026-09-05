import { execSync, spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const mcpDir = path.join(repoRoot, 'mcp-server');

console.log('='.repeat(72));
console.log('🚀 Starting GitContextGen Local Packaging & CLI Distribution Test');
console.log('='.repeat(72));

let tempWorkspace = '';
let isLinked = false;

try {
  // 1. Build MCP Server Distribution
  console.log('\n[STEP 1] Compiling TypeScript CLI & MCP Server...');
  execSync('npm run build', { cwd: mcpDir, stdio: 'inherit' });
  console.log('✅ Compilation Complete.');

  // 2. Link binary globally
  console.log('\n[STEP 2] Running npm link in mcp-server...');
  try {
    execSync('npm link', { cwd: mcpDir, stdio: 'inherit' });
    isLinked = true;
    console.log('✅ npm link registered binary.');
  } catch (linkErr) {
    console.warn('⚠️  npm link warning (might require elevated permissions, falling back to local binary):', linkErr.message);
  }

  // 3. Create mock workspace
  console.log('\n[STEP 3] Creating mock workspace in temp directory...');
  tempWorkspace = path.join(os.tmpdir(), `gitcontextgen-mock-repo-${Date.now()}`);
  fs.mkdirSync(tempWorkspace, { recursive: true });

  const dummyPkg = {
    name: 'sample-enterprise-app',
    version: '1.0.0',
    description: 'Sample workspace for CLI onboarding validation',
    scripts: { dev: 'next dev', build: 'next build', test: 'jest' },
    dependencies: { react: '^19.0.0', next: '^16.0.0' },
  };
  fs.writeFileSync(path.join(tempWorkspace, 'package.json'), JSON.stringify(dummyPkg, null, 2), 'utf-8');
  console.log(`✅ Created test workspace at ${tempWorkspace}`);

  // Determine CLI executable path
  const localCliBin = path.join(mcpDir, 'dist', 'bin', 'cli.js');

  // 4. Test: gitcontextgen init --silent
  console.log('\n[STEP 4] Executing "gitcontextgen init --silent"...');
  let initSuccess = false;
  try {
    if (isLinked) {
      execSync('gitcontextgen init --silent', { cwd: tempWorkspace, stdio: 'inherit' });
      initSuccess = true;
    }
  } catch {
    console.warn('Falling back to direct node execution of built CLI...');
  }

  if (!initSuccess) {
    execSync(`node "${localCliBin}" init --silent`, { cwd: tempWorkspace, stdio: 'inherit' });
  }

  // 5. Assertions on generated files
  console.log('\n[STEP 5] Validating generated workspace context files...');
  const mdcFile = path.join(tempWorkspace, '.cursor', 'rules', 'project-rules.mdc');
  const claudeFile = path.join(tempWorkspace, 'CLAUDE.md');

  if (!fs.existsSync(mdcFile)) {
    throw new Error(`Assertion failed: .cursor/rules/project-rules.mdc was not created at ${mdcFile}`);
  }
  if (!fs.existsSync(claudeFile)) {
    throw new Error(`Assertion failed: CLAUDE.md was not created at ${claudeFile}`);
  }

  const mdcContent = fs.readFileSync(mdcFile, 'utf-8');
  const claudeContent = fs.readFileSync(claudeFile, 'utf-8');

  if (!mdcContent.includes('alwaysApply: true')) {
    throw new Error('Assertion failed: project-rules.mdc is missing "alwaysApply: true" frontmatter');
  }
  if (!mdcContent.startsWith('---')) {
    throw new Error('Assertion failed: project-rules.mdc must start with YAML frontmatter delimiter (---)');
  }
  if (!claudeContent.includes('project-rules.mdc')) {
    throw new Error('Assertion failed: CLAUDE.md does not cross-reference project-rules.mdc');
  }
  console.log('✅ Rules Verification Passed: Both rule files exist with valid alwaysApply: true and cross-sync headers.');

  // 6. Test: gitcontextgen analyze
  console.log('\n[STEP 6] Executing "gitcontextgen analyze --json"...');
  const analyzeOutput = execSync(`node "${localCliBin}" analyze --json`, {
    cwd: tempWorkspace,
    encoding: 'utf-8',
  });
  const parsedAnalysis = JSON.parse(analyzeOutput);
  if (parsedAnalysis.manifest.ecosystem !== 'npm' || !parsedAnalysis.manifest.dependencies.includes('react')) {
    throw new Error(`Analyze assertion failed: ${analyzeOutput}`);
  }
  console.log('✅ CLI Analysis Command Passed: Correctly identified project structure, ecosystem, and dependencies.');

  // 7. Test: gitcontextgen mcp stdio handshake
  console.log('\n[STEP 7] Executing "gitcontextgen mcp" stdio handshake...');
  const mcpProcess = spawn('node', [localCliBin, 'mcp'], {
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  const handshakePromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      mcpProcess.kill();
      reject(new Error('MCP handshake timed out after 5000ms'));
    }, 5000);

    let output = '';
    mcpProcess.stdout.on('data', (chunk) => {
      output += chunk.toString();
      const lines = output.split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const res = JSON.parse(line.trim());
          if (res.id === 1 && res.result?.serverInfo?.name) {
            clearTimeout(timeout);
            mcpProcess.stdin.end();
            mcpProcess.kill();
            resolve(res.result.serverInfo);
            return;
          }
        } catch {}
      }
    });

    const initMsg = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test-distribution-client', version: '1.0.0' },
      },
    };
    mcpProcess.stdin.write(JSON.stringify(initMsg) + '\n');
  });

  const serverInfo = await handshakePromise;
  console.log(`✅ MCP Command Handshake Passed: Connected to "${serverInfo.name}" v${serverInfo.version}`);

  console.log('\n' + '='.repeat(72));
  console.log('🎉 ALL CLI PACKAGING & DISTRIBUTION TESTS PASSED (Exit code 0)');
  console.log('='.repeat(72) + '\n');
  process.exitCode = 0;
} catch (err) {
  console.error('\n' + '='.repeat(72));
  console.error('❌ CLI DISTRIBUTION TEST FAILED:', err.message);
  console.error('='.repeat(72) + '\n');
  process.exitCode = 1;
} finally {
  // 8. Cleanup & Unlink
  if (isLinked) {
    try {
      console.log('Cleaning up npm link...');
      execSync('npm unlink', { cwd: mcpDir, stdio: 'ignore' });
    } catch {}
  }
  if (tempWorkspace && fs.existsSync(tempWorkspace)) {
    try {
      fs.rmSync(tempWorkspace, { recursive: true, force: true });
    } catch {}
  }
  if (process.exitCode === 1) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}
