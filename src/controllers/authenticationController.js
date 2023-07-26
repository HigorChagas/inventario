const bcrypt = require('bcrypt');
const database = require('../database/database');

const authenticateUser = async (req, res) => {
  const connection = await database.connect();
  try {
    if (!connection) {
      return res.status(500).send({ message: 'Ocorreu um erro ao processar a solicitação.' });
    }

    const results = await connection.query('SELECT * FROM users WHERE BINARY username = ?', [req.body.username]);
    const user = results[0]?.[0];

    if (!user) {
      return res.render('../src/views/login', {
        errorMessage: 'Login ou senha incorreta',
      });
    }

    const passwordMatch = user && await bcrypt.compare(req.body.password, user.password);
    if (passwordMatch) {
      req.session.userAuthenticated = true;
      return res.render('../src/views/welcome', {
        successMessage: 'Bem vindo ao sistema!',
      });
    }
    return res.render('../src/views/login', {
      errorMessage: 'Login ou senha incorreta',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Ocorreu um erro ao processar a solicitação.' });
  }
};

const userLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erro ao fazer logout');
    }

    return res.redirect('/');
  });
};

module.exports = {
  authenticateUser,
  userLogout,
};
