const express = require('express')
const router = express.Router();

const bcrypt = require('bcrypt');

var cors = require('cors')

const bodyParser = require('body-parser')
require('../passportStuff');

const db = require('../db.js')

router.use(cors())

// parse application/x-www-form-urlencoded
router.use(bodyParser.json()); // support json encoded bodies
router.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

router.post('/', (req, res) => {
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
              res.setHeader('Access-Control-Allow-Origin', 'https://appli-front.herokuapp.com/');

              res.send(dbResponse)
            }
          })
      })
    });
})

module.exports = router;