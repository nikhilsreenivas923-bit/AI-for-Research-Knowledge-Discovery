-- ==============================================================================
-- Research Mind AI - Initial Database Migration Schema
-- File: /supabase/migrations/001_initial_schema.sql
-- Description: Creates profiles, workspaces, documents, and queries tables with
--              strict Row Level Security (RLS) policies and performance indexes.
-- ==============================================================================

-- 1. Enable pgcrypto extension for UUID generation if not already active
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create Profiles Table (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Workspaces Table
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  domain TEXT NOT NULL CHECK (domain IN ('Academic', 'Market', 'Legal', 'Corporate', 'Other')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_or_source TEXT,
  summary TEXT,                  -- AI generated executive summary
  key_themes JSONB DEFAULT '[]'::jsonb, -- AI extracted key themes/entities
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Queries Table (Synthesis & Chat History)
CREATE TABLE IF NOT EXISTS public.queries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  citations JSONB DEFAULT '[]'::jsonb, -- Array of document IDs cited
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- Indexes for High-Performance Retrieval
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_workspaces_user_id ON public.workspaces(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_workspace_id ON public.documents(workspace_id);
CREATE INDEX IF NOT EXISTS idx_queries_workspace_id ON public.queries(workspace_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_queries_created_at ON public.queries(created_at DESC);

-- ==============================================================================
-- Automatic Profile Synchronization Trigger from Supabase auth.users
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at)
  VALUES (NEW.id, NEW.email, NOW())
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- Row Level Security (RLS) Implementation
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queries ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- 2. Workspaces Policies (Users can CRUD only their own workspaces)
DROP POLICY IF EXISTS "Users can CRUD own workspaces" ON public.workspaces;
CREATE POLICY "Users can CRUD own workspaces" 
  ON public.workspaces 
  FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- 3. Documents Policies (Must verify ownership through workspaces relation)
DROP POLICY IF EXISTS "Users can CRUD docs in own workspaces" ON public.documents;
CREATE POLICY "Users can CRUD docs in own workspaces" 
  ON public.documents 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces 
      WHERE public.workspaces.id = documents.workspace_id 
        AND public.workspaces.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspaces 
      WHERE public.workspaces.id = documents.workspace_id 
        AND public.workspaces.user_id = auth.uid()
    )
  );

-- 4. Queries Policies (Must verify ownership through workspaces relation)
DROP POLICY IF EXISTS "Users can CRUD queries in own workspaces" ON public.queries;
CREATE POLICY "Users can CRUD queries in own workspaces" 
  ON public.queries 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces 
      WHERE public.workspaces.id = queries.workspace_id 
        AND public.workspaces.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspaces 
      WHERE public.workspaces.id = queries.workspace_id 
        AND public.workspaces.user_id = auth.uid()
    )
  );

-- ==============================================================================
-- Optional Demo Seed Data Helper (Executed when demo user exists)
-- ==============================================================================
-- Note: Replace '<YOUR_USER_UUID>' with a real auth user UUID if seeding directly
-- DO $$
-- DECLARE
--   v_user_id UUID;
--   v_workspace_id UUID;
-- BEGIN
--   SELECT id INTO v_user_id FROM public.profiles LIMIT 1;
--   IF v_user_id IS NOT NULL THEN
--     INSERT INTO public.workspaces (id, user_id, name, domain, description)
--     VALUES (
--       gen_random_uuid(),
--       v_user_id,
--       'Quantum AI & Neuromorphic Computing',
--       'Academic',
--       'Investigating hybrid quantum-classical algorithms and neuromorphic architectures for real-time edge intelligence.'
--     ) RETURNING id INTO v_workspace_id;
--     
--     INSERT INTO public.documents (workspace_id, title, content, author_or_source, summary, key_themes)
--     VALUES (
--       v_workspace_id,
--       'Neuromorphic Synaptic Plasticity in Edge Hardware',
--       'Recent advancements in memristor crossbar arrays have demonstrated spike-timing-dependent plasticity (STDP) operating under 15 picojoules per synaptic event. This benchmark allows edge devices to conduct continuous unsupervised learning without high-power thermal throttling.',
--       'Dr. Elena Vance, MIT NanoLab (2026)',
--       'The paper demonstrates low-power memristor crossbars exhibiting STDP at under 15pJ per event, enabling real-time edge intelligence.',
--       '["Neuromorphic Computing", "Memristors", "STDP", "Low Power Edge"]'::jsonb
--     );
--   END IF;
-- END $$;

