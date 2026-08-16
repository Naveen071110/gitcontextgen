#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { analyzeLocalDirectory } from './localScanner.js';
import { analyzeRemoteGitHubRepo, isGitHubUrl } from './remoteScanner.js';
import { generateRules } from './rulesEngine.js';
import { generateArchitecture } from './architectureEngine.js';
import { generateChangelog } from './changelogEngine.js';
// Cache recent analyses in-memory to avoid redundant disk or network scans
const analysisCache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 1 minute
async function getOrFetchAnalysis(targetPath, customExcludes = []) {
    const cacheKey = targetPath.trim();
    const cached = analysisCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.data;
    }
    let result;
    if (isGitHubUrl(targetPath)) {
        result = await analyzeRemoteGitHubRepo(targetPath);
    }
    else {
        result = await analyzeLocalDirectory(targetPath, customExcludes);
    }
    analysisCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
}
const server = new Server({
    name: 'gitcontextgen-mcp-server',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
// Register Available Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: 'gitcontextgen_analyze',
                description: 'Parses a local repository directory or public GitHub URL and returns a comprehensive codebase manifest, including indexed file hierarchy, primary entrypoints, runtime ecosystems, execution scripts, and package dependencies.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        path: {
                            type: 'string',
                            description: 'Absolute local directory path (e.g., "." or "C:/projects/app") or public GitHub URL.',
                        },
                        exclude: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Optional custom glob patterns or directory names to ignore during scanning.',
                        },
                    },
                    required: ['path'],
                },
            },
            {
                name: 'gitcontextgen_get_rules',
                description: 'Evaluates the target codebase tech stack and returns high-fidelity, zero-hallucination context rules matching specific AI formats (e.g. CLAUDE.md, .cursorrules, copilot-instructions.md, windsurf.json, or universal AGENTS.md).',
                inputSchema: {
                    type: 'object',
                    properties: {
                        path: {
                            type: 'string',
                            description: 'Target local repository path or public GitHub URL.',
                        },
                        format: {
                            type: 'string',
                            enum: ['claude', 'cursor', 'copilot', 'windsurf', 'universal', 'agents'],
                            description: 'Target instruction format standard.',
                        },
                    },
                    required: ['path', 'format'],
                },
            },
            {
                name: 'gitcontextgen_get_architecture',
                description: 'Dynamically maps directory boundaries, UI components, API routes, and database layers into syntax-validated Mermaid.js code blocks and serverless Kroki SVG/PNG export links.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        path: {
                            type: 'string',
                            description: 'Target repository path or GitHub URL.',
                        },
                        style: {
                            type: 'string',
                            description: 'Visual layout style preset (default: "layered").',
                        },
                    },
                    required: ['path'],
                },
            },
            {
                name: 'gitcontextgen_get_changelog',
                description: 'Connects to local git commit history and converts raw commit logs into audience-aware, structured release notes (developer or marketing tone).',
                inputSchema: {
                    type: 'object',
                    properties: {
                        path: {
                            type: 'string',
                            description: 'Local repository directory path.',
                        },
                        from_commit: {
                            type: 'string',
                            description: 'Optional starting git commit SHA or tag anchor.',
                        },
                        tone: {
                            type: 'string',
                            enum: ['developer', 'marketing'],
                            description: 'Audience tone for synthesized release notes.',
                        },
                    },
                    required: ['path'],
                },
            },
        ],
    };
});
// Handle Tool Executions
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case 'gitcontextgen_analyze': {
                const targetPath = String(args?.path || '.');
                const excludes = Array.isArray(args?.exclude) ? args.exclude.map(String) : [];
                const analysis = await getOrFetchAnalysis(targetPath, excludes);
                const responsePayload = {
                    status: 'success',
                    path: analysis.path,
                    name: analysis.name,
                    files_indexed: analysis.filesIndexed,
                    directories: analysis.directories,
                    entry_points: analysis.entryPoints,
                    manifest: {
                        ecosystem: analysis.manifest.ecosystem,
                        dependencies: analysis.manifest.dependencies,
                        devDependencies: analysis.manifest.devDependencies,
                        scripts: analysis.manifest.scripts,
                    },
                    license: analysis.licenseSpdx || 'Unknown',
                };
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(responsePayload, null, 2),
                        },
                    ],
                };
            }
            case 'gitcontextgen_get_rules': {
                const targetPath = String(args?.path || '.');
                const format = args?.format || 'universal';
                const analysis = await getOrFetchAnalysis(targetPath);
                const rulesResult = generateRules(analysis, format);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                format_applied: format,
                                filename: rulesResult.filename,
                                content: rulesResult.content,
                            }, null, 2),
                        },
                    ],
                };
            }
            case 'gitcontextgen_get_architecture': {
                const targetPath = String(args?.path || '.');
                const style = String(args?.style || 'layered');
                const analysis = await getOrFetchAnalysis(targetPath);
                const archResult = generateArchitecture(analysis, style);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                syntax: archResult.syntax,
                                diagram: archResult.diagram,
                                kroki: archResult.kroki,
                            }, null, 2),
                        },
                    ],
                };
            }
            case 'gitcontextgen_get_changelog': {
                const targetPath = String(args?.path || '.');
                const fromCommit = args?.from_commit ? String(args.from_commit) : undefined;
                const tone = args?.tone || 'developer';
                const changelogResult = generateChangelog(targetPath, fromCommit, tone);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(changelogResult, null, 2),
                        },
                    ],
                };
            }
            default:
                throw new Error(`Unknown tool requested: ${name}`);
        }
    }
    catch (error) {
        return {
            isError: true,
            content: [
                {
                    type: 'text',
                    text: `[GitContextGen MCP Error] ${error?.message || String(error)}`,
                },
            ],
        };
    }
});
// Launch Stdio Transport
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('GitContextGen MCP Server running on stdio');
}
main().catch((err) => {
    console.error('Fatal error initializing GitContextGen MCP Server:', err);
    process.exit(1);
});
