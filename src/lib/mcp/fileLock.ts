import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';

export interface LockMetadata {
  pid: number;
  agentId: string;
  targetFile: string;
  lockPath: string;
  acquiredAt: number;
  expiresAt: number;
}

export function getLocksDirectory(): string {
  const locksDir = path.join(os.homedir(), '.gitcontextgen', 'locks');
  if (!fs.existsSync(locksDir)) {
    try {
      fs.mkdirSync(locksDir, { recursive: true });
    } catch {}
  }
  return locksDir;
}

export function getLockFilePath(lockName: string): string {
  const safeName = lockName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const hash = crypto.createHash('sha256').update(lockName).digest('hex').slice(0, 16);
  return path.join(getLocksDirectory(), `${safeName}.${hash}.lock`);
}

export const getLockPath = getLockFilePath;

/**
 * Checks whether a given PID is still actively running on the operating system
 */
export function isPidRunning(pid: number): boolean {
  if (!pid || typeof pid !== 'number' || isNaN(pid) || pid <= 0) {
    return false;
  }
  try {
    process.kill(pid, 0);
    return true;
  } catch (e: any) {
    return e.code === 'EPERM'; // Running under another user account
  }
}

/**
 * Reclaims orphaned or stale locks by inspecting active OS process IDs
 * Returns count of reclaimed locks.
 */
export function reclaimOrphanedLocks(): number {
  let reclaimed = 0;
  try {
    const dir = getLocksDirectory();
    if (!fs.existsSync(dir)) return 0;

    const files = fs.readdirSync(dir);
    const now = Date.now();

    for (const file of files) {
      if (!file.endsWith('.lock')) continue;
      const fullPath = path.join(dir, file);
      try {
        const raw = fs.readFileSync(fullPath, 'utf-8');
        const meta = JSON.parse(raw);
        const isExpired = typeof meta.expiresAt === 'number' && now > meta.expiresAt;
        const isDead = typeof meta.pid === 'number' && !isPidRunning(meta.pid);

        if (isExpired || isDead) {
          try {
            fs.unlinkSync(fullPath);
            reclaimed++;
          } catch {}
        }
      } catch {
        // Corrupted lockfile
        try {
          fs.unlinkSync(fullPath);
          reclaimed++;
        } catch {}
      }
    }
  } catch {}
  return reclaimed;
}

export interface AcquireLockOptions {
  pid?: number;
  agent?: string;
  ttlMs?: number;
  maxWaitMs?: number;
}

/**
 * Acquires an exclusive lock on a named resource using atomic fs.openSync(..., 'wx')
 */
export function acquireLock(
  lockName: string,
  optionsOrPid?: number | AcquireLockOptions,
  timeoutMs?: number
): boolean {
  let pid = process.pid;
  let timeout = 3000;
  let agentId = `agent-${process.pid}-${Math.random().toString(36).slice(2, 8)}`;
  let staleMs = 30000;

  if (typeof optionsOrPid === 'number') {
    pid = optionsOrPid;
    if (typeof timeoutMs === 'number') {
      timeout = timeoutMs;
    }
  } else if (optionsOrPid && typeof optionsOrPid === 'object') {
    if (typeof optionsOrPid.pid === 'number') pid = optionsOrPid.pid;
    if (typeof optionsOrPid.agent === 'string') agentId = optionsOrPid.agent;
    if (typeof optionsOrPid.ttlMs === 'number') staleMs = optionsOrPid.ttlMs;
    if (typeof optionsOrPid.maxWaitMs === 'number') timeout = optionsOrPid.maxWaitMs;
  }

  const lockPath = getLockFilePath(lockName);
  const startTime = Date.now();

  reclaimOrphanedLocks();

  while (Date.now() - startTime <= timeout) {
    try {
      const now = Date.now();
      const metadata: LockMetadata = {
        pid,
        agentId,
        targetFile: lockName,
        lockPath,
        acquiredAt: now,
        expiresAt: now + staleMs,
      };

      // Atomic exclusive creation ('wx' flag fails if file exists)
      const fd = fs.openSync(lockPath, 'wx');
      try {
        fs.writeFileSync(fd, JSON.stringify(metadata, null, 2), 'utf-8');
      } finally {
        fs.closeSync(fd);
      }
      return true;
    } catch (err: any) {
      if (err.code === 'EEXIST') {
        // Lock exists; check if stale or holding process is dead
        try {
          const raw = fs.readFileSync(lockPath, 'utf-8');
          const existing = JSON.parse(raw);
          const isExpired = typeof existing.expiresAt === 'number' && Date.now() > existing.expiresAt;
          const isDead = typeof existing.pid === 'number' && !isPidRunning(existing.pid);

          if (isExpired || isDead) {
            try {
              fs.unlinkSync(lockPath);
              continue; // Reclaimed, retry immediately
            } catch {}
          }
        } catch {
          try {
            fs.unlinkSync(lockPath);
            continue;
          } catch {}
        }

        // Wait brief tick before retrying
        const waitMs = 25;
        const endWait = Date.now() + waitMs;
        while (Date.now() < endWait) {
          // synchronous busy-wait for short atomic retry interval
        }
      } else {
        return false;
      }
    }
  }

  return false;
}

/**
 * Releases an exclusive lock on a named resource
 */
export function releaseLock(lockName: string): boolean {
  try {
    const lockPath = getLockFilePath(lockName);
    if (fs.existsSync(lockPath)) {
      fs.unlinkSync(lockPath);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Scoped helper to run an operation inside a mutex lock
 */
export async function withMutexLock<T>(
  lockName: string,
  operation: () => Promise<T> | T,
  timeoutMs: number = 5000
): Promise<T> {
  const acquired = acquireLock(lockName, process.pid, timeoutMs);
  if (!acquired) {
    throw new Error(`[Mutex Lock Error] Could not acquire lock for "${lockName}" within ${timeoutMs}ms.`);
  }
  try {
    return await operation();
  } finally {
    releaseLock(lockName);
  }
}
