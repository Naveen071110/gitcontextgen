export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { createDodoCheckoutSession, getAppUrl } from '@/lib/payments/dodo';

export async function POST(req: Request) {
  const requestId = 'chk_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
  try {
    const body = await req.json();
    const session = await createDodoCheckoutSession(body);

    const checkoutUrlString = session.checkout_url;
    const url = new URL(checkoutUrlString);

    const appUrlOrigin = new URL(getAppUrl()).origin;
    const isMock = session.mode === 'mock';

    const isTrustedOrigin =
      url.origin === 'https://checkout.dodopayments.com' ||
      url.origin === 'https://test.dodopayments.com' ||
      (isMock && url.origin === appUrlOrigin);

    if (!isTrustedOrigin) {
      console.error(`[Checkout] Untrusted origin: ${url.origin} (Expected checkout.dodopayments.com)`);
      throw new Error('Dodo returned an unexpected checkout origin');
    }

    return NextResponse.json({ url: url.toString(), requestId });
  } catch (error: any) {
    console.error('Dodo Checkout Session Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Checkout Error', requestId }, { status: 500 });
  }
}
