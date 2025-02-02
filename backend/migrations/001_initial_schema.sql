CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    match_name VARCHAR(255) NOT NULL,
    home_team VARCHAR(255) NOT NULL,
    away_team VARCHAR(255) NOT NULL,
    match_date TIMESTAMP NOT NULL
);

CREATE TYPE action_type AS ENUM ('shot');
CREATE TYPE shot_type AS ENUM ('on-target', 'blocked', 'off-target');
CREATE TYPE assist_type AS ENUM ('assist', 'dribble');

CREATE TABLE assists (
    id SERIAL PRIMARY KEY,
    x FLOAT NOT NULL,
    y FLOAT NOT NULL,
    type assist_type NOT NULL
);

CREATE TABLE actions (
    id SERIAL PRIMARY KEY,
    match_id INTEGER REFERENCES matches(id),
    type action_type NOT NULL,
    x FLOAT NOT NULL,
    y FLOAT NOT NULL,
    shot_type shot_type NOT NULL,
    is_header BOOLEAN NOT NULL,
    team VARCHAR(255) NOT NULL,
    assist_id INTEGER REFERENCES assists(id)
);
