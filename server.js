const express = require('express')
const session = require('express-session');

var cors = require('cors')

const mysql = require('mysql')
const app = express()
const router = express.Router()
const bodyParser = require('body-parser')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
//const db = require('./db.js') 
//require('./passportStuff');
const db = require('./db.js')

app.use(cors())

// parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//mandatory passport/js middleware
app.use(session({ secret: 'some-random-string', saveUninitialized: true, resave: false, cookie: {secure: false} }));
app.use(passport.initialize())
app.use(passport.session());

passport.use(
  new LocalStrategy(
  function(username, password, done) {
      db.getConnection(function(err, connection) {
          if (err) throw err;
          connection.query(
          `SELECT * FROM users WHERE username = "${username}" && password="${password}"`,
          function (err, dbResponse) {
              if(err) {
                  return done(err)
              }
              else{
                  console.log("let's check if we got the user_id")      
                  if (dbResponse[0]) {
                      console.log(dbResponse[0].user_id)
                      done(null, dbResponse[0].user_id)
                  } else {
                       done(null, "invalid credentials")
                  }
              }
          })
      });
  })
)

// used to serialize the user for the session
passport.serializeUser(function(userId, done) {
  
  console.log('the user.id is ' + userId)
  done(null, userId);
});

//used to deserialize the user
passport.deserializeUser(function(id, done) {
  
  console.log("let's check to deserialize!")
  
  db.getConnection(function(err, connection) {
      if (err) throw err;
      connection.query(
      `SELECT * from users WHERE user_id =  ${id}`,
      function (err, dbResponse) {
          if(err) {
              return done(err)
          }
          else{
              console.log("let's check if the id matches in the database")      
              if (dbResponse[0]) {
                  console.log(dbResponse[0])
                  done(null, dbResponse[0])
              } else {
                   done(null, "invalid credentials")
              }
          }
      })
  })
});

app.get('/auth/check', (req, res) => {
  if (!req.user) {
    return res.sendStatus(401)
  } else {
    return res.status(200).send(req.user)
  }
});









//hello world
app.get('/hello', function (req, res) {
  console.log("hello, ", req.user)
  res.send('the Appli API is functioning')
})

//get all users
app.get('/users/all', function (req, res,) {

  db.getConnection(function(err, connection) {
    if (err) throw err; 
    connection.query("SELECT * FROM users", function (err, dbResponse) {
      connection.release();
      if(err) {
          console.log("error: ", err) 
      }
      else{
        console.log("good job")
        res.send(dbResponse)        
      }
    })
  }); 
})

//check if new username is unique
app.get('/checkuniquename/:username', (req, res) => {

  let newUsername = req.params.username

  db.getConnection(function(err, connection) {
    if (err) throw err;
    connection.query(`SELECT * FROM users WHERE username = "${newUsername}"`,
      function (err, dbResponse) {
        if(err) {
            console.log("error: ", err) 
        }
        else{
          if (dbResponse[0]) {
            res.send(false)
          }
          else {
            res.send(true)}
        }
      })  
  });

})

//attempt to log in
app.post('/login', passport.authenticate('local', { failureRedirect: '/' }),
  function(req, res) {
    console.log(req.session.user_id)
    req.session.user_id = 1
    console.log(req.session.user_id)
    return res.sendStatus(200)
}); 

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

//create a new user
app.post('/createuser', (req, res) => {
  let username = req.body.username
  let password = req.body.password
  console.log(`the body is ${username} and ${password}`)

  db.getConnection(function(err, connection) {
    if (err) throw err
    connection.query(`INSERT INTO users (username, password) VALUES ("${username}", "${password}")`,
      function (err, dbResponse) {
        if (err) {
          console.log("error: ", err)
        }
        else {
          res.send(dbResponse)
        }
      })
  })

})

//create a new job application ticket
app.post('/createticket', (req, res) => {
  let userId = req.body.userId,
      company = req.body.companyName,
      position = req.body.position,
      resumeLink = req.body.resumeLink,
      includesCoverLetter = req.body.includesCoverLetter ? 1 : 0,
      applicationNotes = req.body.applicationNotes,
      calledForInterview = req.body.calledForInterview ? 1 : 0,
      jobOffered = req.body.jobOffered ? 1 : 0,
      acceptedOffer = req.body.acceptedOffer ? 1 : 0,
      archived = false;

  db.getConnection(function(err, connection) {
    if (err) throw err
    connection.query(`INSERT INTO appli_tickets 
    (user_id, company, position, resume_link, includes_cover_letter,
    application_notes, called_for_interview, job_offered, accepted_offer, archived) 
        VALUES (${userId}, "${company}", "${position}", "${resumeLink}", ${includesCoverLetter},
        "${applicationNotes}", ${calledForInterview}, ${jobOffered}, ${acceptedOffer}, ${archived})`,
      function (err, dbResponse) {
        if (err) {
          console.log("error: ", err)
        }
        else {
          res.send(dbResponse)
        }
      })
    })
  })

//gracefully shut down
process.on( 'SIGINT', () => {
  console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );
  // some other closing procedures go here
  db.end(function(err) {

  })
  process.exit( );
})



const PORT = 4242 
app.listen(PORT, () => {
    console.log(`listing on ${PORT}`)
})