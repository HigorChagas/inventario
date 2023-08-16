const express = require('express');

const router = express.Router();
const app = express();

const checkAuthentication = require('../middlewares/authentication');
const inventoryController = require('../controllers/inventoryController');
const authenticationController = require('../controllers/authenticationController');
const registerController = require('../controllers/registerController');

app.set('view engine', 'ejs');

router.get('/', (req, res) => {
  const { errorMessage } = req.session;
  delete req.session.errorMessage;
  res.render('../src/views/login', {
    errorMessage,
  });
});

// Rotas de autenticação
router.post('/authentication', authenticationController.authenticateUser);
router.get('/logout', checkAuthentication, authenticationController.userLogout);

// Rotas de inventário
router.get('/inventario', checkAuthentication, inventoryController.renderInventory);
router.get('/api/items/:id', checkAuthentication, inventoryController.searchItemAPI);
router.get('/delete/:id', checkAuthentication, inventoryController.deleteItem);
router.post('/addItem', checkAuthentication, inventoryController.addItem);
router.post('/items/:id', checkAuthentication, inventoryController.editItem);

// Rota de registro
router.get('/register', checkAuthentication, registerController.renderRegisterPage);

router.post('/register', checkAuthentication, registerController.registerUser);

module.exports = router;
