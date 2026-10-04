import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';

export type MemoryCategory = 'architecture' | 'bug_fix' | 'convention' | 'env_config';

export interface AgentMemory {
  id: string;
  repo_id: string;
  session_id?: string;
  category: MemoryCategory | string;
  memory_type?: string;
  topic: string;
  content: string;
  tags?: string;
  created_at: string;
  updated_at: string;
  commit_sha?: string;
  source_agent: string;
}

export interface RememberInput {
  repo_id?: string;
  session_id?: string;
  topic?: string;
  key?: string;
  decision_summary?: string;
  code_rationale?: string;
  content?: string;
  category?: MemoryCategory | string;
  memory_type?: string;
  tags?: string[];
  commit_sha?: string;
  source_agent?: string;
}

export interface RecallInput {
  repo_id?: string;
  query?: string;
  category?: string;
  limit?: number;
}

export interface MemoryStats {
  totalMemories: number;
  categories: Record<string, number>;
  lastUpdated?: string;
  dbPath: string;
  engine: 'node:sqlite' | 'fallback_json';
}

/**
 * Normalizes a repository path or identifier into a canonical repo_id
 */
export function normalizeRepoId(targetPath?: string): string {
  if (!targetPath || targetPath === '.' || targetPath === './') {
    return path.basename(process.cwd()).toLowerCase();
  }
  const cleaned = targetPath.trim().replace(/\/$/, '');
  const ghMatch = cleaned.match(/(?:github\.com\/)?([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/);
  if (ghMatch) {
    return `${ghMatch[1]}/${ghMatch[2].replace(/\.git$/, '')}`.toLowerCase();
  }
  return path.basename(path.resolve(cleaned)).toLowerCase();
}

/**
 * Returns the resolved directory for storing the local repository SQLite database
 */
export function getLocalMemoryDirectory(repoPath: string = process.cwd()): string {
  const dir = path.join(path.resolve(repoPath), '.gitcontextgen');
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {}
  }
  return dir;
}

/**
 * Returns the resolved directory for global memory mirroring (~/.gitcontextgen)
 */
export function getGlobalMemoryDirectory(): string {
  const dir = path.join(os.homedir(), '.gitcontextgen');
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {}
  }
  return dir;
}

/**
 * Resolves the primary memory.db path
 */
export function getMemoryDbPath(repoPath: string = process.cwd()): string {
  try {
    const localDir = getLocalMemoryDirectory(repoPath);
    return path.join(localDir, 'memory.db');
  } catch {
    return path.join(getGlobalMemoryDirectory(), 'memory.db');
  }
}

// ============================================================================
// Driver Abstraction (node:sqlite -> JSON fallback)
// ============================================================================

interface DatabaseDriver {
  engine: 'node:sqlite' | 'fallback_json';
  exec(sql: string): void;
  run(sql: string, params: any[]): void;
  query<T = any>(sql: string, params: any[]): T[];
}

let cachedDriver: DatabaseDriver | null = null;

async function getDatabaseDriver(dbPath: string): Promise<DatabaseDriver> {
  if (cachedDriver) return cachedDriver;

  try {
    // Dynamically import node:sqlite for Node 22+ ESM
    // @ts-ignore
    const { DatabaseSync } = await import('node:sqlite');
    const db = new DatabaseSync(dbPath);
    cachedDriver = {
      engine: 'node:sqlite',
      exec: (sql: string) => db.exec(sql),
      run: (sql: string, params: any[]) => {
        const stmt = db.prepare(sql);
        stmt.run(...params);
      },
      query: <T = any>(sql: string, params: any[]): T[] => {
        const stmt = db.prepare(sql);
        return stmt.all(...params) as T[];
      },
    };
    return cachedDriver;
  } catch {
    // node:sqlite not available
  }

  // Resilient JSON store fallback
  const jsonPath = dbPath.replace(/\.db$/, '.json');
  cachedDriver = {
    engine: 'fallback_json',
    exec: () => {},
    run: (sql: string, params: any[]) => {
      try {
        let memories: AgentMemory[] = [];
        if (fs.existsSync(jsonPath)) {
          memories = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        }
        if (sql.includes('INSERT')) {
          const [id, repo_id, category, topic, content, source_agent] = params;
          const now = new Date().toISOString();
          memories.push({
            id,
            repo_id,
            category,
            topic,
            content,
            created_at: now,
            updated_at: now,
            source_agent: source_agent || 'mcp_client',
          });
          fs.writeFileSync(jsonPath, JSON.stringify(memories, null, 2), 'utf-8');
        }
      } catch {}
    },
    query: <T = any>(_sql: string, _params: any[]): T[] => {
      try {
        if (fs.existsSync(jsonPath)) {
          const memories: AgentMemory[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
          return memories as unknown as T[];
        }
      } catch {}
      return [] as T[];
    },
  };

  return cachedDriver;
}

/**
 * Initializes the SQLite agent_memories table and indexes
 */
export async function initMemoryStore(repoPath: string = process.cwd()): Promise<DatabaseDriver> {
  const dbPath = getMemoryDbPath(repoPath);
  const driver = await getDatabaseDriver(dbPath);

  driver.exec(`
    CREATE TABLE IF NOT EXISTS agent_memories (
      id TEXT PRIMARY KEY,
      repo_id TEXT NOT NULL,
      session_id TEXT,
      category TEXT NOT NULL,
      memory_type TEXT,
      topic TEXT NOT NULL,
      content TEXT NOT NULL,
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      commit_sha TEXT,
      source_agent TEXT DEFAULT 'mcp_client'
    );

    CREATE INDEX IF NOT EXISTS idx_repo_category ON agent_memories(repo_id, category);
    CREATE INDEX IF NOT EXISTS idx_repo_topic ON agent_memories(repo_id, topic);
  `);

  try { driver.exec('ALTER TABLE agent_memories ADD COLUMN session_id TEXT;'); } catch {}
  try { driver.exec('ALTER TABLE agent_memories ADD COLUMN memory_type TEXT;'); } catch {}
  try { driver.exec('ALTER TABLE agent_memories ADD COLUMN tags TEXT;'); } catch {}
  try { driver.exec('ALTER TABLE agent_memories ADD COLUMN commit_sha TEXT;'); } catch {}

  return driver;
}

/**
 * Explicit Memory Capture: Stores an architectural decision or convention into .gitcontextgen/memory.db
 */
export async function rememberMemory(input: RememberInput, repoPath: string = process.cwd()): Promise<AgentMemory> {
  const driver = await initMemoryStore(repoPath);
  const repo_id = input.repo_id || normalizeRepoId(repoPath);
  const id = 'mem_' + Date.now().toString(36) + '_' + crypto.randomBytes(3).toString('hex');
  const source_agent = input.source_agent || 'mcp_client';

  let formattedContent = input.content || '';
  if (input.decision_summary || input.code_rationale) {
    formattedContent = [
      input.decision_summary ? `### Decision\n${input.decision_summary}` : '',
      input.code_rationale ? `### Rationale\n${input.code_rationale}` : '',
      input.content ? `### Details\n${input.content}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');
  }
  if (input.tags && input.tags.length > 0) {
    formattedContent = formattedContent
      ? `${formattedContent}\n\nTags: ${input.tags.join(', ')}`
      : `Tags: ${input.tags.join(', ')}`;
  }

  const category = input.category || input.memory_type || 'architecture';
  const memory_type = input.memory_type || category;
  const topic = (input.topic || input.key || 'Agent Memory').trim();
  const tagsStr = input.tags ? JSON.stringify(input.tags) : null;
  const session_id = input.session_id || null;
  const commit_sha = input.commit_sha || null;

  driver.run(
    `INSERT INTO agent_memories (id, repo_id, session_id, category, memory_type, topic, content, tags, commit_sha, source_agent)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, repo_id, session_id, category, memory_type, topic, formattedContent, tagsStr, commit_sha, source_agent]
  );

  return {
    id,
    repo_id,
    session_id: session_id || undefined,
    category,
    memory_type,
    topic,
    content: formattedContent,
    tags: tagsStr || undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    commit_sha: commit_sha || undefined,
    source_agent,
  };
}

/**
 * Lists stored agent memories with optional category and limit filters
 */
export async function listMemories(
  input: { repo_id?: string; category?: string; limit?: number } = {},
  repoPath: string = process.cwd()
): Promise<AgentMemory[]> {
  return recallMemories(input, repoPath);
}

/**
 * Memory Retrieval: Searches agent memories with sub-millisecond SQLite index latency
 */
export async function recallMemories(input: RecallInput, repoPath: string = process.cwd()): Promise<AgentMemory[]> {
  const driver = await initMemoryStore(repoPath);
  const repo_id = input.repo_id || normalizeRepoId(repoPath);
  const limit = Math.min(Math.max(input.limit || 10, 1), 50);

  if (driver.engine === 'fallback_json') {
    const all = driver.query<AgentMemory>('', []);
    return all
      .filter((m) => {
        if (m.repo_id !== repo_id) return false;
        if (input.category && m.category !== input.category) return false;
        if (input.query) {
          const q = input.query.toLowerCase();
          return m.topic.toLowerCase().includes(q) || m.content.toLowerCase().includes(q);
        }
        return true;
      })
      .slice(0, limit);
  }

  let sql = 'SELECT * FROM agent_memories WHERE repo_id = ?';
  const params: any[] = [repo_id];

  if (input.category) {
    sql += ' AND category = ?';
    params.push(input.category);
  }

  if (input.query && input.query.trim().length > 0) {
    sql += ' AND (topic LIKE ? OR content LIKE ?)';
    const searchPattern = `%${input.query.trim()}%`;
    params.push(searchPattern, searchPattern);
  }

  sql += ' ORDER BY updated_at DESC LIMIT ?';
  params.push(limit);

  return driver.query<AgentMemory>(sql, params);
}

/**
 * Auto-Capture: Logs git commit message summaries automatically during tool executions
 */
export async function autoCaptureCommit(repoId: string, commitMsg: string, author?: string, repoPath: string = process.cwd()): Promise<void> {
  const topic = commitMsg.split('\n')[0].slice(0, 120);
  const existing = await recallMemories({ repo_id: repoId, query: topic, limit: 1 }, repoPath);
  if (existing.length > 0) return;

  await rememberMemory({
    repo_id: repoId,
    category: commitMsg.includes('fix') ? 'bug_fix' : 'convention',
    topic: `Git Commit: ${topic}`,
    decision_summary: commitMsg,
    code_rationale: `Automated git commit capture by ${author || 'developer'}.`,
    source_agent: 'auto_git_observer',
  }, repoPath);
}

/**
 * Auto-Capture: Logs dependency modifications
 */
export async function autoCaptureDependencyUpdate(repoId: string, depName: string, version: string, repoPath: string = process.cwd()): Promise<void> {
  await rememberMemory({
    repo_id: repoId,
    category: 'env_config',
    topic: `Dependency Tracked: ${depName}@${version}`,
    decision_summary: `Added or verified dependency package boundary.`,
    code_rationale: `Enforces locked manifest boundaries.`,
    source_agent: 'auto_manifest_observer',
  }, repoPath);
}

/**
 * Auto-Capture: Logs AST rule modifications
 */
export async function autoCaptureRuleUpdate(repoId: string, ruleName: string, summary: string, repoPath: string = process.cwd()): Promise<void> {
  await rememberMemory({
    repo_id: repoId,
    category: 'architecture',
    topic: `Architecture Rule Enforced: ${ruleName}`,
    decision_summary: summary,
    code_rationale: `Generated via GitContextGen AST Scanner.`,
    source_agent: 'auto_rules_observer',
  }, repoPath);
}

/**
 * Computes memory statistics for UI badges and diagnostics
 */
export async function getMemoryStats(repoId?: string, repoPath: string = process.cwd()): Promise<MemoryStats> {
  const dbPath = getMemoryDbPath(repoPath);
  const driver = await initMemoryStore(repoPath);
  const canonicalRepoId = repoId || normalizeRepoId(repoPath);

  const categories: Record<string, number> = {
    architecture: 0,
    bug_fix: 0,
    convention: 0,
    env_config: 0,
  };

  const memories = await recallMemories({ repo_id: canonicalRepoId, limit: 50 }, repoPath);
  memories.forEach((m) => {
    categories[m.category] = (categories[m.category] || 0) + 1;
  });

  return {
    totalMemories: memories.length,
    categories,
    lastUpdated: memories[0]?.updated_at,
    dbPath,
    engine: driver.engine,
  };
}
