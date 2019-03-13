const passport = require('passport') 
const LocalStrategy = require('passport-local').Strategy;
const db = require('./db.js')
require('./server.js')

passport.use(
    new LocalStrategy(
    function(username, password, done) {
        console.log('we are in the localstrategy. we are going to search the db')
        db.getConnection(function(err, connection) {
            if (err) throw err;
            connection.query(
            `SELECT * FROM users WHERE username = "${username}" && password="${password}"`,
            function (err, dbResponse) {
                if(err) {
                    return done(err)
                }
                else{
                    console.log("let's check if we got the user")      
                    if (dbResponse[0]) {
                        console.log(dbResponse[0])
                        done(null, dbResponse[0])
                    } else {
                         done(null, "invalid credentials")
                    }
                }
            })
        });
    })
)
  
  // used to serialize the user for the session
//   passport.serializeUser(function(userId, done) {
    
//     console.log('the user.id is ' + userId)
//     done(null, userId);
//   });
  
  //used to deserialize the user
//   passport.deserializeUser(function(id, done) {
    
//     console.log("let's check to deserialize!")
    
//     db.getConnection(function(err, connection) {
//         if (err) throw err;
//         connection.query(
//         `SELECT * from users WHERE user_id =  ${id}`,
//         function (err, dbResponse) {
//             if(err) {
//                 return done(err)
//             }
//             else{
//                 console.log("let's check if the id matches in the database")      
//                 if (dbResponse[0]) {
//                     console.log(dbResponse[0])
//                     done(null, dbResponse[0])
//                 } else {
//                      done(null, "invalid credentials")
//                 }
//             }
//         })
//     })
//   });

	



module.exports = passport