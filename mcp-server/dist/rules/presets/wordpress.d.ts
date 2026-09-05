export interface WordPressRuleContext {
    name?: string;
    type?: 'core' | 'plugin' | 'theme' | 'block' | 'unknown';
    version?: string;
    textDomain?: string;
    hasWpCli?: boolean;
    hasTelex?: boolean;
    hasBlockJson?: boolean;
}
/**
 * Cursor Rules (.mdc) Header and Directives
 */
export declare const WORDPRESS_CURSOR_FRONTMATTER = "---\ndescription: Enforces secure, performant, and standards-compliant WordPress development (WPCS)\nglobs: [\"**/*.php\", \"src/blocks/**/*.js\", \"block.json\"]\nalwaysApply: true\n---";
/**
 * Generates standards-compliant Cursor (.mdc) rules for WordPress
 */
export declare function getWordPressCursorRules(context?: WordPressRuleContext): string;
/**
 * Generates CLAUDE.md guide for WordPress
 */
export declare function getWordPressClaudeRules(context?: WordPressRuleContext): string;
