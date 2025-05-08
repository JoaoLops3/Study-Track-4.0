-- Remover políticas existentes
DROP POLICY IF EXISTS "Usuários podem ver suas próprias integrações" ON public.google_calendar_integrations;
DROP POLICY IF EXISTS "Usuários podem criar suas próprias integrações" ON public.google_calendar_integrations;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias integrações" ON public.google_calendar_integrations;
DROP POLICY IF EXISTS "Usuários podem deletar suas próprias integrações" ON public.google_calendar_integrations;

-- Remover tabela existente
DROP TABLE IF EXISTS public.google_calendar_integrations;

-- Recriar tabela com campos adicionais
CREATE TABLE public.google_calendar_integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    token_expiry TIMESTAMP WITH TIME ZONE NOT NULL,
    calendar_id TEXT,
    calendar_summary TEXT,
    calendar_timezone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Habilitar RLS
ALTER TABLE public.google_calendar_integrations ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança simplificadas
CREATE POLICY "Usuários podem gerenciar suas próprias integrações"
    ON public.google_calendar_integrations
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_google_calendar_integrations_user_id
    ON public.google_calendar_integrations(user_id);

-- Garantir que usuários autenticados têm acesso
GRANT ALL ON public.google_calendar_integrations TO authenticated;

-- Criar trigger para atualizar o updated_at
DROP TRIGGER IF EXISTS update_google_calendar_integrations_updated_at ON public.google_calendar_integrations;
CREATE TRIGGER update_google_calendar_integrations_updated_at
    BEFORE UPDATE ON public.google_calendar_integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 