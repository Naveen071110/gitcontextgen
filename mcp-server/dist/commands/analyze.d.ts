export interface AnalyzeOptions {
    json?: boolean;
    exclude?: string[];
}
export declare function executeAnalyze(targetPath?: string, options?: AnalyzeOptions): Promise<void>;
