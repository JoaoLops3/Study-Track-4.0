-- Criar tabela de páginas
create table public.pages (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    content text,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    owner_id uuid references auth.users(id) on delete cascade not null
);

-- Criar tabela de cards do board
create table public.board_cards (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text,
    status text not null default 'todo',
    position integer not null default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    owner_id uuid references auth.users(id) on delete cascade not null
);

-- Adicionar constraints
alter table public.board_cards
    add constraint board_cards_status_check 
    check (status in ('todo', 'in-progress', 'done'));

-- Habilitar RLS
alter table public.pages enable row level security;
alter table public.board_cards enable row level security;

-- Criar políticas para páginas
create policy "Usuários podem ver suas próprias páginas"
    on public.pages for select
    using (auth.uid() = owner_id);

create policy "Usuários podem criar suas próprias páginas"
    on public.pages for insert
    with check (auth.uid() = owner_id);

create policy "Usuários podem atualizar suas próprias páginas"
    on public.pages for update
    using (auth.uid() = owner_id);

create policy "Usuários podem deletar suas próprias páginas"
    on public.pages for delete
    using (auth.uid() = owner_id);

-- Criar políticas para cards do board
create policy "Usuários podem ver seus próprios cards"
    on public.board_cards for select
    using (auth.uid() = owner_id);

create policy "Usuários podem criar seus próprios cards"
    on public.board_cards for insert
    with check (auth.uid() = owner_id);

create policy "Usuários podem atualizar seus próprios cards"
    on public.board_cards for update
    using (auth.uid() = owner_id);

create policy "Usuários podem deletar seus próprios cards"
    on public.board_cards for delete
    using (auth.uid() = owner_id);

-- Criar índices
create index pages_owner_id_idx on public.pages(owner_id);
create index board_cards_owner_id_idx on public.board_cards(owner_id);
create index board_cards_status_idx on public.board_cards(status);

-- Conceder permissões
grant all on public.pages to authenticated;
grant all on public.board_cards to authenticated;

-- Forçar atualização do schema
select pg_notify('pgrst', 'reload schema'); 