const express = require('express');
const helmet = require('helmet');
const app = express();
const routes = require('./routes');
const port = 8080;
const bodyparser = require('body-parser');

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use('/', routes);
app.use(express.static(__dirname + '/public'));
app.use(helmet());

app.set('view engine', 'ejs');

app.use((req, res) => {
    res.status(404).render('../src/views/404')
});
//Localhost
app.listen(port, () => {
    console.log(`Server running in ${port}`);
});



