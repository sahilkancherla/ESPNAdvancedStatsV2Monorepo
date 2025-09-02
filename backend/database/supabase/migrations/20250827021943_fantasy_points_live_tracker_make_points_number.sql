-- Change points column from INTEGER to NUMERIC to allow decimals
ALTER TABLE fantasy_team_points_live_tracking 
ALTER COLUMN points TYPE NUMERIC USING points::NUMERIC;
