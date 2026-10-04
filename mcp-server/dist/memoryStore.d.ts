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
export declare function normalizeRepoId(targetPath?: string): string;
/**
 * Returns the resolved directory for storing the local repository SQLite database
 */
export declare function getLocalMemoryDirectory(repoPath?: string): string;
/**
 * Returns the resolved directory for global memory mirroring (~/.gitcontextgen)
 */
export declare function getGlobalMemoryDirectory(): string;
/**
 * Resolves the primary memory.db path
 */
export declare function getMemoryDbPath(repoPath?: string): string;
interface DatabaseDriver {
    engine: 'node:sqlite' | 'fallback_json';
    exec(sql: string): void;
    run(sql: string, params: any[]): void;
    query<T = any>(sql: string, params: any[]): T[];
}
/**
 * Initializes the SQLite agent_memories table and indexes
 */
export declare function initMemoryStore(repoPath?: string): Promise<DatabaseDriver>;
/**
 * Explicit Memory Capture: Stores an architectural decision or convention into .gitcontextgen/memory.db
 */
export declare function rememberMemory(input: RememberInput, repoPath?: string): Promise<AgentMemory>;
/**
 * Lists stored agent memories with optional category and limit filters
 */
export declare function listMemories(input?: {
    repo_id?: string;
    category?: string;
    limit?: number;
}, repoPath?: string): Promise<AgentMemory[]>;
/**
 * Memory Retrieval: Searches agent memories with sub-millisecond SQLite index latency
 */
export declare function recallMemories(input: RecallInput, repoPath?: string): Promise<AgentMemory[]>;
/**
 * Auto-Capture: Logs git commit message summaries automatically during tool executions
 */
export declare function autoCaptureCommit(repoId: string, commitMsg: string, author?: string, repoPath?: string): Promise<void>;
/**
 * Auto-Capture: Logs dependency modifications
 */
export declare function autoCaptureDependencyUpdate(repoId: string, depName: string, version: string, repoPath?: string): Promise<void>;
/**
 * Auto-Capture: Logs AST rule modifications
 */
export declare function autoCaptureRuleUpdate(repoId: string, ruleName: string, summary: string, repoPath?: string): Promise<void>;
/**
 * Computes memory statistics for UI badges and diagnostics
 */
export declare function getMemoryStats(repoId?: string, repoPath?: string): Promise<MemoryStats>;
export {};
