const express = require('express')
const router = express.Router();

var cors = require('cors')

const bodyParser = require('body-parser')
const passport = require('passport')
require('../passportStuff');

const db = require('../db.js')

//router.use(cors())

// parse application/x-www-form-urlencoded
// router.use(bodyParser.json()); // support json encoded bodies
// router.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

router.delete('/:ticket_id', passport.authenticate('jwt', { session: false }), (req, res) =>{

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

module.exports = router;