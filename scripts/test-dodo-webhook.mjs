import http from 'http';

// We test the Dodo webhook handler logic directly
async function runWebhookDiagnostic() {
  console.log('='.repeat(72));
  console.log('🧪 Running Dodo Payments Webhook & Production Signature Verification');
  console.log('='.repeat(72));

  // Dynamically import the compiled Next.js route handler or test handler
  const { POST } = await import('../src/app/api/webhooks/dodo/route.ts');

  // Test 1: Fallback JSON payload (subscription.active event)
  console.log('\n[TEST 1] Testing subscription.active event processing...');
  const activePayload = {
    event_type: 'subscription.active',
    data: {
      id: 'sub_live_test_001',
      customer_id: 'cus_live_enterprise_01',
      status: 'active',
      metadata: { userId: 'user_live_prod_99' },
    },
  };

  const req1 = new Request('https://gitcontextgen.com/api/webhooks/dodo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(activePayload),
  });

  const res1 = await POST(req1);
  const data1 = await res1.json();
  if (res1.status !== 200 || !data1.received) {
    throw new Error(`Test 1 Failed: Status ${res1.status}, data: ${JSON.stringify(data1)}`);
  }
  console.log('✅ Status 200: subscription.active event parsed and verified.');

  // Test 2: payment.succeeded event
  console.log('\n[TEST 2] Testing payment.succeeded event processing...');
  const paymentPayload = {
    event_type: 'payment.succeeded',
    data: {
      id: 'pay_live_test_888',
      currency: 'USD',
      total_amount: 5900,
      customer_id: 'cus_live_enterprise_01',
    },
  };

  const req2 = new Request('https://gitcontextgen.com/api/webhooks/dodo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentPayload),
  });

  const res2 = await POST(req2);
  const data2 = await res2.json();
  if (res2.status !== 200 || !data2.received) {
    throw new Error(`Test 2 Failed: Status ${res2.status}, data: ${JSON.stringify(data2)}`);
  }
  console.log('✅ Status 200: payment.succeeded event parsed and verified.');

  // Test 3: Rejection on invalid signature when secret is configured
  console.log('\n[TEST 3] Testing rejection on invalid signature with secret configured...');
  process.env.DODO_PAYMENTS_WEBHOOK_SECRET = 'whsec_test_secret_1234567890';
  const req3 = new Request('https://gitcontextgen.com/api/webhooks/dodo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-dodo-signature': 'invalid_forged_signature_hash',
    },
    body: JSON.stringify(activePayload),
  });

  const res3 = await POST(req3);
  if (res3.status === 401) {
    console.log('✅ Status 401: Forged signature successfully rejected with 401 Unauthorized.');
  } else {
    throw new Error(`Test 3 Failed: Expected 401 on forged signature, got ${res3.status}`);
  }

  // Restore env
  delete process.env.DODO_PAYMENTS_WEBHOOK_SECRET;

  console.log('\n' + '='.repeat(72));
  console.log('🎉 ALL DODO WEBHOOK SIGNATURE & EVENT TESTS PASSED (100% SUCCESS)');
  console.log('='.repeat(72));
}

runWebhookDiagnostic().catch((err) => {
  console.error('❌ Webhook test failed:', err);
  process.exit(1);
});
