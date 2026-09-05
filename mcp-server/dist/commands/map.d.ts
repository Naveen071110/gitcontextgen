export interface MapOptions {
    style?: string;
    output?: string;
}
export declare function executeMap(targetPath?: string, options?: MapOptions): Promise<void>;
