-- Add week and year columns to nfl_big_plays table
ALTER TABLE nfl_big_plays 
ADD COLUMN week INTEGER,
ADD COLUMN year INTEGER;

-- Add a unique constraint to prevent duplicate big plays for the same player, timestamp, week, and year
ALTER TABLE nfl_big_plays 
ADD CONSTRAINT unique_big_play_per_player_time_week_year 
UNIQUE (player_id, timestamp, week, year);
