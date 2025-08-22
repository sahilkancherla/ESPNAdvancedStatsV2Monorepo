create table draft_order (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid references teams(id) on delete cascade,
  pick_number integer not null,
  league_id uuid not null,
  year integer not null
);
