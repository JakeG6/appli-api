// @route GET api/users/login
// @desc login user / returning JWT token (json web token)
// @access Public
router.post('/login', (req,res) => {
    const email = req.body.email;
    const password = req.body.password;
    // Find user by email
    User.findOne({email}).then(user => {
    //Check for user
    if(!user) {
        return res.status(404).json({email: 'User not found'})
    }
        // Check password
        bcrypt.compare(password, user.password).then(isMatch => {
            if(isMatch) {
            // User Matched
            const payload = { id: user.id, name: user.name } // Create JWT Payload

            // Sign Token
            jwt.sign(payload, keys.secretOrKey,{ expiresIn: 3600 }, (err, token) => {
                res.json({
                success: true,
                token: 'Bearer ' + token,
                })
            });
            } else {
            return res.status(400).json({password: 'Password incorrect'});
            }
        });
    });
});