const Sauce = require("../models/sauce");
const fs = require('fs');

/**
* Fonction de création d'une sauce
* - Pour obtenir un objet utilisable on effectue un JSON.parse()
* - Suppression de l'id de l'objet car généré automatiquement par notre bdd
* - Création d'un objet sauce
* - Récupération de l'URL complète de l'image
* - Sauvegarde de la sauce
 * @param {Object} req - Express Request object
 * @param {Object} res - Express Response Object
 * @param {Function} next - Express next middleware function
 * @return {Undefined}
 */
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject.userId;
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    });
    sauce.save()
        .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
        .catch(error => res.status(400).json({ error }));
};

//Fonction de modification d'une sauce
//Vérification de l'existence d'un champ file
//-> le cas échéant on récupère l'objet en parsant la chaîne de caractère et en recréant l'URL de l'image
//On récupère l'objet dans le corps de la requête
//On récupère notre objet en bdd : si le champ userId récupéré est différent de l'userId qui vient de notre token -> erreur 400
// Sinon on met à jour notre enregistrement, nous passons notre filtre, notre objet et l'id qui vient des paramètres de l'url
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

//Fonction de suppression d'une sauce
//On récupère notre objet en bdd : si le champ userId récupéré est différent de l'userId qui vient de notre token -> erreur 400
//Sinon, on récupère le nom du fichier image et on la supprime (de manière asynchrone) avec unlink
//On exécute le callback une fois que le fichier a été supprimé et on implémente la logique pour supprimer la sauce
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

//Fonction de récupération d'une sauce
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id})
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(404).json({ error }));
};

//Fonction de récupération de toutes les sauces
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

//Fonction de gestion des likes et dislikes
exports.likeDislikeSauce = (req,res, next) => {
    switch (req.body.like) {
        case 1:
            Sauce.updateOne({_id: req.params.id }, { $inc: { likes: +1 }, $push: { usersLiked: req.body.userId }})
                .then(() => res.status(200).json({ message: "J'aime!" }))
                .catch(error => res.status(400).json({ error }))
            break;

        case 0:
            Sauce.findOne({ _id: req.params.id })
                .then((sauce) => {
                    if (sauce.usersLiked.includes(req.body.userId)) {
                        Sauce.updateOne({_id: req.params.id }, { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId }})
                            .then(() => res.status(200).json({ message: "Neutre" }))
                            .catch(error => res.status(400).json({ error }))
                    }
                    if (sauce.usersDisliked.includes(req.body.userId)) {
                        Sauce.updateOne({_id: req.params.id }, { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.body.userId }})
                            .then(() => res.status(200).json({ message: "J'ai changé d'avis'" }))
                            .catch(error => res.status(400).json({ error }))
                    }
                })
                .catch(error => res.status(404).json({ error }))
            break;

        case -1:
            Sauce.updateOne({_id: req.params.id }, { $inc: { dislikes: +1 }, $push: { usersDisliked: req.body.userId }})
                .then(() => res.status(200).json({ message: "Je n'aime pas" }))
                .catch(error => res.status(400).json({ error }))
            break;

    }
};