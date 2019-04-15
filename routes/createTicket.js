const express = require('express')
const router = express.Router();

var cors = require('cors')

const bodyParser = require('body-parser')
// const passport = require('passport')
require('../passportStuff');

const db = require('../db.js')

//router.use(cors())

// parse application/x-www-form-urlencoded
router.use(bodyParser.json()); // support json encoded bodies
router.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

router.post('/', (req, res) => {
    let userId = req.body.userId,
        company = req.body.companyName,
        position = req.body.position,
        resumeLink = req.body.resumeLink,
        includesCoverLetter = req.body.includesCoverLetter ? 1 : 0,
        applicationNotes = req.body.applicationNotes,
        calledForInterview = req.body.calledForInterview ? 1 : 0,
        jobOffered = req.body.jobOffered ? 1 : 0,
        acceptedOffer = req.body.acceptedOffer ? 1 : 0,
        archived = req.body.archived;
  
    db.getConnection(function(err, connection) {
      connection.release();
  
      if (err) throw err
      connection.query(`INSERT INTO appli_tickets 
      (user_id, company, position, resume_link, includes_cover_letter,
      application_notes, called_for_interview, job_offered, accepted_offer, archived) 
          VALUES (${userId}, "${company}", "${position}", "${resumeLink}", ${includesCoverLetter},
          "${applicationNotes}", ${calledForInterview}, ${jobOffered}, ${acceptedOffer}, ${archived})`,
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