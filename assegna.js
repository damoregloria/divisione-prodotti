let prodotti = [];
let prodottiRiequilibrati = new Set();

// Persistenza
function salvaLocalStorage() {
    localStorage.setItem("prodotti", JSON.stringify(prodotti));
}

function caricaLocalStorage() {
    let dati = localStorage.getItem("prodotti");
    if(dati){
        prodotti = JSON.parse(dati);
        mostraTabella();
    }
}

// Mostra tabella + guadagni
function mostraTabella(){
    let table = document.getElementById("tabella");
    table.innerHTML = `
        <tr>
            <th>Nome</th><th>Categoria</th><th>Prezzo Acquisto</th><th>Margine</th>
            <th>Venditore</th><th>Prezzo Vendita</th><th>Vendite Effettive</th>
        </tr>
    `;

    let guadagni = { Romeo: 0, Ricky: 0 };

    prodotti.forEach((p,index)=>{
        if(!p.prezzo_vendita && p.margine){
            p.prezzo_vendita = Number(p.prezzo_acquisto) + Number(p.margine);
        }

        if(p.venditore && p.prezzo_vendita !== undefined && p.prezzo_acquisto !== undefined){
            guadagni[p.venditore] += (p.prezzo_vendita - p.prezzo_acquisto);
        }

        let bgColor = prodottiRiequilibrati.has(p.id) ? "#d4f7d4" : "";

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

    document.getElementById("guadRomeo").innerText = guadagni.Romeo.toFixed(2);
    document.getElementById("guadRicky").innerText = guadagni.Ricky.toFixed(2);
}

// Modifica tabella con validazione
function modifica(index, campo, valore){
    if(['prezzo_acquisto','margine','prezzo_vendita','vendite_effettive'].includes(campo)){
        let num = Number(valore);
        if(num < 0){ alert("Valore non può essere negativo!"); mostraTabella(); return; }
        prodotti[index][campo] = num;
    } else {
        prodotti[index][campo] = valore;
    }
    salvaLocalStorage();
}

// Aggiungi prodotto dal form
function aggiungiProdottoForm(event){
    event.preventDefault();
    let nome = document.getElementById("nome").value;
    let categoria = document.getElementById("categoria").value;
    let prezzo_acquisto = Number(document.getElementById("prezzo_acquisto").value);
    let margine = Number(document.getElementById("margine").value);
    let prezzo_venditaInput = document.getElementById("prezzo_vendita").value;
    let prezzo_vendita = prezzo_venditaInput ? Number(prezzo_venditaInput) : null;
    let venditoreInput = document.getElementById("venditore").value;
    let venditore = (venditoreInput==="Romeo"||venditoreInput==="Ricky")?venditoreInput:"";

    if(prezzo_acquisto<0 || margine<0 || (prezzo_vendita!==null && prezzo_vendita<0)){ alert("Valori non validi"); return; }

    let id = prodotti.length ? Math.max(...prodotti.map(p=>p.id))+1 : 1;
    prodotti.push({id,nome,categoria,prezzo_acquisto,margine,venditore,prezzo_vendita,vendite_effettive:0});

    document.getElementById("formProdotto").reset();
    mostraTabella();
    salvaLocalStorage();
}

// Riequilibrio automatico
function riequilibra(){
    let guadagni = { Romeo:0, Ricky:0 };
    prodottiRiequilibrati.clear();

    prodotti.forEach(p=>{
        let profitto = p.prezzo_vendita - p.prezzo_acquisto;
        if(!p.venditore){
            if(guadagni.Romeo <= guadagni.Ricky){ p.venditore="Romeo"; guadagni.Romeo+=profitto; }
            else { p.venditore="Ricky"; guadagni.Ricky+=profitto; }
            prodottiRiequilibrati.add(p.id);
        } else { guadagni[p.venditore]+=profitto; }
    });

    mostraTabella();
    salvaLocalStorage();
}

window.onload = function(){ caricaLocalStorage(); };
