export const MAX_SCAN_FILE_SIZE_BYTES = 500 * 1024; // 500 KB ceiling to prevent ReDoS

const VENDOR_PATH_REGEX = /(?:^|[\\/])(node_modules|dist|build|\.next|\.open-next|vendor|wp-includes|wp-admin|out|coverage)[\\/]/i;

/**
 * Strips secrets, API keys, credentials, and tokens from text content
 */
export function sanitizeSecrets(text: string): string {
  if (!text) return '';

  return text
    // Stripe keys
    .replace(/(?:sk|pk|rk)_(?:live|test)_[0-9a-zA-Z]{24,}/g, '[REDACTED_STRIPE_KEY]')
    // AWS Access Keys
    .replace(/AKIA[0-9A-Z]{16}/g, '[REDACTED_AWS_KEY]')
    // GitHub Tokens
    .replace(/(?:ghp|gho|ghu|ghs|ghr)_[0-9a-zA-Z]{36}/g, '[REDACTED_GITHUB_TOKEN]')
    .replace(/github_pat_[0-9a-zA-Z]{22}_[0-9a-zA-Z]{59}/g, '[REDACTED_GITHUB_PAT]')
    // OpenAI / Anthropic / AI API keys
    .replace(/sk-[0-9a-zA-Z]{32,}/g, '[REDACTED_API_KEY]')
    .replace(/sk-ant-[0-9a-zA-Z]{32,}/g, '[REDACTED_ANTHROPIC_KEY]')
    .replace(/sk-proj-[0-9a-zA-Z]{32,}/g, '[REDACTED_OPENAI_KEY]')
    // Private Key blocks (RSA, EC, OPENSSH, DSA, PGP)
    .replace(/-----BEGIN (?:[A-Z0-9_-]+ )?PRIVATE KEY-----[\s\S]*?-----END (?:[A-Z0-9_-]+ )?PRIVATE KEY-----/g, '[REDACTED_PRIVATE_KEY]')
    // SSH coordinates and keys
    .replace(/ssh-(?:rsa|dss|ed25519)\s+[A-Za-z0-9+/=]{40,}/g, '[REDACTED_SSH_KEY]')
    // AWS Secret Access Key or unquoted environment assignments
    .replace(/(AWS_SECRET_ACCESS_KEY|AWS_ACCESS_KEY_ID|SECRET_KEY|API_KEY|AUTH_TOKEN|ACCESS_TOKEN|PRIVATE_KEY|PASSWORD|WEBHOOK_SECRET|DATABASE_URL|SUPABASE_KEY|DODO_API_KEY)\s*[:=]\s*["']?([^\s\r\n"']+)["']?/gi, '$1="[REDACTED_SECRET]"')
    // Generic API Key / Secret assignments in config text
    .replace(/(?:api_key|secret_key|auth_token|access_token|password)\s*[:=]\s*["'][^"']+["']/gi, '$1: "[REDACTED_SECRET]"');
}

/**
 * ReDoS-Safe Secret Sanitizer with file size and vendor directory gating
 */
export function safeSanitizeSecrets(content: string, filePath: string = 'file'): string {
  if (!content) return '';

  const byteLength = Buffer.byteLength(content, 'utf8');
  const filename = filePath.split(/[\\/]/).pop() || filePath;

  if (byteLength > MAX_SCAN_FILE_SIZE_BYTES || VENDOR_PATH_REGEX.test(filePath)) {
    return `// [File: ${filename} size exceeded 500KB - skipped credentials scan for performance]\n`;
  }

  return sanitizeSecrets(content);
}
