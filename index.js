// import the package express for API purposes
const express = require('express');
const app = express();

// Use pg-promise to make connections to the base as previously
const pgp = require('pg-promise')();
const bodyParser = require('body-parser');

// package to help set the session object. USE req.session!
const session = require('express-session');

// Package to hash user passwords (very important!)
const bcrypt = require('bcrypt');

// Package Axios: Make HTTP requests to an external server from our server
const axios = require('axios');
const { homedir } = require('os');

// database configuration
const dbConfig = {
  host: 'db',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD
};

// Use pg-promise and make a handy shorthand constant
const db = pgp(dbConfig);

// Database connection test
db.connect()
  .then(obj => {
    // If the connection is successful, print to the console
    console.log('Database connection successful');
    // use the done function to close the database connection
    obj.done();
  })
  .catch(error => {
    // If there are any errors, print them to the console
    console.log('ERROR:', error.message || error);
});

// Set the view engine to EJS
app.set('view engine', 'ejs');



// Initializing Session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

// Specify that we are using json to parse the body of a request
app.use(bodyParser.json());

// Necessary code to serve static files such as images
app.use(express.static('resources'));
app.use('/images', express.static('resources/imgs'));

//
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.get('/login', (req, res) => {
    res.render('pages/login');
});

app.post('/login', async (req, res) => {

  //the logic goes here
  console.log(req.body)
  const username = req.body.username;
  const query = `SELECT * FROM users WHERE username = $1;`;
  const user = await db.any(query, [username]);
  
  db.any(query, [
      username,
  ]).then(async function(user) {
      const match = await bcrypt.compare(req.body.password, user[0].password);
      if(match){
        // If the passwords match, update the session to include information about the user
        req.session.user = {
            username: username,
            tag: user[0].clash_tag,
            user_id: user[0].user_id,

            //Only used for account page
            email: user[0].email,
            current_streak: user[0].current_streak,
            max_streak: user[0].max_streak,
            daily_challenges_completed: user[0].daily_challenges_completed,
            random_challenges_completed: user[0].random_challenges_completed
        }
          req.session.save();
          res.redirect('/home')
      }
      else{
          res.render('pages/register', {
              message: `incorrect username or password`,
          });
      }
  })
  .catch(err => {
      console.log(err);
      res.redirect('/register');
  })

});

app.get('/register', (req, res) => {
    res.render('pages/register');
});


// Register submission
app.post('/register', async (req, res) => {
  //the logic goes here
  console.log(req.body)
  const username = req.body.username;
  const email = req.body.email
  const clash_tag = req.body.clashTag
  console.log(clash_tag)
  const hash = await bcrypt.hash(req.body.password, 10);
  console.log(hash)
  const query = `INSERT INTO users (username, email, clash_tag, password, random_challenges_completed)
  values ($1, $2, $3, $4, 0);`
  
  db.any(query, [
      username, email, clash_tag,
      hash
  ]).then(function (data) {
      res.redirect('/login');
  })
  .catch(err => {
      console.log(err);
      res.redirect('/register');
  })
});

// GET request to /random
app.get('/random', (req, res) => {
  // Render the RANDOM CHALLENGE page
  // Parse the request headers to see if the user is attempting to render a pre-existing challenge
  const challengeID = Number(req.query.randomid);

  // Check to see if an id was queried. If not, render the page for just a button
  if (challengeID && challengeID != null) {
    // If a query was given, we need to now check the database for this challenge
    // Create a query for the database
    const randomQuery = `SELECT * FROM randchallenges WHERE challenge_id = '${challengeID}'`;

    // Query the database with this request in task form for multiple queries
    db.task(task => {
      // Query the database for the challenge ID
      return task.any(randomQuery)
      .then(data => {
        // We now have the data output, so we need to handle a few cases
        let challenge = data[0];
        // CASE 1: The data is null. This means that a challenge with this ID does not exist
        if(!challenge) {
          // Render the new random page with a message stating that the challenge could not be found
          // console.log("Could not find a challenge of ID: " + challengeID);
          // Deliver a message to the page
          // Check if a user is logged in, and if they are, display their completion on this challenge
          if(req.session.user && req.session.user != null) {
            res.render('pages/newrandom', {
              // Render the page with the users information and the error message
              error: true,
              message: "A challenge of this ID does not exist.",
              username: req.session.user.username
            })
          } else {
            // Render the page with the error, but without the user's information
            res.render('pages/newrandom', {
              error: true,
              message: "A challenge of this ID does not exist."
            })
          }
          
        }
        else {
          // CASE 2: we should now attempt to render this challenge
          // Call the database with each card's ID to get it's information
          const queryImage = `SELECT * FROM cards WHERE card_id IN ($1, $2, $3, $4, $5, $6, $7, $8)`

          // Query for each Card with an In statement
          return task.any(queryImage, [challenge.card_id_1, challenge.card_id_2, challenge.card_id_3, challenge.card_id_4, challenge.card_id_5, challenge.card_id_6, challenge.card_id_7, challenge.card_id_8])
          .then(data => {
            // CASE 3: Bad card data
            // If the data is null, something went wrong when trying to find the cards. Render the newrandom page with an error message
            if(!data[0]) {
              res.render('pages/newrandom', {
                error: true,
                message: "The challenge could not be properly accessed. Please try again later."
              })
            }
            // CASE 4: It all works out nicely! Great!
            let cardData = data;
            // Check if a user is logged in, and if they are, display their completion on this challenge
            if(req.session.user && req.session.user != null) {
              
              // Get the number of random challeenges completed
              return task.any(`SELECT random_challenges_completed FROM users WHERE user_id = ${req.session.user.user_id}`)
              .then(data => {
                // Set this value into a variable for later user
                let numChallengesCompleted = data[0].random_challenges_completed;

                // Query the DB to see if the user has attempted this challenge
                const queryUserToChl = `SELECT * FROM (SELECT * FROM users_to_randoms WHERE user_id = ${req.session.user.user_id}) AS userchallenges WHERE challenge_id = ${challengeID}`;
                return task.any(queryUserToChl)
                .then(data => {
                  // Check if a return from the DB was made
                  if(data[0]) {
                    // If a return was made, render the page with the user's completion progress
                    res.render('pages/random', {
                      // Give the card data
                      data: cardData,
                      isLoggedIn: true,
                      username: req.session.user.username,
                      isCompleted: data[0].is_completed,
                      numChallengesCompleted: numChallengesCompleted
                    });
                  } else {
                    // If nothing was returned from the DB, the user has not attempted this challenge yet. Insert into the DB that they are now attempting this challenge
                    return task.any(`INSERT INTO users_to_randoms (user_id, challenge_id, is_completed) values (${req.session.user.user_id}, ${challengeID}, true) RETURNING is_completed`)
                    .then(data => {
                      //console.log("User tried to see a challenge logged in, and they have been added to this challenge. Completion: " + data[0])
                      // With the user now linked to the challenge, render the page along with their completion
                      res.render('pages/random', {
                        // Give the card data
                        data: cardData,
                        isLoggedIn: true,
                        username: req.session.user.username,
                        isCompleted: data[0].is_completed,
                        numChallengesCompleted: numChallengesCompleted
                      });
                    })
                  }
                })

              })

            } else {
              // If a user is not logged in, render the page, but give the option to sign in to save challenge progress
              // With the data, render the page
              res.render('pages/random', {
                // Give the card data
                data: cardData,
                isLoggedIn: false
              });
            }

          })
          
        }

      })
    })

  }
  else {
    // Check if a user is logged in
    if(req.session.user && req.session.user != null) {
      // Render the page to create a new random challenge passing the information needed for the header
      res.render('pages/newrandom', {
        username: req.session.user.username,
      });
    } else {
      // If a challenge ID was not provided, or was given as null, render the page to create a new random challenge without an error
    res.render('pages/newrandom');
    }
  }

});

app.post('/bad', (req, res) => {

    const getRandBad = 'SELECT challenge_id FROM badchallenges OFFSET floor(random() * (SELECT COUNT(*) FROM badchallenges)) LIMIT 1;'

    db.task(task => {
        return task.any(getRandBad)
            .then(data => {
                res.redirect('/bad?badid=' + data[0].challenge_id);
            })
    })

});


// GET request to /random (for testing's sake)
app.get('/bad', (req, res) => {

    // Parse the request headers to see if the user is attempting to render a pre-existing challenge
    const badChallID = Number(req.query.badid);

    // Check to see if an id was queried. If not, render the page for just a button
    if (badChallID && badChallID != null) {
        // If a query was given, we need to now check the database for this challenge
        // Create a query for the database
        const badQuery = `SELECT * FROM badchallenges WHERE challenge_id = '${badChallID}'`;

        // Create a variable to store the strings of urls to render
        let imageArray;

        // Query the database with this request in task form for multiple queries
        db.task(task => {
            // Query the database for the challenge ID
            return task.any(badQuery)
                .then(data => {
                    // We now have the data output, so we need to handle a few cases
                    let challenge = data[0];
                    // CASE 1: The data is null. This means that a challenge with this ID does not exist
                    if (!challenge) {
                        // Render the new random page with a message stating that the challenge could not be found
                        // console.log("Could not find a challenge of ID: " + challengeID);
                        // Deliver a message to the page
                        console.log('Id not found in table');
                        res.render('pages/baddecksDefault', {
                            error: true,
                            message: "A challenge of this ID does not exist."
                        })
                    }
                    else {
                        // CASE 2: we should now attempt to render this challenge
                        // Call the database with each card's ID to get it's information
                        const queryImage = `SELECT * FROM cards WHERE card_id IN ($1, $2, $3, $4, $5, $6, $7, $8)`

                        // Query for each Card with an In statement
                        return task.any(queryImage, [challenge.card_id_1, challenge.card_id_2, challenge.card_id_3, challenge.card_id_4, challenge.card_id_5, challenge.card_id_6, challenge.card_id_7, challenge.card_id_8])
                            .then(data => {
                                // CASE 3: Bad card data
                                // If the data is null, something went wrong when trying to find the cards. Render the newrandom page with an error message
                                if (!data[0]) {
                                    res.render('pages/baddecksDefault', {
                                        error: true,
                                        message: "The challenge could not be properly accessed. Please try again later."
                                    })
                                }
                                // CASE 4: It all works out nicely! Great!
                                // With the data, render the page
                                console.log(data);
                                res.render('pages/baddecks', {
                                    // Give the card data
                                    data: data
                                });

                            })

                    }

                })
        })

    }
    else {
        // If a chaallenge ID was not provided, or was given as null, render the page to create a new random challenge without an error
        res.render('pages/baddecksDefault');
        console.log('Id not provided');
    }

});
// Get Request to update and test card database
// TODO: turn into a better form to update card data dynamically
// TODO: add functionality to dynamically add attributes to cards through UI
app.get('/cards', (req, res) => {
    console.log("GET/cards");

    // Query to list cards
    const query = 'SELECT * FROM CARDS';

    db.any(query)
        .then(cards => {
        console.log(cards);
        res.render('pages/cards', {
            cards,
            title: "Cards",
        });
        })
        .catch(error => {
        res.render('pages/cards', {
            error: true,
            message: error.message,
        });
        });
});

// Get Request to view and test attribute database 
app.get('/attributes', (req, res) => {
    console.log("GET/attributes");
    
    // TODO: Query to get attributes

    res.render('pages/attributes');
});

//Authentication Middleware
const auth = (req, res, next) => {
    if (!req.session.user) {
      // Default to register page.
        return res.redirect('/register');
    }
    next();
};

  // Authentication Required
app.use(auth);

// GET Request for /home
app.get('/home', async (req, res) => {
    //console.log(req.session.user.api_key);
    //console.log(req.session.user.tag);
    const clashTag = req.session.user.tag;
    console.log(clashTag);
    //const clashTag = '#LJV98808';
    const tag = clashTag.replace('#', '%23');
    
    
    axios({
        
        url: `https://api.clashroyale.com/v1/players/${tag}`,
            method: 'get',
            dataType:'json',
            headers: {
                "Authorization": `Bearer ${process.env.API_KEY}`,
                
            }
        })
        .then(async (results) => {
            //console.log(results); // the results will be displayed on the terminal if the docker containers are running
            const battlelog = await axios({
        
              url: `https://api.clashroyale.com/v1/players/${tag}/battlelog`,
                  method: 'get',
                  dataType:'json',
                  headers: {
                      "Authorization": `Bearer ${process.env.API_KEY}`,
                  }
              })
              .catch(error => { //If there is an error here it most likely will be with the tag registered in the users account so it sends the appropriate message
                  res.render('pages/home', {
                      error: error,
                      message: 'Not able to find player with your clash royale tag. Please check your tag and change it if needed in account page', 
                      username: req.session.user.username,
                      css: "home.css",
                  })
              })
      
              const clanRankings = await axios({
              
                  url: `https://api.clashroyale.com/v1/locations/57000006/rankings/clans`,
                      method: 'get',
                      dataType:'json',
                      headers: {
                          // Bearer apikey
                          "Authorization": `Bearer ${process.env.API_KEY}`,
                          // `Bearer ${req.session.user.api_key} does not work
                      }
                  })
                  .catch(error => {
                      console.log(error);
                      res.render('pages/home', { //Error should not happen here unless api_key is not valid so should not really have to worry about this
                          message: 'Error with retrieving clan rankings', 
                      })
                  })
      
              
                  var worstClan = clanRankings.data.items[998];
                  var worstClanTag = worstClan.tag.replace('#', '%23');
              
                  const worstClanInfo = await axios({
              
                  url: `https://api.clashroyale.com/v1/clans/${worstClanTag}`,
                      method: 'get',
                      dataType:'json',
                      headers: {
                          "Authorization": `Bearer ${process.env.API_KEY}`,
                      }
                  })
                  .catch(error => {
                      console.log(error);
                      res.render('pages/home', { //Error should not happen here unless api_key is not valid so should not really have to worry about this
                          message: 'Error retrieving clan rankings info', 
                      })
                  })
            res.render('pages/home', {
                results: results,
                battlelog: battlelog,
                clanRankings: clanRankings,
                worstClanInfo: worstClanInfo,
                username: req.session.user.username,
                title: "Home",
                css: "css/home.css",
            });
        })
        .catch(error => { //an error could occur if the incorrect clash royale tag is associated with the account so the erorr message reflects that
            // Handle errors
            //console.log(error);
            res.render('pages/home', {
                error: error,
                message: error.response.data.message,
                username: req.session.user.username,
                css: "css/home.css",
            })
        })

});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// GET request to /account (for testing's sake)
app.get('/account', (req, res) => {
  // Render the ACCOUNT page
  console.log("attempting to render page account");
  res.render('pages/account', {
        css: "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css",
  });
});

app.listen(3000);
console.log('Server is listening on port 3000');

// Function cantorPair: Implementation of the cantor pairing function to be used to create unique deck ID's
function cantorPair(a, b) {
  return 0.5 * (a + b) * (a + b + 1) * b;
}

// Function incrementUserChallengesCompleted: incrememnt the number of challenges completed in the database for some user
function incrementUserChallengesCompleted(user_id) {
  // First, query the database for the current number of challenges completed
  db.any(`SELECT count(*) FROM (SELECT * FROM users_to_randoms WHERE user_id = ${user_id})) WHERE is_completed = true`)
  .then(data => {
    console.log(data[0])
    // With this result, add 1, and reinsert into the database
    let newCompleted = data[0] + 1;
    return db.any(`UPDATE users SET random_challenges_completed = ${newCompleted} WHERE user_id = ${user_id} RETURNING random_challenges_completed`)
  })
  .catch(error => {
    // Catch any errors
    console.log(error)
  })
}