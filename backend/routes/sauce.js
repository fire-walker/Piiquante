const express = require('express');

// Permet de créer des routeurs séparés pour chaque route principale
const router = express.Router();

const auth = require("../middleware/auth");
const multer = require('../middleware/multer-config');

const sauceCtrl = require('../controllers/sauce');

// Mise en place de toutes les routes nécessaires au traitement des sauces
router.get('/', auth, sauceCtrl.getAllSauces);
router.post('/', auth, multer, sauceCtrl.createSauce);
router.get('/:id', auth, sauceCtrl.getOneSauce);
router.put('/:id', auth, multer, sauceCtrl.modifySauce);
router.delete('/:id', auth, sauceCtrl.deleteSauce);
router.post('/:id/like', auth, sauceCtrl.likeDislikeSauce);

module.exports = router;