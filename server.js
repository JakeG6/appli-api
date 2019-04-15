const express = require('express')

//API routes
const login = require('./routes/login.js')
const updatePassword = require('./routes/updatePassword.js')
const createUser = require('./routes/createUser.js')
const createTicket = require('./routes/createTicket.js')
const updateTicket = require('./routes/updateTicket.js')
const checkUniqueName = require('./routes/checkUniqueName.js')
const retrieveTickets = require('./routes/retrieveTickets.js')
const retrieveTicketById = require('./routes/retrieveTicketById.js')
const deleteTicket = require('./routes/deleteTicket.js')

var cors = require('cors')

const app = express()
const bodyParser = require('body-parser')
const passport = require('passport')
require('./passportStuff')

const db = require('./db.js')

app.use(cors())

//parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get('/auth/check', (req, res) => {
  if (!req.user) {
    res.setHeader('Access-Control-Allow-Origin', 'https://appli-api.herokuapp.com/');

    return res.sendStatus(401)
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://appli-api.herokuapp.com/');

    return res.status(200).send(req.user)
  }
});

//Hello world
app.get('/', function (req, res) {
  console.log("hello, ", req.user)
  res.setHeader('Access-Control-Allow-Origin', 'https://appli-api.herokuapp.com/');

  res.send('the Appli API is functioning')
})

//Check if new username is unique
app.use('/checkuniquename', checkUniqueName)

//Attempt to log in
app.use('/login', login);

//Check if user is authorized
app.get('/isauthorized', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://appli-api.herokuapp.com/');

  res.json(req.user)
})

//Check current user
app.get('/currentuser', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://appli-api.herokuapp.com/');

  res.json(req.user)
})

//Attempt to log out
app.get('/logout', function(req, res){
  res.setHeader('Access-Control-Allow-Origin', 'https://appli-api.herokuapp.com/');

  req.logout();
  res.redirect('/');
});

//Create a new user
app.use('/createuser', createUser);

//Create a new job application ticket
app.use('/createticket', createTicket);

//Retrieve tickets from DB by user_id
app.use('/retrievetickets', retrieveTickets)

//Retrieve one ticket by ticket_id
app.use('/retrieveticketbyid', retrieveTicketById)

//Update Ticket in DB
app.use('/updateticket', updateTicket);

//Delete Ticket in DB
app.use('/deleteticket', deleteTicket)

//Update the Password
app.use('/updatepassword', updatePassword);

//Gracefully shut down
process.on( 'SIGINT', () => {
  console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );

  db.end(function(err) {

  })
  process.exit( );
})

const port = process.env.PORT || 4242 
app.listen(port, () => {
    console.log(`listing on ${port}`)
})