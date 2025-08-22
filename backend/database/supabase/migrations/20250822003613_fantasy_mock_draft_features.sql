-- Mock Draft table
CREATE TABLE fantasy_mock_drafts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    rounds INTEGER NOT NULL DEFAULT 7,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Mock Draft Picks table
CREATE TABLE fantasy_mock_draft_picks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fantasy_mock_draft_id UUID REFERENCES fantasy_mock_drafts(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    pick_number INTEGER NOT NULL,
    overall_pick INTEGER NOT NULL,
    player_id UUID REFERENCES nfl_players(id) ON DELETE CASCADE,
    drafting_team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    notes TEXT
);

-- Add indexes for better performance
CREATE INDEX idx_mock_drafts_league_id ON fantasy_mock_drafts(league_id);
CREATE INDEX idx_mock_drafts_team_id ON fantasy_mock_drafts(team_id);
CREATE INDEX idx_mock_draft_picks_mock_draft_id ON fantasy_mock_draft_picks(fantasy_mock_draft_id);
CREATE INDEX idx_mock_draft_picks_overall_pick ON fantasy_mock_draft_picks(overall_pick);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_fantasy_mock_drafts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_fantasy_mock_drafts_updated_at
    BEFORE UPDATE ON fantasy_mock_drafts
    FOR EACH ROW
    EXECUTE FUNCTION update_fantasy_mock_drafts_updated_at();