-- Habilitar RLS
alter table public.tasks enable row level security;

-- Remover políticas existentes
drop policy if exists "Usuários podem ver suas próprias tarefas" on public.tasks;
drop policy if exists "Usuários podem criar suas próprias tarefas" on public.tasks;
drop policy if exists "Usuários podem atualizar suas próprias tarefas" on public.tasks;
drop policy if exists "Usuários podem deletar suas próprias tarefas" on public.tasks;

-- Criar novas políticas
create policy "Usuários podem ver suas próprias tarefas"
    on public.tasks for select
    using (auth.uid() = user_id);

create policy "Usuários podem criar suas próprias tarefas"
    on public.tasks for insert
    with check (auth.uid() = user_id);

create policy "Usuários podem atualizar suas próprias tarefas"
    on public.tasks for update
    using (auth.uid() = user_id);

create policy "Usuários podem deletar suas próprias tarefas"
    on public.tasks for delete
    using (auth.uid() = user_id);

-- Conceder permissões
grant all on public.tasks to authenticated;
grant all on public.tasks to service_role;

-- Forçar atualização do schema
select pg_notify('pgrst', 'reload schema'); 