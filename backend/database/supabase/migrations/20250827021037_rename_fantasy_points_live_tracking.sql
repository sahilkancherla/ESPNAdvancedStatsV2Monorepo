-- Rename fantasy_points_live_tracking table to fantasy_team_points_live_tracking
ALTER TABLE fantasy_points_live_tracking RENAME TO fantasy_team_points_live_tracking;

-- Rename the index to match the new table name
DROP INDEX idx_fantasy_points_live_tracking_league_team_week_year;
CREATE INDEX idx_fantasy_team_points_live_tracking_league_team_week_year ON fantasy_team_points_live_tracking(league_id, team_id, week, year);
