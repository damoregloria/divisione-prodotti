let prodotti = [];

document.getElementById('csvFile').addEventListener('change', function(e){
    let file = e.target.files[0];
    Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: function(results) {
            prodotti = results.data;
            mostraTabella();
        }
    });
});

function mostraTabella(){
    let table = document.getElementById("tabella");
    table.innerHTML = `
        <tr>
            <th>Nome</th><th>Categoria</th><th>Prezzo Acquisto</th><th>Margine</th>
            <th>Venditore</th><th>Prezzo Vendita</th><th>Vendite Effettive</th>
        </tr>
    `;
    prodotti.forEach((p,index)=>{
        let row = table.insertRow();
        row.innerHTML = `
            <td contenteditable="true" onblur="modifica(${index},'nome',this.innerText)">${p.nome}</td>
            <td contenteditable="true" onblur="modifica(${index},'categoria',this.innerText)">${p.categoria}</td>
            <td contenteditable="true" onblur="modifica(${index},'prezzo_acquisto',this.innerText)">${p.prezzo_acquisto}</td>
            <td contenteditable="true" onblur="modifica(${index},'margine',this.innerText)">${p.margine}</td>
            <td contenteditable="true" onblur="modifica(${index},'venditore',this.innerText)">${p.venditore || ""}</td>
            <td contenteditable="true" onblur="modifica(${index},'prezzo_vendita',this.innerText)">${p.prezzo_vendita || ""}</td>
            <td contenteditable="true" onblur="modifica(${index},'vendite_effettive',this.innerText)">${p.vendite_effettive || ""}</td>
        `;
    });
}

function modifica(index, campo, valore){
    if(['prezzo_acquisto','margine','prezzo_vendita','vendite_effettive'].includes(campo)){
        prodotti[index][campo] = Number(valore);
    } else {
        prodotti[index][campo] = valore;
    }
}

// Funzioni placeholder per riequilibrio e aggiunta prodotto
function riequilibra(){ alert("Riequilibrio non ancora implementato"); }
function aggiungiProdotto(){ alert("Aggiunta prodotto non ancora implementata"); }

function esportaCSV(){
    let csv = Papa.unparse(prodotti);
    let blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = "prodotti_aggiornati.csv";
    a.click();
    URL.revokeObjectURL(url);
}

