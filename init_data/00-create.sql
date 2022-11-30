-- CREATE.SQL: initialize the tables in the database

-- Drop our tables initially on each initialization
-- DROP TABLE IF EXSISTS users_to_dailys CASCADE; DROP TABLE IF EXSISTS users_to_randoms CASCADE; DROP TABLE IF EXSISTS dailychallenges CASCADE; DROP TABLE IF EXISTS users CASCADE; DROP TABLE IF EXISTS randchallenges CASCADE;
-- Definetly don't do this in production!


-- TODO: Deck Datatype
-- Would help streamline dailychallenges and have option to store and create custom challenge pool


-- create a new table to convert from a user's serial ID to the challenge ID based on
-- if they have seen the challenge or completed it (DAILY)
CREATE TABLE IF NOT EXISTS users_to_dailys(
  user_id SMALLINT,
  challenge_id SMALLINT,
  is_completed BOOLEAN
);

-- create a new table users, with columns for email and password
-- Add a userid serial, streak infromation, and daily challenge information
-- Include a method to store the user's clash royale tag
CREATE TABLE IF NOT EXISTS users(
  user_id SERIAL PRIMARY KEY,
  email VARCHAR(60),
  username VARCHAR(60),
  password CHAR(60) NOT NULL,
  current_streak SMALLINT,
  max_streak SMALLINT,
  daily_challenges_completed SMALLINT,
  random_challenges_completed SMALLINT,
  clash_tag VARCHAR(15)
);

-- create a new table to store RANDOM challenges that have been given out
-- store the average cost of the deck independantly for convenience
-- Store the ID of the cards for the clash royale API calls
CREATE TABLE IF NOT EXISTS randchallenges(
  challenge_id SERIAL PRIMARY KEY,
  challenge_name VARCHAR(60),
  average_cost REAL,
  fourcycle REAL,
  card_id_1 SMALLINT,
  card_id_2 SMALLINT,
  card_id_3 SMALLINT,
  card_id_4 SMALLINT,
  card_id_5 SMALLINT,
  card_id_6 SMALLINT,
  card_id_7 SMALLINT,
  card_id_8 SMALLINT,
  dothash BIGINT,
  dothash2 BIGINT,
  dothash3 BIGINT
);

-- create a new table to store DAILY challenges that have been given out
-- store the average cost of the deck independantly for convenience
-- Store the ID of the cards for the clash royale API calls
-- Store the date that the challenge was created 

CREATE TABLE IF NOT EXISTS dailychallenges(
  challenge_id SERIAL PRIMARY KEY,
  challenge_name VARCHAR(60),
  average_cost REAL,
  fourcycle REAL,
  card_id_1 SMALLINT,
  card_id_2 SMALLINT,
  card_id_3 SMALLINT,
  card_id_4 SMALLINT,
  card_id_5 SMALLINT,
  card_id_6 SMALLINT,
  card_id_7 SMALLINT,
  card_id_8 SMALLINT,
  challenge_date DATE
);

-- create table to story BAD challenges that have been created
-- stroe the name of the BAD challenge deck
-- store the average cost of the BAD challenge deck
-- store the fourcycle cost of the BAD challenge deck
-- store the ID of the 8 cards in the deck for the clash royale API calls

CREATE TABLE IF NOT EXISTS badchallenges(
  challenge_id SERIAL PRIMARY KEY,
  challenge_name VARCHAR(60),
  average_cost REAL,
  fourcycle REAL,
  card_id_1 SMALLINT,
  card_id_2 SMALLINT,
  card_id_3 SMALLINT,
  card_id_4 SMALLINT,
  card_id_5 SMALLINT,
  card_id_6 SMALLINT,
  card_id_7 SMALLINT,
  card_id_8 SMALLINT
);

-- create a new table to convert from a user's serial ID to the challenge ID based on
-- if they have seen the challenge or completed it (RANDOM)
CREATE TABLE IF NOT EXISTS users_to_randoms(
  user_id SMALLINT,
  challenge_id SMALLINT,
  is_completed BOOLEAN
);

-- create a new table cards to store cards and relevent information

CREATE TABLE IF NOT EXISTS cards(
  -- Data Fields from API
  card_id SERIAL PRIMARY KEY,
  card_name VARCHAR(60) UNIQUE NOT NULL,
  clash_id INT,
  max_level SMALLINT,
  cost SMALLINT,
  -- Calculated Data
  daily_challenge_use_count SMALLINT,
  usage SMALLINT,
  winrate SMALLINT,
  -- image
  icon_url VARCHAR(360)
);

-- create a new table attributes, that holds and controls all custom data associated with cards
CREATE TABLE IF NOT EXISTS attributes(
  atribute_id SERIAL PRIMARY KEY,
  attribute VARCHAR(120) UNIQUE NOT NULL
);

-- cards to attributes
CREATE TABLE IF NOT EXISTS cards_to_attributes(
  atribute_name SMALLINT,
  card_name SMALLINT
);

