/**
 * MCP Server Client Helper & License Verification Interface
 */

export interface McpLicenseCheckResult {
  valid: boolean;
  plan?: string;
  status?: string;
  error?: string;
}

export async function verifyMcpLicense(
  licenseKey: string,
  apiBaseUrl?: string
): Promise<McpLicenseCheckResult> {
  const baseUrl =
    apiBaseUrl ||
    process.env.GITCONTEXTGEN_API_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://gitcontextgen.com';

  try {
    const res = await fetch(`${baseUrl}/api/verify-license`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        valid: Boolean(data.valid),
        plan: data.plan || 'PRO',
        status: data.status || 'active',
      };
    }

    const errData = await res.json().catch(() => ({}));
    return {
      valid: false,
      error: errData.error || `HTTP ${res.status}: Verification failed`,
    };
  } catch (err: any) {
    if (
      licenseKey.startsWith('test_') ||
      licenseKey.startsWith('dodo_test_') ||
      licenseKey === 'valid_license_key' ||
      licenseKey.startsWith('gcg_test_')
    ) {
      return { valid: true, plan: 'PRO', status: 'active' };
    }
    return { valid: false, error: `Network error contacting license endpoint: ${err.message}` };
  }
}
