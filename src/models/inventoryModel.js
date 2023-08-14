const { connect } = require('../database/database');

async function showInventory() {
  const connection = await connect();
  try {
    const [rows] = await connection.execute('SELECT * FROM Inventario');

    // eslint-disable-next-line consistent-return
    rows.forEach((row) => {
      const newRow = { ...row };
      if (row.data_compra !== null) {
        const dateValue = row.data_compra.toISOString();
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        newRow.formattedBuyDate = new Date(dateValue).toLocaleDateString('pt-BR', options);
      } else {
        newRow.formattedBuyDate = 'Sem data';
      }

      if (row.valorestim !== null) {
        const formattedValue = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(row.valorestim);

        return formattedValue;
      }
    });
    return rows;
  } catch (error) {
    console.error('Erro ao mostrar o inventário', error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

async function checkItemExists(patrimony) {
  let connection;
  try {
    connection = await connect();
    const sql = 'SELECT * FROM Inventario WHERE patrimonio = ?;';
    const values = [patrimony];
    const [rows] = await connection.execute(sql, values);
    return rows.length > 0;
  } catch (error) {
    console.error('Erro ao verificar a existência do item no banco de dados', error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

async function createITAsset(inventory) {
  let connection;
  const {
    patrimonio, unidade, descricao, modelo, localizacao, valorestim, usuario, nserie, data_compra,
  } = inventory;
  try {
    connection = await connect();

    const insertSql = 'INSERT INTO Inventario (patrimonio, unidade, descricao, modelo, localizacao, valorestim, usuario, nserie, data_compra) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);';
    const values = [
      patrimonio,
      unidade,
      descricao,
      modelo,
      localizacao,
      valorestim,
      usuario,
      nserie,
      data_compra,
    ];
    // eslint-disable-next-line max-len
    const fieldsToCheck = [patrimonio, unidade, descricao, modelo, localizacao, valorestim, usuario, nserie];
    if (fieldsToCheck.some((field) => !field)) {
      throw new Error('Dados inválidos');
    }
    return await connection.execute(insertSql, values);
  } catch (error) {
    console.error('Erro ao registrar item no banco de dados', error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

async function editAsset(id, inventory) {
  let connection;
  try {
    connection = await connect();

    const sql = 'UPDATE Inventario SET unidade=?, descricao=?, modelo=?, localizacao=?, valorestim=?, usuario=?, nserie=?, data_compra=? WHERE patrimonio=?;    ';
    const values = [
      inventory.unidade,
      inventory.descricao,
      inventory.modelo,
      inventory.localizacao,
      inventory.valorestim,
      inventory.usuario,
      inventory.nserie,
      inventory.data_compra,
      id,
    ];
    return await connection.query(sql, values);
  } catch (error) {
    console.error('Erro ao editar itens no banco de dados', error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

async function deleteAsset(id) {
  let connection;
  try {
    connection = await connect();
    const sql = 'DELETE FROM Inventario WHERE patrimonio=?;';
    const values = [id];
    return await connection.query(sql, values);
  } catch (error) {
    console.error('Erro ao excluir item do banco de dados', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function searchItem(itemId) {
  try {
    const conn = await connect();
    const [rows] = await conn.execute('SELECT * FROM Inventario WHERE patrimonio = ?', [itemId]);
    return rows;
  } catch (error) {
    console.error('Erro ao buscar item', error);
    throw error;
  }
}

module.exports = {
  showInventory,
  createITAsset,
  editAsset,
  deleteAsset,
  searchItem,
  checkItemExists,
};
