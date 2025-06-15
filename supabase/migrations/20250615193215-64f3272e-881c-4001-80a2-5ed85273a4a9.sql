
-- AJUSTAR TABLA public.users SOLAMENTE SI FALTA CAMPO O DEBE CAMBIAR EL TIPO/RESTRICCIÓN

-- id ya es primary key (no se modifica).

-- email: debe ser text, único, not null
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'users' and column_name = 'email'
      and data_type <> 'text'
  ) then
    alter table public.users alter column email type text;
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_name = 'users' and column_name = 'email'
      and is_nullable = 'YES'
  ) then
    alter table public.users alter column email set not null;
  end if;
  if not exists (
    select 1 from pg_indexes
    where tablename = 'users' and indexname = 'users_email_key'
  ) then
    create unique index users_email_key on public.users(email);
  end if;
end $$;

-- username: text, único, puede ser NULL
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'users' and column_name = 'username'
  ) then
    alter table public.users add column username text;
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_name = 'users' and column_name = 'username'
      and data_type <> 'text'
  ) then
    alter table public.users alter column username type text;
  end if;
  if not exists (
    select 1 from pg_indexes
    where tablename = 'users' and indexname = 'users_username_key'
  ) then
    create unique index users_username_key on public.users(username);
  end if;
end $$;

-- created_at: timestamptz, default now()
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'users' and column_name = 'created_at'
  ) then
    alter table public.users add column created_at timestamptz default now();
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_name = 'users' and column_name = 'created_at'
      and data_type not in ('timestamp with time zone', 'timestamptz')
  ) then
    alter table public.users alter column created_at type timestamptz;
  end if;
  alter table public.users alter column created_at set default now();
end $$;

-- role: text, default 'user'
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'users' and column_name = 'role'
  ) then
    alter table public.users add column role text default 'user';
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_name = 'users' and column_name = 'role'
      and data_type <> 'text'
  ) then
    alter table public.users alter column role type text;
  end if;
  alter table public.users alter column role set default 'user';
end $$;

-- CREAR TABLAS SI NO EXISTEN

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  name text not null,
  description text,
  date date,
  duration_minutes int,
  created_at timestamptz default now()
);

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text,
  type text,
  created_at timestamptz default now()
);

create table if not exists public.user_workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  workout_id uuid references public.workouts(id) on delete cascade,
  date_completed timestamptz,
  notes text,
  performance_score int
);

create table if not exists public.prs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  exercise_id uuid references public.exercises(id) on delete cascade,
  value float,
  unit text,
  date_achieved date,
  notes text
);

-- ACTIVAR RLS EN TODAS
alter table public.users enable row level security;
alter table public.workouts enable row level security;
alter table public.exercises enable row level security;
alter table public.user_workouts enable row level security;
alter table public.prs enable row level security;
