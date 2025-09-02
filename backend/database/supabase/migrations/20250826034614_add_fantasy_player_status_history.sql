
-- Create fantasy_player_status_history table
CREATE TABLE fantasy_player_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID NOT NULL REFERENCES leagues(id),
    team_id UUID REFERENCES teams(id),
    player_id UUID NOT NULL REFERENCES nfl_players(id),
    year INTEGER NOT NULL,
    start_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    end_timestamp TIMESTAMP WITH TIME ZONE
);

-- Add indexes for common query patterns
CREATE INDEX idx_fantasy_player_status_history_league_year ON fantasy_player_status_history(league_id, year);
CREATE INDEX idx_fantasy_player_status_history_player_year ON fantasy_player_status_history(player_id, year);
CREATE INDEX idx_fantasy_player_status_history_team_year ON fantasy_player_status_history(team_id, year);
CREATE INDEX idx_fantasy_player_status_history_timestamps ON fantasy_player_status_history(start_timestamp, end_timestamp);
