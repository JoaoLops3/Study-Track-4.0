-- Remover tabela existente
drop table if exists public.tasks cascade;

-- Criar tabela tasks com a estrutura correta
create table public.tasks (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text,
    completed boolean not null default false,
    priority text not null default 'medium',
    due_date timestamptz,
    created_at timestamptz default now(),
    user_id uuid references auth.users(id) on delete cascade not null,
    subject_id uuid
);

-- Adicionar constraints
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
create index tasks_completed_idx on public.tasks(completed);
create index tasks_priority_idx on public.tasks(priority);
create index tasks_due_date_idx on public.tasks(due_date);

-- Conceder permissões
grant all on public.tasks to authenticated;
grant all on public.tasks to service_role;

-- Forçar atualização do schema
select pg_notify('pgrst', 'reload schema'); 