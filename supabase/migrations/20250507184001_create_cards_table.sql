-- Verificar se a tabela columns existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'columns') THEN
        RAISE EXCEPTION 'A tabela columns deve ser criada antes da tabela cards';
    END IF;
END $$;

-- Criar tabela de cards
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  column_id UUID REFERENCES public.columns(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- Criar políticas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cards' AND policyname = 'Users can view cards in their boards') THEN
        CREATE POLICY "Users can view cards in their boards"
            ON public.cards
            FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM public.columns
                    JOIN public.boards ON boards.id = columns.board_id
                    WHERE columns.id = cards.column_id
                    AND boards.owner_id = auth.uid()
                )
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cards' AND policyname = 'Users can insert cards in their boards') THEN
        CREATE POLICY "Users can insert cards in their boards"
            ON public.cards
            FOR INSERT
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.columns
                    JOIN public.boards ON boards.id = columns.board_id
                    WHERE columns.id = cards.column_id
                    AND boards.owner_id = auth.uid()
                )
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cards' AND policyname = 'Users can update cards in their boards') THEN
        CREATE POLICY "Users can update cards in their boards"
            ON public.cards
            FOR UPDATE
            USING (
                EXISTS (
                    SELECT 1 FROM public.columns
                    JOIN public.boards ON boards.id = columns.board_id
                    WHERE columns.id = cards.column_id
                    AND boards.owner_id = auth.uid()
                )
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cards' AND policyname = 'Users can delete cards from their boards') THEN
        CREATE POLICY "Users can delete cards from their boards"
            ON public.cards
            FOR DELETE
            USING (
                EXISTS (
                    SELECT 1 FROM public.columns
                    JOIN public.boards ON boards.id = columns.board_id
                    WHERE columns.id = cards.column_id
                    AND boards.owner_id = auth.uid()
                )
            );
    END IF;
END $$;

-- Criar trigger para atualizar updated_at
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_cards_updated_at') THEN
        CREATE TRIGGER update_cards_updated_at
        BEFORE UPDATE ON public.cards
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$; 