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
export interface LaravelDetection {
    isLaravel: boolean;
    hasArtisan: boolean;
    version?: string;
    hasComposerJson: boolean;
    hasRoutesWeb: boolean;
    hasRoutesApi: boolean;
    confidence: number;
}
export interface ReactNextDetection {
    isNext: boolean;
    isReact: boolean;
    routerType?: 'app' | 'pages' | 'mixed';
    version?: string;
    confidence: number;
}
export interface ComprehensiveFrameworkDetection {
    wordpress: WordPressDetection;
    laravel: LaravelDetection;
    reactNext: ReactNextDetection;
    primary: 'wordpress' | 'laravel' | 'nextjs' | 'react' | 'generic';
}
/**
 * Scans for Laravel framework markers (artisan, composer.json, routes/web.php)
 */
export declare function detectLaravel(targetDir: string, knownFiles?: string[]): LaravelDetection;
/**
 * Scans for Next.js and React architecture and router models
 */
export declare function detectReactNext(targetDir: string, knownFiles?: string[]): ReactNextDetection;
/**
 * Unified Auto-Technology Framework Detection (Agency tier deliverable)
 */
export declare function detectFrameworks(targetDir: string, knownFiles?: string[]): ComprehensiveFrameworkDetection;
