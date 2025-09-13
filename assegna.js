const PASSWORD = "admin123";
let prodotti = [];
let prodottiRiequilibrati = new Set();

// Controllo password
function checkPassword(){
    const input = document.getElementById("password").value;
    if(input === PASSWORD){
        document.getElementById("loginContainer").style.display = "none";
        document.getElementById("appContainer").style.display = "block";
        mostraTabella();
    } else {
        document.getElementById("errorMsg").style.display = "block";
    }
}

// Formattazione euro
function formatEuro(value){
    if(isNaN(value) || value === null || value === undefined) return "";
    return Number(value).toFixed(2).replace('.',',') + " €";
}

// Mostra tabella prodotti
function mostraTabella(){
    let tbody = document.querySelector("#tabellaProdotti tbody");
    tbody.innerHTML = "";

    prodotti.forEach((p, index) => {
        let row = document.createElement("tr");
        row.innerHTML = `
            <td>${index+1}</td>
            <td contenteditable onblur="aggiornaProdotto(${index},'nome',this.innerText)">${p.nome}</td>
            <td>
                <select onchange="aggiornaProdotto(${index},'categoria',this.value)">
                    <option ${p.categoria==="--"?"selected":""}>--</option>
                    <option ${p.categoria==="Scarpe"?"selected":""}>Scarpe</option>
                    <option ${p.categoria==="Abbigliamento"?"selected":""}>Abbigliamento</option>
                    <option ${p.categoria==="Accessori"?"selected":""}>Accessori</option>
                    <option ${p.categoria==="Altro"?"selected":""}>Altro</option>
                </select>
            </td>
            <td contenteditable onblur="aggiornaProdotto(${index},'prezzo_acquisto',this.innerText)">${formatEuro(p.prezzo_acquisto)}</td>
            <td>
                <select onchange="aggiornaProdotto(${index},'venditore',this.value)">
                    <option ${p.venditore==="--"?"selected":""}>--</option>
                    <option ${p.venditore==="Romeo"?"selected":""}>Romeo</option>
                    <option ${p.venditore==="Ricky"?"selected":""}>Ricky</option>
                </select>
            </td>
            <td contenteditable onblur="aggiornaProdotto(${index},'prezzo_vendita',this.innerText)">${formatEuro(p.prezzo_vendita)}</td>
            <td contenteditable onblur="aggiornaProdotto(${index},'vendite_effettive',this.innerText)">${formatEuro(p.vendite_effettive)}</td>
            <td><button onclick="eliminaProdotto(${index})">Elimina</button></td>
        `;
        tbody.appendChild(row);
    });
}

// Aggiorna valori
function aggiornaProdotto(index, campo, valore){
    if(campo==="prezzo_acquisto" || campo==="prezzo_vendita" || campo==="vendite_effettive"){
        valore = valore.replace("€","").replace(",",".");

        let num = parseFloat(valore);
        if(isNaN(num) || num < 0){ alert("Valore non valido"); return; }
        prodotti[index][campo] = num;
    } else {
        prodotti[index][campo] = valore;
    }
    mostraTabella();
    salvaLocalStorage();
}

// Mostra form
function mostraForm(){
    document.getElementById("formContainer").innerHTML = `
        <form onsubmit="aggiungiProdottoForm(event)">
            <input type="text" id="nome" placeholder="Nome prodotto" required>
            <select id="categoria">
                <option>--</option>
                <option>Scarpe</option>
                <option>Abbigliamento</option>
                <option>Accessori</option>
                <option>Altro</option>
            </select>
            <input type="text" id="prezzo_acquisto" placeholder="Prezzo acquisto €" required>
            <input type="text" id="prezzo_vendita" placeholder="Prezzo vendita stimato €">
            <select id="venditore">
                <option>--</option>
                <option>Romeo</option>
                <option>Ricky</option>
            </select>
            <input type="text" id="vendite_effettive" placeholder="Prezzo vendita effettivo €">
            <button type="submit">Aggiungi</button>
        </form>
    `;
}

// Aggiungi prodotto
function aggiungiProdottoForm(event){
    event.preventDefault();
    let nome = document.getElementById("nome").value;
    let categoria = document.getElementById("categoria").value;
    let prezzo_acquisto = parseFloat(document.getElementById("prezzo_acquisto").value.replace(",",".")) || 0;
    let venditore = document.getElementById("venditore").value;
    let prezzo_vendita = parseFloat(document.getElementById("prezzo_vendita").value.replace(",",".")) || null;
    let vendite_effettive = parseFloat(document.getElementById("vendite_effettive").value.replace(",",".")) || null;

    let id = prodotti.length ? Math.max(...prodotti.map(p=>p.id))+1 : 1;
    prodotti.unshift({id,nome,categoria,prezzo_acquisto,venditore,prezzo_vendita,vendite_effettive});

    document.getElementById("formContainer").innerHTML = "";
    mostraTabella();
    salvaLocalStorage();
}

// Elimina prodotto con conferma
function eliminaProdotto(index){
    let nome = prodotti[index].nome;
    if(confirm(`Sei sicuro di voler eliminare "${nome}"?`)){
        prodotti.splice(index,1);
        mostraTabella();
        salvaLocalStorage();
    }
}

// Salvataggio locale
function salvaLocalStorage(){
    localStorage.setItem("prodotti", JSON.stringify(prodotti));
}

// Caricamento locale
function caricaLocalStorage(){
    let salvati = localStorage.getItem("prodotti");
    if(salvati){ prodotti = JSON.parse(salvati); }
}
caricaLocalStorage();

// Algoritmo di assegnazione
function riequilibra(){
    prodottiRiequilibrati.clear();

    let stats = { 
        Romeo: { guadagno:0, fatturato:0 }, 
        Ricky: { guadagno:0, fatturato:0 } 
    };

    prodotti.forEach(p=>{
        if(p.venditore && p.venditore!=="--"){
            let prezzoVendita = p.vendite_effettive || p.prezzo_vendita || 0;
            let guad = prezzoVendita - p.prezzo_acquisto;
            let fatt = prezzoVendita;

            stats[p.venditore].guadagno += guad;
            stats[p.venditore].fatturato += fatt;
        }
    });

    prodotti.forEach(p=>{
        if(!p.venditore || p.venditore==="--"){
            let prezzoVendita = p.vendite_effettive || p.prezzo_vendita || 0;
            let guad = prezzoVendita - p.prezzo_acquisto;
            let fatt = prezzoVendita;

            let guadRomeo = stats.Romeo.guadagno + guad;
            let fattRomeo = stats.Romeo.fatturato + fatt;
            let diffRomeo = Math.abs(guadRomeo - stats.Ricky.guadagno) + Math.abs(fattRomeo - stats.Ricky.fatturato);

            let guadRicky = stats.Ricky.guadagno + guad;
            let fattRicky = stats.Ricky.fatturato + fatt;
            let diffRicky = Math.abs(stats.Romeo.guadagno - guadRicky) + Math.abs(stats.Romeo.fatturato - fattRicky);

            if(diffRomeo <= diffRicky){
                p.venditore = "Romeo";
                stats.Romeo.guadagno = guadRomeo;
                stats.Romeo.fatturato = fattRomeo;
            } else {
                p.venditore = "Ricky";
                stats.Ricky.guadagno = guadRicky;
                stats.Ricky.fatturato = fattRicky;
            }
            prodottiRiequilibrati.add(p.id);
        }
    });

    mostraTabella();
    salvaLocalStorage();
}
