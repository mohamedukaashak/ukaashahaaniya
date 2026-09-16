-- ==============================================================================
-- SUPABASE SCHEMA: UKAASHA & HAANIYA - STRICT PRIVATE SANCTUARY
-- Run this script in your Supabase Project's SQL Editor (Dashboard > SQL Editor)
-- This enforces STRICT PRIVATE ACCESS: Public visitors cannot read any data!
-- ==============================================================================

-- 1. Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create MEMORIES Table (Photo Gallery)
CREATE TABLE IF NOT EXISTS public.memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    caption TEXT,
    image_url TEXT NOT NULL,
    category TEXT DEFAULT 'Sweet Moments',
    memory_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on memories
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

-- Drop any previous public policies if they exist
DROP POLICY IF EXISTS "Allow public read of memories" ON public.memories;
DROP POLICY IF EXISTS "Allow authenticated users to view memories" ON public.memories;
DROP POLICY IF EXISTS "Allow authenticated users to insert memories" ON public.memories;
DROP POLICY IF EXISTS "Allow authenticated users to update memories" ON public.memories;
DROP POLICY IF EXISTS "Allow authenticated users to delete memories" ON public.memories;

-- STRICT POLICY: Only authenticated users (Ukaasha & Haaniya) can view memories
CREATE POLICY "Allow authenticated users to view memories"
ON public.memories FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert their memories
CREATE POLICY "Allow authenticated users to insert memories"
ON public.memories FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow authenticated users to update their memories
CREATE POLICY "Allow authenticated users to update memories"
ON public.memories FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR user_id IS NULL);

-- (DELETE POLICY REMOVED: Memories are permanently preserved and cannot be deleted)
DROP POLICY IF EXISTS "Allow authenticated users to delete memories" ON public.memories;


-- 3. Create NOTES Table (Love Letters & Reminders)
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL, -- e.g., 'Ukaasha', 'Haaniya', or 'Together'
    mood TEXT DEFAULT 'Forever & Always',
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on notes
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Drop any previous public policies
DROP POLICY IF EXISTS "Allow public read of notes" ON public.notes;
DROP POLICY IF EXISTS "Allow authenticated users to view notes" ON public.notes;
DROP POLICY IF EXISTS "Allow authenticated users to insert notes" ON public.notes;
DROP POLICY IF EXISTS "Allow authenticated users to update notes" ON public.notes;
DROP POLICY IF EXISTS "Allow authenticated users to delete notes" ON public.notes;

-- STRICT POLICY: Only authenticated users can view love notes
CREATE POLICY "Allow authenticated users to view notes"
ON public.notes FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert notes
CREATE POLICY "Allow authenticated users to insert notes"
ON public.notes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow authenticated users to update notes
CREATE POLICY "Allow authenticated users to update notes"
ON public.notes FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR user_id IS NULL);

-- (DELETE POLICY REMOVED: Love notes are permanently preserved and cannot be deleted)
DROP POLICY IF EXISTS "Allow authenticated users to delete notes" ON public.notes;


-- 4. Storage Bucket Setup: 'relationship-vault'
-- Run this if the storage schema exists:
INSERT INTO storage.buckets (id, name, public)
VALUES ('relationship-vault', 'relationship-vault', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "Public Access to relationship-vault" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view relationship-vault" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to relationship-vault" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete from relationship-vault" ON storage.objects;

-- Storage Policy: Strictly authenticated users can view photos in relationship-vault
CREATE POLICY "Authenticated users can view relationship-vault"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'relationship-vault');

-- Storage Policy: Strictly authenticated users can upload files
CREATE POLICY "Authenticated users can upload to relationship-vault"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'relationship-vault');

-- (DELETE POLICY REMOVED: Photo files in relationship-vault are protected and cannot be deleted)
