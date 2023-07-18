const inventoryModel = require('../models/inventoryModel');
const database = require('../database/database');

const renderInventory = async (req, res) => {
    try {
        const listing = await inventoryModel.showInventory();
        const input = JSON.parse(JSON.stringify(req.body));
        const id = input && input['input-filter'];

        const { successMessage, errorMessage } = req.session;

        delete req.session.successMessage;
        delete req.session.errorMessage;

        res.render('../src/views/inventario', {
            listing,
            id: id,
            item: {},
            successMessage,
            errorMessage,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Ocorreu um erro ao exibir os dados do servidor');
    }
};

const searchItem = async (req, res) => {
    try {
        const itemId = req.params.id;
        const rows = await inventoryModel.searchItem(itemId);
        if (rows.length === 0) {
            res.status(401).render('../src/views/inventario', {
                errorMessage: 'Item não encontrado'
            })
        } else {
            res.render('../src/views/inventario', {
                listing: rows,
                itemId: itemId,
                item: {},
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({
            errorMessage: 'Ocorreu um erro ao listar o item',
        });
    }
}

const searchItemAPI = async (req, res) => {
    try {
        const itemId = parseInt(req.params.id);
        if (!Number.isInteger(itemId)) {
            throw new Error('O ID do item deve ser um número inteiro. ');
        }
        const connection = await database.connect();
        const result = await connection.query(
            'SELECT * FROM Inventario WHERE patrimonio = ?',
            [itemId]
        );
        connection.release();
        res.json(result[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send({
            mensagem: 'Ocorreu um erro ao buscar as informações do item'
        });
    }
}

const addItem = async (req, res) => {
    const {
        'input-valor-compra': valorCompra,
        'input-patrimonio': patrimonio,
        'input-unidade': unidade,
        'input-descricao': descricao,
        'input-modelo': modelo,
        'input-departamento': localizacao,
        'input-usuario': usuario,
        'input-serie': nserie,
    } = req.body

    const inputDate = req.body['input-data'];
    let formattedDate = null

    if (inputDate) {
        const dateObj = new Date(inputDate);
        formattedDate = dateObj.toISOString().split('T')[0];
    }

    if(!unidade || unidade == 'Selecione a unidade...') {
        req.session.errorMessage = 'Por favor, selecione uma unidade válida.'
        res.redirect('/inventario');
        return;
    }

    const currencyRegex = /[\D]/g;
    const valorCompraNumerico = Number(valorCompra?.replace(currencyRegex, '').replace(',', '.'));
    const inventoryData = {
        patrimonio,
        unidade,
        descricao,
        modelo,
        localizacao,
        valorestim: valorCompraNumerico,
        usuario,
        nserie,
        data_compra: formattedDate,
    };

    try {
        const itemExists = await inventoryModel.checkItemExists(patrimonio);
        if(itemExists) {
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
}

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
}

const editItem = async (req, res) => {
    try {
        const itemId = req.params.id;
        const { unidade, descricao, modelo, localizacao, valorestim, usuario, nserie } = req.body;

        const inputDate = req.body['input-data'];
        let formattedDate = null

        if(!unidade) {
            req.session.errorMessage = 'Por favor, selecione uma unidade válida.'
            res.redirect('/inventario');
            return;
        }

        if (inputDate) {
            const dateObj = new Date(inputDate);
            formattedDate = dateObj.toISOString().split('T')[0];
        }

        const currencyRegex = /[^0-9,-]/g;
        const valorCompraNumerico = parseFloat(valorestim?.replace(currencyRegex, '').replace(',', '.'));

        let valorFormatado;
        if (Math.abs(valorCompraNumerico) < 10000) {
            valorFormatado = valorCompraNumerico.toFixed(2).padStart(7, '0');
        } else {
            valorFormatado = valorCompraNumerico.toFixed(2);
            valorFormatado / 100;
        }

        await inventoryModel.editAsset(itemId, {
            unidade,
            descricao,
            modelo,
            localizacao,
            valorestim: valorFormatado,
            usuario,
            nserie,
            data_compra: formattedDate
        });

        req.session.successMessage = 'Item editado com sucesso';
        res.redirect('/inventario');
    } catch (error) {
        console.error(error);
        res.status(500).send({
            mensagem: 'Ocorreu um erro ao atualizar os dados',
        });
    }
}

module.exports = {
    renderInventory,
    searchItem,
    searchItemAPI,
    addItem,
    deleteItem,
    editItem,
};
