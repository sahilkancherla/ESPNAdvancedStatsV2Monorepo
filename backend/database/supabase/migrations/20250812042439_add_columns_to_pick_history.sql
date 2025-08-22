ALTER TABLE pick_history
ADD COLUMN league_id uuid REFERENCES leagues(id);

ALTER TABLE pick_history
ADD COLUMN year integer;
