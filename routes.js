const express = require('express');
const session = require('express-session');
const router = express.Router();
const database = require('./src/database/database');
const app = express();
const bcrypt = require('bcrypt');
const checkAuthentication = require('./src/middlewares/authentication');

app.use(express.static(__dirname + '/public'));
app.use(checkAuthentication);

app.set('view engine', 'ejs');

// express-session middleware config
router.use(session({
    secret: 'teste',
    resave: false,
    saveUninitialized: true
}));

router.get('/login', (req, res) => {
    res.render('../src/views/login');
});

//Search Route
router.get('/', checkAuthentication, async (req, res) => {
    try {
        const listagem = await database.showInventory();
        const input = JSON.parse(JSON.stringify(req.body));
        const id = input && input['input-filter'];

        res.render('../src/views/inventario', {
            listagem: listagem,
            id: id,
            item: {}
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Ocorreu um erro ao exibir os dados do servidor');
    }
});

router.get('/:id', async (req, res) => {
    try {
        const connection = await database.connect();
        const [rows, _] = await connection.execute(
            'SELECT * FROM Inventario WHERE patrimonio=?;',
            [req.params.id]
        );
        if (rows.length === 0) {
            res.status(404).json({ mensagem: 'Item não encontrado' });
        } else {
            res.render('../src/views/inventario', {
                listagem: rows,
                itemId: req.params.id,
                item: {}
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            mensagem: 'Ocorreu um erro ao listar o item',
            erro: req.params.id,
        });
    }
});

// Add Route
router.post('/add', async (req, res) => {
    const {
        'input-valor-compra': valorCompra,
        'input-patrimonio': patrimonio,
        'input-unidade': unidade,
        'input-descricao': descricao,
        'input-modelo': modelo,
        'input-departamento': localizacao,
        'input-usuario': usuario,
        'input-serie': nserie,
        'input-data': data_compra,
    } = req.body

    const currencyRegex = /[\D]/g;
    const valorCompraNumerico = Number(valorCompra?.replace(currencyRegex, '').replace(',', '.'));
    const data = {
        patrimonio,
        unidade,
        descricao,
        modelo,
        localizacao,
        valorestim: valorCompraNumerico,
        usuario,
        nserie,
        data_compra,
    };

    try {
        const connection = await database.connect();
        await connection.query('INSERT INTO Inventario SET ?', [data]);
        res.redirect('/');
    } catch (error) {
        console.log(error);
        res.status(500).send({
            mensagem: 'Ocorreu um erro ao inserir os dados',
        });
    }
});

//Delete Route
router.get('/delete/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        const connection = await database.connect();
        const result = await connection.execute(
            'DELETE FROM Inventario WHERE patrimonio = ?', [userId]
        );
        connection.release();
        if (result.affectedRows === 0) {
            res.status(404).send('Registro não encontrado');
        } else {
            res.redirect('/');
        }

    } catch (error) {
        console.log(error);
        res.status(500).send('Ocorreu um erro ao excluir os dados');
    }
});

//Edit Route
router.post('/items/:id', async (req, res) => {
    try {
        const itemId = req.params.id;
        const { unidade, descricao, modelo, localizacao, valorestim, usuario, nserie } = req.body;

        //Formatação do input data para ser aceito no SQL
        const inputDate = req.body['input-data'];
        let formattedDate = null

        if (inputDate) {
            const dateObj = new Date(inputDate);
            formattedDate = dateObj.toISOString().split('T')[0];
        }

        const currencyRegex = /[\D]/g;
        const valorCompraNumerico = Number(valorestim.replace(currencyRegex, '').replace(',', '.'));
        const connection = await database.connect();

        await connection.query(
            'UPDATE Inventario SET unidade=?, descricao=?, modelo=?, localizacao=?, valorestim=?, usuario=?, nserie=?, data_compra=? WHERE patrimonio=?;',
            [unidade, descricao, modelo, localizacao, valorCompraNumerico, usuario, nserie, formattedDate, itemId]
        );
        connection.release();
        res.redirect('/');
    } catch (error) {
        console.log(error);
        res.status(500).send({
            mensagem: 'Ocorreu um erro ao atualizar os dados',
        });
    }
});

router.get('/api/items/:id', async (req, res) => {
    try {
        const itemId = parseInt(req.params.id);
        if (!Number.isInteger(itemId)) {
            throw new Error('O ID do item deve ser um número inteiro. ');
        }
        const connection = await database.connect();
        const result = await connection.query(
            'SELECT * FROM Inventario WHERE patrimonio = ?',
            [itemId]
        );
        connection.release();
        res.json(result[0]);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            mensagem: 'Ocorreu um erro ao buscar as informações do item'
        });
    }
});

router.post('/register', async (req, res, next) => {
    const connection = await database.connect();
    if (connection) {
        const results = await connection.query('SELECT * FROM Users WHERE email=?', [req.body.email]);
        try {
            if (results.length > 0 && results[0][0]?.email === req.body?.email) {
                res.status(409).send({
                    message: "Usuário já cadastrado"
                });
            } else {
                bcrypt.hash(req.body.password, 10, (errBcrypt, hash) => {
                    if (errBcrypt) { return res.status(500).send({ error: errBcrypt }); }
                    connection.query('INSERT INTO Users (name, username, password, email, created_at, updated_at) VALUES(?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);',
                        [req.body.name, req.body.username, hash, req.body.email],
                        (error, results) => {
                            connection.release();
                            if (error) { return res.status(500).send({ error: error }); }
                            res.redirect('/');
                        });
                });
            }
        } catch (error) {
            console.error(error);
        };
    }
});

router.post('/login', async (req, res, next) => {
    try {
        const connection = await database.connect();
        if (!connection) {
            return res.status(500).send({ message: 'Ocorreu um erro ao processar a solicitação.' });
        }

        const results = await connection.query('SELECT * FROM Users WHERE username=?', [req.body.username]);
        if (results.length < 1) {
            return res.status(401).send({ message: 'Falha na autenticação' })
        }

        const passwordMatch = results[0] && results[0][0] && await bcrypt.compare(req.body.password, results[0][0].password);
        if (passwordMatch) {
            req.session.userAuthenticated = true;
            return res.render('../src/views/welcome', {
                message: 'Bem vindo ao sistema!'
            });
        } else {
            console.error('Falha na autenticação, login ou senha incorreta');
            return res.render('../src/views/login', {
                message: 'Falha na autenticação, login ou senha incorreta'
            });
        }
    } catch (error) {
        console.error(error);
    }
});

module.exports = router;