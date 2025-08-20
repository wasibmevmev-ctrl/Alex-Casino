(function(){
  // Balance store
  const balEl = document.getElementById('balance');
  const addBtn = document.getElementById('btnAddCoins');
  const resetBtn = document.getElementById('btnReset');

  const store = {
    get(key, def){ try{return JSON.parse(localStorage.getItem(key)) ?? def;}catch{return def;} },
    set(key, val){ localStorage.setItem(key, JSON.stringify(val)); }
  };

  let balance = store.get('balance', 1000);
  updateBalance(0);

  function updateBalance(delta){
    balance = Math.max(0, Math.floor(balance + delta));
    balEl.textContent = balance;
    store.set('balance', balance);
  }

  addBtn.onclick = () => updateBalance(1000);
  resetBtn.onclick = () => { localStorage.clear(); balance = 1000; balEl.textContent = balance; location.reload(); };

  // Tabs
  const tabs = document.querySelectorAll('#tabs button[data-tab]');
  const sections = {
    slots: document.getElementById('tab-slots'),
    roulette: document.getElementById('tab-roulette'),
    blackjack: document.getElementById('tab-blackjack'),
    color: document.getElementById('tab-color'),
  };
  tabs.forEach(b=> b.onclick = () => {
    tabs.forEach(x=>x.classList.remove('active')); b.classList.add('active');
    Object.values(sections).forEach(s=>s.classList.remove('active'));
    sections[b.dataset.tab].classList.add('active');
  });

  // Helpers
  function randInt(a,b){ return Math.floor(a + Math.random()*(b-a+1)); }

  function takeBet(inputEl){
    const bet = Math.max(10, Math.floor(Number(inputEl.value)||0));
    if (bet > balance){ return {ok:false, msg:"Insufficient balance"}; }
    updateBalance(-bet);
    return {ok:true, bet};
  }

  // SLOTS
  const slotsBet = document.getElementById('slotsBet');
  const slotsSpin = document.getElementById('slotsSpin');
  const slotsMsg = document.getElementById('slotsMsg');
  const slotsReels = document.getElementById('slotsReels');

  const symbols = ['🍒','🍋','🍀','⭐','🔔','💎'];
  const weights = [22, 18, 14, 10, 7, 4];
  function weightedPick(){
    const total = weights.reduce((a,b)=>a+b,0);
    let r = Math.random()*total;
    for(let i=0;i<weights.length;i++){
      if (r < weights[i]) return symbols[i];
      r -= weights[i];
    }
    return symbols[0];
  }
  const payout = { '🍒':5, '🍋':4, '🍀':7, '⭐':10, '🔔':12, '💎':20 };

  slotsSpin.onclick = () => {
    const t = takeBet(slotsBet);
    if (!t.ok){ slotsMsg.textContent = t.msg; return; }
    slotsSpin.disabled = true;
    slotsMsg.textContent = "Spinning...";

    const frames = 18; let f=0;
    const iv = setInterval(()=>{
      for (let i=0;i<3;i++) slotsReels.children[i].textContent = weightedPick();
      if (++f>=frames){
        clearInterval(iv);
        const final = [weightedPick(), weightedPick(), weightedPick()];
        for (let i=0;i<3;i++) slotsReels.children[i].textContent = final[i];
        let win = 0;
        if (final[0]===final[1] && final[1]===final[2]){
          win = t.bet * payout[final[0]];
        }
        if (win>0){ updateBalance(win); slotsMsg.textContent = `You won ${win} 🪙!`; }
        else { slotsMsg.textContent = `No win. Better luck next spin.`; }
        slotsSpin.disabled = false;
      }
    }, 60);
  };

  // ROULETTE
  const roulBet = document.getElementById('roulBet');
  const roulChoice = document.getElementById('roulChoice');
  const roulSpin = document.getElementById('roulSpin');
  const roulResult = document.getElementById('roulResult');
  const roulMsg = document.getElementById('roulMsg');

  roulSpin.onclick = () => {
    const t = takeBet(roulBet);
    if (!t.ok){ roulMsg.textContent = t.msg; return; }
    const pockets = [
      ...Array(18).fill('red'),
      ...Array(18).fill('black'),
      'green'
    ];
    const result = pockets[randInt(0,pockets.length-1)];
    roulResult.textContent = result.toUpperCase();
    let mult = 0;
    const pick = roulChoice.value;
    if (result==='green' && pick==='green') mult = 14;
    else if (pick===result) mult = 2;

    if (mult>0){ const w = t.bet*mult; updateBalance(w); roulMsg.textContent = `Win ${w} 🪙`; }
    else { roulMsg.textContent = `Lost ${t.bet} 🪙`; }
  };

  // BLACKJACK
  const bjBet = document.getElementById('bjBet');
  const bjDeal = document.getElementById('bjDeal');
  const bjHit = document.getElementById('bjHit');
  const bjStand = document.getElementById('bjStand');
  const bjDealer = document.getElementById('bjDealer');
  const bjPlayer = document.getElementById('bjPlayer');
  const bjDealerScore = document.getElementById('bjDealerScore');
  const bjPlayerScore = document.getElementById('bjPlayerScore');
  const bjMsg = document.getElementById('bjMsg');

  let deck=[], hidCard=null, betAmt=0, inRound=false;

  function newDeck(){
    const ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
    const suits = ['♠','♥','♦','♣'];
    deck = [];
    suits.forEach(s=>ranks.forEach(r=> deck.push(r+s)));
    for(let i=deck.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [deck[i],deck[j]]=[deck[j],deck[i]]; }
  }
  function cardVal(c){
    const r = c.slice(0, -1);
    if (r==='A') return 11;
    if (['K','Q','J'].includes(r)) return 10;
    return parseInt(r,10);
  }
  function handScore(cards){
    let total = cards.reduce((a,c)=>a+cardVal(c),0);
    let aces = cards.filter(c=>c.startsWith('A')).length;
    while (total>21 && aces>0){ total -= 10; aces--; }
    return total;
  }
  function dealCard(){ return deck.pop(); }

  function renderHands(playerCards, dealerCards, hideDealerHole){
    bjPlayer.textContent = playerCards.join(' ');
    bjPlayerScore.textContent = `(${handScore(playerCards)})`;
    if (hideDealerHole){
      bjDealer.textContent = dealerCards[0] + " [🂠]";
      bjDealerScore.textContent = "";
    } else {
      bjDealer.textContent = dealerCards.join(' ');
      bjDealerScore.textContent = `(${handScore(dealerCards)})`;
    }
  }

  let pHand=[], dHand=[];

  bjDeal.onclick = () => {
    if (inRound) return;
    const t = takeBet(bjBet);
    if (!t.ok){ bjMsg.textContent = t.msg; return; }
    betAmt = t.bet;
    inRound = true;
    bjMsg.textContent = "Dealt.";

    newDeck();
    pHand=[dealCard(), dealCard()];
    dHand=[dealCard(), dealCard()];
    renderHands(pHand, dHand, true);

    bjHit.disabled=false; bjStand.disabled=false;
  };

  bjHit.onclick = () => {
    if (!inRound) return;
    pHand.push(dealCard());
    renderHands(pHand, dHand, true);
    const ps = handScore(pHand);
    if (ps>21){
      inRound=false; bjHit.disabled=true; bjStand.disabled=true;
      bjMsg.textContent = `Bust! Lost ${betAmt} 🪙`;
    }
  };

  bjStand.onclick = () => {
    if (!inRound) return;
    // Dealer plays
    while (handScore(dHand) < 17){
      dHand.push(dealCard());
    }
    renderHands(pHand, dHand, false);
    const ps = handScore(pHand), ds = handScore(dHand);
    inRound=false; bjHit.disabled=true; bjStand.disabled=true;

    if (ds>21 || ps>ds){ const w = betAmt*2; updateBalance(w); bjMsg.textContent = `You win ${w} 🪙`; }
    else if (ps===ds){ updateBalance(betAmt); bjMsg.textContent = `Push. Bet returned.`; }
    else { bjMsg.textContent = `Dealer wins. Lost ${betAmt} 🪙`; }
  };

  // COLOR TRADING
  const ctBet = document.getElementById('ctBet');
  const ctChoice = document.getElementById('ctChoice');
  const ctGo = document.getElementById('ctGo');
  const ctResult = document.getElementById('ctResult');
  const ctMsg = document.getElementById('ctMsg');

  ctGo.onclick = () => {
    const t = takeBet(ctBet);
    if (!t.ok){ ctMsg.textContent = t.msg; return; }
    // Probabilities: R 45%, G 45%, B 10%
    const r = Math.random();
    let result = 'red';
    if (r < 0.45) result = 'red';
    else if (r < 0.9) result = 'green';
    else result = 'blue';

    ctResult.textContent = result.toUpperCase();

    const pick = ctChoice.value;
    let mult = 0;
    if (pick==='blue' && result==='blue') mult = 3;
    else if (pick===result) mult = 2;

    if (mult>0){ const w = t.bet*mult; updateBalance(w); ctMsg.textContent = `Win ${w} 🪙`; }
    else { ctMsg.textContent = `Lost ${t.bet} 🪙`; }
  };

})();