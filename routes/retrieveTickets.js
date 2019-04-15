const express = require('express')
const router = express.Router();

var cors = require('cors')

const bodyParser = require('body-parser')
const passport = require('passport')
require('../passportStuff');

const db = require('../db.js')

router.use(cors())

// parse application/x-www-form-urlencoded
router.use(bodyParser.json()); // support json encoded bodies
router.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

router.get('/:archived', passport.authenticate('jwt', { session: false }), (req,res) =>{

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
          res.setHeader('Access-Control-Allow-Origin', 'https://appli-api.herokuapp.com/');
          res.send(dbResponse)
        }
      })
    })
  })

module.exports = router;