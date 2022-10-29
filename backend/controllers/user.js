// Importation de bcrypt pour hasher le password
const bcrypt = require('bcrypt');

//Importation de JSONWebToken
const jwt = require('jsonwebtoken');

//Importation de cryptojs pour hasher l'adresse email
const cryptojs = require('crypto-js');

//Importation pour utilisation des variables d'environnement
require('dotenv').config();

//Importation models de la base de données user.js
const User = require('../models/user');

//Signup pour enregistrer le nouvel utilisateur dans la base de données
//Chiffrage de l'email avant de l'envoyer en base de données
//Hash du password avant de l'envoyer dans la base de données
//Salt = 10 combien de fois sera exécuté l'algorythme de hashage
exports.signup = (req, res, next) => {
    const cryptoJsEmail = cryptojs.HmacSHA256(req.body.email, process.env.CRYPTOJS_SECRET_KEY).toString();
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            //Ce qui va être enregistré dans MongoDB
            const user = new User({
                email: cryptoJsEmail,
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch(error => res.status(400).json ({ error }));
        })
        .catch(error => res.status(500).json ({ error }));
};


//Login pour récupérer l'utilisateur déjà enregistré dans la base de données
exports.login = (req, res, next) => {
    const cryptoJsEmail = cryptojs.HmacSHA256(req.body.email, process.env.CRYPTOJS_SECRET_KEY).toString();
    User.findOne({ email: cryptoJsEmail })
        .then(user => {
            if (!user){
                res.status(401).json ({ message: 'Paire utilisateur/mot de passe incorrecte'});
            } else {
                bcrypt.compare(req.body.password, user.password)
                    .then(valid => {
                        if (!valid) {
                            res.status(401).json ({ message: 'Paire utilisateur/mot de passe incorrecte'});
                        } else {
                            res.status(200).json({
                                userId: user._id,
                                token: jwt.sign(
                                    { userId: user._id },
                                    process.env.RANDOM_SECRET_TOKEN,
                                    { expiresIn: '24h'}
                                )
                            });
                        }
                    })
                    .catch(error => res.status(500).json ({ error }));
            }
        })
        .catch(error => res.status(500).json ({ error }));
};