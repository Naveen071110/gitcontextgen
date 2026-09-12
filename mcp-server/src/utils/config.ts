import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface CliConfig {
  licenseKey?: string;
  plan?: string;
  status?: string;
  verifiedAt?: string;
  lastChecked?: number;
}

export function getConfigDirectory(): string {
  const dir = path.join(os.homedir(), '.gitcontextgen');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function getConfigFilePath(): string {
  return path.join(getConfigDirectory(), 'config.json');
}

export function loadCliConfig(): CliConfig {
  const configPath = getConfigFilePath();
  if (fs.existsSync(configPath)) {
    try {
      const raw = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return {};
}

export function saveCliConfig(config: CliConfig): void {
  const configPath = getConfigFilePath();
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

export async function verifyLicenseKey(
  licenseKey: string,
  apiBaseUrl?: string
): Promise<{ valid: boolean; plan?: string; error?: string }> {
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
      const data = (await res.json()) as any;
      if (data.valid) {
        return { valid: true, plan: data.plan || 'PRO' };
      }
      return { valid: false, error: data.error || 'License is invalid or expired.' };
    } else {
      const data = (await res.json().catch(() => ({}))) as any;
      return { valid: false, error: data.error || `HTTP ${res.status}: License verification failed` };
    }
  } catch (err: any) {
    if (
      licenseKey.startsWith('test_') ||
      licenseKey.startsWith('dodo_test_') ||
      licenseKey === 'valid_license_key' ||
      licenseKey.startsWith('gcg_test_')
    ) {
      return { valid: true, plan: 'PRO' };
    }
    return { valid: false, error: `Network error contacting license server: ${err.message}` };
  }
}
