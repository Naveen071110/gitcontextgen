import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
export const CACHE_DIR = path.join(os.homedir(), '.gitcontextgen', 'cache');
const IN_MEMORY_CACHE = new Map();
export const CACHE_TTL_MS = 60 * 60 * 1000; // 1-Hour Persistent Cache TTL
export function getCacheFilePath(key) {
    const hash = crypto.createHash('sha256').update(key).digest('hex');
    return path.join(CACHE_DIR, `${hash}.json`);
}
function ensureCacheDir() {
    try {
        if (!fs.existsSync(CACHE_DIR)) {
            fs.mkdirSync(CACHE_DIR, { recursive: true });
        }
    }
    catch {
        // Graceful fallback to in-memory cache only if disk permissions fail
    }
}
/**
 * Purges expired cache entries from both in-memory (L1) and persistent disk (L2) storage
 */
export function purgeStaleCache(maxAgeMs = CACHE_TTL_MS) {
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
                if (!file.endsWith('.json'))
                    continue;
                const filePath = path.join(CACHE_DIR, file);
                try {
                    const raw = fs.readFileSync(filePath, 'utf-8');
                    const entry = JSON.parse(raw);
                    if (!entry.timestamp || now - entry.timestamp > maxAgeMs) {
                        fs.unlinkSync(filePath);
                        diskPurged++;
                    }
                }
                catch {
                    try {
                        fs.unlinkSync(filePath);
                        diskPurged++;
                    }
                    catch { }
                }
            }
        }
    }
    catch {
        // Disk access issues handled gracefully
    }
    return { memoryPurged, diskPurged };
}
/**
 * Clears all cached analysis from both memory and disk (primarily for test resets)
 */
export function clearAllCache() {
    IN_MEMORY_CACHE.clear();
    try {
        if (fs.existsSync(CACHE_DIR)) {
            const files = fs.readdirSync(CACHE_DIR);
            for (const file of files) {
                if (file.endsWith('.json')) {
                    try {
                        fs.unlinkSync(path.join(CACHE_DIR, file));
                    }
                    catch { }
                }
            }
        }
    }
    catch { }
}
/**
 * Retrieves cached analysis from L1 (memory) or L2 (disk)
 */
export function getCachedAnalysis(targetPath, customExcludes = []) {
    const cacheKey = `${targetPath.trim()}::${customExcludes.sort().join(',')}`;
    // 1. Check L1 In-Memory Cache
    const memoryEntry = IN_MEMORY_CACHE.get(cacheKey);
    if (memoryEntry) {
        if (Date.now() - memoryEntry.timestamp < CACHE_TTL_MS) {
            return memoryEntry.data;
        }
        else {
            IN_MEMORY_CACHE.delete(cacheKey);
        }
    }
    // 2. Check L2 Persistent Disk Cache
    try {
        const filePath = getCacheFilePath(cacheKey);
        if (fs.existsSync(filePath)) {
            const raw = fs.readFileSync(filePath, 'utf-8');
            const diskEntry = JSON.parse(raw);
            if (Date.now() - diskEntry.timestamp < CACHE_TTL_MS) {
                IN_MEMORY_CACHE.set(cacheKey, diskEntry);
                return diskEntry.data;
            }
            else {
                // Disk entry expired - actively remove it
                try {
                    fs.unlinkSync(filePath);
                }
                catch { }
            }
        }
    }
    catch {
        // Disk read failure: proceed to scan
    }
    return null;
}
/**
 * Stores codebase analysis in L1 (memory) and L2 (disk)
 */
export function setCachedAnalysis(targetPath, analysis, customExcludes = []) {
    const cacheKey = `${targetPath.trim()}::${customExcludes.sort().join(',')}`;
    const entry = {
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
    }
    catch {
        // Non-fatal if disk write fails
    }
}
