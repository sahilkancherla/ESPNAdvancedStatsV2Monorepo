-- Users table
create table users (
  id uuid primary key,  -- This UUID must match the Supabase Auth user ID
  username text not null unique,
  email text not null unique
);

-- Teams table
create table teams (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  league_id uuid not null,
  team_name text not null
);

-- Leagues table
create table leagues (
  id uuid primary key default uuid_generate_v4(),
  admin_user_id uuid references users(id) on delete set null,
  external_league_id text not null, -- fantasy league id from ESPN
  espn_s2 text not null,
  swid text not null
);
