const express = require('express');
const db = require('./private/js/db');
const app = express();
const routes = require('./routes');
const port = 8080;
const bodyparser = require('body-parser');

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use('/', routes);
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/private'));

app.set('view engine', 'ejs');

//Localhost
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

app.post('/', (req, res) => {
    res.render('inventario');
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


