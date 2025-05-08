-- Criar função para garantir que o usuário exista
CREATE OR REPLACE FUNCTION public.ensure_user_exists()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se o usuário existe na tabela auth.users
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE id = NEW.user_id
  ) THEN
    -- Se não existir, criar o usuário
    INSERT INTO auth.users (
      id,
      email,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role
    ) VALUES (
      NEW.user_id,
      auth.uid()::text || '@temporary.com',
      now(),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{}',
      false,
      'authenticated'
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Criar trigger para chamar a função antes de inserir uma tarefa
DROP TRIGGER IF EXISTS ensure_user_exists_before_task ON public.tasks;
CREATE TRIGGER ensure_user_exists_before_task
  BEFORE INSERT ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_user_exists();

-- Forçar atualização do schema
select pg_notify('pgrst', 'reload schema'); 