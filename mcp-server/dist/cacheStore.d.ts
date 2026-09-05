import { CodebaseAnalysis } from './localScanner.js';
export declare const CACHE_DIR: string;
export declare const CACHE_TTL_MS: number;
export declare function getCacheFilePath(key: string): string;
/**
 * Purges expired cache entries from both in-memory (L1) and persistent disk (L2) storage
 */
export declare function purgeStaleCache(maxAgeMs?: number): {
    memoryPurged: number;
    diskPurged: number;
};
/**
 * Clears all cached analysis from both memory and disk (primarily for test resets)
 */
export declare function clearAllCache(): void;
/**
 * Retrieves cached analysis from L1 (memory) or L2 (disk)
 */
export declare function getCachedAnalysis(targetPath: string, customExcludes?: string[]): CodebaseAnalysis | null;
/**
 * Stores codebase analysis in L1 (memory) and L2 (disk)
 */
export declare function setCachedAnalysis(targetPath: string, analysis: CodebaseAnalysis, customExcludes?: string[]): void;
