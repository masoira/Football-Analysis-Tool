-- Description: Creates initial match results table for RLS testing

CREATE TABLE match_results (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,  -- Using TEXT instead of UUID for simplicity
    match_timestamp TIMESTAMP NOT NULL,
    home_team VARCHAR(100) NOT NULL,
    away_team VARCHAR(100) NOT NULL,
    match_result VARCHAR(10) NOT NULL
);
