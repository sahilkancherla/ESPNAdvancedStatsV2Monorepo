-- Add league_id column to fantasy_player_weekly_stats table
ALTER TABLE fantasy_player_weekly_stats
ADD COLUMN league_id uuid REFERENCES leagues(id);

-- Add league_id column to fantasy_player_season_stats table
ALTER TABLE fantasy_player_season_stats
ADD COLUMN league_id uuid REFERENCES leagues(id);
