(function (doc) {
    if (doc.querySelectorAll('.deletar')) {
        for (let i = 0; i < doc.querySelectorAll('.deletar').length; i++) {
            doc.querySelectorAll('.deletar')[i].addEventListener(
                'click',
                function (event) {
                    if (confirm('Deseja mesmo apagar esse Patrimonio?')) {
                        return true;
                    } else {
                        event.preventDefault();
                    }
                }
            );
        }
    }
})(document);

const editarItems = () => {
    const editItemBtns = document.querySelectorAll('#edit-item-btn');

    editItemBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const itemId = e.target.dataset.itemId;
            console.log('itemId:', itemId);
            const response = await fetch(`/api/items/${itemId}`);
            const data = await response.json();

            data.forEach(data => {
                document.querySelector('#patrimonio').value = data?.patrimonio ?? 'Nada';;
                document.querySelector('#unidade').value = data?.unidade ?? 'Nada';;
                document.querySelector('#descricao').value = data?.descricao ?? 'Nada';;
                document.querySelector('#modelo').value = data?.modelo ?? 'Nada';;
                document.querySelector('#localizacao').value = data?.localizacao ?? 'Nada';;
                document.querySelector('#valorestim').value = data?.valorestim ?? 'Nada';;
                document.querySelector('#usuario').value = data?.usuario ?? 'Nada';
                document.querySelector('#nserie').value = data?.nserie ?? 'Nada';
            });

        });
    })
}
editarItems();

function tableFilter() {
    const button = document.getElementById('filter-btn');
    const input = document.getElementById('input-filter');
    button.addEventListener('click', (event) => {
        const dados = input.value;
        if (!dados) {
            return console.log('Teste');
        } else {
            const url = `${dados}`;
            button.setAttribute('href', url);
            button.click();
        }
    });
}


tableFilter();

const inputValor = document.querySelector('#input-valor-compra');

const formatarValor = (valor) => {
    valor = valor.replace(/\D/g, '');
    valor = (valor / 100).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });

    return valor;
};

inputValor.addEventListener('input', (event) => {
    const valor = event.target.value;
    const valorFormatado = formatarValor(valor);
    event.target.value = valorFormatado;
});

formatarValor();




