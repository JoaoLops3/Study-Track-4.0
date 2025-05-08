-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Usuários podem ver seus próprios cards" ON public.board_cards;
DROP POLICY IF EXISTS "Usuários podem criar seus próprios cards" ON public.board_cards;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios cards" ON public.board_cards;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios cards" ON public.board_cards;

-- Criar novas políticas simplificadas
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

-- Garantir que o RLS está ativado
ALTER TABLE public.board_cards ENABLE ROW LEVEL SECURITY;

-- Garantir que as permissões estão corretas
GRANT ALL ON public.board_cards TO authenticated; 