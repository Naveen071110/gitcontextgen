import { NextResponse } from 'next/server';
import DodoPayments from 'dodopayments';

import { isDodoApiKeyPlaceholder, getAppUrl } from '@/lib/payments/dodo';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const customerId = body.customerId || 'cus_agency_demo_id';

    const origin = req.headers.get('origin') || req.headers.get('referer');
    let dynamicOrigin: string | undefined;
    if (origin) {
      try {
        dynamicOrigin = new URL(origin).origin;
      } catch {}
    }

    const apiKey = process.env.DODO_PAYMENTS_API_KEY?.trim();
    const defaultBaseUrl = getAppUrl(dynamicOrigin);
    const returnUrl =
      process.env.DODO_PAYMENTS_RETURN_URL || `${defaultBaseUrl}/dashboard/agency`;
    const isPlaceholder = isDodoApiKeyPlaceholder(apiKey);

    // Development / Sandbox Mock Mode
    if (isPlaceholder) {
      console.warn(
        '[Dodo Customer Portal] DODO_PAYMENTS_API_KEY is currently set to placeholder. Returning sandbox mock portal session.'
      );
      const mockPortalUrl = `${returnUrl}?portal_session=mock_portal_active&customer_id=${encodeURIComponent(
        customerId
      )}`;
      return NextResponse.json({
        url: mockPortalUrl,
        mode: 'mock',
        message: 'Dodo Payments sandbox mock portal active.',
      });
    }

    const dodo = new DodoPayments({
      bearerToken: apiKey,
      environment: (process.env.DODO_PAYMENTS_ENVIRONMENT as 'test_mode' | 'live_mode') || 'test_mode',
    });

    const session = await dodo.customers.customerPortal.create(customerId, {
      return_url: returnUrl,
    });

    const portalUrl = session.link || (session as any).url;

    return NextResponse.json({ url: portalUrl });
  } catch (error: any) {
    console.error('Dodo Customer Portal Session Error:', error);
    return NextResponse.json(
      { error: error.message || 'Unable to create customer portal session' },
      { status: 500 }
    );
  }
}
