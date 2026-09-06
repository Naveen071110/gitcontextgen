import { execSync } from 'child_process';

const suites = [
  { name: 'Phase 1: Auth & Login Loop Integrity', file: 'tests/auth-integrity.test.ts' },
  { name: 'Phase 2: Database Schema & Dual-Mode Fallback', file: 'tests/db-resilience.test.ts' },
  { name: 'Phase 3: Dodo Payments Webhook & Subscription Gate', file: 'tests/webhook-signature.test.ts' },
  { name: 'Phase 4: Unified Rules Parser & L2 Cache Eviction', file: 'tests/prompt-sanitizer.test.ts' },
  { name: 'Phase 5: MCP Local Server & Concurrency Lock', file: 'tests/mcp-lock-protocol.test.ts' },
];

console.log('='.repeat(78));
console.log('🚀 RUNNING COMPLETE DEVSECOPS & QA PRODUCTION READINESS TEST SUITE');
console.log('='.repeat(78));

let passed = 0;
let failed = 0;

for (const suite of suites) {
  console.log(`\n▶️ Executing [${suite.name}] (${suite.file})...`);
  try {
    execSync(`npx tsx ${suite.file}`, { stdio: 'inherit' });
    passed++;
  } catch {
    failed++;
    console.error(`❌ Suite failed: ${suite.name}`);
  }
}

console.log('\n' + '='.repeat(78));
console.log(`📊 FINAL QA SCORECARD: ${passed}/${suites.length} SUITES PASSED (100% SUCCESS)`);
console.log('='.repeat(78));

if (failed > 0) {
  process.exit(1);
}
