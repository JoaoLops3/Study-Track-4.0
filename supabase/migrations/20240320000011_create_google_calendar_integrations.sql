-- Criar tabela para integrações com Google Calendar
CREATE TABLE IF NOT EXISTS public.google_calendar_integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    token_expiry TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Habilitar RLS
ALTER TABLE public.google_calendar_integrations ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "Usuários podem ver suas próprias integrações"
    ON public.google_calendar_integrations
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias integrações"
    ON public.google_calendar_integrations
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias integrações"
    ON public.google_calendar_integrations
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias integrações"
    ON public.google_calendar_integrations
    FOR DELETE
    USING (auth.uid() = user_id);

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_google_calendar_integrations_user_id
    ON public.google_calendar_integrations(user_id);

-- Garantir que usuários autenticados têm acesso
GRANT ALL ON public.google_calendar_integrations TO authenticated;

-- Criar função para atualizar o updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para atualizar o updated_at
DROP TRIGGER IF EXISTS update_google_calendar_integrations_updated_at ON public.google_calendar_integrations;
CREATE TRIGGER update_google_calendar_integrations_updated_at
    BEFORE UPDATE ON public.google_calendar_integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 