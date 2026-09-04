import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import { CodebaseAnalysis } from './localScanner.js';

interface CacheEntry {
  data: CodebaseAnalysis;
  timestamp: number;
}

const CACHE_DIR = path.join(os.homedir(), '.gitcontextgen', 'cache');
const IN_MEMORY_CACHE = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1-Hour Persistent Cache TTL

function getCacheFilePath(key: string): string {
  const hash = crypto.createHash('sha256').update(key).digest('hex');
  return path.join(CACHE_DIR, `${hash}.json`);
}

function ensureCacheDir(): void {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
  } catch {
    // Graceful fallback to in-memory cache only if disk permissions fail
  }
}

/**
 * Retrieves cached analysis from L1 (memory) or L2 (disk)
 */
export function getCachedAnalysis(targetPath: string, customExcludes: string[] = []): CodebaseAnalysis | null {
  const cacheKey = `${targetPath.trim()}::${customExcludes.sort().join(',')}`;

  // 1. Check L1 In-Memory Cache
  const memoryEntry = IN_MEMORY_CACHE.get(cacheKey);
  if (memoryEntry && Date.now() - memoryEntry.timestamp < CACHE_TTL_MS) {
    return memoryEntry.data;
  }

  // 2. Check L2 Persistent Disk Cache
  try {
    const filePath = getCacheFilePath(cacheKey);
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const diskEntry = JSON.parse(raw) as CacheEntry;
      if (Date.now() - diskEntry.timestamp < CACHE_TTL_MS) {
        IN_MEMORY_CACHE.set(cacheKey, diskEntry);
        return diskEntry.data;
      }
    }
  } catch {
    // Disk read failure: proceed to scan
  }

  return null;
}

/**
 * Stores codebase analysis in L1 (memory) and L2 (disk)
 */
export function setCachedAnalysis(
  targetPath: string,
  analysis: CodebaseAnalysis,
  customExcludes: string[] = []
): void {
  const cacheKey = `${targetPath.trim()}::${customExcludes.sort().join(',')}`;
  const entry: CacheEntry = {
    data: analysis,
    timestamp: Date.now(),
  };

  // 1. Store in Memory
  IN_MEMORY_CACHE.set(cacheKey, entry);

  // 2. Store on Disk
  try {
    ensureCacheDir();
    const filePath = getCacheFilePath(cacheKey);
    fs.writeFileSync(filePath, JSON.stringify(entry), 'utf-8');
  } catch {
    // Non-fatal if disk write fails
  }
}
