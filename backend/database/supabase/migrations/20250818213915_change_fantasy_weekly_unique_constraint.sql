-- Drop the existing unique constraint
ALTER TABLE fantasy_player_weekly_stats 
DROP CONSTRAINT fantasy_player_weekly_stats_player_id_game_id_week_year_key;

-- Add new unique constraint that matches your upsert
ALTER TABLE fantasy_player_weekly_stats 
ADD CONSTRAINT fantasy_player_weekly_stats_unique 
UNIQUE(league_id, player_id, week, year);

-- Drop the existing unique constraint
ALTER TABLE fantasy_player_season_stats 
DROP CONSTRAINT fantasy_player_season_stats_player_id_year_key;

-- Add new unique constraint that matches your upsert
ALTER TABLE fantasy_player_season_stats 
ADD CONSTRAINT fantasy_player_season_stats_unique 
UNIQUE(league_id, player_id, year);