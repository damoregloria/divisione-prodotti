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

// Login password
function login(){
    const pwd = document.getElementById("password").value;
    if(pwd === "1234"){
        document.getElementById("loginDiv").style.display="none";
        document.getElementById("mainDiv").style.display="block";
        caricaLocalStorage();
    } else {
        alert("Password errata!");
    }
}

// Formatta prezzo con centesimi
function formatEuro(value){
    return Number(value).toFixed(2).replace('.',',') + ' €';
}

// Mostra tabella
function mostraTabella(){
    let table = document.getElementById("tabella");
    table.innerHTML = `
        <tr>
            <th>#</th>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Prezzo Acquisto</th>
            <th>Prezzo Vendita Stimato</th>
            <th>Venditore</th>
            <th>Prezzo Vendita Effettivo</th>
            <th>Azioni</th>
        </tr>
    `;

    prodotti.forEach((p,index)=>{
        // calcolo automatico prezzo vendita stimato
        if((p.prezzo_vendita===null || p.prezzo_vendita===undefined)){
            p.prezzo_vendita = Number(p.prezzo_acquisto);
        }

        let bgColor = prodottiRiequilibrati.has(p.id) ? "#d4f7d4" : "";

        let row = table.insertRow();
        row.style.backgroundColor = bgColor;

        row.innerHTML = `
            <td>${index+1}</td>
            <td contenteditable="true" onblur="modifica(${index},'nome',this.innerText)">${p.nome}</td>
            <td>
                <select onchange="modifica(${index},'categoria',this.value)">
                    <option value="">--</option>
                    <option value="Scarpe" ${p.categoria==='Scarpe'?'selected':''}>Scarpe</option>
                    <option value="Abbigliamento" ${p.categoria==='Abbigliamento'?'selected':''}>Abbigliamento</option>
                    <option value="Accessori" ${p.categoria==='Accessori'?'selected':''}>Accessori</option>
                    <option value="Altro" ${p.categoria==='Altro'?'selected':''}>Altro</option>
                </select>
            </td>
            <td contenteditable="true" onblur="modifica(${index},'prezzo_acquisto',this.innerText)">${formatEuro(p.prezzo_acquisto)}</td>
            <td>
                <select onchange="modifica(${index},'venditore',this.value)">
                    <option value="">--</option>
                    <option value="Romeo" ${p.venditore==='Romeo'?'selected':''}>Romeo</option>
                    <option value="Ricky" ${p.venditore==='Ricky'?'selected':''}>Ricky</option>
                </select>
            </td>
            <td>${p.prezzo_vendita ? formatEuro(p.prezzo_vendita) : ''}</td>
            <td contenteditable="true" onblur="modifica(${index},'vendite_effettive',this.innerText)">${p.vendite_effettive ? formatEuro(p.vendite_effettive) : ''}</td>
            <td><button onclick="eliminaProdotto(${index})">Elimina</button></td>
        `;
    });
}

// Modifica tabella
function modifica(index, campo, valore){
    valore = valore.replace('€','').replace(',','.');
    if(['prezzo_acquisto','prezzo_vendita','vendite_effettive'].includes(campo)){
        let num = Number(valore.trim());
        if(isNaN(num) || num < 0){ alert("Valore non valido"); mostraTabella(); return; }
        prodotti[index][campo] = num;

        // ricalcolo automatico prezzo vendita stimato
        if(campo==='prezzo_acquisto' && (!prodotti[index].prezzo_vendita || prodotti[index].prezzo_vendita===0)){
            prodotti[index].prezzo_vendita = Number(prodotti[index].prezzo_acquisto);
        }
    } else {
        prodotti[index][campo] = valore;
    }
    mostraTabella();
    salvaLocalStorage();
}

// Mostra form per aggiungere prodotto
function mostraForm(){
    const container = document.getElementById("formContainer");
    container.innerHTML = `
        <form id="formProdotto" onsubmit="aggiungiProdottoForm(event)">
            <input type="text" id="nome" placeholder="Nome prodotto" required>
            <select id="categoria" required>
                <option value="">--</option>
                <option value="Scarpe">Scarpe</option>
                <option value="Abbigliamento">Abbigliamento</option>
                <option value="Accessori">Accessori</option>
                <option value="Altro">Altro</option>
            </select>
            <input type="text" id="prezzo_acquisto" placeholder="Prezzo acquisto (€)" required>
            <input type="text" id="prezzo_vendita" placeholder="Prezzo vendita stimato (opzionale)">
            <select id="venditore">
                <option value="">--</option>
                <option value="Romeo">Romeo</option>
                <option value="Ricky">Ricky</option>
            </select>
            <button type="submit">Aggiungi</button>
        </form>
    `;
}

// Aggiungi prodotto dal form (all’inizio)
function aggiungiProdottoForm(event){
    event.preventDefault();
    let nome = document.getElementById("nome").value;
    let categoria = document.getElementById("categoria").value;
    let prezzo_acquisto = document.getElementById("prezzo_acquisto").value.replace(',','.');
    let prezzo_venditaInput = document.getElementById("prezzo_vendita").value.replace(',','.');
    let prezzo_vendita = prezzo_venditaInput ? Number(prezzo_venditaInput) : null;
    let venditore = document.getElementById("venditore").value;

    prezzo_acquisto = Number(prezzo_acquisto);
    if(isNaN(prezzo_acquisto) || prezzo_acquisto<0 || (prezzo_vendita!==null && prezzo_vendita<0)){ 
        alert("Valori non validi"); 
        return; 
    }

    let id = prodotti.length ? Math.max(...prodotti.map(p=>p.id))+1 : 1;
    prodotti.unshift({id,nome,categoria,prezzo_acquisto,venditore,prezzo_vendita,vendite_effettive:0});

    document.getElementById("formContainer").innerHTML = "";
    mostraTabella();
    salvaLocalStorage();
}

// Elimina prodotto con conferma
function eliminaProdotto(index){
    let nome = prodotti[index].nome || "questo prodotto";
    if(confirm(`Sei sicuro di voler eliminare "${nome}"?`)){
        prodotti.splice(index,1);
        mostraTabella();
        salvaLocalStorage();
    }
}

// Riequilibrio automatico
function riequilibra(){
    prodottiRiequilibrati.clear();
    prodotti.forEach(p=>{
        if(!p.venditore){ prodottiRiequilibrati.add(p.id); }
    });
    mostraTabella();
    salvaLocalStorage();
}

window.onload = function(){ };
