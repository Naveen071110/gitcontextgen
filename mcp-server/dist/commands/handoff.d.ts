export interface HandoffOptions {
    client?: string;
    format?: 'markdown' | 'html' | 'pdf';
    since?: string;
    out?: string;
    title?: string;
}
export interface ParsedCommit {
    hash: string;
    shortHash: string;
    author: string;
    date: string;
    subject: string;
    category: string;
    businessValue: string;
    isNoise: boolean;
}
export interface HandoffReportData {
    clientName: string;
    reportDate: string;
    periodLabel: string;
    totalCommits: number;
    featureCommitsCount: number;
    executiveSummary: string;
    capabilities: {
        category: string;
        items: string[];
    }[];
    securitySummary: {
        ruleHarmonization: string;
        vulnerabilityAudit: string;
        credentialShield: string;
        testSuiteStatus: string;
    };
    rawCommits: ParsedCommit[];
}
/**
 * Normalizes user-provided timeframes (e.g. 7d, 30d, 2w, 2026-08-01) into git log friendly strings
 */
export declare function normalizeSince(since?: string): string;
/**
 * Categorizes and translates technical commit messages into client-friendly business value statements
 */
export declare function translateCommitToBusinessValue(subject: string): {
    category: string;
    businessValue: string;
    isNoise: boolean;
};
/**
 * Extracts and filters git history within the specified timeframe
 */
export declare function extractGitCommits(repoDir: string, sinceNormalized: string): ParsedCommit[];
/**
 * Builds the structured handoff report model from raw git log commits
 */
export declare function buildHandoffReportData(repoDir: string, options: HandoffOptions): HandoffReportData;
/**
 * Generates an executive Markdown report
 */
export declare function renderMarkdownReport(data: HandoffReportData): string;
/**
 * Generates an executive, print-ready HTML report with embedded responsive styling
 */
export declare function renderHtmlReport(data: HandoffReportData): string;
/**
 * Main command executor for gitcontextgen handoff / proof-of-work
 */
export declare function executeHandoff(targetPath?: string, options?: HandoffOptions): Promise<{
    reportFile: string;
    data: HandoffReportData;
}>;
