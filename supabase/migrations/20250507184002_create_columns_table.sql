-- Criar tabela de columns
CREATE TABLE IF NOT EXISTS public.columns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  board_id UUID REFERENCES public.boards(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.columns ENABLE ROW LEVEL SECURITY;

-- Criar políticas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'columns' AND policyname = 'Users can view columns of their boards') THEN
CREATE POLICY "Users can view columns of their boards"
  ON public.columns
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.boards
      WHERE boards.id = columns.board_id
      AND boards.owner_id = auth.uid()
    )
  );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'columns' AND policyname = 'Users can insert columns in their boards') THEN
CREATE POLICY "Users can insert columns in their boards"
  ON public.columns
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.boards
      WHERE boards.id = columns.board_id
      AND boards.owner_id = auth.uid()
    )
  );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'columns' AND policyname = 'Users can update columns in their boards') THEN
CREATE POLICY "Users can update columns in their boards"
  ON public.columns
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.boards
      WHERE boards.id = columns.board_id
      AND boards.owner_id = auth.uid()
    )
  );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'columns' AND policyname = 'Users can delete columns from their boards') THEN
CREATE POLICY "Users can delete columns from their boards"
  ON public.columns
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.boards
      WHERE boards.id = columns.board_id
      AND boards.owner_id = auth.uid()
    )
  );
    END IF;
END $$;

-- Criar trigger para atualizar updated_at
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_columns_updated_at') THEN
CREATE TRIGGER update_columns_updated_at
BEFORE UPDATE ON public.columns
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 
    END IF;
END $$; 