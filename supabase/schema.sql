-- ==============================================================================
-- GitContextGen / DriftGuard - Production PostgreSQL Schema & Security Policies
-- Compatible with Supabase PostgreSQL & Auth (Row Level Security enabled)
-- ==============================================================================

-- 1. Projects Workspace Table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  repo_url TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  branding_color TEXT DEFAULT '#6366f1',
  audience_tone TEXT DEFAULT 'technical' CHECK (audience_tone IN ('technical', 'marketing')),
  webhook_secret TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Documentation Assets Table (Context Specs & Architecture Diagrams)
CREATE TABLE IF NOT EXISTS public.doc_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('context', 'architecture')),
  content TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Releases Table (Automated Push Release Notes)
CREATE TABLE IF NOT EXISTS public.releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  version_tag TEXT NOT NULL,
  commit_summary TEXT NOT NULL,
  generated_notes TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Subscribers Table (Changelog Email Broadcast Recipients)
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_project_subscriber UNIQUE (project_id, email)
);

-- ==============================================================================
-- Indexes for High-Performance Querying
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_doc_assets_project_id ON public.doc_assets(project_id);
CREATE INDEX IF NOT EXISTS idx_releases_project_id ON public.releases(project_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_project_id ON public.subscribers(project_id);

-- ==============================================================================
-- Row Level Security (RLS) Policies - Strict Tenant & User Isolation
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doc_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- Projects Policies
-- ------------------------------------------------------------------------------
-- Project Owners have full access to their own projects
CREATE POLICY "Users can manage their own projects"
  ON public.projects
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Public can read projects by slug for public changelogs (/p/[slug])
CREATE POLICY "Public can view project basic metadata"
  ON public.projects
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- ------------------------------------------------------------------------------
-- Doc Assets Policies
-- ------------------------------------------------------------------------------
-- Only workspace owners can insert/update/delete doc assets
CREATE POLICY "Owners can manage doc assets"
  ON public.doc_assets
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = doc_assets.project_id
        AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = doc_assets.project_id
        AND projects.user_id = auth.uid()
    )
  );

-- Public can read doc assets for showcase displays
CREATE POLICY "Public can view doc assets"
  ON public.doc_assets
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- ------------------------------------------------------------------------------
-- Releases Policies
-- ------------------------------------------------------------------------------
-- Workspace owners can manage releases
CREATE POLICY "Owners can manage releases"
  ON public.releases
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = releases.project_id
        AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = releases.project_id
        AND projects.user_id = auth.uid()
    )
  );

-- Public can view releases on changelog pages
CREATE POLICY "Public can view releases"
  ON public.releases
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- ------------------------------------------------------------------------------
-- Subscribers Policies
-- ------------------------------------------------------------------------------
-- Any visitor can subscribe to release email broadcasts
CREATE POLICY "Public can subscribe to project releases"
  ON public.subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only workspace owners can view their subscriber email list
CREATE POLICY "Owners can view subscribers"
  ON public.subscribers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = subscribers.project_id
        AND projects.user_id = auth.uid()
    )
  );
