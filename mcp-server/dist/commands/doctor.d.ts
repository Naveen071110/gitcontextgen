export interface DoctorOptions {
    silent?: boolean;
    yes?: boolean;
    registerAll?: boolean;
    linkRules?: boolean;
    json?: boolean;
}
export interface IdeDetectionResult {
    name: string;
    detected: boolean;
    version?: string;
    configPath?: string;
    status: 'READY' | 'CONFIGURED' | 'NOT_INSTALLED';
}
export interface DoctorReport {
    workspace: string;
    score: number;
    ides: Record<string, IdeDetectionResult>;
    mcpRegistered: string[];
    symlinksCreated: string[];
    recommendations: string[];
}
/**
 * Locates the Claude Desktop configuration file across Windows, macOS, and Linux
 */
export declare function getClaudeDesktopConfigPath(): string;
/**
 * Checks for known IDE installations on the host system
 */
export declare function auditInstalledIDEs(workspaceDir: string): Record<string, IdeDetectionResult>;
/**
 * Registers GitContextGen stdio MCP server in Claude Code CLI configuration (~/.claude.json)
 */
export declare function registerClaudeCodeMcp(): boolean;
/**
 * Registers GitContextGen stdio MCP server in Claude Desktop configuration file
 */
export declare function registerClaudeDesktopMcp(): boolean;
/**
 * Safely creates a bidirectional symlink, hardlink, or synced mirror file across platforms
 */
export declare function safelyEstablishSymlink(sourcePath: string, linkPath: string): {
    success: boolean;
    type: 'symlink' | 'hardlink' | 'copy';
    error?: string;
};
/**
 * Main Onboarding Execution Wizard: gitcontextgen doctor
 */
export declare function executeDoctor(targetPath?: string, options?: DoctorOptions): Promise<DoctorReport>;
