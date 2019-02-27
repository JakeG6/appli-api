//const express = require('express')
//const router = express.Router()

const passport = require('passport') 
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
    function(username, password, done) {

        db.getConnection(function(err, connection) {
            if (err) throw err;
            connection.query(
            `SELECT * FROM users WHERE username = ${username} AND password = ${password}`,
            function (err, dbResponse) {
                if(err) {
                    return done(err)
                }
                else{
                console.log("let's check if the username and password match in the database")      
                if (dbResponse[0]) {
                    console.log(true)
                    res.send(dbResponse[0])
                }
                else {res.send(false)}
                }
            })  
        });
    //   User.findOne({ username: username }, function (err, user) {
    //     if (err) { return done(err); }
    //     if (!user) {
    //       return done(null, false, { message: 'Incorrect username.' });
    //     }
    //     if (!user.validPassword(password)) {
    //       return done(null, false, { message: 'Incorrect password.' });
    //     }
    //     return done(null, user);
    //   });
    })
)

module.exports = passport


