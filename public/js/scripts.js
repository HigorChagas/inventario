document.addEventListener('click', async (event) => {
  if (event.target.classList.contains('delete')) {
    event.stopPropagation();
    const { itemId } = event.target.dataset;
    const message = 'Deseja mesmo apagar esse Patrimônio?';
    const shouldDelete = window.confirm(message);

    if (shouldDelete) {
      try {
        const response = await fetch(`/api/items/${itemId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          console.log('Item deletado com sucesso!');
        } else {
          console.error('Erro ao deletar o item:', response.status);
        }
      } catch (error) {
        console.error('Erro ao deletar o item:', error);
      }
    }
  }
});

const editItems = () => {
  const editItemBtns = document.querySelectorAll('#edit-item-btn');

  editItemBtns.forEach((btn) => {
    btn.addEventListener('click', async (event) => {
      const { itemId } = event.target.dataset;
      const response = await fetch(`/api/items/${itemId}`);
      const data = await response.json();

      data.forEach((dataValue) => {
        document.querySelector('#patrimonio').value = dataValue?.patrimony ?? 'Nada';
        document.querySelector('#unidade').value = dataValue?.affiliate ?? 'Nada';
        document.querySelector('#descricao').value = dataValue?.description ?? 'Nada';
        document.querySelector('#modelo').value = dataValue?.model ?? 'Nada';
        document.querySelector('#localizacao').value = dataValue?.department ?? 'Nada';
        document.querySelector('#valorestim').value = dataValue?.assetValue ?? 'Nada';
        document.querySelector('#usuario').value = dataValue?.user ?? 'Nada';
        document.querySelector('#nserie').value = dataValue?.serialNumber ?? 'Nada';
        document.querySelector('#modal-data').value = new Date(dataValue.purchaseDate).toLocaleDateString('pt-BR').split('/').reverse()
          .join('-');
      });
    });
  });
};
editItems();

const formSubmit = () => {
  const form = document.querySelector('#modal-form');
  const patrimonio = form.querySelector('#patrimonio');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const itemId = parseInt(patrimonio.value, 10);

    if (Number.isInteger(itemId) && itemId > 0) {
      const newRoute = `/items/${itemId}`;
      form.setAttribute('action', newRoute);
      form.submit();
    } else {
      // eslint-disable-next-line no-alert
      alert('Por favor, insira um ID de item válido.');
    }
  });
};

formSubmit();

$(document).ready(() => {
  $('#table').DataTable({
    dom: 'Bfrtip',
    buttons: [
      'copy', 'excel', 'print',
    ],
  });
});

$('#input-valor-compra, #valorestim').maskMoney({
  prefix: 'R$',
});
