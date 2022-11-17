-- insert.sql
-- Purpose: Add test data and manual attributes for cards and attributes 


-- Test Dummy Attribute Data
INSERT INTO attributes (attribute) VALUES
('ranged'),
('spell'),
('bean burrito');


-- Test Dummy Card Data
INSERT INTO cards (card_name, cost, icon_url, max_level) VALUES ('Knight', 1, 'https://api-assets.clashroyale.com/cards/300/jAj1Q5rclXxU9kVImGqSJxa4wEMfEhvwNQ_4jiGUuqg.png', 5),
('Archers', 2, 'https://api-assets.clashroyale.com/cards/300/W4Hmp8MTSdXANN8KdblbtHwtsbt0o749BbxNqmJYfA8.png', 6),
('Goblins', 3, 'https://api-assets.clashroyale.com/cards/300/X_DQUye_OaS3QN6VC9CPw05Fit7wvSm3XegXIXKP--0.png', 7),
('Giant', 4, 'https://api-assets.clashroyale.com/cards/300/Axr4ox5_b7edmLsoHxBX3vmgijAIibuF6RImTbqLlXE.png', 8),
('P.E.K.K.A', 5, 'https://api-assets.clashroyale.com/cards/300/MlArURKhn_zWAZY-Xj1qIRKLVKquarG25BXDjUQajNs.png', 9),
('Minions', 6, 'https://api-assets.clashroyale.com/cards/300/yHGpoEnmUWPGV_hBbhn-Kk-Bs838OjGzWzJJlQpQKQA.png', 10),
('Balloon', 7, 'https://api-assets.clashroyale.com/cards/300/qBipxLo-3hhCnPrApp2Nn3b2NgrSrvwzWytvREev0CY.png', 11),
('Witch', 8, 'https://api-assets.clashroyale.com/cards/300/cfwk1vzehVyHC-uloEIH6NOI0hOdofCutR5PyhIgO6w.png', 12);


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
