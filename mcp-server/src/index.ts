#!/usr/bin/env node

import { loadCliConfig, saveCliConfig, verifyLicenseKey } from './utils/config.js';

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
import {
  rememberMemory,
  recallMemories,
  listMemories,
  initMemoryStore,
  getMemoryStats,
  autoCaptureCommit,
  autoCaptureDependencyUpdate,
  autoCaptureRuleUpdate,
  normalizeRepoId,
  type MemoryCategory,
} from './memoryStore.js';

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
    name: 'gitcontextgen-mcp',
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
              enum: ['claude', 'cursor', 'copilot', 'windsurf', 'universal', 'agents', 'agent_readme', 'wordpress'],
              description: 'Target instruction format standard (e.g. claude, cursor, wordpress).',
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
      {
        name: 'gitcontextgen_remember',
        description:
          'Explicitly records an architectural decision, convention, bug resolution, or environment invariant into the zero-cost local-first SQLite memory engine (.gitcontextgen/memory.db).',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Target repository path or GitHub URL.',
            },
            topic: {
              type: 'string',
              description: 'Concise title or concept for this memory (e.g. "Stripe Webhook Idempotency", "ESM import aliases").',
            },
            category: {
              type: 'string',
              enum: ['architecture', 'bug_fix', 'convention', 'env_config'],
              description: 'Memory classification category.',
            },
            decision_summary: {
              type: 'string',
              description: 'Summary of the technical or architectural decision reached.',
            },
            code_rationale: {
              type: 'string',
              description: 'Rationale explaining why this decision was made and constraints to uphold.',
            },
            content: {
              type: 'string',
              description: 'Additional code snippets, diffs, or implementation context.',
            },
            source_agent: {
              type: 'string',
              description: 'Originating AI coding agent identifier (e.g. "claude-code", "cursor", "windsurf").',
            },
          },
          required: ['path', 'topic', 'category'],
        },
      },
      {
        name: 'gitcontextgen_recall',
        description:
          'Queries persistent agent memories and architectural decisions from the local SQLite engine with sub-5ms indexed latency.',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Target repository path or GitHub URL.',
            },
            query: {
              type: 'string',
              description: 'Optional keyword or phrase to search within memory topics and content.',
            },
            category: {
              type: 'string',
              enum: ['architecture', 'bug_fix', 'convention', 'env_config'],
              description: 'Optional category filter.',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of memories to return (default: 10, max: 50).',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'gitcontextgen_get_context',
        description:
          'Synthesizes unified high-density context snapshot combining repository manifest, architecture topology, format rules, and recent agent memories for instant agent priming.',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Target repository path or GitHub URL.',
            },
            category: {
              type: 'string',
              enum: ['architecture', 'bug_fix', 'convention', 'env_config'],
              description: 'Optional category filter for relevant agent memories.',
            },
            format: {
              type: 'string',
              enum: ['claude', 'cursor', 'copilot', 'windsurf', 'universal', 'agents', 'agent_readme', 'wordpress'],
              description: 'Rule format standard to embed in the unified context (default: "universal").',
            },
            owner: {
              type: 'string',
              description: 'Optional repository owner name.',
            },
            repo: {
              type: 'string',
              description: 'Optional repository name.',
            },
          },
        },
      },
      {
        name: 'gitcontextgen_get_topology',
        description:
          'Dynamically maps directory boundaries, UI components, API routes, and database layers into syntax-validated Mermaid.js code blocks and serverless Kroki SVG/PNG export links.',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Target repository path or GitHub URL.',
            },
            owner: {
              type: 'string',
              description: 'Repository owner (used if path is not specified).',
            },
            repo: {
              type: 'string',
              description: 'Repository name (used if path is not specified).',
            },
            style: {
              type: 'string',
              description: 'Visual layout style preset (default: "layered").',
            },
          },
        },
      },
      {
        name: 'gitcontextgen_get_client_handoff',
        description:
          'Connects to local git commit history and converts raw commit logs into audience-aware, structured commercial handoff release notes.',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Local repository directory path or GitHub URL.',
            },
            owner: {
              type: 'string',
              description: 'Repository owner (optional).',
            },
            repo: {
              type: 'string',
              description: 'Repository name (optional).',
            },
            from_commit: {
              type: 'string',
              description: 'Optional starting git commit SHA or tag anchor.',
            },
            tone: {
              type: 'string',
              enum: ['developer', 'marketing'],
              description: 'Audience tone for synthesized release notes (default: "marketing").',
            },
          },
        },
      },
      {
        name: 'gitcontextgen_export_data',
        description:
          'Exports comprehensive repository analysis, AST metrics, generated rules, and persistent memories in structured JSON or Markdown.',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Target repository path or GitHub URL.',
            },
            owner: {
              type: 'string',
              description: 'Repository owner (optional).',
            },
            repo: {
              type: 'string',
              description: 'Repository name (optional).',
            },
            format: {
              type: 'string',
              enum: ['json', 'markdown', 'summary'],
              description: 'Export format standard (default: "json").',
            },
          },
        },
      },
      {
        name: 'gitcontextgen_list_memories',
        description:
          'Lists all stored agent memories from the local SQLite database with optional category filtering and pagination.',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Target repository path (optional, defaults to current working directory).',
            },
            category: {
              type: 'string',
              description: 'Optional category filter (e.g., "architecture", "bug_fix", "convention", "env_config").',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of memories to return (default: 50).',
            },
          },
        },
      },
    ],
  };
});

// Handle Tool Executions
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const VALID_FORMATS = new Set<RuleFormat>(['claude', 'cursor', 'copilot', 'windsurf', 'universal', 'agents', 'agent_readme', 'wordpress']);

    switch (name) {
      case 'gitcontextgen_analyze': {
        if (!args?.path || typeof args.path !== 'string') {
          throw new Error('Missing required string parameter: "path"');
        }
        const targetPath = args.path.trim();
        const excludes = Array.isArray(args.exclude) ? args.exclude.map(String) : [];
        const analysis = await getOrFetchAnalysis(targetPath, excludes);

        // Auto-capture package dependencies if scanning local directory
        if (!isGitHubUrl(targetPath) && analysis.manifest?.dependencies) {
          try {
            const repoId = normalizeRepoId(targetPath);
            const topDeps = Object.entries(analysis.manifest.dependencies).slice(0, 5);
            for (const [dep, ver] of topDeps) {
              autoCaptureDependencyUpdate(repoId, dep, String(ver), targetPath).catch(() => {});
            }
          } catch {}
        }

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
          wordpress: analysis.wordpress,
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

        // Auto-capture recent commits into persistent memory
        if (changelogResult?.rawCommits && Array.isArray(changelogResult.rawCommits)) {
          try {
            const repoId = normalizeRepoId(targetPath);
            for (const commitLine of changelogResult.rawCommits.slice(0, 5)) {
              autoCaptureCommit(repoId, commitLine, undefined, targetPath).catch(() => {});
            }
          } catch {}
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(changelogResult, null, 2),
            },
          ],
        };
      }

      case 'gitcontextgen_get_topology': {
        const rawPath = (args?.path || (args?.owner && args?.repo ? `${args.owner}/${args.repo}` : '.')) as string;
        const targetPath = rawPath.trim();
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

      case 'gitcontextgen_get_client_handoff': {
        const rawPath = (args?.path || (args?.owner && args?.repo ? `${args.owner}/${args.repo}` : '.')) as string;
        const targetPath = rawPath.trim();
        const fromCommit = args?.from_commit ? String(args.from_commit) : undefined;
        const tone = (args?.tone as ChangelogTone) || 'marketing';
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

      case 'gitcontextgen_export_data': {
        const rawPath = (args?.path || (args?.owner && args?.repo ? `${args.owner}/${args.repo}` : '.')) as string;
        const targetPath = rawPath.trim();
        const format = String(args?.format || 'json');
        const analysis = await getOrFetchAnalysis(targetPath);
        const rulesResult = generateRules(analysis, 'universal');
        const archResult = generateArchitecture(analysis, 'layered');
        const repoId = normalizeRepoId(targetPath);
        const memories = await recallMemories({ repo_id: repoId, limit: 50 }, isGitHubUrl(targetPath) ? process.cwd() : targetPath);

        const exportPayload = {
          repository: analysis.name,
          path: analysis.path,
          manifest: analysis.manifest,
          rules: rulesResult.content,
          architecture: archResult.diagram,
          memories,
          exported_at: new Date().toISOString(),
        };

        if (format === 'markdown') {
          const md = `# Repository Export: ${analysis.name}\n\n## Manifest\n\`\`\`json\n${JSON.stringify(analysis.manifest, null, 2)}\n\`\`\`\n\n## Architecture\n\`\`\`mermaid\n${archResult.diagram}\n\`\`\`\n\n## Rules\n${rulesResult.content}\n\n## Persistent Memories (${memories.length})\n${memories.map(m => `### [${m.category}] ${m.topic}\n${m.content}`).join('\n\n')}`;
          return {
            content: [{ type: 'text', text: md }],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(exportPayload, null, 2),
            },
          ],
        };
      }

      case 'gitcontextgen_list_memories': {
        const rawPath = (args?.path || (args?.owner && args?.repo ? `${args.owner}/${args.repo}` : '.')) as string;
        const targetPath = rawPath.trim();
        const repoId = normalizeRepoId(targetPath);
        const category = args?.category ? String(args.category) : undefined;
        const limit = typeof args?.limit === 'number' ? args.limit : 50;

        const memories = await listMemories(
          { repo_id: repoId, category, limit },
          isGitHubUrl(targetPath) ? process.cwd() : targetPath
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  status: 'success',
                  repo_id: repoId,
                  total: memories.length,
                  memories,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'gitcontextgen_remember': {
        const rawPath = (args?.path || (args?.owner && args?.repo ? `${args.owner}/${args.repo}` : '.')) as string;
        const targetPath = rawPath.trim();
        const rawTopic = (args?.topic || args?.key || 'Agent Memory') as string;
        const category = (args?.category || 'architecture') as string;
        const decision_summary = args?.decision_summary ? String(args.decision_summary) : undefined;
        const code_rationale = args?.code_rationale ? String(args.code_rationale) : undefined;
        const content = args?.content ? String(args.content) : undefined;
        const tags = Array.isArray(args?.tags) ? args.tags.map(String) : undefined;
        const source_agent = (args?.source_agent || 'mcp_client') as string;

        const repoId = normalizeRepoId(targetPath);
        const memory = await rememberMemory(
          {
            repo_id: repoId,
            topic: rawTopic,
            category,
            decision_summary,
            code_rationale,
            content,
            tags,
            source_agent,
          },
          isGitHubUrl(targetPath) ? process.cwd() : targetPath
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  status: 'saved',
                  memory,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'gitcontextgen_recall': {
        const rawPath = (args?.path || (args?.owner && args?.repo ? `${args.owner}/${args.repo}` : '.')) as string;
        const targetPath = rawPath.trim();
        const repoId = normalizeRepoId(targetPath);
        const query = args?.query ? String(args.query) : undefined;
        const category = args?.category ? String(args.category) : undefined;
        const limit = typeof args?.limit === 'number' ? args.limit : 10;

        const startRecall = performance.now();
        const memories = await recallMemories(
          {
            repo_id: repoId,
            query,
            category,
            limit,
          },
          isGitHubUrl(targetPath) ? process.cwd() : targetPath
        );
        const recallLatencyMs = Number((performance.now() - startRecall).toFixed(3));

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  status: 'success',
                  repo_id: repoId,
                  total_results: memories.length,
                  latency_ms: recallLatencyMs,
                  memories,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'gitcontextgen_get_context': {
        const rawPath = (args?.path || (args?.owner && args?.repo ? `${args.owner}/${args.repo}` : '.')) as string;
        const targetPath = rawPath.trim();
        const repoId = normalizeRepoId(targetPath);
        const format = (args?.format as RuleFormat) || 'universal';
        const category = args?.category ? String(args.category) : undefined;

        const analysis = await getOrFetchAnalysis(targetPath);
        const rulesResult = generateRules(analysis, format);
        const archResult = generateArchitecture(analysis, 'layered');

        const memories = await recallMemories(
          {
            repo_id: repoId,
            category,
            limit: 10,
          },
          isGitHubUrl(targetPath) ? process.cwd() : targetPath
        );

        const stats = await getMemoryStats(repoId, isGitHubUrl(targetPath) ? process.cwd() : targetPath);

        const unifiedPayload = {
          status: 'success',
          repo_id: repoId,
          repository: {
            name: analysis.name,
            path: analysis.path,
            ecosystem: analysis.manifest.ecosystem,
            entry_points: analysis.entryPoints,
            files_indexed: analysis.filesIndexed,
            dependencies: analysis.manifest.dependencies,
          },
          active_rules: {
            format,
            content: rulesResult.content,
          },
          architecture_summary: {
            diagram: archResult.diagram,
            kroki: archResult.kroki,
          },
          agent_memory: {
            total: stats.totalMemories,
            recent_memories: memories,
            category_distribution: stats.categories,
            engine: stats.engine,
          },
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(unifiedPayload, null, 2),
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
export async function runMcpServer(): Promise<void> {
  // Authorization Gate: Verify Dodo Payments License Key
  const config = loadCliConfig();
  const licenseKey =
    process.env.GITCONTEXTGEN_LICENSE_KEY ||
    config.licenseKey ||
    (process.env.NODE_ENV === 'test' ? 'gcg_test_license_pro' : undefined);

  if (!licenseKey) {
    process.stderr.write(
      '\n❌ [GitContextGen MCP Server Authorization Error]\n' +
      'Authorization failed: No Dodo Payments license key found.\n' +
      'The Model Context Protocol (MCP) server requires an active Pro or Agency subscription.\n\n' +
      'To resolve this:\n' +
      '1. Run "gitcontextgen init" to configure your license key interactively.\n' +
      '2. Or set the GITCONTEXTGEN_LICENSE_KEY environment variable.\n' +
      '3. Purchase a license at: https://gitcontextgen.com#pricing\n\n'
    );
    process.exit(1);
  }

  const now = Date.now();
  const lastChecked = config.lastChecked || 0;
  const TWELVE_HOURS = 12 * 60 * 60 * 1000;

  if (now - lastChecked > TWELVE_HOURS) {
    const result = await verifyLicenseKey(licenseKey);
    if (!result.valid) {
      process.stderr.write(
        `\n❌ [GitContextGen MCP Server Authorization Error]: ${result.error || 'License invalid or expired'}\n` +
        'Please renew your license at https://gitcontextgen.com#pricing or re-authenticate via "gitcontextgen init"\n\n'
      );
      process.exit(1);
    }
    saveCliConfig({
      ...config,
      licenseKey,
      plan: result.plan || config.plan || 'PRO',
      status: 'active',
      lastChecked: now,
    });
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('GitContextGen MCP Server running on stdio');
}

export { server };

// Auto-run if executed directly as entrypoint
const isDirectExecution =
  process.argv[1] &&
  (process.argv[1].endsWith('index.js') ||
    process.argv[1].endsWith('index.ts') ||
    process.argv[1].endsWith('gitcontextgen-mcp'));

if (isDirectExecution) {
  runMcpServer().catch((err) => {
    console.error('Fatal error initializing GitContextGen MCP Server:', err);
    process.exit(1);
  });
}
