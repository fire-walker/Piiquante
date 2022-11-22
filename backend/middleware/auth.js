// Importation de jsonwebtoken qui permet de vérifier les tokens d'authentification
const jwt = require('jsonwebtoken');

require('dotenv').config();

// Extraction du token du header authorization et décodage du token
// Extraction de l'id utilisateur et comparaison à celui extrait du token
// Si la requête contient un userId, comparaison avec celui extrait du token.
module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.RANDOM_SECRET_TOKEN);
        const userId = decodedToken.userId;
        req.auth = { userId };
        if (req.body.userId && req.body.userId !== userId) {
            throw 'Invalid user ID';
        } else {
            next();
        }
    } catch(error) {
        res.status(401).json ({
            error: new Error('Invalid request!')
        });
    }
};