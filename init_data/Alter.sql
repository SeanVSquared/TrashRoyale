-- ALTER.SQL: alter the existing tables to define intertable relations

-- change the users to daily challenges table to define foreign keys
ALTER TABLE users_to_randoms
ADD CONSTRAINT user_id FOREIGN KEY (user_id) REFERENCES users (user_id);
ALTER TABLE users_to_randoms
ADD CONSTRAINT challenge_id FOREIGN KEY (challenge_id) REFERENCES randchallenges (challenge_id);

-- change the users to daily challenges table to define foreign keys
ALTER TABLE users_to_dailys
ADD CONSTRAINT user_id FOREIGN KEY (user_id) REFERENCES users (user_id);
ALTER TABLE users_to_dailys
ADD CONSTRAINT challenge_id FOREIGN KEY (challenge_id) REFERENCES dailychallenges (challenge_id);


-- Test
INSERT INTO attributes (attribute) VALUES('One'),('two');