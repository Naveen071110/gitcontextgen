import { CodebaseAnalysis } from './localScanner.js';
export type RuleFormat = 'claude' | 'cursor' | 'cursorrules' | 'legacy_cursor' | 'copilot' | 'windsurf' | 'universal' | 'agents' | 'agent_readme' | 'wordpress';
/**
 * Generates structured context rules tailored to specific AI formats
 */
export declare function generateRules(analysis: CodebaseAnalysis, format: RuleFormat): {
    filename: string;
    content: string;
};
