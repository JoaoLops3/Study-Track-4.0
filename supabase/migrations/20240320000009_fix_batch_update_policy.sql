-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Usuários podem ver seus próprios cards" ON public.board_cards;
DROP POLICY IF EXISTS "Usuários podem criar seus próprios cards" ON public.board_cards;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios cards" ON public.board_cards;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios cards" ON public.board_cards;

-- Criar novas políticas
CREATE POLICY "Usuários podem ver seus próprios cards"
    ON public.board_cards
    FOR SELECT
    USING (auth.uid() = owner_id);

CREATE POLICY "Usuários podem criar seus próprios cards"
    ON public.board_cards
    FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

-- Política específica para atualização em lote
CREATE POLICY "Usuários podem atualizar seus próprios cards"
    ON public.board_cards
    FOR UPDATE
    USING (
        auth.uid() = owner_id
        OR (
            auth.uid() = (
                SELECT owner_id 
                FROM public.board_cards 
                WHERE id = board_cards.id
            )
        )
    );

CREATE POLICY "Usuários podem deletar seus próprios cards"
    ON public.board_cards
    FOR DELETE
    USING (auth.uid() = owner_id);

-- Garantir que o RLS está ativado
ALTER TABLE public.board_cards ENABLE ROW LEVEL SECURITY;

-- Garantir que as permissões estão corretas
GRANT ALL ON public.board_cards TO authenticated;

-- Adicionar trigger para atualizar o updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_board_cards_updated_at ON public.board_cards;
CREATE TRIGGER update_board_cards_updated_at
    BEFORE UPDATE ON public.board_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 