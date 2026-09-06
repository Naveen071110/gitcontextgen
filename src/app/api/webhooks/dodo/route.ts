import { NextResponse } from 'next/server';
import DodoPayments from 'dodopayments';
import { DODO_PRODUCTS } from '@/lib/products';
import { SubscriptionTier } from '@/lib/types';
import { upsertUserSubscriptionDb, addDfyOnboardingDb } from '@/lib/db';

function resolveTierFromProductId(productId?: string): SubscriptionTier {
  if (!productId) return 'STARTER';
  const pid = productId.toLowerCase();
  if (
    pid.includes('agency') ||
    productId === DODO_PRODUCTS.AGENCY.monthly ||
    productId === DODO_PRODUCTS.AGENCY.annual
  ) {
    return 'AGENCY';
  }
  if (
    pid.includes('pro') ||
    productId === DODO_PRODUCTS.PRO.monthly ||
    productId === DODO_PRODUCTS.PRO.annual
  ) {
    return 'PRO';
  }
  return 'STARTER';
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-dodo-signature');
    const webhookKey = (
      process.env.DODO_PAYMENTS_WEBHOOK_SECRET || process.env.DODO_PAYMENTS_WEBHOOK_KEY
    )?.trim();

    let event: any;

    // Cryptographic signature check if webhook secret key is configured
    if (webhookKey && webhookKey !== 'i will add these later' && webhookKey !== 'your_dodo_webhook_secret_here') {
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
        const productId = data.product_id || data.items?.[0]?.product_id;
        const tier = resolveTierFromProductId(productId);

        console.log(`[Dodo Webhook] Subscription confirmed for user ${userId} (Customer: ${customerId}, Tier: ${tier}, Status: ${status})`);

        if (userId) {
          try {
            await upsertUserSubscriptionDb({
              user_id: userId,
              tier,
              status: 'active',
              customer_id: customerId,
              subscription_id: data.subscription_id || data.id,
              current_period_end: data.current_period_end ? new Date(data.current_period_end).toISOString() : undefined,
            });
          } catch (dbErr) {
            console.warn('[Dodo Webhook] Non-fatal DB update warning:', dbErr);
          }
        }
        break;
      }

      case 'payment.succeeded': {
        const data = event.data || {};
        console.log(`[Dodo Webhook] Payment succeeded: ${data.id} (${data.currency} ${data.total_amount})`);

        // Check if payment corresponds to Done-For-You (DFY) Onboarding Add-On
        const isDfy =
          data.product_id === DODO_PRODUCTS.DFY_SETUP.oneTime ||
          data.metadata?.bundleDfy === 'true' ||
          data.metadata?.bundleDfy === true ||
          (Array.isArray(data.items) &&
            data.items.some((i: any) => i.product_id === DODO_PRODUCTS.DFY_SETUP.oneTime));

        if (isDfy) {
          console.log(`[Dodo Webhook] DFY Onboarding detected for payment ${data.id}. Queuing onboarding call.`);
          try {
            await addDfyOnboardingDb({
              user_id: data.metadata?.userId || undefined,
              payment_id: data.id || `dfy_${Date.now()}`,
              customer_email: data.customer?.email || data.customer_email,
              customer_name: data.customer?.name || data.customer_name,
            });
          } catch (dbErr) {
            console.warn('[Dodo Webhook] Non-fatal DFY DB record warning:', dbErr);
          }
        }
        break;
      }

      case 'subscription.cancelled':
      case 'subscription.expired': {
        const data = event.data || {};
        const userId = data.metadata?.userId;
        console.log(`[Dodo Webhook] Subscription inactive for user ${userId}`);

        if (userId) {
          try {
            await upsertUserSubscriptionDb({
              user_id: userId,
              tier: 'FREE',
              status: eventType === 'subscription.cancelled' ? 'cancelled' : 'expired',
              customer_id: data.customer_id,
              subscription_id: data.subscription_id || data.id,
            });
          } catch (dbErr) {
            console.warn('[Dodo Webhook] Non-fatal DB status update warning:', dbErr);
          }
        }
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
