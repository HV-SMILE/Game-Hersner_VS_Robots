/* ============================================================
   HEROES VS ROBOTS — RARITY + 16-REWARD MYSTERY BOX SYSTEM
   - Five box types
   - Five hero rarities
   - Exact 16-reward Basic Box odds
   - 7-minute Mega Luck inversion (CREATOR-only promo)
   - Box animation, rarity reveal, history, fallbacks
   ============================================================ */
(() => {
  'use strict';

  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const CREATOR_ONLY_PROMO = 'Lucky_man_I_am_ma_I_LUCKYluck_veryLucky))Luckyyy';

  const RARITY_META = {
    common: {label:'Common', icon:'⚪', color:'#cfd5dc', glow:'rgba(207,213,220,.22)'},
    rare: {label:'Rare', icon:'🔵', color:'#4da3ff', glow:'rgba(77,163,255,.35)'},
    epic: {label:'Epic', icon:'🟣', color:'#b86cff', glow:'rgba(184,108,255,.38)'},
    legendary: {label:'Legendary', icon:'🟠', color:'#ffb13b', glow:'rgba(255,177,59,.42)'},
    secret: {label:'Secret', icon:'🔴', color:'#ff4d7d', glow:'rgba(255,77,125,.45)'}
  };

  const HERO_RARITIES = {
    mraveli:'common', atoriponch:'common', skochitagavor:'rare', kettle:'rare',
    simvolneri_mard:'rare', shamshyan:'epic', hikler:'rare', expelearmus:'epic',
    ferri:'rare', heraxos:'epic', jutak:'rare', kungfu:'epic', matem:'epic',
    nikolaganner:'rare', taguhi:'legendary', tort:'rare', smile_immortal:'secret'
  };

  /*
     The user gave four anchor examples. We make the whole 16-reward table
     follow that rule exactly, with the remaining 12 rewards consuming the
     remaining 61.995% proportionally to the previous 16-reward weighting.
     Mega Luck then mirrors the 12 non-anchor probabilities by rank.
  */
  const BOX_REWARDS = [
    {id:'coin1', label:'+1 🏆', type:'coins', value:1, anchor:'low', rarity:'common', baseSeed:12.5},
    {id:'coin10', label:'+10 🏆', type:'coins', value:10, anchor:'secondLow', rarity:'common', baseSeed:6.25},
    {id:'coin50', label:'+50 🏆', type:'coins', value:50, rarity:'rare', baseSeed:12.5},
    {id:'coin100', label:'+100 🏆', type:'coins', value:100, rarity:'rare', baseSeed:6.25},
    {id:'coin250', label:'+250 🏆', type:'coins', value:250, rarity:'epic', baseSeed:3.125},
    {id:'coin500', label:'+500 🏆', type:'coins', value:500, rarity:'epic', baseSeed:1.625},
    {id:'coin1000', label:'+1000 🏆', type:'coins', value:1000, rarity:'legendary', baseSeed:.8},
    {id:'hero', label:'🦸 Նոր հերոս', type:'hero', rarity:'epic', baseSeed:.4},
    {id:'map', label:'🗺️ Նոր դաշտ', type:'map', rarity:'rare', baseSeed:.4},
    {id:'key1', label:'+1 🔑', type:'key', value:1, rarity:'common', baseSeed:25},
    {id:'key5', label:'+5 🔑', type:'key', value:5, rarity:'rare', baseSeed:5},
    {id:'allLevel', label:'+1 Lv բոլոր հերոսներին', type:'allLevel', rarity:'epic', baseSeed:2},
    {id:'loss10', label:'-10 🏆', type:'coins', value:-10, rarity:'common', baseSeed:25},
    {id:'randomLevel', label:'-1 Lv random հերոս', type:'randomLevel', rarity:'rare', baseSeed:15},
    {id:'double', label:'x2 🏆՝ 5 րոպե', type:'double', minutes:5, rarity:'rare', baseSeed:25},
    {id:'promo', label:'🎟️ Promo reward', type:'promo', rarity:'secret', baseSeed:.4}
  ];

  const FIXED_ODDS = {coin1:25, coin10:12.5, hero:.5, promo:.005};
  const REMAINING_TOTAL = 100 - Object.values(FIXED_ODDS).reduce((s,v)=>s+v,0); // 61.995%
  const NON_ANCHOR = BOX_REWARDS.filter(r=>!Object.prototype.hasOwnProperty.call(FIXED_ODDS,r.id));
  const NON_ANCHOR_SEED_TOTAL = NON_ANCHOR.reduce((s,r)=>s+r.baseSeed,0);
  const standardOdds = {};
  Object.assign(standardOdds, FIXED_ODDS);
  NON_ANCHOR.forEach(r => { standardOdds[r.id] = REMAINING_TOTAL * (r.baseSeed / NON_ANCHOR_SEED_TOTAL); });
  const luckyOdds = {};
  Object.assign(luckyOdds, {coin1:.005, coin10:.5, hero:12.5, promo:25});
  const sortedNonAnchors = NON_ANCHOR.slice().sort((a,b)=>standardOdds[b.id]-standardOdds[a.id]);
  const sortedStandardValues = sortedNonAnchors.map(r=>standardOdds[r.id]);
  sortedNonAnchors.forEach((r,idx)=>{ luckyOdds[r.id] = sortedStandardValues[sortedStandardValues.length-1-idx]; });

  const BOX_RARITY_MULT = {
    bronze: {common:1, rare:1, epic:1, legendary:1, secret:1},
    silver: {common:.78, rare:1.18, epic:1.55, legendary:2.0, secret:2.6},
    epic: {common:.62, rare:.95, epic:1.55, legendary:2.55, secret:4.0},
    legendary: {common:.42, rare:.75, epic:1.35, legendary:2.9, secret:5.5},
    secret: {common:.24, rare:.58, epic:1.15, legendary:3.0, secret:7.0}
  };

  const RARITY_WEIGHTS = {
    bronze: {common:85, rare:12, epic:2.7, legendary:.29, secret:.01},
    silver: {common:55, rare:32, epic:10, legendary:2.8, secret:.2},
    epic: {common:25, rare:40, epic:25, legendary:9, secret:1},
    legendary: {common:8, rare:22, epic:35, legendary:28, secret:7},
    secret: {common:1, rare:9, epic:25, legendary:40, secret:25}
  };

  const BOXES = {
    basic: {id:'basic', name:'📦 Bronze Box', desc:'16 reward-ների հիմնական odds-եր', cost:1, oddsMode:'exact'},
    silver: {id:'silver', name:'🥈 Silver Box', desc:'Rare/Epic rewards-ի ավելի մեծ շանս', cost:1, oddsMode:'biased', bias:'silver'},
    epic: {id:'epic', name:'💜 Epic Box', desc:'Epic/Legendary reward-ների ավելի մեծ շանս', cost:1, oddsMode:'biased', bias:'epic'},
    legendary: {id:'legendary', name:'👑 Legendary Box', desc:'Legendary/Secret reward-ների բարձր շանս', cost:1, oddsMode:'biased', bias:'legendary'},
    secret: {id:'secret', name:'🔴 Secret Box', desc:'Secret reward-ների առավելագույն շանս', cost:1, oddsMode:'biased', bias:'secret'}
  };

  window.HVR_BOXES_CATALOG = BOXES;
  window.HVR_RARITY_META = RARITY_META;
  window.HVR_HERO_RARITIES = HERO_RARITIES;
  window.HVR_BOX_16_REWARDS = BOX_REWARDS;
  window.HVR_BOX_STANDARD_ODDS = standardOdds;
  window.HVR_BOX_LUCKY_ODDS = luckyOdds;

  function isLucky(){ return !!window.currentProfile && Number(window.currentProfile.megaLuckUntil||0) > Date.now(); }
  function luckyRemaining(){ return Math.max(0, Number(window.currentProfile?.megaLuckUntil||0) - Date.now()); }
  window.HVR_IS_MEGA_LUCKY = isLucky;

  function rarityForHero(k){ return HERO_RARITIES[k] || 'common'; }
  function heroesForRarity(rarity){
    const p=currentProfile;
    const towers=typeof TOWER_TYPES!=='undefined'?TOWER_TYPES:{};
    return Object.keys(towers).filter(k => rarityForHero(k)===rarity && !p?.ownedHeroes?.includes(k));
  }
  function anyLockedHero(){
    const p=currentProfile;
    const towers=typeof TOWER_TYPES!=='undefined'?TOWER_TYPES:{};
    return Object.keys(towers).filter(k => !p?.ownedHeroes?.includes(k));
  }

  function weightedPick(items){
    const total = items.reduce((s,x)=>s+Math.max(0,Number(x.weight)||0),0);
    if(total<=0) return items[0];
    let r=Math.random()*total;
    for(const it of items){ r-=Math.max(0,Number(it.weight)||0); if(r<0)return it; }
    return items[items.length-1];
  }

  function oddsForBox(box){
    const base = isLucky()?luckyOdds:standardOdds;
    const rows=BOX_REWARDS.map(r=>({reward:r,weight:Number(base[r.id]||0)}));
    if(box.oddsMode==='biased'){
      const mult=BOX_RARITY_MULT[box.bias]||BOX_RARITY_MULT.bronze;
      rows.forEach(x=>{x.weight*=Number(mult[x.reward.rarity]||1);});
    }
    return rows;
  }

  function pick16(box){ return weightedPick(oddsForBox(box)).reward; }

  const BOX_HERO_RARITY_WEIGHTS = {
    basic:{common:35,rare:30,epic:20,legendary:10,secret:5},
    silver:{common:20,rare:40,epic:25,legendary:10,secret:5},
    epic:{common:10,rare:25,epic:40,legendary:20,secret:5},
    legendary:{common:5,rare:15,epic:30,legendary:35,secret:15},
    secret:{common:1,rare:6,epic:18,legendary:35,secret:40}
  };

  function chooseHeroForReward(boxId='basic'){
    const locked=anyLockedHero();
    if(!locked.length) return null;
    const byRarity={common:[],rare:[],epic:[],legendary:[],secret:[]};
    locked.forEach(k=>{const r=rarityForHero(k);(byRarity[r]||byRarity.common).push(k);});
    const weights=BOX_HERO_RARITY_WEIGHTS[boxId]||BOX_HERO_RARITY_WEIGHTS.basic;
    const available=Object.entries(weights).filter(([r,w])=>byRarity[r]?.length && Number(w)>0).map(([r,w])=>({r,weight:w}));
    const rarity=weightedPick(available)?.r;
    const pool=rarity&&byRarity[rarity]?.length ? byRarity[rarity] : locked;
    return pool[Math.floor(Math.random()*pool.length)];
  }

  function choosePromoReward(){
    const pool=Array.isArray(window.HVR_BOX_PROMO_POOL) ? window.HVR_BOX_PROMO_POOL.filter(Boolean) : [];
    return pool[Math.floor(Math.random()*pool.length)] || '100_gavat_now';
  }

  function awardHero(heroKey){
    const towers=typeof TOWER_TYPES!=='undefined'?TOWER_TYPES:{};
    if(!heroKey || !towers[heroKey]) return '🦸 Hero reward-ը չհաջողվեց։';
    const p=currentProfile;
    if(!p) return '❌ Player profile չկա։';
    if(!Array.isArray(p.ownedHeroes)) p.ownedHeroes=[];
    p.heroLevels=p.heroLevels||{};
    if(p.ownedHeroes.includes(heroKey)){
      const lvl=Math.max(1,Number(p.heroLevels[heroKey]||1));
      if(lvl<((typeof HERO_MAX_LEVEL!=='undefined'?HERO_MAX_LEVEL:999))){
        p.heroLevels[heroKey]=lvl+1;window.saveProfile?.(p);return `🦸 ${towers[heroKey].name} → +1 Lv։`;
      }
      p.drawKeys=(Number(p.drawKeys)||0)+1;window.saveProfile?.(p);return '🦸 Duplicate max hero → +1 🔑։';
    }
    p.ownedHeroes.push(heroKey);p.heroLevels[heroKey]=1;
    window.saveProfile?.(p);window.renderHeroesInfoList?.();window.HVR_REFRESH_HEROES?.();
    return `🦸 Նոր hero՝ ${towers[heroKey].name}։`;
  }

  function awardMap(){
    const p=currentProfile; if(!p)return '❌ Player profile չկա։';
    if(!Array.isArray(p.ownedMaps))p.ownedMaps=['village'];
    const mapSeq=typeof MAP_SEQUENCE!=='undefined'?MAP_SEQUENCE:[];
    const locked=mapSeq.filter(k=>!p.ownedMaps.includes(k));
    if(!locked.length){p.drawKeys=(Number(p.drawKeys)||0)+1;window.saveProfile?.(p);return 'Բոլոր դաշտերը բաց են → +1 🔑։';}
    const key=locked[Math.floor(Math.random()*locked.length)];
    p.ownedMaps.push(key);p.selectedMap=key;
    if(typeof chosenMap!=='undefined') chosenMap=key;
    window.saveProfile?.(p);window.renderMapGrid?.();return `🗺️ Նոր դաշտ՝ ${(typeof MAPS!=='undefined'&&MAPS[key])?MAPS[key].label:key}։`;
  }

  function applyLoot(result){
    const p=currentProfile;if(!p)return '❌ Player profile չկա։';
    const it=result.item;let msg='';
    if(it.type==='coins'){
      if(it.value>=0){window.addCoins?.(it.value,false);msg=`+${Number(it.value).toLocaleString()} 🏆`;}
      else{p.coins=Math.max(0,(Number(p.coins)||0)+it.value);window.saveProfile?.(p);msg=`${it.value} 🏆`;}
    } else if(it.type==='key'){
      p.drawKeys=(Number(p.drawKeys)||0)+Number(it.value||1);p.wheelSpins=p.drawKeys;window.saveProfile?.(p);msg=`+${it.value} 🔑`;
    } else if(it.type==='hero'){
      const heroKey=it.heroKey||chooseHeroForReward();
      if(heroKey)msg=awardHero(heroKey);
      else{p.drawKeys=(Number(p.drawKeys)||0)+1;window.saveProfile?.(p);msg='Բոլոր hero-ներն արդեն բաց են → +1 🔑։';}
    } else if(it.type==='map'){
      msg=awardMap();
    } else if(it.type==='allLevel'){
      const owned=Array.isArray(p.ownedHeroes)?p.ownedHeroes:[];p.heroLevels=p.heroLevels||{};
      const max=(typeof HERO_MAX_LEVEL!=='undefined'?HERO_MAX_LEVEL:999);let changed=0;
      owned.forEach(k=>{const old=Math.max(1,Number(p.heroLevels[k]||1));if(old<max){p.heroLevels[k]=old+1;changed++;}});
      if(changed){window.saveProfile?.(p);msg=`բոլոր ${changed} բացված hero-ները +1 Lv։`;}
      else{p.drawKeys=(Number(p.drawKeys)||0)+1;window.saveProfile?.(p);msg='Բոլոր hero-ները max են → +1 🔑։';}
    } else if(it.type==='randomLevel'){
      p.heroLevels=p.heroLevels||{};
      const eligible=(p.ownedHeroes||[]).filter(k=>Number(p.heroLevels[k]||1)>1);
      if(!eligible.length){p.drawKeys=(Number(p.drawKeys)||0)+1;window.saveProfile?.(p);msg='Չկա Lv2+ hero → +1 🔑։';}
      else{const k=eligible[Math.floor(Math.random()*eligible.length)];p.heroLevels[k]=Math.max(1,Number(p.heroLevels[k]||1)-1);window.saveProfile?.(p);msg=`${(typeof TOWER_TYPES!=='undefined'?TOWER_TYPES[k]?.name:k)||k} → Lv${p.heroLevels[k]}։`;}
    } else if(it.type==='double'){
      p.doubleCoinsUntil=Math.max(Date.now(),Number(p.doubleCoinsUntil||0))+Number(it.minutes||5)*60000;window.saveProfile?.(p);msg=`x2 🏆՝ ${it.minutes||5} րոպե։`;
    } else if(it.type==='promo'){
      if(p.creator){
        const code=choosePromoReward();
        p.wonDrawPromoCodes=p.wonDrawPromoCodes||[];
        if(!p.wonDrawPromoCodes.includes(code))p.wonDrawPromoCodes.push(code);
        window.saveProfile?.(p);window.HVR_BOX_LAST_PROMO=code;msg='🎟️ Promo reward ստացվեց։';
      } else {
        p.drawKeys=(Number(p.drawKeys)||0)+1;window.saveProfile?.(p);msg='🎁 Mystery Reward → +1 🔑';
      }
    }
    return msg;
  }

  function rewardRarity(item, chosenRarity){
    if(item.type==='hero' && item.heroKey)return rarityForHero(item.heroKey);
    return chosenRarity||item.rarity||'common';
  }

  function boxOddsRows(box){
    const rows=oddsForBox(box);
    const total=rows.reduce((s,x)=>s+x.weight,0)||1;
    return rows.map(x=>({reward:x.reward,pct:x.weight/total*100}));
  }

  function fmtPct(v){
    const n=Number(v)||0;
    if(n>=1)return n.toFixed(2)+'%';
    if(n>=.01)return n.toFixed(3)+'%';
    return n.toFixed(3)+'%';
  }

  function rewardLabel(r){
    const p=currentProfile;
    if(r.type==='promo' && !p?.creator) return '🎁 Mystery Reward';
    return r.label;
  }

  function renderOddsTable(box){
    const rows=boxOddsRows(box);
    return `<div class="hvrOddsGrid">${rows.map((x,i)=>{
      const m=RARITY_META[x.reward.rarity]||RARITY_META.common;
      return `<div class="hvrOddsItem" style="--rarityColor:${m.color}"><span>${i+1}</span><b>${esc(rewardLabel(x.reward))}</b><strong>${fmtPct(x.pct)}</strong></div>`;
    }).join('')}</div>`;
  }

  function renderHistory(){
    const p=currentProfile;const rows=(p?.boxHistory||[]).slice(-10).reverse();
    if(!rows.length)return '<div class="hvrHistoryEmpty">📜 Դեռ box history չկա։</div>';
    return `<div class="hvrHistoryList">${rows.map(h=>{
      const m=RARITY_META[h.rarity]||RARITY_META.common;
      return `<div class="hvrHistoryRow"><span>${m.icon} <b>${esc(h.reward||'Reward')}</b></span><small>${esc(h.box||'box')} • ${new Date(Number(h.at)||Date.now()).toLocaleTimeString()}</small></div>`;
    }).join('')}</div>`;
  }

  function renderBoxCenter(){
    const content=document.getElementById('hvrBoxCenterContent');if(!content)return;
    const p=currentProfile;const keys=Math.max(0,Number(p?.drawKeys??p?.wheelSpins)||0);const lucky=isLucky();
    content.innerHTML=`
      <div class="hvrLuckyBar ${lucky?'active':''}"><b>${lucky?'🍀 MEGA LUCK ACTIVE':'🎯 Ընտրիր mystery box-ը'}</b><span>${lucky?fmtLucky():'1 🔑 = 1 box'}</span></div>
      <div class="hvrBoxGrid">${Object.values(BOXES).map((b,i)=>{
        const colors=['#7d8792','#9ab4d4','#9b6be8','#e5a33a','#ff4d7d'];
        return `<button type="button" class="hvrBoxCard" data-box-id="${b.id}" style="--boxAccent:${colors[i]}"><div class="hvrBoxIcon">${b.name.slice(0,2)}</div><div class="hvrBoxName">${esc(b.name.slice(3))}</div><div class="hvrBoxDesc">${esc(b.desc)}</div><div class="hvrBoxCost">${p?.admin?'∞':'1'} 🔑</div></button>`;
      }).join('')}</div>
      <div id="hvrBoxSelected" class="hvrBoxSelected">Ընտրիր box</div>
      <div class="hvrRewardTitle"><b>🎁 16 հնարավոր rewards</b><span>${lucky?'Odds-ը inverted են':'Սովորական odds'}</span></div>
      <div id="hvrBoxOdds">${renderOddsTable(BOXES.basic)}</div>
      <div id="hvrBoxResult" class="hvrBoxResult">${lucky?'🍀 Mega Luck-ը հիմա ակտիվ է։ 16 reward-ների odds-ը փոխված են։':'📦 Բացիր box-ը՝ 16 հնարավոր rewards-ից մեկը ստանալու համար։'}</div>
      <div class="hvrHistorySection"><div class="hvrRewardTitle"><b>📜 Box History</b><button id="hvrHistoryRefresh" class="hvrMiniBtn" type="button">Թարմացնել</button></div><div id="hvrBoxHistory">${renderHistory()}</div></div>
      <div class="hvrBoxButtons"><button id="hvrBoxOpenBtn" class="action" disabled>🎁 Բացել</button><button id="hvrBoxCloseBtn" class="action">Փակել</button></div>`;

    let selected='basic';
    const selectBox=(id)=>{
      selected=BOXES[id]?id:'basic';const b=BOXES[selected];
      content.querySelectorAll('.hvrBoxCard').forEach(el=>el.classList.toggle('selected',el.dataset.boxId===selected));
      const info=document.getElementById('hvrBoxSelected');if(info)info.innerHTML=`<b>${esc(b.name)}</b><span>${esc(b.desc)}</span>`;
      const odds=document.getElementById('hvrBoxOdds');if(odds)odds.innerHTML=renderOddsTable(b);
      const open=document.getElementById('hvrBoxOpenBtn');const liveKeys=Math.max(0,Number(p?.drawKeys??p?.wheelSpins)||0);if(open)open.disabled=!p||window.HVR_BOX_BUSY===true||(!p.admin&&liveKeys<1);
    };
    content.querySelectorAll('.hvrBoxCard').forEach(el=>el.addEventListener('click',()=>selectBox(el.dataset.boxId)));
    document.getElementById('hvrBoxCloseBtn').onclick=()=>{document.getElementById('hvrBoxCenterOverlay').style.display='none';};
    document.getElementById('hvrHistoryRefresh')?.addEventListener('click',()=>{const h=document.getElementById('hvrBoxHistory');if(h)h.innerHTML=renderHistory();});
    document.getElementById('hvrBoxOpenBtn').onclick=()=>openSelected(selected);
    selectBox('basic');
  }

  function fmtLucky(){
    const ms=luckyRemaining();if(ms<=0)return '';
    const total=Math.ceil(ms/1000);const m=Math.floor(total/60);const s=String(total%60).padStart(2,'0');
    return `🍀 MEGA LUCK • ${m}:${s}`;
  }

  function openSelected(id){
    const p=currentProfile;if(!p||!BOXES[id])return;
    const keys=Math.max(0,Number(p.drawKeys||0));
    if(!p.admin&&keys<1){document.getElementById('hvrBoxResult').textContent='❌ Բանալիներ չկան։';return;}
    if(window.HVR_BOX_BUSY)return;
    window.HVR_BOX_BUSY=true;
    if(!p.admin){p.drawKeys=Math.max(0,keys-1);p.wheelSpins=p.drawKeys;window.saveProfile?.(p);}
    const box=BOXES[id];const result=document.getElementById('hvrBoxResult');
    const open=document.getElementById('hvrBoxOpenBtn');if(open)open.disabled=true;
    const card=document.querySelector(`.hvrBoxCard[data-box-id="${id}"]`);card?.classList.add('shaking');
    const historyBox=document.getElementById('hvrBoxHistory');if(historyBox)historyBox.innerHTML='<div class="hvrHistoryEmpty">✨ Opening…</div>';
    setTimeout(()=>{
      try{
        const picked=pick16(box);
        const item={...picked};
        if(item.type==='hero'){item.heroKey=chooseHeroForReward(box.id);}
        const msg=applyLoot({item});
        const rarity=rewardRarity(item);
        const meta=RARITY_META[rarity]||RARITY_META.common;
        if(result)result.innerHTML=`<div class="hvrReveal ${rarity}" style="--r:${meta.color};--g:${meta.glow}"><div class="hvrRevealRarity">${meta.icon} ${meta.label}</div><strong>${esc(msg)}</strong><small>${esc(rewardLabel(picked))}</small></div>`;
        if(window.HVR_BOX_LAST_PROMO&&p.creator){
          result.innerHTML+=`<div class="hvrCreatorPromoReveal">🎟️ Creator reward պատրաստ է․ code-ը հասանելի է միայն Creator UI-ում։</div>`;
          window.HVR_BOX_LAST_PROMO='';
        }
        p.boxHistory=Array.isArray(p.boxHistory)?p.boxHistory:[];
        p.boxHistory.push({box:id,rarity,reward:msg,at:Date.now()});p.boxHistory=p.boxHistory.slice(-50);window.saveProfile?.(p);
        if(historyBox)historyBox.innerHTML=renderHistory();
        window.updateCoinDisplays?.();window.updateRandomDrawUI?.();window.renderHeroesInfoList?.();window.renderMapGrid?.();
        const k=document.getElementById('hvrBoxKeysCount');if(k)k.textContent=p.admin?'∞':Number(p.drawKeys||0).toLocaleString();
        if(open)open.disabled=!p.admin&&Number(p.drawKeys||0)<1;
      }catch(err){
        console.error('HVR box open failed:',err);
        if(!p.admin){p.drawKeys=(Number(p.drawKeys)||0)+1;p.wheelSpins=p.drawKeys;window.saveProfile?.(p);}
        if(result)result.innerHTML='<div class="hvrReveal secret"><div class="hvrRevealRarity">⚠️ Error protected</div><strong>Reward-ը չկորավ․ բանալին վերադարձվեց։</strong></div>';
      }finally{
        window.HVR_BOX_BUSY=false;card?.classList.remove('shaking');
      }
    },900);
  }

  function ensureOverlay(){
    if(document.getElementById('hvrBoxCenterOverlay'))return;
    const ov=document.createElement('div');ov.id='hvrBoxCenterOverlay';ov.className='simpleOverlay';ov.style.display='none';
    ov.innerHTML=`<div class="hvrBoxCenter"><div class="hvrBoxHead"><div><div class="randomDrawEyebrow">HEROES VS ROBOTS • MYSTERY BOXES</div><h2>🎁 Mystery Box Center</h2></div><div class="hvrBoxKeys">🔑 <span id="hvrBoxKeysCount">1</span></div></div><div id="hvrBoxCenterContent"></div></div>`;
    document.body.appendChild(ov);
  }

  function openCenter(){
    ensureOverlay();const p=currentProfile;if(!p)return;
    renderBoxCenter();const k=document.getElementById('hvrBoxKeysCount');if(k)k.textContent=p.admin?'∞':Number(p.drawKeys||0).toLocaleString();
    document.getElementById('hvrBoxCenterOverlay').style.display='flex';
  }
  window.HVR_OPEN_BOX_CENTER=openCenter;

  function injectStyles(){
    if(document.getElementById('hvrBoxStyles'))return;
    const s=document.createElement('style');s.id='hvrBoxStyles';s.textContent=`
      .hvrBoxCenter{width:min(1060px,96vw);max-height:94vh;overflow:auto;background:linear-gradient(180deg,#131b2a,#0b101b);border:1px solid #3e5878;border-radius:22px;box-shadow:0 28px 80px rgba(0,0,0,.55);padding:18px;color:#eef4ff}
      .hvrBoxHead{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px}.hvrBoxKeys{font-size:18px;font-weight:800;padding:9px 13px;border-radius:14px;background:#1c2940;border:1px solid #496688}
      .hvrLuckyBar{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:10px 13px;border-radius:14px;background:#172234;border:1px solid #3d5271;margin-bottom:13px}.hvrLuckyBar.active{border-color:#74dd76;box-shadow:0 0 22px rgba(116,221,118,.17)}
      .hvrBoxGrid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}.hvrBoxCard{appearance:none;cursor:pointer;text-align:left;color:#f6f8ff;background:linear-gradient(180deg,#1a2434,#101722);border:1px solid #34475f;border-top:3px solid var(--boxAccent);border-radius:16px;padding:12px;transition:.18s transform,.18s box-shadow,.18s border-color}.hvrBoxCard:hover,.hvrBoxCard.selected{transform:translateY(-2px);box-shadow:0 12px 26px rgba(0,0,0,.26);border-color:var(--boxAccent)}.hvrBoxCard.shaking{animation:hvrShake .9s ease}.hvrBoxIcon{font-size:30px;height:40px;display:flex;align-items:center}.hvrBoxName{font-size:15px;font-weight:900;margin:5px 0}.hvrBoxDesc{font-size:11px;opacity:.76;min-height:40px;line-height:1.35}.hvrBoxCost{margin-top:8px;font-weight:800;color:#ffd66b}
      .hvrRewardTitle{display:flex;justify-content:space-between;gap:10px;align-items:center;margin:13px 0 7px;font-size:12px}.hvrRewardTitle span{opacity:.68}.hvrMiniBtn{border:1px solid #3b516d;background:#142135;color:#dceaff;border-radius:9px;padding:5px 8px;cursor:pointer;font-size:11px}
      .hvrOddsGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}.hvrOddsItem{display:grid;grid-template-columns:20px minmax(0,1fr) auto;gap:6px;align-items:center;padding:7px 9px;border:1px solid #2d4057;border-left:3px solid var(--rarityColor);border-radius:10px;background:#0d1622;font-size:11px}.hvrOddsItem>span{opacity:.5;font-weight:900}.hvrOddsItem strong{font-size:10px;color:#a9d6ff}
      .hvrBoxSelected{margin-top:14px;padding:11px 13px;border-radius:14px;background:#101925;border:1px solid #33465e;display:flex;justify-content:space-between;gap:10px}.hvrBoxSelected span{opacity:.7;font-size:12px}.hvrBoxResult{margin-top:10px;min-height:110px;padding:14px;border-radius:15px;background:#0e1520;border:1px solid #25374e;display:flex;flex-direction:column;align-items:stretch;justify-content:center;text-align:center}.hvrBoxButtons{display:flex;justify-content:center;gap:10px;margin-top:12px}.hvrReveal{width:100%;padding:12px;border-radius:14px;border:1px solid var(--r);box-shadow:0 0 26px var(--g);background:linear-gradient(180deg,rgba(255,255,255,.045),rgba(0,0,0,.08));animation:hvrRevealPop .35s ease}.hvrRevealRarity{font-size:13px;font-weight:900;color:var(--r);margin-bottom:5px}.hvrReveal strong{display:block}.hvrReveal small{display:block;margin-top:5px;opacity:.65}.hvrCreatorPromoReveal{margin-top:7px;font-size:11px;opacity:.7}.hvrHistorySection{margin-top:11px;padding-top:2px}.hvrHistoryList{display:grid;gap:5px}.hvrHistoryRow{display:flex;justify-content:space-between;gap:8px;padding:7px 9px;border-radius:9px;background:#0d1622;border:1px solid #26384d;font-size:10px}.hvrHistoryRow small{opacity:.55}.hvrHistoryEmpty{padding:13px;border:1px dashed #2b4058;border-radius:10px;text-align:center;opacity:.6;font-size:11px}
      .hvrRarityBadge{display:inline-flex;align-items:center;gap:4px;margin:4px 0 3px;padding:3px 7px;border-radius:999px;border:1px solid var(--rarityColor);box-shadow:0 0 9px var(--rarityGlow);font-size:10px;font-weight:900;color:var(--rarityColor)}
      @keyframes hvrShake{0%,100%{transform:rotate(0)}20%{transform:rotate(-3deg) translateX(-2px)}40%{transform:rotate(3deg) translateX(2px)}60%{transform:rotate(-2deg) translateX(-1px)}80%{transform:rotate(2deg) translateX(1px)}}
      @keyframes hvrRevealPop{0%{transform:scale(.96);opacity:.1}100%{transform:scale(1);opacity:1}}
      @media(max-width:760px){.hvrBoxGrid{grid-template-columns:repeat(2,minmax(0,1fr))}.hvrOddsGrid{grid-template-columns:1fr}.hvrBoxSelected{flex-direction:column}.hvrBoxCenter{padding:12px}.hvrBoxButtons{position:sticky;bottom:0;background:linear-gradient(180deg,transparent,#0b101b 25%);padding-top:10px}.hvrBoxCard{padding:10px}}
    `;document.head.appendChild(s);
  }

  function observeHeroes(){
    const el=document.getElementById('heroesInfoList');if(!el||el.dataset.hvrRarityObserver)return;
    el.dataset.hvrRarityObserver='1';
    const apply=()=>{el.querySelectorAll('.heroInfoRow').forEach(row=>{
      if(row.querySelector('.hvrRarityBadge'))return;
      const name=row.querySelector('.heroInfoText > b')?.textContent||'';
      const towers=typeof TOWER_TYPES!=='undefined'?TOWER_TYPES:{};
      const key=Object.keys(towers).find(k=>towers[k]?.name===name);if(!key)return;
      const badge=RARITY_META[rarityForHero(key)];const span=document.createElement('span');span.className='hvrRarityBadge';span.textContent=`${badge.icon} ${badge.label}`;span.style.setProperty('--rarityColor',badge.color);span.style.setProperty('--rarityGlow',badge.glow);row.querySelector('.heroInfoText')?.appendChild(span);
    })};
    new MutationObserver(apply).observe(el,{childList:true,subtree:true});apply();
  }

  function selfTest(){
    const sum=arr=>Object.values(arr).reduce((a,v)=>a+Number(v||0),0);
    const std=sum(standardOdds), lucky=sum(luckyOdds);
    const anchorsOK=Math.abs(std-100)<1e-9 && Math.abs(lucky-100)<1e-9 &&
      standardOdds.coin1===25 && standardOdds.coin10===12.5 && standardOdds.hero===.5 && standardOdds.promo===.005 &&
      luckyOdds.coin1===.005 && luckyOdds.coin10===.5 && luckyOdds.hero===12.5 && luckyOdds.promo===25;
    const allPositive=BOX_REWARDS.every(r=>Number(standardOdds[r.id])>0 && Number(luckyOdds[r.id])>0);
    const nonAnchors=NON_ANCHOR.slice().sort((a,b)=>standardOdds[b.id]-standardOdds[a.id]);
    const mirrorOK=nonAnchors.every((r,i)=>Math.abs(luckyOdds[r.id]-standardOdds[nonAnchors[nonAnchors.length-1-i].id])<1e-12);
    const boxesOK=['basic','silver','epic','legendary','secret'].every(k=>!!BOXES[k]);
    return {ok:anchorsOK&&allPositive&&mirrorOK&&boxesOK&&BOX_REWARDS.length===16,rewardCount:BOX_REWARDS.length,standardTotal:std,luckyTotal:lucky,anchorsOK,allPositive,mirrorOK,boxesOK};
  }
  window.HVR_BOX_SELF_TEST=selfTest;

  document.addEventListener('DOMContentLoaded',()=>{
    injectStyles();ensureOverlay();observeHeroes();
    const btn=document.getElementById('randomDrawBtn');
    if(btn){btn.textContent='🎁 Mystery Boxes';btn.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();openCenter();},{capture:true});}
    setInterval(()=>{
      const ov=document.getElementById('hvrBoxCenterOverlay');
      if(ov?.style.display==='flex'){
        const luckyNow=isLucky();
        const bar=document.querySelector('.hvrLuckyBar');if(bar){bar.classList.toggle('active',luckyNow);bar.querySelector('span')?.replaceChildren(document.createTextNode(luckyNow?fmtLucky():'1 🔑 = 1 box'));}
      }
    },1000);
  });

  window.HVR_BOX_PROMO_POOL=['100_gavat_now','new_1_hero_new','x2_gavatneeer_10log2(64)_rope','new_new_now_dasht_#angleren_Chidem','You_Are_xaxamool_25_hat_frcraa'];
  // Keep the token referenced for source audits; the actual activation lives in game.js.
  window.HVR_MEGA_LUCK_PROMO_CODE=CREATOR_ONLY_PROMO;
})();
