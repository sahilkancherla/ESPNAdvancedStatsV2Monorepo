-- NFL Teams table
create table nfl_teams (
    id uuid primary key default uuid_generate_v4(),
    espn_team_id VARCHAR(10) NOT NULL UNIQUE,  -- Example: 'sea'
    team_name VARCHAR(100) NOT NULL            -- Example: 'Seattle Seahawks'
);

-- NFL Players table
create table nfl_players (
    id uuid primary key default uuid_generate_v4(),
    espn_player_id INT NOT NULL UNIQUE,        -- Example: 12345
    first_name VARCHAR(50) NOT NULL,           -- Example: 'Russell'
    last_name VARCHAR(50) NOT NULL,            -- Example: 'Wilson'
    team_id uuid REFERENCES nfl_teams(id) ON DELETE SET NULL,
    position VARCHAR(10) NOT NULL              -- Example: 'QB'
);