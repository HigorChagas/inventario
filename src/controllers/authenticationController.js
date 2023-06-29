const database = require('../database/database');
const bcrypt = require('bcrypt');

const registerUser = async (req, res) => {
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
}

const authenticateUser = async (req, res) => {
    const connection = await database.connect();
    try {
        if (!connection) {
            return res.status(500).send({ message: 'Ocorreu um erro ao processar a solicitação.' });
        }

        const results = await connection.query('SELECT * FROM users WHERE BINARY username = ?', [req.body.username]);
        const user = results[0]?.[0];

        if (!user) {
            return res.render('../src/views/login', {
                errorMessage: 'Login ou senha incorreta'
            });
        }

        const passwordMatch = user && await bcrypt.compare(req.body.password, user.password);
        if (passwordMatch) {
            req.session.userAuthenticated = true;
            return res.render('../src/views/welcome', {
                successMessage: 'Bem vindo ao sistema!'
            });
        } else {
            return res.render('../src/views/login', {
                errorMessage: 'Login ou senha incorreta'
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Ocorreu um erro ao processar a solicitação.' });
    }
}

const userLogout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao fazer logout');
        }

        res.redirect('/login');
    });
}

module.exports = {
    registerUser,
    authenticateUser,
    userLogout
}