const express = require('express');
const db = require('./private/js/db');
const app = express();
const port = 8080;
const bodyparser = require('body-parser');
const { body, validationResult } = require('express-validator');
const { listarItem } = require('./private/js/db');

app.use(bodyparser.json());

app.set('view engine', 'ejs');

app.use(bodyparser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/private'));

//Localhost
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

//Search Route
app.get('/', async (req, res) => {
    const listagem = await db.showInventario();
    const input = JSON.parse(JSON.stringify(req.body));
    const id = input['input-filter'];

    res.render('../views/inventario', {
        listagem: listagem,
        id: id,
    });
});

app.post('/', (req, res) => {
    res.render('inventario');
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
    const valorCompra = input['input-valor-compra'].replace('R$', '').trim('').replace(/\./g, '').replace(',', '.');
    const data = {
        patrimonio: input['input-patrimonio'],
        unidade: input['input-unidade'],
        descricao: input['input-descricao'],
        modelo: input['input-modelo'],
        localizacao: input['input-departamento'],
        valorestim: valorCompra,
        usuario: input['input-usuario'],
        nserie: input['input-serie'],
    };

    console.log(valorCompra);
    console.log({ data });

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
        console.log(error);
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

