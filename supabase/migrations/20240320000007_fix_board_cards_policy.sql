-- Remover políticas existentes
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios cards" ON public.board_cards;

-- Criar nova política que permite atualização em lote
CREATE POLICY "Usuários podem atualizar seus próprios cards"
    ON public.board_cards
    FOR UPDATE
    USING (
        auth.uid() = owner_id
        OR EXISTS (
            SELECT 1 FROM public.board_cards
            WHERE id = board_cards.id
            AND owner_id = auth.uid()
        )
    );

-- Garantir que o RLS está ativado
ALTER TABLE public.board_cards ENABLE ROW LEVEL SECURITY;

-- Garantir que as permissões estão corretas
GRANT ALL ON public.board_cards TO authenticated; 