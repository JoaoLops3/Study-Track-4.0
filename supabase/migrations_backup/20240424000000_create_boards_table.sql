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
CREATE POLICY "boards_select" ON public.boards
FOR SELECT
USING (
  owner_id = auth.uid() OR
  is_public = true
);

CREATE POLICY "boards_insert" ON public.boards
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "boards_update" ON public.boards
FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "boards_delete" ON public.boards
FOR DELETE
USING (auth.uid() = owner_id);

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

CREATE TRIGGER update_boards_updated_at
BEFORE UPDATE ON public.boards
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 