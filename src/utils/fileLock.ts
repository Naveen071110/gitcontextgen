import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import { execSync } from 'child_process';

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

export class GitStateConflictError extends Error {
  public readonly verification: GitIntentVerificationResult;
  constructor(message: string, verification: GitIntentVerificationResult) {
    super(message);
    this.name = 'GitStateConflictError';
    this.verification = verification;
  }
}

/**
 * Returns the directory used for GitContextGen lockfiles
 */
export function getLocksDirectory(): string {
  const locksDir = path.join(os.homedir(), '.gitcontextgen', 'locks');
  if (!fs.existsSync(locksDir)) {
    fs.mkdirSync(locksDir, { recursive: true });
  }
  return locksDir;
}

/**
 * Generates a deterministic lockfile path for a target file
 */
export function getLockFilePath(targetFilePath: string): string {
  const resolved = path.resolve(targetFilePath);
  const hash = crypto.createHash('sha256').update(resolved).digest('hex').slice(0, 16);
  const safeName = path.basename(resolved).replace(/[^a-zA-Z0-9._-]/g, '_');
  return path.join(getLocksDirectory(), `${safeName}.${hash}.lock`);
}

/**
 * Checks whether a given PID is still actively running on the operating system
 */
function isPidRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e: any) {
    return e.code === 'EPERM'; // Running under another user
  }
}

/**
 * Attempts to acquire an exclusive lock on a file with retries and stale lock reclamation
 */
export async function acquireFileLock(
  targetFilePath: string,
  options: LockOptions = {}
): Promise<LockMetadata> {
  const {
    timeoutMs = 5000,
    staleMs = 30000,
    agentId = `agent-${process.pid}-${Math.random().toString(36).slice(2, 8)}`,
    retryIntervalMs = 75,
  } = options;

  const resolved = path.resolve(targetFilePath);
  const lockPath = getLockFilePath(resolved);
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    try {
      const now = Date.now();
      const metadata: LockMetadata = {
        pid: process.pid,
        agentId,
        targetFile: resolved,
        lockPath,
        acquiredAt: now,
        expiresAt: now + staleMs,
      };

      // Atomic exclusive creation ('wx' fails if file already exists)
      const fd = fs.openSync(lockPath, 'wx');
      try {
        fs.writeFileSync(fd, JSON.stringify(metadata, null, 2), 'utf-8');
      } finally {
        fs.closeSync(fd);
      }

      return metadata;
    } catch (err: any) {
      if (err.code === 'EEXIST') {
        // Lock exists: check if it is stale
        try {
          const raw = fs.readFileSync(lockPath, 'utf-8');
          const existingLock: LockMetadata = JSON.parse(raw);

          const isExpired = Date.now() > existingLock.expiresAt;
          const isDead = !isPidRunning(existingLock.pid);

          if (isExpired || isDead) {
            // Reclaim stale lock safely
            try {
              fs.unlinkSync(lockPath);
            } catch {
              // Concurrently reclaimed by another thread/process
            }
            continue;
          }
        } catch {
          // Lockfile corrupted or deleted in race
          try {
            fs.unlinkSync(lockPath);
          } catch {}
          continue;
        }

        // Wait before next retry
        await new Promise((r) => setTimeout(r, retryIntervalMs));
      } else {
        throw err;
      }
    }
  }

  throw new Error(
    `[FileLock Timeout] Could not acquire exclusive lock on "${path.basename(resolved)}" within ${timeoutMs}ms. Another active agent session holds the lock.`
  );
}

/**
 * Releases an exclusive lockfile
 */
export function releaseFileLock(lock: LockMetadata): void {
  try {
    if (fs.existsSync(lock.lockPath)) {
      const raw = fs.readFileSync(lock.lockPath, 'utf-8');
      const existing: LockMetadata = JSON.parse(raw);
      // Only delete if held by this process and agent
      if (existing.pid === process.pid && existing.agentId === lock.agentId) {
        fs.unlinkSync(lock.lockPath);
      }
    }
  } catch (err) {
    // Already removed or unlinked
  }
}

/**
 * Scoped helper to execute an operation inside an exclusive file lock
 */
export async function withFileLock<T>(
  targetFilePath: string,
  operation: (lock: LockMetadata) => Promise<T>,
  options: LockOptions = {}
): Promise<T> {
  const lock = await acquireFileLock(targetFilePath, options);
  try {
    return await operation(lock);
  } finally {
    releaseFileLock(lock);
  }
}

/**
 * Computes a SHA-256 hash of a file's content, or null if the file does not exist
 */
export function computeFileContentHash(filePath: string): string | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
  } catch {
    return null;
  }
}

/**
 * Captures a snapshot of the Git working tree state for intent verification
 */
export function recordGitWorkingState(targetFilePath: string, cwd: string = process.cwd()): GitStateSnapshot {
  const resolved = path.resolve(cwd, targetFilePath);
  const fileHash = computeFileContentHash(resolved);

  let headCommit = 'unknown';
  let gitStatus = 'clean';

  try {
    headCommit = execSync('git rev-parse HEAD', {
      cwd,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    headCommit = 'no-git-head';
  }

  try {
    const rel = path.relative(cwd, resolved).replace(/\\/g, '/');
    gitStatus = execSync(`git status --porcelain -- "${rel}"`, {
      cwd,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    gitStatus = 'untracked';
  }

  return {
    targetFile: resolved,
    headCommit,
    fileHash,
    gitStatus,
    timestamp: Date.now(),
  };
}

/**
 * Compares current working state against initial session state before finalizing writes
 */
export function verifyGitStateIntent(
  initialSnapshot: GitStateSnapshot,
  targetFilePath?: string,
  cwd: string = process.cwd()
): GitIntentVerificationResult {
  const target = targetFilePath ? path.resolve(cwd, targetFilePath) : initialSnapshot.targetFile;
  const currentHash = computeFileContentHash(target);

  // 1. Check if the file was modified since session initiation
  if (initialSnapshot.fileHash !== currentHash) {
    let diffSummary = 'External modification detected between initial snapshot and write execution.';
    try {
      const rel = path.relative(cwd, target).replace(/\\/g, '/');
      const diffOutput = execSync(`git diff -- "${rel}"`, {
        cwd,
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim();
      if (diffOutput) {
        diffSummary = diffOutput.slice(0, 1000);
      }
    } catch {}

    return {
      clean: false,
      conflictReason: `Concurrent modification conflict: "${path.basename(
        target
      )}" was modified by another agent or external process after session start.`,
      currentHash,
      expectedHash: initialSnapshot.fileHash,
      diffSummary,
    };
  }

  return {
    clean: true,
    currentHash,
    expectedHash: initialSnapshot.fileHash,
  };
}

/**
 * Safely writes file content with exclusive locking, git-state intent verification, and atomic commit
 */
export async function safeWriteWithVerification(
  targetFilePath: string,
  newContent: string,
  initialSnapshot: GitStateSnapshot,
  options: { force?: boolean; lockTimeoutMs?: number; agentId?: string } = {}
): Promise<{ success: boolean; written: boolean; warning?: string }> {
  return withFileLock(
    targetFilePath,
    async () => {
      const verification = verifyGitStateIntent(initialSnapshot, targetFilePath);

      if (!verification.clean && !options.force) {
        const warning = `[GitContextGen Merge Guard] Aborted write to "${path.basename(
          targetFilePath
        )}": ${verification.conflictReason}\nReconciliation required. Pass --force to override.`;
        throw new GitStateConflictError(warning, verification);
      }

      // Ensure directory exists
      const dir = path.dirname(targetFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Atomic write: write to temp file then rename
      const tempPath = `${targetFilePath}.tmp.${Date.now()}.${Math.random().toString(36).slice(2, 6)}`;
      fs.writeFileSync(tempPath, newContent, 'utf-8');
      try {
        fs.renameSync(tempPath, targetFilePath);
      } catch {
        // Fallback for filesystems that do not support atomic cross-rename
        fs.writeFileSync(targetFilePath, newContent, 'utf-8');
        try {
          fs.unlinkSync(tempPath);
        } catch {}
      }

      return {
        success: true,
        written: true,
        warning: verification.clean ? undefined : 'Written with --force override despite external modifications.',
      };
    },
    {
      timeoutMs: options.lockTimeoutMs,
      agentId: options.agentId,
    }
  );
}
