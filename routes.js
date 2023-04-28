const express = require('express');
const router = express.Router();
const db = require('./private/js/db');

//Search Route
router.get('/', async (req, res) => {
    const listagem = await db.showInventario();
    const input = JSON.parse(JSON.stringify(req.body));
    const id = input['input-filter'];

    res.render('../views/inventario', {
        listagem: listagem,
        id: id,
    });
});

router.get('/:id', async (req, res) => {
    try {
        const connection = await db.connect();
        const [rows, _] = await connection.execute(
            'SELECT * FROM Inventario WHERE patrimonio=?;',
            [req.params.id]
        );
        if (rows.length === 0) {
            res.status(404).json({ mensagem: 'Item não encontrado' });

        } else {
            res.render('../views/inventario', {
                listagem: rows,
                itemId: req.params.id,
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
    } = req.body

    const currencyRegex = /[\D]/g;
    const valorCompraNumerico = Number(valorCompra.replace(currencyRegex, '').replace(',', '.'));
    const data = {
        patrimonio,
        unidade,
        descricao,
        modelo,
        localizacao,
        valorestim: valorCompraNumerico,
        usuario,
        nserie,
    };
    try {
        const connection = await db.connect();
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
        const connection = await db.connect();
        const result = await connection.execute(
            'DELETE FROM Inventario WHERE patrimonio = ?', [userId]
        );
        await connection.end();
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

module.exports = router;