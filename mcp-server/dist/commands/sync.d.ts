export interface SyncOptions {
    watch?: boolean;
}
export declare function executeSync(targetPath?: string, options?: SyncOptions): Promise<void>;
