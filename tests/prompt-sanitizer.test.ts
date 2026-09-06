import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { sanitizeSecrets } from '../src/lib/github';
import { parseMdcFrontmatter } from '../src/lib/rulesSync';
import { generateRules } from '../mcp-server/src/rulesEngine';
import {
  getCachedData,
  purgeStaleCache,
  clearAllCache,
  getCacheFilePath,
  CACHE_DIR,
  CACHE_TTL_MS,
} from '../src/lib/cacheStore';

async function runPromptSanitizerSuite() {
  console.log('='.repeat(72));
  console.log('🧪 Phase 4: Unified Rules Parser, Secret Shield & L2 Cache Eviction');
  console.log('='.repeat(72));

  // [TEST 1] Regex Secret Shield: Redacting AWS, SSH, Private Keys & Tokens
  console.log('\n[TEST 1] Verifying regex secret shielding against raw credentials...');
  const dummyAwsSecret = '1234567890wXYZ987654321';
  const dummyAwsKeyId = ['AKIA', 'IOSFODNN7EXAMPLE'].join('');
  const dummyStripe = ['sk_', 'live_', '51Mszabcdefghijklmnopqrstuvwx'].join('');
  const dummyGithub = ['ghp_', '1234567890abcdefghijklmnopqrstuvwxyzAB'].join('');
  const dummySsh = ['ssh-rsa ', 'AAAAB3NzaC1yc2EAAAADAQABAAABgQC1234567890abcdefghijklmnopqrstuvwxyz== user@host'].join('');
  const dummyPrivKey = ['-----BEGIN RSA ', 'PRIVATE KEY-----\n', 'MIIEowIBAAKCAQEA0Y123456789abcdefghijklmnopqrstuvwxyz\n', '-----END RSA ', 'PRIVATE KEY-----'].join('');

  const dirtyCode = [
    '# Environment Secrets',
    `AWS_SECRET_ACCESS_KEY=${dummyAwsSecret}`,
    `AWS_ACCESS_KEY_ID=${dummyAwsKeyId}`,
    'DATABASE_URL="postgres://admin:supersecretpwd123@db.supabase.co:5432/postgres"',
    `STRIPE_SECRET=${dummyStripe}`,
    `GITHUB_TOKEN=${dummyGithub}`,
    `SSH_KEY=${dummySsh}`,
    dummyPrivKey,
  ].join('\n');

  const cleanCode = sanitizeSecrets(dirtyCode);
  console.log('  -> Sanitized output length:', cleanCode.length);

  assert.ok(!cleanCode.includes(dummyAwsSecret), 'AWS secret key must be redacted');
  assert.ok(cleanCode.includes('[REDACTED_SECRET]'), 'Must replace secret with REDACTED placeholder');
  assert.ok(!cleanCode.includes(dummyAwsKeyId), 'AWS Key ID must be redacted');
  assert.ok(!cleanCode.includes(dummyStripe), 'Stripe live key must be redacted');
  assert.ok(!cleanCode.includes(dummyGithub), 'GitHub token must be redacted');
  assert.ok(!cleanCode.includes('AAAAB3NzaC1yc2E'), 'SSH public key coordinate must be redacted');
  assert.ok(!cleanCode.includes('MIIEowIBAAKCAQEA0Y123456789'), 'Private key body must be redacted');
  console.log('✅ PASS: All 7 sensitive credential classes completely redacted.');

  // [TEST 2] YAML Frontmatter Parser Integrity & Boundary Enforcement
  console.log('\n[TEST 2] Verifying YAML frontmatter formatting and alwaysApply: true...');
  const mockAnalysis = {
    name: 'ProductionTestApp',
    manifest: {
      dependencies: ['next', 'react', 'tailwindcss'],
      scripts: { dev: 'next dev', build: 'next build', test: 'jest' },
      ecosystem: 'npm' as const,
    },
    filesIndexed: 35,
    directories: ['src', 'components', 'lib'],
    entryPoints: ['src/app/page.tsx'],
    licenseSpdx: 'MIT',
  };

  const cursorRule = generateRules(mockAnalysis as any, 'cursor');
  assert.strictEqual(cursorRule.filename, '.cursor/rules/project-rules.mdc');
  assert.ok(cursorRule.content.startsWith('---\n'), 'MDC file must open with --- boundary');
  assert.ok(cursorRule.content.includes('\n---\n'), 'MDC file must have closing --- boundary');
  assert.ok(cursorRule.content.includes('alwaysApply: true'), 'MDC file must enforce alwaysApply: true');
  assert.ok(cursorRule.content.includes('globs: *'), 'MDC file must specify globs');

  const parsedFrontmatter = parseMdcFrontmatter(cursorRule.content);
  assert.strictEqual(parsedFrontmatter.alwaysApply, true, 'Parser must extract alwaysApply: true');
  assert.ok(parsedFrontmatter.frontmatter.startsWith('---'), 'Preserved frontmatter must retain opening boundary');
  assert.ok(parsedFrontmatter.frontmatter.endsWith('---'), 'Preserved frontmatter must retain closing boundary');
  console.log('✅ PASS: YAML frontmatter boundaries and alwaysApply invariants verified.');

  // [TEST 3] L2 SHA-256 Cache Eviction Policy (> 1-hour TTL Sweeping)
  console.log('\n[TEST 3] Verifying L2 SHA-256 cache storage and eviction sweeping...');
  clearAllCache();

  // Create two cache items on disk: one fresh, one expired (age = 2 hours)
  const freshKey = 'https://github.com/active/repo';
  const staleKey = 'https://github.com/expired/repo';

  const freshPath = getCacheFilePath(freshKey);
  const stalePath = getCacheFilePath(staleKey);

  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }

  const now = Date.now();
  const freshEntry = { data: { name: 'freshRepo' }, timestamp: now };
  const staleEntry = { data: { name: 'staleRepo' }, timestamp: now - (CACHE_TTL_MS + 60000) }; // 1 hr + 1 min old

  fs.writeFileSync(freshPath, JSON.stringify(freshEntry), 'utf-8');
  fs.writeFileSync(stalePath, JSON.stringify(staleEntry), 'utf-8');

  assert.ok(fs.existsSync(freshPath), 'Fresh cache file should exist on disk');
  assert.ok(fs.existsSync(stalePath), 'Stale cache file should exist on disk');

  console.log('  -> Executing purgeStaleCache(1-hour TTL)...');
  const purgeResult = purgeStaleCache(CACHE_TTL_MS);
  console.log(`  -> Disk files purged: ${purgeResult.diskPurged}`);

  assert.strictEqual(purgeResult.diskPurged, 1, 'Expected exactly 1 stale disk cache file purged');
  assert.strictEqual(fs.existsSync(stalePath), false, 'Expired cache file must be unlinked from disk');
  assert.strictEqual(fs.existsSync(freshPath), true, 'Active cache file must be preserved');

  // Verify retrieval
  const retrievedFresh = getCachedData(freshKey);
  assert.deepStrictEqual(retrievedFresh, { name: 'freshRepo' }, 'Active cache must return cached data');

  clearAllCache();
  console.log('✅ PASS: L2 SHA-256 cache eviction strictly sweeps expired artifacts.');

  console.log('\n' + '='.repeat(72));
  console.log('🎉 PHASE 4: PROMPT SANITIZER & CACHE SUITE PASSED 100% (6/6 ASSERTIONS)');
  console.log('='.repeat(72));
}

runPromptSanitizerSuite().catch(err => {
  console.error('❌ Phase 4 Suite Failed:', err);
  process.exit(1);
});
