-- Criar tabela de usuários se não existir
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- Criar políticas para users
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Criar função para sincronizar usuários
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para sincronizar usuários
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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

-- Habilitar RLS para pomodoro_settings
ALTER TABLE public.pomodoro_settings ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can view their own pomodoro settings" ON public.pomodoro_settings;
DROP POLICY IF EXISTS "Users can insert their own pomodoro settings" ON public.pomodoro_settings;
DROP POLICY IF EXISTS "Users can update their own pomodoro settings" ON public.pomodoro_settings;
DROP POLICY IF EXISTS "Users can delete their own pomodoro settings" ON public.pomodoro_settings;

-- Criar políticas para pomodoro_settings
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

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para updated_at em pomodoro_settings
DROP TRIGGER IF EXISTS update_pomodoro_settings_updated_at ON public.pomodoro_settings;
CREATE TRIGGER update_pomodoro_settings_updated_at
  BEFORE UPDATE ON public.pomodoro_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Criar tabela de sessões de estudo
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  minutes_studied INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de progresso semanal
CREATE TABLE IF NOT EXISTS public.weekly_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  minutes_studied INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, date)
);

-- Habilitar RLS para as novas tabelas
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_progress ENABLE ROW LEVEL SECURITY;

-- Criar políticas para study_sessions
CREATE POLICY "Users can read own study sessions"
  ON public.study_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study sessions"
  ON public.study_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Criar políticas para weekly_progress
CREATE POLICY "Users can read own weekly progress"
  ON public.weekly_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert/update own weekly progress"
  ON public.weekly_progress
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id); 