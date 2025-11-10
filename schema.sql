-- Database schema for the repertoire application

CREATE TABLE people (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE pieces (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL UNIQUE
);

CREATE TABLE knows (
  person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
  piece_id INTEGER REFERENCES pieces(id) ON DELETE CASCADE,
  PRIMARY KEY (person_id, piece_id)
);