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



