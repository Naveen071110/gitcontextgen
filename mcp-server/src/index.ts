#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { analyzeLocalDirectory, CodebaseAnalysis } from './localScanner.js';
import { analyzeRemoteGitHubRepo, isGitHubUrl } from './remoteScanner.js';
import { generateRules, RuleFormat } from './rulesEngine.js';
import { generateArchitecture } from './architectureEngine.js';
import { generateChangelog, ChangelogTone } from './changelogEngine.js';

import { getCachedAnalysis, setCachedAnalysis } from './cacheStore.js';

async function getOrFetchAnalysis(targetPath: string, customExcludes: string[] = []): Promise<CodebaseAnalysis> {
  const cached = getCachedAnalysis(targetPath, customExcludes);
  if (cached) {
    return cached;
  }

  let result: CodebaseAnalysis;
  if (isGitHubUrl(targetPath)) {
    result = await analyzeRemoteGitHubRepo(targetPath);
  } else {
    result = await analyzeLocalDirectory(targetPath, customExcludes);
  }

  setCachedAnalysis(targetPath, result, customExcludes);
  return result;
}

const server = new Server(
  {
    name: 'gitcontextgen-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register Available Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'gitcontextgen_analyze',
        description:
          'Parses a local repository directory or public GitHub URL and returns a comprehensive codebase manifest, including indexed file hierarchy, primary entrypoints, runtime ecosystems, execution scripts, and package dependencies.',
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
        description:
          'Evaluates the target codebase tech stack and returns high-fidelity, zero-hallucination context rules matching specific AI formats (e.g. CLAUDE.md, .cursorrules, copilot-instructions.md, windsurf.json, or universal AGENTS.md).',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Target local repository path or public GitHub URL.',
            },
            format: {
              type: 'string',
              enum: ['claude', 'cursor', 'copilot', 'windsurf', 'universal', 'agents', 'agent_readme'],
              description: 'Target instruction format standard.',
            },
          },
          required: ['path', 'format'],
        },
      },
      {
        name: 'gitcontextgen_get_architecture',
        description:
          'Dynamically maps directory boundaries, UI components, API routes, and database layers into syntax-validated Mermaid.js code blocks and serverless Kroki SVG/PNG export links.',
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
        description:
          'Connects to local git commit history and converts raw commit logs into audience-aware, structured release notes (developer or marketing tone).',
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
    const VALID_FORMATS = new Set<RuleFormat>(['claude', 'cursor', 'copilot', 'windsurf', 'universal', 'agents', 'agent_readme']);

    switch (name) {
      case 'gitcontextgen_analyze': {
        if (!args?.path || typeof args.path !== 'string') {
          throw new Error('Missing required string parameter: "path"');
        }
        const targetPath = args.path.trim();
        const excludes = Array.isArray(args.exclude) ? args.exclude.map(String) : [];
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
        if (!args?.path || typeof args.path !== 'string') {
          throw new Error('Missing required string parameter: "path"');
        }
        if (!args?.format || !VALID_FORMATS.has(args.format as RuleFormat)) {
          throw new Error(`Invalid or missing "format" parameter. Must be one of: ${Array.from(VALID_FORMATS).join(', ')}`);
        }

        const targetPath = args.path.trim();
        const format = args.format as RuleFormat;
        const analysis = await getOrFetchAnalysis(targetPath);
        const rulesResult = generateRules(analysis, format);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  format_applied: format,
                  filename: rulesResult.filename,
                  content: rulesResult.content,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'gitcontextgen_get_architecture': {
        if (!args?.path || typeof args.path !== 'string') {
          throw new Error('Missing required string parameter: "path"');
        }
        const targetPath = args.path.trim();
        const style = String(args?.style || 'layered');
        const analysis = await getOrFetchAnalysis(targetPath);
        const archResult = generateArchitecture(analysis, style);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  syntax: archResult.syntax,
                  diagram: archResult.diagram,
                  kroki: archResult.kroki,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'gitcontextgen_get_changelog': {
        if (!args?.path || typeof args.path !== 'string') {
          throw new Error('Missing required string parameter: "path"');
        }
        const targetPath = args.path.trim();
        if (isGitHubUrl(targetPath)) {
          throw new Error('gitcontextgen_get_changelog requires a local git repository directory path to inspect git logs.');
        }

        const fromCommit = args?.from_commit ? String(args.from_commit) : undefined;
        const tone = (args?.tone as ChangelogTone) || 'developer';

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
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: `[GitContextGen MCP Error] ${errorMsg}`,
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
