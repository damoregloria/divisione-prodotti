let prodotti = JSON.parse(localStorage.getItem("prodotti")) || [];
let prodottiRiequilibrati = new Set();
const PASSWORD = "ciao123";

// ----------------- LOGIN -----------------
function checkPassword(){
  let pw = document.getElementById("passwordInput").value;
  if(pw === PASSWORD){
    document.getElementById("loginDiv").style.display = "none";
    document.getElementById("mainDiv").style.display = "block";
    mostraTabella();
  } else {
    alert("Password errata");
  }
}

// ----------------- FORMATTAZIONE -----------------
function formatEuro(value){
  if(isNaN(value) || value === null) return "€ 0,00";
  return "€ " + Number(value).toFixed(2).replace('.',',');
}

function parseNumero(val){
  if(!val) return 0;
  return Number(val.toString().replace(',','.'));
}

// ----------------- STORAGE -----------------
function salvaLocalStorage(){
  localStorage.setItem("prodotti", JSON.stringify(prodotti));
}

// ----------------- MOSTRA TABELLA -----------------
function mostraTabella(){
  let tbody = document.querySelector("#tabellaProdotti tbody");
  tbody.innerHTML = "";

  prodotti.forEach((p,index)=>{
    let row = document.createElement("tr");
    if(prodottiRiequilibrati.has(p.id)) row.style.backgroundColor = "#f0fff0";

    row.innerHTML = `
      <td>${index+1}</td>
      <td contenteditable onblur="aggiorna(${index},'nome',this.innerText)">${p.nome}</td>
      <td>
        <select onchange="aggiorna(${index},'categoria',this.value)">
          <option ${p.categoria=="--"?"selected":""}>--</option>
          <option ${p.categoria=="Scarpe"?"selected":""}>Scarpe</option>
          <option ${p.categoria=="Abbigliamento"?"selected":""}>Abbigliamento</option>
          <option ${p.categoria=="Accessori"?"selected":""}>Accessori</option>
          <option ${p.categoria=="Altro"?"selected":""}>Altro</option>
        </select>
      </td>
      <td contenteditable onblur="aggiorna(${index},'prezzo_acquisto',this.innerText)">${formatEuro(p.prezzo_acquisto)}</td>
      <td>
        <select onchange="aggiorna(${index},'venditore',this.value)">
          <option ${p.venditore=="--"?"selected":""}>--</option>
          <option ${p.venditore=="Romeo"?"selected":""}>Romeo</option>
          <option ${p.venditore=="Ricky"?"selected":""}>Ricky</option>
        </select>
      </td>
      <td contenteditable onblur="aggiorna(${index},'prezzo_vendita',this.innerText)">${formatEuro(p.prezzo_vendita)}</td>
      <td contenteditable onblur="aggiorna(${index},'vendite_effettive',this.innerText)">${formatEuro(p.vendite_effettive)}</td>
      <td><button onclick="eliminaProdotto(${index})">Elimina</button></td>
    `;
    tbody.appendChild(row);
  });

  aggiornaRiepilogo();
}

// ----------------- AGGIORNAMENTO CAMPI -----------------
function aggiorna(index,campo,val){
  if(campo==="prezzo_acquisto" || campo==="prezzo_vendita" || campo==="vendite_effettive"){
    val = parseNumero(val);
    if(val<0){ alert("Valore non valido"); return; }
  }

  prodotti[index][campo] = val;

  // Calcolo automatico prezzo stimato se non presente
  if(campo==="prezzo_acquisto" && !prodotti[index].prezzo_vendita){
    prodotti[index].prezzo_vendita = prodotti[index].prezzo_acquisto;
  }

  mostraTabella();
  salvaLocalStorage();
}

// ----------------- FORM NUOVO PRODOTTO -----------------
function mostraForm(){
  let formContainer = document.getElementById("formContainer");
  formContainer.innerHTML = `
    <form onsubmit="aggiungiProdottoForm(event)">
      <input type="text" id="nome" placeholder="Nome prodotto" required>
      <select id="categoria">
        <option>--</option>
        <option>Scarpe</option>
        <option>Abbigliamento</option>
        <option>Accessori</option>
        <option>Altro</option>
      </select>
      <input type="text" id="prezzo_acquisto" placeholder="Prezzo Acquisto (€)" required>
      <input type="text" id="prezzo_vendita" placeholder="Prezzo Vendita Stimato (€)">
      <select id="venditore">
        <option>--</option>
        <option>Romeo</option>
        <option>Ricky</option>
      </select>
      <button type="submit">Aggiungi</button>
    </form>
  `;
}

function aggiungiProdottoForm(event){
  event.preventDefault();
  let nome = document.getElementById("nome").value;
  let categoria = document.getElementById("categoria").value;
  let prezzo_acquisto = parseNumero(document.getElementById("prezzo_acquisto").value);
  let prezzo_venditaInput = document.getElementById("prezzo_vendita").value;
  let prezzo_vendita = prezzo_venditaInput ? parseNumero(prezzo_venditaInput) : null;
  let venditore = document.getElementById("venditore").value;

  if(prezzo_acquisto<0 || (prezzo_vendita!==null && prezzo_vendita<0)){ alert("Valori non validi"); return; }

  let id = prodotti.length ? Math.max(...prodotti.map(p=>p.id))+1 : 1;
  prodotti.unshift({id,nome,categoria,prezzo_acquisto,venditore,prezzo_vendita,vendite_effettive:0});

  document.getElementById("formContainer").innerHTML = "";
  mostraTabella();
  salvaLocalStorage();
}

// ----------------- ELIMINA -----------------
function eliminaProdotto(index){
  let nome = prodotti[index].nome;
  if(confirm(`Sei sicuro di voler eliminare "${nome}"?`)){
    prodotti.splice(index,1);
    mostraTabella();
    salvaLocalStorage();
  }
}

// ----------------- RIEQUILIBRIO -----------------
function riequilibra(){
  prodottiRiequilibrati.clear();

  let stats = { Romeo:{guad:0,fatt:0}, Ricky:{guad:0,fatt:0} };

  // inizializza con assegnati
  prodotti.forEach(p=>{
    if(p.venditore && p.venditore!=="--"){
      let prezzo = p.vendite_effettive || p.prezzo_vendita || 0;
      stats[p.venditore].guad += (prezzo - p.prezzo_acquisto);
      stats[p.venditore].fatt += prezzo;
    }
  });

  // assegna i vuoti
  prodotti.forEach(p=>{
    if(!p.venditore || p.venditore==="--"){
      let prezzo = p.vendite_effettive || p.prezzo_vendita || 0;
      let guad = prezzo - p.prezzo_acquisto;

      // prova Romeo
      let rRomeo = {
        guad: stats.Romeo.guad + guad,
        fatt: stats.Romeo.fatt + prezzo
      };
      let rRicky = {...stats.Ricky};
      let squilibrioRomeo = Math.abs(rRomeo.guad - rRicky.guad) + Math.abs(rRomeo.fatt - rRicky.fatt);

      // prova Ricky
      let rRicky2 = {
        guad: stats.Ricky.guad + guad,
        fatt: stats.Ricky.fatt + prezzo
      };
      let rRomeo2 = {...stats.Romeo};
      let squilibrioRicky = Math.abs(rRomeo2.guad - rRicky2.guad) + Math.abs(rRomeo2.fatt - rRicky2.fatt);

      if(squilibrioRomeo <= squilibrioRicky){
        p.venditore = "Romeo";
        stats.Romeo = rRomeo;
      } else {
        p.venditore = "Ricky";
        stats.Ricky = rRicky2;
      }
      prodottiRiequilibrati.add(p.id);
    }
  });

  mostraTabella();
  salvaLocalStorage();
}

// ----------------- RIEPILOGO -----------------
function aggiornaRiepilogo(){
  let stats = {
    Romeo: { stimato:{guad:0,fatt:0}, reale:{guad:0,fatt:0} },
    Ricky: { stimato:{guad:0,fatt:0}, reale:{guad:0,fatt:0} }
  };

  prodotti.forEach(p=>{
    if(!p.venditore || p.venditore==="--") return;
    let prezzoSt = p.prezzo_vendita || 0;
    let prezzoRe = p.vendite_effettive || null;
    let vend = p.venditore;

    stats[vend].stimato.fatt += prezzoSt;
    stats[vend].stimato.guad += (prezzoSt - p.prezzo_acquisto);

    let prezzoUsato = prezzoRe ? prezzoRe : prezzoSt;
    stats[vend].reale.fatt += prezzoUsato;
    stats[vend].reale.guad += (prezzoUsato - p.prezzo_acquisto);
  });

  document.getElementById("romeoStimato").innerText = 
    `Guadagno stimato: ${formatEuro(stats.Romeo.stimato.guad)} | Fatturato stimato: ${formatEuro(stats.Romeo.stimato.fatt)}`;
  document.getElementById("romeoReale").innerText = 
    `Guadagno reale: ${formatEuro(stats.Romeo.reale.guad)} | Fatturato reale: ${formatEuro(stats.Romeo.reale.fatt)}`;

  document.getElementById("rickyStimato").innerText = 
    `Guadagno stimato: ${formatEuro(stats.Ricky.stimato.guad)} | Fatturato stimato: ${formatEuro(stats.Ricky.stimato.fatt)}`;
  document.getElementById("rickyReale").innerText = 
    `Guadagno reale: ${formatEuro(stats.Ricky.reale.guad)} | Fatturato reale: ${formatEuro(stats.Ricky.reale.fatt)}`;
}
