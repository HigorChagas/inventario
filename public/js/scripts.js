document.addEventListener('click', (event) => {
  if (event.target.classList.contains('delete')) {
    if (confirm('Deseja mesmo apagar esse Patrimônio?')) {
      const { itemId } = event.target.dataset;
      fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
      }).then(() => {
        console.log('Item deletado com sucesso!');
      }).catch((error) => {
        console.error('Erro ao deletar o item:', error);
      });
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
        document.querySelector('#patrimonio').value = dataValue?.patrimonio ?? 'Nada';
        document.querySelector('#unidade').value = dataValue?.unidade ?? 'Nada';
        document.querySelector('#descricao').value = dataValue?.descricao ?? 'Nada';
        document.querySelector('#modelo').value = dataValue?.modelo ?? 'Nada';
        document.querySelector('#localizacao').value = dataValue?.localizacao ?? 'Nada';
        document.querySelector('#valorestim').value = dataValue?.valorestim ?? 'Nada';
        document.querySelector('#usuario').value = dataValue?.usuario ?? 'Nada';
        document.querySelector('#nserie').value = dataValue?.nserie ?? 'Nada';
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
