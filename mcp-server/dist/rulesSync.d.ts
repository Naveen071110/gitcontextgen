export interface SyncResult {
    synchronized: boolean;
    sourceFile: string;
    targetFile: string;
    direction: 'claude-to-cursor' | 'cursor-to-claude';
    timestamp: number;
}
/**
 * Extracts and preserves YAML frontmatter from a Cursor .mdc rule file
 */
export declare function parseMdcFrontmatter(content: string): {
    frontmatter: string;
    body: string;
    alwaysApply: boolean;
};
/**
 * Synchronizes rule specifications bidirectionally between CLAUDE.md and .cursor/rules/*.mdc
 */
export declare function synchronizeRules(workspaceDir: string): SyncResult[];
/**
 * Starts an active file watcher monitoring CLAUDE.md and Cursor rules
 */
export declare function watchRules(workspaceDir: string, onSync?: (results: SyncResult[]) => void): {
    stop: () => void;
};
