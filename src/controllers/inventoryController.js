const inventoryModel = require('../models/inventoryModel');
const database = require('../database/database');

const renderInventory = async (req, res) => {
  const listing = await inventoryModel.showInventory();
  const { input } = req.body;
  const id = input && input['input-filter'];

  const { successMessage, errorMessage } = req.session;
  req.session.successMessage = undefined;
  req.session.errorMessage = undefined;

  res.render('../src/views/inventario', {
    listing,
    id,
    item: {},
    successMessage,
    errorMessage,
  });
};

const searchItemAPI = async (req, res) => {
  try {
    const itemId = parseInt(req.params.id, 10);
    if (!Number.isInteger(itemId)) {
      throw new Error('O ID do item deve ser um número inteiro. ');
    }

    const connection = await database.connect();
    const result = await connection.query(
      'SELECT * FROM Inventario WHERE patrimony = ?',
      [itemId],
    );
    connection.release();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      mensagem: 'Ocorreu um erro ao buscar as informações do item',
    });
  }
};

const addItem = async (req, res) => {
  const {
    'input-valor-compra': assetValue,
    'input-patrimonio': patrimony,
    'input-unidade': affiliate,
    'input-descricao': description,
    'input-modelo': model,
    'input-departamento': department,
    'input-usuario': user,
    'input-serie': serialNumber,
  } = req.body;

  const inputDate = req.body['input-data'];
  let formattedDate = null;
  if (inputDate) {
    const dateObj = new Date(inputDate);
    [formattedDate] = dateObj.toISOString().split('T');
  }

  if (!affiliate || affiliate === 'Selecione a unidade...') {
    req.session.errorMessage = 'Por favor, selecione uma unidade válida.';
    res.redirect('/inventario');
    return;
  }

  const currencyRegex = /[\D]/g;
  const assetValueFormated = Number(assetValue?.replace(currencyRegex, '').replace(',', '.'));
  const inventoryData = {
    patrimony,
    affiliate,
    description,
    model,
    department,
    assetValue: assetValueFormated,
    user,
    serialNumber,
    formattedDate,
  };

  try {
    const itemExists = await inventoryModel.checkItemExists(patrimony);
    if (itemExists) {
      req.session.errorMessage = 'O item já existe no inventário.';
      res.redirect('/inventario');
      return;
    }

    await inventoryModel.createITAsset(inventoryData);
    req.session.successMessage = 'Item adicionado com sucesso!';
    res.redirect('/inventario');
  } catch (error) {
    console.error(error);
    res.status(500).send({
      mensagem: 'Ocorreu um erro ao inserir os dados',
    });
  }
};

const deleteItem = async (req, res) => {
  try {
    const userId = req.params.id;
    await inventoryModel.deleteAsset(userId);

    req.session.successMessage = 'Item deletado com sucesso!';
    res.redirect('/inventario');
  } catch (error) {
    console.error(error);
    res.status(500).send('Ocorreu um erro ao excluir os dados');
  }
};

const editItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    const {
      unidade: affiliate,
      descricao: description,
      modelo: model,
      localizacao: department,
      valorestim: assetValue,
      usuario: user,
      nserie: serialNumber,
    } = req.body;

    const inputDate = req.body['modal-data'];
    let formatedDate = null;

    if (!affiliate) {
      req.session.errorMessage = 'Por favor, selecione uma unidade válida.';
      res.redirect('/inventario');
      return;
    }

    if (inputDate) {
      const dateObj = new Date(inputDate);
      [formatedDate] = dateObj.toISOString().split('T');
    }
    const currencyRegex = /[\D]/g;
    const assetValueFormated = Number(assetValue?.replace(currencyRegex, '').replace(',', '.'));

    await inventoryModel.editAsset(itemId, {
      affiliate,
      description,
      model,
      department,
      assetValueFormated,
      user,
      serialNumber,
      formatedDate,
    });

    req.session.successMessage = 'Item editado com sucesso';
    res.redirect('/inventario');
  } catch (error) {
    console.error(error);
    res.status(500).send({
      mensagem: 'Ocorreu um erro ao atualizar os dados',
    });
  }
};

module.exports = {
  renderInventory,
  searchItemAPI,
  addItem,
  deleteItem,
  editItem,
};
