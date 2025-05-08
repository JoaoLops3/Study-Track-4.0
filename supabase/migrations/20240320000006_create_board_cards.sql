-- Criar tabela de cards do board
CREATE TABLE IF NOT EXISTS public.board_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('todo', 'in-progress', 'done')),
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Criar índices
CREATE INDEX IF NOT EXISTS board_cards_owner_id_idx ON public.board_cards(owner_id);
CREATE INDEX IF NOT EXISTS board_cards_status_idx ON public.board_cards(status);

-- Configurar RLS (Row Level Security)
ALTER TABLE public.board_cards ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "Usuários podem ver seus próprios cards"
    ON public.board_cards
    FOR SELECT
    USING (auth.uid() = owner_id);

CREATE POLICY "Usuários podem criar seus próprios cards"
    ON public.board_cards
    FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Usuários podem atualizar seus próprios cards"
    ON public.board_cards
    FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Usuários podem deletar seus próprios cards"
    ON public.board_cards
    FOR DELETE
    USING (auth.uid() = owner_id);

-- Conceder permissões
GRANT ALL ON public.board_cards TO authenticated;
GRANT USAGE ON SEQUENCE board_cards_id_seq TO authenticated; 