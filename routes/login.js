const express = require('express')
const router = express.Router();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const keys = require('../keys')

var cors = require('cors')

const bodyParser = require('body-parser')
// const passport = require('passport')
require('../passportStuff');

const db = require('../db.js')

router.use(cors())

// parse application/x-www-form-urlencoded
router.use(bodyParser.json()); // support json encoded bodies
router.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies



//attempt to login
router.post('/', function(req, res) {
  
    const username = req.body.username
    const password = req.body.password
    
    db.getConnection(function(err, connection) {
      connection.release();
  
      if (err) throw err;
      
      if (username.length < 1) {
        return res.status(404).send("password wasn't included")

      }
    
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
            const payload = { id: user[0].user_id, name: user[0].username, color: user[0].color } 
  
            // Sign and send out the token
            jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 }, (err, token) => {
              
              res.json({success: true, token:  token,})
            
            });
          }
          else { 
            console.log('passwords do not match')
            return res.status(404).json({username: `password doesn't match`})
          }
        })
      })
    });
});

module.exports = router;