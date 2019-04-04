const express = require('express')
const session = require('express-session');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const keys = require('./keys')

var cors = require('cors')

const mysql = require('mysql')
const app = express()
const router = express.Router()
const bodyParser = require('body-parser')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
//const db = require('./db.js') 
require('./passportStuff');
const db = require('./db.js')

app.use(cors())

// parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

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
  console.log("we're about to check if the username exists")
  db.getConnection(function(err, connection) {
    connection.release();

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
app.post('/login', function(req, res) {
  
  const username = req.body.username
  const password = req.body.password
  
  db.getConnection(function(err, connection) {
    connection.release();

    if (err) throw err;
    connection.query(`SELECT * FROM users WHERE username = "${username}"`, function (err, user) {
      console.log(`here is the hash in the db: ${user[0].password}`)
      
      if(err || !user) {
        return res.status(404).json({username: 'User not found'})
      }

      console.log('we will compare: ', password, user[0].password)
      
      bcrypt.compare(password, user[0].password, (err, result) => {
        
        if(err) {console.log(err)}

        if (result) {
          console.log("Passwords match")

          // Create JWT Payload
          const payload = { id: user[0].user_id, name: user[0].username } 

          // Sign and send out the token
          jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 }, (err, token) => {
            
            res.json({success: true, token:  token,})
          
          });

        }
        else {
          
          return res.status(404).json({username: `password doesn't match`})
        }
      })
    })
  });
});

app.get('/isauthorized', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json(req.user)
})

app.get('/currentuser', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json(req.user)
})

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

//create a new user
app.post('/createuser', (req, res) => {
  let username = req.body.username
  let password = req.body.password
  console.log(`the body is ${username} and ${password}`)

  bcrypt.hash(password, 10, function(err, hash) {
    // Store hash in your password DB.
    console.log(hash)
    db.getConnection(function(err, connection) {
      //connection.release();

      if (err) throw err
      connection.query(`INSERT INTO users (username, password) VALUES ("${username}", "${hash}")`,
        function (err, dbResponse) {
          connection.release();
          if (err) {
            console.log("error: ", err)
          }
          else {
            
            console.log(dbResponse)
            res.send(dbResponse)
          }
        })
    })
  });
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
      archived = req.body.archived;

  db.getConnection(function(err, connection) {
    connection.release();

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

//Retrieve tickets from DB by user_id
app.get('/retrievetickets/:archived', passport.authenticate('jwt', { session: false }), (req,res) =>{

  db.getConnection(function(err, connection) {
    connection.release();

    let sqlString
    
    if (req.params.archived == "showarchived") {
      sqlString = `SELECT * FROM appli_tickets WHERE ${req.user[0].user_id} = user_id`

    }
    else {
      sqlString = `SELECT * FROM appli_tickets WHERE ${req.user[0].user_id} = user_id AND archived = 0`

    }

    if (err) throw err
    connection.query(sqlString, function (err, dbResponse) {
        if (err) {
          console.log("error: ", err)
        }
        else {
          res.send(dbResponse)
        }
      })
  })
})

//Retrieve one ticket by ticket_id
app.get('/retrieveticketbyid/:ticket_id', (req, res) => {
  db.getConnection(function(err, connection) {
    connection.release();

    if (err) throw err
    connection.query(`SELECT * FROM appli_tickets WHERE ticket_id = ${req.params.ticket_id}`,
      function (err, dbResponse) {
        if (err) {
          console.log("error: ", err)
        }
        else {
          res.send(dbResponse)
        }
      }
    )
  })
})

//Update Ticket in DB
app.put('/updateticket/:ticket_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  let ticketId = req.params.ticket_id,
      company = req.body.companyName,
      position = req.body.position,
      resumeLink = req.body.resumeLink,
      includesCoverLetter = req.body.includesCoverLetter ? 1 : 0,
      applicationNotes = req.body.applicationNotes,
      calledForInterview = req.body.calledForInterview ? 1 : 0,
      jobOffered = req.body.jobOffered ? 1 : 0,
      acceptedOffer = req.body.acceptedOffer ? 1 : 0,
      archived = req.body.archived ? 1 : 0;

      db.getConnection(function(err, connection) {
        connection.release();
    
        if (err) throw err
        connection.query(
          `UPDATE appli_tickets 
          SET company = "${company}", position = "${position}", resume_link = "${resumeLink}",
          includes_cover_letter = ${includesCoverLetter}, application_notes = "${applicationNotes}",
          called_for_interview = ${calledForInterview}, job_offered = ${jobOffered},
          accepted_offer = ${acceptedOffer}, archived = ${archived}
          WHERE ticket_id = ${ticketId}`,
          function (err, dbResponse) {
            if (err) {
              console.log("error: ", err)
            }
            else {
              console.log('we updated the ticket')
              res.send(dbResponse)
            }
          })
      })



})

//Delete Ticket in DB
app.delete('/deleteticket/:ticket_id', passport.authenticate('jwt', { session: false }), (req, res) =>{

  let ticketId = req.params.ticket_id

  db.getConnection(function(err, connection) {
    connection.release();

    if (err) throw err
    connection.query(`DELETE FROM appli_tickets WHERE ticket_id = ${ticketId}`,
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