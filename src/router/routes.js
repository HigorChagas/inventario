const express = require('express');
const session = require('express-session');
const router = express.Router();
const app = express();

const checkAuthentication = require('../middlewares/authentication');
const inventoryController = require('../controllers/inventoryController');
const authenticationController = require('../controllers/authenticationController');

app.set('view engine', 'ejs');

router.use(session({
    secret: 'teste',
    resave: false,
    saveUninitialized: false
}));

router.get('/', (req, res) => {
    const errorMessage = req.session.errorMessage;
    delete req.session.errorMessage;
    res.render('../src/views/login', {
        errorMessage
    });
});

// Rotas de autenticação
router.post('/register', authenticationController.registerUser);
router.post('/authentication', authenticationController.authenticateUser);
router.get('/logout', checkAuthentication, authenticationController.userLogout);

// Rotas de inventário
router.get('/inventario', checkAuthentication, inventoryController.renderInventory);
router.get('/inventario/:id', checkAuthentication, inventoryController.searchItem);
router.get('/api/items/:id', checkAuthentication, inventoryController.searchItemAPI);
router.get('/delete/:id', checkAuthentication, inventoryController.deleteItem);
router.post('/addItem', checkAuthentication, inventoryController.addItem);
router.post('/items/:id', checkAuthentication, inventoryController.editItem);

module.exports = router;