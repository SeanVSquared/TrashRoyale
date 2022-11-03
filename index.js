const express = require('express');
const app = express();
const pgp = require('pg-promise')();
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const axios = require('axios');

// database configuration
const dbConfig = {
    host: 'db',
    port: 5432,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
  };
  
  const db = pgp(dbConfig);
  
// test your database
db.connect()
    .then(obj => {
        console.log('Database connection successful'); // you can view this message in the docker compose logs
        obj.done(); // success, release the connection;
    })
    .catch(error => {
        console.log('ERROR:', error.message || error);
});

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(
    session({
      secret: process.env.SESSION_SECRET,
      saveUninitialized: false,
      resave: false,
    })
  );
  
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
);

app.get('/register', (req, res) => {
    res.render('pages/register');
});

app.get('/login', (req, res) => {
    res.render('pages/login');
});

app.get('/discover', async (req, res) => {
    console.log(req.session.user.api_key)
    axios({
        url: `https://app.ticketmaster.com/discovery/v2/events.json`,
        method: 'GET',
        dataType:'json',
        params: {
            "apikey": req.session.user.api_key,
            "keyword": "NHL", //you can choose any artist/event here
            "size": 10,
        },
    })
    .then(results => {
        console.log(results.data._embedded)
        res.render('pages/discover', {results, });
    // Send some parameters
    })
    .catch(error => {
        // Handle errors
        console.log("error in get discover")
        res.render("pages/discover", {results: []});
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.render('pages/login', {
        message: `Successfully logged out`,
    });
});

// Register submission
app.post('/register', async (req, res) => {
    //the logic goes here
    const username = req.body.username;
    const hash = await bcrypt.hash(req.body.password, 10);
    const query = `INSERT INTO users (username, password)
    values ($1, $2);`
    db.any(query, [
        username,
        hash
    ]).then(function (data) {
        res.redirect('/login');
    })
    .catch(err => {
        console.log(err);
        res.redirect('/register');
    })
});

app.post('/login', async (req, res) => {
    //the logic goes here
    const username = req.body.username;
    const query = `SELECT * FROM users WHERE username = $1;`;
    db.any(query, [
        username,
    ]).then(async function(user) {
        const match = await bcrypt.compare(req.body.password, user[0].password); //await is explained in #8
        if(match){
            req.session.user = {
                api_key: process.env.API_KEY,
            };
            req.session.save();
            res.redirect('/discover')
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

// Authentication Middleware.
const auth = (req, res, next) => {
    if (!req.session.user) {
      // Default to register page.
      return res.redirect('/register');
    }
    next();
};
  
// Authentication Required
app.use(auth);



app.listen(3000);
console.log('Server is listening on port 3000');