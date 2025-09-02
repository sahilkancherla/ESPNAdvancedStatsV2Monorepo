-- Fantasy Points Live Tracking table
CREATE TABLE fantasy_points_live_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    week INTEGER NOT NULL,
    year INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_fantasy_points_live_tracking_league_team_week_year ON fantasy_points_live_tracking(league_id, team_id, week, year);
