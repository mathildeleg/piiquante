const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');
const passwordValidator = require('password-validator');

const User = require('../models/user');

// schema for password validation to ensure password has those conditions
const schema = new passwordValidator();
schema
    .is().min(8)                                    // Minimum length 8
    .is().max(100)                                  // Maximum length 100
    .has().uppercase()                              // Must have uppercase letters
    .has().lowercase()                              // Must have lowercase letters
    .has().digits(2)                                // Must have at least 2 digits
    .has().not().spaces()                           // Should not have spaces
    .is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values

// route to signup with hashed password and encrypted email
exports.signup = (req, res, next) => {
    const password = req.body.password;
    const email = req.body.email;
    // checks if password is valid or not
    if(!schema.validate(password)){
        return res.status(401).json({ error: 'Mot de passe non valide !' })
    }
    // hash password
    bcrypt.hash(password, 10)
        .then(hash => {
            const user = new User({
                // encrypt email
                email: CryptoJS.MD5(email).toString(),
                password: hash
            });
            // create user
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur crée !' }))
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

// route to login a valid user
exports.login = (req, res, next) => {
    // get encrypted email
    let encryptedMail = CryptoJS.MD5(req.body.email).toString();
    // find user bc of email
    User.findOne({ email: encryptedMail })
        .then(user => {
            // check if user exists
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !' })
            }
            // compares hash password with user password to ensure it is the correct password
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    // check is password is valid
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' })
                    }
                    res.status(200).json({
                        // give token to user so that they have access to the app for 24h
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            process.env.JWT_PRIVATE_KEY,
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
};

