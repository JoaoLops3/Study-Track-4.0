-- Criar tabela de sessões do Pomodoro
CREATE TABLE IF NOT EXISTS public.pomodoro_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    mode TEXT NOT NULL CHECK (mode IN ('focus', 'shortBreak', 'longBreak')),
    duration INTEGER NOT NULL, -- duração em minutos
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "Usuários podem ver suas próprias sessões"
    ON public.pomodoro_sessions
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias sessões"
    ON public.pomodoro_sessions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias sessões"
    ON public.pomodoro_sessions
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias sessões"
    ON public.pomodoro_sessions
    FOR DELETE
    USING (auth.uid() = user_id);

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS pomodoro_sessions_user_id_idx ON public.pomodoro_sessions(user_id);
CREATE INDEX IF NOT EXISTS pomodoro_sessions_created_at_idx ON public.pomodoro_sessions(created_at);

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_pomodoro_sessions_updated_at
    BEFORE UPDATE ON public.pomodoro_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 