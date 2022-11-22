const passwordSchema = require('../models/password');

module.exports = (req, res, next) => {
    if (!passwordSchema.validate(req.body.password)) {
        res.status(400).json({ message: 'Mot de passe non valide, il doit contenir au moins 12 caractères dont une majuscule, une minuscule, un chiffre et un caractère spécial.' });
    } else {
        next();
    }
};