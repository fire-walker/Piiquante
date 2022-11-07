// Importation de jsonwebtoken qui permet de vérifier les tokens d'authentification
const jwt = require('jsonwebtoken');

require('dotenv').config();

// Extraction du token du header authorization et utilisation de split pour tout récupérer après l'espace du header
// Décodage du token avec verify de jwt
// Extraction de l'id utilisateur et comparaison à celui extrait du token
// Si la requête contient un userId, comparaison avec celui extrait du token. S'il ne sont pas identiques on renvoie une erreur.
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