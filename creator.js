/* ============================================================
   HEROES VS ROBOTS — CREATOR CONTROL SYSTEM (STABLE)
   CREATOR = ADMIN powers + online player/event/promo control.
   UI is Creator-only; actual data sync uses Firebase playerStates.
   ============================================================ */
(() => {
  'use strict';

  const CREATOR_CODE = 'Can_you_see_I_am a Creater_do you know??_I_am_diference';
  const CREATOR_CODE_META = { type:'creator', desc:'CREATOR: ADMIN-ի բոլոր հնարավորությունները + խաղացողների/event/promo կառավարում' };
  const DB = window.HVR_LEADERBOARD_DB || null;
  const STATIC_PROMOS = {};
  const EVENT_IDS = ['halloween','christmas','easter','invasion','bossweek','doubleWeekend','random','limited'];
  const EVENT_LABELS = {
    halloween:'🎃 Halloween Event', christmas:'🎄 Christmas Event', easter:'🐰 Easter Event',
    invasion:'💥 Robot Invasion', bossweek:'👑 Boss Week', doubleWeekend:'💎 Double Reward Weekend',
    random:'🎲 Random Event', limited:'⏳ Limited Window'
  };
  const EVENT_CATALOG = {
    halloween:{id:'halloween',icon:'🎃',name:'Halloween Event',desc:'+25% rewards + spooky visuals',coin:1.25,gems:2},
    christmas:{id:'christmas',icon:'🎄',name:'Christmas Event',desc:'+20% rewards',coin:1.20,gems:1.5},
    easter:{id:'easter',icon:'🐰',name:'Easter Event',desc:'+20% rewards + tickets',coin:1.20,gems:1.25},
    invasion:{id:'invasion',icon:'💥',name:'Robot Invasion',desc:'Elite robots appear more often',coin:1.15,gems:1.1},
    bossweek:{id:'bossweek',icon:'👑',name:'Boss Week',desc:'Boss chests are doubled',coin:1.10,gems:1.1},
    doubleWeekend:{id:'doubleWeekend',icon:'💎',name:'Double Reward Weekend',desc:'Weekend rewards ×2',coin:2,gems:2},
    random:{id:'random',icon:'🎲',name:'Random Event',desc:'Creator-controlled random event',coin:1.05,gems:1.05},
    limited:{id:'limited',icon:'⏳',name:'Limited Window',desc:'Limited hero/field bonuses active',coin:1.10,gems:1.10}
  };
  let selectedTarget = '';
  let remotePromos = {};
  let disabledPromos = {};
  let eventOverrides = {};
  let remotePlayers = [];
  let initialized = false;
  let lastAnnouncementAt = 0;

  function clone(v){ return v == null ? v : JSON.parse(JSON.stringify(v)); }
  function esc(v){ const s=String(v??''); return s.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
  function isCreator(){ return !!window.currentProfile?.creator; }
  function profileKey(username){ return encodeURIComponent(String(username||'').trim().toLowerCase()).replace(/\./g,'%2E'); }
  function toast(msg,kind='good'){ window.HVR_FEATURES?.toast?.(msg,kind); }
  function localSave(){ try{ window.HVR_SAVE_LOCAL_PROFILE?.(window.currentProfile); }catch(e){} }

  if (typeof PROMO_CODES === 'object') Object.assign(STATIC_PROMOS, clone(PROMO_CODES));

  function dbAvailable(){ return !!DB && !!DB.ref; }
  async function dbGet(path){ if(!dbAvailable()) return null; try{ const s=await DB.ref(path).get(); return s.exists()?s.val():null; }catch(e){ console.warn('Creator DB get failed',path,e); return null; } }
  async function dbSet(path,value){ if(!dbAvailable()) return false; try{ await DB.ref(path).set(value); return true; }catch(e){ console.warn('Creator DB set failed',path,e); return false; } }
  async function dbUpdate(path,value){ if(!dbAvailable()) return false; try{ await DB.ref(path).update(value); return true; }catch(e){ console.warn('Creator DB update failed',path,e); return false; } }

  function promoDisabled(code){ return !!disabledPromos?.[code] || !!disabledPromos?.[encodeURIComponent(code)] || !!disabledPromos?.[encodeURIComponent(code).replace(/\./g,'%2E')]; }
  function applyPromoCatalog(){
    if(typeof PROMO_CODES!=='object') return;
    Object.keys(PROMO_CODES).forEach(k=>delete PROMO_CODES[k]);
    // Every player can technically type the secret Creator token; no other promo is exposed to them.
    if(isCreator()){
      Object.assign(PROMO_CODES, clone(STATIC_PROMOS));
      Object.entries(disabledPromos||{}).forEach(([k,v])=>{ if(v){ const raw=decodeURIComponent(k); delete PROMO_CODES[raw]; } });
      Object.entries(remotePromos||{}).forEach(([id,p])=>{
        if(!p || p.enabled===false || promoDisabled(p.code||id)) return;
        if(p.code) PROMO_CODES[p.code]=clone(p);
      });
    }else{
      PROMO_CODES[CREATOR_CODE]=clone(CREATOR_CODE_META);
    }
    window.HVR_CREATOR_PROMOS_READY=true;
  }

  function roleOfSnapshot(s){
    if(s?.creator) return 'CREATOR';
    if(s?.admin) return 'ADMIN';
    if(Number(s?.vipUntil||0)>Date.now()) return 'VIP';
    return '';
  }
  function sanitizeSnapshot(s){
    const out=clone(s||{});
    out.coins=Math.max(0,Math.floor(Number(out.coins)||0));
    out.drawKeys=Math.max(0,Math.floor(Number(out.drawKeys??out.wheelSpins)||0));
    out.ownedMaps=[...new Set((Array.isArray(out.ownedMaps)?out.ownedMaps:[]).filter(k=>typeof MAPS?.[k]==='object'))];
    if(!out.ownedMaps.includes('village')) out.ownedMaps.unshift('village');
    out.ownedHeroes=[...new Set((Array.isArray(out.ownedHeroes)?out.ownedHeroes:[]).filter(k=>typeof TOWER_TYPES?.[k]==='object'))];
    if(!out.ownedHeroes.includes('mraveli')) out.ownedHeroes.unshift('mraveli');
    out.heroLevels=(out.heroLevels&&typeof out.heroLevels==='object')?out.heroLevels:{};
    out.admin=!!out.admin; out.creator=!!out.creator; out.vipUntil=Number(out.vipUntil||0);
    out.displayTitle=String(out.displayTitle||'').slice(0,40);
    out.selectedMap=(out.selectedMap&&MAPS[out.selectedMap]&&out.ownedMaps.includes(out.selectedMap))?out.selectedMap:'village';
    out.selectedDifficulty=(out.selectedDifficulty&&typeof DIFFICULTIES?.[out.selectedDifficulty]==='object')?out.selectedDifficulty:'mijin';
    if(out.creator) out.admin=true;
    if(out.economy && typeof out.economy==='object'){ const n=v=>Math.max(0,Math.floor(Number(v)||0)); out.economy={gems:n(out.economy.gems),crystals:n(out.economy.crystals),tickets:n(out.economy.tickets),goldenKeys:n(out.economy.goldenKeys)}; } else delete out.economy;
    return out;
  }

  async function publishManagedState(profile, reason='player-save'){
    if(!dbAvailable() || !profile?.username) return;
    const key=profileKey(profile.username);
    const snapshot=sanitizeSnapshot({
      coins:profile.coins,drawKeys:profile.drawKeys??profile.wheelSpins,
      ownedMaps:profile.ownedMaps,ownedHeroes:profile.ownedHeroes,heroLevels:profile.heroLevels,
      admin:profile.admin,creator:profile.creator,vipUntil:profile.vipUntil,displayTitle:profile.displayTitle,
      selectedMap:profile.selectedMap,selectedDifficulty:profile.selectedDifficulty
    });
    const revision=Math.max(Date.now(),Number(profile.creatorRemoteRevision||0)+1);
    // Full state is kept separately from the public leaderboard row so restrictive players rules remain compatible.
    await dbSet(`playerStates/${key}`,{revision,updatedBy:profile.username,reason,snapshot,updatedAt:Date.now()});
  }

  async function loadGlobalControl(){
    if(!dbAvailable()) return;
    const control=await dbGet('gameControl');
    if(control){
      remotePromos=control.promos||{};
      disabledPromos=control.disabledPromos||{};
      eventOverrides=control.events||{};
      window.HVR_CREATOR.eventOverrides=eventOverrides;
      if(control.announcement && Number(control.announcement.at||0)>lastAnnouncementAt){
        lastAnnouncementAt=Number(control.announcement.at)||0;
        if(control.announcement.text && control.announcement.from!==window.currentProfile?.username){
          toast(`📢 ${control.announcement.from||'Creator'}: ${control.announcement.text}`,'good');
        }
      }
      window.HVR_CREATOR.announcement=control.announcement||null;
    }
    applyPromoCatalog();
    window.renderPromoAccess?.();
    window.renderAdminInfoButton?.();
    window.renderCreatorButton?.();
  }

  async function syncManagedProfile(opts){
    const p=window.currentProfile;
    if(!p || !dbAvailable()) return;
    const data=await dbGet(`playerStates/${profileKey(p.username)}`);
    if(!data?.snapshot) return;
    const rev=Number(data.revision||0);
    const updatedBy=String(data.updatedBy||'');
    // Ignore a state that this exact client just wrote.
    if(updatedBy===p.username && rev<=Number(p.creatorRemoteRevision||0)) return;
    if(rev<=Number(p.creatorRemoteRevision||0)) return;
    // A normal save made by this player is only applied when it is NEWER than what this device
    // last published (e.g. progress made on another device). Otherwise offline progress made here
    // would be rolled back to an older cloud copy.
    const ownSave=updatedBy===p.username && (data.reason==='profile-save'||data.reason==='player-save');
    if(ownSave && (opts?.foreignOnly || Number(data.updatedAt||0)<=Number(p.lastPublishedAt||0))) return;
    const s=sanitizeSnapshot(data.snapshot);
    p.ownedMaps=s.ownedMaps; p.ownedHeroes=s.ownedHeroes; p.heroLevels=clone(s.heroLevels);
    p.coins=s.coins; p.drawKeys=s.drawKeys; p.wheelSpins=s.drawKeys;
    p.admin=s.admin; p.creator=s.creator; p.vipUntil=s.vipUntil; p.displayTitle=s.displayTitle;
    p.selectedMap=s.selectedMap; p.selectedDifficulty=s.selectedDifficulty; p.creatorRemoteRevision=rev;
    if(s.economy){ try{ const ex=window.HVR_EXPANSION?.ensure?.(); if(ex) Object.assign(ex.economy,s.economy); }catch(e){} }
    localSave();
    try{ window.HVR_SET_SELECTED_MAP?.(p.selectedMap); }catch(e){}
    window.updateCoinDisplays?.(); window.renderMapGrid?.(); window.renderHeroesInfoList?.();
    window.HVR_REFRESH_HEROES?.(); window.renderInGameSpecialButton?.(); window.renderAdminInfoButton?.(); window.renderCreatorButton?.();
    window.renderPromoAccess?.(); applyPromoCatalog();
    if(updatedBy && updatedBy!==p.username) toast(`🛠️ ${updatedBy}-ը փոփոխություն ուղարկեց քո հաշվին։`,'good');
  }

  async function loadPlayers(){
    if(!dbAvailable()){remotePlayers=[];return;}
    const data=await dbGet('players');
    remotePlayers=Object.values(data||{}).filter(v=>v&&typeof v.username==='string').map(v=>(
      {username:v.username,coins:Number(v.coins)||0,role:String(v.role||''),displayTitle:String(v.displayTitle||''),updatedAt:Number(v.updatedAt)||0}
    )).sort((a,b)=>(b.coins-a.coins)||(b.updatedAt-a.updatedAt));
  }

  async function getTargetSnapshot(username){
    const key=profileKey(username);
    const state=await dbGet(`playerStates/${key}`);
    if(state?.snapshot) return sanitizeSnapshot(state.snapshot);
    const row=await dbGet(`players/${key}`);
    if(row?.state) return sanitizeSnapshot(row.state);
    return sanitizeSnapshot({coins:Number(row?.coins)||0,drawKeys:1,ownedMaps:['village'],ownedHeroes:['mraveli'],heroLevels:{},admin:row?.role==='ADMIN',creator:row?.role==='CREATOR',vipUntil:row?.role==='VIP'?Date.now()+3650*86400000:0,displayTitle:String(row?.displayTitle||''),selectedMap:'village',selectedDifficulty:'mijin'});
  }

  async function writeManaged(targetName, mutate, label){
    if(!isCreator()) return toast('❌ Creator mode չկա։','bad');
    if(!dbAvailable()) return toast('❌ Firebase-ը միացված չէ․ Creator Control Center չի կարող online փոփոխություն պահել։','bad');
    const key=profileKey(targetName); if(!key) return;
    const snap=await getTargetSnapshot(targetName);
    mutate(snap);
    if(snap.creator) snap.admin=true;
    const clean=sanitizeSnapshot(snap);
    const revision=Math.max(Date.now(),Number((await dbGet(`playerStates/${key}/revision`))||0)+1);
    const record={revision,updatedBy:window.currentProfile.username,reason:label,snapshot:clean,updatedAt:Date.now()};
    const saved=await dbSet(`playerStates/${key}`,record);
    if(!saved) return toast('❌ Creator փոփոխությունը Firebase-ը չընդունեց։ Ստուգիր Firebase Rules-ը։','bad');
    const role=roleOfSnapshot(clean);
    const publicRow={username:targetName,coins:clean.coins,role,displayTitle:clean.displayTitle,updatedAt:Date.now()};
    // Public row intentionally contains only the simple fields accepted by the original leaderboard rules.
    const pubOk=await dbSet(`players/${key}`,publicRow);
    if(!pubOk){ toast(`⚠️ ${targetName}-ի state-ը պահվեց, բայց leaderboard row-ը չթարմացավ․ ստուգիր Firebase Rules-ը։`,'bad'); }
    toast(`✅ ${targetName} ← ${label}`,'good');
    await loadPlayers(); render();
  }

  async function selectTargetFromLeaderboard(){
    await loadPlayers();
    const list=document.getElementById('creatorPlayerList'); if(!list)return;
    const q=String(document.getElementById('creatorPlayerSearch')?.value||'').trim().toLowerCase();
    const filtered=remotePlayers.filter(p=>!q||p.username.toLowerCase().includes(q));
    list.innerHTML=filtered.map(p=>`<button class="creatorPlayerRow ${selectedTarget===p.username?'selected':''}" data-target="${esc(p.username)}"><span><b>${esc(p.username)}</b><small>${esc(p.role||'PLAYER')}${p.displayTitle?` • ${esc(p.displayTitle)}`:''} • 🏆 ${Number(p.coins||0).toLocaleString()}</small></span><em>${selectedTarget===p.username?'✅':''}</em></button>`).join('')||'<div class="creatorEmpty">Խաղացողներ չկան։</div>';
  }

  async function controlSelected(kind){
    if(!selectedTarget) return toast('Ընտրիր խաղացող։','bad');
    const val=Math.max(0,Math.floor(Number(document.getElementById('creatorAmount')?.value||0)));
    if(kind==='coinsAdd') return writeManaged(selectedTarget,s=>s.coins+=val,'+ գավատ');
    if(kind==='coinsSub') return writeManaged(selectedTarget,s=>s.coins=Math.max(0,s.coins-val),'- գավատ');
    if(kind==='keysAdd') return writeManaged(selectedTarget,s=>s.drawKeys+=val,'+ բանալի');
    const ecoKinds={gemsAdd:['gems',1,'💎 Gems'],gemsSub:['gems',-1,'💎 Gems'],crystalsAdd:['crystals',1,'🔮 Crystals'],crystalsSub:['crystals',-1,'🔮 Crystals'],ticketsAdd:['tickets',1,'🎟️ Tickets'],ticketsSub:['tickets',-1,'🎟️ Tickets']};
    if(ecoKinds[kind]){ const [f,sign,lbl]=ecoKinds[kind]; return writeManaged(selectedTarget,s=>{ s.economy=s.economy||{gems:0,crystals:0,tickets:0,goldenKeys:0}; s.economy[f]=Math.max(0,(Number(s.economy[f])||0)+sign*val); },(sign>0?'+ ':'- ')+lbl); }
    if(kind==='keysSub') return writeManaged(selectedTarget,s=>s.drawKeys=Math.max(0,s.drawKeys-val),'- բանալի');
    if(kind==='adminOn') return writeManaged(selectedTarget,s=>{
      s.admin=true; s.autoLevel=true; s.coins=Number.MAX_SAFE_INTEGER; s.drawKeys=Number.MAX_SAFE_INTEGER;
      s.ownedHeroes=Object.keys(TOWER_TYPES); s.ownedMaps=[...MAP_SEQUENCE]; s.heroLevels=s.heroLevels||{};
      Object.keys(TOWER_TYPES).forEach(k=>s.heroLevels[k]=HERO_MAX_LEVEL);
    },'ADMIN տալ');
    if(kind==='adminOff') return writeManaged(selectedTarget,s=>{ if(!s.creator)s.admin=false; },'ADMIN վերցնել');
    if(kind==='vipOn') return writeManaged(selectedTarget,s=>{s.vipUntil=Date.now()+3650*86400000;},'VIP տալ');
    if(kind==='vipOff') return writeManaged(selectedTarget,s=>{s.vipUntil=0;},'VIP վերցնել');
    if(kind==='titleSet'){
      const title=String(document.getElementById('creatorTitle')?.value||'').trim().slice(0,40);
      if(!title)return toast('Գրիր label-ի անունը։','bad');
      return writeManaged(selectedTarget,s=>{s.displayTitle=title;},`Label՝ ${title}`);
    }
    if(kind==='titleClear') return writeManaged(selectedTarget,s=>{s.displayTitle='';},'Label հեռացնել');
    if(kind==='heroGive'){
      const k=document.getElementById('creatorHeroSelect')?.value; if(!k)return;
      return writeManaged(selectedTarget,s=>{s.ownedHeroes=s.ownedHeroes||[];s.heroLevels=s.heroLevels||{};if(!s.ownedHeroes.includes(k))s.ownedHeroes.push(k);s.heroLevels[k]=Math.max(1,Number(s.heroLevels[k]||1));},`Hero տալ՝ ${TOWER_TYPES[k]?.name||k}`);
    }
    if(kind==='heroReset'){
      const k=document.getElementById('creatorHeroSelect')?.value; if(!k)return;
      return writeManaged(selectedTarget,s=>{s.ownedHeroes=(s.ownedHeroes||[]).filter(x=>x!==k);delete (s.heroLevels||{})[k];},`Hero հեռացնել՝ ${TOWER_TYPES[k]?.name||k}`);
    }
    if(kind==='mapGive'){
      const k=document.getElementById('creatorMapSelect')?.value; if(!k)return;
      return writeManaged(selectedTarget,s=>{s.ownedMaps=s.ownedMaps||[];if(!s.ownedMaps.includes(k))s.ownedMaps.push(k);s.selectedMap=k;},`Դաշտ տալ + ընտրել՝ ${MAPS[k]?.label||k}`);
    }
    if(kind==='mapReset'){
      const k=document.getElementById('creatorMapSelect')?.value; if(!k)return;
      return writeManaged(selectedTarget,s=>{s.ownedMaps=(s.ownedMaps||[]).filter(x=>x!==k);if(s.selectedMap===k)s.selectedMap='village';},`Դաշտ հեռացնել՝ ${MAPS[k]?.label||k}`);
    }
  }

  async function sendAnnouncement(){
    const msg=String(document.getElementById('creatorAnnouncement')?.value||'').trim();
    if(!msg)return toast('Գրիր հաղորդագրությունը։','bad');
    if(msg.length>500)return toast('Հաղորդագրությունը շատ երկար է։','bad');
    if(await dbSet('gameControl/announcement',{text:msg,from:window.currentProfile?.username||'Creator',at:Date.now()})){
      document.getElementById('creatorAnnouncement').value=''; toast('📢 Հաղորդագրությունը ուղարկվեց։','good');
    }else toast('❌ Broadcast-ը չպահվեց Firebase-ում։','bad');
  }

  async function setEventMode(id,mode){
    if(!isCreator() || !EVENT_IDS.includes(id) || !['auto','on','off'].includes(mode))return;
    eventOverrides[id]=mode; window.HVR_CREATOR.eventOverrides=eventOverrides;
    if(await dbSet(`gameControl/events/${id}`,mode)){ toast(`${EVENT_LABELS[id]} → ${mode.toUpperCase()}`,'good'); render(); }
    else toast('❌ Event-ի վիճակը չպահվեց Firebase-ում։','bad');
  }

  async function createPromo(){
    if(!isCreator())return;
    const code=String(document.getElementById('creatorPromoCode')?.value||'').trim();
    const type=String(document.getElementById('creatorPromoType')?.value||'coins');
    const value=Number(document.getElementById('creatorPromoValue')?.value||0);
    const days=Math.max(0,Number(document.getElementById('creatorPromoCooldown')?.value||0));
    const desc=String(document.getElementById('creatorPromoDesc')?.value||'').trim()||`Creator reward: ${type}`;
    if(code.length<3||code.length>120)return toast('Promo code-ի երկարությունը պետք է լինի 3–120։','bad');
    if(!/^[\x20-\x7E]+$/.test(code))return toast('Promo code-ը օգտագործիր ASCII նիշերով։','bad');
    if(code===CREATOR_CODE)return toast('Սա Creator unlock code-ն է։','bad');
    const id=encodeURIComponent(code.toLowerCase()).replace(/\./g,'%2E');
    if(PROMO_CODES[code] || remotePromos[id])return toast('Այս promo code-ը արդեն գոյություն ունի։','bad');
    const p={code,type,value,desc,cooldownDays:days,enabled:true,createdBy:window.currentProfile.username,createdAt:Date.now()};
    if(['luck','money5x','double','megaLuck'].includes(type)) p.minutes=Math.max(1,value||1);
    if(['coins','key'].includes(type)&&value<=0)return toast('Value-ը պետք է > 0 լինի։','bad');
    if(type==='hero')p.heroKey=String(document.getElementById('creatorPromoHero')?.value||'');
    if(type==='map')p.mapKey=String(document.getElementById('creatorPromoMap')?.value||'');
    if(type==='hero'&&!TOWER_TYPES[p.heroKey])return toast('Ընտրիր hero։','bad');
    if(type==='map'&&!MAPS[p.mapKey])return toast('Ընտրիր դաշտ։','bad');
    if(await dbSet(`gameControl/promos/${id}`,p)){
      remotePromos[id]=p; applyPromoCatalog(); toast(`✅ Ստեղծվեց՝ ${code}`,'good'); render();
      const inp=document.getElementById('creatorPromoCode');if(inp)inp.value='';
    }else toast('❌ Promo code-ը չպահվեց Firebase-ում։','bad');
  }

  async function togglePromo(id,enabled){
    if(!isCreator())return;
    if(remotePromos[id]){
      remotePromos[id].enabled=enabled;
      if(!(await dbSet(`gameControl/promos/${id}`,remotePromos[id])))return toast('❌ Promo փոփոխությունը չպահվեց։','bad');
    }else{
      disabledPromos[encodeURIComponent(id).replace(/\./g,'%2E')]=!enabled;
      if(!(await dbSet(`gameControl/disabledPromos/${encodeURIComponent(id).replace(/\./g,'%2E')}`,!enabled)))return toast('❌ Promo վիճակը չպահվեց։','bad');
    }
    applyPromoCatalog(); render();
  }

  async function deleteCustomPromo(id){
    if(!isCreator()||!remotePromos[id])return;
    if(await dbSet(`gameControl/promos/${id}`,null)){delete remotePromos[id];applyPromoCatalog();render();toast('🗑️ Promo code-ը ջնջվեց։','good');}
    else toast('❌ Promo code-ը չջնջվեց Firebase-ից։','bad');
  }

  function playersHTML(){
    const heroes=Object.entries(TOWER_TYPES).map(([k,t])=>`<option value="${esc(k)}">${esc(t.name)}</option>`).join('');
    const maps=MAP_SEQUENCE.map(k=>`<option value="${esc(k)}">${esc(MAPS[k].icon+' '+MAPS[k].label)}</option>`).join('');
    return `<div class="creatorGrid">
      <div class="creatorCard"><div class="creatorStatus ${dbAvailable()?'ok':'bad'}">${dbAvailable()?'🟢 Firebase connected':'🔴 Firebase not connected'}</div><input id="creatorPlayerSearch" placeholder="Փնտրել username…"><div id="creatorPlayerList" class="creatorPlayerList"></div></div>
      <div class="creatorCard"><h3>🛠️ Կառավարում՝ <span>${esc(selectedTarget||'ոչ ոք')}</span></h3>
        <div class="creatorSection"><b>💰 Currency</b><div class="creatorInline"><input id="creatorAmount" type="number" min="1" value="100"><button class="action" data-cc="coinsAdd">+🏆 Gavat</button><button class="action danger" data-cc="coinsSub">-🏆 Gavat</button></div><div class="creatorInline"><button class="action" data-cc="keysAdd">+🔑 Keys</button><button class="action danger" data-cc="keysSub">-🔑 Keys</button></div><div class="creatorInline"><button class="action" data-cc="gemsAdd">+💎 Gems</button><button class="action danger" data-cc="gemsSub">-💎 Gems</button><button class="action" data-cc="crystalsAdd">+🔮 Crystals</button><button class="action danger" data-cc="crystalsSub">-🔮 Crystals</button></div><div class="creatorInline"><button class="action" data-cc="ticketsAdd">+🎟️ Tickets</button><button class="action danger" data-cc="ticketsSub">-🎟️ Tickets</button></div></div>
        <div class="creatorSection"><b>👑 Roles</b><div class="creatorInline"><button class="action" data-cc="adminOn">+ ADMIN</button><button class="action danger" data-cc="adminOff">- ADMIN</button><button class="action" data-cc="vipOn">+ VIP</button><button class="action danger" data-cc="vipOff">- VIP</button></div></div>
        <div class="creatorSection"><b>🏷️ Հատուկ անուն</b><input id="creatorTitle" maxlength="40" placeholder="Օր. Legend / MVP / Tester"><div class="creatorInline"><button class="action" data-cc="titleSet">🏷️ Նշանակել</button><button class="action danger" data-cc="titleClear">🧹 Հանել</button></div><small>Միայն ցուցադրվող անուն է․ privilege/reward չի տալիս։</small></div>
        <div class="creatorSection"><b>🦸 Hero</b><select id="creatorHeroSelect">${heroes}</select><div class="creatorInline"><button class="action" data-cc="heroGive">➕ Տալ</button><button class="action danger" data-cc="heroReset">🗑️ Հանել</button></div></div>
        <div class="creatorSection"><b>🗺️ Դաշտ</b><select id="creatorMapSelect">${maps}</select><div class="creatorInline"><button class="action" data-cc="mapGive">➕ Տալ + ընտրել</button><button class="action danger" data-cc="mapReset">🗑️ Հանել</button></div></div>
      </div></div>`;
  }

  function eventsHTML(){
    const modeText=x=>x==='on'?'ON':x==='off'?'OFF':'AUTO';
    return `<div class="creatorCard"><h3>🎉 Event Control</h3><p class="tip">AUTO = օրացույց, ON = ստիպողաբար միացված, OFF = ամբողջությամբ անջատված։</p><div class="creatorEventGrid">${EVENT_IDS.map(id=>{const mode=eventOverrides[id]||'auto';return `<div class="creatorEventCard"><b>${EVENT_LABELS[id]}</b><small>${esc(EVENT_CATALOG[id].desc)}</small><div class="creatorInline">${['auto','on','off'].map(x=>`<button class="action ${mode===x?'selected':''}" data-event="${id}" data-event-mode="${x}">${modeText(x)}</button>`).join('')}</div></div>`;}).join('')}</div></div>`;
  }

  function promoHTML(){
    const builtin=Object.entries(STATIC_PROMOS).map(([code,p])=>`<div class="creatorPromoRow"><code>${esc(code)}</code><span>${esc(p.desc||'')}</span><button class="action" data-promo-toggle="${esc(code)}">${promoDisabled(code)?'✅ Միացնել':'⛔ Անջատել'}</button></div>`).join('');
    const custom=Object.entries(remotePromos).map(([id,p])=>`<div class="creatorPromoRow"><code>${esc(p.code||id)}</code><span>${esc(p.desc||'')} • ${Number(p.cooldownDays||0)}d</span><button class="action" data-promo-custom="${esc(id)}">${p.enabled===false?'✅ Միացնել':'⛔ Անջատել'}</button><button class="action danger" data-promo-delete="${esc(id)}">🗑️</button></div>`).join('');
    const heroes=Object.entries(TOWER_TYPES).map(([k,t])=>`<option value="${esc(k)}">${esc(t.name)}</option>`).join('');
    const maps=MAP_SEQUENCE.map(k=>`<option value="${esc(k)}">${esc(MAPS[k].icon+' '+MAPS[k].label)}</option>`).join('');
    return `<div class="creatorTwo"><div class="creatorCard"><h3>➕ Create Promo</h3><input id="creatorPromoCode" placeholder="NEW_CREATOR_CODE"><select id="creatorPromoType"><option value="coins">+ Gavat</option><option value="key">+ Keys</option><option value="luck">+ Luck minutes</option><option value="megaLuck">Mega Luck minutes</option><option value="money5x">x5 Gavat minutes</option><option value="double">x2 Gavat minutes</option><option value="hero">Give Hero</option><option value="map">Give Field</option><option value="vip">Give VIP</option><option value="admin">Give ADMIN</option></select><input id="creatorPromoValue" type="number" min="0" value="100" placeholder="Value / minutes"><input id="creatorPromoCooldown" type="number" min="0" value="7" placeholder="Cooldown days"><input id="creatorPromoDesc" placeholder="Promo-ի բացատրություն"><select id="creatorPromoHero">${heroes}</select><select id="creatorPromoMap">${maps}</select><button class="action" id="creatorPromoCreate">➕ Ստեղծել Promo</button></div><div class="creatorCard"><h3>🔐 Built-in + Creator Promos</h3><div class="creatorPromoList">${builtin}${custom||'<div class="creatorEmpty">Custom promo դեռ չկա։</div>'}</div></div></div>`;
  }

  function announceHTML(){ return `<div class="creatorCard"><h3>📢 Broadcast</h3><p class="tip">Գրված տեքստը կերևա մյուս խաղացողների մոտ որպես Creator announcement։</p><textarea id="creatorAnnouncement" maxlength="500" rows="4" placeholder="Օրինակ՝ 🎉 2x Reward Event-ը սկսվեց։"></textarea><button class="action" id="creatorAnnouncementSend">📢 Ուղարկել բոլորին</button></div>`; }

  function creatorInfoHTML(){ return `<div class="creatorCard"><h3>🟣 CREATOR permissions</h3><div class="creatorInfoList"><div>✅ ADMIN-ի բոլոր հնարավորությունները</div><div>✅ ADMIN / VIP տալ կամ վերցնել</div><div>✅ Հատուկ display name՝ առանց privilege/reward-ի</div><div>✅ 🏆 Gavat / 🔑 Keys / 💎 Gems / 🔮 Crystals / 🎟️ Tickets կառավարել (ցանկացած խաղացողի համար)</div><div>✅ Hero տալ / հեռացնել</div><div>✅ Field տալ / հեռացնել / ընտրել</div><div>✅ Event ON / OFF / AUTO</div><div>✅ Promo ստեղծել / disable / delete</div><div>✅ Broadcast բոլոր խաղացողներին</div><div>✅ Փոփոխությունները պահվում են Firebase playerStates-ում</div><div>✅ Game Info + Boxes/Rarity համակարգերի full access</div></div></div>`; }

  let currentTab='players';
  function render(){
    const box=document.getElementById('creatorContent'); if(!box||!isCreator())return;
    box.innerHTML=`<div class="creatorHero"><div><div class="creatorEyebrow">HEROES VS ROBOTS • CREATOR</div><h2>🟣 Creator Control Center</h2><p>Միայն CREATOR-ը կարող է տեսնել և կառավարել այս բաժինը։</p></div><div class="creatorBadge">CREATOR</div></div><div class="creatorTabs"><button class="creatorTab ${currentTab==='players'?'sel':''}" data-ctab="players">👥 Players</button><button class="creatorTab ${currentTab==='events'?'sel':''}" data-ctab="events">🎉 Events</button><button class="creatorTab ${currentTab==='promos'?'sel':''}" data-ctab="promos">🔐 Promos</button><button class="creatorTab ${currentTab==='broadcast'?'sel':''}" data-ctab="broadcast">📢 Broadcast</button><button class="creatorTab ${currentTab==='info'?'sel':''}" data-ctab="info">📖 Info</button></div><div id="creatorTabContent">${currentTab==='players'?playersHTML():currentTab==='events'?eventsHTML():currentTab==='promos'?promoHTML():currentTab==='broadcast'?announceHTML():creatorInfoHTML()}</div>`;
    if(currentTab==='players')selectTargetFromLeaderboard();
  }

  function renderTab(tab){ currentTab=tab; render(); }
  function open(){ if(!isCreator()) return toast('🔒 Creator mode-ը դեռ ակտիվ չէ։','bad'); render(); document.getElementById('creatorOverlay').style.display='flex'; }
  function close(){ document.getElementById('creatorOverlay').style.display='none'; }

  function installStyles(){
    if(document.getElementById('creatorStableStyles'))return;
    const style=document.createElement('style'); style.id='creatorStableStyles'; style.textContent=`
      .creatorInfoBtn{background:linear-gradient(135deg,#6f2c91,#c15cff)!important;border-color:#e1b0ff!important;box-shadow:0 8px 25px rgba(164,67,210,.25)!important}
      #creatorOverlay{z-index:1600;display:none;position:fixed;inset:0;background:rgba(8,5,15,.88);backdrop-filter:blur(8px);overflow:auto;padding:14px}
      .creatorBox{width:min(1180px,100%);margin:auto;background:linear-gradient(180deg,#181124,#0f0b18);border:1px solid #70438c;border-radius:24px;padding:18px;box-shadow:0 25px 80px rgba(0,0,0,.55);color:#eee}
      .creatorHero{display:flex;justify-content:space-between;gap:16px;align-items:center;background:linear-gradient(135deg,#27143a,#171022);border:1px solid #68418a;border-radius:18px;padding:18px}.creatorEyebrow{font-size:11px;letter-spacing:1.5px;color:#cf91ef}.creatorBadge{padding:10px 16px;border-radius:999px;background:#702b90;color:#fff;font-weight:900;letter-spacing:1px}.creatorTabs{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0}.creatorTab{border:1px solid #4e355e;background:#1d1526;color:#e8d7ef;border-radius:12px;padding:10px 12px;cursor:pointer}.creatorTab.sel{background:#713392;border-color:#ce8cf2}.creatorGrid,.creatorTwo{display:grid;grid-template-columns:1fr 1.2fr;gap:14px}.creatorCard{background:#14101c;border:1px solid #3b2a48;border-radius:18px;padding:14px}.creatorCard input,.creatorCard select,.creatorCard textarea{width:100%;box-sizing:border-box;background:#0c0910;color:#f0e7f6;border:1px solid #503a5d;border-radius:10px;padding:10px;margin:5px 0}.creatorPlayerList{display:grid;gap:6px;max-height:460px;overflow:auto;margin-top:8px}.creatorPlayerRow{display:flex;justify-content:space-between;align-items:center;text-align:left;background:#17111e;border:1px solid #34233e;color:#eee;border-radius:12px;padding:9px;cursor:pointer}.creatorPlayerRow.selected{border-color:#bf74e4;background:#2a1833}.creatorPlayerRow small{display:block;opacity:.72;margin-top:3px}.creatorSection{margin-top:13px;padding-top:10px;border-top:1px solid #30233a}.creatorInline{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}.creatorInline .action{margin:0}.creatorSection .danger,.danger{background:linear-gradient(180deg,#6e2631,#421620)!important;border-color:#a84b59!important}.creatorEventGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.creatorEventCard{padding:12px;border:1px solid #382842;border-radius:14px;background:#17121d}.creatorEventCard small{display:block;opacity:.75;margin:6px 0 10px}.creatorEventCard .selected{box-shadow:inset 0 0 0 1px #df98ff;background:#62307d}.creatorPromoList{max-height:600px;overflow:auto}.creatorPromoRow{display:grid;grid-template-columns:1.3fr 1fr auto auto;gap:7px;align-items:center;padding:8px;border-bottom:1px solid #2b2132}.creatorPromoRow code{font-size:11px;word-break:break-all}.creatorInfoList{display:grid;gap:9px}.creatorInfoList div{padding:10px;border-radius:10px;background:#1b1422;border:1px solid #31243a}.creatorStatus{padding:8px 10px;border-radius:10px;margin-bottom:8px;font-weight:800}.creatorStatus.ok{background:#153821;color:#9affb5}.creatorStatus.bad{background:#3f171b;color:#ff9ca8}
      @media(max-width:800px){.creatorGrid,.creatorTwo{grid-template-columns:1fr}.creatorEventGrid{grid-template-columns:1fr}.creatorPromoRow{grid-template-columns:1fr}.creatorHero{flex-direction:column;align-items:flex-start}.creatorBox{padding:12px;border-radius:18px}}
    `;document.head.appendChild(style);
  }

  function setup(){
    if(initialized)return; initialized=true; installStyles();
    ['creatorInfoBtn','creatorInfoGameBtn'].forEach(id=>document.getElementById(id)?.addEventListener('click',open));
    document.getElementById('creatorCloseBtn')?.addEventListener('click',close);
    document.getElementById('creatorContent')?.addEventListener('click',async e=>{
      const tab=e.target.closest('[data-ctab]'); if(tab){renderTab(tab.dataset.ctab);return;}
      const row=e.target.closest('[data-target]'); if(row){selectedTarget=row.dataset.target;render();return;}
      const cc=e.target.closest('[data-cc]'); if(cc){await controlSelected(cc.dataset.cc);return;}
      const ev=e.target.closest('[data-event]'); if(ev){await setEventMode(ev.dataset.event,ev.dataset.eventMode);return;}
      const bt=e.target.closest('[data-promo-toggle]'); if(bt){const code=bt.dataset.promoToggle;await togglePromo(code,promoDisabled(code));return;}
      const bc=e.target.closest('[data-promo-custom]'); if(bc){const p=remotePromos[bc.dataset.promoCustom];if(p)await togglePromo(bc.dataset.promoCustom,p.enabled===false);return;}
      const bd=e.target.closest('[data-promo-delete]'); if(bd)await deleteCustomPromo(bd.dataset.promoDelete);
      if(e.target.closest('#creatorPromoCreate'))await createPromo();
      if(e.target.closest('#creatorAnnouncementSend'))await sendAnnouncement();
    });
    document.getElementById('creatorContent')?.addEventListener('input',e=>{if(e.target.id==='creatorPlayerSearch')selectTargetFromLeaderboard();});
    setTimeout(async()=>{await loadGlobalControl();await syncManagedProfile();render();},500);
    // Pick up changes a Creator makes to this account while the player is online.
    setInterval(()=>{ if(window.currentProfile && document.visibilityState!=='hidden') syncManagedProfile({foreignOnly:true}); },30000);
  }

  window.HVR_CREATOR={
    code:CREATOR_CODE,eventOverrides,eventCatalog:EVENT_CATALOG,isCreator,open,close,loadGlobalControl,syncManagedProfile,applyPromoCatalog,
    // Called after a player logs in: reload global control data (promo list depends on the creator flag) and sync.
    afterLogin:async()=>{ await loadGlobalControl(); await syncManagedProfile(); applyPromoCatalog(); },
    databaseConfigured:dbAvailable
  };
  document.addEventListener('DOMContentLoaded',setup);
})();
