/**
 * Metadata stored in an exclusive file lock handle
 */
export interface LockMetadata {
    pid: number;
    agentId: string;
    targetFile: string;
    lockPath: string;
    acquiredAt: number;
    expiresAt: number;
}
export interface LockOptions {
    timeoutMs?: number;
    staleMs?: number;
    agentId?: string;
    retryIntervalMs?: number;
}
export interface GitStateSnapshot {
    targetFile: string;
    headCommit: string;
    fileHash: string | null;
    gitStatus: string;
    timestamp: number;
}
export interface GitIntentVerificationResult {
    clean: boolean;
    conflictReason?: string;
    currentHash?: string | null;
    expectedHash?: string | null;
    diffSummary?: string;
}
export declare class GitStateConflictError extends Error {
    readonly verification: GitIntentVerificationResult;
    constructor(message: string, verification: GitIntentVerificationResult);
}
/**
 * Returns the directory used for GitContextGen lockfiles
 */
export declare function getLocksDirectory(): string;
/**
 * Generates a deterministic lockfile path for a target file
 */
export declare function getLockFilePath(targetFilePath: string): string;
/**
 * Attempts to acquire an exclusive lock on a file with retries and stale lock reclamation
 */
export declare function acquireFileLock(targetFilePath: string, options?: LockOptions): Promise<LockMetadata>;
/**
 * Releases an exclusive lockfile
 */
export declare function releaseFileLock(lock: LockMetadata): void;
/**
 * Scoped helper to execute an operation inside an exclusive file lock
 */
export declare function withFileLock<T>(targetFilePath: string, operation: (lock: LockMetadata) => Promise<T>, options?: LockOptions): Promise<T>;
/**
 * Computes a SHA-256 hash of a file's content, or null if the file does not exist
 */
export declare function computeFileContentHash(filePath: string): string | null;
/**
 * Captures a snapshot of the Git working tree state for intent verification
 */
export declare function recordGitWorkingState(targetFilePath: string, cwd?: string): GitStateSnapshot;
/**
 * Compares current working state against initial session state before finalizing writes
 */
export declare function verifyGitStateIntent(initialSnapshot: GitStateSnapshot, targetFilePath?: string, cwd?: string): GitIntentVerificationResult;
/**
 * Safely writes file content with exclusive locking, git-state intent verification, and atomic commit
 */
export declare function safeWriteWithVerification(targetFilePath: string, newContent: string, initialSnapshot: GitStateSnapshot, options?: {
    force?: boolean;
    lockTimeoutMs?: number;
    agentId?: string;
}): Promise<{
    success: boolean;
    written: boolean;
    warning?: string;
}>;
