export type ChangelogTone = 'developer' | 'marketing';
/**
 * Extracts recent git commit history and generates audience-aware changelog markdown
 */
export declare function generateChangelog(targetPath: string, fromCommit?: string, tone?: ChangelogTone): {
    tone_applied: ChangelogTone;
    changelog: string;
    commitsCount: number;
};
