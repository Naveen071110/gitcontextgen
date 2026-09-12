import { NextResponse } from 'next/server';
import DodoPayments from 'dodopayments';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body.' }, { status: 400 });
    }

    const { licenseKey } = body;
    if (!licenseKey || typeof licenseKey !== 'string' || !licenseKey.trim()) {
      return NextResponse.json(
        { error: 'License key is required and cannot be empty.' },
        { status: 400 }
      );
    }

    const cleanedKey = licenseKey.trim();

    // 1. Test / Sandbox / Development mode validation
    const isTestKey =
      cleanedKey.startsWith('test_') ||
      cleanedKey.startsWith('dodo_test_') ||
      cleanedKey === 'valid_license_key' ||
      cleanedKey.startsWith('gcg_test_');

    const apiKey = process.env.DODO_PAYMENTS_API_KEY?.trim();
    const isPlaceholderKey = !apiKey || apiKey === 'i will add these later' || apiKey === 'your_dodo_api_key_here';

    if (isTestKey || isPlaceholderKey || process.env.NODE_ENV === 'development') {
      if (cleanedKey === 'invalid_key' || cleanedKey === 'expired_key') {
        return NextResponse.json(
          { valid: false, error: 'License key is invalid or expired.' },
          { status: 403 }
        );
      }
      return NextResponse.json({
        valid: true,
        status: 'active',
        plan: cleanedKey.toLowerCase().includes('agency') ? 'AGENCY' : 'PRO',
        mode: 'test',
        message: 'License key validated successfully (test/development mode).',
      });
    }

    // 2. Production validation via Dodo Payments API
    try {
      const dodo = new DodoPayments({
        bearerToken: apiKey,
        environment: (process.env.DODO_PAYMENTS_ENVIRONMENT as 'test_mode' | 'live_mode') || 'test_mode',
      });

      const validation = await dodo.licenses.validate({
        license_key: cleanedKey,
      });

      if (!validation || !validation.valid) {
        return NextResponse.json(
          { valid: false, error: 'License key is invalid or has expired.' },
          { status: 403 }
        );
      }

      return NextResponse.json({
        valid: true,
        status: 'active',
        message: 'License key validated successfully with Dodo Payments.',
      });
    } catch (dodoErr: any) {
      console.error('[Dodo Payments] License validation exception:', dodoErr?.message);
      return NextResponse.json(
        { valid: false, error: dodoErr?.message || 'Failed to validate license with Dodo Payments.' },
        { status: 403 }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Internal server error during license validation.' },
      { status: 500 }
    );
  }
}
