const express = require('express');

const router = express.Router();
const app = express();

const checkAuthentication = require('../middlewares/authentication');
const inventoryController = require('../controllers/inventoryController');
const authenticationController = require('../controllers/authenticationController');

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
router.get('/inventario', inventoryController.renderInventory);
router.get('/api/items/:id', inventoryController.searchItemAPI);
router.get('/delete/:id', inventoryController.deleteItem);
router.post('/addItem', inventoryController.addItem);
router.post('/items/:id', inventoryController.editItem);

module.exports = router;
