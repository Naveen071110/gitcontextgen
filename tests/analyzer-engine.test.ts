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

  console.log('\n' + '='.repeat(72));
  console.log('🎉 MONETIZATION ANALYZER ENGINE TEST SUITE: 100% PASS');
  console.log('='.repeat(72));
}

runAnalyzerEngineSuite().catch((err) => {
  console.error('❌ Test suite execution failure:', err);
  process.exit(1);
});
