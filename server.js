const express = require('express');
const app = express();
const routes = require('./src/router/routes');
const bodyparser = require('body-parser');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const crypto = require('crypto');
const PORT = process.env.PORT || 3000;

const generateSessionKey = () => {
    const key = crypto.randomBytes(32).toString('hex');
    return key;
};

const sessionKey = generateSessionKey();

const sessionStore = new MySQLStore({
    host: process.env.DB_URL,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})

app.use(session({
    secret: sessionKey,
    resave: false,
    saveUninitialized: true,
    store: sessionStore
}));

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use('/', routes);
app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs');

app.use((req, res) => {
    res.status(404).render('../src/views/404')
});
// //Localhost
// app.listen(port, () => {
//     console.log(`Server running in ${PORT}`);
// });



