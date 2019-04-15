const express = require('express')
const router = express.Router();

var cors = require('cors')

const bodyParser = require('body-parser')
const passport = require('passport')
require('../passportStuff');

const db = require('../db.js')

//router.use(cors())

// parse application/x-www-form-urlencoded
router.use(bodyParser.json()); // support json encoded bodies
router.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

router.get('/:ticket_id', (req, res) => {
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

module.exports = router;