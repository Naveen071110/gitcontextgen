import assert from 'assert';
import { POST, GET, DELETE, PATCH } from '../src/app/api/projects/route';

async function runAuthIntegritySuite() {
  console.log('='.repeat(72));
  console.log('🧪 Phase 1: Authentication & Dashboard Login Loop Integrity Suite');
  console.log('='.repeat(72));

  const userAlice = 'usr_alice_1001';
  const userBob = 'usr_bob_2002';
  const validRepoUrl = 'https://github.com/facebook/react';
  const anotherRepoUrl = 'https://github.com/vercel/next.js';

  // [TEST 1] Guest attempting to add repository (Unauthenticated)
  console.log('\n[TEST 1] Simulating guest trying to add a repository (Unauthenticated)...');
  const guestReq = new Request('http://localhost:3000/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repo_url: validRepoUrl }),
  });
  const guestRes = await POST(guestReq);
  const guestData = await guestRes.json();
  console.log(`  -> Status: ${guestRes.status}, Error: "${guestData.error}"`);
  assert.strictEqual(guestRes.status, 401, 'Guest request must return 401 Unauthorized');
  assert.ok(guestData.error.includes('Unauthorized'), 'Error message must specify Unauthorized');
  console.log('✅ PASS: Guest rejected with 401 Unauthorized.');

  // [TEST 2] Malformed or empty repository URL validation
  console.log('\n[TEST 2] Simulating malformed or empty repository URL requests...');
  
  // 2a: Empty URL
  const emptyReq = new Request('http://localhost:3000/api/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-test-user-id': userAlice,
    },
    body: JSON.stringify({ repo_url: '   ' }),
  });
  const emptyRes = await POST(emptyReq);
  assert.strictEqual(emptyRes.status, 400, 'Empty repo_url must return 400 Bad Request');
  console.log('  -> 2a (Empty URL): 400 Bad Request verified.');

  // 2b: Malformed non-GitHub URL
  const malformedReq = new Request('http://localhost:3000/api/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-test-user-id': userAlice,
    },
    body: JSON.stringify({ repo_url: 'https://randomsite.org/not-a-repo' }),
  });
  const malformedRes = await POST(malformedReq);
  assert.strictEqual(malformedRes.status, 400, 'Non-GitHub URL must return 400 Bad Request');
  console.log('  -> 2b (Malformed URL): 400 Bad Request verified.');
  console.log('✅ PASS: Structured 400 validation prevents Next.js process crashes.');

  // [TEST 3] Authenticated user adding a valid repository
  console.log('\n[TEST 3] Simulating authenticated user (Alice) adding a valid repository...');
  const addReq = new Request('http://localhost:3000/api/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-test-user-id': userAlice,
    },
    body: JSON.stringify({
      repo_url: validRepoUrl,
      branding_color: '#4f46e5',
    }),
  });
  const addRes = await POST(addReq);
  const addData = await addRes.json();
  console.log(`  -> Status: ${addRes.status}, Created Project ID: ${addData.project?.id}`);
  assert.strictEqual(addRes.status, 201, 'Valid addition must return 201 Created');
  assert.ok(addData.project, 'Response must include created project payload');
  assert.strictEqual(addData.project.user_id, userAlice, 'Project must belong to authenticated user Alice');
  const aliceProjectId = addData.project.id;
  console.log('✅ PASS: Authenticated user repository added successfully.');

  // [TEST 4] Duplicate repository URL rejection
  console.log('\n[TEST 4] Simulating duplicate repository addition by Alice...');
  const dupReq = new Request('http://localhost:3000/api/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-test-user-id': userAlice,
    },
    body: JSON.stringify({ repo_url: validRepoUrl }),
  });
  const dupRes = await POST(dupReq);
  const dupData = await dupRes.json();
  assert.strictEqual(dupRes.status, 400, 'Duplicate repository must return 400 Bad Request');
  assert.ok(dupData.error.includes('Duplicate'), 'Error message must indicate duplicate repository');
  console.log('✅ PASS: Duplicate repository blocked with structured 400.');

  // [TEST 5] Cross-user boundary: Bob attempts to modify/patch Alice\'s project
  console.log('\n[TEST 5] Simulating Bob attempting to modify Alice\'s project (403 Forbidden check)...');
  const bobPatchReq = new Request('http://localhost:3000/api/projects', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-test-user-id': userBob,
    },
    body: JSON.stringify({ id: aliceProjectId, branding_color: '#ef4444' }),
  });
  const bobPatchRes = await PATCH(bobPatchReq);
  const bobPatchData = await bobPatchRes.json();
  console.log(`  -> Status: ${bobPatchRes.status}, Error: "${bobPatchData.error}"`);
  assert.strictEqual(bobPatchRes.status, 403, 'Cross-user modification must return 403 Forbidden');
  console.log('✅ PASS: Cross-user modification forbidden.');

  // [TEST 6] Cross-user boundary: Bob attempts to delete Alice\'s project
  console.log('\n[TEST 6] Simulating Bob attempting to delete Alice\'s project (403 Forbidden check)...');
  const bobDeleteReq = new Request(`http://localhost:3000/api/projects?id=${aliceProjectId}`, {
    method: 'DELETE',
    headers: {
      'x-test-user-id': userBob,
    },
  });
  const bobDeleteRes = await DELETE(bobDeleteReq);
  const bobDeleteData = await bobDeleteRes.json();
  console.log(`  -> Status: ${bobDeleteRes.status}, Error: "${bobDeleteData.error}"`);
  assert.strictEqual(bobDeleteRes.status, 403, 'Cross-user deletion must return 403 Forbidden');
  console.log('✅ PASS: Cross-user deletion forbidden.');

  // [TEST 7] Authorized deletion by project owner (Alice)
  console.log('\n[TEST 7] Simulating Alice deleting her own project...');
  const aliceDeleteReq = new Request(`http://localhost:3000/api/projects?id=${aliceProjectId}`, {
    method: 'DELETE',
    headers: {
      'x-test-user-id': userAlice,
    },
  });
  const aliceDeleteRes = await DELETE(aliceDeleteReq);
  assert.strictEqual(aliceDeleteRes.status, 200, 'Owner deletion must succeed with 200 OK');
  console.log('✅ PASS: Owner successfully deleted project.');

  console.log('\n' + '='.repeat(72));
  console.log('🎉 PHASE 1: AUTH INTEGRITY SUITE PASSED 100% (7/7 ASSERTIONS)');
  console.log('='.repeat(72));
}

runAuthIntegritySuite().catch(err => {
  console.error('❌ Phase 1 Suite Failed:', err);
  process.exit(1);
});
