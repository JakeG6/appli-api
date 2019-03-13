let token = jwt.sign(
    {
        id: user.ID,
        username: user.uname,
    },
    privateKey,
    // you have to have this. make one on a website 
    {
        algorithm: 'HS256',
        //notBefore,
        //audience,
        //subject,
        issuer: "wbteam.net",
        expiresIn: "1h"
    }
);

resolve(token)
//resolve (jwt.verify(token, privateKey))


// in the console, enter ssh-keygen