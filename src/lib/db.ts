'use server';

import { createClient, createAdminClient, isSupabaseConfigured } from './supabase/server';
import { Project, DocAsset, Release, Subscriber, UserSubscription, SubscriptionTier, SubscriptionStatus, DfyOnboarding, AnalyzedCodebaseOutputs, RepositoryAnalysisResult } from './types';
import { MockStore } from './mockStore';

function withTimeout<T>(promise: PromiseLike<T>, ms: number = 1500, errorMsg: string = 'Timeout'): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(errorMsg)), ms)),
  ]);
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export async function getUserProjects(): Promise<Project[]> {
  if (!isSupabaseConfigured()) {
    return MockStore.getProjects();
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return MockStore.getProjects();
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      const localProjects = MockStore.getProjects(user.id);
      const dbIds = new Set(data.map(p => p.id));
      const combined = [...data, ...localProjects.filter(lp => !dbIds.has(lp.id))];
      return combined as Project[];
    }

    console.warn('[Database] Supabase getUserProjects returned error, using fallback store:', error?.message);
    return MockStore.getProjects(user.id);
  } catch (err: any) {
    console.warn('[Database] getUserProjects exception, using fallback store:', err?.message);
    return MockStore.getProjects();
  }
}

export async function getProjectById(projectId: string): Promise<Project | null> {
  if (!isSupabaseConfigured()) {
    return MockStore.getProjectById(projectId) || null;
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      let { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        const slugResult = await supabase
          .from('projects')
          .select('*')
          .eq('slug', projectId)
          .eq('user_id', user.id)
          .single();
        if (!slugResult.error && slugResult.data) {
          data = slugResult.data;
        }
      }

      if (data) return data as Project;
    }
  } catch (err: any) {
    console.warn('[Database] getProjectById exception, checking fallback store:', err?.message);
  }

  return MockStore.getProjectById(projectId) || null;
}

export async function createProject(payload: {
  user_id: string;
  repo_url: string;
  slug: string;
  repo_name?: string;
  status?: 'analyzing' | 'completed' | 'failed';
  analysis_results?: AnalyzedCodebaseOutputs;
  branding_color?: string;
  audience_tone?: string;
}): Promise<Project> {
  const webhookSecret = 'whsec_' + crypto.randomUUID().slice(0, 12);
  const repoName = payload.repo_name || payload.repo_url.split('/').pop()?.replace(/\.git$/, '') || payload.slug;
  const status = payload.status || 'completed';

  if (!isSupabaseConfigured()) {
    return MockStore.saveProject({
      user_id: payload.user_id,
      repo_name: repoName,
      repo_url: payload.repo_url,
      slug: payload.slug,
      status,
      analysis_results: payload.analysis_results,
      branding_color: payload.branding_color || '#6366f1',
      audience_tone: (payload.audience_tone as any) || 'technical',
      webhook_secret: webhookSecret,
    });
  }

  try {
    const supabase = await createClient();
    let { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: payload.user_id,
        repo_name: repoName,
        repo_url: payload.repo_url,
        slug: payload.slug,
        status,
        analysis_results: payload.analysis_results || null,
        branding_color: payload.branding_color || '#6366f1',
        audience_tone: payload.audience_tone || 'technical',
        webhook_secret: webhookSecret,
      })
      .select()
      .single();

    // If Supabase table schema does not yet have repo_name / status / analysis_results, retry with basic columns
    if (error) {
      const retryResult = await supabase
        .from('projects')
        .insert({
          user_id: payload.user_id,
          repo_url: payload.repo_url,
          slug: payload.slug,
          branding_color: payload.branding_color || '#6366f1',
          audience_tone: payload.audience_tone || 'technical',
          webhook_secret: webhookSecret,
        })
        .select()
        .single();
      if (!retryResult.error && retryResult.data) {
        data = retryResult.data;
        error = null;
      }
    }

    if (!error && data) {
      const fullProject: Project = {
        ...(data as Project),
        repo_name: data.repo_name || repoName,
        status: data.status || status,
        analysis_results: data.analysis_results || payload.analysis_results,
      };
      MockStore.saveProject(fullProject);
      return fullProject;
    }

    console.warn('[Database] Supabase createProject error (falling back to resilient store):', error?.message);
  } catch (err: any) {
    console.warn('[Database] createProject exception, falling back to resilient store:', err?.message);
  }

  // Resilient fallback: Save in MockStore so the user is NEVER blocked from adding repositories!
  const localProject = MockStore.saveProject({
    user_id: payload.user_id,
    repo_name: repoName,
    repo_url: payload.repo_url,
    slug: payload.slug,
    status,
    analysis_results: payload.analysis_results,
    branding_color: payload.branding_color || '#6366f1',
    audience_tone: (payload.audience_tone as any) || 'technical',
    webhook_secret: webhookSecret,
  });

  return localProject;
}

export async function updateProjectStatus(
  projectId: string,
  status: 'analyzing' | 'completed' | 'failed',
  analysisResults?: AnalyzedCodebaseOutputs
): Promise<Project | null> {
  try {
    const supabase = await createClient();
    await supabase
      .from('projects')
      .update({
        status,
        ...(analysisResults ? { analysis_results: analysisResults } : {}),
      })
      .eq('id', projectId);
  } catch (err: any) {
    console.warn('[Database] updateProjectStatus Supabase warning:', err?.message);
  }

  const updated = MockStore.updateProject(projectId, {
    status,
    ...(analysisResults ? { analysis_results: analysisResults } : {}),
  });
  return updated;
}

export async function deleteProjectDb(projectId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id);
    }
  } catch (err: any) {
    console.warn('[Database] deleteProjectDb Supabase exception:', err?.message);
  }

  // Always delete from MockStore
  MockStore.deleteProject(projectId);
  return true;
}

// ---------------------------------------------------------------------------
// Doc Assets
// ---------------------------------------------------------------------------

export async function saveDocAssets(
  projectId: string,
  contextMarkdown: string,
  mermaidArchitecture: string
): Promise<void> {
  // Always mirror to MockStore
  MockStore.saveProject({ id: projectId }, contextMarkdown, mermaidArchitecture);

  try {
    const supabase = await createClient();
    const assets: Array<{ project_id: string; type: string; content: string }> = [];
    if (contextMarkdown) assets.push({ project_id: projectId, type: 'context', content: contextMarkdown });
    if (mermaidArchitecture) assets.push({ project_id: projectId, type: 'architecture', content: mermaidArchitecture });

    if (assets.length > 0) {
      const { error } = await supabase.from('doc_assets').insert(assets);
      if (error) {
        console.warn('[Database] saveDocAssets Supabase warning:', error.message);
      }
    }
  } catch (err: any) {
    console.warn('[Database] saveDocAssets Supabase exception:', err?.message);
  }
}

export async function getDocAssets(projectId: string): Promise<DocAsset[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('doc_assets')
      .select('*')
      .eq('project_id', projectId)
      .order('updated_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data as DocAsset[];
    }
  } catch (err: any) {
    console.warn('[Database] getDocAssets Supabase exception:', err?.message);
  }

  return MockStore.getDocAssets(projectId);
}

// ---------------------------------------------------------------------------
// Releases
// ---------------------------------------------------------------------------

export async function getReleases(projectId: string): Promise<Release[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('releases')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) { console.error('getReleases error:', error); return []; }
  return (data as Release[]) || [];
}

export async function addReleaseDb(
  projectId: string,
  versionTag: string,
  commitSummary: string,
  generatedNotes: string
): Promise<Release> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('releases')
    .insert({ project_id: projectId, version_tag: versionTag, commit_summary: commitSummary, generated_notes: generatedNotes })
    .select()
    .single();

  if (error) throw new Error('Failed to save release.');
  return data as Release;
}

// ---------------------------------------------------------------------------
// Subscribers
// ---------------------------------------------------------------------------

export async function getSubscribers(projectId: string): Promise<Subscriber[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('subscribers')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) { console.error('getSubscribers error:', error); return []; }
  return (data as Subscriber[]) || [];
}

export async function addSubscriberDb(projectId: string, email: string): Promise<Subscriber | null> {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from('subscribers')
    .select('*')
    .eq('project_id', projectId)
    .ilike('email', email)
    .single();
  if (existing) return existing as Subscriber;

  const { data, error } = await supabase
    .from('subscribers')
    .insert({ project_id: projectId, email })
    .select()
    .single();

  if (error) { console.error('addSubscriber error:', error); return null; }
  return data as Subscriber;
}

// ---------------------------------------------------------------------------
// User Subscriptions (Dodo Payments Tiers & Entitlements)
// ---------------------------------------------------------------------------

export async function getUserSubscriptionDb(userId: string): Promise<UserSubscription | null> {
  if (!isSupabaseConfigured()) {
    return MockStore.getUserSubscription(userId);
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!error && data) {
      return data as UserSubscription;
    }
  } catch (err: any) {
    console.warn('[Database] getUserSubscriptionDb exception, checking fallback store:', err?.message);
  }

  return MockStore.getUserSubscription(userId);
}

export async function upsertUserSubscriptionDb(payload: {
  user_id: string;
  tier: SubscriptionTier;
  status?: SubscriptionStatus;
  customer_id?: string;
  subscription_id?: string;
  current_period_end?: string;
}): Promise<UserSubscription | null> {
  // Always mirror in MockStore
  const localSub = MockStore.upsertUserSubscription(payload);

  if (!isSupabaseConfigured()) {
    return localSub;
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: payload.user_id,
        tier: payload.tier,
        status: payload.status || 'active',
        customer_id: payload.customer_id,
        subscription_id: payload.subscription_id,
        current_period_end: payload.current_period_end,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (!error && data) {
      return data as UserSubscription;
    }
    console.warn('[Database] Supabase upsertUserSubscriptionDb warning (using fallback):', error?.message);
  } catch (err: any) {
    console.warn('[Database] upsertUserSubscriptionDb exception, using fallback:', err?.message);
  }

  return localSub;
}

export async function countUserProjects(userId: string): Promise<number> {
  if (!isSupabaseConfigured()) {
    return MockStore.getProjects(userId).length;
  }

  try {
    const supabase = createAdminClient();
    const { count, error } = await supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (!error && typeof count === 'number') {
      return count;
    }
  } catch {
    // Fall back to local store
  }
  return MockStore.getProjects(userId).length;
}

// ---------------------------------------------------------------------------
// Done-For-You (DFY) Team Onboardings
// ---------------------------------------------------------------------------

export async function addDfyOnboardingDb(payload: {
  user_id?: string;
  payment_id: string;
  customer_email?: string;
  customer_name?: string;
}): Promise<DfyOnboarding | null> {
  // Always mirror in MockStore
  const localDfy = MockStore.addDfyOnboarding(payload);

  if (!isSupabaseConfigured()) {
    return localDfy;
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('dfy_onboardings')
      .insert({
        user_id: payload.user_id,
        payment_id: payload.payment_id,
        customer_email: payload.customer_email,
        customer_name: payload.customer_name,
        status: 'pending_scheduling',
      })
      .select()
      .single();

    if (!error && data) {
      return data as DfyOnboarding;
    }
    console.warn('[Database] Supabase addDfyOnboardingDb warning (using fallback):', error?.message);
  } catch (err: any) {
    console.warn('[Database] addDfyOnboardingDb exception, using fallback:', err?.message);
  }

  return localDfy;
}



// ---------------------------------------------------------------------------
// L2 Database Caching for Public Analysis (12-Hour TTL)
// Shields outbound requests against GitHub REST API rate limits
// ---------------------------------------------------------------------------

const L2_CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 Hours

export async function getL2CachedAnalysis(
  owner: string,
  repo: string
): Promise<RepositoryAnalysisResult | null> {
  const repoKey = `${owner}/${repo}`.toLowerCase();

  // If Supabase is not configured, immediately use in-memory MockStore (0ms latency)
  if (!isSupabaseConfigured()) {
    return MockStore.getL2Cache(repoKey, L2_CACHE_TTL_MS);
  }

  try {
    const admin = createAdminClient();

    // 1. Query cache_store table with strict 1.5s timeout
    try {
      const { data: cacheRecord, error: cacheError } = await withTimeout(
        admin
          .from('cache_store')
          .select('analysis_results, created_at')
          .eq('repo_key', repoKey)
          .maybeSingle(),
        1500,
        'cache_store query timeout'
      );

      if (!cacheError && cacheRecord && cacheRecord.analysis_results) {
        const createdAt = new Date(cacheRecord.created_at).getTime();
        if (Date.now() - createdAt < L2_CACHE_TTL_MS) {
          return cacheRecord.analysis_results as RepositoryAnalysisResult;
        }
      }
    } catch {
      // Non-blocking timeout or missing table fallback
    }

    // 2. Query projects table as secondary database source with strict 1.5s timeout
    try {
      const { data: projectRecord, error: projError } = await withTimeout(
        admin
          .from('projects')
          .select('analysis_results, created_at')
          .ilike('repo_url', `%${owner}/${repo}%`)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        1500,
        'projects query timeout'
      );

      if (!projError && projectRecord && projectRecord.analysis_results) {
        const createdAt = new Date(projectRecord.created_at).getTime();
        if (Date.now() - createdAt < L2_CACHE_TTL_MS) {
          return projectRecord.analysis_results as RepositoryAnalysisResult;
        }
      }
    } catch {
      // Non-blocking timeout or missing table fallback
    }
  } catch (err: any) {
    console.warn('[L2 Cache] Supabase lookup error, falling back to local store:', err?.message);
  }

  // 3. Fallback to resilient in-memory MockStore
  return MockStore.getL2Cache(repoKey, L2_CACHE_TTL_MS);
}

export async function saveL2CachedAnalysis(
  owner: string,
  repo: string,
  data: RepositoryAnalysisResult
): Promise<void> {
  const repoKey = `${owner}/${repo}`.toLowerCase();

  // Always update in-memory cache immediately
  MockStore.setL2Cache(repoKey, data);

  if (!isSupabaseConfigured()) {
    return;
  }

  try {
    const admin = createAdminClient();
    await withTimeout(
      admin
        .from('cache_store')
        .upsert(
          {
            repo_key: repoKey,
            analysis_results: data,
            created_at: new Date().toISOString(),
          },
          { onConflict: 'repo_key' }
        ),
      1500,
      'cache_store upsert timeout'
    );
  } catch (err: any) {
    console.warn('[L2 Cache] Could not persist to Supabase cache_store:', err?.message);
  }
}
