let prodotti = [];

// Caricamento CSV
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

// Mostra tabella interattiva
function mostraTabella(){
    let table = document.getElementById("tabella");
    table.innerHTML = `
        <tr>
            <th>Nome</th><th>Categoria</th><th>Prezzo Acquisto</th><th>Margine</th>
            <th>Venditore</th><th>Prezzo Vendita</th><th>Vendite Effettive</th>
        </tr>
    `;
    prodotti.forEach((p,index)=>{
        // Calcolo automatico prezzo vendita se mancante
        if(!p.prezzo_vendita && p.margine){
            p.prezzo_vendita = Number(p.prezzo_acquisto) + Number(p.margine);
        }
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

// Modifica valore tabella
function modifica(index, campo, valore){
    if(['prezzo_acquisto','margine','prezzo_vendita','vendite_effettive'].includes(campo)){
        prodotti[index][campo] = Number(valore);
    } else {
        prodotti[index][campo] = valore;
    }
}

// Aggiungi nuovo prodotto
function aggiungiProdotto(){
    let nome = prompt("Nome prodotto:");
    if(!nome) return;
    let categoria = prompt("Categoria:");
    let prezzo_acquisto = Number(prompt("Prezzo d'acquisto:"));
    let margine = Number(prompt("Margine stimato:"));
    let prezzo_vendita = prompt("Prezzo di vendita (opzionale):");
    prezzo_vendita = prezzo_vendita ? Number(prezzo_vendita) : null;
    let venditore = ""; // lascia vuoto, verrà assegnato
    let id = prodotti.length ? Math.max(...prodotti.map(p=>p.id))+1 : 1;
    prodotti.push({id,nome,categoria,prezzo_acquisto,margine,venditore,prezzo_vendita, vendite_effettive:0});
    mostraTabella();
}

// Riequilibrio automatico venditori
function riequilibra(){
    let guadagni = { Romeo: 0, Ricky: 0 };

    prodotti.forEach(p=>{
        let profitto = p.prezzo_vendita - p.prezzo_acquisto;
        // Se venditore non assegnato, lo assegna chi ha meno guadagni stimati
        if(!p.venditore){
            if(guadagni.Romeo <= guadagni.Ricky){
                p.venditore = "Romeo";
                guadagni.Romeo += profitto;
            } else {
                p.venditore = "Ricky";
                guadagni.Ricky += profitto;
            }
        } else {
            // Se già assegnato, aggiorna guadagni stimati
            guadagni[p.venditore] += profitto;
        }
    });

    mostraTabella();
}

// Esporta CSV aggiornato
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

