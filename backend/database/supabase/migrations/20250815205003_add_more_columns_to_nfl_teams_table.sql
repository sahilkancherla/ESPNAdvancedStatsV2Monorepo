ALTER TABLE nfl_teams 
ADD COLUMN espn_defense_dt_ranking INTEGER,
ADD COLUMN espn_defense_edge_ranking INTEGER,
ADD COLUMN espn_defense_lb_ranking INTEGER,
ADD COLUMN espn_defense_cb_ranking INTEGER,
ADD COLUMN espn_defense_s_ranking INTEGER,
ADD COLUMN espn_defense_fantasy_ranking INTEGER,
ADD COLUMN espn_offensive_line_ranking INTEGER,
ADD COLUMN the_huddle_run_blocking_ranking INTEGER,
ADD COLUMN the_huddle_pass_blocking_ranking INTEGER,
ADD COLUMN the_huddle_overall_ranking INTEGER,
ADD COLUMN pff_offensive_line_ranking INTEGER,
ADD COLUMN pff_defensive_line_ranking INTEGER,
ADD COLUMN pff_defense_ranking INTEGER,
ADD COLUMN bye_week INTEGER;

-- Create nfl_schedule table
CREATE TABLE nfl_schedule (
    id uuid primary key default uuid_generate_v4(),
    week INTEGER NOT NULL,
    year INTEGER NOT NULL,
    home_team_id uuid NOT NULL REFERENCES nfl_teams(id),
    away_team_id uuid NOT NULL REFERENCES nfl_teams(id)
);
