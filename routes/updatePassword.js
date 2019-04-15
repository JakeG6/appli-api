const express = require('express')
const router = express.Router();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const keys = require('../keys')

var cors = require('cors')

const bodyParser = require('body-parser')
const passport = require('passport')
require('../passportStuff');

const db = require('../db.js')

router.use(cors())

//parse application/x-www-form-urlencoded
router.use(bodyParser.json()); // support json encoded bodies
router.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

router.put('/', passport.authenticate('jwt', { session: false }), (req, res) => {

  let username = req.body.username,
    oldPassword = req.body.oldPassword,
    newPassword = req.body.newPassword

  db.getConnection(function(err, connection) {
    connection.release();
    if (err) throw err
    
    connection.query(`SELECT * FROM users WHERE username = "${username}"`, function (err, user) {
      
      console.log(`here is the hash in the db: ${user[0].password}`)      
      
      if(err || !user) {
        return res.status(404).json({username: 'User not found'})
      }
      
      console.log('we will compare: ', oldPassword, user[0].password)      
      
      bcrypt.compare(oldPassword, user[0].password, (err, result) => {       
        
        if(err) {
          console.log(err); 

          return res.send("Error: Incorrect Password")}

        if (result) {
          console.log(`Passwords match. eventually it will be replaced with ${newPassword}`)
          //Passwords match. it will be replaced with the new password.
          bcrypt.hash(newPassword, 10, function(err, hash) {
            // Store hash in your password DB.
            console.log(hash)
            db.getConnection(function(err, connection) {
              //connection.release();
        
              if (err) throw err
              connection.query(`UPDATE users SET password = "${hash}" WHERE username = "${username}"`,
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
        }
        else { 

          return res.status(404).json({username: `password doesn't match`})
        }
      })
    })
  })
})

module.exports = router;