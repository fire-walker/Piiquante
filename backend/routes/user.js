const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');

const emailInput = require('../middleware/email-input')
const passwordInput = require('../middleware/password-input')

// Mise en place de toutes les routes nécessaires à l'authentification
router.post('/signup', emailInput, passwordInput, userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;