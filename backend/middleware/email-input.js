module.exports = (req, res, next) => {
    const emailValidation = (email) => {
        const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        const isValid = regex.test(email)
        isValid ? next() : res.status(400).json({ message: 'Adresse e-mail non valide' });
    }
    emailValidation(req.body.email)
};
