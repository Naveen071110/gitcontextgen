import crypto from 'crypto';
import { Redis } from '@upstash/redis';
import { DeepSeekAnalysisOptions, DeepSeekAnalysisResult, SubscriptionTier } from '../types';
import { getCachedData, setCachedData } from '../cacheStore';
import { CodebaseAnalysisInput, detectFramework } from '../analyzer/engine';

/**
 * -------------------------------------------------------------------------
 * DeepSeek Pricing & Budget Constants
 * -------------------------------------------------------------------------
 * DeepSeek-V3 (deepseek-chat) standard rates:
 * - Input (Cache Miss): $0.14 per 1,000,000 tokens
 * - Input (Cache Hit):  $0.014 per 1,000,000 tokens
 * - Output:             $0.28 per 1,000,000 tokens
 */
export const DEEPSEEK_MODEL = 'deepseek-chat';
export const MAX_INPUT_TOKENS = 4000;
export const MAX_INPUT_CHARS = 14000; // ~3.5 chars/token safety ceiling
export const MAX_COMPLETION_TOKENS = 1200;
export const DEFAULT_DAILY_BUDGET_USD = 10.0;
export const GUEST_DAILY_FREE_LIMIT = 2;
export const PRO_HOURLY_RATE_LIMIT = 5; // Max 5 requests per minute
export const PRO_MONTHLY_QUOTA = 100; // Max 100 repo analyses per month

/**
 * Static system prompt prefix designed to trigger DeepSeek's 64-token
 * boundary Native Prompt Caching, cutting input token pricing by up to 90%.
 */
export const STATIC_SYSTEM_PROMPT_PREFIX = `You are GitContextGen's High-Precision Repository Intelligence Engine.
You specialize in analyzing condensed AST signatures, manifests, route trees, and exported symbols to generate enterprise-grade architecture dossiers, developer onboarding manuals (CLAUDE.md), and strict AI coding agent instructions (.cursorrules).

Core Operating Invariants:
1. Ground all instructions strictly in the provided manifest dependencies, directory structures, and code signatures.
2. Formulate explicit, executable terminal commands for installation, testing, linting, and build verification.
3. Identify architectural boundaries, design systems, and data flow paradigms.
4. Output must be production-ready Markdown with clear headings and zero hallucinated dependencies.
5. Emphasize security safeguards, input sanitization, and secret prevention.`;

// In-Memory Multi-Tier Fallback Storage (when Upstash Redis is not active or for local dev/testing)
interface LocalStoreState {
  guestCounts: Map<string, number>;
  userMinuteCounts: Map<string, { count: number; timestamp: number }>;
  userMonthlyCounts: Map<string, number>;
  dailySpendingUsd: Map<string, number>;
  circuitBreakerTripped: boolean;
  circuitBreakerReason?: string;
  consecutiveErrors: number;
}

const localState: LocalStoreState = {
  guestCounts: new Map(),
  userMinuteCounts: new Map(),
  userMonthlyCounts: new Map(),
  dailySpendingUsd: new Map(),
  circuitBreakerTripped: false,
  consecutiveErrors: 0,
};

let redisClient: Redis | null = null;
function getRedis(): Redis | null {
  if (redisClient) return redisClient;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    try {
      redisClient = new Redis({ url, token });
      return redisClient;
    } catch {
      return null;
    }
  }
  return null;
}

function getUtcDateKey(): string {
  const d = new Date();
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
}

function getUtcMonthKey(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

/**
 * Tier 1: Deterministic Pre-Filtering & AST Token Reduction
 * Extracts lightweight structural manifests without passing raw source code.
 */
export function buildCondensedAstContext(input: CodebaseAnalysisInput): string {
  const { framework, details } = detectFramework(input);

  // Filter and extract top manifest dependencies
  const rawDeps = input.parsedDependencies || {};
  const depKeys = Object.keys(rawDeps).slice(0, 40);
  const depSummary = depKeys.map(k => `${k}: ${rawDeps[k]}`).join(', ');

  // Filter file tree to key entry points and routes only
  const fileLines = (input.fileTreeSummary || '').split('\n').filter(Boolean);
  const structuralFiles = fileLines
    .filter(line => {
      const lower = line.toLowerCase();
      return (
        lower.includes('package.json') ||
        lower.includes('next.config') ||
        lower.includes('tsconfig') ||
        lower.includes('tailwind.config') ||
        lower.includes('app/') ||
        lower.includes('pages/') ||
        lower.includes('src/') ||
        lower.includes('api/') ||
        lower.includes('wp-config') ||
        lower.includes('artisan') ||
        lower.includes('composer.json') ||
        lower.includes('cargo.toml') ||
        lower.includes('go.mod') ||
        lower.includes('main.') ||
        lower.includes('index.')
      );
    })
    .slice(0, 50)
    .join('\n');

  // Recent commit messages
  const recentCommitsSummary = (input.recentCommits || [])
    .slice(0, 5)
    .map(c => `- [${c.sha || 'commit'}] ${c.message}`)
    .join('\n');

  // Build condensed, structured AST manifest
  let condensed = `### Repository Structural AST Dossier
- **Repository**: ${input.owner || 'unknown'}/${input.repoName}
- **Primary Framework**: ${framework}
- **Router Pattern**: ${details.hasAppRouter ? 'App Router' : details.hasPagesRouter ? 'Pages Router' : 'Standard'}
- **Styling Architecture**: ${details.styling}
- **Default Branch**: ${input.defaultBranch || 'main'}

#### Key Dependencies Manifest (${depKeys.length}):
${depSummary || 'None specified'}

#### Core Architecture & Entry Points:
${structuralFiles || fileLines.slice(0, 20).join('\n')}

#### Recent Commit History:
${recentCommitsSummary || 'No recent commits available'}
`;

  // Hard input token safety ceiling: truncate if exceeds character limit
  if (condensed.length > MAX_INPUT_CHARS) {
    condensed =
      condensed.slice(0, MAX_INPUT_CHARS) +
      '\n\n[... Truncated to comply with 4,000 token input guardrail ...]';
  }

  return condensed;
}

/**
 * Tier 2: SHA-256 Commit Hash & L2 Cache Gatekeeping
 */
export function computeCommitCacheKey(repoOwner: string, repoName: string, commitSha: string): string {
  const rawKey = `${repoOwner.toLowerCase()}/${repoName.toLowerCase()}@${commitSha.trim().toLowerCase()}`;
  const sha256 = crypto.createHash('sha256').update(rawKey).digest('hex');
  return `deepseek:cache:${sha256}`;
}

export async function getCachedLlmOutput(
  repoOwner: string,
  repoName: string,
  commitSha: string
): Promise<DeepSeekAnalysisResult | null> {
  const cacheKey = computeCommitCacheKey(repoOwner, repoName, commitSha);
  const redis = getRedis();

  if (redis) {
    try {
      const cached = await redis.get<DeepSeekAnalysisResult>(cacheKey);
      if (cached) {
        return { ...cached, cached: true };
      }
    } catch {
      // Fallback to local cache store
    }
  }

  const localCached = getCachedData<DeepSeekAnalysisResult>(cacheKey);
  if (localCached) {
    return { ...localCached, cached: true };
  }

  return null;
}

export async function cacheLlmOutput(
  repoOwner: string,
  repoName: string,
  commitSha: string,
  result: DeepSeekAnalysisResult
): Promise<void> {
  const cacheKey = computeCommitCacheKey(repoOwner, repoName, commitSha);
  const redis = getRedis();

  if (redis) {
    try {
      // 24-hour cache TTL
      await redis.set(cacheKey, result, { ex: 86400 });
      return;
    } catch {
      // Non-fatal fallback
    }
  }

  setCachedData(cacheKey, result);
}

/**
 * Tier 3: Rate Limiting & User Tier Quotas
 */
export async function checkUsageLimits(
  userId: string | undefined,
  userIp: string,
  userTier?: SubscriptionTier | string
): Promise<{ canUseLlm: boolean; reason?: string }> {
  // 1. Check Circuit Breaker & Daily Budget First
  const circuitBreaker = getDeepSeekCircuitBreakerState();
  if (circuitBreaker.isTripped) {
    return { canUseLlm: false, reason: circuitBreaker.reason || 'Circuit breaker active' };
  }

  const dateKey = getUtcDateKey();
  const redis = getRedis();

  // A. Guest / Unauthenticated Rate Limiter (2 free per IP/day)
  if (!userId || userTier === 'FREE') {
    const guestKey = `deepseek:ratelimit:ip:${userIp}:${dateKey}`;

    if (redis) {
      try {
        const count = (await redis.get<number>(guestKey)) || 0;
        if (count >= GUEST_DAILY_FREE_LIMIT) {
          return {
            canUseLlm: false,
            reason: `Guest daily free limit reached (${count}/${GUEST_DAILY_FREE_LIMIT})`,
          };
        }
      } catch {
        // Fallback to local memory check
      }
    }

    const localCount = localState.guestCounts.get(guestKey) || 0;
    if (localCount >= GUEST_DAILY_FREE_LIMIT) {
      return {
        canUseLlm: false,
        reason: `Guest daily free limit reached (${localCount}/${GUEST_DAILY_FREE_LIMIT})`,
      };
    }

    return { canUseLlm: true };
  }

  // B. Paid / Authenticated Tier (Pro / Agency)
  const minuteWindow = Math.floor(Date.now() / 60000);
  const rateLimitKey = `deepseek:ratelimit:user:${userId}:min:${minuteWindow}`;
  const monthKey = getUtcMonthKey();
  const monthlyQuotaKey = `deepseek:usage:user:${userId}:month:${monthKey}`;

  if (redis) {
    try {
      const minCount = (await redis.get<number>(rateLimitKey)) || 0;
      if (minCount >= PRO_HOURLY_RATE_LIMIT) {
        return {
          canUseLlm: false,
          reason: `Rate limit exceeded (max ${PRO_HOURLY_RATE_LIMIT} req/min). Please try again shortly.`,
        };
      }

      const monthlyCount = (await redis.get<number>(monthlyQuotaKey)) || 0;
      if (monthlyCount >= PRO_MONTHLY_QUOTA) {
        return {
          canUseLlm: false,
          reason: `Monthly quota of ${PRO_MONTHLY_QUOTA} repo analyses reached.`,
        };
      }
    } catch {
      // Fallback to local memory check
    }
  }

  const userMin = localState.userMinuteCounts.get(userId);
  const now = Date.now();
  if (userMin && now - userMin.timestamp < 60000 && userMin.count >= PRO_HOURLY_RATE_LIMIT) {
    return {
      canUseLlm: false,
      reason: `Rate limit exceeded (max ${PRO_HOURLY_RATE_LIMIT} req/min).`,
    };
  }

  const monthlyUsed = localState.userMonthlyCounts.get(`${userId}:${monthKey}`) || 0;
  if (monthlyUsed >= PRO_MONTHLY_QUOTA) {
    return {
      canUseLlm: false,
      reason: `Monthly quota of ${PRO_MONTHLY_QUOTA} repo analyses reached.`,
    };
  }

  return { canUseLlm: true };
}

/**
 * Increments usage counters after a successful LLM invocation.
 */
export async function incrementUsageCounter(
  userId: string | undefined,
  userIp: string,
  userTier?: SubscriptionTier | string
): Promise<void> {
  const dateKey = getUtcDateKey();
  const redis = getRedis();

  if (!userId || userTier === 'FREE') {
    const guestKey = `deepseek:ratelimit:ip:${userIp}:${dateKey}`;
    if (redis) {
      try {
        await redis.incr(guestKey);
        await redis.expire(guestKey, 86400); // 24h
      } catch {}
    }
    const cur = localState.guestCounts.get(guestKey) || 0;
    localState.guestCounts.set(guestKey, cur + 1);
  } else {
    const minuteWindow = Math.floor(Date.now() / 60000);
    const rateLimitKey = `deepseek:ratelimit:user:${userId}:min:${minuteWindow}`;
    const monthKey = getUtcMonthKey();
    const monthlyQuotaKey = `deepseek:usage:user:${userId}:month:${monthKey}`;

    if (redis) {
      try {
        await redis.incr(rateLimitKey);
        await redis.expire(rateLimitKey, 120);
        await redis.incr(monthlyQuotaKey);
        await redis.expire(monthlyQuotaKey, 86400 * 32);
      } catch {}
    }

    const curMin = localState.userMinuteCounts.get(userId);
    const now = Date.now();
    if (!curMin || now - curMin.timestamp >= 60000) {
      localState.userMinuteCounts.set(userId, { count: 1, timestamp: now });
    } else {
      curMin.count++;
    }

    const curMonth = localState.userMonthlyCounts.get(`${userId}:${monthKey}`) || 0;
    localState.userMonthlyCounts.set(`${userId}:${monthKey}`, curMonth + 1);
  }
}

/**
 * Cloudflare Turnstile token validation helper
 */
export async function verifyTurnstileToken(
  token?: string,
  ip?: string
): Promise<{ valid: boolean; reason?: string }> {
  const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    // If not configured, bypass gracefully
    return { valid: true };
  }

  if (!token) {
    return { valid: false, reason: 'Missing Cloudflare Turnstile verification token' };
  }

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
        ...(ip ? { remoteip: ip } : {}),
      }),
    });

    const outcome = await res.json();
    if (outcome.success) {
      return { valid: true };
    }
    return { valid: false, reason: 'Turnstile verification failed' };
  } catch {
    // Fail soft to local engine
    return { valid: false, reason: 'Turnstile network check error' };
  }
}

/**
 * Tier 4 & 5: Token Cost Tracking, Daily Budget & Circuit Breaker
 */
export function calculateDeepSeekCost(
  promptTokens: number,
  completionTokens: number,
  cacheHitTokens: number = 0
): number {
  const uncachedPromptTokens = Math.max(0, promptTokens - cacheHitTokens);
  const promptCost = (uncachedPromptTokens * 0.14 + cacheHitTokens * 0.014) / 1_000_000;
  const completionCost = (completionTokens * 0.28) / 1_000_000;
  return Number((promptCost + completionCost).toFixed(6));
}

export function getDailyBudgetLimit(): number {
  const envLimit = parseFloat(process.env.DEEPSEEK_DAILY_BUDGET_LIMIT_USD || '');
  return isNaN(envLimit) ? DEFAULT_DAILY_BUDGET_USD : envLimit;
}

export function getDeepSeekCircuitBreakerState(): {
  isTripped: boolean;
  dailySpendingUsd: number;
  dailyBudgetUsd: number;
  reason?: string;
} {
  const dateKey = getUtcDateKey();
  const spending = localState.dailySpendingUsd.get(dateKey) || 0;
  const budget = getDailyBudgetLimit();

  if (spending >= budget) {
    return {
      isTripped: true,
      dailySpendingUsd: spending,
      dailyBudgetUsd: budget,
      reason: `Daily DeepSeek budget limit ($${budget.toFixed(2)}) reached ($${spending.toFixed(4)} spent)`,
    };
  }

  if (localState.circuitBreakerTripped) {
    return {
      isTripped: true,
      dailySpendingUsd: spending,
      dailyBudgetUsd: budget,
      reason: localState.circuitBreakerReason || 'Circuit breaker tripped due to consecutive failures',
    };
  }

  return {
    isTripped: false,
    dailySpendingUsd: spending,
    dailyBudgetUsd: budget,
  };
}

export function resetDeepSeekCircuitBreaker(): void {
  localState.circuitBreakerTripped = false;
  localState.circuitBreakerReason = undefined;
  localState.consecutiveErrors = 0;
  const dateKey = getUtcDateKey();
  localState.dailySpendingUsd.set(dateKey, 0);
  localState.guestCounts.clear();
  localState.userMinuteCounts.clear();
}

export function setMockDailySpending(usd: number): void {
  const dateKey = getUtcDateKey();
  localState.dailySpendingUsd.set(dateKey, usd);
}

export async function recordUsageTokens(
  identifier: string,
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number; prompt_cache_hit_tokens?: number }
): Promise<number> {
  const promptTokens = usage?.prompt_tokens || 0;
  const completionTokens = usage?.completion_tokens || 0;
  const cacheHitTokens = usage?.prompt_cache_hit_tokens || 0;
  const cost = calculateDeepSeekCost(promptTokens, completionTokens, cacheHitTokens);

  const dateKey = getUtcDateKey();
  const currentSpending = localState.dailySpendingUsd.get(dateKey) || 0;
  const newSpending = currentSpending + cost;
  localState.dailySpendingUsd.set(dateKey, newSpending);

  const budget = getDailyBudgetLimit();
  if (newSpending >= budget) {
    localState.circuitBreakerTripped = true;
    localState.circuitBreakerReason = `Daily budget exceeded ($${newSpending.toFixed(4)} >= $${budget.toFixed(2)})`;
    console.warn(`[DeepSeek Budget] Circuit breaker tripped for ${dateKey}: $${newSpending.toFixed(4)} spent.`);
  }

  return cost;
}

/**
 * Deterministic Local Fallback Generator
 * Fast, 100% offline, $0 LLM cost generator when guardrails trip.
 */
export function generateLocalFallbackContext(
  condensedAstContext: string,
  options?: Partial<DeepSeekAnalysisOptions>
): string {
  const repoName = options?.repoName || 'Workspace';
  const owner = options?.repoOwner || 'Local';

  return `### 🛠️ Deterministic AST Context Dossier (${owner}/${repoName})
> **Engine**: Local Deterministic AST Generator ($0 LLM Cost)
> **Guardrail Status**: Active • Zero Third-Party Cloud Data Egress

#### Architectural Overview
${condensedAstContext.split('\n').slice(0, 15).join('\n')}

#### Verified Operating Conventions
1. **Module Boundaries**: Respect established project imports and directory separations.
2. **Type Invariants**: Preserve strict TypeScript typing across all exported functions.
3. **Execution Safety**: Execute dependency installation and build verification commands via standardized npm scripts.
4. **Secret Protection**: Ensure environment secrets and tokens are never included in repository commits.
`;
}

/**
 * Master DeepSeek Context Generator with 5-Tier Defense Matrix
 */
export async function generateDeepSeekContext(
  options: DeepSeekAnalysisOptions
): Promise<DeepSeekAnalysisResult> {
  // 1. Check Circuit Breaker, Budget Caps, and User Rate Limits
  const limitCheck = await checkUsageLimits(options.userId, options.userIp, options.userTier);
  if (!limitCheck.canUseLlm) {
    return {
      content: generateLocalFallbackContext(options.condensedAstContext, options),
      engine: 'local',
      cached: false,
      reason: limitCheck.reason,
    };
  }

  // Optional Turnstile Bot Check on Guest Users
  if (!options.userId || options.userTier === 'FREE') {
    if (process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY) {
      const turnstile = await verifyTurnstileToken(options.turnstileToken, options.userIp);
      if (!turnstile.valid) {
        return {
          content: generateLocalFallbackContext(options.condensedAstContext, options),
          engine: 'local',
          cached: false,
          reason: turnstile.reason || 'Bot detection gate active',
        };
      }
    }
  }

  // 2. Check SHA-256 Commit Cache (Zero DeepSeek API calls on hit)
  const cachedResult = await getCachedLlmOutput(options.repoOwner, options.repoName, options.commitSha);
  if (cachedResult) {
    return cachedResult;
  }

  // Verify API Key Configuration
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey || apiKey.includes('your_deepseek_api_key_here')) {
    return {
      content: generateLocalFallbackContext(options.condensedAstContext, options),
      engine: 'local',
      cached: false,
      reason: 'DEEPSEEK_API_KEY not configured or placeholder detected',
    };
  }

  // 3. Dispatch DeepSeek Request with Strict Caps
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 18000); // 18s abort guard

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: 'system', content: STATIC_SYSTEM_PROMPT_PREFIX },
          {
            role: 'user',
            content: `Analyze this condensed AST repository dossier and synthesize a high-fidelity development context dossier:\n\n${options.condensedAstContext}`,
          },
        ],
        max_tokens: MAX_COMPLETION_TOKENS,
        temperature: 0.2,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      localState.consecutiveErrors++;
      if (localState.consecutiveErrors >= 3) {
        localState.circuitBreakerTripped = true;
        localState.circuitBreakerReason = `Circuit breaker tripped after 3 consecutive DeepSeek HTTP ${response.status} errors`;
      }
      return {
        content: generateLocalFallbackContext(options.condensedAstContext, options),
        engine: 'local',
        cached: false,
        reason: `DeepSeek API returned HTTP ${response.status}`,
      };
    }

    const data = await response.json();
    const resultText = data.choices?.[0]?.message?.content;

    if (!resultText) {
      return {
        content: generateLocalFallbackContext(options.condensedAstContext, options),
        engine: 'local',
        cached: false,
        reason: 'Empty completion received from DeepSeek',
      };
    }

    // Success: Reset error streak
    localState.consecutiveErrors = 0;

    // 4. Record Token Cost & Increment Rate Limit Counters
    const costUsd = await recordUsageTokens(options.userId || options.userIp, data.usage);
    await incrementUsageCounter(options.userId, options.userIp, options.userTier);

    const finalResult: DeepSeekAnalysisResult = {
      content: resultText,
      engine: 'deepseek',
      cached: false,
      tokensUsed: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
      costUsd,
    };

    // 5. Cache Result for 24 Hours
    await cacheLlmOutput(options.repoOwner, options.repoName, options.commitSha, finalResult);

    return finalResult;
  } catch (error: any) {
    clearTimeout(timeoutId);
    localState.consecutiveErrors++;
    if (localState.consecutiveErrors >= 3) {
      localState.circuitBreakerTripped = true;
      localState.circuitBreakerReason = 'Circuit breaker tripped due to consecutive network failures';
    }
    return {
      content: generateLocalFallbackContext(options.condensedAstContext, options),
      engine: 'local',
      cached: false,
      reason: error?.name === 'AbortError' ? 'DeepSeek API timed out (18s)' : error?.message || 'Network error',
    };
  }
}
