document.addEventListener('click', function (event) {
    if (event.target.classList.contains('deletar')) {
        if (confirm('Deseja mesmo apagar esse Patrimônio?')) {
            const itemId = event.target.dataset.itemId;
            fetch(`/api/items/${itemId}`, {
                method: 'DELETE'
            }).then(response => {
                console.log('Item deletado com sucesso!');
            }).catch(error => {
                console.error('Erro ao deletar o item:', error);
            });
        }
    }
});

const editItems = () => {
    const editItemBtns = document.querySelectorAll('#edit-item-btn');

    editItemBtns.forEach(btn => {
        btn.addEventListener('click', async (event) => {
            const itemId = event.target.dataset.itemId;
            const response = await fetch(`/api/items/${itemId}`);
            const data = await response.json();

            data.forEach(data => {
                document.querySelector('#patrimonio').value = data?.patrimonio ?? 'Nada';
                document.querySelector('#unidade').value = data?.unidade ?? 'Nada';
                document.querySelector('#descricao').value = data?.descricao ?? 'Nada';
                document.querySelector('#modelo').value = data?.modelo ?? 'Nada';
                document.querySelector('#localizacao').value = data?.localizacao ?? 'Nada';
                document.querySelector('#valorestim').value = data?.valorestim ?? 'Nada';
                document.querySelector('#usuario').value = data?.usuario ?? 'Nada';
                document.querySelector('#nserie').value = data?.nserie ?? 'Nada';
            });
        });
    })
}
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
}

formSubmit();

$(document).ready(function () {
    $('#table').DataTable({
        dom: 'Bfrtip',
        buttons: [
            'copy', 'excel', 'print',
        ],
    });
});

$('#input-valor-compra, #valorestim').maskMoney({
    prefix: 'R$'
})

