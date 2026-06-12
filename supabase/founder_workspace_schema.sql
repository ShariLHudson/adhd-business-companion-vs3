-- Founder Workspace tables (run in Supabase SQL editor)
-- Prefix founder_ to avoid clashing with app tables.

create table if not exists founder_projects (
  id text primary key,
  owner_id text not null,
  title text not null default '',
  description text not null default '',
  type text not null default 'project',
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists founder_experiments (
  id text primary key,
  owner_id text not null,
  title text not null default '',
  notes text not null default '',
  type text not null default 'experiment',
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists founder_notes (
  id text primary key,
  owner_id text not null,
  content text not null default '',
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists founder_projects_owner_idx on founder_projects (owner_id);
create index if not exists founder_experiments_owner_idx on founder_experiments (owner_id);
create index if not exists founder_notes_owner_idx on founder_notes (owner_id);
