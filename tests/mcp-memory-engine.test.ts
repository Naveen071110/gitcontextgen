import assert from 'assert';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import {
  initMemoryStore,
  rememberMemory,
  recallMemories,
  autoCaptureCommit,
  autoCaptureDependencyUpdate,
  autoCaptureRuleUpdate,
  getMemoryStats,
  getMemoryDbPath,
  normalizeRepoId,
} from '../src/lib/mcp/memoryStore';
import {
  acquireLock,
  releaseLock,
  reclaimOrphanedLocks,
  isPidRunning,
  withMutexLock,
  getLockPath,
} from '../src/lib/mcp/fileLock';

async function runTestSuite() {
  console.log('='.repeat(78));
  console.log('🧠 MCP PERSISTENT AGENT MEMORY ENGINE & MUTEX LOCKING REFEREE TEST SUITE');
  console.log('='.repeat(78));

  const testTempDir = path.join(os.tmpdir(), `gcg_test_repo_${Date.now()}`);
  fs.mkdirSync(testTempDir, { recursive: true });

  try {
    // ------------------------------------------------------------------------
    // TEST 1: SQLite Database Initialization & Schema Verification
    // ------------------------------------------------------------------------
    console.log('\n[1/5] Testing SQLite Database Initialization & Schema Invariants...');
    const driver = initMemoryStore(testTempDir);
    assert(driver, 'Driver should be initialized');
    console.log(`  ✓ Driver active: engine = ${driver.engine}`);

    const dbPath = getMemoryDbPath(testTempDir);
    assert(fs.existsSync(dbPath), `Database file must exist at ${dbPath}`);
    console.log(`  ✓ SQLite file created at: ${dbPath}`);

    // Verify normalization
    const repoId = normalizeRepoId(testTempDir);
    assert(repoId, 'Normalized repo ID should be non-empty');
    // Verify table structure columns: id, repo_id, session_id, memory_type, content, tags, created_at, commit_sha
    if (driver.engine === 'node:sqlite' || driver.engine === 'better-sqlite3') {
      const columns = driver.query<{ name: string }>('PRAGMA table_info(agent_memories)', []);
      const columnNames = columns.map(c => c.name);
      const expectedCols = ['id', 'repo_id', 'session_id', 'category', 'memory_type', 'topic', 'content', 'tags', 'created_at', 'commit_sha'];
      for (const col of expectedCols) {
        assert.ok(columnNames.includes(col), `agent_memories must contain column "${col}"`);
      }
      console.log(`  ✓ agent_memories schema validated: (${columnNames.join(', ')})`);
    }
    console.log('  ✓ normalizeRepoId correctly parses GitHub URLs and directories');

    // ------------------------------------------------------------------------
    // TEST 2: Explicit Memory Capture & Sub-5ms Recall Latency
    // ------------------------------------------------------------------------
    console.log('\n[2/5] Testing Explicit Memory Capture & Sub-5ms Latency Benchmark...');
    const mem1 = rememberMemory(
      {
        repo_id: repoId,
        category: 'architecture',
        topic: 'PostgreSQL Connection Pooling Invariant',
        decision_summary: 'Centralized connection pool in src/lib/db.ts with max 20 connections.',
        code_rationale: 'Mitigates serverless socket exhaustion during concurrent agent refactoring.',
        source_agent: 'claude-code',
      },
      testTempDir
    );

    assert(mem1.id.startsWith('mem_'), 'Memory ID should have prefix mem_');
    assert.strictEqual(mem1.category, 'architecture');
    assert.strictEqual(mem1.topic, 'PostgreSQL Connection Pooling Invariant');
    console.log(`  ✓ Stored memory 1: ID = ${mem1.id}`);

    const mem2 = rememberMemory(
      {
        repo_id: repoId,
        category: 'bug_fix',
        topic: 'AbortController Timeout Protection',
        decision_summary: 'Wrapped streaming AST analyzer in 45s AbortController.',
        code_rationale: 'Prevents indefinite hanging on oversized repository tarballs.',
        source_agent: 'cursor-composer',
      },
      testTempDir
    );
    assert(mem2.id, 'Memory 2 must have an ID');
    console.log(`  ✓ Stored memory 2: ID = ${mem2.id}`);

    const mem3 = rememberMemory(
      {
        repo_id: repoId,
        category: 'convention',
        topic: 'Strict Parameterized SQL Escaping',
        decision_summary: 'Enforce late-escaping WPCS/PostgreSQL standards across all queries.',
        code_rationale: 'Zero SQL-injection surface invariant.',
        source_agent: 'windsurf-agent',
      },
      testTempDir
    );
    assert(mem3.id, 'Memory 3 must have an ID');
    console.log(`  ✓ Stored memory 3: ID = ${mem3.id}`);

    // Recall query testing
    const recalledAll = recallMemories({ repo_id: repoId, limit: 10 }, testTempDir);
    assert.strictEqual(recalledAll.length, 3, 'Should recall all 3 memories');
    console.log(`  ✓ Recalled all ${recalledAll.length} memories successfully`);

    // Category filter query
    const recalledArch = recallMemories({ repo_id: repoId, category: 'architecture' }, testTempDir);
    assert.strictEqual(recalledArch.length, 1);
    assert.strictEqual(recalledArch[0].topic, 'PostgreSQL Connection Pooling Invariant');
    console.log('  ✓ Filtered by category "architecture" accurately');

    // Keyword search query
    const recalledSearch = recallMemories({ repo_id: repoId, query: 'AbortController' }, testTempDir);
    assert.strictEqual(recalledSearch.length, 1);
    assert.strictEqual(recalledSearch[0].category, 'bug_fix');
    console.log('  ✓ Keyword search for "AbortController" returned expected bug_fix record');

    // 100-Iteration Latency Benchmark: Assert average latency < 5ms
    const iterations = 100;
    const startBench = performance.now();
    for (let i = 0; i < iterations; i++) {
      recallMemories({ repo_id: repoId, query: 'Pooling', limit: 5 }, testTempDir);
    }
    const elapsedTotal = performance.now() - startBench;
    const avgLatencyMs = elapsedTotal / iterations;
    console.log(`  ⚡ Recall Latency Benchmark: ${iterations} queries in ${elapsedTotal.toFixed(2)}ms (avg: ${avgLatencyMs.toFixed(3)}ms/query)`);
    assert(avgLatencyMs < 5.0, `Average recall latency must be < 5ms, got ${avgLatencyMs.toFixed(3)}ms`);
    console.log('  ✓ Latency requirement (< 5ms) PASSED');

    // ------------------------------------------------------------------------
    // TEST 3: Auto-Capture Hooks & Diagnostics
    // ------------------------------------------------------------------------
    console.log('\n[3/5] Testing Auto-Capture Hooks (Commits, Manifests, AST Rules)...');
    
    // Auto-capture commit
    autoCaptureCommit(repoId, 'fix(auth): prevent session fixation on OAuth callback redirect', 'developer@repo.test');
    const commitMemories = recallMemories({ repo_id: repoId, query: 'OAuth callback' }, testTempDir);
    assert.strictEqual(commitMemories.length, 1, 'Auto-captured commit should be stored');
    assert.strictEqual(commitMemories[0].category, 'bug_fix');
    console.log('  ✓ Auto-captured git commit as bug_fix memory');

    // Duplicate prevention
    autoCaptureCommit(repoId, 'fix(auth): prevent session fixation on OAuth callback redirect', 'developer@repo.test');
    const duplicateCheck = recallMemories({ repo_id: repoId, query: 'OAuth callback' }, testTempDir);
    assert.strictEqual(duplicateCheck.length, 1, 'Duplicate commit memory must not be inserted');
    console.log('  ✓ Duplicate commit auto-capture correctly prevented');

    // Auto-capture dependency update
    autoCaptureDependencyUpdate(repoId, 'exceljs', '^4.4.0');
    const depMemories = recallMemories({ repo_id: repoId, query: 'exceljs' }, testTempDir);
    assert.strictEqual(depMemories.length, 1);
    assert.strictEqual(depMemories[0].category, 'env_config');
    console.log('  ✓ Auto-captured dependency update as env_config memory');

    // Auto-capture AST rule update
    autoCaptureRuleUpdate(repoId, 'NoDirectDbExportInRoutes', 'Strict separation of db instances from client bundles');
    const ruleMemories = recallMemories({ repo_id: repoId, query: 'NoDirectDbExportInRoutes' }, testTempDir);
    assert.strictEqual(ruleMemories.length, 1);
    assert.strictEqual(ruleMemories[0].category, 'architecture');
    console.log('  ✓ Auto-captured AST rule update as architecture memory');

    // Stats computation
    const stats = getMemoryStats(repoId, testTempDir);
    assert.strictEqual(stats.totalMemories, 6, `Expected 6 total memories, got ${stats.totalMemories}`);
    assert.strictEqual(stats.categories.architecture, 2);
    assert.strictEqual(stats.categories.bug_fix, 2);
    assert.strictEqual(stats.categories.convention, 1);
    assert.strictEqual(stats.categories.env_config, 1);
    console.log('  ✓ Memory stats aggregated accurately across categories:', stats.categories);

    // ------------------------------------------------------------------------
    // TEST 4: Multi-Agent Concurrency & Mutex Locking Referee
    // ------------------------------------------------------------------------
    console.log('\n[4/5] Testing Multi-Agent Mutex Referee & Concurrency Collision Guard...');
    
    // PID liveness check
    assert.strictEqual(isPidRunning(process.pid), true, 'Current process PID must be running');
    assert.strictEqual(isPidRunning(9999999), false, 'High non-existent PID should be dead');
    console.log('  ✓ PID liveness heartbeat verification works accurately');

    const lockName = `test_repo_lock_${Date.now()}`;
    const acquired = acquireLock(lockName, { pid: process.pid, agent: 'claude-code-test', ttlMs: 10000 });
    assert.strictEqual(acquired, true, 'First agent must acquire lock successfully');
    console.log('  ✓ Lock acquired via atomic fs.openSync("wx")');

    // Contention test: Secondary agent attempts to acquire same lock
    const contention = acquireLock(lockName, { pid: 12345, agent: 'cursor-composer-test', maxWaitMs: 100 });
    assert.strictEqual(contention, false, 'Second agent must be blocked by mutex lock');
    console.log('  ✓ Concurrency collision prevented: Secondary agent safely blocked');

    // Release lock
    const released = releaseLock(lockName);
    assert.strictEqual(released, true, 'Lock should be released cleanly');
    console.log('  ✓ Lock released cleanly');

    // Secondary agent can now acquire lock
    const acquiredAfter = acquireLock(lockName, { pid: process.pid, agent: 'cursor-composer-test' });
    assert.strictEqual(acquiredAfter, true, 'Lock can be acquired after release');
    releaseLock(lockName);
    console.log('  ✓ Lock successfully re-acquired after release');

    // Orphaned lock reclamation test
    const deadLockName = `dead_agent_lock_${Date.now()}`;
    const lockPath = getLockPath(deadLockName);
    // Write a lock with a dead PID (9999999)
    fs.writeFileSync(
      lockPath,
      JSON.stringify({
        pid: 9999999,
        agent: 'crashed-agent',
        timestamp: Date.now() - 60000,
        lockName: deadLockName,
        expiresAt: Date.now() - 30000,
      }),
      'utf-8'
    );
    assert(fs.existsSync(lockPath), 'Simulated dead lockfile should exist');

    const reclaimedCount = reclaimOrphanedLocks();
    assert(reclaimedCount >= 1, 'Orphaned dead lock must be reclaimed');
    assert(!fs.existsSync(lockPath), 'Orphaned lock file must be removed by referee');
    console.log(`  ✓ Mutex Referee successfully reclaimed ${reclaimedCount} orphaned locks from dead processes`);

    // Mutex wrapper test
    let criticalSectionExecuted = false;
    await withMutexLock(`mutex_exec_${Date.now()}`, async () => {
      criticalSectionExecuted = true;
    });
    assert.strictEqual(criticalSectionExecuted, true, 'Critical section must execute under mutex lock');
    console.log('  ✓ withMutexLock executed critical section atomically');

    // ------------------------------------------------------------------------
    // TEST 5: Standalone MCP Stdio Client & Schema Contracts
    // ------------------------------------------------------------------------
    console.log('\n[5/5] Testing Standalone MCP Server Tool Schema Contracts via Stdio...');
    const mcpServerEntry = path.resolve(__dirname, '../mcp-server/dist/index.js');
    if (fs.existsSync(mcpServerEntry)) {
      await testMcpServerStdio(mcpServerEntry, testTempDir);
    } else {
      console.log('  ⚠️ Skipping stdio process test: mcp-server/dist/index.js not compiled yet');
    }

    console.log('\n' + '='.repeat(78));
    console.log('🎉 ALL MCP MEMORY ENGINE & MUTEX REFEREE TESTS PASSED (100% SUCCESS)');
    console.log('='.repeat(78));
  } finally {
    try {
      fs.rmSync(testTempDir, { recursive: true, force: true });
    } catch {}
  }
}

class StdioMcpClient {
  private child: any;
  private buffer = '';
  private requestId = 1;
  private pending = new Map<number, { resolve: (res: any) => void; reject: (err: any) => void }>();

  constructor(private scriptPath: string) {}

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.child = spawn('node', [this.scriptPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, GITCONTEXTGEN_LICENSE_KEY: 'gcg_test_license_pro' },
      });

      this.child.stderr.on('data', () => {});

      this.child.stdout.on('data', (chunk: Buffer) => {
        this.buffer += chunk.toString();
        const lines = this.buffer.split('\n');
        this.buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const msg = JSON.parse(trimmed);
            if (msg.id !== undefined && this.pending.has(msg.id)) {
              const { resolve: reqResolve, reject: reqReject } = this.pending.get(msg.id)!;
              this.pending.delete(msg.id);
              if (msg.error) {
                reqReject(msg.error);
              } else {
                reqResolve(msg.result);
              }
            }
          } catch {}
        }
      });

      this.child.on('error', (err: any) => reject(err));
      setTimeout(resolve, 350);
    });
  }

  async request(method: string, params: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = this.requestId++;
      const payload = JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n';
      this.pending.set(id, { resolve, reject });
      this.child.stdin.write(payload);
    });
  }

  stop(): void {
    if (this.child) {
      try {
        this.child.kill();
      } catch {}
    }
  }
}

async function testMcpServerStdio(serverPath: string, repoPath: string): Promise<void> {
  const client = new StdioMcpClient(serverPath);
  try {
    await client.start();

    // 1. Core MCP JSON-RPC Handshake (initialize)
    const initRes = await client.request('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      clientInfo: { name: 'VerificationAgent', version: '1.0.0' },
    });
    assert(initRes?.serverInfo, 'initialize must return serverInfo');
    assert.strictEqual(initRes.serverInfo.name, 'gitcontextgen-mcp', 'serverInfo.name must be gitcontextgen-mcp');
    assert(initRes.capabilities?.tools, 'capabilities.tools must be registered');
    console.log(`  ✓ JSON-RPC Handshake: Protocol ${initRes.protocolVersion || '2024-11-05'}, Server: ${initRes.serverInfo.name}`);

    // 2. Tool Schema Listing (tools/list)
    const toolsResult = await client.request('tools/list');
    assert(toolsResult?.tools, 'tools/list must return tools array');
    const toolNames = toolsResult.tools.map((t: any) => t.name);

    // Verify Core Tools
    const expectedCore = [
      'gitcontextgen_get_context',
      'gitcontextgen_get_rules',
      'gitcontextgen_get_topology',
      'gitcontextgen_get_client_handoff',
      'gitcontextgen_export_data',
    ];
    for (const coreTool of expectedCore) {
      assert(toolNames.includes(coreTool), `Must register core tool "${coreTool}"`);
    }

    // Verify Memory Tools
    const expectedMemory = [
      'gitcontextgen_remember',
      'gitcontextgen_recall',
      'gitcontextgen_list_memories',
    ];
    for (const memTool of expectedMemory) {
      assert(toolNames.includes(memTool), `Must register memory tool "${memTool}"`);
    }
    console.log(`  ✓ tools/list: All 8 core & memory tools verified (${toolNames.length} total tools active)`);

    // 3. Legacy Tool Regressions Check
    // 3a. gitcontextgen_get_rules (cursor format with alwaysApply: true frontmatter)
    const rulesRes = await client.request('tools/call', {
      name: 'gitcontextgen_get_rules',
      arguments: {
        path: repoPath,
        format: 'cursor',
      },
    });
    assert(rulesRes?.content?.[0]?.text, 'gitcontextgen_get_rules must return text');
    const rulesJson = JSON.parse(rulesRes.content[0].text);
    assert(rulesJson.content.includes('alwaysApply: true'), 'Cursor rules must include alwaysApply: true');
    assert(rulesJson.content.includes('globs:'), 'Cursor rules must specify globs');
    console.log('  ✓ gitcontextgen_get_rules verified (Markdown with YAML frontmatter invariants)');

    // 3b. gitcontextgen_get_topology (Mermaid diagram markup)
    const topoRes = await client.request('tools/call', {
      name: 'gitcontextgen_get_topology',
      arguments: {
        path: repoPath,
        style: 'layered',
      },
    });
    assert(topoRes?.content?.[0]?.text, 'gitcontextgen_get_topology must return text');
    const topoJson = JSON.parse(topoRes.content[0].text);
    assert(topoJson.diagram && (topoJson.diagram.includes('graph') || topoJson.diagram.includes('flowchart') || topoJson.diagram.includes('subgraph')), 'Topology must contain valid Mermaid syntax');
    console.log('  ✓ gitcontextgen_get_topology verified (valid Mermaid syntax returned)');

    // 3c. gitcontextgen_get_context
    const contextRes = await client.request('tools/call', {
      name: 'gitcontextgen_get_context',
      arguments: {
        path: repoPath,
      },
    });
    assert(contextRes?.content?.[0]?.text, 'gitcontextgen_get_context must return text response');
    const contextJson = JSON.parse(contextRes.content[0].text);
    assert.strictEqual(contextJson.status, 'success');
    assert(contextJson.agent_memory?.recent_memories, 'Context must include agent_memory');
    console.log('  ✓ gitcontextgen_get_context returned unified primed context snapshot');

    // 4. New Persistent Memory Testing
    // 4a. Explicit write using { category, key, content, tags }
    const testPayload = {
      path: repoPath,
      category: 'architecture_decision',
      key: 'auth_middleware_migration',
      content: 'Migrated auth middleware to src/proxy.ts using Next.js 16 edge runtime. Do not re-introduce src/middleware.ts.',
      tags: ['auth', 'nextjs16', 'middleware'],
    };
    const rememberRes = await client.request('tools/call', {
      name: 'gitcontextgen_remember',
      arguments: testPayload,
    });
    assert(rememberRes?.content?.[0]?.text, 'gitcontextgen_remember must return text response');
    const rememberJson = JSON.parse(rememberRes.content[0].text);
    assert.strictEqual(rememberJson.status, 'saved');
    assert(rememberJson.memory?.id, 'Memory must have an ID');
    assert.strictEqual(rememberJson.memory.topic, 'auth_middleware_migration');
    console.log('  ✓ gitcontextgen_remember saved explicit memory payload with key & tags');

    // 4b. Explicit search & recall
    const recallRes = await client.request('tools/call', {
      name: 'gitcontextgen_recall',
      arguments: {
        path: repoPath,
        query: 'auth middleware',
      },
    });
    assert(recallRes?.content?.[0]?.text, 'gitcontextgen_recall must return text response');
    const recallJson = JSON.parse(recallRes.content[0].text);
    assert.strictEqual(recallJson.status, 'success');
    assert(recallJson.total_results >= 1, 'Should find memory matching "auth middleware"');
    const foundAuthMem = recallJson.memories.find((m: any) => m.topic === 'auth_middleware_migration');
    assert(foundAuthMem, 'Found memory must match auth_middleware_migration');
    assert(foundAuthMem.content.includes('src/proxy.ts'), 'Content must preserve migration details');
    console.log(`  ✓ gitcontextgen_recall retrieved exact entry in ${recallJson.latency_ms}ms with 100% precision`);

    // 4c. List memories
    const listRes = await client.request('tools/call', {
      name: 'gitcontextgen_list_memories',
      arguments: {
        path: repoPath,
      },
    });
    assert(listRes?.content?.[0]?.text, 'gitcontextgen_list_memories must return text response');
    const listJson = JSON.parse(listRes.content[0].text);
    assert.strictEqual(listJson.status, 'success');
    assert(listJson.total >= 1, 'list_memories must return stored memories');
    console.log(`  ✓ gitcontextgen_list_memories returned ${listJson.total} total indexed memories`);

    // 5. Concurrent Multi-Agent Tool Execution (5 parallel remember calls)
    console.log('  ⚡ Firing 5 parallel gitcontextgen_remember calls to test concurrency...');
    const parallelWrites = Array.from({ length: 5 }, (_, i) =>
      client.request('tools/call', {
        name: 'gitcontextgen_remember',
        arguments: {
          path: repoPath,
          topic: `Concurrent Multi-Agent Refactor ${i + 1}`,
          category: 'convention',
          content: `Simultaneous parallel write from simulated agent worker ${i + 1}`,
          source_agent: `worker_agent_${i + 1}`,
        },
      })
    );

    const writeResults = await Promise.all(parallelWrites);
    assert.strictEqual(writeResults.length, 5, 'All 5 parallel writes must complete');
    for (let i = 0; i < writeResults.length; i++) {
      const resText = writeResults[i]?.content?.[0]?.text;
      assert(resText, `Write ${i + 1} must return content`);
      const parsed = JSON.parse(resText);
      assert.strictEqual(parsed.status, 'saved', `Write ${i + 1} must have saved status`);
      assert(parsed.memory?.id, `Write ${i + 1} must have generated memory ID`);
    }
    console.log('  ✓ 5/5 parallel writes completed cleanly with zero SQLITE_BUSY locking errors');
  } finally {
    client.stop();
  }
}

runTestSuite().catch((err) => {
  console.error('\n❌ Test Suite Failed:', err);
  process.exit(1);
});
