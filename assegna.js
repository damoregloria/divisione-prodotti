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
    if(pwd === "1234"){  // password esempio
        document.getElementById("loginDiv").style.display="none";
        document.getElementById("mainDiv").style.display="block";
        caricaLocalStorage();
    } else {
        alert("Password errata!");
    }
}

// Mostra tabella + guadagni (senza card)
function mostraTabella(){
    let table = document.getElementById("tabella");
    table.innerHTML = `
        <tr>
            <th>Nome</th><th>Categoria</th><th>Prezzo Acquisto</th><th>Margine</th>
            <th>Venditore</th><th>Prezzo Vendita</th><th>Vendite Effettive</th>
        </tr>
    `;

    prodotti.forEach((p,index)=>{
        if(!p.prezzo_vendita && p.margine){
            p.prezzo_vendita = Number(p.prezzo_acquisto) + Number(p.margine);
        }

        let bgColor = prodottiRiequilibrati.has(p.id) ? "#d4f7d4" : "";

        let row = table.insertRow();
        row.style.backgroundColor = bgColor;

        row.innerHTML = `
            <td contenteditable="true" onblur="modifica(${index},'nome',this.innerText)">${p.nome}</td>
            <td>
                <select onchange="modifica(${index},'categoria',this.value)">
                    <option value="Scarpe" ${p.categoria==='Scarpe'?'selected':''}>Scarpe</option>
                    <option value="Abbigliamento" ${p.categoria==='Abbigliamento'?'selected':''}>Abbigliamento</option>
                    <option value="Accessori" ${p.categoria==='Accessori'?'selected':''}>Accessori</option>
                    <option value="Altro" ${p.categoria==='Altro'?'selected':''}>Altro</option>
                </select>
            </td>
            <td contenteditable="true" onblur="modifica(${index},'prezzo_acquisto',this.innerText)">${p.prezzo_acquisto}</td>
            <td contenteditable="true" onblur="modifica(${index},'margine',this.innerText)">${p.margine}</td>
            <td contenteditable="true" onblur="modifica(${index},'venditore',this.innerText)">${p.venditore || ''}</td>
            <td contenteditable="true" onblur="modifica(${index},'prezzo_vendita',this.innerText)">${p.prezzo_vendita || ""}</td>
            <td contenteditable="true" onblur="modifica(${index},'vendite_effettive',this.innerText)">${p.vendite_effettive || ""}</td>
        `;
    });
}

// Modifica tabella
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

// Mostra form per aggiungere prodotto
function mostraForm(){
    const container = document.getElementById("formContainer");
    container.innerHTML = `
        <form id="formProdotto" onsubmit="aggiungiProdottoForm(event)">
            <input type="text" id="nome" placeholder="Nome prodotto" required>
            <select id="categoria" required>
                <option value="Scarpe">Scarpe</option>
                <option value="Abbigliamento">Abbigliamento</option>
                <option value="Accessori">Accessori</option>
                <option value="Altro">Altro</option>
            </select>
            <input type="number" id="prezzo_acquisto" placeholder="Prezzo acquisto" min="0" required>
            <input type="number" id="margine" placeholder="Margine" min="0" required>
            <input type="number" id="prezzo_vendita" placeholder="Prezzo vendita (opzionale)" min="0">
            <input type="text" id="venditore" placeholder="Venditore">
            <button type="submit">Aggiungi</button>
        </form>
    `;
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
    let venditore = document.getElementById("venditore").value;

    if(prezzo_acquisto<0 || margine<0 || (prezzo_vendita!==null && prezzo_vendita<0)){ alert("Valori non validi"); return; }

    let id = prodotti.length ? Math.max(...prodotti.map(p=>p.id))+1 : 1;
    prodotti.push({id,nome,categoria,prezzo_acquisto,margine,venditore,prezzo_vendita,vendite_effettive:0});

    document.getElementById("formContainer").innerHTML = "";
    mostraTabella();
    salvaLocalStorage();
}

// Riequilibrio automatico (senza carte guadagni)
function riequilibra(){
    prodottiRiequilibrati.clear();
    prodotti.forEach(p=>{
        if(!p.venditore){ prodottiRiequilibrati.add(p.id); }
    });
    mostraTabella();
    salvaLocalStorage();
}

window.onload = function(){ };
