const editItems = () => {
  const editItemBtns = document.querySelectorAll('#edit-item-btn');

  editItemBtns.forEach((btn) => {
    btn.addEventListener('click', async (event) => {
      const { itemId } = event.target.dataset;
      const response = await fetch(`/api/items/${itemId}`);
      const data = await response.json();

      data.forEach((dataValue) => {
        document.querySelector('#patrimonio').value = dataValue?.patrimony ?? 'Sem item';
        document.querySelector('#unidade').value = dataValue?.affiliate ?? 'Sem item';
        document.querySelector('#descricao').value = dataValue?.description ?? 'Sem item';
        document.querySelector('#modelo').value = dataValue?.model ?? 'Sem item';
        document.querySelector('#localizacao').value = dataValue?.department ?? 'Sem item';
        document.querySelector('#valorestim').value = dataValue?.assetValue ?? 'Sem item';
        document.querySelector('#usuario').value = dataValue?.user ?? 'Sem item';
        document.querySelector('#nserie').value = dataValue?.serialNumber ?? 'Sem item';
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
      'copy', 'excel', 'print', 'colvis',
    ],
    scrollX: true,
  });
});

$('#input-valor-compra, #valorestim').maskMoney({
  prefix: 'R$',
});
