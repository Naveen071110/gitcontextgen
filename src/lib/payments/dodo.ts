import DodoPayments from 'dodopayments';

export function getAppUrl(requestOrigin?: string): string {
  if (requestOrigin && /^https?:\/\//.test(requestOrigin)) {
    return requestOrigin.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  let envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (envUrl === 'undefined' || envUrl === 'null' || !envUrl) {
    envUrl = undefined;
  }
  if (envUrl && /^https?:\/\//.test(envUrl)) {
    return envUrl.replace(/\/+$/, '');
  }
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    // Graceful fallback to live Cloudflare Worker when custom domain has not been purchased yet
    return 'https://repopulse-ai.singhnaveen360.workers.dev';
  }

  return 'http://localhost:3000';
}

export function getCheckoutReturnUrl(customOrigin?: string): string {
  const appUrl = getAppUrl(customOrigin);
  return new URL('/dashboard?checkout=success', appUrl).toString();
}

export function getCheckoutCancelUrl(customOrigin?: string): string {
  const appUrl = getAppUrl(customOrigin);
  return new URL('/pricing?checkout=cancelled', appUrl).toString();
}

export interface DodoCheckoutPayload {
  productId?: string;
  productCart?: Array<{ product_id: string; quantity: number }>;
  userEmail?: string;
  userName?: string;
  userId?: string;
  requestOrigin?: string;
}

export function isDodoApiKeyPlaceholder(key?: string): boolean {
  if (!key) return true;
  const k = key.trim().toLowerCase();
  return (
    !k ||
    k === 'i will add these later' ||
    k === 'your_dodo_api_key_here' ||
    k.includes('placeholder') ||
    k.includes('mock') ||
    k.includes('test_key')
  );
}

export async function createDodoCheckoutSession(payload: DodoCheckoutPayload, requestOrigin?: string) {
  const apiKey = (process.env.DODO_PAYMENTS_API_KEY || '').trim();
  const environment = (process.env.DODO_PAYMENTS_ENVIRONMENT as 'test_mode' | 'live_mode') || 'test_mode';
  const effectiveOrigin = payload.requestOrigin || requestOrigin;
  const returnUrl = getCheckoutReturnUrl(effectiveOrigin);

  let cart: Array<{ product_id: string; quantity: number }> = [];
  if (Array.isArray(payload.productCart) && payload.productCart.length > 0) {
    cart = payload.productCart.map((item: any) => ({
      product_id: item.product_id || item.productId,
      quantity: typeof item.quantity === 'number' ? item.quantity : 1,
    }));
  } else if (payload.productId) {
    cart = [{ product_id: payload.productId, quantity: 1 }];
  } else {
    throw new Error('Missing required field: productId or productCart');
  }

  const isPlaceholder = isDodoApiKeyPlaceholder(apiKey);

  if (isPlaceholder) {
    // In demo / placeholder mode, return a safe URL strictly deriving from returnUrl
    const productIdsParam = cart.map((i) => i.product_id).join(',');
    const mockCheckoutUrl = `${returnUrl}&dodo_session=mock_checkout_success&product_ids=${encodeURIComponent(productIdsParam)}`;
    return {
      checkout_url: mockCheckoutUrl,
      mode: 'mock' as const,
    };
  }

  const dodo = new DodoPayments({
    bearerToken: apiKey,
    environment,
  });

  const session = await dodo.checkoutSessions.create({
    product_cart: cart,
    return_url: returnUrl,
    customer: {
      email: payload.userEmail || 'developer@example.com',
      name: payload.userName || 'Developer',
    },
    metadata: {
      userId: payload.userId || 'anonymous',
    },
  });

  const checkoutUrl = (session as any).checkout_url || (session as any).url;
  if (!checkoutUrl) {
    throw new Error('Dodo Payments did not return a checkout URL');
  }

  return {
    checkout_url: checkoutUrl,
    session_id: (session as any).session_id || (session as any).id,
    mode: environment,
  };
}
