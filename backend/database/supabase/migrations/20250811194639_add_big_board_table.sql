CREATE TABLE big_board (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    nfl_player_id UUID NOT NULL REFERENCES nfl_players_2025(id) ON DELETE CASCADE,
    rank INT NOT NULL,
    tier INT NOT NULL,
    notes TEXT
);

CREATE TABLE pick_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    nfl_player_id UUID NOT NULL REFERENCES nfl_players_2025(id) ON DELETE CASCADE,
    pick_number INT NOT NULL
);
