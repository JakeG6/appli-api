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

router.put('/:ticket_id', passport.authenticate('jwt', { session: false }), (req, res) => {
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

module.exports = router;