// Importação de módulos necessários
require('dotenv').config(); // Carrega variáveis de ambiente do arquivo .env
const express = require('express');
const crypto = require('crypto');
const bodyparser = require('body-parser');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session); // Configura o armazenamento de sessão no MySQL
const routes = require('./src/router/routes'); // Importa as rotas personalizadas definidas no arquivo routes.js

// Cria uma instância do aplicativo Express
const app = express();

const PORT = process.env.PORT || 3000;

// Função para gerar uma chave de sessão aleatória
const generateSessionKey = () => {
  const key = crypto.randomBytes(32).toString('hex');
  return key;
};

// Gera uma chave de sessão única
const sessionKey = generateSessionKey();

// Configura o armazenamento de sessão no MySQL usando as variáveis de ambiente
const sessionStore = new MySQLStore({
  host: process.env.DB_URL,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Configuração para confiar em proxies
app.set('trust proxy', 1);

// Configuração do middleware de sessão usando express-session
app.use(
  session({
    // cookie: {
    //   secure: true,
    //   maxAge: 180000000,
    // },
    store: sessionStore, // Armazenamento da sessão no MySQL
    secret: sessionKey, // Chave secreta usada para assinar as sessões
    resave: false, // Evita que as sessões sejam salvas automaticamente
    saveUninitialized: true, // Salva sessões não inicializadas
  }),
);

// Configuração do middleware para analisar solicitações JSON e codificadas por URL
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

// Configuração das rotas personalizadas definidas no arquivo routes.js
app.use('/', routes);

// Configuração do middleware para servir arquivos estáticos na pasta 'public'
app.use(express.static(`${__dirname}/public`));

// Configura o mecanismo de visualização do Express como EJS
app.set('view engine', 'ejs');

// Configuração para lidar com solicitações não encontradas (página 404)
app.use((req, res) => {
  res.status(404).render('../src/views/404');
});

// Inicia o servidor na porta especificada
app.listen(PORT, () => {
  console.log(`Server running in ${PORT}`);
});
