const express = require('express');
const session = require('express-session');
const router = express.Router();
const database = require('./src/database/database');
const app = express();
const bcrypt = require('bcrypt');
const checkAuthentication = require('./src/middlewares/authentication');
const Swal = require('sweetalert2');

app.use(checkAuthentication);

app.set('view engine', 'ejs');

// express-session middleware config
router.use(session({
    secret: 'teste',
    resave: false,
    saveUninitialized: false
}));

router.get('/login', (req, res) => {
    const errorMessage = req.session.errorMessage;
    delete req.session.errorMessage;
    res.render('../src/views/login', {
        errorMessage
    });
});

//Search Route
router.get('/inventario', checkAuthentication, async (req, res) => {
    try {
        const listagem = await database.showInventory();
        const input = JSON.parse(JSON.stringify(req.body));
        const id = input && input['input-filter'];
        const successMessage = req.session.successMessage;
        const errorMessage = req.session.errorMessage;
        // delete req.session.successMessage;
        // delete req.session.errorMessage;

        res.render('../src/views/inventario', {
            listagem: listagem,
            id: id,
            item: {},
            successMessage,
            errorMessage
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Ocorreu um erro ao exibir os dados do servidor');
    }
});

router.get('/inventario/:id', checkAuthentication, async (req, res) => {
    try {
        const connection = await database.connect();
        const id = req.params.id;
        const [rows, _] = await connection.execute(
            'SELECT * FROM Inventario WHERE patrimonio=?;',
            [req.params.id]
        );
        req.session.successMessage = null;
        if (rows.length === 0) {
            res.status(401).render('../src/views/inventario', {
                message: 'Item não encontrado'
            })
        } else {
            res.render('../src/views/inventario', {
                listagem: rows,
                itemId: id,
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
router.post('/add', checkAuthentication, async (req, res) => {
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
        req.session.successMessage = 'Item adicionado com sucesso!';
        res.redirect('/inventario');
    } catch (error) {
        console.log(error);
        res.status(500).send({
            mensagem: 'Ocorreu um erro ao inserir os dados',
        });
    }
});

//Delete Route
router.get('/delete/:id', checkAuthentication, async (req, res) => {
    const userId = req.params.id;
    try {
        const connection = await database.connect();
        const result = await connection.execute(
            'DELETE FROM Inventario WHERE patrimonio = ?', [userId]
        );
        connection.release();
        req.session.successMessage = 'Item deletado com sucesso!';
        if (result.affectedRows === 0) {
            res.status(404).send('Registro não encontrado');
        } else {
            res.redirect('/inventario');
        }

    } catch (error) {
        console.log(error);
        res.status(500).send('Ocorreu um erro ao excluir os dados');
    }
});

//Edit Route
router.post('/items/:id', checkAuthentication, async (req, res) => {
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
        req.session.successMessage = 'Item editado com sucesso';
        res.redirect('/inventario');
    } catch (error) {
        console.log(error);
        res.status(500).send({
            mensagem: 'Ocorreu um erro ao atualizar os dados',
        });
    }
});

router.get('/api/items/:id', checkAuthentication, async (req, res) => {
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
        const results = await connection.query('SELECT * FROM users WHERE email=?', [req.body.email]);
        try {
            if (results.length > 0 && results[0][0]?.email === req.body?.email) {
                res.status(409).send({
                    message: "Usuário já cadastrado"
                });
            } else {
                bcrypt.hash(req.body.password, 10, (errBcrypt, hash) => {
                    if (errBcrypt) { return res.status(500).send({ error: errBcrypt }); }
                    connection.query('INSERT INTO users (name, username, password, email, created_at, updated_at) VALUES(?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);',
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

router.post('/auth', async (req, res) => {
    try {
        const connection = await database.connect();
        if (!connection) {
            return res.status(500).send({ message: 'Ocorreu um erro ao processar a solicitação.' });
        }

        const results = await connection.query('SELECT * FROM users WHERE username = ?', [req.body.username]);
        const user = results[0]?.[0];
        const errorMessage = 'Login ou senha incorreta';

        if (!user) {
            return res.render('../src/views/login', { errorMessage })
        }

        const passwordMatch = user && await bcrypt.compare(req.body.password, user.password);
        if (passwordMatch) {
            req.session.userAuthenticated = true;
            return res.render('../src/views/welcome', {
                message: 'Bem vindo ao sistema!'
            });
        } else {
            return res.render('../src/views/login', { errorMessage })
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Ocorreu um erro ao processar a solicitação.' });
    }
});

router.get('/logout', checkAuthentication, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao fazer logout');
        }

        res.redirect('/login');
    });
});

module.exports = router;