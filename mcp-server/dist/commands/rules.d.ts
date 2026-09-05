export interface RulesOptions {
    format?: string;
    output?: string;
}
export declare function executeRules(targetPath?: string, options?: RulesOptions): Promise<void>;
