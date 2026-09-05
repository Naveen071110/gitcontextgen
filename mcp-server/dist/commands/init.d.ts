export interface InitOptions {
    silent?: boolean;
    yes?: boolean;
    force?: boolean;
}
export declare function executeInit(options?: InitOptions): Promise<void>;
