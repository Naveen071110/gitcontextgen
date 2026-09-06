import assert from 'assert';
import crypto from 'crypto';
import { POST, resetIdempotencyCacheForTesting } from '../src/app/api/webhooks/dodo/route';
import { getUserSubscriptionDb } from '../src/lib/db';
import { MockStore } from '../src/lib/mockStore';
import { DODO_PRODUCTS } from '../src/lib/products';

async function runWebhookSignatureSuite() {
  console.log('='.repeat(72));
  console.log('🧪 Phase 3: Live Dodo Payments Webhook & Subscription Gate Audit');
  console.log('='.repeat(72));

  const testSecret = 'whsec_prod_verification_secret_2026_xyz';
  process.env.DODO_PAYMENTS_WEBHOOK_SECRET = testSecret;
  resetIdempotencyCacheForTesting();

  const userId = 'usr_dodo_paying_customer_77';

  // Helper to compute HMAC signature
  function makeSignature(body: string, secret: string = testSecret): string {
    return crypto.createHmac('sha256', secret).update(body).digest('hex');
  }

  // [TEST 1] Missing or blank signature payload must be rejected with 401
  console.log('\n[TEST 1] Testing missing / blank signature rejection (401 Unauthorized)...');
  const payload1 = JSON.stringify({
    event_type: 'subscription.active',
    data: {
      id: 'sub_evt_001',
      metadata: { userId },
      product_id: DODO_PRODUCTS.PRO.monthly,
      status: 'active',
    },
  });

  const reqMissingSig = new Request('http://localhost:3000/api/webhooks/dodo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload1,
  });
  const resMissingSig = await POST(reqMissingSig);
  assert.strictEqual(resMissingSig.status, 401, 'Request without signature header must return 401');
  console.log('✅ PASS: Missing signature rejected with 401 Unauthorized.');

  // [TEST 2] Invalid cryptographic signature must be rejected with 401
  console.log('\n[TEST 2] Testing forged / invalid cryptographic signature rejection (401 Unauthorized)...');
  const reqForgedSig = new Request('http://localhost:3000/api/webhooks/dodo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-dodo-signature': 'forged_tampered_signature_hex_1234567890abcdef',
    },
    body: payload1,
  });
  const resForgedSig = await POST(reqForgedSig);
  assert.strictEqual(resForgedSig.status, 401, 'Request with invalid signature must return 401');
  console.log('✅ PASS: Forged signature rejected with 401 Unauthorized.');

  // [TEST 3] Valid cryptographic signature for subscription.active (PRO Tier)
  console.log('\n[TEST 3] Testing valid signature processing for subscription.active (PRO Tier)...');
  const validSig1 = makeSignature(payload1);
  const reqValid = new Request('http://localhost:3000/api/webhooks/dodo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-dodo-signature': validSig1,
    },
    body: payload1,
  });
  const resValid = await POST(reqValid);
  const dataValid = await resValid.json();
  assert.strictEqual(resValid.status, 200, 'Valid signature must return 200 OK');
  assert.strictEqual(dataValid.received, true);

  const userSub = await getUserSubscriptionDb(userId);
  assert.ok(userSub, 'User subscription must be recorded');
  assert.strictEqual(userSub.tier, 'PRO', 'User tier must be updated to PRO');
  assert.strictEqual(userSub.status, 'active');
  console.log(`✅ PASS: Valid signature accepted; User upgraded to ${userSub.tier} (${userSub.status}).`);

  // [TEST 4] Idempotency & Replay Attack Defense
  console.log('\n[TEST 4] Testing idempotency / replay attack defense with identical transaction ID...');
  const reqReplay = new Request('http://localhost:3000/api/webhooks/dodo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-dodo-signature': validSig1,
    },
    body: payload1,
  });
  const resReplay = await POST(reqReplay);
  const dataReplay = await resReplay.json();
  assert.strictEqual(resReplay.status, 200, 'Replay must return 200');
  assert.strictEqual(dataReplay.duplicate, true, 'Replay must be flagged as duplicate/idempotent');
  console.log('✅ PASS: Replay attack intercepted; duplicate transaction cleanly deduplicated.');

  // [TEST 5] Payment Succeeded with DFY Onboarding Add-on
  console.log('\n[TEST 5] Testing payment.succeeded with bundled Done-For-You (DFY) Onboarding...');
  const dfyPayload = JSON.stringify({
    event_type: 'payment.succeeded',
    data: {
      id: 'pay_live_dfy_bundle_99',
      metadata: { userId, bundleDfy: 'true' },
      total_amount: 29900,
      currency: 'USD',
      customer: { email: 'client@agency.corp', name: 'Lead Architect' },
    },
  });
  const reqDfy = new Request('http://localhost:3000/api/webhooks/dodo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-dodo-signature': makeSignature(dfyPayload),
    },
    body: dfyPayload,
  });
  const resDfy = await POST(reqDfy);
  assert.strictEqual(resDfy.status, 200);
  const dfyRecords = MockStore.getDfyOnboardings();
  const matchedDfy = dfyRecords.find(d => d.payment_id === 'pay_live_dfy_bundle_99');
  assert.ok(matchedDfy, 'DFY onboarding record must be created');
  assert.strictEqual(matchedDfy.status, 'pending_scheduling');
  console.log('✅ PASS: DFY onboarding payment parsed and recorded in scheduling queue.');

  // [TEST 6] Cancellation / Revocation
  console.log('\n[TEST 6] Testing subscription.cancelled event...');
  const cancelPayload = JSON.stringify({
    event_type: 'subscription.cancelled',
    data: {
      id: 'sub_evt_cancel_002',
      metadata: { userId },
    },
  });
  const reqCancel = new Request('http://localhost:3000/api/webhooks/dodo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-dodo-signature': makeSignature(cancelPayload),
    },
    body: cancelPayload,
  });
  const resCancel = await POST(reqCancel);
  assert.strictEqual(resCancel.status, 200);
  const subAfterCancel = await getUserSubscriptionDb(userId);
  assert.strictEqual(subAfterCancel?.tier, 'FREE', 'Cancelled subscription must revert tier to FREE');
  assert.strictEqual(subAfterCancel?.status, 'cancelled');
  console.log('✅ PASS: Subscription cancelled; user tier immediately reverted to FREE.');

  // [TEST 7] Payment Failed / On Hold
  console.log('\n[TEST 7] Testing payment.failed event...');
  const failPayload = JSON.stringify({
    event_type: 'payment.failed',
    data: {
      id: 'pay_evt_failed_003',
      metadata: { userId },
    },
  });
  const reqFail = new Request('http://localhost:3000/api/webhooks/dodo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-dodo-signature': makeSignature(failPayload),
    },
    body: failPayload,
  });
  const resFail = await POST(reqFail);
  assert.strictEqual(resFail.status, 200);
  const subAfterFail = await getUserSubscriptionDb(userId);
  assert.strictEqual(subAfterFail?.status, 'on_hold', 'Payment failure must place account on_hold');
  console.log('✅ PASS: Payment failure places subscription status on_hold.');

  console.log('\n' + '='.repeat(72));
  console.log('🎉 PHASE 3: WEBHOOK SIGNATURE & SUBSCRIPTION GATE PASSED 100% (7/7 ASSERTIONS)');
  console.log('='.repeat(72));
}

runWebhookSignatureSuite().catch(err => {
  console.error('❌ Phase 3 Suite Failed:', err);
  process.exit(1);
});
