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
  db.any(query, [
      username,
  ]).then(async function(user) {
      const match = await bcrypt.compare(req.body.password, user[0].password);
      if(match){
        req.session.user = {
            username: username,
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
  const query = `INSERT INTO users (username, email, clash_tag, password)
  values ($1, $2, $3, $4);`
  
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

// GET request to /random (for testing's sake)
app.get('/random', (req, res) => {
  // Render the RANDOM CHALLENGE page
  // Parse the request headers to see if the user is attempting to render a pre-existing challenge
  const challengeID = Number(req.query.randomid);

  // Check to see if an id was queried. If not, render the page for just a button
  if (challengeID && challengeID != null) {
    // If a query was given, we need to now check the database for this challenge
    // Create a query for the database
    const randomQuery = `SELECT * FROM randchallenges WHERE challenge_id = '${challengeID}'`;

    // Create a variable to store the strings of urls to render
    let urlArray;
    
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
          res.render('pages/newrandom', {
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
            if(!data[0]) {
              res.render('pages/newrandom', {
                error: true,
                message: "The challenge could not be properly accessed. Please try again later."
              })
            }
            // CASE 4: It all works out nicely! Great!
            // With the data, render the page
            res.render('pages/random', {
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
    res.render('pages/newrandom');
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
    const clashTag = '#LJV98808';
    const tag = clashTag.replace('#', '%23');


    const battlelog = await axios({
        
        url: `https://api.clashroyale.com/v1/players/${tag}/battlelog`,
            method: 'get',
            dataType:'json',
            headers: {
                "Authorization": `Bearer ${process.env.API_KEY}`,
            }
        })
        .catch(error => { //If there is an error here it most likely will be with the tag registered in the users account so it sends the appropriate message
            console.log(error);
            res.render('pages/home', {
                message: 'Not able to find player with your clash royale tag. Please check your tag and change it if needed in account page', 
                username: req.session.user.username,
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
    
    
    axios({
        
        url: `https://api.clashroyale.com/v1/players/${tag}`,
            method: 'get',
            dataType:'json',
            headers: {
                "Authorization": `Bearer ${process.env.API_KEY}`,
                
            }
        })
        .then(results => {
            //console.log(results); // the results will be displayed on the terminal if the docker containers are running
            res.render('pages/home', {
                results: results,
                battlelog: battlelog,
                clanRankings: clanRankings,
                worstClanInfo: worstClanInfo,
                username: req.session.user.username
            });
        })
        .catch(error => { //an error could occur if the incorrect clash royale tag is associated with the account so the eroor message reflects that
            // Handle errors
            //console.log(error);
            res.render('pages/home', {
                message: 'Uh Oh looks like something went wrong with your tag (please check your clash royale user tag and make changes if needed)',
                username: req.session.user.username,
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
  res.render('pages/account',);
});

app.listen(3000);
console.log('Server is listening on port 3000');