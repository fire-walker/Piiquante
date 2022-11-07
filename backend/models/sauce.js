const mongoose = require('mongoose');

// Utilisation de la méthode Schema de Mongoose qui contient les champs souhaités ainsi que leur type
const sauceSchema = mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    manufacturer: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    heat: { type: Number, required: true },
    likes: { type: Number, default: 0, required: true },
    dislikes: { type: Number, default: 0, required: true },
    usersLiked: { type: [String], required: true },
    usersDisliked: { type: [String], required: true }
});

// Exportation du Schema pour le rendre disponible pour notre application Express
module.exports = mongoose.model('sauce', sauceSchema);