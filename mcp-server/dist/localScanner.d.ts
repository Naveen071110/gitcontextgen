import { WordPressDetection } from './analyzer/detector.js';
export interface CodebaseAnalysis {
    path: string;
    isRemote: boolean;
    name: string;
    filesIndexed: number;
    directories: string[];
    entryPoints: string[];
    manifest: {
        ecosystem: 'npm' | 'PyPI' | 'crates.io' | 'Go' | 'wordpress' | 'unknown';
        dependencies: string[];
        devDependencies: string[];
        scripts: Record<string, string>;
        manifestContent?: string;
    };
    fileTreeSummary: string;
    readmeContent?: string;
    licenseSpdx?: string;
    wordpress?: WordPressDetection;
}
/**
 * Scans a local directory and creates a comprehensive codebase analysis
 */
export declare function analyzeLocalDirectory(targetPath: string, customExcludes?: string[]): Promise<CodebaseAnalysis>;
