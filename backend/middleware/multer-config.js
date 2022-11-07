// Importation de Multer qui permet de gérer les fichiers entrants dans les requêtes HTTP
const multer = require('multer');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
};

// On configure le chemin et le nom de fichier pour les fichiers entrants
// On renomme et on enregistre l'image dans le dossier "Images"
const storage = multer.diskStorage({
   destination: (req, file, callback) => {
       callback(null, 'images')
   },
    filename: (req, file, callback) => {
       const name = file.originalname.split(' ').join('_');
       const extension = MIME_TYPES[file.mimetype];
       callback(null, name + Date.now() + '.' + extension);
    }
});

module.exports = multer({ storage }).single('image');