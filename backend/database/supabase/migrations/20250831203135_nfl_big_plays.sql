CREATE TABLE nfl_big_plays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES nfl_players(id),
    timestamp TIMESTAMP NOT NULL,
    description TEXT NOT NULL
);