const express = require('express');
const app = express();
const pgp = require('pg-promise')();
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const axios = require('axios');

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

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: false,
        resave: false,
    })
);

app.use(bodyParser.json());

app.use(express.static(__dirname + '/resources'));

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

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