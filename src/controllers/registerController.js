const userModel = require('../models/inventoryModel');

const renderRegisterPage = (req, res) => {
  const { successMessage, errorMessage } = req.session;
  res.render('../src/views/registro', {
    successMessage,
    errorMessage,
  });
  req.session.successMessage = undefined;
  req.session.errorMessage = undefined;
};

const registerUser = async (req, res) => {
  try {
    const results = await userModel.getUserByEmail(req.body.email);

    if (results.length > 0 && results[0]?.email === req.body.email) {
      req.session.errorMessage = 'Usuário já cadastrado';
      res.redirect('/register');
    }
    // eslint-disable-next-line max-len
    const inserted = await userModel.insertUser(req.body.username, req.body.name, req.body.email, req.body.password);
    if (inserted) {
      req.session.successMessage = 'Usuário registrado com sucesso!';
      res.redirect('/register');
    } else {
      req.session.errorMessage = 'Usuário já cadastrado';
      res.redirect('/register');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Erro ao processar a requisição' });
  }
};

module.exports = {
  registerUser,
  renderRegisterPage,
};
