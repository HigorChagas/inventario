require('dotenv').config();

async function connect() {
    try {
        const mysql = require('mysql2/promise');
        const connectionPool = await mysql.createPool({
            host: process.env.DB_URL,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            connectionLimit: 10, // Configura o limite de conexões do pool
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

async function showInventory() {
    let conn
    try {
        conn = await connect();
        const [rows] = await conn.execute('SELECT * FROM Inventario');
        return rows;
    } catch (error) {
        console.error('Erro ao mostrar o inventário', error);
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function createITAsset(inventory) {
    let conn
    try {
        conn = await connect();
        const sql =
            'INSERT INTO Inventario (unidade, descricao, modelo, localizacao, valorestim, usuario, nserie) VALUES(?, ?, ?, ?, ?, ?, ?);';
        const values = [
            inventory.patrimonio,
            inventory.unidade,
            inventory.descricao,
            inventory.modelo,
            inventory.localizacao,
            inventory.valorestim,
            inventory.usuario,
            inventory.nserie,
        ];
        if (!inventory.patrimonio || !inventory.unidade || !inventory.descricao || !inventory.modelo || !inventory.localizacao || !inventory.valorestim || !inventory.usuario || !inventory.nserie) {
            throw new Error('Dados inválidos');
        }
        return await conn.query(sql, values);
    } catch (error) {
        console.error('Erro ao registrar item no banco de dados', error)
        throw error;
    }
}

async function editAsset(id, invent) {
    const conn = await connect();
    const sql =
        'UPDATE Inventario SET unidade=?, descricao=?, modelo=?, localizacao=?, valorestim=?, usuario=?, nserie=? WHERE patrimonio=?;    ';
    const values = [
        invent.unidade,
        invent.descricao,
        invent.modelo,
        invent.localizacao,
        invent.valorestim,
        invent.usuario,
        invent.nserie,
        id,
    ];
    return await conn.query(sql, values);
}

async function deleteAsset(id) {
    const conn = await connect();
    const sql = 'DELETE FROM Inventario WHERE patrimonio=?;';
    const values = [id];
    return await conn.query(sql, values);
}

module.exports = {
    connect,
    showInventory: showInventory,
    createITAsset: createITAsset,
    editAsset: editAsset,
    deleteAsset: deleteAsset,
};
