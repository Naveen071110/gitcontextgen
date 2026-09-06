import assert from 'assert';
import {
  createProject,
  getProjectById,
  getUserProjects,
  deleteProjectDb,
  saveDocAssets,
  getDocAssets,
  countUserProjects,
  upsertUserSubscriptionDb,
  getUserSubscriptionDb,
  addDfyOnboardingDb,
} from '../src/lib/db';
import { MockStore } from '../src/lib/mockStore';

async function runDbResilienceSuite() {
  console.log('='.repeat(72));
  console.log('🧪 Phase 2: Supabase Schema Integrity & Dual-Mode Fallback Verification');
  console.log('='.repeat(72));

  // Save current environment variables
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const originalRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    // 1. Force network / configuration failure by blanking out Supabase variables
    console.log('\n[TEST 1] Disabling Supabase client credentials to simulate offline network state...');
    process.env.NEXT_PUBLIC_SUPABASE_URL = '';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';
    process.env.SUPABASE_SERVICE_ROLE_KEY = '';
    console.log('  -> Supabase client variables set to empty string.');

    const userId = 'usr_offline_failover_42';
    const repoUrl = 'https://github.com/facebook/react';
    const slug = 'react-failover-demo';

    // 2. Project Creation Failover
    console.log('\n[TEST 2] Verifying graceful failover during project creation...');
    const project = await createProject({
      user_id: userId,
      repo_url: repoUrl,
      slug,
      branding_color: '#10b981',
      audience_tone: 'technical',
    });

    assert.ok(project, 'Project must be created in resilient in-memory store');
    assert.ok(project.id, 'Project must have generated unique ID');
    assert.strictEqual(project.user_id, userId, 'User ID must match');
    assert.strictEqual(project.slug, slug, 'Slug must match');
    console.log(`✅ PASS: Project created via failover (ID: ${project.id}).`);

    // 3. Count User Projects
    console.log('\n[TEST 3] Verifying countUserProjects fallback...');
    const count = await countUserProjects(userId);
    assert.ok(count >= 1, `Expected project count >= 1, received ${count}`);
    console.log(`✅ PASS: countUserProjects returned ${count} without database exceptions.`);

    // 4. Project Retrieval by ID
    console.log('\n[TEST 4] Verifying getProjectById fallback...');
    const fetched = await getProjectById(project.id);
    assert.ok(fetched, 'Must retrieve project from fallback store');
    assert.strictEqual(fetched.id, project.id, 'Retrieved project ID must match');
    console.log('✅ PASS: Project retrieved by ID successfully.');

    // 5. Documentation Assets Storage & Retrieval
    console.log('\n[TEST 5] Verifying saveDocAssets & getDocAssets fallback...');
    const contextDoc = '# Context File for React';
    const archDoc = 'graph TD\n  Client-->Server';
    await saveDocAssets(project.id, contextDoc, archDoc);
    const assets = await getDocAssets(project.id);
    assert.strictEqual(assets.length, 2, 'Expected 2 documentation assets (context & architecture)');
    assert.ok(assets.some(a => a.type === 'context' && a.content === contextDoc));
    assert.ok(assets.some(a => a.type === 'architecture' && a.content === archDoc));
    console.log('✅ PASS: Documentation assets saved and retrieved cleanly.');

    // 6. Subscription Management Fallback
    console.log('\n[TEST 6] Verifying user_subscriptions dual-mode upsert & fetch...');
    const subscription = await upsertUserSubscriptionDb({
      user_id: userId,
      tier: 'PRO',
      status: 'active',
      customer_id: 'cus_resilience_test',
      subscription_id: 'sub_resilience_test',
    });
    assert.ok(subscription, 'Subscription must be saved in fallback store');
    assert.strictEqual(subscription.tier, 'PRO', 'Subscription tier must be PRO');

    const fetchedSub = await getUserSubscriptionDb(userId);
    assert.ok(fetchedSub, 'Must retrieve subscription from fallback store');
    assert.strictEqual(fetchedSub?.tier, 'PRO');
    assert.strictEqual(fetchedSub?.status, 'active');
    console.log('✅ PASS: Subscription updated and retrieved via fallback store.');

    // 7. Done-For-You (DFY) Onboarding Fallback
    console.log('\n[TEST 7] Verifying dfy_onboardings fallback...');
    const dfy = await addDfyOnboardingDb({
      user_id: userId,
      payment_id: 'pay_dfy_offline_test',
      customer_email: 'test@example.com',
      customer_name: 'Resilience Test User',
    });
    assert.ok(dfy, 'DFY onboarding must be recorded in fallback store');
    assert.strictEqual(dfy.status, 'pending_scheduling');
    console.log('✅ PASS: DFY onboarding recorded via fallback store.');

    // 8. Project Deletion
    console.log('\n[TEST 8] Verifying deleteProjectDb fallback...');
    const deleted = await deleteProjectDb(project.id);
    assert.strictEqual(deleted, true, 'Deletion must return true');

    const countAfter = await countUserProjects(userId);
    assert.strictEqual(countAfter, 0, 'Project count must be 0 after deletion');
    console.log('✅ PASS: Project deleted and verified.');

    console.log('\n' + '='.repeat(72));
    console.log('🎉 PHASE 2: DATABASE RESILIENCE SUITE PASSED 100% (8/8 ASSERTIONS)');
    console.log('='.repeat(72));
  } finally {
    // Restore environment
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalRoleKey;
  }
}

runDbResilienceSuite().catch(err => {
  console.error('❌ Phase 2 Suite Failed:', err);
  process.exit(1);
});
