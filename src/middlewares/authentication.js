const checkAuthentication = (req, res, next) => {
    console.log('Middleware checkAuthentication chamada');
    if (!req.session.userAuthenticated) {
        return res.status(401).render('../src/views/login', {
            errorMessage: 'Acesso não autorizado'
        });
    }

    next();
}

module.exports = checkAuthentication;