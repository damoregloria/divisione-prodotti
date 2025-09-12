let prodotti = [];
let prodottiRiequilibrati = new Set(); // tiene traccia dei prodotti assegnati automaticamente

// Funzione per salvare dati su localStorage
function salvaLocalStorage() {
    localStorage.setItem("prodotti", JSON.stringify(prodotti));
}

// Funzione per caricare dati da localStorage
function caricaLocalStorage() {
    let dati = localStorage.getItem("prodotti");
    if(dati){
        prodotti = JSON.parse(dati);
        mostraTabella();
        return true;
    }
    return false;
}

// Caricamento CSV (solo se localStorage vuoto)
document.getElementById('csvFile').addEventListener('change', function(e){
    if(caricaLocalStorage()) return;

    let file = e.target.files[0];
    Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: function(results) {
            prodotti = results.data;
            mostraTabella();
            salvaLocalStorage();
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

        let bgColor = prodottiRiequilibrati.has(p.id) ? "#d4f7d4" : ""; // evidenza verde chiaro

        let row = table.insertRow();
        row.style.backgroundColor = bgColor;

        row.innerHTML = `
            <td contenteditable="true" onblur="modifica(${index},'nome',this.innerText)">${p.nome}</td>
            <td contenteditable="true" onblur="modifica(${index},'categoria',this.innerText)">${p.categoria}</td>
            <td contenteditable="true" onblur="modifica(${index},'prezzo_acquisto',this.innerText)">${p.prezzo_acquisto}</td>
            <td contenteditable="true" onblur="modifica(${index},'margine',this.innerText)">${p.margine}</td>
            <td>
                <select onchange="modifica(${index},'venditore',this.value)">
                    <option value="">--</option>
                    <option value="Romeo" ${p.venditore==='Romeo'?'selected':''}>Romeo</option>
                    <option value="Ricky" ${p.venditore==='Ricky'?'selected':''}>Ricky</option>
                </select>
            </td>
            <td contenteditable="true" onblur="modifica(${index},'prezzo_vendita',this.innerText)">${p.prezzo_vendita || ""}</td>
            <td contenteditable="true" onblur="modifica(${index},'vendite_effettive',this.innerText)">${p.vendite_effettive || ""}</td>
        `;
    });
}

// Modifica valore tabella con validazione
function modifica(index, campo, valore){
    if(['prezzo_acquisto','margine','prezzo_vendita','vendite_effettive'].includes(campo)){
        let num = Number(valore);
        if(num < 0){
            alert("Valore non può essere negativo!");
            mostraTabella();
            return;
        }
        prodotti[index][campo] = num;
    } else {
        prodotti[index][campo] = valore;
    }
    salvaLocalStorage();
}

// Aggiungi nuovo prodotto
function aggiungiProdotto(){
    let nome = prompt("Nome prodotto:");
    if(!nome) return;
    let categoria = prompt("Categoria:");
    let prezzo_acquisto = Number(prompt("Prezzo d'acquisto:"));
    if(prezzo_acquisto < 0) { alert("Prezzo non può essere negativo"); return; }
    let margine = Number(prompt("Margine stimato:"));
    if(margine < 0) { alert("Margine non può essere negativo"); return; }
    let prezzo_vendita = prompt("Prezzo di vendita (opzionale):");
    prezzo_vendita = prezzo_vendita ? Number(prezzo_vendita) : null;
    if(prezzo_vendita !== null && prezzo_vendita < 0){ alert("Prezzo vendita non può essere negativo"); return; }
    let venditore = prompt("Venditore (Romeo/Ricky, opzionale):","");
    venditore = (venditore === "Romeo" || venditore === "Ricky") ? venditore : "";
    let id = prodotti.length ? Math.max(...prodotti.map(p=>p.id))+1 : 1;
    prodotti.push({id,nome,categoria,prezzo_acquisto,margine,venditore,prezzo_vendita, vendite_effettive:0});
    mostraTabella();
    salvaLocalStorage();
}

// Riequilibrio automatico venditori con evidenza
function riequilibra(){
    let guadagni = { Romeo: 0, Ricky: 0 };
    prodottiRiequilibrati.clear();

    prodotti.forEach(p=>{
        let profitto = p.prezzo_vendita - p.prezzo_acquisto;
        if(!p.venditore){
            if(guadagni.Romeo <= guadagni.Ricky){
                p.venditore = "Romeo";
                guadagni.Romeo += profitto;
            } else {
                p.venditore = "Ricky";
                guadagni.Ricky += profitto;
            }
            prodottiRiequilibrati.add(p.id); // segna come appena assegnato
        } else {
            guadagni[p.venditore] += profitto;
        }
    });

    mostraTabella();
    salvaLocalStorage();
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

// Caricamento automatico all’apertura
window.onload = function(){
    caricaLocalStorage();
};
