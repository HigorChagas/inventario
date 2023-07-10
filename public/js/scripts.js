(function (document) {
    if (document.querySelectorAll('.deletar')) {
        for (let i = 0; i < document.querySelectorAll('.deletar').length; i++) {
            document.querySelectorAll('.deletar')[i].addEventListener(
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


// const inputValue = document.querySelectorAll('input[name=input-valor-compra], input[name=valorestim]');

// const formatValue = (value) => {
//     value = value.replace(/\D/g, '');
//     value = (value / 100)

//     return value;
// };
// inputValue.forEach(value => {
//     value.addEventListener('input', (event) => {
//         const formattedValue = formatValue(event.target.value);
//         event.target.value = formattedValue;
//         console.log(event.target.value);
//     });
// });

const exportToExcel = () => {
    const table = document.getElementById('table');
    const workbook = XLSX.utils.table_to_book(table);
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const fileName = 'inventario.xlsx';

    saveAs(blob, fileName);
}

document.getElementById('export-btn').addEventListener('click', exportToExcel);


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
    const formBtn = form.querySelector('[type="submit"]');
    const patrimonio = form.querySelector('#patrimonio');
    formBtn.addEventListener('click', () => {
        const itemId = parseInt(patrimonio.value, 10);

        if (typeof itemId !== 'number') return;

        const newRoute = `/items/${itemId}`;
        form.setAttribute('action', newRoute);
        form.submit();
    });
}

formSubmit();


new DataTable('#table', {
    info: false,
    scrollX: false
});

$('#input-valor-compra, #valorestim').maskMoney({
    prefix: 'R$'
})

