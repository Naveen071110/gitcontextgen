export interface LintOptions {
    strict?: boolean;
    stagedOnly?: boolean;
    json?: boolean;
}
export interface LintIssue {
    category: 'CURSOR_RULES' | 'SYNC_DRIFT' | 'SECURITY_LEAK';
    severity: 'ERROR' | 'WARNING';
    file: string;
    message: string;
    remediation: string;
}
export interface LintReport {
    passed: boolean;
    totalChecks: number;
    errorsCount: number;
    warningsCount: number;
    issues: LintIssue[];
    durationMs: number;
}
/**
 * Executes the continuous integration rule linter
 */
export declare function executeLint(targetPath?: string, options?: LintOptions): Promise<LintReport>;
