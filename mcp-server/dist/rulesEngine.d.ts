import { CodebaseAnalysis } from './localScanner.js';
export type RuleFormat = 'claude' | 'cursor' | 'copilot' | 'windsurf' | 'universal' | 'agents';
/**
 * Generates structured context rules tailored to specific AI formats
 */
export declare function generateRules(analysis: CodebaseAnalysis, format: RuleFormat): {
    filename: string;
    content: string;
};
