import assert from 'assert';
import { POST as analyzePost } from '../src/app/api/analyze/route';
import { POST as checkoutPost } from '../src/app/api/checkout/route';
import { getAppUrl, getCheckoutReturnUrl, getCheckoutCancelUrl } from '../src/lib/payments/dodo';

async function runCheckoutAndTimeoutSuite() {
  console.log('='.repeat(78));
  console.log('🧪 Dedicated Verification: Checkout Redirection & Analyzer Timeout Gates');
  console.log('='.repeat(78));

  // -------------------------------------------------------------------------
  // [TEST 1] Production APP URL Enforcement (Never localhost in production)
  // -------------------------------------------------------------------------
  console.log('\n[TEST 1] Verifying Production APP URL Resolution & Invariant Guard...');
  const originalEnv = process.env.NODE_ENV;
  const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;

  try {
    (process.env as any).NODE_ENV = 'production';
    delete process.env.NEXT_PUBLIC_APP_URL;

    const prodUrl = getAppUrl();
    assert.ok(prodUrl.startsWith('https://'), `Production URL must start with https://, got: ${prodUrl}`);
    assert.strictEqual(prodUrl.includes('localhost'), false, 'Production URL must never contain localhost');

    const returnUrl = getCheckoutReturnUrl();
    assert.ok(returnUrl.startsWith('https://'), `Return URL must start with https://, got: ${returnUrl}`);
    assert.strictEqual(returnUrl.includes('localhost'), false, 'Return URL must never contain localhost');

    const cancelUrl = getCheckoutCancelUrl();
    assert.ok(cancelUrl.startsWith('https://'), `Cancel URL must start with https://, got: ${cancelUrl}`);
    assert.strictEqual(cancelUrl.includes('localhost'), false, 'Cancel URL must never contain localhost');

    console.log('✅ PASS: Production URLs strictly enforce HTTPS and prevent localhost redirects.');
  } finally {
    (process.env as any).NODE_ENV = originalEnv;
    if (originalAppUrl !== undefined) {
      process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
    } else {
      delete process.env.NEXT_PUBLIC_APP_URL;
    }
  }

  // -------------------------------------------------------------------------
  // [TEST 2] Checkout API Route: Request ID & Trusted Origin Output
  // -------------------------------------------------------------------------
  console.log('\n[TEST 2] Testing /api/checkout session creation & trusted origin routing...');
  const checkoutReq = new Request('http://localhost:3000/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: 'p_monthly_pro',
      userEmail: 'qa-tester@example.com',
    }),
  });

  const checkoutRes = await checkoutPost(checkoutReq);
  const checkoutData = await checkoutRes.json();

  assert.strictEqual(checkoutRes.status, 200, 'Checkout POST must return 200 OK');
  assert.ok(checkoutData.url, 'Response must include checkout URL');
  assert.ok(checkoutData.requestId, 'Response must include correlation requestId');
  assert.ok(checkoutData.requestId.startsWith('chk_'), 'RequestId must be prefixed with chk_');

  const parsedUrl = new URL(checkoutData.url);
  assert.ok(
    parsedUrl.origin === 'https://checkout.dodopayments.com' ||
    parsedUrl.origin === 'https://test.dodopayments.com' ||
    parsedUrl.origin === new URL(getAppUrl()).origin,
    `Checkout URL origin must be trusted. Got: ${parsedUrl.origin}`
  );
  console.log(`✅ PASS: Checkout endpoint generates verified URL with correlation ID (${checkoutData.requestId}).`);

  // -------------------------------------------------------------------------
  // [TEST 3] Analyzer API Route: Missing target returns 400 with correlation ID
  // -------------------------------------------------------------------------
  console.log('\n[TEST 3] Testing /api/analyze validation error handling & correlation ID...');
  const invalidAnalyzeReq = new Request('http://localhost:3000/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });

  const invalidAnalyzeRes = await analyzePost(invalidAnalyzeReq);
  const invalidAnalyzeData = await invalidAnalyzeRes.json();

  assert.strictEqual(invalidAnalyzeRes.status, 400, 'Empty analyze POST must return 400 Bad Request');
  assert.ok(invalidAnalyzeData.error, 'Response must contain error message');
  assert.ok(invalidAnalyzeData.requestId, 'Response must include correlation requestId');
  assert.ok(invalidAnalyzeData.requestId.startsWith('req_'), 'RequestId must be prefixed with req_');
  console.log(`✅ PASS: Analyzer validation returns clean 400 with correlation ID (${invalidAnalyzeData.requestId}).`);

  // -------------------------------------------------------------------------
  // [TEST 4] Analyzer API Route: Non-existent / slow repo handling
  // -------------------------------------------------------------------------
  console.log('\n[TEST 4] Testing /api/analyze failure handling & non-2xx status code...');
  const nonExistentReq = new Request('http://localhost:3000/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://github.com/invalid-org-name-0000000/non-existent-repo-9999999' }),
  });

  const nonExistentRes = await analyzePost(nonExistentReq);
  const nonExistentData = await nonExistentRes.json();

  assert.ok(
    nonExistentRes.status === 422 || nonExistentRes.status === 500 || nonExistentRes.status === 504,
    `Status should be non-2xx failure code. Got: ${nonExistentRes.status}`
  );
  assert.ok(nonExistentData.requestId, 'Failure response must contain correlation requestId');
  assert.strictEqual(nonExistentData.progress, 'failed', 'Failure response must mark progress as failed');
  console.log(`✅ PASS: Handled failure state gracefully with correlation ID (${nonExistentData.requestId}).`);

  console.log('\n' + '='.repeat(78));
  console.log('🎉 ALL CHECKOUT & TIMEOUT TESTS PASSED (4/4 ASSERTIONS)');
  console.log('='.repeat(78));
}

runCheckoutAndTimeoutSuite().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
