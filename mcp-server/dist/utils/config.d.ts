export interface CliConfig {
    licenseKey?: string;
    plan?: string;
    status?: string;
    verifiedAt?: string;
    lastChecked?: number;
}
export declare function getConfigDirectory(): string;
export declare function getConfigFilePath(): string;
export declare function loadCliConfig(): CliConfig;
export declare function saveCliConfig(config: CliConfig): void;
export declare function verifyLicenseKey(licenseKey: string, apiBaseUrl?: string): Promise<{
    valid: boolean;
    plan?: string;
    error?: string;
}>;
