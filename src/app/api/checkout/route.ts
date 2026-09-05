import { NextResponse } from 'next/server';
import DodoPayments from 'dodopayments';

export async function POST(req: Request) {
  try {
    const { productId, userEmail, userName, userId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'Missing required field: productId' }, { status: 400 });
    }

    const apiKey = process.env.DODO_PAYMENTS_API_KEY?.trim();
    const returnUrl = process.env.DODO_PAYMENTS_RETURN_URL || 'http://localhost:3000/dashboard';
    const isPlaceholder = !apiKey || apiKey === 'i will add these later' || apiKey === 'your_dodo_api_key_here';

    // Development / Demo Mode: if real Dodo API key is not yet set, provide a mock checkout redirect
    if (isPlaceholder) {
      console.warn(
        '[Dodo Payments] DODO_PAYMENTS_API_KEY is currently set to placeholder. Generating test redirect session.'
      );
      const mockCheckoutUrl = `${returnUrl}?dodo_session=mock_checkout_success&product_id=${encodeURIComponent(
        productId
      )}`;
      return NextResponse.json({
        url: mockCheckoutUrl,
        mode: 'mock',
        message: 'Dodo Payments sandbox mock mode active. Set real DODO_PAYMENTS_API_KEY in .env.local to activate hosted checkout.',
      });
    }

    const dodo = new DodoPayments({
      bearerToken: apiKey,
      environment: (process.env.DODO_PAYMENTS_ENVIRONMENT as 'test_mode' | 'live_mode') || 'test_mode',
    });

    const session = await dodo.checkoutSessions.create({
      product_cart: [
        {
          product_id: productId,
          quantity: 1,
        },
      ],
      return_url: returnUrl,
      customer: {
        email: userEmail || 'developer@example.com',
        name: userName || 'Developer',
      },
      metadata: {
        userId: userId || 'anonymous',
      },
    });

    const checkoutUrl = (session as any).checkout_url || (session as any).url;

    return NextResponse.json({ url: checkoutUrl });
  } catch (error: any) {
    console.error('Dodo Checkout Session Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Checkout Error' }, { status: 500 });
  }
}
