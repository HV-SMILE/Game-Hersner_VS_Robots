/* Heroes VS Robots — Mega Expansion Pack
 * Adds: battle modes, hero systems, fields/world map, economy, online profile
 * tools, long-term progression, achievements, season pass, quests and events.
 * Everything is persistent in the existing player profile.
 */
(function(){
  'use strict';

  const KEY='heroesVsRobots_expansion_v2';
  const DAY=86400000;
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const MODE_META={
    normal:{icon:'🎮',name:'Normal',desc:'Սովորական 100 wave progression',coin:1},
    endless:{icon:'🌊',name:'Endless',desc:'100-ից հետո ալիքները շարունակվում են առանց վերջի',coin:1.25},
    challenge:{icon:'🏆',name:'Challenge',desc:'Առավելագույնը 2 հերոս դաշտում',coin:1.5},
    speedrun:{icon:'⏱️',name:'Speedrun',desc:'Յուրաքանչյուր wave-ի ժամանակը հաշվվում է',coin:1.4},
    hardcore:{icon:'💀',name:'Hardcore',desc:'Մահացած hero-ն այդ խաղում այլևս չի վերադառնում',coin:1.8}
  };

  const RARITY={
    common:{label:'Common',icon:'⚪',mult:1},
    rare:{label:'Rare',icon:'🔵',mult:1.08},
    epic:{label:'Epic',icon:'🟣',mult:1.18},
    legendary:{label:'Legendary',icon:'🟠',mult:1.30},
    mythic:{label:'Mythic',icon:'🔴',mult:1.45}
  };
  const DEFAULT_RARITY={mraveli:'common',atoriponch:'rare',skochitagavor:'rare',kettle:'rare',simvolneri_mard:'epic',shamshyan:'epic',hikler:'epic',expelearmus:'legendary',ferri:'rare',heraxos:'legendary',jutak:'rare',kungfu:'epic',matem:'epic',nikolaganner:'legendary',taguhi:'mythic',tort:'rare',smile_immortal:'mythic'};
  const SYNERGIES=[
    ['mraveli','skochitagavor','🧹📼 Dust & Tape','+12% damage'],
    ['hikler','matem','💙🧮 Healing Math','+15% HP'],
    ['kettle','ferri','☕🔥 Heat Duo','+15% attack speed'],
    ['taguhi','smile_immortal','👑🙂 Royal Smile','+25% all stats'],
    ['atoriponch','kungfu','🪑🥋 Close Combat','+18% damage'],
    ['nikolaganner','taguhi','💚👑 Heart Queen','+20% coins']
  ];
  const EQUIP_STATS={
    weapon:{name:'Weapon',icon:'⚔️',dmg:.08},
    armor:{name:'Armor',icon:'🛡️',hp:.10},
    artifact:{name:'Artifact',icon:'💍',rate:.08}
  };
  const SKINS=['Classic','Neon','Shadow','Golden','Crystal','Pixel'];
  const FLAGS=['🌐','🇦🇲','🇷🇺','🇺🇦','🇬🇪','🇫🇷','🇩🇪','🇺🇸','🇬🇧','🇯🇵','🇨🇳','🇧🇷','🇮🇹','🇪🇸'];

  function fresh(){
    return {
      mode:'normal', hardcoreDead:{}, speedrunBestMs:0, lastWaveStart:0, lastWaveDurationMs:0,
      rarity:{...DEFAULT_RARITY}, evolution:{}, skillTree:{}, equipment:{}, skins:{}, skinSelected:{},
      ultimateLv:{}, aiMode:{}, artifacts:{power:0,guard:0,fortune:0},
      economy:{gems:0,crystals:0,goldenKeys:0,tickets:0,bankCoins:0,coinMultiplier:1},
      chest:{dailyClaimed:'',mega:0}, shop:{date:'',items:[],bought:{}},
      friends:[], flag:'🌐', online:{lastSeen:0,status:'Offline'},
      pvp:{wins:0,losses:0,lastFight:''}, guild:{name:'',code:'',members:[],xp:0,level:1,mission:0},
      season:{key:'',xp:0,level:1,claimed:[]}, quests:{dailyDay:'',daily:{},weeklyKey:'',weekly:{},claimed:{}},
      stats:{kills:0,elites:0,bosses:0,crits:0,damage:0,waves:0,speedWins:0},
      titles:[], rebirth:0, eventSeen:'', limitedUnlocks:[], notifications:true,
      meta:{createdAt:Date.now()}
    };
  }
  function ensure(){
    if(!window.currentProfile) return null;
    if(!currentProfile.hvrExpansion || typeof currentProfile.hvrExpansion!=='object') currentProfile.hvrExpansion=fresh();
    const s=currentProfile.hvrExpansion, d=fresh();
    Object.keys(d).forEach(k=>{ if(s[k]===undefined) s[k]=d[k]; });
    if(!s.rarity) s.rarity={...DEFAULT_RARITY};
    if(!s.evolution) s.evolution={}; if(!s.skillTree)s.skillTree={}; if(!s.equipment)s.equipment={}; if(!s.skins)s.skins={}; if(!s.skinSelected)s.skinSelected={};
    if(!s.ultimateLv)s.ultimateLv={}; if(!s.aiMode)s.aiMode={}; if(!s.artifacts)s.artifacts={power:0,guard:0,fortune:0};
    if(!s.economy)s.economy={gems:0,crystals:0,goldenKeys:0,tickets:0,bankCoins:0,coinMultiplier:1};
    if(!Array.isArray(s.friends))s.friends=[]; if(!Array.isArray(s.titles))s.titles=[]; if(!s.online)s.online={lastSeen:0,status:'Offline'};
    if(!s.pvp)s.pvp={wins:0,losses:0,lastFight:''}; if(!s.guild)s.guild={name:'',code:'',members:[],xp:0,level:1,mission:0};
    if(!s.season)s.season={key:'',xp:0,level:1,claimed:[]}; if(!s.quests)s.quests={dailyDay:'',daily:{},weeklyKey:'',weekly:{},claimed:{}};
    if(!s.stats)s.stats={kills:0,elites:0,bosses:0,crits:0,damage:0,waves:0,speedWins:0};
    refreshResets(s,false);
    return s;
  }
  function save(){ if(window.currentProfile && window.saveProfile) window.saveProfile(currentProfile); }
  function toast(msg,kind){ if(window.HVR_FEATURES?.toast) window.HVR_FEATURES.toast(msg,kind); else alert(msg); }

  function dayKey(d=new Date()){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
  function weekKey(d=new Date()){ const jan1=new Date(d.getFullYear(),0,1); return `${d.getFullYear()}-W${Math.ceil((((d-jan1)/DAY)+jan1.getDay()+1)/7)}`; }
  function easterKey(year){
    const a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),month=Math.floor((h+l-7*m+114)/31),day=((h+l-7*m+114)%31)+1;
    return new Date(year,month-1,day);
  }
  function eventInfo(){
    const now=new Date(), day=now.getDay(), month=now.getMonth()+1, d=now.getDate();
    const easter=easterKey(now.getFullYear()), ediff=Math.round((now-easter)/DAY);
    const events=[];
    if(month===10) events.push({id:'halloween',icon:'🎃',name:'Halloween Event',desc:'+25% rewards + spooky visuals',coin:1.25,gems:2});
    if((month===12&&d>=20)||(month===1&&d<=5)) events.push({id:'christmas',icon:'🎄',name:'Christmas Event',desc:'+20% rewards',coin:1.20,gems:1.5});
    if(Math.abs(ediff)<=7) events.push({id:'easter',icon:'🐰',name:'Easter Event',desc:'+20% rewards + tickets',coin:1.20,gems:1.25});
    const biWeek=Math.floor(now.getTime()/(DAY*14));
    events.push(biWeek%2===0?{id:'invasion',icon:'💥',name:'Robot Invasion',desc:'Elite robots appear more often',coin:1.15,gems:1.1}:{id:'bossweek',icon:'👑',name:'Boss Week',desc:'Boss chests are doubled',coin:1.10,gems:1.1});
    if(day===0||day===6) events.push({id:'doubleWeekend',icon:'💎',name:'Double Reward Weekend',desc:'Weekend rewards ×2',coin:2,gems:2});
    const random=['☀️ Sunny','⚡ Energy Surge','🧊 Freeze Hour','💰 Treasure Rush','🤖 Robo Panic'][now.getDate()%5];
    events.push({id:'random',icon:'🎲',name:'Random Event',desc:random,coin:1.05,gems:1.05});
    if(now.getMinutes()<30) events.push({id:'limited',icon:'⏳',name:'Limited Window',desc:'Limited hero/field bonuses active',coin:1.10,gems:1.10});
    // Creator override: AUTO follows the normal calendar, ON forces an event on, OFF blocks it.
    const overrides=window.HVR_CREATOR?.eventOverrides||{};
    const existing=new Set(events.map(e=>e.id));
    Object.entries(overrides).forEach(([id,mode])=>{
      if(mode==='off'){ for(let i=events.length-1;i>=0;i--) if(events[i].id===id) events.splice(i,1); return; }
      if(mode==='on' && !existing.has(id) && window.HVR_CREATOR?.eventCatalog?.[id]) events.push({...window.HVR_CREATOR.eventCatalog[id]});
    });
    return events;
  }
  function refreshResets(s,saveIt=true){
    const dk=dayKey(), wk=weekKey();
    if(s.shop.date!==dk){
      s.shop.date=dk; s.shop.bought={};
      const pool=[{id:'gems',cost:15,reward:{gems:30},name:'Gem Pack'},{id:'crystals',cost:25,reward:{crystals:2},name:'Crystal Cache'},{id:'keys',cost:35,reward:{goldenKeys:2},name:'Golden Keys'},{id:'tickets',cost:20,reward:{tickets:5},name:'Event Tickets'},{id:'chest',cost:50,reward:{mega:1},name:'Mega Chest Token'}];
      const seed=dk.split('-').join('').slice(-4); let n=Number(seed)||1; const left=pool.slice(), arr=[]; for(let i=0;i<3;i++){ n=(n*9301+49297)%233280; arr.push(left.splice(n%left.length,1)[0]); } s.shop.items=arr;
    }
    if(s.quests.dailyDay!==dk){s.quests.dailyDay=dk;s.quests.daily={waves:0,kills:0,spend:0,crit:0};}
    if(s.quests.weeklyKey!==wk){s.quests.weeklyKey=wk;s.quests.weekly={waves:0,kills:0,boss:0};}
    if(s.season.key!==wk){s.season.key=wk;s.season.xp=0;s.season.level=1;s.season.claimed=[];}
    if(saveIt)save();
  }

  function addGems(n){const s=ensure();s.economy.gems=Math.max(0,Math.round((s.economy.gems||0)+Number(n)||0));save();render();}
  function addCrystals(n){const s=ensure();s.economy.crystals=Math.max(0,Math.round((s.economy.crystals||0)+Number(n)||0));save();render();}
  function addTickets(n){const s=ensure();s.economy.tickets=Math.max(0,Math.round((s.economy.tickets||0)+Number(n)||0));save();render();}
  function spendGem(n){const s=ensure();if((s.economy.gems||0)<n)return false;s.economy.gems-=n;save();return true;}
  function spendCrystal(n){const s=ensure();if((s.economy.crystals||0)<n)return false;s.economy.crystals-=n;save();return true;}
  function rewardChest(kind){
    const s=ensure();
    const choices=kind==='mega' ? [{coins:600,gems:20,crystals:2,keys:2,tickets:8},{coins:1200,gems:35,crystals:4,keys:3,tickets:12},{coins:2500,gems:60,crystals:8,keys:5,tickets:20}] : [{coins:150,gems:4,crystals:0,keys:1,tickets:1},{coins:250,gems:7,crystals:1,keys:1,tickets:2},{coins:400,gems:10,crystals:1,keys:2,tickets:3}];
    const r=choices[Math.floor(Math.random()*choices.length)];
    if(r.coins)window.addCoins?.(r.coins,false); if(r.gems)addGems(r.gems); if(r.crystals)addCrystals(r.crystals); if(r.keys){currentProfile.drawKeys=(Number(currentProfile.drawKeys)||0)+r.keys;} if(r.tickets)addTickets(r.tickets);
    save(); toast(`🎁 ${kind==='mega'?'MEGA ':''}CHEST → +${r.coins} 🏆 +${r.gems} 💎 +${r.crystals} 🔮 +${r.keys} 🔑`,'good');
  }
  function claimDailyChest(){const s=ensure(),dk=dayKey();if(s.chest.dailyClaimed===dk){toast('Այսօրվա Daily Chest-ը արդեն բացվել է։','bad');return;}s.chest.dailyClaimed=dk;rewardChest('daily');}
  function openMegaChest(){const s=ensure();if(s.chest.mega<=0){toast('Mega Chest չկա։','bad');return;}s.chest.mega--;rewardChest('mega');save();render();}
  function claimGoldenKey(){const s=ensure();if((s.economy.goldenKeys||0)<=0){toast('Golden Key չկա։','bad');return;}s.economy.goldenKeys--;addGems(12);addCrystals(1);addTickets(2);toast('🔑 Golden Key → +12 💎 +1 🔮 +2 🎟️','good');save();render();}

  function shopBuy(i){const s=ensure(),item=s.shop.items[i];if(!item||s.shop.bought[item.id])return;if(!spendGem(item.cost)){toast(`Պետք է ${item.cost} 💎։`,'bad');return;}s.shop.bought[item.id]=true;const r=item.reward;if(r.gems)addGems(r.gems);if(r.crystals)addCrystals(r.crystals);if(r.goldenKeys){s.economy.goldenKeys+=r.goldenKeys;}if(r.tickets)addTickets(r.tickets);if(r.mega)s.chest.mega+=r.mega;save();toast(`🛒 ${item.name} գնված է։`,'good');render();}
  function trade(type){const s=ensure();if(type==='gems'){if((currentProfile.coins||0)<100){toast('100 🏆 պետք է։','bad');return;}currentProfile.coins-=100;s.economy.gems+=5;}else if(type==='crystals'){if(s.economy.gems<50){toast('50 💎 պետք է։','bad');return;}s.economy.gems-=50;s.economy.crystals+=1;}else if(type==='keys'){if(s.economy.gems<80){toast('80 💎 պետք է։','bad');return;}s.economy.gems-=80;s.economy.goldenKeys+=1;}else if(type==='tickets'){if(s.economy.gems<20){toast('20 💎 պետք է։','bad');return;}s.economy.gems-=20;s.economy.tickets+=5;}save();toast('🔄 Exchange-ը կատարվեց։','good');render();}
  function bank(action){const s=ensure();if(action==='deposit'){const n=Math.max(0,Math.min(Number(currentProfile.coins)||0,Math.floor(Number(document.getElementById('bankAmount')?.value)||0)));currentProfile.coins-=n;s.economy.bankCoins+=n;}else{const n=Math.max(0,Math.min(s.economy.bankCoins,Math.floor(Number(document.getElementById('bankAmount')?.value)||0)));s.economy.bankCoins-=n;currentProfile.coins+=n;}save();updateCoinDisplays?.();render();}

  function heroState(k){const s=ensure();if(!s.skillTree[k])s.skillTree[k]={attack:0,speed:0,defense:0};if(!s.equipment[k])s.equipment[k]={weapon:0,armor:0,artifact:0};if(!s.ultimateLv[k])s.ultimateLv[k]=1;if(!s.skins[k])s.skins[k]=['Classic'];if(!s.skinSelected[k])s.skinSelected[k]='Classic';return {skill:s.skillTree[k],equip:s.equipment[k]};}
  function upgradeSkill(k,branch){const s=ensure(),hs=heroState(k),lv=Number(hs.skill[branch]||0);if(lv>=5){toast('Skill branch-ը Max Lv5 է։','bad');return;}const cost=8+lv*8;if(!spendGem(cost)){toast(`Պետք է ${cost} 💎։`,'bad');return;}hs.skill[branch]=lv+1;save();toast(`🧬 ${branch} → Lv${lv+1}`,'good');render();}
  function upgradeEquip(k,slot){const s=ensure(),hs=heroState(k),lv=Number(hs.equip[slot]||0);if(lv>=5){toast('Equipment-ը Max Lv5 է։','bad');return;}const cost=1+lv;if(!spendCrystal(cost)){toast(`Պետք է ${cost} 🔮։`,'bad');return;}hs.equip[slot]=lv+1;save();toast(`${EQUIP_STATS[slot].icon} ${EQUIP_STATS[slot].name} → Lv${lv+1}`,'good');render();}
  function evolve(k){const s=ensure();if(!currentProfile?.ownedHeroes?.includes(k))return;if((currentProfile.heroLevels?.[k]||1)<999){toast('Evolution-ի համար Hero Lv999 է պետք։','bad');return;}const lv=Number(s.evolution[k]||0);if(lv>=5){toast('Evolution Max V է։','bad');return;}const cost=2+lv;if(!spendCrystal(cost)){toast(`Պետք է ${cost} 🔮։`,'bad');return;}s.evolution[k]=lv+1;save();toast(`🔮 ${TOWER_TYPES[k]?.name||k} Evolution ${lv+1} բացվեց։`,'good');render();}
  function ultUpgrade(k){const s=ensure(),lv=Number(s.ultimateLv[k]||1);if(lv>=10){toast('Ultimate-ը Max Lv10 է։','bad');return;}const cost=10+lv*5;if(!spendGem(cost)){toast(`Պետք է ${cost} 💎։`,'bad');return;}s.ultimateLv[k]=lv+1;save();toast(`🌟 Ultimate Lv${lv+1}`,'good');render();}
  function equipSkin(k,skin){const s=ensure();if(!s.skins[k])s.skins[k]=['Classic'];if(!s.skins[k].includes(skin)){const cost=20+SKINS.indexOf(skin)*10;if(!spendGem(cost)){toast(`Պետք է ${cost} 💎։`,'bad');return;}s.skins[k].push(skin);}s.skinSelected[k]=skin;save();toast(`🎨 Skin → ${skin}`,'good');render();}
  function unlockSkin(k,skin){return equipSkin(k,skin);}
  function toggleAI(k){const s=ensure();s.aiMode[k]=!s.aiMode[k];save();toast(`🤖 ${TOWER_TYPES[k]?.name||k} AI ${s.aiMode[k]?'ON':'OFF'}`,'good');render();}

  function upgradeArtifact(kind){
    const s=ensure(); const cost=2+Number(s.artifacts?.[kind]||0);
    if(!spendCrystal(cost)){toast(`Պետք է ${cost} 🔮։`,'bad');return;}
    s.artifacts[kind]=(Number(s.artifacts[kind])||0)+1; save(); toast(`💍 ${kind} Artifact → Lv${s.artifacts[kind]}`,'good'); render();
  }
  function refreshTitles(s){
    const out=new Set(s.titles||[]), f=window.HVR_FEATURES?.featureForProfile?.()||{};
    if((f.bestWave||0)>=25)out.add('Robot Hunter');
    if((s.stats.bosses||0)>=10)out.add('Boss Slayer');
    if((s.stats.crits||0)>=50)out.add('Critical Master');
    if((f.prestige||0)>=1)out.add('Prestige Hero');
    if((s.rebirth||0)>=1)out.add('Reborn');
    if((currentProfile.ownedHeroes?.length||0)>=12)out.add('Hero Collector');
    if((s.guild?.level||1)>=5)out.add('Guild Captain');
    if((s.season?.level||1)>=10)out.add('Season Veteran');
    s.titles=[...out];
  }

  function heroCombatMult(k){const s=ensure(),hs=heroState(k),rar=RARITY[s.rarity[k]||DEFAULT_RARITY[k]||'common']?.mult||1,ev=1+(Number(s.evolution[k]||0)*0.18);const st=hs.skill,e=hs.equip,ult=1+(Number(s.ultimateLv[k]||1)-1)*0.04;const skillD=1+(st.attack||0)*0.08,skillS=1+(st.speed||0)*0.05,skillH=1+(st.defense||0)*0.08;const eqD=1+(e.weapon||0)*.08,eqS=1+(e.artifact||0)*.08,eqH=1+(e.armor||0)*.10;const artD=1+(Number(s.artifacts?.power)||0)*.04,artH=1+(Number(s.artifacts?.guard)||0)*.05,artS=1+(Number(s.artifacts?.fortune)||0)*.03;return {dmg:ev*skillD*eqD*ult*artD,speed:skillS*eqS*artS,hp:ev*skillH*eqH*artH,rate:1/(skillS*eqS*ult*artS),crit:.03+(st.attack||0)*.015+(e.weapon||0)*.01+(Number(s.artifacts?.fortune)||0)*.01,ai:!!s.aiMode[k]};}
  function synergyMult(kind){
    const rt=window.HVR_RUNTIME?.getTowers?.()||[];const keys=new Set(rt.map(t=>t.type));let m=1;
    const on=(a,b)=>keys.has(a)&&keys.has(b);
    if(kind==='dmg'){
      if(on('mraveli','skochitagavor'))m*=1.12;      // Dust & Tape +12% damage
      if(on('atoriponch','kungfu'))m*=1.18;           // Close Combat +18% damage
      if(on('taguhi','smile_immortal'))m*=1.25;       // Royal Smile +25% all stats
    }else if(kind==='hp'){
      if(on('hikler','matem'))m*=1.15;                // Healing Math +15% HP
      if(on('taguhi','smile_immortal'))m*=1.25;
    }else if(kind==='rate'){
      if(on('kettle','ferri'))m*=.85;                 // Heat Duo +15% attack speed
      if(on('taguhi','smile_immortal'))m*=.8;
    }else if(kind==='coin'){
      if(on('nikolaganner','taguhi'))m*=1.2;          // Heart Queen +20% coins
    }
    return m;
  }

  // 120 deterministic achievements.
  const ACH=[];
  for(let i=1;i<=50;i++)ACH.push({id:`wave_${i}`,title:`🌊 Wave ${i}`,ok:s=>(Number(window.HVR_FEATURES?.featureForProfile?.()?.bestWave)||0)>=i,reward:10+i*4});
  for(let i=1;i<=20;i++){const n=i*250;ACH.push({id:`coins_${i}`,title:`💰 ${n} Coins Earned`,ok:s=>(Number(s.stats.coinsEarned)||0)>=n,reward:25+i*5});}
  for(let i=1;i<=17;i++)ACH.push({id:`heroes_${i}`,title:`🦸 ${i} Heroes`,ok:s=>(currentProfile?.ownedHeroes?.length||0)>=i,reward:50+i*10});
  for(let i=1;i<=10;i++){const n=i*100;ACH.push({id:`kills_${i}`,title:`💥 ${n} Robots`,ok:s=>(Number(s.stats.kills)||0)>=n,reward:40+i*10});}
  for(let i=1;i<=10;i++){const n=i*5;ACH.push({id:`boss_${i}`,title:`👹 ${n} Bosses`,ok:s=>(Number(s.stats.bosses)||0)>=n,reward:100+i*30});}
  for(let i=1;i<=8;i++){const n=i*10;ACH.push({id:`crit_${i}`,title:`🎯 ${n} Critical Hits`,ok:s=>(Number(s.stats.crits)||0)>=n,reward:50+i*20});}
  for(let i=1;i<=5;i++)ACH.push({id:`prestige_${i}`,title:`♾️ Prestige ${i}`,ok:s=>(Number(s.rebirth)||0)>=i,reward:250+i*100});
  function checkAchievements(){const s=ensure(),done=s._ach||[];for(const a of ACH){if(!done.includes(a.id)&&a.ok(s)){done.push(a.id);window.addCoins?.(a.reward,false);if(window.HVR_FEATURES?.logReward)window.HVR_FEATURES.logReward(`${a.title} • +${a.reward} 🏆`);}}s._ach=done;save();}

  function seasonAdd(xp){const s=ensure();s.season.xp+=Math.max(0,Math.round(xp));while(s.season.xp>=s.season.level*100){s.season.xp-=s.season.level*100;s.season.level++;} }
  function seasonClaim(){const s=ensure(),lv=s.season.level;if(s.season.claimed.includes(lv)){toast('Այս Season reward-ը արդեն վերցված է։','bad');return;}s.season.claimed.push(lv);if(lv%5===0){s.economy.crystals+=2;}else{s.economy.gems+=10;}save();toast(`📅 Season Pass Lv${lv} reward ստացար։`,'good');render();}

  function questClaim(kind){const s=ensure();let reward=0,ok=false;if(kind==='daily')ok=(s.quests.daily.waves||0)>=5&&(!s.quests.claimed.daily||s.quests.claimed.daily!==s.quests.dailyDay),reward=120;if(kind==='weekly')ok=(s.quests.weekly.waves||0)>=30&&(!s.quests.claimed.weekly||s.quests.claimed.weekly!==s.quests.weeklyKey),reward=500;if(!ok){toast('Quest-ը դեռ պատրաստ չէ։','bad');return;}if(kind==='daily')s.quests.claimed.daily=s.quests.dailyDay;else s.quests.claimed.weekly=s.quests.weeklyKey;window.addCoins?.(reward,false);s.economy.gems+=kind==='weekly'?20:5;save();toast(`🎯 Quest → +${reward} 🏆 +${kind==='weekly'?20:5} 💎`,'good');render();}

  function addStats(kind,n=1){const s=ensure();s.stats[kind]=(s.stats[kind]||0)+n;if(kind==='waves'){s.quests.daily.waves=(s.quests.daily.waves||0)+n;s.quests.weekly.waves=(s.quests.weekly.waves||0)+n;seasonAdd(15*n);}if(kind==='kills'){s.quests.daily.kills=(s.quests.daily.kills||0)+n;s.quests.weekly.kills=(s.quests.weekly.kills||0)+n;seasonAdd(2*n);}if(kind==='boss'){s.quests.weekly.boss=(s.quests.weekly.boss||0)+n;seasonAdd(80*n);}if(kind==='crits'){s.quests.daily.crit=(s.quests.daily.crit||0)+n;seasonAdd(4*n);}if(kind==='waves'||kind==='boss'||kind==='crits' || (Number(s.stats[kind])%25===0)){checkAchievements();save();}}
  function recordWave(){addStats('waves',1);const s=ensure();if(s.mode==='speedrun'&&s.lastWaveStart){const ms=Date.now()-s.lastWaveStart;s.lastWaveDurationMs=ms;if(!s.speedrunBestMs||ms<s.speedrunBestMs){s.speedrunBestMs=ms;s.stats.speedWins++;window.addCoins?.(50,false);toast(`⏱️ New speedrun best: ${(ms/1000).toFixed(1)}s`,'good');}}save();}
  function recordKill(type){const s=ensure();s.stats.kills=(s.stats.kills||0)+1;s.quests.daily.kills=(s.quests.daily.kills||0)+1;s.quests.weekly.kills=(s.quests.weekly.kills||0)+1;seasonAdd(2);if(type==='boss'){s.stats.bosses=(s.stats.bosses||0)+1;s.quests.weekly.boss=(s.quests.weekly.boss||0)+1;seasonAdd(80);}if(String(type).startsWith('elite_'))s.stats.elites=(s.stats.elites||0)+1;if(s.stats.kills%25===0||type==='boss'){checkAchievements();save();}}
  function recordCrit(){const s=ensure();s.stats.crits=(s.stats.crits||0)+1;s.quests.daily.crit=(s.quests.daily.crit||0)+1;seasonAdd(4);if(s.stats.crits%25===0){checkAchievements();save();}}
  function startWave(wave){
    const s=ensure();
    if(Number(wave)===1){
      s.hardcoreDead={};
      s.lastWaveDurationMs=0;
    } else {
      s.hardcoreDead=s.hardcoreDead||{};
    }
    s.lastWaveStart=Date.now();
    save();
  }
  function resetRun(){const s=ensure();if(!s)return;s.hardcoreDead={};s.lastWaveStart=0;}
  function canPlaceHero(existingCount,key){const s=ensure();if(s.mode==='challenge'&&existingCount>=2){toast('🏆 Challenge Mode-ում առավելագույնը 2 hero կարելի է տեղադրել։','bad');return false;}if(s.mode==='hardcore'&&s.hardcoreDead?.[key]){toast('💀 Hardcore․ այս hero-ն արդեն մահացել է այս խաղում։','bad');return false;}return true;}
  function recordHeroDeath(key){const s=ensure();if(s.mode==='hardcore'){s.hardcoreDead[key]=true;toast(`💀 Hardcore: ${TOWER_TYPES[key]?.name||key} դուրս մնաց այս խաղից։`,'bad');save();}}

  function rebirth(){const s=ensure();if((window.HVR_FEATURES?.featureForProfile?.()?.level||1)<30){toast('Rebirth-ի համար Profile Lv30 է պետք։','bad');return;}if(!confirm('Rebirth-ը reset է անում coin/progression-ի մեծ մասը, բայց տալիս է +25 💎 և permanent multiplier։ Շարունակե՞լ։'))return;currentProfile.coins=0;currentProfile.heroLevels=Object.fromEntries(Object.keys(currentProfile.heroLevels||{}).map(k=>[k,1]));s.rebirth++;s.economy.gems+=25;s.economy.coinMultiplier=1+s.rebirth*.10;save();updateCoinDisplays?.();toast(`👑 Rebirth ${s.rebirth} complete։`,'good');render();}
  function toggleFlag(){const s=ensure(),i=FLAGS.indexOf(s.flag||'🌐');s.flag=FLAGS[(i+1)%FLAGS.length];save();render();}
  function addFriend(){const input=document.getElementById('friendInput'),u=String(input?.value||'').trim();if(!u||u===currentProfile.username){toast('Գրիր այլ username։','bad');return;}const s=ensure();if(!s.friends.includes(u))s.friends.push(u);if(input)input.value='';save();toast(`👥 ${u} ավելացվել է Friends-ում։`,'good');render();}
  function removeFriend(u){const s=ensure();s.friends=s.friends.filter(x=>x!==u);save();render();}
  async function onlinePlayers(){try{const r=await window.fetchSharedLeaderboard?.();return r?.rows||[];}catch(e){return[];}}
  async function pvpFight(){const rows=await onlinePlayers();const choices=rows.filter(x=>x.username!==currentProfile?.username);if(!choices.length){toast('PvP-ի համար առնվազն մեկ այլ online profile է պետք։','bad');return;}const opp=choices[Math.floor(Math.random()*choices.length)];const my=(currentProfile.coins||0)+(currentProfile.ownedHeroes?.length||0)*100;const his=(opp.coins||0);const chance=clamp(0.5+(my-his)/Math.max(5000,Math.abs(my)+Math.abs(his)+1)*0.25,.1,.9);const win=Math.random()<chance;const s=ensure();s.pvp.lastFight=opp.username;if(win){s.pvp.wins++;window.addCoins?.(150,false);s.economy.gems+=5;toast(`⚔️ PvP հաղթանակ՝ ${opp.username} դեմ • +150 🏆 +5 💎`,'good');}else{s.pvp.losses++;toast(`⚔️ PvP պարտություն՝ ${opp.username}-ից։`,'bad');}save();render();}
  function guildCreate(){const s=ensure(),name=String(document.getElementById('guildName')?.value||'').trim();if(!name){toast('Գրիր guild-ի անունը։','bad');return;}s.guild.name=name;s.guild.code=(name.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,8)||'HVR')+Math.floor(Math.random()*90+10);s.guild.members=[currentProfile.username];s.guild.level=1;s.guild.xp=0;save();toast(`🏰 Guild ստեղծվեց՝ ${name} [${s.guild.code}]`,'good');render();}
  function guildMission(){const s=ensure();const need=10+s.guild.level*5;if((s.guild.mission||0)<need){toast(`🤝 Guild Mission՝ ${need} wave է պետք։`,'bad');return;}s.guild.mission=0;s.guild.xp+=need*10;if(s.guild.xp>=s.guild.level*100){s.guild.xp-=s.guild.level*100;s.guild.level++;}s.economy.gems+=10;save();toast(`🤝 Guild Mission reward → +10 💎`,'good');render();}
  function portalNext(){const s=ensure();const selected=(window.HVR_GET_SELECTED_MAP?.()||'village');const idx=MAP_SEQUENCE.indexOf(selected);if(idx<0 || idx>=MAP_SEQUENCE.length-1){toast('🚪 Սա վերջին World-ն է՝ Boss Arena։','bad');return;}const next=MAP_SEQUENCE[idx+1];if(currentProfile?.ownedMaps?.includes(next)){window.HVR_SET_SELECTED_MAP?.(next);window.saveProfile?.(currentProfile);renderMapGrid?.();toast(`🚪 Portal → ${MAPS[next].icon} ${MAPS[next].label}`,'good');return;}const price=Number(MAP_PRICE[next]||0);if(window.spendCoins?.(price)){currentProfile.ownedMaps.push(next);window.HVR_SET_SELECTED_MAP?.(next);window.saveProfile?.(currentProfile);renderMapGrid?.();toast(`🚪 Portal-ը բացեց ${MAPS[next].label}`,'good');}else toast(`Portal-ի համար պետք է ${price} 🏆։`,'bad');}

  window.HVR_EXPANSION={resetRun,ensure,mode:()=>ensure()?.mode||'normal',isEndless:()=>ensure()?.mode==='endless',canPlaceHero,recordHeroDeath,recordWave,recordKill,recordCrit,startWave,heroCombatMult,synergyMult,eventInfo,addStats,addGems,addCrystals,addTickets,render,portalNext};

  // Apply combat multipliers on top of the previous feature pack.
  if(window.heroEffectiveDamage){const old=window.heroEffectiveDamage;window.heroEffectiveDamage=function(base,lv,k){const m=heroCombatMult(k);return old(base,lv,k)*m.dmg*synergyMult('dmg');};}
  if(window.heroEffectiveMaxHp){const old=window.heroEffectiveMaxHp;window.heroEffectiveMaxHp=function(lv,k){return old(lv,k)*heroCombatMult(k).hp*synergyMult('hp');};}
  if(window.heroEffectiveRateMult){const old=window.heroEffectiveRateMult;window.heroEffectiveRateMult=function(lv,k){return old(lv,k)*heroCombatMult(k).rate*synergyMult('rate');};}
  if(window.addCoins){const old=window.addCoins;window.addCoins=function(n,apply){const s=ensure();let m=Number(s?.economy?.coinMultiplier)||1;if(apply!==false){for(const e of eventInfo())m*=Number(e.coin)||1;if(MODE_META[s?.mode||'normal'])m*=MODE_META[s?.mode||'normal'].coin;m*=synergyMult('coin');}const amount=Number(n||0)*m;if(s&&amount>0)s.stats.coinsEarned=(Number(s.stats.coinsEarned)||0)+Math.round(amount);return old(amount,apply);};}

  function modeCard(k,s){const meta=MODE_META[k];return `<button type="button" class="expMode ${s.mode===k?'sel':''}" data-action="mode" data-mode="${k}"><span>${meta.icon}</span><b>${meta.name}</b><small>${meta.desc}</small><em>🏆 x${meta.coin}</em></button>`;}
  function heroCard(k,s){const t=TOWER_TYPES[k],hs=heroState(k),m=heroCombatMult(k),rar=RARITY[s.rarity[k]||'common'];const ev=s.evolution[k]||0;const lv=currentProfile.heroLevels?.[k]||1;const eq=hs.equip,sk=hs.skill;return `<div class="expHeroCard"><div class="expHeroHead"><b>${esc(t?.name||k)}</b><span>${rar.icon} ${rar.label} • Ev.${ev}</span></div><div class="expHeroStats">Lv${lv} • ⚔️×${m.dmg.toFixed(2)} • ❤️×${m.hp.toFixed(2)} • ⚡×${(1/m.rate).toFixed(2)}</div><div class="expBtnRow"><button class="action expBtn" data-action="evolve" data-hero="${k}" ${(lv>=999&&ev<5)?'':'disabled'}>🔮 Evolution</button><button class="action expBtn" data-action="ult" data-hero="${k}">🌟 Ult Lv${s.ultimateLv[k]||1}</button><button class="action expBtn" data-action="ai" data-hero="${k}">🤖 AI ${s.aiMode[k]?'ON':'OFF'}</button></div><div class="expSkillGrid"><button data-action="skill" data-hero="${k}" data-branch="attack">⚔️ A${sk.attack||0}</button><button data-action="skill" data-hero="${k}" data-branch="speed">⚡ S${sk.speed||0}</button><button data-action="skill" data-hero="${k}" data-branch="defense">🛡️ D${sk.defense||0}</button></div><div class="expEquipGrid"><button data-action="equip" data-hero="${k}" data-slot="weapon">⚔️ ${eq.weapon||0}</button><button data-action="equip" data-hero="${k}" data-slot="armor">🛡️ ${eq.armor||0}</button><button data-action="equip" data-hero="${k}" data-slot="artifact">💍 ${eq.artifact||0}</button></div><div class="expSkinRow">${SKINS.slice(0,4).map(sk=>`<button data-action="skin" data-hero="${k}" data-skin="${sk}" class="${s.skinSelected[k]===sk?'on':''}">${sk}</button>`).join('')}</div></div>`;}

  function overviewHTML(s){const ev=eventInfo();const f=window.HVR_FEATURES?.featureForProfile?.()||{};const done=(s._ach||[]).length;const total=ACH.length;const dailyReady=(s.quests.daily.waves||0)>=5&&!((s.quests.claimed||{}).daily===s.quests.dailyDay);const weeklyReady=(s.quests.weekly.waves||0)>=30&&!((s.quests.claimed||{}).weekly===s.quests.weeklyKey);return `<div class="expHeroBanner"><div><div class="expEyebrow">HEROES VS ROBOTS • MEGA EXPANSION</div><h2>🎮 Game Center</h2><p>Բոլոր նոր համակարգերը մեկ տեղում՝ battle, heroes, fields, economy, online և events։</p></div><div class="expBannerStats"><b>${s.flag} ${esc(currentProfile.username)}</b><span>Profile Lv${f.level||1} • Prestige ${f.prestige||0} • Rebirth ${s.rebirth||0}</span><small>🏅 ${(s.titles||[]).slice(0,4).join(' • ')||'Rookie'}</small></div></div><div class="expStatGrid"><div><b>🏆</b><strong>${currentProfile.admin?'∞':Number(currentProfile.coins||0).toLocaleString()}</strong><small>Gavat</small></div><div><b>💎</b><strong>${s.economy.gems||0}</strong><small>Gems</small></div><div><b>🔮</b><strong>${s.economy.crystals||0}</strong><small>Crystals</small></div><div><b>🔑</b><strong>${currentProfile.admin?'∞':Number(currentProfile.drawKeys||0)}</strong><small>Keys</small></div><div><b>🎟️</b><strong>${s.economy.tickets||0}</strong><small>Tickets</small></div><div><b>🏅</b><strong>${done}/${total}</strong><small>Achievements</small></div></div><div class="expSection"><div class="expSectionTitle">⚔️ Current Battle</div><div class="expCurrentMode">${MODE_META[s.mode].icon} <b>${MODE_META[s.mode].name}</b> — ${MODE_META[s.mode].desc}</div></div><div class="expSection"><div class="expSectionTitle">🎉 Active Events</div>${ev.map(e=>`<div class="expEventLine"><b>${e.icon} ${e.name}</b><span>${e.desc}</span></div>`).join('')}</div><div class="expTwo"><div class="expSection"><div class="expSectionTitle">📅 Season Pass</div><div class="expProgress"><i style="width:${clamp((s.season.xp/(s.season.level*100))*100,0,100)}%"></i></div><div>Level ${s.season.level} • ${s.season.xp}/${s.season.level*100} XP <button class="action" data-action="season">🎁 Claim</button></div></div><div class="expSection"><div class="expSectionTitle">🎯 Quests</div><div>Daily waves: ${Math.min(5,s.quests.daily.waves||0)}/5 <button class="action" data-action="quest" data-kind="daily">Claim</button></div><div>Weekly waves: ${Math.min(30,s.quests.weekly.waves||0)}/30 <button class="action" data-action="quest" data-kind="weekly">Claim</button></div></div></div>`;}

  function battleHTML(s){return `<div class="expSection"><div class="expSectionTitle">🎮 Խաղային ընթացք</div><div class="expModeGrid">${Object.keys(MODE_META).map(k=>modeCard(k,s)).join('')}</div></div><div class="expTwo"><div class="expSection"><div class="expSectionTitle">🧟 Elite Robots</div><div class="expList"><span>🛡️ Shield Elite — shield recovery</span><span>💚 Healer Elite — team heal</span><span>🛡️ Tank Elite — heavy armor</span><span>⚡ Assassin Elite — targets heroes</span></div></div><div class="expSection"><div class="expSectionTitle">👹 Boss Skills</div><div class="expList"><span>❤️ Heal</span><span>🤖 Summon</span><span>🔥 Rage</span><span>🛡️ Temporary shield</span></div></div></div><div class="expTwo"><div class="expSection"><div class="expSectionTitle">⏱️ Speedrun</div><div>Best Wave Time: <b>${s.speedrunBestMs?(s.speedrunBestMs/1000).toFixed(2)+'s':'—'}</b></div></div><div class="expSection"><div class="expSectionTitle">💀 Hardcore</div><div>Dead heroes this session: <b>${Object.keys(s.hardcoreDead||{}).length}</b></div></div></div>`;}
  function heroesHTML(s){const owned=(currentProfile.ownedHeroes||[]).filter(k=>TOWER_TYPES[k]);return `<div class="expSection"><div class="expSectionTitle">💍 Global Artifacts</div><div class="expBtnRow"><button class="action" data-action="artifact" data-artifact="power">⚔️ Power Lv${s.artifacts.power||0}</button><button class="action" data-action="artifact" data-artifact="guard">🛡️ Guard Lv${s.artifacts.guard||0}</button><button class="action" data-action="artifact" data-artifact="fortune">🍀 Fortune Lv${s.artifacts.fortune||0}</button></div></div><div class="expSection"><div class="expSectionTitle">🦸 Heroes • Evolution / Skill Tree / Equipment / Artifacts / Skins</div>${owned.map(k=>heroCard(k,s)).join('')||'<div class="expEmpty">Դեռ բացված hero չկա։</div>'}</div><div class="expSection"><div class="expSectionTitle">👥 Hero Synergy</div><div class="expList">${SYNERGIES.map(x=>`<span>${x[2]} • ${x[3]} — ${((currentProfile.ownedHeroes||[]).includes(x[0])&&(currentProfile.ownedHeroes||[]).includes(x[1]))?'✅ Active':'🔒 Locked'}</span>`).join('')}</div></div>`;}
  function fieldsHTML(s){
    const maps=MAP_SEQUENCE.map(k=>({k,m:MAPS[k]})).filter(x=>x.m);
    const selected=window.HVR_GET_SELECTED_MAP?.()||'village';
    return `<div class="expMapGrid">${maps.map(({k,m})=>{
      const owned=currentProfile.ownedMaps?.includes(k);
      const isSel=selected===k;
      return `<button class="expMapCard ${owned?'owned':'locked'} ${isSel?'selected':''}" data-action="selectMap" data-map="${esc(k)}"><span>${m.icon}</span><b>${esc(m.label)}</b><small>${owned?(isSel?'✅ Ընտրված':'Բացված'):'Գնել՝ '+(MAP_PRICE[k]||0)+' 🏆'}</small></button>`;
    }).join('')}</div>
    <div class="expTwo">
      <div class="expSection"><div class="expSectionTitle">🧩 Field Modifiers</div><div class="expList">
        <span>🔥 x2 enemy speed</span><span>💰 x2 rewards</span><span>🌙 Low Gravity</span><span>⚡ Energy Surge</span><span>🧊 Freeze Zone</span>
      </div></div>
      <div class="expSection"><div class="expSectionTitle">🚪 Portal System</div><p>Portal-ը տեղափոխում է հաջորդ world-ը։ Չբացված world-ը կարելի է գնել հենց Portal-ից։</p><button class="action" data-action="portal">🚪 Open Portal</button></div>
    </div>`;
  }
  function economyHTML(s){return `<div class="expStatGrid"><div><b>💎</b><strong>${s.economy.gems}</strong><small>Gems</small></div><div><b>🔮</b><strong>${s.economy.crystals}</strong><small>Rare Crystals</small></div><div><b>🔑</b><strong>${s.economy.goldenKeys}</strong><small>Golden Keys</small></div><div><b>🎟️</b><strong>${s.economy.tickets}</strong><small>Event Tickets</small></div><div><b>🏦</b><strong>${s.economy.bankCoins}</strong><small>Bank</small></div><div><b>✖️</b><strong>×${s.economy.coinMultiplier.toFixed(2)}</strong><small>Coin multiplier</small></div></div><div class="expTwo"><div class="expSection"><div class="expSectionTitle">🎁 Chests</div><button class="action" data-action="dailyChest">🎁 Daily Chest</button><button class="action" data-action="megaChest">📦 Mega Chest (${s.chest.mega||0})</button><button class="action" data-action="goldenKey">🔑 Open Golden Key</button></div><div class="expSection"><div class="expSectionTitle">🛒 Daily Shop</div>${(s.shop.items||[]).map((it,i)=>`<div class="expShop"><b>${it.name}</b><span>${it.cost} 💎</span><button class="action" data-action="shop" data-index="${i}" ${s.shop.bought[it.id]?'disabled':''}>${s.shop.bought[it.id]?'✅ Bought':'Buy'}</button></div>`).join('')}</div></div><div class="expTwo"><div class="expSection"><div class="expSectionTitle">🔄 Trade / Exchange</div><button class="action" data-action="trade" data-trade="gems">100 🏆 → 5 💎</button><button class="action" data-action="trade" data-trade="crystals">50 💎 → 1 🔮</button><button class="action" data-action="trade" data-trade="keys">80 💎 → 1 🔑</button><button class="action" data-action="trade" data-trade="tickets">20 💎 → 5 🎟️</button></div><div class="expSection"><div class="expSectionTitle">🏦 Bank</div><div class="expBank"><input id="bankAmount" type="number" min="0" placeholder="Amount"><button class="action" data-action="bank" data-bank="deposit">Deposit</button><button class="action" data-action="bank" data-bank="withdraw">Withdraw</button></div></div></div>`;}
  async function onlineHTML(s){const rows=await onlinePlayers();return `<div class="expTwo"><div class="expSection"><div class="expSectionTitle">👤 Player Profile</div><div class="profileBig">${s.flag} <b>${esc(currentProfile.username)}</b></div><button class="action" data-action="flag">🏳️ Change Flag</button><div>🟢 Status: <b>${navigator.onLine?'Online':'Offline'}</b></div><div>🏆 ${currentProfile.admin?'∞':Number(currentProfile.coins||0).toLocaleString()} • PvP ${s.pvp.wins||0}W/${s.pvp.losses||0}L</div></div><div class="expSection"><div class="expSectionTitle">🌍 Global Statistics</div><div>Players seen: <b>${rows.length}</b></div><div>Season leaderboard-ը օգտագործում է ընդհանուր Firebase leaderboard-ը։</div></div></div><div class="expSection"><div class="expSectionTitle">🏆 Season Leaderboard</div>${rows.slice(0,10).map((r,i)=>`<div class="expFriend"><span>#${i+1} ${esc(r.username)}</span><b>🏆 ${Number(r.coins||0).toLocaleString()}</b></div>`).join('')||'<div class="expEmpty">Leaderboard-ը դատարկ է։</div>'}</div><div class="expSection"><div class="expSectionTitle">👥 Friends</div><div class="friendAdd"><input id="friendInput" placeholder="Username"><button class="action" data-action="friendAdd">Add</button></div>${(s.friends||[]).map(u=>`<div class="expFriend"><span>👤 ${esc(u)}</span><button class="action" data-action="friendRemove" data-user="${esc(u)}">×</button></div>`).join('')||'<div class="expEmpty">Friends list-ը դատարկ է։</div>'}</div><div class="expTwo"><div class="expSection"><div class="expSectionTitle">⚔️ PvP Arena</div><p>Asynchronous PvP՝ ընտրում է online leaderboard-ի մեկ այլ player և հաշվարկում battle outcome-ը։</p><button class="action" data-action="pvp">⚔️ Fight</button></div><div class="expSection"><div class="expSectionTitle">🏰 Clan / Guild</div><div class="friendAdd"><input id="guildName" placeholder="Guild name"><button class="action" data-action="guildCreate">Create</button></div><div>Guild: <b>${esc(s.guild.name||'—')}</b> ${s.guild.code?`[${esc(s.guild.code)}]`:''}</div><div>Lv${s.guild.level} • XP ${s.guild.xp} • Mission ${s.guild.mission}</div><button class="action" data-action="guildMission">🤝 Guild Mission</button></div></div>`;}
  function progressHTML(s){const f=window.HVR_FEATURES?.featureForProfile?.()||{};return `<div class="expTwo"><div class="expSection"><div class="expSectionTitle">🏅 100+ Achievements</div><div class="expAchGrid">${ACH.slice(0,120).map(a=>`<div class="expAch ${(s._ach||[]).includes(a.id)?'done':''}"><b>${esc(a.title)}</b><small>+${a.reward} 🏆</small></div>`).join('')}</div></div><div class="expSection"><div class="expSectionTitle">🏆 Long-term Progression</div><div class="expList"><span>🌟 Prestige: ${f.prestige||0}</span><span>👑 Rebirth: ${s.rebirth}</span><span>🔥 Daily Streak: ${f.currentStreak||0}</span><span>📊 Lifetime Waves: ${f.totalWaves||0}</span><span>💥 Lifetime Kills: ${s.stats.kills}</span><span>🏅 Titles: ${s.titles.length}</span></div><button class="action" data-action="rebirth">👑 Rebirth</button></div></div>`;}
  function eventsHTML(){return `<div class="expEventGrid">${eventInfo().map(e=>`<div class="expEventCard"><span>${e.icon}</span><b>${e.name}</b><small>${e.desc}</small><em>Coins ×${e.coin}</em></div>`).join('')}</div><div class="expSection"><div class="expSectionTitle">🎉 Event List</div><div class="expList"><span>🎃 Halloween Event</span><span>🎄 Christmas Event</span><span>🐰 Easter Event</span><span>💥 Robot Invasion</span><span>👑 Boss Week</span><span>💎 Double Reward Weekend</span><span>🎲 Random Event</span><span>⏳ Limited-time heroes/fields</span></div></div>`;}

  function infoHTML(){
    const diffs=Object.entries(DIFFICULTIES).map(([k,d])=>`<tr><td>${d.icon} ${esc(d.label)}</td><td>×${d.coinMult}</td><td>${esc(d.desc)}</td></tr>`).join('');
    const mapRows=MAP_SEQUENCE.map(k=>{
      const m=MAPS[k],base=Number(MAP_COIN_PER_LEVEL[k]||0);
      const perDiff=Object.entries(DIFFICULTIES).map(([dk,d])=>`${esc(d.label)}: ${Math.round(base*d.coinMult).toLocaleString()}`).join(' • ');
      return `<tr><td>${m.icon} ${esc(m.label)}</td><td>${TOTAL_LEVELS}</td><td>${base.toLocaleString()} 🏆</td><td>${perDiff}</td><td>${MAP_PRICE[k]||0} 🏆</td></tr>`;
    }).join('');
    const heroRows=Object.entries(TOWER_TYPES)
      .filter(([k])=>k!=='smile_immortal'||currentProfile?.ownedHeroes?.includes(k)||currentProfile?.admin)
      .sort((a,b)=>a[1].unlockPrice-b[1].unlockPrice)
      .map(([k,t])=>`<tr><td>${esc(t.name)}</td><td>${Number(t.unlockPrice||0).toLocaleString()} 🏆</td><td>${Math.round(t.cost)} in-game 🪙</td><td>${esc(t.weapon)}</td><td>${esc(t.desc)}</td></tr>`).join('');
    const robotRows=Object.entries(ENEMY_TYPES).map(([k,r])=>{
      const tags=[r.shield?'Shield':null,r.regen?'Regen':null,r.role||null,r.armor?`Armor ${r.armor}`:null,r.elite?'Elite':null].filter(Boolean);
      return `<tr><td>${esc(r.name)}</td><td>${r.hp}</td><td>${r.speed}</td><td>${r.dmg}</td><td>${esc(tags.join(' • ')||'Basic')}</td></tr>`;
    }).join('');
    const modeRows=Object.entries(MODE_META).map(([k,m])=>`<tr><td>${m.icon} ${esc(m.name)}</td><td>🏆 ×${m.coin}</td><td>${esc(m.desc)}</td></tr>`).join('');
    const promoRows=currentProfile?.creator
      ? Object.entries(PROMO_CODES).map(([c,p])=>`<tr><td><code>${esc(c)}</code></td><td>${esc(p.desc)}</td><td>${(()=>{const ms=promoCooldownMs(c);return ms===0?'♾️ առանց cooldown':Math.round(ms/86400000)+' օր';})()}</td></tr>`).join('')
      : `<tr><td colspan="3">🔒 Պրոմոկոդերի ցանկը հասանելի է միայն CREATOR-ին։</td></tr>`;
    const buttonRows=[
      ['🎮 Խաղալ','Ընտրված դժվարությամբ և ընտրված դաշտով սկսում է նոր խաղը։'],
      ['▶ Սկսել ալիքը','Սկսում է հաջորդ wave-ը։ Ավարտելուց հետո կրկին հասանելի է։'],
      ['⏩ Speed','Փոխում է խաղի արագությունը՝ ×1/×2/×3/×5/×10։'],
      ['⏸ / ▶ Pause','Դադարեցնում կամ շարունակում է ընթացիկ խաղը։'],
      ['🏠 Մենյու','Վերադարձ գլխավոր մենյու՝ առանց կրկին login անելու։'],
      ['⚡ AutoLv','Միայն VIP/ADMIN․ ավտոմատ սկսում է հաջորդ wave-ը։'],
      ['🦸 Hero card','Ընտրիր hero-ն, հետո սեղմիր canvas-ի ազատ (ոչ ուղու) վանդակի վրա։'],
      ['‹ / › Hero pages','Փոխում է hero carousel-ի էջերը։'],
      ['🛒 Հերոսների խանութ','Hero unlock, 1 Lv, Max Lv և slider + BUY upgrade։'],
      ['🤖 Ռոբոտների ցանկ','Ցուցադրում է robot-ների base HP/speed/damage և role-երը։'],
      ['🏆 Առաջատարներ','Firebase-ի ընդհանուր online leaderboard-ը՝ player + gavat + role։'],
      ['🎁 Պատահական գնում','1 🔑-ով բացում է 16 weighted reward-ներից մեկը։'],
      ['🔐 Պրոմոկոդեր','Մուտքագրում և ակտիվացնում է promo code-ը։'],
      ['🎁 Ամենօրյա նվերներ','Օրական մեկ claim՝ Օր 1 +5-ից մինչև Օր 30 +150 🏆։'],
      ['⚙ Settings','Լեզու և պահպանվող կարգավորումներ։'],
      ['🎮 Game Center','Բոլոր expansion համակարգերը մեկ տեղում։'],
      ['⚔️ Battle tab','Mode, Elite Robots, Boss Skills, Speedrun, Hardcore։'],
      ['🗺️ Fields tab','Դաշտ ընտրել/գնել, Field Modifiers և Portal։'],
      ['💰 Economy tab','Gems, Crystals, Keys, Tickets, Bank, Shop, Chests, Trade։'],
      ['🌐 Online tab','Profile, flag, online status, global stats, friends, PvP, Guild։'],
      ['🏅 Progress tab','Achievements, Prestige, Rebirth, streak, lifetime stats, titles։'],
      ['🎉 Events tab','Seasonal և random event-ների ցանկ + active modifiers։'],
      ['📖 Info tab','Ամբողջ խաղային տեղեկատու՝ հասանելի է միայն VIP / ADMIN / CREATOR-ին։']
    ].map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('');
    return `<div class="expSection"><div class="expSectionTitle">⚙️ Խաղի հիմնական կանոնները</div><div class="tip">10 դաշտ × ${TOTAL_LEVELS} wave = 1000 wave ընդհանուր։ Hero-ի max level՝ ${HERO_MAX_LEVEL}։ Յուրաքանչյուր անցած wave տալիս է նաև in-game 🪙 gold՝ 30 + 2 × wave։ 🏆 gavat reward-ը հաշվարկվում է դաշտի base reward × difficulty multiplier × ակտիվ bonus-ներով։</div></div>
      <div class="expSection"><div class="expSectionTitle">💀 Դժվարություններ</div><div class="expTableWrap"><table class="expTable"><thead><tr><th>Դժվարություն</th><th>Gavat ×</th><th>Նկարագրություն</th></tr></thead><tbody>${diffs}</tbody></table></div></div>
      <div class="expSection"><div class="expSectionTitle">🎮 Battle Modes</div><div class="expTableWrap"><table class="expTable"><thead><tr><th>Mode</th><th>Coin bonus</th><th>Կանոն</th></tr></thead><tbody>${modeRows}</tbody></table></div></div>
      <div class="expSection"><div class="expSectionTitle">🗺️ Դաշտեր</div><div class="expTableWrap"><table class="expTable"><thead><tr><th>Դաշտ</th><th>Waves</th><th>1 wave base</th><th>6 difficulty rewards</th><th>Unlock</th></tr></thead><tbody>${mapRows}</tbody></table></div></div>
      <div class="expSection"><div class="expSectionTitle">🦸 Հերոսներ</div><div class="expTableWrap"><table class="expTable"><thead><tr><th>Անուն</th><th>Unlock</th><th>Placement cost</th><th>Զենք</th><th>Հատկություն / ունակություն</th></tr></thead><tbody>${heroRows}</tbody></table></div></div>
      <div class="expSection"><div class="expSectionTitle">🤖 Ռոբոտների roster</div><div class="expTableWrap"><table class="expTable"><thead><tr><th>Robot</th><th>Base HP</th><th>Speed</th><th>Damage</th><th>Role / ability</th></tr></thead><tbody>${robotRows}</tbody></table></div></div>
      <div class="expSection"><div class="expSectionTitle">🔘 Կոճակների բացատրություն</div><div class="expTableWrap"><table class="expTable"><thead><tr><th>Կոճակ</th><th>Ինչ է անում</th></tr></thead><tbody>${buttonRows}</tbody></table></div></div>
      ${currentProfile?.creator ? `<div class="expSection"><div class="expSectionTitle">🎁 Mystery Boxes & Rarity</div><div class="tip">Հերոսները ունեն Common / Rare / Epic / Legendary / Secret rarity։ Box-երը՝ Bronze, Silver, Epic, Legendary և Secret։ Mega Luck-ի ժամանակ Bronze Box-ի օրինակային odds-ը փոխվում է՝ +1 🏆՝ 25% → 0.005%, +10 🏆՝ 12.5% → 0.5%, նոր hero՝ 0.5% → 12.5%, promo reward՝ 0.005% → 25%։ Մնացած հավանականությունը բաշխվում է մյուս reward-ների միջև։</div></div>` : ''}
      ${currentProfile?.creator ? `<div class="expSection"><div class="expSectionTitle">🟣 CREATOR • Հնարավորություններ</div><div class="expList"><span>🔑 Ակտիվացման կոդ՝ <code>Can_you_see_I_am a Creater_do you know??_I_am_diference</code></span><span>✅ ADMIN-ի բոլոր հնարավորությունները՝ ∞ 🏆/🔑, բոլոր հերոսները Lv999, բոլոր դաշտերը, AutoLv, Info</span><span>✅ Տեսնում է բոլոր promo code-երը իրենց նվերներով ու cooldown-ով</span><span>✅ Promo code ավելացնել / անջատել / ջնջել</span><span>✅ Ցանկացած խաղացողի 🏆 Gavat, 🔑 Keys, 💎 Gems, 🔮 Crystals, 🎟️ Tickets փոխել</span><span>✅ Հերոս և դաշտ տալ / հեռացնել (դաշտը տալիս ընտրվում է նաև)</span><span>✅ Event-ներ՝ AUTO / ON / OFF</span><span>✅ VIP և ADMIN տալ / վերցնել</span><span>✅ Leaderboard-ում հատուկ դեկորատիվ անուն (label) տալ՝ առանց privilege/reward-ի</span><span>✅ Broadcast բոլոր խաղացողներին</span></div></div>` : ''}
      ${currentProfile?.creator ? `<div class="expSection"><div class="expSectionTitle">🔐 Պրոմոկոդեր և նվերներ • CREATOR ONLY</div><div class="expTableWrap"><table class="expTable"><thead><tr><th>Promo code</th><th>Նվեր</th><th>Cooldown</th></tr></thead><tbody>${promoRows}</tbody></table></div></div>` : ''}`;
  }

  let tab='overview';
  async function render(){const s=ensure(); refreshTitles(s); const el=document.getElementById('expansionContent');if(!el||!s)return;refreshResets(s,false);let html='';if(tab==='overview')html=overviewHTML(s);else if(tab==='battle')html=battleHTML(s);else if(tab==='heroes')html=heroesHTML(s);else if(tab==='fields')html=fieldsHTML(s);else if(tab==='economy')html=economyHTML(s);else if(tab==='online')html=await onlineHTML(s);else if(tab==='progress')html=progressHTML(s);else if(tab==='events')html=eventsHTML();else html=canViewInfo()?infoHTML():overviewHTML(s);el.innerHTML=html;document.querySelectorAll('.expTab').forEach(b=>b.classList.toggle('sel',b.dataset.tab===tab));applyInfoGate();}
  function open(){ensure();refreshResets(ensure());document.getElementById('expansionOverlay').style.display='flex';tab='overview';render();}
  function canViewInfo(){return !!currentProfile && (!!currentProfile.admin || !!currentProfile.creator || Number(currentProfile.vipUntil||0)>Date.now());}
  async function openInfo(){if(!canViewInfo())return;ensure();refreshResets(ensure());document.getElementById('expansionOverlay').style.display='flex';tab='info';await render();}
  function applyInfoGate(){document.querySelectorAll('.expTab[data-tab="info"]').forEach(b=>b.style.display=canViewInfo()?'inline-flex':'none');}
  window.HVR_OPEN_FULL_INFO=openInfo;
  function close(){document.getElementById('expansionOverlay').style.display='none';}

  document.addEventListener('DOMContentLoaded',()=>{
    const center=document.getElementById('featureHubBtn'); if(center){center.textContent='🎮 Game Center • All Features';center.onclick=open;}
    const login=document.getElementById('loginBtn');if(login)login.addEventListener('click',()=>setTimeout(()=>{ensure();},0));
    const c=document.getElementById('expansionContent'); if(c)c.addEventListener('click',async e=>{const b=e.target.closest('[data-action]');if(!b)return;const a=b.dataset.action,k=b.dataset.hero,s=ensure();if(a==='mode'){if(MODE_META[b.dataset.mode]){s.mode=b.dataset.mode;save();toast(`🎮 Mode → ${MODE_META[s.mode].name}`,'good');render();}return;}if(a==='selectMap'){const mk=b.dataset.map;if(MAPS[mk]){if(!Array.isArray(currentProfile.ownedMaps))currentProfile.ownedMaps=[];if(!currentProfile.ownedMaps.includes(mk)){const price=Number(MAP_PRICE[mk]||0);if(!currentProfile.admin && Number(currentProfile.coins||0)<price){toast(`Պետք է ${price} 🏆։`,'bad');return;}if(!spendCoins(price)){toast(`Պետք է ${price} 🏆։`,'bad');return;}currentProfile.ownedMaps.push(mk);}currentProfile.selectedMap=mk;window.HVR_SET_SELECTED_MAP?.(mk);window.saveProfile?.(currentProfile);renderMapGrid?.();toast(`🗺️ ${MAPS[mk].icon} ${MAPS[mk].label} ընտրված է։`,'good');}return;}if(a==='evolve')evolve(k);else if(a==='skill')upgradeSkill(k,b.dataset.branch);else if(a==='equip')upgradeEquip(k,b.dataset.slot);else if(a==='artifact')upgradeArtifact(b.dataset.artifact);else if(a==='ult')ultUpgrade(k);else if(a==='ai')toggleAI(k);else if(a==='skin')equipSkin(k,b.dataset.skin);else if(a==='season')seasonClaim();else if(a==='quest')questClaim(b.dataset.kind);else if(a==='portal')portalNext();else if(a==='dailyChest')claimDailyChest();else if(a==='megaChest')openMegaChest();else if(a==='goldenKey')claimGoldenKey();else if(a==='shop')shopBuy(Number(b.dataset.index));else if(a==='trade')trade(b.dataset.trade);else if(a==='bank')bank(b.dataset.bank);else if(a==='flag')toggleFlag();else if(a==='friendAdd')addFriend();else if(a==='friendRemove')removeFriend(b.dataset.user);else if(a==='pvp')await pvpFight();else if(a==='guildCreate')guildCreate();else if(a==='guildMission')guildMission();else if(a==='rebirth')rebirth();render();});
    document.querySelectorAll('.expTab').forEach(b=>b.onclick=()=>{if(b.dataset.tab==='info'&&!canViewInfo())return;tab=b.dataset.tab;render();});
    document.getElementById('expansionCloseBtn')?.addEventListener('click',close);
  });

  // Game Center has a global event button; update stats periodically without disturbing combat.
  setInterval(()=>{if(window.currentProfile){ensure();refreshResets(ensure(),false);if(document.getElementById('expansionOverlay')?.style.display==='flex')render();}},15000);
})();
