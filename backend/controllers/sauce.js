const Sauce = require("../models/sauce");

// Importation de fs qui permet de modifier le système de fichiers
const fs = require('fs');

/**
* Fonction de création d'une sauce
* - Pour obtenir un objet utilisable on effectue un JSON.parse()
* - Suppression de l'id de l'objet envoyé par le front-end car généré automatiquement par notre bdd
* - Création d'un objet sauce
* - Récupération de l'URL complète de l'image
* - Enregistrement de la sauce dans la bdd
 * @param {Object} req - Express Request object
 * @param {Object} res - Express Response Object
 * @param {Function} next - Express next middleware function
 */
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject.userId;
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
        .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
        .catch(error => res.status(400).json({ error }));
};

// Fonction de modification d'une sauce
// On regarde si "req.file" existe. Si oui, traite la nouvelle image. Si non, traite l'objet entrant.
// On récupère l'objet dans le corps de la requête
// On récupère notre objet en bdd : si le champ userId récupéré est différent de l'userId qui vient de notre token -> erreur 401
// Sinon on met à jour notre enregistrement
exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {...req.body};

    delete sauceObject.userId;
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (sauce.userId !== req.auth.userId) {
                res.status(401).json({ message: 'Non-autorisé' });
            } else {
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet modifié !'}))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch(error => res.status(400).json({ error }));
};

// Fonction de suppression d'une sauce
// On récupère notre objet en bdd : si le champ userId récupéré est différent de l'userId qui vient de notre token -> erreur 401
// Sinon, on récupère le nom du fichier image et on le supprime (de manière asynchrone) avec unlink
// On exécute le callback une fois que le fichier a été supprimé et on implémente la logique pour supprimer la sauce
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (sauce.userId !== req.auth.userId) {
                res.status(401).json({ message: 'Non-autorisé' });
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
                        .catch(error => res.status(401).json({ error }));
                })
            }
        })
        .catch(error => res.status(500).json({ error }));
};

// Fonction de récupération d'une sauce
// Utilisation de la méthode findOne() du modèle Mongoose qui renvoie la Sauce ayant le même _id que le paramètre de la requête
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id})
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(404).json({ error }));
};

// Fonction de récupération de toutes les sauces
// Utilisation de la méthode find() qui renvoie un tableau de toutes les Sauces de notre base de données
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

// Fonction de gestion des likes et dislikes
// On récupère notre objet en bdd et on récupère l'id dans l'URL de la requête
exports.likeDislikeSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {

            switch (req.body.like) {

                // Si userId du corps de la requête n’est pas inclus dans le tableau usersLiked de notre objet alors on modifie notre objet
                // On ajoute 1 au champ des likes
                // On insère le userId dans le tableau usersLiked du modèle
                case 1:
                    if (!sauce.usersLiked.includes(req.body.userId)) {
                        Sauce.updateOne({_id: req.params.id}, { $inc: { likes: 1 }, $push: { usersLiked: req.body.userId }})
                            .then(() => res.status(200).json({ message: "J'aime cette sauce!" }))
                            .catch(error => res.status(400).json({ error }))
                    }

                    break;

                // Si userId du corps de la requête est inclus dans le tableau usersLiked / usersDisliked de notre objet alors on modifie notre objet
                // On supprime notre valeur du champ des likes / dislikes
                // On supprime le userId du tableau usersLiked / usersDisliked du modèle
                case 0:
                    if (sauce.usersLiked.includes(req.body.userId)) {
                        Sauce.updateOne({_id: req.params.id }, { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId }})
                            .then(() => res.status(200).json({ message: "Neutre" }))
                            .catch(error => res.status(400).json({ error }))
                    }
                    if (sauce.usersDisliked.includes(req.body.userId)) {
                        Sauce.updateOne({_id: req.params.id }, { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.body.userId }})
                            .then(() => res.status(200).json({ message: "Neutre" }))
                            .catch(error => res.status(400).json({ error }))
                    }

                    break;

                // Si userId du corps de la requête n’est pas inclus dans le tableau usersDisliked de notre objet alors on modifie notre objet
                // On ajoute 1 au champ des dilikes
                // On insère le userId dans le tableau usersDisliked du modèle
                case -1:
                    if (!sauce.usersDisliked.includes(req.body.userId)) {
                        Sauce.updateOne({_id: req.params.id }, { $inc: { dislikes: 1 }, $push: { usersDisliked: req.body.userId }})
                            .then(() => res.status(200).json({ message: "Je n'aime pas cette sauce" }))
                            .catch(error => res.status(400).json({ error }))
                    }

                    break;

                default:
                    throw new Exception("Une erreur est survenue");
            }
        })

        .catch(error => res.status(404).json({ error }))
};