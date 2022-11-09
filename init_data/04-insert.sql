-- insert.sql
-- Purpose: Add test data and manual attributes for cards and attributes 


-- Test Dummy Attribute Data
INSERT INTO attributes (attribute) VALUES
('ranged'),
('spell'),
('bean burrito');


-- Test Dummy Card Data
INSERT INTO cards (card_name, cost) VALUES ('Giant', 5);
INSERT INTO cards (card_name, cost) VALUES ('Hog Rider', 4);
INSERT INTO cards (card_name, cost) VALUES ('Elixir Golemn', 3);
INSERT INTO cards (card_name, cost) VALUES ('Ice Spirit', 1);
INSERT INTO cards (card_name, cost) VALUES ('Musketeer', 4);


-- TODO DANIEL: Attributes:

-- Spell
-- Ranged
-- Melee
-- Cheap
-- Expensive
-- Woman
-- Man
-- Mounted
-- Fast
-- Slow
-- Death Effect
-- Win Condition
-- Goblin
-- Tank
-- Common
-- Rare
-- Epic
-- Legendary
-- Champion
-- Single Target
-- Splash
-- Building
-- Spirit
-- Skeleton
-- Swarm
-- Flying
-- Grounded
-- Multiple Attack Types
-- Dash
-- Cross Map Range


-- TODO Daniel: Card Stats:

-- Hitpoints
-- Damage
-- Damage per Second
-- Death Damage
-- Area Damage
-- Crown Tower Damage
-- Ranged Damage
-- Radius
-- Lifetime
-- Freeze Duration
-- Width
-- Deploy Slow Duration
-- Spawn Damage
-- Dash Damage
-- Dash Range
-- Targets
-- Hit Speed
-- Speed
-- Range
