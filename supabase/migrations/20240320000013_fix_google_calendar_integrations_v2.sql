-- Remover políticas existentes
DROP POLICY IF EXISTS "Usuários podem gerenciar suas próprias integrações" ON public.google_calendar_integrations;

-- Remover a tabela existente
DROP TABLE IF EXISTS public.google_calendar_integrations;

-- Criar a tabela novamente
CREATE TABLE public.google_calendar_integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expiry TIMESTAMP WITH TIME ZONE NOT NULL,
    calendar_id TEXT NOT NULL,
    calendar_summary TEXT,
    calendar_timezone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.google_calendar_integrations ENABLE ROW LEVEL SECURITY;

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_google_calendar_integrations_user_id ON public.google_calendar_integrations(user_id);

-- Criar política simplificada
CREATE POLICY "Usuários podem gerenciar suas próprias integrações"
    ON public.google_calendar_integrations
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Criar trigger para updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.google_calendar_integrations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Garantir acesso à tabela
GRANT ALL ON public.google_calendar_integrations TO authenticated;
GRANT ALL ON public.google_calendar_integrations TO service_role; 