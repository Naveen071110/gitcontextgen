#!/usr/bin/env node
import { Command } from 'commander';
import path from 'path';
import { executeInit } from '../commands/init.js';
import { executeMcp } from '../commands/mcp.js';
import { executeAnalyze } from '../commands/analyze.js';
import { executeRules } from '../commands/rules.js';
import { executeMap } from '../commands/map.js';
import { executeLint } from '../commands/lint.js';
import { executeDoctor } from '../commands/doctor.js';
import { executeHandoff } from '../commands/handoff.js';
process.on('uncaughtException', (err) => {
    console.error('\n❌ Uncaught Exception:', err.message);
    process.exit(1);
});
process.on('unhandledRejection', (reason) => {
    console.error('\n❌ Unhandled Rejection:', reason);
    process.exit(1);
});
// Backwards compatibility: If invoked directly as gitcontextgen-mcp without subcommands, run MCP stdio server
const binaryName = path.basename(process.argv[1] || '');
if (binaryName.includes('gitcontextgen-mcp') && process.argv.length <= 2) {
    executeMcp().catch((err) => {
        console.error('Fatal MCP error:', err);
        process.exit(1);
    });
}
else {
    const program = new Command();
    program
        .name('gitcontextgen')
        .description('The Universal AI Codebase Context Engine & Model Context Protocol (MCP) Server')
        .version('1.0.1');
    program
        .command('init')
        .description('Runs interactive onboarding wizard to configure project rules and register MCP server')
        .option('-s, --silent', 'Bypass interactive prompts and apply recommended defaults')
        .option('-y, --yes', 'Alias for --silent')
        .option('-f, --force', 'Force overwrite existing rule files without prompting')
        .action(async (options) => {
        try {
            await executeInit(options);
        }
        catch (err) {
            console.error('\n❌ Init failed:', err.message);
            process.exit(1);
        }
    });
    program
        .command('mcp')
        .description('Runs the stdio-based Model Context Protocol (MCP) server for IDE integration')
        .action(async () => {
        try {
            await executeMcp();
        }
        catch (err) {
            console.error('\n❌ MCP server failed:', err.message);
            process.exit(1);
        }
    });
    program
        .command('analyze [path]')
        .description('Scans local directory or remote GitHub URL and prints codebase summary')
        .option('--json', 'Output raw analysis in JSON format')
        .option('-e, --exclude <patterns...>', 'Custom glob patterns or directory names to ignore')
        .action(async (targetPath, options) => {
        try {
            await executeAnalyze(targetPath, options);
        }
        catch (err) {
            console.error('\n❌ Analysis failed:', err.message);
            process.exit(1);
        }
    });
    program
        .command('rules [path]')
        .description('Outputs high-fidelity AI project rules to stdout or specified file')
        .option('-f, --format <format>', 'Target format: claude, cursor, copilot, windsurf, universal, agents, agent_readme, wordpress', 'claude')
        .option('-o, --output <file>', 'File path to write generated rules')
        .action(async (targetPath, options) => {
        try {
            await executeRules(targetPath, options);
        }
        catch (err) {
            console.error('\n❌ Rules generation failed:', err.message);
            process.exit(1);
        }
    });
    program
        .command('map [path]')
        .description('Outputs codebase module dependencies as Mermaid.js architecture diagrams')
        .option('-s, --style <style>', 'Diagram layout style: layered, flow, modular', 'layered')
        .option('-o, --output <file>', 'File path to write generated diagram')
        .action(async (targetPath, options) => {
        try {
            await executeMap(targetPath, options);
        }
        catch (err) {
            console.error('\n❌ Architecture mapping failed:', err.message);
            process.exit(1);
        }
    });
    program
        .command('lint [path]')
        .description('Enforces CI rule standards, Cursor .mdc frontmatter validation, bidirectional sync, and secret leak scanning')
        .option('--strict', 'Treat all warnings as errors')
        .option('--staged-only', 'Inspect only git staged files for credential leaks')
        .option('--json', 'Output results in structured JSON format')
        .action(async (targetPath, options) => {
        try {
            const report = await executeLint(targetPath, options);
            if (!report.passed) {
                process.exit(1);
            }
        }
        catch (err) {
            console.error('\n❌ Lint check failed:', err.message);
            process.exit(1);
        }
    });
    program
        .command('doctor [path]')
        .description('Client onboarding checkup: audits IDEs, registers MCP servers, and establishes symlink portability')
        .option('-s, --silent', 'Bypass interactive prompts and apply recommended defaults')
        .option('-y, --yes', 'Alias for --silent')
        .option('--register-all', 'Automatically register MCP server in all detected IDEs')
        .option('--link-rules', 'Automatically establish symlinks between CLAUDE.md and AGENTS.md')
        .action(async (targetPath, options) => {
        try {
            await executeDoctor(targetPath, options);
        }
        catch (err) {
            console.error('\n❌ Doctor check failed:', err.message);
            process.exit(1);
        }
    });
    program
        .command('handoff [path]')
        .alias('proof-of-work')
        .description('Generates executive client proof-of-work and deliverables handoff reports from git history')
        .option('-c, --client <name>', 'The name of the client or company', 'Client Partner')
        .option('-f, --format <format>', 'Output format: markdown, html, pdf', 'markdown')
        .option('-s, --since <timeframe>', 'Timeframe filter (e.g. 7d, 30d, 2w, 2026-08-01)', '30d')
        .option('-o, --out <file>', 'Custom output location')
        .action(async (targetPath, options) => {
        try {
            await executeHandoff(targetPath, options);
        }
        catch (err) {
            console.error('\n❌ Handoff report generation failed:', err.message);
            process.exit(1);
        }
    });
    program.addHelpText('after', `
Examples:
  $ gitcontextgen init                        # Run interactive onboarding in current workspace
  $ gitcontextgen doctor                      # Audit IDEs, register MCP, and verify environment health
  $ gitcontextgen lint                        # Run CI rule harmonization and secret leak validation
  $ gitcontextgen handoff --client "Acme"     # Generate client proof-of-work markdown report
  $ gitcontextgen handoff --format html       # Generate executive print-ready HTML handoff report
  $ gitcontextgen mcp                         # Run MCP server on stdio (Claude Desktop / Cursor)
  $ gitcontextgen analyze                     # Print summary of current directory
  $ gitcontextgen rules --format cursor       # Output modern .mdc rules with alwaysApply: true
  $ gitcontextgen rules --format wordpress    # Output WordPress WPCS & security rules
  $ gitcontextgen map --output arch.mmd       # Export architectural Mermaid diagram to file
`);
    program.parse(process.argv);
}
