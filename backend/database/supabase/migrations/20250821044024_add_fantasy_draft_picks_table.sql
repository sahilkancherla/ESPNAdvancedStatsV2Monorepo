CREATE TABLE fantasy_league_draft_picks (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id uuid NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
    team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
    round_number INTEGER NOT NULL,
    pick_number INTEGER NOT NULL,
    player_id uuid REFERENCES nfl_players(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(league_id, round_number, pick_number)
);

-- Create index for faster queries
CREATE INDEX idx_fantasy_league_draft_picks_league_id ON fantasy_league_draft_picks(league_id);
CREATE INDEX idx_fantasy_league_draft_picks_team_id ON fantasy_league_draft_picks(team_id);
CREATE INDEX idx_fantasy_league_draft_picks_player_id ON fantasy_league_draft_picks(player_id);