import { SubscriptionTier } from './types';
import { getUserSubscriptionDb, countUserProjects } from './db';

export const TIER_LIMITS: Record<SubscriptionTier, number> = {
  FREE: 1, // Free sandbox/trial allows 1 initial test project
  STARTER: 1, // Starter Pass: 1 active repository
  PRO: 5, // Pro Builder: Up to 5 active repositories
  AGENCY: Infinity, // Agency Team: Unlimited repositories
};

export interface EntitlementsResult {
  tier: SubscriptionTier;
  isActive: boolean;
  maxRepos: number;
  currentRepoCount: number;
  canCreateRepo: boolean;
  features: {
    singleRepoLimit: boolean;
    multiRepoCapped5: boolean;
    unlimitedRepos: boolean;
    standardRules: boolean;
    strictMermaid: boolean;
    bidirectionalSync: boolean;
    offlineBinaries: boolean;
    stdioMcpServer: boolean;
    l2DiskCache: boolean;
    autoTechDetection: boolean;
    wordPressPreset: boolean;
    multiAgentSplitter: boolean;
  };
}

/**
 * Resolves comprehensive feature entitlements for a given user
 */
export async function getUserEntitlements(userId: string): Promise<EntitlementsResult> {
  const subscription = await getUserSubscriptionDb(userId);

  // If no explicit DB record, default to STARTER during demo/test mode or initial sign-in
  const tier: SubscriptionTier = subscription?.status === 'active' ? subscription.tier : 'STARTER';
  const isActive = subscription ? subscription.status === 'active' : true;
  const maxRepos = TIER_LIMITS[tier] ?? 1;

  const currentRepoCount = await countUserProjects(userId);
  const canCreateRepo = currentRepoCount < maxRepos;

  const isProOrAgency = tier === 'PRO' || tier === 'AGENCY';
  const isAgency = tier === 'AGENCY';

  return {
    tier,
    isActive,
    maxRepos,
    currentRepoCount,
    canCreateRepo,
    features: {
      singleRepoLimit: tier === 'STARTER' || tier === 'FREE',
      multiRepoCapped5: tier === 'PRO',
      unlimitedRepos: isAgency,
      standardRules: true, // All tiers
      strictMermaid: true, // All tiers
      bidirectionalSync: isProOrAgency, // Pro & Agency
      offlineBinaries: isProOrAgency, // Pro & Agency
      stdioMcpServer: true, // Core architecture
      l2DiskCache: true, // Core architecture
      autoTechDetection: isAgency, // Agency exclusive
      wordPressPreset: true, // Standard WPCS preset
      multiAgentSplitter: true, // Multi-agent blueprint
    },
  };
}

/**
 * Functional validation check for repository creation limits.
 * Enforces:
 * - Starter tier: 1 repository max
 * - Pro tier: 5 repositories max
 * - Agency tier: Unlimited (bypass check)
 */
export async function validateRepoCreationLimit(userId: string): Promise<{
  allowed: boolean;
  currentCount: number;
  limit: number;
  tier: SubscriptionTier;
  error?: string;
}> {
  const entitlements = await getUserEntitlements(userId);

  // Agency tier bypasses all repository limits
  if (entitlements.tier === 'AGENCY') {
    return {
      allowed: true,
      currentCount: entitlements.currentRepoCount,
      limit: Infinity,
      tier: 'AGENCY',
    };
  }

  if (entitlements.currentRepoCount >= entitlements.maxRepos) {
    const tierName = entitlements.tier === 'STARTER' ? 'Starter Pass' : entitlements.tier === 'PRO' ? 'Pro Builder' : 'Starter';
    const upgradeTarget = entitlements.tier === 'STARTER' ? 'Pro Builder (up to 5 repos) or Agency Team (unlimited)' : 'Agency Team (unlimited)';

    return {
      allowed: false,
      currentCount: entitlements.currentRepoCount,
      limit: entitlements.maxRepos,
      tier: entitlements.tier,
      error: `Repository limit reached (${entitlements.currentRepoCount}/${entitlements.maxRepos}). Your ${tierName} plan allows ${entitlements.maxRepos} active repository. Please upgrade to ${upgradeTarget} to connect additional workspaces.`,
    };
  }

  return {
    allowed: true,
    currentCount: entitlements.currentRepoCount,
    limit: entitlements.maxRepos,
    tier: entitlements.tier,
  };
}
