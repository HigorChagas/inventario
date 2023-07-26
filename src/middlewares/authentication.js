const checkAuthentication = (req, res, next) => {
  if (!req.session.userAuthenticated) {
    return res.status(401).render('../src/views/login', {
      errorMessage: 'Acesso não autorizado',
    });
  }
  return next();
};

module.exports = checkAuthentication;
