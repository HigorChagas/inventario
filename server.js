const express = require('express');
const app = express();
const routes = require('./src/router/routes');
const bodyparser = require('body-parser');
const port = 8080;

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use('/', routes);
app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs');

app.use((req, res) => {
    res.status(404).render('../src/views/404')
});
//Localhost
app.listen(port, () => {
    console.log(`Server running in ${port}`);
});



