const express = require('express')
const router = express.Router();

var cors = require('cors')

const bodyParser = require('body-parser')
require('../passportStuff');

const db = require('../db.js')

router.use(cors())

// parse application/x-www-form-urlencoded
router.use(bodyParser.json()); // support json encoded bodies
router.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

router.get('/:username', (req, res) => {

    let newUsername = req.params.username
    console.log("we're about to check if the username exists")
    db.getConnection(function(err, connection) {
      connection.release();
  
      if (err) throw err;
      connection.query(`SELECT * FROM users WHERE username = "${newUsername}"`, function (err, dbResponse) {
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

module.exports = router;