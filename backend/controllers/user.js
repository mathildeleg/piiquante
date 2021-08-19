const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');
const validator = require('validator');

const User = require('../models/user'); 

exports.signup = (req, res, next) => {
    const encryptedEmail = CryptoJS.AES.encrypt(req.body.email, process.env.EMAIL_ENCRYPTION_KEY).toString();
    console.log(encryptedEmail);
    if(validator.isEmail(req.body.email, {blacklisted_chars: '$="'})){
        bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: encryptedEmail,
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur crée !' }))
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
    }else{
        res.status(400).json({error: "Le format de l'adresse e-mail n'est pas valide"});
    }
};

exports.login = (req, res, next) => {
    const decrypted = CryptoJS.AES.decrypt(process.env.EMAIL_CRYPTED, process.env.EMAIL_ENCRYPTION_KEY);
    const decryptedEmail = decrypt.toString(CryptoJS.enc.Utf8);
    console.log(decryptedEmail);
    User.findOne({ email: decryptedEmail })
        .then(user => {
            if(!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !' })
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if(!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' })
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            'RANDOM_TOKEN_SECRET',
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};