const express = require('express')
var cors = require('cors')

const mysql = require('mysql')
const app = express()
const bodyParser = require('body-parser')

const db = mysql.createPool({
  connectionLimit : 20,
  host            : 'us-cdbr-iron-east-03.cleardb.net',
  user            : 'bbf3049ec788cd',
  password        : 'c3a0d3b8',
  database        : 'heroku_125e5b843934f78'
});

db.getConnection(function(err) {
  if (err) throw err;

});


// Cors
app.use(cors())

// parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


//hello world
app.get('/', function (req, res) {
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
app.get('/login', (req, res) => {

  let username = req.query.username
  let password = req.query.password

  db.getConnection(function(err, connection) {
    if (err) throw err;
    connection.query(
      `SELECT * FROM users WHERE username = ${username} AND password = ${password}`,
      function (err, dbResponse) {
        if(err) {
            console.log("error: ", err) 
        }
        else{
          console.log("let's check if the username and password match in the database")      
          if (dbResponse[0]) {
            console.log(true)
            res.send(dbResponse[0])
          }
          else {res.send(false)}
        }
      })  
  });
})

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

//create a new application ticket
app.post('/createticket', (req, res) => {
  let userId= null
  company= req.body.companyName
  position= req.body.position
  resumeLink= req.body.resumeLink
  includesCoverLetter= req.body.includesCoverLetter
  applicationNotes= req.body.applicationNotes
  calledForInterview= req.body.calledForInterview
  jobOffered= req.body.jobOffered
  acceptedOffer= req.body.acceptedOffer
  timeStamp= req.body.timeStamp
  archived= req.body.archived

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