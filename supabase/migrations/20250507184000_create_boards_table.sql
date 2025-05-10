-- Criar tabela de boards
CREATE TABLE IF NOT EXISTS public.boards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;

-- Criar políticas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'boards' AND policyname = 'boards_select') THEN
CREATE POLICY "boards_select" ON public.boards
FOR SELECT
USING (
  owner_id = auth.uid() OR
  is_public = true
);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'boards' AND policyname = 'boards_insert') THEN
CREATE POLICY "boards_insert" ON public.boards
FOR INSERT
WITH CHECK (auth.uid() = owner_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'boards' AND policyname = 'boards_update') THEN
CREATE POLICY "boards_update" ON public.boards
FOR UPDATE
USING (auth.uid() = owner_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'boards' AND policyname = 'boards_delete') THEN
CREATE POLICY "boards_delete" ON public.boards
FOR DELETE
USING (auth.uid() = owner_id);
    END IF;
END $$;

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_boards_updated_at') THEN
CREATE TRIGGER update_boards_updated_at
BEFORE UPDATE ON public.boards
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 
    END IF;
END $$; 