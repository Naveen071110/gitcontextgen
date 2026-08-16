import { CodebaseAnalysis } from './localScanner.js';
export declare function isGitHubUrl(urlOrPath: string): boolean;
export declare function parseGitHubUrl(url: string): {
    owner: string;
    repo: string;
} | null;
/**
 * Fetches repository structure from public GitHub REST API
 */
export declare function analyzeRemoteGitHubRepo(url: string): Promise<CodebaseAnalysis>;
