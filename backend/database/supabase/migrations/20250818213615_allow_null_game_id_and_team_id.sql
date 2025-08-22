-- Allow team_id to be null in fantasy_player_weekly_stats table
ALTER TABLE fantasy_player_weekly_stats
ALTER COLUMN team_id DROP NOT NULL;

-- Allow game_id to be null in fantasy_player_weekly_stats table
ALTER TABLE fantasy_player_weekly_stats
ALTER COLUMN game_id DROP NOT NULL;
