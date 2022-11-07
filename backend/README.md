#Variables d'environnement

Ce projet utilise différentes variables d'environnement afin de sécuriser la gestion de l'identifiant MongoDB, le token d'authentification ainsi que la clé de la librarie CryptoJS.

Après installation du projet, associez les clés suivantes aux valeurs correspondantes dans un fichier ``.env`` :

MongoDB adresse SRV : 
`MONGODB_PATH=' '`

Clé de cryptage du token JWT : 
`RANDOM_SECRET_TOKEN=' '`

Clé de cryptage CryptoJS : 
`CRYPTOJS_SECRET_KEY=' '`