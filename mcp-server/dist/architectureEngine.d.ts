import { CodebaseAnalysis } from './localScanner.js';
export interface ArchitectureResult {
    syntax: 'mermaid';
    diagram: string;
    kroki: {
        svgUrl: string;
        pngUrl: string;
        embedMarkdown: string;
    };
}
/**
 * Generates Mermaid architecture diagram and Kroki export links from codebase structure
 */
export declare function generateArchitecture(analysis: CodebaseAnalysis, style?: string): ArchitectureResult;
