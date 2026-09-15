-- Reno Hub schema. Apply in your Supabase SQL editor (or via migration).

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  room text,
  type text,
  status text default 'Planning / Brainstorming',
  priority text default 'Medium',
  current_phase text default 'Concept',
  next_action text,
  target_start date,
  target_completion date,
  estimated_budget numeric,
  design_status text,
  materials_status text,
  build_plan_status text,
  percent_complete numeric default 0,
  cover_image text,
  what text,
  why text,
  design_goal text,
  aesthetic text,
  constraints text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists materials (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  item text not null,
  category text,
  description text,
  qty_needed numeric,
  qty_ordered numeric,
  qty_received numeric,
  unit text,
  retailer text,
  product_url text,
  sku text,
  est_unit_price numeric,
  actual_unit_price numeric,
  order_status text default 'RESEARCHING',
  order_date date,
  expected_delivery date,
  received_date date,
  notes text,
  created_at timestamptz default now()
);

create table if not exists measurements (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  location text not null,
  width numeric, height numeric, depth numeric, thickness numeric, quantity numeric,
  units text default 'inches',
  status text default 'ROUGH',
  verified boolean default false,
  notes text
);

create table if not exists decisions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  topic text not null,
  kind text not null default 'question', -- 'decision' | 'question'
  status text,
  impact text,
  options text,
  recommendation text,
  original_idea text,
  final_decision text,
  reason text,
  created_at timestamptz default now()
);

create table if not exists build_steps (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  step_no numeric,
  phase text,
  task text not null,
  instructions text,
  dependencies text,
  status text default 'NOT STARTED',
  difficulty text
);

create table if not exists cut_list (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  component text not null,
  part_no text,
  material text,
  quantity numeric,
  length numeric, width numeric, depth numeric,
  cut_status text default 'NOT FINAL',
  final boolean default false,
  notes text
);

create table if not exists files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  type text,
  url text,
  created_at timestamptz default now()
);

create index if not exists idx_materials_project on materials(project_id);
create index if not exists idx_measurements_project on measurements(project_id);
create index if not exists idx_decisions_project on decisions(project_id);
create index if not exists idx_build_steps_project on build_steps(project_id);
create index if not exists idx_cut_list_project on cut_list(project_id);
create index if not exists idx_files_project on files(project_id);
