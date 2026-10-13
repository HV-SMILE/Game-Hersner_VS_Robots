/* Heroes VS Robots — Feature Expansion Pack */
(function(){
  'use strict';

  const FEATURE_KEY = 'heroesVsRobots_features_v1';
  const dayMs = 86400000;
  const featureState = { lastWaveSeen:0, lastLog:'', lastAwardedWave:0, victoryHandled:false, defeatHandled:false };

  const RARITIES = {
    common:{label:'Common', icon:'⚪', mult:1.00},
    rare:{label:'Rare', icon:'🔵', mult:1.08},
    epic:{label:'Epic', icon:'🟣', mult:1.18},
    legendary:{label:'Legendary', icon:'🟠', mult:1.30},
    mythic:{label:'Mythic', icon:'🔴', mult:1.45}
  };
  const HERO_RARITY = {
    mraveli:'common', atoriponch:'rare', skochitagavor:'rare', kettle:'rare',
    simvolneri_mard:'epic', shamshyan:'epic', hikler:'epic', expelearmus:'legendary',
    ferri:'rare', heraxos:'legendary', jutak:'rare', kungfu:'epic', matem:'epic',
    nikolaganner:'legendary', taguhi:'mythic', tort:'rare', smile_immortal:'mythic'
  };

  const HERO_ABILITIES = {
    mraveli:'Dust Combo', atoriponch:'Chair Bash', skochitagavor:'Tape Lock', kettle:'Steam Burst',
    simvolneri_mard:'Symbol Burn', shamshyan:'Flash Freeze', hikler:'Guardian Aura',
    expelearmus:'Arcane Execute', ferri:'Iron Overheat', heraxos:'Traitor Pulse',
    jutak:'Violin Shock', kungfu:'Three Paths', matem:'Math Field', nikolaganner:'Multi Shot',
    taguhi:'Royal Aura', tort:'Cake Freeze', smile_immortal:'Immortal Core'
  };

  function freshFeatures(){
    return {
      xp:0, level:1, heroXp:{}, abilityLv:{}, ultimate:0, ultimateActiveUntil:0,
      totalWaves:0, totalGames:0, wins:0, defeats:0, bestWave:0, currentStreak:0,
      maxStreak:0, prestige:0, achievements:[], missions:{}, rewardHistory:[],
      chests:1, sound:true, notifications:true, lastMissionDay:'', fieldEvent:null,
      lastFeatureDaily:0
    };
  }
  function loadFeatures(){
    try { return JSON.parse(localStorage.getItem(FEATURE_KEY)||'{}') || {}; } catch(e){ return {}; }
  }
  function saveFeatures(f){ try { localStorage.setItem(FEATURE_KEY, JSON.stringify(f)); } catch(e){} }
  function featureForProfile(){
    if(!window.currentProfile) return null;
    if(!currentProfile.hvrFeatures || typeof currentProfile.hvrFeatures!=='object') currentProfile.hvrFeatures=freshFeatures();
    const f=currentProfile.hvrFeatures;
    const d=freshFeatures();
    Object.keys(d).forEach(k=>{ if(f[k]===undefined) f[k]=d[k]; });
    if(!f.heroXp) f.heroXp={}; if(!f.abilityLv) f.abilityLv={}; if(!f.missions) f.missions={}; if(!Array.isArray(f.achievements)) f.achievements=[]; if(!Array.isArray(f.rewardHistory)) f.rewardHistory=[];
    if(!f.fieldEvent) f.fieldEvent=makeFieldEvent();
    return f;
  }
  function ensureProfile(){ if(!window.currentProfile) return null; const f=featureForProfile(); try{ if(window.saveProfile) window.saveProfile(currentProfile); }catch(e){} return f; }

  function makeFieldEvent(){
    const events=[
      {id:'sunny',icon:'☀️',name:'Արևային դաշտ',desc:'+15% ստացվող 🏆',coinMult:1.15,damageMult:1,rateMult:1},
      {id:'storm',icon:'⛈️',name:'Փոթորկոտ դաշտ',desc:'Ռոբոտներ +10% արագ',coinMult:1.05,damageMult:1,rateMult:1},
      {id:'energy',icon:'⚡',name:'Էներգիայի գոտի',desc:'Հերոսների կրակ +10%',coinMult:1,damageMult:1,rateMult:.90},
      {id:'treasure',icon:'💎',name:'Գանձերի դաշտ',desc:'+1 լրացուցիչ 🔑 ամեն 10 ալիքից',coinMult:1.10,damageMult:1,rateMult:1},
      {id:'training',icon:'🎯',name:'Վարժանքի դաշտ',desc:'Հերոսների վնաս +10%',coinMult:1,damageMult:1.10,rateMult:1}
    ];
    return events[Math.floor(Math.random()*events.length)];
  }

  function logReward(text){
    const f=featureForProfile(); if(!f) return;
    f.rewardHistory.unshift({text:String(text),at:Date.now()});
    f.rewardHistory=f.rewardHistory.slice(0,30); if(window.saveProfile) window.saveProfile(currentProfile);
  }
  function toast(msg, kind){
    if(!currentProfile) return;
    let el=document.getElementById('hvrToast');
    if(!el){ el=document.createElement('div'); el.id='hvrToast'; document.body.appendChild(el); }
    el.className='hvrToast '+(kind||''); el.textContent=msg; el.classList.add('show');
    clearTimeout(el._t); el._t=setTimeout(()=>el.classList.remove('show'),3000);
  }
  function beep(freq=520,dur=.09,type='sine'){
    const f=featureForProfile(); if(!f?.sound) return;
    try{
      const C=window.AudioContext||window.webkitAudioContext; if(!C)return;
      if(!beep.ctx) beep.ctx=new C(); const o=beep.ctx.createOscillator(), g=beep.ctx.createGain();
      o.type=type; o.frequency.value=freq; g.gain.setValueAtTime(.0001,beep.ctx.currentTime); g.gain.exponentialRampToValueAtTime(.035,beep.ctx.currentTime+.01); g.gain.exponentialRampToValueAtTime(.0001,beep.ctx.currentTime+dur); o.connect(g).connect(beep.ctx.destination); o.start(); o.stop(beep.ctx.currentTime+dur+.02);
    }catch(e){}
  }
  function addXP(amount, reason){
    const f=featureForProfile(); if(!f)return;
    let a=Math.max(0,Math.round(amount)); f.xp+=a;
    while(f.xp >= f.level*500){ f.xp-=f.level*500; f.level++; toast(`✨ Level Up! Profile Lv${f.level}`,'good'); beep(880,.18,'triangle'); }
    if(reason) logReward(`+${a} XP • ${reason}`);
    if(window.saveProfile) window.saveProfile(currentProfile); renderFeatureHub();
  }
  function addHeroXP(amount){
    const f=featureForProfile(); if(!f||!currentProfile?.ownedHeroes)return;
    currentProfile.ownedHeroes.forEach(k=>f.heroXp[k]=(f.heroXp[k]||0)+Math.max(0,amount));
    if(window.saveProfile) window.saveProfile(currentProfile);
  }
  function abilityLv(key){ const f=featureForProfile(); return Math.min(5,Math.max(0,Number(f?.abilityLv?.[key]||0))); }
  function abilityCost(key){ return 25 + abilityLv(key)*25; }
  function buyAbility(key){
    if(!currentProfile || !window.spendCoins) return;
    const f=featureForProfile(); const lv=abilityLv(key); if(lv>=5){toast('Ability-ը արդեն Max Lv5 է։');return;}
    const cost=abilityCost(key); if(!spendCoins(cost)){toast(`Պետք է ${cost} 🏆։`,'bad');return;}
    f.abilityLv[key]=lv+1; logReward(`${TOWER_TYPES[key]?.name||key} • Ability Lv${lv+1}`); addXP(30,'ability upgrade');
    toast(`⚡ ${HERO_ABILITIES[key]||'Ability'} → Lv${lv+1}`,'good'); beep(740,.12,'square'); renderFeatureHub();
  }
  function rarityMult(key){ return RARITIES[HERO_RARITY[key]||'common']?.mult||1; }
  function ultimateReady(){ return (featureForProfile()?.ultimate||0)>=100; }
  function activateUltimate(){
    const f=featureForProfile(); if(!f || !ultimateReady()) return false;
    f.ultimate=0; f.ultimateActiveUntil=Date.now()+10000; if(window.saveProfile) window.saveProfile(currentProfile);
    toast('🌟 ULTIMATE AKTԻՎ • 10 վայրկյան','good'); beep(980,.2,'sawtooth'); renderFeatureHub(); return true;
  }

  // Expose for game.js stat functions / optional UI.
  window.HVR_FEATURES={RARITIES,HERO_RARITY,HERO_ABILITIES,featureForProfile,rarityMult,abilityLv,addXP,addHeroXP,activateUltimate,ultimateReady,makeFieldEvent,toast,beep,logReward,robotSpeedMult:()=>Number(featureForProfile()?.fieldEvent?.id==='storm'?1.10:1)};

  // Extend persistence without changing the base save format.
  if(window.saveProfile){
    const _save=window.saveProfile;
    window.saveProfile=function(profile){
      if(profile){
        const old=currentProfile; currentProfile=profile;
        featureForProfile();
        currentProfile=old||profile;
      }
      return _save(profile);
    };
  }

  // Prestige: permanent 5% coin bonus per prestige.
  if(window.addCoins){
    const _add=window.addCoins;
    window.addCoins=function(n, applyWheelMultiplier=true){
      const f=featureForProfile(); let amount=Number(n)||0;
      const mult=1+((f?.prestige||0)*0.05);
      const eventMult=applyWheelMultiplier===false?1:(Number(f?.fieldEvent?.coinMult)||1); // fixed rewards (daily, promo, chests) are not boosted
      if(f) f.missions.coins=(f.missions.coins||0)+Math.max(0,Math.round(amount));
      return _add(amount*mult*eventMult,applyWheelMultiplier);
    };
  }
  // Hero rarity + ability upgrades feed into actual combat stats.
  if(window.heroEffectiveDamage){
    const _dmg=window.heroEffectiveDamage;
    window.heroEffectiveDamage=function(baseDamage,level,key){
      const ab=1+abilityLv(key)*0.06, ult=Date.now()<(featureForProfile()?.ultimateActiveUntil||0)?1.75:1;
      const field=featureForProfile()?.fieldEvent; const fieldMult=Number(field?.damageMult)||1;
      return _dmg(baseDamage,level) * rarityMult(key) * ab * ult * fieldMult;
    };
  }
  if(window.heroEffectiveMaxHp){
    const _hp=window.heroEffectiveMaxHp;
    window.heroEffectiveMaxHp=function(level,key){ return _hp(level) * rarityMult(key) * (1+abilityLv(key)*.04); };
  }
  if(window.heroEffectiveRateMult){
    const _rate=window.heroEffectiveRateMult;
    window.heroEffectiveRateMult=function(level,key){
      const ab=1+abilityLv(key)*0.035, ult=Date.now()<(featureForProfile()?.ultimateActiveUntil||0)?0.72:1;
      const field=featureForProfile()?.fieldEvent; const fieldMult=Number(field?.rateMult)||1;
      return _rate(level) * ab * ult * fieldMult;
    };
  }

  function awardWaveComplete(wave){
    const f=featureForProfile(); if(!f)return;
    if(wave<=featureState.lastAwardedWave) return; // already counted
    featureState.lastAwardedWave=wave;
    f.totalWaves++; f.bestWave=Math.max(f.bestWave,wave); f.currentStreak++; f.maxStreak=Math.max(f.maxStreak,f.currentStreak);
    f.ultimate=Math.min(100,f.ultimate+8);
    f.missions.weeklyWaves=(f.missions.weeklyWaves||0)+1;
    addXP(25+wave*3,`wave ${wave}`); addHeroXP(10+wave);
    if(wave%10===0){
      f.chests=(f.chests||0)+1; logReward(`🎁 Boss Chest • Wave ${wave}`); toast(`👑 Boss Wave cleared! +1 Chest`,'good'); beep(900,.16,'triangle');
    }
    if(f.fieldEvent?.id==='treasure' && wave%10===0){ currentProfile.drawKeys=(Number(currentProfile.drawKeys)||0)+1; logReward('+1 🔑 • Treasure Field'); }
    updateMission('waves',1); updateMission('streak',f.currentStreak); checkAchievements();
    if(window.saveProfile) window.saveProfile(currentProfile);
  }
  function awardGameResult(won,wave){
    const f=featureForProfile(); if(!f)return;
    if(won){ f.wins++; addXP(200+wave*5,'victory'); f.ultimate=Math.min(100,f.ultimate+25); toast('🏆 Հաղթանակ • Bonus XP!','good'); }
    else { f.defeats++; f.currentStreak=0; addXP(Math.max(20,wave*2),'defeat consolation'); }
    if(window.saveProfile) window.saveProfile(currentProfile); checkAchievements(); renderFeatureHub();
  }
  function updateMission(key,amount=1){ const f=featureForProfile(); if(!f)return; f.missions[key]=(f.missions[key]||0)+amount; }
  function resetMissionsIfNeeded(){
    const f=featureForProfile(); if(!f)return; const d=new Date().toISOString().slice(0,10);
    if(f.lastMissionDay!==d){ const old=f.missions||{}; f.lastMissionDay=d; f.missions={waves:0,streak:0,coins:0,weeklyWaves:Number(old.weeklyWaves||0),weeklyKey:old.weeklyKey||'',claimedWeekly:Boolean(old.claimedWeekly)}; f.fieldEvent=makeFieldEvent(); }
    const wk=`${new Date().getFullYear()}-W${Math.ceil((((new Date()-new Date(new Date().getFullYear(),0,1))/86400000)+new Date(new Date().getFullYear(),0,1).getDay()+1)/7)}`;
    if(f.missions.weeklyKey!==wk){ f.missions.weeklyKey=wk; f.missions.weeklyWaves=0; f.missions.claimedWeekly=false; }
  }
  const ACH=[
    ['first_wave','🌱 First Wave',()=>featureForProfile().totalWaves>=1,50],
    ['wave10','⚔ Wave 10',()=>featureForProfile().bestWave>=10,100],
    ['wave50','🔥 Wave 50',()=>featureForProfile().bestWave>=50,300],
    ['wave100','👑 Wave 100',()=>featureForProfile().bestWave>=100,1000],
    ['streak10','💥 10 Streak',()=>featureForProfile().maxStreak>=10,250],
    ['hero5','🦸 Hero Collector',()=>currentProfile?.ownedHeroes?.length>=5,200],
    ['hero10','🦸‍♂️ Hero Master',()=>currentProfile?.ownedHeroes?.length>=10,500],
    ['prestige1','♾️ First Prestige',()=>featureForProfile().prestige>=1,500]
  ];
  function checkAchievements(){
    const f=featureForProfile(); if(!f)return; ACH.forEach(([id,title,ok,reward])=>{ if(ok()&&!f.achievements.includes(id)){ f.achievements.push(id); if(window.addCoins)addCoins(reward,false); logReward(`${title} • +${reward} 🏆`); toast(`🏅 ${title}`,'good'); beep(760,.14,'triangle'); }}); if(window.saveProfile)window.saveProfile(currentProfile);
  }
  function claimMission(kind){
    const f=featureForProfile(); if(!f)return;
    const defs={waves:[(f.missions.waves||0)>=3,'claimedWaves',75],streak:[(f.currentStreak||0)>=5,'claimedStreak',120],hero:[(currentProfile?.ownedHeroes?.length||0)>=5,'claimedHero',200],weekly:[(f.missions.weeklyWaves||0)>=25,'claimedWeekly',600]};
    const d=defs[kind]; if(!d || !d[0] || f.missions[d[1]]){toast('Mission-ը դեռ պատրաստ չէ կամ արդեն վերցված է։','bad');return;}
    f.missions[d[1]]=true; addCoins(d[2],false); addXP(80,`mission ${kind}`); logReward(`📋 Mission ${kind} • +${d[2]} 🏆`); toast(`✅ Mission complete • +${d[2]} 🏆`,'good'); saveProfile(currentProfile); renderFeatureHub();
  }
  function prestige(){
    const f=featureForProfile(); if(!currentProfile || f.level<20){toast('Prestige-ի համար պետք է Profile Lv20։','bad');return;}
    if(!confirm(`Prestige ${f.prestige+1}-ը կզրոյացնի 🏆-ը և հերոսների մակարդակները, բայց կտա մշտական +5% եկամուտ։ Շարունակե՞լ`)) return;
    f.prestige++; f.xp=0; f.level=1; currentProfile.coins=0;
    Object.keys(currentProfile.heroLevels||{}).forEach(k=>currentProfile.heroLevels[k]=1);
    currentProfile.drawKeys=Math.max(1,Math.floor((currentProfile.drawKeys||0)/2));
    logReward(`♾️ Prestige ${f.prestige}`); if(window.saveProfile)window.saveProfile(currentProfile); toast(`♾️ Prestige ${f.prestige} բացվեց`,'good'); renderFeatureHub();
  }
  function chestOpen(){
    const f=featureForProfile(); if(!f)return; if((f.chests||0)<=0){toast('Chest չկա։','bad');return;}
    f.chests--; const rewards=[['coins',100],['coins',250],['key',3],['xp',400],['coins',500],['key',8]]; const r=rewards[Math.floor(Math.random()*rewards.length)];
    if(r[0]==='coins') addCoins(r[1],false); else if(r[0]==='key'){currentProfile.drawKeys=(Number(currentProfile.drawKeys)||0)+r[1];} else addXP(r[1],'boss chest');
    logReward(`🎁 Chest → ${r[1]} ${r[0]==='coins'?'🏆':r[0]==='key'?'🔑':'XP'}`); toast(`🎁 Chest: +${r[1]} ${r[0]==='coins'?'🏆':r[0]==='key'?'🔑':'XP'}`,'good'); beep(1040,.16,'triangle'); if(window.saveProfile)window.saveProfile(currentProfile); renderFeatureHub();
  }

  function featureHTML(){
    const f=featureForProfile()||freshFeatures();
    const next=f.level*500, pct=Math.max(0,Math.min(100,f.xp/next*100));
    const event=f.fieldEvent||makeFieldEvent();
    const ach=ACH.filter(x=>f.achievements.includes(x[0])).length;
    const wavesReady=(f.missions.waves||0)>=3;
    const streakReady=(f.currentStreak||0)>=5;
    const heroReady=(currentProfile?.ownedHeroes?.length||0)>=5;
    const missionWaveBtn=f.missions.claimedWaves?'✅':`<button class="action hvrMissionBtn" data-mission="waves">${wavesReady?'Claim 75 🏆':'🔒'}</button>`;
    const missionStreakBtn=f.missions.claimedStreak?'✅':`<button class="action hvrMissionBtn" data-mission="streak">${streakReady?'Claim 120 🏆':'🔒'}</button>`;
    const missionHeroBtn=f.missions.claimedHero?'✅':`<button class="action hvrMissionBtn" data-mission="hero">${heroReady?'Claim 200 🏆':'🔒'}</button>`;
    const weeklyReady=(f.missions.weeklyWaves||0)>=25;
    const weeklyBtn=f.missions.claimedWeekly?'✅':`<button class="action hvrMissionBtn" data-mission="weekly">${weeklyReady?'Claim 600 🏆':'🔒'}</button>`;
    const missions=`
      <div class="hvrMission"><b>📅 Daily • 3 waves</b><span>${Math.min(3,f.missions.waves||0)}/3 ${missionWaveBtn}</span></div>
      <div class="hvrMission"><b>🔥 Streak • 5</b><span>${Math.min(5,f.currentStreak||0)}/5 ${missionStreakBtn}</span></div>
      <div class="hvrMission"><b>🦸 Hero • 5 owned</b><span>${Math.min(5,currentProfile?.ownedHeroes?.length||0)}/5 ${missionHeroBtn}</span></div>
      <div class="hvrMission"><b>🗓 Weekly • 25 waves</b><span>${Math.min(25,f.missions.weeklyWaves||0)}/25 ${weeklyBtn}</span></div>`;
    const heroes=(currentProfile?.ownedHeroes||[]).map(k=>{
      const r=RARITIES[HERO_RARITY[k]||'common'], lv=abilityLv(k), cost=abilityCost(k); const t=TOWER_TYPES[k];
      return `<div class="hvrHeroCard"><div><b>${escapeHtml(t?.name||k)}</b><small>${r.icon} ${r.label} • ${escapeHtml(HERO_ABILITIES[k]||'Ability')}</small></div><button class="action hvrAbilityBtn" data-ability="${k}" ${lv>=5?'disabled':''}>Lv${lv}/5${lv<5?` • ${cost} 🏆`:''}</button></div>`;
    }).join('');
    const recent=(f.rewardHistory||[]).slice(0,8).map(x=>`<div class="hvrHistoryRow"><span>${escapeHtml(x.text)}</span><small>${new Date(x.at).toLocaleTimeString()}</small></div>`).join('')||'<div class="tip">Դեռ չկա պատմություն։</div>';
    return `<div class="hvrTopGrid">
      <div class="hvrStatCard"><b>👤 ${escapeHtml(currentProfile?.username||'Player')}</b><strong>Profile Lv${f.level}</strong><div class="hvrXpBar"><i style="width:${pct}%"></i></div><small>${f.xp.toLocaleString()} / ${next.toLocaleString()} XP</small></div>
      <div class="hvrStatCard"><b>♾️ Prestige ${f.prestige}</b><strong>+${f.prestige*5}% եկամուտ</strong><small>Best Wave: ${f.bestWave} • Wins: ${f.wins}</small></div>
      <div class="hvrStatCard"><b>🌟 Ultimate</b><strong>${ultimateReady()?'READY':`${Math.round(f.ultimate)}/100`}</strong><button class="action hvrUltimateBtn" ${ultimateReady()?'':'disabled'}>Ակտիվացնել 10վ</button></div>
    </div>
    <div class="hvrSection"><div class="hvrSectionHead"><h3>🌐 Global Profile</h3><span id="hvrOnlineStats">Loading…</span></div><div class="tip">Քո local progress-ը պահվում է սարքում, իսկ leaderboard-ը Firebase-ով shared է։</div></div>
    <div class="hvrSection"><div class="hvrSectionHead"><h3>🗺️ Դաշտի իրադարձություն</h3><span>${event.icon} ${event.name}</span></div><div class="tip">${event.desc}</div></div>
    <div class="hvrTwoCol">
      <div class="hvrSection"><div class="hvrSectionHead"><h3>⚡ Hero Abilities + Rarity</h3><span>0–5</span></div><div class="hvrHeroGrid">${heroes}</div></div>
      <div class="hvrSection"><div class="hvrSectionHead"><h3>🏅 Achievements</h3><span>${ach}/${ACH.length}</span></div><div class="hvrAchGrid">${ACH.map(x=>`<div class="hvrAch ${f.achievements.includes(x[0])?'done':''}"><b>${x[1]}</b><small>+${x[3]} 🏆</small></div>`).join('')}</div></div>
    </div>
    <div class="hvrTwoCol">
      <div class="hvrSection"><div class="hvrSectionHead"><h3>📋 Daily Missions</h3><span>Reset՝ ամեն օր</span></div>${missions}</div>
      <div class="hvrSection"><div class="hvrSectionHead"><h3>🎁 Boss Chests</h3><span>${f.chests||0} chest</span></div><button class="action hvrChestBtn" ${(f.chests||0)>0?'':'disabled'}>Բացել Chest</button><button class="action hvrPrestigeBtn">♾️ Prestige</button></div>
    </div>
    <div class="hvrSection"><div class="hvrSectionHead"><h3>📜 Reward History</h3><span>Վերջին 8-ը</span></div><div class="hvrHistory">${recent}</div></div>
    <div class="hvrBottomActions"><button class="action hvrSoundBtn">🔊 Sound: ${f.sound?'ON':'OFF'}</button><button class="action hvrNotifyBtn">🔔 Notifications: ${f.notifications?'ON':'OFF'}</button></div>`;
  }
  function renderFeatureHub(){ const el=document.getElementById('featureHubContent'); if(el)el.innerHTML=featureHTML(); }
  async function openHub(){ resetMissionsIfNeeded(); renderFeatureHub(); const ov=document.getElementById('featureHubOverlay'); if(ov)ov.style.display='flex'; const el=document.getElementById('hvrOnlineStats'); if(el){ const r=await fetchSharedLeaderboard(); if(r?.configured&&Array.isArray(r.rows)){ const top=r.rows[0]; el.textContent=`🌐 Online: ${r.rows.length} players • Top: ${top?top.username:'—'}`; } else el.textContent='🌐 Online stats unavailable'; }}

  function wireHub(){
    const c=document.getElementById('featureHubContent'); if(!c)return;
    c.onclick=(e)=>{
      const t=e.target.closest('button'); if(!t)return;
      if(t.classList.contains('hvrAbilityBtn')) buyAbility(t.dataset.ability);
      else if(t.classList.contains('hvrUltimateBtn')) activateUltimate();
      else if(t.classList.contains('hvrMissionBtn')) claimMission(t.dataset.mission);
      else if(t.classList.contains('hvrChestBtn')) chestOpen();
      else if(t.classList.contains('hvrPrestigeBtn')) prestige();
      else if(t.classList.contains('hvrSoundBtn')){ const f=featureForProfile(); f.sound=!f.sound; saveProfile(currentProfile); renderFeatureHub(); }
      else if(t.classList.contains('hvrNotifyBtn')){ const f=featureForProfile(); f.notifications=!f.notifications; saveProfile(currentProfile); renderFeatureHub(); }
    };
  }

  // Observe game UI state to make features work without destabilizing combat internals.
  function stateWatcher(){
    if(!currentProfile)return;
    resetMissionsIfNeeded();
    const f=featureForProfile();
    const waveText=document.getElementById('wave')?.textContent||'';
    const wave=Number((waveText.match(/(\d+)/)||[0,0])[1])||0;
    if(wave < featureState.lastWaveSeen){ featureState.lastWaveSeen=0; featureState.lastLog=''; featureState.lastAwardedWave=0; featureState.victoryHandled=false; featureState.defeatHandled=false; }
    if(wave>featureState.lastWaveSeen){
      featureState.lastWaveSeen=wave; f.bestWave=Math.max(f.bestWave,wave); addXP(8,'wave started'); if(f.notifications) toast(`🌊 Wave ${wave} started`); beep(520,.06,'sine'); checkAchievements();
    }
    const logText=document.getElementById('log')?.textContent||'';
    const m=logText.match(/Մակարդակ\s+(\d+)\s+ավարտված/);
    if(m && logText!==featureState.lastLog){ featureState.lastLog=logText; awardWaveComplete(Number(m[1])||0); }
    const overlay=document.getElementById('overlay');
    const title=document.getElementById('overlayTitle')?.textContent||'';
    const shown=overlay && getComputedStyle(overlay).display!=='none';
    if(shown && /ՀԱՂԹԱՆԱԿ/.test(title) && !featureState.victoryHandled){ featureState.victoryHandled=true; awardGameResult(true,wave); }
    if(shown && /ՊԱՐՏՈՒԹՅՈՒՆ/.test(title) && !featureState.defeatHandled){ featureState.defeatHandled=true; awardGameResult(false,wave); }
    if(!shown){ featureState.victoryHandled=false; featureState.defeatHandled=false; }
  }
  setInterval(stateWatcher,700);
  // game.js announces every finished wave, so nothing is missed when the log line is overwritten quickly (AutoLv).
  window.addEventListener('hvr:waveComplete',e=>{ try{ if(currentProfile) awardWaveComplete(Number(e.detail?.wave)||0); }catch(err){ console.warn(err); } });

  // Reset watcher when a new game starts.
  const originalInit=window.initGame;
  if(originalInit){
    window.initGame=function(...args){ featureState.lastWaveSeen=0; featureState.lastLog=''; featureState.lastAwardedWave=0; featureState.victoryHandled=false; featureState.defeatHandled=false; return originalInit(...args); };
  }

  document.addEventListener('DOMContentLoaded',()=>{
    wireHub();
    const b=document.getElementById('featureHubBtn'); if(b)b.onclick=openHub;
    const close=document.getElementById('featureHubCloseBtn'); if(close)close.onclick=()=>document.getElementById('featureHubOverlay').style.display='none';
  });
})();
