import { CodebaseAnalysis } from './localScanner.js';
/**
 * Retrieves cached analysis from L1 (memory) or L2 (disk)
 */
export declare function getCachedAnalysis(targetPath: string, customExcludes?: string[]): CodebaseAnalysis | null;
/**
 * Stores codebase analysis in L1 (memory) and L2 (disk)
 */
export declare function setCachedAnalysis(targetPath: string, analysis: CodebaseAnalysis, customExcludes?: string[]): void;
