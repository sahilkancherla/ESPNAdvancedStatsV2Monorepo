-- League Median Table
CREATE TABLE fantasy_league_median (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
    week INTEGER NOT NULL,
    year INTEGER NOT NULL,
    median_value DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Best Lineup Table
CREATE TABLE fantasy_team_best_lineup (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    week INTEGER NOT NULL,
    year INTEGER NOT NULL,
    player_started_id UUID NOT NULL REFERENCES nfl_players(id) ON DELETE CASCADE,
    better_player_id UUID NOT NULL REFERENCES nfl_players(id) ON DELETE CASCADE,
    point_difference DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Modify NFL Fantasy Player Weekly Stats to add slot column
ALTER TABLE fantasy_player_weekly_stats 
ADD COLUMN slot VARCHAR(10);

-- Admin Table
CREATE TABLE admin (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    current_season INTEGER NOT NULL,
    current_week INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fantasy Draft Results
CREATE TABLE fantasy_draft_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    pick_number INTEGER NOT NULL,
    player_id UUID NOT NULL REFERENCES nfl_players(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fantasy Team Roster
CREATE TABLE fantasy_team_roster (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES nfl_players(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_league_median_league_week_year ON fantasy_league_median(league_id, week, year);
CREATE INDEX idx_best_lineup_league_team_week_year ON fantasy_team_best_lineup(league_id, team_id, week, year);
CREATE INDEX idx_fantasy_draft_results_league_team ON fantasy_draft_results(league_id, team_id);
CREATE INDEX idx_fantasy_team_roster_league_team_year ON fantasy_team_roster(league_id, team_id, year);
