require('dotenv').config();

async function connect() {
    try {
        const mysql = require('mysql2/promise');
        const connectionPool = await mysql.createPool({
            host: process.env.DB_URL,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            connectionLimit: 100, // Configura o limite de conexões do pool
            namedPlaceholders: true, // Habilita o uso de placeholders nomeados em queries
            timezone: '-03:00' // Define o fuso horário padrão das datas para UTC
        });
        const connection = await connectionPool.getConnection();
        return connection

    } catch (error) {
        console.error('Erro ao conectar ao banco de dados: ', error);
        throw error;
    }
}

module.exports = { connect };