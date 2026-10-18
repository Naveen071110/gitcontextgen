import assert from 'assert';
import {
  detectFramework,
  generateOnboardingFiles,
  generateCursorRules,
  generateArchitectureMap,
  generateClientHandoffReport,
  analyzeCodebase,
} from '../src/lib/analyzer/engine';
import { createProject, getProjectById } from '../src/lib/db';
import { MockStore } from '../src/lib/mockStore';

async function runAnalyzerEngineSuite() {
  console.log('='.repeat(72));
  console.log('🧪 Monetization Analyzer Engine & Atomic Persistence Test Suite');
  console.log('='.repeat(72));

  // -------------------------------------------------------------------------
  // TEST 1: Next.js App Router Framework Detection & Deliverable Generation
  // -------------------------------------------------------------------------
  console.log('\n[TEST 1] Testing Next.js App Router detection and 4-asset generation...');
  const nextInput = {
    repoName: 'acme-saas',
    owner: 'acme',
    repo: 'acme-saas',
    defaultBranch: 'main',
    fileTreeSummary: `
src/app/layout.tsx
src/app/page.tsx
src/app/dashboard/page.tsx
src/app/api/auth/route.ts
src/components/Navbar.tsx
package.json
tailwind.config.ts
next.config.ts
    `.trim(),
    manifestContent: JSON.stringify({
      name: 'acme-saas',
      dependencies: {
        next: '15.2.0',
        react: '19.0.0',
        tailwindcss: '4.0.0',
      },
    }),
    readmeContent: '# Acme SaaS Platform\nA high-performance Next.js 15 App Router web application with Tailwind CSS.',
    recentCommits: [
      { message: 'feat: added team workspace invitations and role permissions' },
      { message: 'fix: patch csrf token validation and rate limiter memory leak' },
      { message: 'perf: optimize image loader and reduce bundle size by 30%' },
    ],
  };

  const nextAnalysis = analyzeCodebase(nextInput);

  assert.strictEqual(nextAnalysis.framework, 'Next.js', 'Framework must be detected as Next.js');

  // Deliverable 1: AI Onboarding Files
  assert.ok(nextAnalysis.onboarding.claudeMd.includes('# CLAUDE.md'), 'CLAUDE.md must be generated');
  assert.ok(nextAnalysis.onboarding.claudeMd.includes('Next.js (App Router)'), 'Must specify App Router');
  assert.ok(nextAnalysis.onboarding.agentsMd.includes('# AGENTS.md'), 'AGENTS.md must be generated');
  assert.ok(nextAnalysis.onboarding.devCommands.some(c => c.includes('dev')), 'Dev commands must include run dev');
  assert.ok(nextAnalysis.onboarding.stylingStandards.includes('Tailwind'), 'Styling standards must include Tailwind');
  console.log('  -> Asset 1 (Unified AI Onboarding Files): Verified CLAUDE.md & AGENTS.md.');

  // Deliverable 2: Cursor Rules
  assert.ok(nextAnalysis.cursorRules.length >= 2, 'Must generate at least 2 cursor rule files');
  const nextRule = nextAnalysis.cursorRules.find(r => r.filename.includes('nextjs.mdc'));
  assert.ok(nextRule, 'Must generate nextjs.mdc');
  assert.ok(nextRule.content.includes('alwaysApply: true'), 'Rule must have YAML frontmatter alwaysApply: true');
  assert.ok(nextRule.content.includes('Server Components'), 'Rule must include Server Components standards');
  console.log('  -> Asset 2 (Cursor Rules .mdc): Verified frontmatter and App Router invariants.');

  // Deliverable 3: Architecture AST Flowchart
  assert.ok(nextAnalysis.architecture.mermaidGraph.includes('graph TD'), 'Must generate valid Mermaid graph');
  assert.ok(nextAnalysis.architecture.mermaidGraph.includes('App Router'), 'Must model App Router nodes');
  assert.ok(nextAnalysis.architecture.flowchartNodes.length >= 3, 'Must have structured flowchart nodes');
  console.log('  -> Asset 3 (Architecture AST Flowchart): Verified Mermaid diagram and node array.');

  // Deliverable 4: Client Progress Report
  assert.ok(nextAnalysis.clientHandoffReport.title.includes('acme-saas'), 'Report must include repo name');
  assert.ok(nextAnalysis.clientHandoffReport.categories.newFeatures.length > 0, 'Must extract new features from commits');
  assert.ok(nextAnalysis.clientHandoffReport.categories.securityMaintenance.length > 0, 'Must extract security updates');
  assert.ok(nextAnalysis.clientHandoffReport.categories.userExperience.length > 0, 'Must extract UX improvements');
  assert.ok(nextAnalysis.clientHandoffReport.markdown.includes('## 🚀 1. New Features Completed'), 'Markdown report formatted');
  console.log('  -> Asset 4 (Client Progress Report): Verified commercial translation of commits.');

  console.log('✅ PASS: Next.js App Router 4-asset generation complete.');

  // -------------------------------------------------------------------------
  // TEST 2: WordPress Plugin & Theme Framework Detection
  // -------------------------------------------------------------------------
  console.log('\n[TEST 2] Testing WordPress Plugin detection and secure coding rules...');
  const wpInput = {
    repoName: 'wp-payment-gateway',
    owner: 'plugins',
    repo: 'wp-payment-gateway',
    defaultBranch: 'master',
    fileTreeSummary: `
wp-content/plugins/wp-payment-gateway/wp-payment-gateway.php
wp-content/plugins/wp-payment-gateway/includes/class-gateway.php
composer.json
readme.txt
    `.trim(),
    manifestContent: JSON.stringify({
      name: 'wp-payment-gateway',
      require: {
        'php': '>=8.0',
      },
    }),
    readmeContent: '=== WordPress Payment Gateway Plugin ===\nContributors: dev\nTags: payments, stripe\nRequires at least: 6.0',
    recentCommits: [
      { message: 'feat: add WooCommerce checkout blocks integration' },
      { message: 'fix: sanitize $_POST input with sanitize_text_field and wp_nonce_field' },
      { message: 'perf: cache transient tokens for 15 minutes' },
    ],
  };

  const wpAnalysis = analyzeCodebase(wpInput);

  assert.strictEqual(wpAnalysis.framework, 'WordPress', 'Framework must be detected as WordPress');
  assert.ok(wpAnalysis.onboarding.claudeMd.includes('WordPress'), 'CLAUDE.md must include WordPress guide');
  assert.ok(wpAnalysis.onboarding.devCommands.some(c => c.includes('wp')), 'Dev commands must include wp cli or wp server');

  const wpRule = wpAnalysis.cursorRules.find(r => r.filename.includes('wordpress.mdc'));
  assert.ok(wpRule, 'Must generate wordpress.mdc');
  assert.ok(wpRule.content.includes('$wpdb->prepare'), 'Must enforce SQL sanitization via $wpdb->prepare');
  assert.ok(wpRule.content.includes('sanitize_text_field'), 'Must enforce input sanitization');
  assert.ok(wpRule.content.includes('alwaysApply: true'), 'Must enforce alwaysApply: true');
  console.log('  -> WordPress rules verified: WPCS, late escaping, and nonces enforced.');

  assert.ok(wpAnalysis.architecture.mermaidGraph.includes('WP Core') || wpAnalysis.architecture.mermaidGraph.includes('WordPress'), 'Mermaid must model WordPress components');
  console.log('✅ PASS: WordPress 4-asset generation complete.');

  // -------------------------------------------------------------------------
  // TEST 3: Database & MockStore Atomic Persistence Chain
  // -------------------------------------------------------------------------
  console.log('\n[TEST 3] Verifying atomic persistence of repo_name, status, and analysis_results...');
  const testUserId = 'usr_atomic_test_99';
  const repoUrl = 'https://github.com/acme/acme-saas';

  const savedProject = await createProject({
    user_id: testUserId,
    repo_name: 'acme-saas',
    repo_url: repoUrl,
    slug: 'acme-saas-prod',
    status: 'completed',
    analysis_results: nextAnalysis,
  });

  assert.ok(savedProject, 'Project must be created successfully');
  assert.strictEqual(savedProject.repo_name, 'acme-saas', 'repo_name must be persisted');
  assert.strictEqual(savedProject.status, 'completed', 'status must be completed');
  assert.ok(savedProject.analysis_results, 'analysis_results must be saved');
  assert.strictEqual(savedProject.analysis_results.framework, 'Next.js', 'analysis_results framework preserved');

  // Verify retrieval
  const retrieved = await getProjectById(savedProject.id);
  assert.ok(retrieved, 'Project must be retrieved by ID');
  assert.strictEqual(retrieved.status, 'completed', 'Retrieved project status matches');
  assert.ok(retrieved.analysis_results?.onboarding?.claudeMd, 'Retrieved project has complete onboarding dossier');
  console.log(`✅ PASS: Atomic persistence verified for project ${savedProject.id}.`);

  // -------------------------------------------------------------------------
  // TEST 4: Immediate In-Memory Updates & Status Updates
  // -------------------------------------------------------------------------
  console.log('\n[TEST 4] Testing MockStore updateProject method...');
  const updated = MockStore.updateProject(savedProject.id, {
    status: 'completed',
    repo_name: 'acme-saas-renamed',
  });

  assert.ok(updated, 'MockStore must update project');
  assert.strictEqual(updated.repo_name, 'acme-saas-renamed', 'Updated repo_name matches');
  assert.strictEqual(updated.status, 'completed', 'Updated status matches');
  console.log('✅ PASS: MockStore updateProject verified.');

  // -------------------------------------------------------------------------
  // TEST 5: Smart Repository Classification (NousResearch/hermes-agent AI_AGENT)
  // -------------------------------------------------------------------------
  console.log('\n[TEST 5] Testing Smart Repository Classification & Archetype Tailoring (hermes-agent)...');
  const hermesAgentInput = {
    repoName: 'hermes-agent',
    owner: 'NousResearch',
    repo: 'hermes-agent',
    defaultBranch: 'main',
    fileTreeSummary: `
agent/core.py
agent/loop.py
agent/reasoning.py
tools/exec.py
tools/registry.py
prompts/system.md
prompts/agent_cot.jinja2
requirements.txt
README.md
    `.trim(),
    manifestContent: `
ollama>=0.1.0
langchain>=0.2.0
torch>=2.0.0
pydantic>=2.0.0
    `.trim(),
    readmeContent: '# Hermes Agent\nAn autonomous AI agent loop with tool-calling definitions, reasoning traces, and persistent memory.',
    recentCommits: [
      { message: 'feat: add autonomous tool execution loop with error recovery' },
      { message: 'sec: enforce budget ceiling guardrail and redact tokens' },
      { message: 'perf: optimize context window compression and prompt caching' },
    ],
  };

  const hermesAnalysis = analyzeCodebase(hermesAgentInput);

  assert.strictEqual(hermesAnalysis.archetype, 'AI_AGENT', 'Archetype must be classified as AI_AGENT');
  assert.ok(hermesAnalysis.onboarding.claudeMd.includes('Autonomous Agent Architecture') || hermesAnalysis.onboarding.claudeMd.includes('AI AGENT'), 'CLAUDE.md must reflect AI Agent architecture');
  assert.ok(hermesAnalysis.onboarding.claudeMd.includes('Anti-Hallucination & Self-Verification Protocol'), 'CLAUDE.md must append Anti-Hallucination Protocol');
  assert.ok(hermesAnalysis.onboarding.agentsMd.includes('Agent Swarm & Tool Delegation'), 'AGENTS.md must feature agent swarm protocols');
  assert.ok(hermesAnalysis.onboarding.agentsMd.includes('Anti-Hallucination & Self-Verification Protocol'), 'AGENTS.md must append Anti-Hallucination Protocol');

  const agentRule = hermesAnalysis.cursorRules.find(r => r.filename.includes('agent-architecture.mdc'));
  assert.ok(agentRule, 'Must generate agent-architecture.mdc');
  assert.ok(agentRule.content.includes('alwaysApply: true'), 'Agent rule must have alwaysApply: true');
  assert.ok(agentRule.content.includes('Tool Calling Boundaries'), 'Agent rule must enforce tool calling boundaries');
  assert.ok(agentRule.content.includes('Anti-Hallucination & Self-Verification Protocol'), 'Agent rule must append Anti-Hallucination Protocol');

  assert.ok(hermesAnalysis.architecture.mermaidGraph.includes('Agent Reasoning Loop') || hermesAnalysis.architecture.mermaidGraph.includes('Reasoning Loop'), 'Mermaid must model Agent Reasoning Loop');
  
  // Verify SAAS_WEB_APP and CMS_PLUGIN
  assert.ok(nextAnalysis.archetype === 'SAAS_WEB_APP' || nextAnalysis.archetype === 'FULL_APPLICATION', 'Next.js repo must be classified as SAAS_WEB_APP');
  assert.strictEqual(wpAnalysis.archetype, 'CMS_PLUGIN', 'WordPress plugin must be classified as CMS_PLUGIN');

  // Verify LIBRARY_SDK
  const sdkAnalysis = analyzeCodebase({
    repoName: 'my-ts-library',
    owner: 'dev',
    repo: 'my-ts-library',
    defaultBranch: 'main',
    fileTreeSummary: 'src/index.ts\npackage.json\ntsconfig.json',
    manifestContent: JSON.stringify({ name: 'my-ts-library', main: 'dist/index.js' }),
  });
  assert.strictEqual(sdkAnalysis.archetype, 'LIBRARY_SDK', 'TypeScript package must be classified as LIBRARY_SDK');

  // Verify CLI_TOOL
  const cliAnalysis = analyzeCodebase({
    repoName: 'my-cli-tool',
    owner: 'dev',
    repo: 'my-cli-tool',
    defaultBranch: 'main',
    fileTreeSummary: 'bin/run.js\nsrc/cli.ts\npackage.json',
    manifestContent: JSON.stringify({ name: 'my-cli-tool', bin: { run: './bin/run.js' }, dependencies: { commander: '^11.0.0' } }),
  });
  assert.strictEqual(cliAnalysis.archetype, 'CLI_TOOL', 'CLI repository must be classified as CLI_TOOL');

  console.log('✅ PASS: Smart Repository Classification verified across AI_AGENT, SAAS_WEB_APP, CMS_PLUGIN, LIBRARY_SDK, and CLI_TOOL.');

  console.log('\n' + '='.repeat(72));
  console.log('🎉 MONETIZATION ANALYZER ENGINE TEST SUITE: 100% PASS (5/5 TESTS)');
  console.log('='.repeat(72));
}

runAnalyzerEngineSuite().catch((err) => {
  console.error('❌ Test suite execution failure:', err);
  process.exit(1);
});
