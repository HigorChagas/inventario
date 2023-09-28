const bcrypt = require('bcrypt');
const { connect } = require('../database/database');

async function showInventory() {
  const connection = await connect();
  try {
    const [rows] = await connection.execute('SELECT * FROM Inventario');

    // eslint-disable-next-line consistent-return
    rows.forEach((row) => {
      const newRow = { ...row };
      if (row.purchaseDate !== null) {
        try {
          const dateValue = row.purchaseDate.toISOString();
          const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
          newRow.formattedBuyDate = new Date(dateValue).toLocaleDateString('pt-BR', options);
        } catch (error) {
          console.error(`Erro ao formatar data: ${error.message}`);
          newRow.formattedBuyDate = 'Data inválida';
        }
      }

      if (row.assetValue !== null) {
        const formattedValue = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(row.assetValue);

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
    const sql = 'SELECT * FROM Inventario WHERE patrimony = ?;';
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
    patrimony,
    affiliate,
    description,
    model,
    department,
    assetValue,
    user,
    serialNumber,
    formattedDate,
    depreciatedValue,
    currentAssetValue,
  } = inventory;

  try {
    connection = await connect();

    const insertSql = 'INSERT INTO Inventario (patrimony, affiliate, description, model, department, assetValue, user, serialNumber, purchaseDate, depreciatedValue, currentValue) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';
    const values = [
      patrimony,
      affiliate,
      description,
      model,
      department,
      assetValue,
      user,
      serialNumber,
      formattedDate,
      depreciatedValue,
      currentAssetValue,
    ];

    // eslint-disable-next-line max-len
    const fieldsToCheck = [patrimony, affiliate, description, model, department, assetValue, user, serialNumber];
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

    const sql = 'UPDATE Inventario SET affiliate=?, description=?, model=?, department=?, assetValue=?, user=?, serialNumber=?, purchaseDate=?, depreciatedValue=?, currentValue=? WHERE patrimony=?;';
    const values = [
      inventory.affiliate,
      inventory.description,
      inventory.model,
      inventory.department,
      inventory.assetValueFormated,
      inventory.user,
      inventory.serialNumber,
      inventory.formattedDate,
      inventory.depreciatedValue,
      inventory.currentAssetValue,
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
    const sql = 'DELETE FROM Inventario WHERE patrimony=?;';
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

async function getUserByEmail(email) {
  const connection = await connect();
  if (connection) {
    try {
      const results = await connection.query('SELECT * FROM users WHERE email=?', [email]);
      return results;
    } catch (error) {
      console.error(error);
      return null;
    } finally {
      connection.release();
    }
  }
  return null;
}

async function insertUser(username, name, email, password) {
  const connection = await connect();
  if (connection) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const query = 'INSERT INTO users (username, name, email, password, created_at, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)';
      await connection.query(query, [username, name, email, hashedPassword]);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      connection.release();
    }
  }
  return false;
}

module.exports = {
  showInventory,
  createITAsset,
  editAsset,
  deleteAsset,
  checkItemExists,
  getUserByEmail,
  insertUser,
};
