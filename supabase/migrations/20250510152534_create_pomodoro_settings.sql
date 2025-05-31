-- Criar tabela de configurações do Pomodoro
CREATE TABLE IF NOT EXISTS public.pomodoro_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  focus_duration INTEGER NOT NULL DEFAULT 1500, -- 25 minutos em segundos
  short_break_duration INTEGER NOT NULL DEFAULT 300, -- 5 minutos em segundos
  long_break_duration INTEGER NOT NULL DEFAULT 900, -- 15 minutos em segundos
  rounds INTEGER NOT NULL DEFAULT 4,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_pomodoro_settings_user_id ON public.pomodoro_settings(user_id);

-- Habilitar RLS
ALTER TABLE public.pomodoro_settings ENABLE ROW LEVEL SECURITY;

-- Criar políticas
CREATE POLICY "Users can view their own pomodoro settings"
  ON public.pomodoro_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pomodoro settings"
  ON public.pomodoro_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pomodoro settings"
  ON public.pomodoro_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pomodoro settings"
  ON public.pomodoro_settings FOR DELETE
  USING (auth.uid() = user_id);

-- Criar trigger para updated_at
CREATE TRIGGER update_pomodoro_settings_updated_at
  BEFORE UPDATE ON public.pomodoro_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 