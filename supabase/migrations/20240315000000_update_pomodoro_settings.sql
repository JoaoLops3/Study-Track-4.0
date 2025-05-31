-- Atualiza a tabela pomodoro_settings
ALTER TABLE pomodoro_settings
ADD COLUMN IF NOT EXISTS focus_duration INTEGER NOT NULL DEFAULT 1500,
ADD COLUMN IF NOT EXISTS short_break_duration INTEGER NOT NULL DEFAULT 300,
ADD COLUMN IF NOT EXISTS long_break_duration INTEGER NOT NULL DEFAULT 900,
ADD COLUMN IF NOT EXISTS long_break_interval INTEGER NOT NULL DEFAULT 4,
ADD COLUMN IF NOT EXISTS auto_start_breaks BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS auto_start_pomodoros BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS notifications BOOLEAN NOT NULL DEFAULT true;

-- Remove políticas existentes
DROP POLICY IF EXISTS "Usuários podem ver suas próprias configurações" ON pomodoro_settings;
DROP POLICY IF EXISTS "Usuários podem inserir suas próprias configurações" ON pomodoro_settings;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias configurações" ON pomodoro_settings;

-- Atualiza as políticas RLS
ALTER TABLE pomodoro_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias configurações"
ON pomodoro_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias configurações"
ON pomodoro_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias configurações"
ON pomodoro_settings FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Cria um trigger para garantir que o usuário existe
CREATE OR REPLACE FUNCTION public.handle_new_pomodoro_settings()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.user_id) THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_pomodoro_settings_insert ON pomodoro_settings;
CREATE TRIGGER on_pomodoro_settings_insert
  BEFORE INSERT ON pomodoro_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_pomodoro_settings(); 