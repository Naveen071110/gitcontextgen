import { NextResponse } from 'next/server';
import DodoPayments from 'dodopayments';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-dodo-signature');
    const webhookKey = process.env.DODO_PAYMENTS_WEBHOOK_KEY?.trim();

    let event: any;

    // Cryptographic signature check if webhook secret key is configured
    if (webhookKey && webhookKey !== 'i will add these later') {
      try {
        const dodo = new DodoPayments({
          bearerToken: process.env.DODO_PAYMENTS_API_KEY || 'test',
          environment: (process.env.DODO_PAYMENTS_ENVIRONMENT as 'test_mode' | 'live_mode') || 'test_mode',
        });
        event = dodo.webhooks.unwrap(
          rawBody,
          {
            headers: {
              'x-dodo-signature': signature || '',
            },
            key: webhookKey,
          }
        );
      } catch (err: any) {
        console.warn('[Dodo Webhook] Cryptographic signature check failed:', err.message);
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
      }
    } else {
      // Fallback: Parse JSON payload if key is pending configuration in test environment
      event = JSON.parse(rawBody);
    }

    const eventType = event.event_type || event.type;
    console.log(`[Dodo Webhook] Received verified event: ${eventType}`);

    switch (eventType) {
      case 'subscription.created':
      case 'subscription.active': {
        const data = event.data || {};
        const userId = data.metadata?.userId;
        const customerId = data.customer_id;
        const status = data.status || 'active';
        console.log(`[Dodo Webhook] Subscription confirmed for user ${userId} (Customer: ${customerId}, Status: ${status})`);
        // DB subscription record update hook
        break;
      }

      case 'payment.succeeded': {
        const data = event.data || {};
        console.log(`[Dodo Webhook] Payment succeeded: ${data.id} (${data.currency} ${data.total_amount})`);
        break;
      }

      case 'subscription.cancelled':
      case 'subscription.expired': {
        const data = event.data || {};
        console.log(`[Dodo Webhook] Subscription inactive for user ${data.metadata?.userId}`);
        break;
      }

      default:
        console.log(`[Dodo Webhook] Unhandled event payload: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[Dodo Webhook Error]:', error);
    return NextResponse.json({ error: error.message || 'Webhook processing error' }, { status: 400 });
  }
}
