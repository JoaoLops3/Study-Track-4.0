-- Forçar atualização do schema
select pg_notify('pgrst', 'reload schema');

-- Remover tabela existente e todas as dependências
drop table if exists public.tasks cascade;

-- Criar tabela tasks com definição mais simples
create table public.tasks (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text,
    status text not null default 'pending',
    priority text not null default 'medium',
    due_date date,
    created_at timestamptz default now(),
    user_id uuid references auth.users(id) on delete cascade not null
);

-- Adicionar constraints separadamente
alter table public.tasks
    add constraint tasks_status_check 
    check (status in ('pending', 'in_progress', 'completed'));

alter table public.tasks
    add constraint tasks_priority_check 
    check (priority in ('low', 'medium', 'high'));

-- Habilitar RLS
alter table public.tasks enable row level security;

-- Criar políticas
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

-- Criar índices
create index tasks_user_id_idx on public.tasks(user_id);
create index tasks_status_idx on public.tasks(status);
create index tasks_priority_idx on public.tasks(priority);
create index tasks_due_date_idx on public.tasks(due_date);

-- Conceder permissões
grant all on public.tasks to authenticated;
grant all on public.tasks to service_role;

-- Forçar atualização do schema novamente
select pg_notify('pgrst', 'reload schema');

-- Verificar se a tabela foi criada corretamente
do $$
begin
    if not exists (
        select 1 
        from information_schema.columns 
        where table_schema = 'public' 
        and table_name = 'tasks' 
        and column_name = 'status'
    ) then
        raise exception 'Coluna status não encontrada na tabela tasks';
    end if;
end $$; 