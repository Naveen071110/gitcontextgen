'use server';

import { createClient } from './supabase/server';
import { Project, DocAsset, Release, Subscriber } from './types';

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export async function getUserProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getUserProjects error:', error);
    return [];
  }
  return (data as Project[]) || [];
}

export async function getProjectById(projectId: string): Promise<Project | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

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
    if (slugResult.error || !slugResult.data) return null;
    data = slugResult.data;
  }

  return data as Project;
}

export async function createProject(payload: {
  user_id: string;
  repo_url: string;
  slug: string;
  branding_color?: string;
  audience_tone?: string;
}): Promise<Project> {
  const supabase = await createClient();
  const webhookSecret = 'whsec_' + crypto.randomUUID().slice(0, 12);

  const { data, error } = await supabase
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

  if (error) {
    console.error('createProject error:', error);
    throw new Error(error.message || 'Failed to create project.');
  }
  return data as Project;
}

export async function deleteProjectDb(projectId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', user.id);

  if (error) {
    console.error('deleteProject error:', error);
    return false;
  }
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
  const supabase = await createClient();
  const assets: Array<{ project_id: string; type: string; content: string }> = [];
  if (contextMarkdown) assets.push({ project_id: projectId, type: 'context', content: contextMarkdown });
  if (mermaidArchitecture) assets.push({ project_id: projectId, type: 'architecture', content: mermaidArchitecture });

  if (assets.length > 0) {
    const { error } = await supabase.from('doc_assets').insert(assets);
    if (error) {
      console.error('saveDocAssets error:', error);
      throw new Error('Failed to save document assets.');
    }
  }
}

export async function getDocAssets(projectId: string): Promise<DocAsset[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('doc_assets')
    .select('*')
    .eq('project_id', projectId)
    .order('updated_at', { ascending: false });

  if (error) { console.error('getDocAssets error:', error); return []; }
  return (data as DocAsset[]) || [];
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
