// import the package express for API purposes
const express = require('express');
const app = express();

// Use pg-promise to make connections to the database as previously
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
    password: process.env.POSTGRES_PASSWORD,
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

//
app.use(express.static(__dirname + '/resources'));


//
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

// GET request to /random (for testing's sake)
app.get('/random', (req, res) => {
  // Render the RANDOM CHALLENGE page
  console.log("attempting to render page random");
  res.render('pages/random');
});

// GET Request for /home
app.get('/home', async (req, res) => {
    //console.log(req.session.user.api_key);
    //console.log(req.session.user.tag);
    const tag = '%23LJV98808';
    const battlelog = await axios({
        
        url: `https://api.clashroyale.com/v1/players/${tag}/battlelog`,
            method: 'get',
            dataType:'json',
            headers: {
                "Authorization": `Bearer ${process.env.API_KEY}`,
            }
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
            });
        })
        .catch(error => {
            // Handle errors
            console.log(error);
            res.render('pages/login', {
                message: 'Uh Oh looks like your account was not found', 
            })
        })

});

app.listen(3000);
console.log('Server is listening on port 3000');