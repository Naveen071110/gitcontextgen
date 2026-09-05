export type WordPressProjectType = 'core' | 'plugin' | 'theme' | 'block' | 'unknown';
export interface WordPressDetection {
    isWordPress: boolean;
    type: WordPressProjectType;
    name?: string;
    version?: string;
    textDomain?: string;
    description?: string;
    author?: string;
    hasWpConfig: boolean;
    hasWpContent: boolean;
    hasBlockJson: boolean;
    hasTelex: boolean;
    hasWpCli: boolean;
    mainFile?: string;
    confidence: number;
}
/**
 * Scans a local directory or list of file paths to identify WordPress projects
 * (Core installations, Plugins, Themes, and Gutenberg/Telex blocks).
 */
export declare function detectWordPress(targetDir: string, knownFiles?: string[]): WordPressDetection;
