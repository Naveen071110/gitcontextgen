import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
}

export const CACHE_DIR = path.join(os.homedir(), '.gitcontextgen', 'cache');
const IN_MEMORY_CACHE = new Map<string, CacheEntry>();
export const CACHE_TTL_MS = 60 * 60 * 1000; // 1-Hour Persistent Cache TTL

export function getCacheFilePath(key: string): string {
  const hash = crypto.createHash('sha256').update(key).digest('hex');
  return path.join(CACHE_DIR, `${hash}.json`);
}

function ensureCacheDir(): void {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
  } catch {
    // Graceful fallback if filesystem access fails
  }
}

/**
 * Purges expired cache entries from both in-memory (L1) and persistent disk (L2) storage
 */
export function purgeStaleCache(maxAgeMs: number = CACHE_TTL_MS): { memoryPurged: number; diskPurged: number } {
  let memoryPurged = 0;
  let diskPurged = 0;
  const now = Date.now();

  // 1. Purge stale in-memory entries
  for (const [key, entry] of IN_MEMORY_CACHE.entries()) {
    if (now - entry.timestamp > maxAgeMs) {
      IN_MEMORY_CACHE.delete(key);
      memoryPurged++;
    }
  }

  // 2. Purge stale disk cache files
  try {
    if (fs.existsSync(CACHE_DIR)) {
      const files = fs.readdirSync(CACHE_DIR);
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        const filePath = path.join(CACHE_DIR, file);
        try {
          const raw = fs.readFileSync(filePath, 'utf-8');
          const entry = JSON.parse(raw) as CacheEntry;
          if (!entry.timestamp || now - entry.timestamp > maxAgeMs) {
            fs.unlinkSync(filePath);
            diskPurged++;
          }
        } catch {
          try {
            fs.unlinkSync(filePath);
            diskPurged++;
          } catch {}
        }
      }
    }
  } catch {
    // Non-fatal
  }

  return { memoryPurged, diskPurged };
}

/**
 * Clears all cached analysis from both memory and disk (primarily for test resets)
 */
export function clearAllCache(): void {
  IN_MEMORY_CACHE.clear();
  try {
    if (fs.existsSync(CACHE_DIR)) {
      const files = fs.readdirSync(CACHE_DIR);
      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            fs.unlinkSync(path.join(CACHE_DIR, file));
          } catch {}
        }
      }
    }
  } catch {}
}

/**
 * Retrieves cached data from L1 (memory) or L2 (disk)
 */
export function getCachedData<T = any>(key: string): T | null {
  const normalizedKey = key.trim();

  // 1. Check L1 In-Memory Cache
  const memoryEntry = IN_MEMORY_CACHE.get(normalizedKey);
  if (memoryEntry) {
    if (Date.now() - memoryEntry.timestamp < CACHE_TTL_MS) {
      return memoryEntry.data as T;
    } else {
      IN_MEMORY_CACHE.delete(normalizedKey);
    }
  }

  // 2. Check L2 Persistent Disk Cache
  try {
    const filePath = getCacheFilePath(normalizedKey);
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const diskEntry = JSON.parse(raw) as CacheEntry<T>;
      if (Date.now() - diskEntry.timestamp < CACHE_TTL_MS) {
        IN_MEMORY_CACHE.set(normalizedKey, diskEntry);
        return diskEntry.data;
      } else {
        try {
          fs.unlinkSync(filePath);
        } catch {}
      }
    }
  } catch {
    // Fallthrough to scan
  }

  return null;
}

/**
 * Stores data in L1 (memory) and L2 (disk)
 */
export function setCachedData<T = any>(key: string, data: T): void {
  const normalizedKey = key.trim();
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
  };

  // 1. Store in Memory
  IN_MEMORY_CACHE.set(normalizedKey, entry);

  // 2. Store on Disk
  try {
    ensureCacheDir();
    const filePath = getCacheFilePath(normalizedKey);
    fs.writeFileSync(filePath, JSON.stringify(entry), 'utf-8');
  } catch {
    // Non-fatal if disk write fails
  }
}
