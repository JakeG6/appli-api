const passport = require('passport') 
const db = require('./db.js')
require('./server.js')

const keys = require('./keys')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: keys.secretOrKey
}


passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
    console.log(`the jwt_payload is ${jwt_payload}`)
    console.log('we are in the jwt strategy. we are going to search the db')
    db.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query(
        `SELECT * FROM users WHERE user_id = ${jwt_payload.id}`,
        function (err, user) {
            if(err) {
                return done(err)
            }
            else{
                console.log("let's check if we got the user")      
                if (user) {
                    console.log(user)
                    return done(null, user)
                } else {
                    return done(null, false)
                }
            }
        })
    });
    
    // Example:
    // User.findById(jwt_payload.id).then(user => {
    //     if(user){
    //         return done(null, user);
    //     }
    //     return done(null,false);
    // }).catch(err => console.log(err))
}))

module.exports = passport