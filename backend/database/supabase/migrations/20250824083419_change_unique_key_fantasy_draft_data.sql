-- Drop the existing unique constraint
ALTER TABLE fantasy_league_draft_picks DROP CONSTRAINT fantasy_league_draft_picks_league_id_round_number_pick_numb_key;

-- Add the new unique constraint that includes year
ALTER TABLE fantasy_league_draft_picks ADD CONSTRAINT fantasy_league_draft_picks_league_id_round_number_pick_number_year_key UNIQUE(league_id, round_number, pick_number, year);
