
-- CREATE FUNCTION delete_attributes() RETURNS void
-- AS 'DELETE FROM emp WHERE salary < 0;'
-- LANGUAGE SQL;

-- CREATE FUNCTION get_card_id_by_name(_card_name VARCHAR(60)) RETURNS SMALLINT
-- LANGUAGE plpgsql
-- AS
-- $$
-- DECLARE  
--   ret SMALLINT;  
-- BEGIN
--   SELECT card_id
--   INTO ret
--   FROM cards
--   WHERE card_name = _card_name;
--   RETURN ret.card_id;
-- END;
-- $$;

-- CREATE FUNCTION get_attributes()

CREATE PROCEDURE add_card_attributes(card_name VARCHAR(60), attribute_ids VARCHAR(120)[])
LANGUAGE plpgsql
BEGIN ATOMIC
  FOREACH attribute_id IN attribute_ids $1
  LOOP
    INSERT INTO attributes VALUES (attribute_id);
    --INSERT INTO cards_to_attributes VALUES (card_id);
  END LOOP;
END;


-- Test
-- INSERT INTO attributes (attribute) VALUES
-- ('ranged'),
-- ('spell'),
-- ('bean burrito');
-- ALTER TABLE
INSERT INTO cards (card_name, cost) VALUES ('Giant', 5);
INSERT INTO cards (card_name, cost) VALUES ('Hog Rider', 4);
INSERT INTO cards (card_name, cost) VALUES ('Elixer Golemn', 3);
INSERT INTO cards (card_name, cost) VALUES ('Ice Spirit', 1);
INSERT INTO cards (card_name, cost) VALUES ('Musketeer', 4);

INSERT INTO attributes (attribute) VALUES
('ranged'),
('spell'),
('bean burrito');

-- SELECT get_card_id_by_name("Hog Rider");

CALL add_card_attributes(99, '{"a","b","c"}');
