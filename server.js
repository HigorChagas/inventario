//constantes de codigo
const express = require('express');
const db = require('./private/js/db');
const app = express();
const port = 8080;
const bodyparser = require('body-parser');
const { body, validationResult } = require('express-validator');
const { listarItem } = require('./private/js/db');

//carregamento da engine ejs
app.set('view engine', 'ejs');

//implementação da verificação de login
app.use(bodyparser.urlencoded({ extended: true }));

//carregamento das pastas de programa
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/private'));


//inicio da aplicação com select no banco
app.get('/', async (req, res) => {
    const listagem = await db.showInventario();
    const input = JSON.parse(JSON.stringify(req.body));
    const id = input['input-filter'];
    console.log(id);

    res.render('../views/inventario', {
        listagem: listagem,
        id: id,
    });
});

app.post('/', (req, res) => {
    res.render('inventario');
});

//rodando na porta
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});


//rotas das funções
app.get('/:id', async (req, res) => {
    const id = 55;
    try {
        const connection = await db.connect();
        const [rows, listagem] = await connection.execute(
            'SELECT * FROM Inventario WHERE patrimonio=?;',
            [req.params.id]
        );
        if (rows.length === 0) {
            res.status(404).send({
                mensagem: 'Item não encontrado',
            });
        } else {
            console.log(rows);
            res.render('../views/inventario', {
                listagem: rows,
                id: id,
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

app.post('/add', async (req, res) => {
    const input = JSON.parse(JSON.stringify(req.body));
    const data = {
        patrimonio: input['input-patrimonio'],
        unidade: input['input-unidade'],
        descricao: input['input-descricao'],
        modelo: input['input-modelo'],
        localizacao: input['input-departamento'],
        valorestim: input['input-valor-compra'],
        usuario: input['input-usuario'],
        nserie: input['input-serie'],
    };

    try {
        const connection = await db.connect();
        await connection.query(
            'INSERT INTO Inventario SET ? ',
            data,
            (err, rows) => {
                if (err) {
                    console.log(`Erro ao inserir :%s ${err}`);
                }
                res.redirect('/');
            }
        );
        res.status(200);
        res.redirect('/');
    } catch (error) {
        res.status(500).send({
            mensagem: 'Ocorreu um erro ao inserir os dados',
        });
    }
});

app.post('/edit/:id', async (req, res) => {
    try {
        const connection = await db.connect();
        await connection.query(
            'UPDATE Inventario SET unidade=?, descricao=?, modelo=?, localizacao=?, valorestim=?, usuario=?, nserie=? WHERE patrimonio=?;',
            [
                req.body.unidade,
                req.body.descricao,
                req.body.modelo,
                req.body.localizacao,
                req.body.valorestim,
                req.body.usuario,
                req.body.nserie,
                req.params.id,
            ]
        );
        connect.release();
        res.status(200).send({
            mensagem: 'Dados atualizados com sucesso',
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            mensagem: 'Ocorreu um erro ao atualizar os dados',
        });
    }
});

app.get('/delete/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        const connection = await db.connect();
        await connection.query(
            'DELETE FROM Inventario WHERE patrimonio=?;',
            userId,
            (err, rows) => {
                if (err) {
                    console.log('Erro ao deletar');
                }
            }
        );
        res.redirect('/');
    } catch (error) {
        console.log(error);
        res.status(500).send('Ocorreu um erro ao excluir os dados');
    }
});

// app.delete('/delete/:id', async (req, res) => {
//     const userId = req.params.id;
//     try {
//         const connection = await db.connect();
//         await connection.query(
//             'DELETE FROM Inventario WHERE patrimonio=?;',
//             userId,
//             (err, rows) => {
//                 if (err) {
//                     console.log('Erro ao deletar');
//                 }
//             }
//         );
//         res.status(200).send('Dados excluídos com sucesso');
//     } catch (error) {
//         console.log(error);
//         res.status(500).send('Ocorreu um erro ao excluir os dados');
//     }
// });

//carregando bodyparser com json
app.use(bodyparser.json());

//validação
app.post(
    '/user',
    [
        body('username')
            .isLength({ min: 5, max: 50 })
            .withMessage('Usuário não está correto!'),
        body('password')
            .isLength({ min: 5, max: 50 })
            .withMessage('Senha não está correta'),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        res.json({ msg: 'sucesso' });
    }
);