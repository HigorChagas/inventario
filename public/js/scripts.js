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

function tableFilter() {
    const button = document.getElementById('filter-btn');
    const input = document.getElementById('input-filter');
    button.addEventListener('click', (event) => {
        const dados = input.value;
        const url = `/${dados}`;
        button.setAttribute('href', url);
        button.click();
    });
}

tableFilter();