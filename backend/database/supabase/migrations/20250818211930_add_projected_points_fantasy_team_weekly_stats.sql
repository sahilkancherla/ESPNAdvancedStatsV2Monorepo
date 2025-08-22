-- Add projected_points column to fantasy_team_weekly_stats table
ALTER TABLE fantasy_team_weekly_stats
ADD COLUMN projected_points DECIMAL(10, 2);
