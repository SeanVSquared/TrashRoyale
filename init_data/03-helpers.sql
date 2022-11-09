-- helpers.sql

/* 
  Purpose: Instantiate and document all postgresql functions and procedures to auto handle 
    edge cases, key value table mismatches, make updating, fetching, and sorting cards much
    easier.
*/

/*

HELPERS DOCUMENTATION: (TODO):

TODO (high-prio): add_attribute_to_card(card_name/id, attribute_name)
  - get card id if exists, else FAIL
  - add attribute if DNE
  - select attribute id
  - key value (card_id, attribute_id)

TODO (high-prio): get_cards_with_attribute(attribute_name)
  - get attribute_id if exists, else FAIL
  - select all card id from cards_to_attributes WHERE attribute_id = attribute_id
  - return select of all cards that have attribute = attribute_name

TODO (med-low-prio): pull_card_from_api()
  - given clash royale api data for a specific card
  - if card name DNE, add card to cards with id from API
  - update all card values with the ones from the api

TODO (low-prio): delete_attribute_from_card(card_name/id, attribute_name)
  - get card id if exists, else FAIL
  - add attribute if DNE
  - select attribute id
  - key value (card_id, attribute_id)

TODO (low-prio): delete_attribute_from_all_cards(attribute_name)
  - remove atribute from attributes
  - remove all attribute references from cards_to_attributes

TODO: QOL Helper Procedures (Low Priority): (Hard code first and then transform the queries into views/procedures/functions)
  - TODO: card view function to view all card data 
  - TODO: card add function to update manual data from JSON
  - TODO: card add and merge function with API data and manual data

  _card_name VARCHAR(60)

*/

CREATE OR REPLACE FUNCTION get_num_cards()
  RETURNS int AS
$$
  DECLARE
    -- variable declaration
    card_count int;
  BEGIN
    -- logic
    SELECT COUNT(*) INTO card_count FROM cards;
    RETURN card_count;
  END;
$$ LANGUAGE plpgsql;
