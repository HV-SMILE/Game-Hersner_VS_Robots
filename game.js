// ============================================================
// HEROES VS ROBOTS — game.js
// ============================================================

// ---------- ASSETS ----------
const ASSET_FILES = {
  mraveli: 'mraveli.png',
  atoriponch: 'atoriponch.png',
  skochitagavor: 'skochitagavor.png',
  simvolneri_mard: 'simvolneri_mard.png',
  kettle: 'kettle.png',
  shamshyan: 'shamshyan.png',
  mraveli_bust: 'mraveli_bust.png',
  atoriponch_bust: 'atoriponch_bust.png',
  skochitagavor_bust: 'skochitagavor_bust.png',
  simvolneri_mard_bust: 'simvolneri_mard_bust.png',
  kettle_bust: 'kettle_bust.png',
  shamshyan_bust: 'shamshyan_bust.png',
  brain_base: 'brain_base.png',
  skochitagavor_throw1: 'skochitagavor_throw1.png',
  skochitagavor_throw2: 'skochitagavor_throw2.png',
  skochitagavor_throw3: 'skochitagavor_throw3.png',
  skochitagavor_throw4: 'skochitagavor_throw4.png',
  hikler: 'hikler.png',
  expelearmus: 'expelearmus.png',
  ferri: 'ferri.png',
  heraxos: 'heraxos.png',
  jutak: 'jutak.png',
  kungfu: 'kungfu.png',
  matem: 'matem.png',
  nikolaganner: 'nikolaganner.png',
  taguhi: 'taguhi.png',
  tort: 'tort.png',
  hikler_bust: 'hikler_bust.png',
  expelearmus_bust: 'expelearmus_bust.png',
  ferri_bust: 'ferri_bust.png',
  heraxos_bust: 'heraxos_bust.png',
  jutak_bust: 'jutak_bust.png',
  kungfu_bust: 'kungfu_bust.png',
  matem_bust: 'matem_bust.png',
  nikolaganner_bust: 'nikolaganner_bust.png',
  taguhi_bust: 'taguhi_bust.png',
  tort_bust: 'tort_bust.png',
};
const imgCache = {};
Object.entries(ASSET_FILES).forEach(([key, src]) => {
  const im = new Image();
  im.src = src;
  imgCache[key] = im;
});

// ---------- TOWER DEFINITIONS (renamed heroes w/ signature weapons) ----------
const TOWER_TYPES = {
  mraveli: {
    name: "Մր. Ավելի", weapon: "🧹 Ավելի-հարված", img: "mraveli", bust: "mraveli_bust", cost: 45, unlockPrice: 0,
    range: 62, rate: 22, damage: 9, splash: 0,
    desc: "Խփում է ավելով, մի քանի ռոբոտի մեկից", color: "#8fa8c9",
    special: "multi", projShape: "dust"
  },
  atoriponch: {
    name: "Աթորի Փոնչը", weapon: "🪑 Աթոռ-նետում", img: "atoriponch", bust: "atoriponch_bust", cost: 65, unlockPrice: 10,
    range: 95, rate: 55, damage: 22, splash: 0,
    desc: "Նետում է աթոռ. ետ է հրում ու ապշեցնում ռոբոտին", color: "#c98f4a",
    special: "knockback", projShape: "chair"
  },
  skochitagavor: {
    name: "Սկոչի Թագավոր", weapon: "📼 Սկոչ-նետում", img: "skochitagavor", bust: "skochitagavor_bust", cost: 55, unlockPrice: 15,
    range: 110, rate: 18, damage: 6, splash: 0,
    desc: "Շատ արագ նետում է սկոչով փաթաթում ու դանդաղեցնում", color: "#e8e0c0",
    special: "slow", projShape: "tape"
  },
  kettle: {
    name: "Նունե", weapon: "☕ Շոգու պայթյուն", img: "kettle", bust: "kettle_bust", cost: 85, unlockPrice: 20,
    range: 88, rate: 45, damage: 14, splash: 55,
    desc: "Շոգու պայթյուն՝ վնասում է շրջակա բոլոր ռոբոտներին", color: "#d9c9a8",
    special: "aoe", projShape: "steam"
  },
  simvolneri_mard: {
    name: "Սիմվոլների Մարդ", weapon: "🤬 Մատներից կրակող սիմվոլներ", img: "simvolneri_mard", bust: "simvolneri_mard_bust", cost: 90, unlockPrice: 22,
    range: 105, rate: 26, damage: 10, splash: 0,
    desc: "Մատներից կրակում է կատաղի սիմվոլներ՝ այրում է ժամանակի ընթացքում", color: "#d94a4a",
    special: "burn", projShape: "symbol"
  },
  shamshyan: {
    name: "Շամշյան", weapon: "📷 Ֆլեշ-կանգնեցում", img: "shamshyan", bust: "shamshyan_bust", cost: 130, unlockPrice: 30,
    range: 130, rate: 90, damage: 8, splash: 130,
    desc: "Նկարում է կամերայով՝ ֆլեշը կանգնեցնում է շրջակա ռոբոտներին", color: "#a8c9e0",
    special: "freeze", projShape: "flash"
  },

  // --- 10 new heroes ---
  hikler: {
    name: "2 Հիքլեր", weapon: "💙 Բուժում ու դանդաղեցում", img: "hikler", bust: "hikler_bust", cost: 95, unlockPrice: 25,
    range: 130, rate: 100, damage: 0, splash: 0,
    desc: "Բուժում է մոտակա (5x5) հերոսներին իրենց կյանքի 25%-ով և դանդաղեցնում մոտակա (4x4) ռոբոտներին 60%-ով",
    color: "#7ac9e8", special: "aura_heal_slow", projShape: "none",
    healRadiusTiles: 5, healPct: 0.25, slowRadiusTiles: 4, slowFactor: 0.4, slowDuration: 90
  },
  expelearmus: {
    name: "Էքսպելեարմուս Մարի", weapon: "✨ Կախարդական փայտիկ", img: "expelearmus", bust: "expelearmus_bust", cost: 100, unlockPrice: 35,
    range: 115, rate: 40, damage: 12, splash: 0,
    desc: "Կախարդական փայտիկով կրակում է, 15% հավանականությամբ ակնթարթորեն ոչնչացնում է ռոբոտին",
    color: "#9a5cd9", special: "wand_instakill", projShape: "wand", instaKillChance: 0.15
  },
  ferri: {
    name: "Ֆերրի Հենո", weapon: "🔥 Արդուկի հարված", img: "ferri", bust: "ferri_bust", cost: 90, unlockPrice: 25,
    range: 85, rate: 60, damage: 6, splash: 0,
    desc: "Արդուկում է ռոբոտին. դանդաղեցնում է 50%-ով և 5 վայրկյանում հանում է կյանքի 50%-ը (10%/վրկ)",
    color: "#e88a4a", special: "iron_dot", projShape: "iron",
    slowFactor: 0.5, slowDuration: 300, ironDurationTicks: 300, ironTotalPct: 0.5
  },
  heraxos: {
    name: "Հեռախոս Մարիանա", weapon: "📱 Հեռախոսի նետում", img: "heraxos", bust: "heraxos_bust", cost: 105, unlockPrice: 40,
    range: 100, rate: 50, damage: 8, splash: 0,
    desc: "Նետում է հեռախոսը. 25% հավանականությամբ ռոբոտը դառնում է հերոսների կողմը, հարվածում մյուս ռոբոտներին ու ետ գնալիս ինքնաոչնչացվում",
    color: "#5cd9a0", special: "phone_convert", projShape: "phone", convertChance: 0.25
  },
  jutak: {
    name: "Ջութակ Նունե", weapon: "🎻 Ջութակի նվագ/հարված", img: "jutak", bust: "jutak_bust", cost: 80, unlockPrice: 35,
    range: 95, rate: 50, damage: 10, splash: 0,
    desc: "50% հավանականությամբ նվագում է՝ դանդաղեցնելով շրջակային 20%-ով, 50%-ով հարվածում է ջութակով մի քանի ռոբոտի ու ետ հրում",
    color: "#e8c95c", special: "accordion_dual", projShape: "none"
  },
  kungfu: {
    name: "Կունգ-ֆու Աշոտ", weapon: "🥋 Եռակի հարված", img: "kungfu", bust: "kungfu_bust", cost: 75, unlockPrice: 32,
    range: 68, rate: 35, damage: 16, splash: 0,
    desc: "3 տեսակի հարված (1/3 հավանականությամբ). ակնթարթային ոչնչացում, ետ հրում, կամ 2 վրկ անշարժացում",
    color: "#e85c5c", special: "kungfu_triple", projShape: "fist"
  },
  matem: {
    name: "Մաթեմ Հարութ", weapon: "🧮 Մաթեմատիկական լազեր", img: "matem", bust: "matem_bust", cost: 110, unlockPrice: 38,
    range: 115, rate: 12, damage: 5, splash: 0,
    desc: "Անընդհատ կրակում է մաթեմատիկական հավասարումներով և բուժում մոտակա (3x3) հերոսներին՝ հասցրած վնասի կեսի չափով",
    color: "#5c8ae8", special: "math_heal", projShape: "math", healRadiusTiles: 3
  },
  nikolaganner: {
    name: "Սրտիկներ", weapon: "💚 Եռակի սրտիկ", img: "nikolaganner", bust: "nikolaganner_bust", cost: 95, unlockPrice: 30,
    range: 100, rate: 55, damage: 8, splash: 0,
    desc: "Կրակում է 3 սրտիկ միանգամից. ամեն մեկը 1/2 հավանականությամբ կամ դանդաղեցնում, կամ թուլացնում է ռոբոտին",
    color: "#5ce8c9", special: "triple_heart", projShape: "heart"
  },
  taguhi: {
    name: "Թագուհի Մարի", weapon: "👑 Թագավորական աուրա", img: "taguhi", bust: "taguhi_bust", cost: 150, unlockPrice: 100,
    range: 0, rate: 999, damage: 0, splash: 0,
    desc: "Ամբողջ խաղադաշտում. կրկնապատկում է հերոսների կյանքը, +50% կրակի արագություն, ռոբոտներին -15% արագություն և -75% վնաս, ամեն 25 վրկ ոչնչացնում է պատահական ռոբոտի",
    color: "#e85ca0", special: "queen_aura", projShape: "none"
  },
  tort: {
    name: "Տորթ Սյուզի", weapon: "🎂 Տորթի նետում", img: "tort", bust: "tort_bust", cost: 70, unlockPrice: 28,
    range: 90, rate: 65, damage: 4, splash: 0,
    desc: "Նետում է տորթը ռոբոտի վրա՝ ամբողջովին կանգնեցնելով նրան մի քանի վայրկյան",
    color: "#d9a25c", special: "cake_freeze", projShape: "cake", freezeDuration: 90
  },
  smile_immortal: { name:"Smile Immortal", weapon:"🙂 Ձեռքեր + ոտքեր", img:"brain_base", bust:"brain_base", cost:0, unlockPrice:10000, range:999, rate:10, damage:50, splash:180, color:"#fff07a", special:"smile_immortal", projShape:"symbol", desc:"Անմահ հատուկ հերոս՝ +500% կյանք, արագություն և ուժ, ռոբոտներին հզոր խանգարումներ" }
};
const SYMBOL_CHARS = "<>?|{}][\\;!@#$%^&*()+/*-+~".split("");
const TOWER_MAX_HP = 100;

// ---------- HERO LEVELING (1-999) ----------
// Heroes are nerfed hard at the base stats below, then grow back up through
// leveling: buying a hero starts it at level 1; each level costs coins and
// adds +2 HP, +2 damage, +2% fire speed, up to level 999.
const HERO_DMG_NERF_DIV = 3;    // base damage divided by this (was 20: new heroes were nearly useless)
const HERO_RATE_NERF_MULT = 1;  // fire speed kept at its original (non-nerfed) rate
const HERO_BASE_HP = TOWER_MAX_HP / 2.5; // 40 HP at level 1 (was 5: died to a single hit)
const HERO_MAX_LEVEL = 999;
const HERO_LEVEL_HP_BONUS = 4;
const HERO_LEVEL_DMG_BONUS = 2;
const HERO_LEVEL_SPEED_PCT = 0.02; // +2% fire speed per level (reduces cooldown)

function heroUpgradeCost(basePrice, targetLevel) {
  // 1->2 costs basePrice; each level after that costs +2 more than the previous upgrade
  return basePrice + (targetLevel - 2) * 2;
}
function heroEffectiveMaxHp(level) {
  return HERO_BASE_HP + (level - 1) * HERO_LEVEL_HP_BONUS;
}
function heroEffectiveDamage(baseDamage, level) {
  return baseDamage / HERO_DMG_NERF_DIV + (level - 1) * HERO_LEVEL_DMG_BONUS;
}
function heroEffectiveRateMult(level) {
  return HERO_RATE_NERF_MULT * Math.max(0.15, 1 - (level - 1) * HERO_LEVEL_SPEED_PCT);
}

// ---------- ENEMY DEFINITIONS (base stats before difficulty scaling) ----------
// Visual traits (color / eyeColor / headShape / feet) are loosely inspired
// by a mixed "junkyard mech" reference sheet: rusty riveted plating for the
// heavies, a glossy round dome for the fast scouts, a boxy visor-head for
// the shielded units, and a big glowing dome-eye for the boss.
const ENEMY_TYPES = {
  basic:    { hp: 40,  speed: 0.9,  dmg: 1, gold: 8,  color: "#8a8a92", w: 22, name: "Ռոբոտ",
              eyes: 2, eyeColor: "#e8574a", headShape: "round", antenna: true, feet: "round" },
  fast:     { hp: 22,  speed: 1.8,  dmg: 1, gold: 9,  color: "#4a90c9", w: 18, name: "Արագ Ռոբոտ",
              eyes: 1, eyeColor: "#eafcff", headShape: "visor", antenna: true, feet: "wedge" },
  tank:     { hp: 150, speed: 0.55, dmg: 2, gold: 20, color: "#a05a2c", w: 30, name: "Ուժեղ Ռոբոտ",
              eyes: 2, eyeColor: "#ff8a3a", headShape: "boxy", antenna: false, feet: "block", rivets: true },
  slow:     { hp: 90,  speed: 0.5,  dmg: 2, gold: 14, color: "#c9922f", w: 26, name: "Ծանր Ռոբոտ",
              eyes: 2, eyeColor: "#ffd35c", headShape: "round", antenna: false, feet: "block", rivets: true },
  weak:     { hp: 14,  speed: 1.1,  dmg: 1, gold: 5,  color: "#9ad98f", w: 16, name: "Թույլ Ռոբոտ",
              eyes: 1, eyeColor: "#ffffff", headShape: "round", antenna: true, feet: "round" },
  shielded: { hp: 60,  speed: 0.8,  dmg: 1, gold: 16, color: "#6a7a9a", w: 24, name: "Պաշտպանված Ռոբոտ", shield: 40,
              eyes: 1, eyeColor: "#6ac9e8", headShape: "boxy", antenna: false, feet: "block" },
  regen:    { hp: 70,  speed: 0.85, dmg: 1, gold: 15, color: "#4a9a7a", w: 24, name: "Ապաքինվող Ռոբոտ", regen: true,
              eyes: 2, eyeColor: "#9affc0", headShape: "round", antenna: true, feet: "round" },
  drainer:  { hp: 50,  speed: 1.0,  dmg: 4, gold: 18, color: "#9a3a8a", w: 24, name: "Կյանք Խլող Ռոբոտ",
              eyes: 2, eyeColor: "#ff5cf0", headShape: "visor", antenna: true, feet: "wedge" },
  boss:     { hp: 900, speed: 0.45, dmg: 6, gold: 150,color: "#8a6a1a", w: 46, name: "Ռոբոտ-Շեֆ",
              eyes: 1, eyeColor: "#ffd93a", headShape: "round", antenna: true, feet: "block", rivets: true },

  // --- 4 new special-role robots ---
  attacker: { hp: 65,  speed: 0.85, dmg: 2, gold: 17, color: "#c94a4a", w: 24, name: "Հարձակվող Ռոբոտ",
              eyes: 2, eyeColor: "#ff3a3a", headShape: "boxy", antenna: true, feet: "block",
              role: "attacker", atkRadius: 70, atkCooldownMax: 70, disableDuration: 90 },
  healer:   { hp: 55,  speed: 0.75, dmg: 1, gold: 16, color: "#4ac97a", w: 22, name: "Բուժող Ռոբոտ",
              eyes: 1, eyeColor: "#9affc0", headShape: "round", antenna: true, feet: "round",
              role: "healer", healRadius: 75, healCooldownMax: 55, healPct: 0.07 },
  booster:  { hp: 45,  speed: 1.0,  dmg: 1, gold: 15, color: "#c9c94a", w: 20, name: "Արագացնող Ռոբոտ",
              eyes: 2, eyeColor: "#fff35c", headShape: "visor", antenna: true, feet: "wedge",
              role: "booster", boostRadius: 65, boostMult: 1.4 },
  jammer:   { hp: 60,  speed: 0.7,  dmg: 1, gold: 17, color: "#7a5a9a", w: 24, name: "Խանգարիչ Ռոբոտ",
              eyes: 1, eyeColor: "#c9a0ff", headShape: "boxy", antenna: false, feet: "block",
              role: "jammer", jamRadius: 85, jamMult: 0.55 },

  // --- 2 more robot types ---
  armored:  { hp: 120, speed: 0.6,  dmg: 2, gold: 19, color: "#5a6a72", w: 28, name: "Զրահապատ Ռոբոտ",
              eyes: 2, eyeColor: "#c9d9e0", headShape: "boxy", antenna: false, feet: "block", rivets: true,
              armor: 4 },
  swarm:    { hp: 10,  speed: 1.5,  dmg: 1, gold: 4,  color: "#e0a03a", w: 15, name: "Երամի Ռոբոտ",
              eyes: 2, eyeColor: "#fff0c0", headShape: "round", antenna: true, feet: "wedge" },
  sniper: {hp:48,speed:0.72,dmg:5,gold:24,color:"#6d8bd9",w:23,name:"Դիպուկահար Ռոբոտ",eyes:1,eyeColor:"#ffffff",headShape:"visor",antenna:true,feet:"wedge",role:"sniper"},
  splitter: {hp:80,speed:0.9,dmg:2,gold:22,color:"#d96d3a",w:25,name:"Բաժանվող Ռոբոտ",eyes:2,eyeColor:"#ffcf7a",headShape:"boxy",antenna:false,feet:"block",role:"splitter"},
  leech: {hp:70,speed:0.78,dmg:3,gold:25,color:"#a43aa8",w:25,name:"Կլանող Ռոբոտ",eyes:2,eyeColor:"#ff70ff",headShape:"round",antenna:true,feet:"round",role:"leech"},
  phantom: {hp:35,speed:2.0,dmg:2,gold:26,color:"#7387a8",w:20,name:"Ֆանտոմ Ռոբոտ",eyes:2,eyeColor:"#cceeff",headShape:"visor",antenna:true,feet:"wedge",role:"phantom"},
  berserker: {hp:110,speed:1.05,dmg:4,gold:30,color:"#d93d3d",w:29,name:"Բերսերկ Ռոբոտ",eyes:2,eyeColor:"#ff3333",headShape:"boxy",antenna:false,feet:"block",role:"berserker"},
  freezer: {hp:75,speed:0.68,dmg:2,gold:23,color:"#55bde8",w:25,name:"Սառեցնող Ռոբոտ",eyes:1,eyeColor:"#d9ffff",headShape:"round",antenna:true,feet:"round",role:"freezer"},
  summoner: {hp:90,speed:0.55,dmg:2,gold:28,color:"#9b68d8",w:27,name:"Կանչող Ռոբոտ",eyes:2,eyeColor:"#e7c7ff",headShape:"boxy",antenna:true,feet:"block",role:"summoner"},
  miner: {hp:130,speed:0.48,dmg:3,gold:27,color:"#b38b43",w:30,name:"Հանքափոր Ռոբոտ",eyes:2,eyeColor:"#ffe27a",headShape:"boxy",antenna:false,feet:"block",role:"miner",armor:6},
  hacker: {hp:58,speed:0.92,dmg:2,gold:29,color:"#39b58c",w:23,name:"Հաքեր Ռոբոտ",eyes:1,eyeColor:"#6affcf",headShape:"visor",antenna:true,feet:"wedge",role:"hacker"},
  titan: {hp:320,speed:0.34,dmg:8,gold:65,color:"#59636f",w:42,name:"Տիտան Ռոբոտ",eyes:2,eyeColor:"#ffb84d",headShape:"boxy",antenna:false,feet:"block",rivets:true,role:"titan",armor:8},
  elite_shield: {hp:180,speed:0.62,dmg:3,gold:45,color:"#4d78c7",w:32,name:"🛡️ Elite Shield",eyes:2,eyeColor:"#bde5ff",headShape:"boxy",antenna:true,feet:"block",armor:6,shield:120,elite:true},
  elite_healer: {hp:130,speed:0.72,dmg:2,gold:42,color:"#49b879",w:29,name:"💚 Elite Healer",eyes:1,eyeColor:"#d8ffe5",headShape:"round",antenna:true,feet:"round",role:"healer",healRadius:100,healCooldownMax:40,healPct:0.12,elite:true},
  elite_tank: {hp:420,speed:0.42,dmg:6,gold:70,color:"#6f6b72",w:44,name:"🛡️ Elite Tank",eyes:2,eyeColor:"#ffbe6b",headShape:"boxy",antenna:false,feet:"block",rivets:true,armor:14,elite:true},
  elite_assassin: {hp:105,speed:1.6,dmg:8,gold:58,color:"#a74370",w:27,name:"⚡ Elite Assassin",eyes:1,eyeColor:"#ffb2dd",headShape:"visor",antenna:true,feet:"wedge",role:"attacker",atkRadius:120,atkCooldownMax:50,disableDuration:120,elite:true},
};

// ---------- DIFFICULTY PRESETS ----------
// Every difficulty except "norek" (beginner) draws from the FULL robot
// roster, including the hero-damaging "Հարձակվող Ռոբոտ". "norek" excludes
// any robot with an attack-hero role, so new players never lose a hero.
const ALL_ENEMY_KEYS = Object.keys(ENEMY_TYPES).filter(k => k !== 'boss' && !ENEMY_TYPES[k].elite);
const NOREK_ENEMY_KEYS = ALL_ENEMY_KEYS.filter(k => ENEMY_TYPES[k].role !== 'attacker');
const ELITE_ENEMY_KEYS = ['elite_shield','elite_healer','elite_tank','elite_assassin'];

// First level at which each robot type may appear in normal waves, so wave 1
// is no longer a random mix of every robot (titans, snipers, hackers...).
const ENEMY_INTRO = {
  basic:1, weak:1, fast:2, swarm:3, slow:3, tank:4, shielded:5, regen:6, booster:7,
  healer:8, jammer:9, drainer:10, armored:11, attacker:12, splitter:13, sniper:14,
  leech:15, freezer:16, phantom:17, miner:18, berserker:20, hacker:22, summoner:24, titan:30
};
function enemyPoolForLevel(pool, level) {
  // Sorted by the level they are introduced at, so the "newest robots" bias
  // in buildLevelQueue really picks the most recently unlocked ones.
  const out = pool.filter(k => (ENEMY_INTRO[k] || 1) <= level)
    .sort((a, b) => (ENEMY_INTRO[a] || 1) - (ENEMY_INTRO[b] || 1));
  return out.length ? out : pool.slice(0, 2);
}

const DIFFICULTIES = {
  norek: {
    label: "Նորեկ", icon: "🌱", desc: "Ռոբոտները դանդաղ են, հերոսներն ուժեղ ու հեռահար (առանց հերոսներին վնասող ռոբոտի)",
    robotHpMult: 0.6, robotSpeedMult: 0.65, towerDmgMult: 1.5, towerRangeMult: 1.35, goldMult: 1.3, coinMult: 1,
    pool: NOREK_ENEMY_KEYS
  },
  hesht: {
    label: "Հեշտ", icon: "🙂", desc: "Ռոբոտները դանդաղ, հերոսներն ուժեղ",
    robotHpMult: 0.8, robotSpeedMult: 0.8, towerDmgMult: 1.25, towerRangeMult: 1.15, goldMult: 1.15, coinMult: 2,
    pool: ALL_ENEMY_KEYS
  },
  mijin: {
    label: "Միջին", icon: "⚔", desc: "Հավասարակշռված խաղ", 
    robotHpMult: 1, robotSpeedMult: 1, towerDmgMult: 1, towerRangeMult: 1, goldMult: 1, coinMult: 3,
    pool: ALL_ENEMY_KEYS
  },
  bard: {
    label: "Բարդ", icon: "🔥", desc: "Ռոբոտներն արագ են",
    robotHpMult: 1.25, robotSpeedMult: 1.25, towerDmgMult: 0.9, towerRangeMult: 0.95, goldMult: 0.95, coinMult: 4,
    pool: ALL_ENEMY_KEYS
  },
  anhnar: {
    label: "Անհնար", icon: "💀", desc: "Ռոբոտներն արագ, հերոսներն ավելի թույլ",
    robotHpMult: 1.55, robotSpeedMult: 1.45, towerDmgMult: 0.72, towerRangeMult: 0.85, goldMult: 0.85, coinMult: 5,
    pool: ALL_ENEMY_KEYS
  },
  ultra_ai_hard: {
    label: "Ultra AI Hard", icon: "☠", desc: "Ռոբոտները շատ արագ են, հերոսները դանդաղ ու թույլ",
    robotHpMult: 2.0, robotSpeedMult: 1.8, towerDmgMult: 0.55, towerRangeMult: 0.75, goldMult: 0.75, coinMult: 10,
    pool: ALL_ENEMY_KEYS
  },
};

// ---------- MAPS ----------
// Each map now has a fixed tile-path length (40 → 20), used in a fixed
// sequence across the 25 levels: 5 levels per map, path getting shorter
// (and so tougher — less time to react) as the game progresses.
const TILE = 48, COLS = 15, ROWS = 10;
const MAP_SEQUENCE = ["village", "mountain", "factory", "water", "space", "volcano", "ice", "forest", "electric", "boss_arena"];
const TOTAL_LEVELS = 100; // every map now has 100 levels, played independently (no chaining)
const MAP_PRICE = { village: 0, mountain: 100, factory: 200, water: 500, space: 1000, volcano: 1500, ice: 2200, forest: 3000, electric: 4500, boss_arena: 8000 };
const MAP_COIN_PER_LEVEL = { village: 1, mountain: 2, factory: 5, water: 10, space: 100, volcano: 140, ice: 180, forest: 240, electric: 320, boss_arena: 500 };
const MAPS = {
  village: {
    label: "Գյուղական Ճամփա", icon: "🌾", desc: "Դասական զիգզագ արահետ դաշտերի միջով (40 վանդակ)",
    bg: "#4a5d3a", tileA: "#4a5d3a", tileB: "#455632", path: "#8a7452", pathEdge: "#6a5a3e",
    tiles: [
      [0,4],[0,5],[0,6],[1,6],[2,6],[2,7],[2,8],[3,8],[4,8],[4,9],[5,9],[6,9],[6,8],[6,7],[6,6],
      [6,5],[6,4],[7,4],[7,3],[7,2],[8,2],[9,2],[9,1],[9,0],[10,0],[11,0],[11,1],[11,2],[11,3],
      [11,4],[11,5],[12,5],[13,5],[14,5],[14,6],[14,7],[14,8],[14,9],[13,9],[13,8]
    ]
  },
  mountain: {
    label: "Լեռնային Կիրճ", icon: "⛰", desc: "Ուղիղ, նեղ արահետ ժայռերի արանքով (35 վանդակ)",
    bg: "#5a5248", tileA: "#5a5248", tileB: "#4f4740", path: "#6b6258", pathEdge: "#3f3a34",
    tiles: [
      [0,1],[0,2],[0,3],[1,3],[1,4],[1,5],[1,6],[1,7],[2,7],[2,8],[2,9],[3,9],[4,9],[4,8],[4,7],
      [4,6],[5,6],[6,6],[7,6],[7,5],[7,4],[8,4],[9,4],[10,4],[10,3],[10,2],[10,1],[11,1],[12,1],
      [12,0],[13,0],[14,0],[14,1],[14,2],[14,3]
    ]
  },
  factory: {
    label: "Ռոբոտների Գործարան", icon: "🏭", desc: "Երկար պտտվող մետաղյա միջանցք (30 վանդակ)",
    bg: "#3a3a42", tileA: "#3a3a42", tileB: "#333340", path: "#5a5a68", pathEdge: "#22222a",
    tiles: [
      [0,5],[0,4],[0,3],[0,2],[1,2],[2,2],[2,1],[2,0],[3,0],[3,1],[3,2],[4,2],[5,2],[5,3],[5,4],
      [6,4],[7,4],[8,4],[8,5],[8,6],[8,7],[9,7],[9,8],[9,9],[10,9],[11,9],[11,8],[11,7],[11,6],[11,5]
    ]
  },
  water: {
    label: "Ջրային Ալիք", icon: "🌊", desc: "Ափամերձ արահետ՝ ջրի ալիքների երկայնքով (25 վանդակ)",
    bg: "#1f4a5c", tileA: "#1f4a5c", tileB: "#183c4a", path: "#4a90a8", pathEdge: "#2a6478",
    tiles: [
      [0,3],[0,4],[0,5],[0,6],[0,7],[1,7],[1,8],[1,9],[2,9],[3,9],[3,8],[3,7],[3,6],[4,6],[4,5],
      [4,4],[5,4],[5,3],[5,2],[5,1],[5,0],[6,0],[7,0],[8,0],[8,1]
    ]
  },
  space: {
    label: "Տիեզերական Ուղի", icon: "🌌", desc: "Աստղազարդ արահետ՝ մոլորակների ու աստերոիդների միջով (20 վանդակ)",
    bg: "#12142a", tileA: "#12142a", tileB: "#0c0e1e", path: "#3a3a6a", pathEdge: "#1a1a3a",
    tiles: [
      [0,2],[0,1],[0,0],[1,0],[2,0],[2,1],[2,2],[2,3],[3,3],[3,4],[3,5],[4,5],[5,5],[5,6],[5,7],
      [5,8],[5,9],[6,9],[7,9],[8,9]
    ]
  },
  volcano: { label:"Վոլկանո Արենա", icon:"🌋", desc:"Լավայի դաշտ՝ արագ ռոբոտներով", bg:"#3a1714", tileA:"#3a1714", tileB:"#1f0c0a", path:"#8b3f2a", pathEdge:"#552019", tiles:[[0,5],[1,5],[2,5],[2,4],[2,3],[3,3],[4,3],[4,2],[5,2],[6,2],[6,3],[7,3],[8,3],[8,4],[9,4],[10,4],[10,5],[11,5],[12,5],[12,6],[13,6],[14,6]] },
  ice: { label:"Սառցե Թագավորություն", icon:"❄️", desc:"Սառցե ուղի՝ դանդաղեցնող մթնոլորտով", bg:"#18334a", tileA:"#18334a", tileB:"#102231", path:"#5ca9c6", pathEdge:"#30627a", tiles:[[0,2],[1,2],[2,2],[2,3],[2,4],[3,4],[4,4],[4,5],[4,6],[5,6],[6,6],[6,7],[7,7],[8,7],[8,6],[9,6],[10,6],[10,5],[11,5],[12,5],[12,4],[13,4],[14,4]] },
  forest: { label:"Խոր Անտառ", icon:"🌳", desc:"Խիտ անտառ՝ շատ buildable տարածքով", bg:"#16331f", tileA:"#16331f", tileB:"#0d2113", path:"#5a7347", pathEdge:"#314126", tiles:[[0,7],[1,7],[1,6],[1,5],[2,5],[3,5],[3,4],[3,3],[4,3],[5,3],[5,2],[6,2],[7,2],[7,3],[8,3],[9,3],[9,4],[10,4],[11,4],[11,5],[12,5],[13,5],[14,5]] },
  electric: { label:"Էլեկտրական Գոտի", icon:"⚡", desc:"Էներգիայի դաշտ՝ արագ կրակի բոնուսներով", bg:"#231f48", tileA:"#231f48", tileB:"#12112c", path:"#6b64bd", pathEdge:"#3d386d", tiles:[[0,1],[1,1],[2,1],[2,2],[2,3],[3,3],[4,3],[4,4],[5,4],[6,4],[6,5],[7,5],[8,5],[8,6],[9,6],[10,6],[10,7],[11,7],[12,7],[12,8],[13,8],[14,8]] },
  boss_arena: { label:"Boss Arena", icon:"🏰", desc:"Մեծ boss battle-ի հատուկ արենա", bg:"#251530", tileA:"#251530", tileB:"#120b18", path:"#81476d", pathEdge:"#4d2842", tiles:[[0,4],[1,4],[2,4],[2,3],[2,2],[3,2],[4,2],[5,2],[5,3],[5,4],[6,4],[7,4],[7,5],[8,5],[9,5],[9,6],[10,6],[11,6],[11,5],[12,5],[13,5],[14,5]] }
};

// ============================================================
// PLAYER PROFILE (username + persistent coins/owned maps & heroes/hero levels)
// ============================================================
const PROFILES_KEY = 'heroesVsRobots_profiles';
const LAST_USER_KEY = 'heroesVsRobots_lastUser';
const DEFAULT_OWNED_MAPS = ['village'];
const DEFAULT_OWNED_HEROES = ['mraveli'];
// Shared online leaderboard via Firebase Realtime Database.
const HVR_DB = window.HVR_LEADERBOARD_DB || null;
function profileRole(profile){
  if(profile?.creator===true) return 'CREATOR';
  if(profile?.admin===true) return 'ADMIN';
  if(Number(profile?.vipUntil||0) > Date.now()) return 'VIP';
  return '';
}
function leaderboardKey(username){
  // encodeURIComponent leaves '.' alone, but Firebase keys may not contain '.'
  return encodeURIComponent(String(username || '').trim().toLowerCase()).replace(/\./g, '%2E');
}
// saveProfile() fires many times per wave; writing to Firebase on each one was
// wasteful, so writes are coalesced into one every ~2.5 s.
let _publishTimer = null, _publishPending = null;
function publishProfileToLeaderboard(profile) {
  if (!HVR_DB || !profile || !profile.username) return;
  _publishPending = profile;
  if (_publishTimer) return;
  _publishTimer = setTimeout(() => {
    _publishTimer = null;
    const p = _publishPending; _publishPending = null;
    if (p) publishProfileNow(p);
  }, 2500);
}
async function publishProfileNow(profile) {
  if (!HVR_DB || !profile || !profile.username) return;
  try {
    const key = leaderboardKey(profile.username);
    // If a Creator changed this account and this client has not applied that change
    // yet, do not overwrite it with stale local data - pull it instead.
    try {
      const cur = await HVR_DB.ref(`playerStates/${key}`).get();
      if (cur.exists()) {
        const v = cur.val() || {};
        const selfSave = String(v.updatedBy || '') === profile.username && (v.reason === 'profile-save' || v.reason === 'player-save');
        if (!selfSave && Number(v.revision || 0) > Number(profile.creatorRemoteRevision || 0)) {
          window.HVR_CREATOR?.syncManagedProfile?.();
          return;
        }
      }
    } catch (e) { /* offline: just try to write below */ }
    const role = profileRole(profile);
    const publicRow = {
      username: String(profile.username),
      coins: Math.max(0, Math.floor(Number(profile.coins)||0)),
      role,
      displayTitle: String(profile.displayTitle||''),
      updatedAt: Date.now()
    };
    // Keep the original public leaderboard row simple; full editable state lives under playerStates.
    await HVR_DB.ref(`players/${key}`).set(publicRow);
    const fullState = {
      coins: Math.max(0, Math.floor(Number(profile.coins)||0)),
      drawKeys: Math.max(0, Math.floor(Number(profile.drawKeys ?? profile.wheelSpins)||0)),
      ownedMaps: Array.isArray(profile.ownedMaps) ? [...profile.ownedMaps] : ['village'],
      ownedHeroes: Array.isArray(profile.ownedHeroes) ? [...profile.ownedHeroes] : ['mraveli'],
      heroLevels: profile.heroLevels && typeof profile.heroLevels==='object' ? profile.heroLevels : {},
      admin: !!profile.admin, creator: !!profile.creator, vipUntil: Number(profile.vipUntil||0),
      displayTitle: String(profile.displayTitle||''),
      selectedMap: profile.selectedMap || 'village', selectedDifficulty: profile.selectedDifficulty || 'mijin',
      economy: (() => { const e = profile.hvrExpansion?.economy || {}; const n = v => Math.max(0, Math.floor(Number(v)||0)); return { gems:n(e.gems), crystals:n(e.crystals), tickets:n(e.tickets), goldenKeys:n(e.goldenKeys) }; })()
    };
    const stamp = Date.now();
    await HVR_DB.ref(`playerStates/${key}`).set({
      revision: Math.max(stamp, Number(profile.creatorRemoteRevision||0)+1),
      updatedBy: String(profile.username),
      reason: 'profile-save',
      snapshot: fullState,
      updatedAt: stamp
    });
    profile.lastPublishedAt = stamp; // lets sync tell "my own older save" from "newer data elsewhere"
    try { window.HVR_SAVE_LOCAL_PROFILE?.(profile); } catch (e) {}
  } catch(e) {
    console.warn('Firebase leaderboard/state publish failed:', e);
  }
}
async function fetchSharedLeaderboard() {
  if (!HVR_DB) return {configured:false, rows:null};
  try {
    const snap = await HVR_DB.ref('players').get();
    const data = snap.exists() ? snap.val() : {};
    const rows = Object.values(data || {}).filter(v => v && typeof v.username === 'string').map(v => ({
      username: v.username,
      coins: Math.max(0, Number(v.coins) || 0),
      role: v.role === 'CREATOR' || v.role === 'ADMIN' || v.role === 'VIP' ? v.role : '',
      displayTitle: typeof v.displayTitle === 'string' ? v.displayTitle : ''
    }));
    rows.sort((a,b)=>Number(b.coins||0)-Number(a.coins||0));
    return {configured:true, rows:rows.slice(0,100)};
  } catch(e) {
    console.warn('Firebase leaderboard read failed:', e);
    return {configured:true, rows:null};
  }
}

function loadAllProfiles() {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    const obj = raw ? JSON.parse(raw) : null;
    if (obj && typeof obj === 'object') return obj;
  } catch (e) { /* ignore */ }
  return {};
}
function saveAllProfiles(all) {
  try { localStorage.setItem(PROFILES_KEY, JSON.stringify(all)); } catch (e) { /* ignore */ }
}
function makeNewProfile(username) {
  return {
    username, password:'', coins: 0,
    ownedMaps: [...DEFAULT_OWNED_MAPS], ownedHeroes: [...DEFAULT_OWNED_HEROES],
    heroLevels: {}, lastRewardDate: null, rewardStreak: 0,
    drawKeys: 1, doubleCoinsUntil: 0, usedPromoCodes: [], promoUsedAt: {},
    mapPromoBoostUntil: 0, autoLevel:false, vipUntil:0, admin:false, creator:false,
    luckBoostUntil: 0, megaLuckUntil: 0, money5xUntil: 0, boxHistory: [], dailyRewardDay:0, language:'hy',
    selectedDifficulty:'mijin', selectedMap:'village', displayTitle:''
  };
}
function getProfile(username) {
  const all = loadAllProfiles();
  return all[username] || makeNewProfile(username);
}
function saveProfile(profile) {
  if (!profile || typeof profile !== 'object') return;
  if (!Array.isArray(profile.ownedMaps)) profile.ownedMaps = [...DEFAULT_OWNED_MAPS];
  profile.ownedMaps = [...new Set(profile.ownedMaps.filter(k => MAPS[k]))];
  if (!profile.ownedMaps.includes('village')) profile.ownedMaps.unshift('village');
  if (!Array.isArray(profile.ownedHeroes)) profile.ownedHeroes = [...DEFAULT_OWNED_HEROES];
  profile.ownedHeroes = [...new Set(profile.ownedHeroes.filter(k => TOWER_TYPES[k]))];
  if (!profile.ownedHeroes.includes('mraveli')) profile.ownedHeroes.unshift('mraveli');
  if (!profile.heroLevels || typeof profile.heroLevels !== 'object') profile.heroLevels = {};
  if (typeof profile.drawKeys !== 'number') profile.drawKeys = typeof profile.wheelSpins === 'number' ? profile.wheelSpins : 1;
  profile.wheelSpins = profile.drawKeys;
  if (typeof profile.doubleCoinsUntil !== 'number') profile.doubleCoinsUntil = 0;
  if (!Array.isArray(profile.usedPromoCodes)) profile.usedPromoCodes = [];
  if (!Array.isArray(profile.wonDrawPromoCodes)) profile.wonDrawPromoCodes = [];
  if (!profile.promoUsedAt || typeof profile.promoUsedAt !== 'object') profile.promoUsedAt = {};
  if (typeof profile.mapPromoBoostUntil !== 'number') profile.mapPromoBoostUntil = 0;
  if (typeof profile.autoLevel !== 'boolean') profile.autoLevel = false;
  if (typeof profile.vipUntil !== 'number') profile.vipUntil = 0;
  if (typeof profile.admin !== 'boolean') profile.admin = false;
  if (typeof profile.creator !== 'boolean') profile.creator = false;
  if (profile.creator) profile.admin = true;
  if (typeof profile.luckBoostUntil !== 'number') profile.luckBoostUntil = 0;
  if (typeof profile.megaLuckUntil !== 'number') profile.megaLuckUntil = 0;
  if (!Array.isArray(profile.boxHistory)) profile.boxHistory = [];
  if (typeof profile.money5xUntil !== 'number') profile.money5xUntil = 0;
  const all = loadAllProfiles();
  all[profile.username] = profile;
  saveAllProfiles(all);
  try { localStorage.setItem(LAST_USER_KEY, profile.username); } catch (e) {}
  publishProfileToLeaderboard(profile);
}
function getLastUsername() {
  try { return localStorage.getItem(LAST_USER_KEY) || ''; } catch (e) { return ''; }
}

// Public persistence bridge used by Creator/expansion modules after remote state changes.
// Keeping it as an explicit bridge avoids silently losing a Creator-issued update on refresh.
window.HVR_SAVE_LOCAL_PROFILE = saveProfile;

let currentProfile = null; // set once the player logs in
try {
  Object.defineProperty(window, 'currentProfile', {
    configurable: true,
    get: () => currentProfile,
    set: (v) => { currentProfile = v; }
  });
} catch (e) { window.currentProfile = currentProfile; }

function ownsMap(key) { return currentProfile.ownedMaps.includes(key); }
function ownsHero(key) { return currentProfile.ownedHeroes.includes(key); }
function heroLevel(key) { return currentProfile.heroLevels[key] || 1; }

function addCoins(n, applyWheelMultiplier = true) {
  let amount = Number(n) || 0;
  if (currentProfile?.admin) { updateCoinDisplays(); return; }
  if (currentProfile?.vipUntil > Date.now()) amount *= 10;
  if (currentProfile?.money5xUntil > Date.now()) amount *= 5;
  if (applyWheelMultiplier && currentProfile.doubleCoinsUntil > Date.now()) {
    amount *= 2;
  } else if (currentProfile.doubleCoinsUntil && currentProfile.doubleCoinsUntil <= Date.now()) {
    currentProfile.doubleCoinsUntil = 0;
  }
  currentProfile.coins += Math.round(amount);
  saveProfile(currentProfile);
  updateCoinDisplays();
}
function spendCoins(n) {
  if (currentProfile?.admin) return true;
  if (currentProfile.coins < n) return false;
  currentProfile.coins -= n;
  saveProfile(currentProfile);
  updateCoinDisplays();
  return true;
}
function updateCoinDisplays() {
  document.querySelectorAll('.coinBalance').forEach(el => { el.textContent = currentProfile?.admin ? '∞' : Number(currentProfile?.coins||0).toLocaleString(); });
}

// ---------- Daily login reward (streak resets if a day is skipped) ----------
function dailyRewardAmount(day){ return Math.max(5, Number(day)*5); }
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function daysBetween(aStr, bStr) {
  const a = new Date(aStr + 'T00:00:00'), b = new Date(bStr + 'T00:00:00');
  return Math.round((b - a) / 86400000);
}
function claimDailyReward() {
  const today = todayStr();
  if (currentProfile.lastRewardDate === today) return null; // already claimed today
  let streak = currentProfile.rewardStreak || 0;
  streak = (currentProfile.lastRewardDate && daysBetween(currentProfile.lastRewardDate, today) === 1) ? streak + 1 : 1;
  const amount = dailyRewardAmount(streak);
  currentProfile.lastRewardDate = today;
  currentProfile.rewardStreak = streak;
  addCoins(amount, false);
  return { streak, amount };
}

// ---------- Leaderboard (all local profiles, sorted by coins) ----------
async function renderLeaderboard() {
  const listEl = document.getElementById('leaderboardList');
  listEl.innerHTML = '<div class="tip">🌐 Բեռնվում է առցանց առաջատարների ցանկը…</div>';
  const result = await fetchSharedLeaderboard();
  if(!result.configured){
    listEl.innerHTML = '<div class="tip">⚠️ Online leaderboard-ը դեռ միացված չէ։ Ստուգիր Firebase-ի կապը։</div>';
    return;
  }
  if(!Array.isArray(result.rows)){
    listEl.innerHTML = '<div class="tip">⚠️ Չհաջողվեց միանալ online leaderboard-ին։</div>';
    return;
  }
  const rows = result.rows.slice().sort((a,b)=>Number(b.coins||0)-Number(a.coins||0));
  listEl.innerHTML = rows.map((p,i) => {
    const role=String(p.role||'').toUpperCase();
    const title=String(p.displayTitle||'').trim();
    const shownLabel=title || (role==='ADMIN'?'ADMIN':role==='VIP'?'VIP':role==='CREATOR'?'CREATOR':'');
    const roleClass=shownLabel==='ADMIN'?'leaderRoleAdmin':shownLabel==='VIP'?'leaderRoleVip':shownLabel==='CREATOR'?'leaderRoleCreator':'leaderRoleCustom';
    const roleBadge=role ? `<span class="leaderRole ${role==='ADMIN'?'leaderRoleAdmin':role==='VIP'?'leaderRoleVip':role==='CREATOR'?'leaderRoleCreator':'leaderRoleCustom'}">${escapeHtml(role)}</span>` : '';
    const titleBadge=title ? `<span class="leaderRole leaderRoleCustom">${escapeHtml(title)}</span>` : '';
    return `
    <div class="heroInfoRow leaderboardRow" style="--heroColor:#f0d878">
      <div class="leaderRank">#${i+1}</div>
      <div class="hcImgWrap"><span class="hcEmoji">🎮</span></div>
      <div class="heroInfoText"><div class="leaderNameLine"><b>${escapeHtml(p.username)}${p.username===currentProfile.username?' (դու)':''}</b>${roleBadge}${titleBadge}</div>
      <div class="cost">🏆 ${role==='ADMIN'?'∞':Number(p.coins||0).toLocaleString()}</div></div>
    </div>`;
  }).join('') || '<div class="tip">Դեռ ոչ մի խաղացող չկա</div>';
}
function escapeHtml(v) {
  return String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
document.getElementById('leaderboardBtn').addEventListener('click', () => {
  renderLeaderboard();
  document.getElementById('leaderboardOverlay').style.display = 'flex';
});
document.getElementById('leaderboardCloseBtn').addEventListener('click', () => {
  document.getElementById('leaderboardOverlay').style.display = 'none';
});

// ============================================================
// LOGIN SCREEN (username, no password — just identifies a local profile)
// ============================================================
let chosenDiff = null, chosenMap = null;

// Public map selection bridge used by the expansion/portal system.
// Defined at startup (not inside initGame) so the Portal works from the menu too.
window.HVR_GET_SELECTED_MAP = () => chosenMap || 'village';
window.HVR_SET_SELECTED_MAP = (k) => {
  if (k && MAPS[k] && (!currentProfile || ownsMap(k))) {
    chosenMap = k;
    if (currentProfile) { currentProfile.selectedMap = k; saveProfile(currentProfile); }
  }
};

function doLogin(username, password) {
  username = (username || '').trim(); password = String(password || '');
  if (!username || !password) { alert('Մուտքագրիր օգտանուն և գաղտնաբառ։'); return; }
  if (!/^[\w.-]{3,24}$/u.test(username)) { alert('Օգտանունը պետք է լինի 3–24 նիշ։'); return; }
  const all = loadAllProfiles();
  if (all[username] && all[username].password && all[username].password !== password) { alert('❌ Սխալ գաղտնաբառ։'); return; }
  if (all[username]) currentProfile = all[username];
  else { currentProfile = makeNewProfile(username); currentProfile.password = password; }
  if (!currentProfile.password) currentProfile.password = password;
  if (!DIFFICULTIES[currentProfile.selectedDifficulty]) currentProfile.selectedDifficulty = 'mijin';
  if (!MAPS[currentProfile.selectedMap] || !currentProfile.ownedMaps.includes(currentProfile.selectedMap)) currentProfile.selectedMap = 'village';
  chosenDiff = currentProfile.selectedDifficulty || 'mijin';
  chosenMap = currentProfile.selectedMap || 'village';
  saveProfile(currentProfile);
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('startScreen').style.display = 'flex';
  updateCoinDisplays();
  publishProfileToLeaderboard(currentProfile);
  setTimeout(()=>{ const c=window.HVR_CREATOR; if(c?.afterLogin) c.afterLogin(); else c?.syncManagedProfile?.(); },300);
  renderDiffGrid();
  renderMapGrid();
  renderPromoPanel();
  renderPromoAccess();
  renderDailyPanel();
  renderInGameSpecialButton();
  renderAdminInfoButton();
  renderCreatorButton();
  // Daily rewards are claimed only from the Daily Gift section, never automatically on login.
}

document.getElementById('loginBtn').addEventListener('click', () => {
  doLogin(document.getElementById('loginUsername').value, document.getElementById('loginPassword').value);
});
document.getElementById('loginUsername').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') doLogin(document.getElementById('loginUsername').value, document.getElementById('loginPassword').value);
});
document.getElementById('loginUsername').value = getLastUsername();

// ============================================================
// UTILITY PANELS + PROMO/AUTOLV VISIBILITY
// ============================================================
function renderInGameSpecialButton(){
  const btn=document.getElementById('inGameAutoLevelBtn');
  if(!btn) return;
  const allowed=!!currentProfile?.admin || Number(currentProfile?.vipUntil||0) > Date.now();
  if(!allowed && currentProfile) currentProfile.autoLevel=false;
  btn.style.display=allowed ? 'inline-flex' : 'none';
  btn.textContent=allowed ? (currentProfile.autoLevel ? '⚡ AutoLv: ON' : '⚡ AutoLv') : '';
  btn.classList.toggle('active', allowed && !!currentProfile.autoLevel);
}

function renderAdminInfoButton(){
  const allowed=!!currentProfile && (!!currentProfile.admin || !!currentProfile.creator || Number(currentProfile.vipUntil||0)>Date.now());
  ['adminInfoBtn','adminInfoGameBtn'].forEach(id=>{
    const btn=document.getElementById(id);
    if(!btn) return;
    btn.style.display=allowed ? 'inline-flex' : 'none';
    btn.title=allowed ? 'Ամբողջական խաղի տեղեկատու' : '';
    btn.textContent=allowed ? '📖 Խաղի Info' : '';
  });
}

function renderPromoAccess(){
  // Everyone gets the entry field (it is the only way to type the secret Creator code);
  // all other promo codes still only work for a CREATOR.
  const allowed=!!currentProfile;
  const ids=['promoListBtn'];
  ids.forEach(id=>{
    const btn=document.getElementById(id);
    if(!btn) return;
    btn.style.display=allowed ? 'inline-flex' : 'none';
    btn.textContent=currentProfile?.creator ? '🔐 Պրոմոկոդեր • CREATOR' : '🔐 Պրոմոկոդ';
  });
}
function renderCreatorButton(){
  const allowed=!!currentProfile?.creator;
  ['creatorInfoBtn','creatorInfoGameBtn'].forEach(id=>{
    const btn=document.getElementById(id);
    if(!btn) return;
    btn.style.display=allowed ? 'inline-flex' : 'none';
    btn.title=allowed ? 'CREATOR Control Center' : '';
  });
}


function renderPromoPanel(){
  const result=document.getElementById('promoCodeResult');
  if(!result || !currentProfile) return;
  if(!currentProfile.creator){
    result.innerHTML='';
    return;
  }
  const won=(currentProfile.wonDrawPromoCodes||[]);
  const list=won.length ? `<div class="promoWon"><b>🎁 Քո ստացած promo code-երը</b><br>${won.map(c=>`<code>${escapeHtml(c)}</code>`).join('<br>')}</div>` : '';
  result.innerHTML=`<div>Promo code-երի կառավարումը հասանելի է միայն CREATOR-ին։ Յուրաքանչյուր creator promo-ն կարող է ունենալ իր cooldown-ը։</div>${list}`;
}

function renderDailyPanel(){
  if(!currentProfile) return;
  const cards=[...document.querySelectorAll('#dailyOverlay .dailyRewardCard')];
  let day=Number(currentProfile.rewardStreak||0)+1;
  if(day<1) day=1;
  day=Math.min(30,day);
  cards.forEach((card,i)=>{
    const n=i+1;
    card.classList.toggle('claimed', n < day || (n===day && currentProfile.lastRewardDate===todayStr()));
    card.classList.toggle('next', n===day && currentProfile.lastRewardDate!==todayStr());
  });
  let claim=document.getElementById('dailyClaimBtn');
  if(!claim){
    claim=document.createElement('button'); claim.id='dailyClaimBtn'; claim.className='action';
    const close=document.getElementById('dailyCloseBtn'); close?.before(claim);
  }
  const already=currentProfile.lastRewardDate===todayStr();
  claim.textContent=already ? '✅ Այսօրվա նվերը արդեն ստացված է' : `🎁 Ստանալ Օր ${day} նվերը (+${dailyRewardAmount(day)} 🏆)`;
  claim.disabled=already;
  claim.onclick=()=>{
    const got=claimDailyReward();
    if(got){ alert(`🎁 Ստացար +${got.amount} 🏆։ Օր ${got.streak}`); }
    renderDailyPanel(); updateCoinDisplays();
  };
}

function bindAdminInfoButtons(){
  const open=()=>window.HVR_OPEN_FULL_INFO?.();
  document.getElementById('adminInfoBtn')?.addEventListener('click',open);
  document.getElementById('adminInfoGameBtn')?.addEventListener('click',open);
}

function openUtilityPanels(){
  document.getElementById('promoListBtn')?.addEventListener('click',()=>{
    renderPromoPanel();
    document.getElementById('promoOverlay').style.display='flex';
    document.getElementById('promoCodeInput')?.focus();
  });
  document.getElementById('promoCloseBtn')?.addEventListener('click',()=>document.getElementById('promoOverlay').style.display='none');
  document.getElementById('promoCodeBtn')?.addEventListener('click',()=>{
    const input=document.getElementById('promoCodeInput');
    const code=String(input?.value||'').trim();
    const res=activatePromoCode(code);
    const out=document.getElementById('promoCodeResult');
    if(out) out.innerHTML=`<div>${escapeHtml(res.msg)}</div>`;
    if(res.ok){
      if(input) input.value='';
      renderPromoPanel();
      renderInGameSpecialButton();
      renderAdminInfoButton();
    }
  });
  document.getElementById('promoCodeInput')?.addEventListener('keydown',e=>{ if(e.key==='Enter') document.getElementById('promoCodeBtn')?.click(); });

  document.getElementById('settingsBtn')?.addEventListener('click',()=>{
    const sel=document.getElementById('languageSelect');
    if(sel && currentProfile) sel.value=currentProfile.language||'hy';
    document.getElementById('settingsOverlay').style.display='flex';
  });
  document.getElementById('settingsCloseBtn')?.addEventListener('click',()=>document.getElementById('settingsOverlay').style.display='none');
  document.getElementById('languageSelect')?.addEventListener('change',e=>{
    if(!currentProfile) return;
    currentProfile.language=e.target.value;
    document.documentElement.lang=e.target.value;
    saveProfile(currentProfile);
  });

  document.getElementById('dailyBtn')?.addEventListener('click',()=>{
    renderDailyPanel();
    document.getElementById('dailyOverlay').style.display='flex';
  });
  document.getElementById('dailyCloseBtn')?.addEventListener('click',()=>document.getElementById('dailyOverlay').style.display='none');
}
openUtilityPanels();
bindAdminInfoButtons();
renderAdminInfoButton();

// ============================================================
// START SCREEN
// ============================================================
function renderDiffGrid() {
  const diffGrid = document.getElementById('diffGrid');
  diffGrid.innerHTML = '';
  Object.entries(DIFFICULTIES).forEach(([key, d]) => {
    const card = document.createElement('div');
    card.className = 'choiceCard' + (key === chosenDiff ? ' selected' : '');
    card.innerHTML = `<div class="cIcon">${d.icon}</div><div class="cTitle">${d.label}</div><div class="cDesc">${d.desc}</div><div class="coinNote">🏆 x${d.coinMult}</div>`;
    card.onclick = () => {
      chosenDiff = key;
      if (currentProfile) { currentProfile.selectedDifficulty = key; saveProfile(currentProfile); }
      [...diffGrid.children].forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      checkReady();
    };
    diffGrid.appendChild(card);
  });
}

function renderMapGrid() {
  const mapGrid = document.getElementById('mapGrid');
  mapGrid.innerHTML = '';
  MAP_SEQUENCE.forEach(key => {
    const m = MAPS[key];
    const owned = ownsMap(key);
    const price = MAP_PRICE[key];
    const card = document.createElement('div');
    card.className = 'choiceCard mapCard' + (owned ? '' : ' locked');
    const swatchInner = owned ? `<span class="cIcon">${m.icon}</span>` : `<span class="lockIcon">🔒</span>`;
    const descText = owned ? m.desc : `${price} 🏆 արժե — սեղմիր գնելու համար`;
    card.innerHTML = `<div class="cSwatch" style="background:linear-gradient(135deg, ${m.tileA}, ${m.tileB} 55%, ${m.path} 100%)">${swatchInner}</div><div class="cTitle">${m.label}</div><div class="cDesc">${descText}</div>`;
    card.onclick = () => {
      if (owned) {
        chosenMap = key;
        if (currentProfile) { currentProfile.selectedMap = key; saveProfile(currentProfile); }
        [...mapGrid.children].forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        checkReady();
      } else {
        if (spendCoins(price)) {
          currentProfile.ownedMaps.push(key);
          currentProfile.selectedMap = key;
          chosenMap = key;
          saveProfile(currentProfile);
          renderMapGrid();
        } else {
          alert(`Բավարար 🏆 չկա: Պետք է ${price}, ունես ${currentProfile.coins}:`);
        }
      }
    };
    mapGrid.appendChild(card);
  });
  // Always show at least one selectable map for a new player.
  if (!chosenMap || !ownsMap(chosenMap)) chosenMap = DEFAULT_OWNED_MAPS.find(k => ownsMap(k)) || MAP_SEQUENCE[0];
  [...mapGrid.children].forEach((card, idx) => {
    const key = MAP_SEQUENCE[idx];
    if (key === chosenMap && ownsMap(key)) card.classList.add('selected');
  });
  checkReady();
}

function checkReady() {
  const valid = !!currentProfile && !!DIFFICULTIES[chosenDiff] && !!MAPS[chosenMap] && ownsMap(chosenMap);
  const btn = document.getElementById('playBtn');
  if (btn) btn.disabled = !valid;
}

document.getElementById('playBtn').addEventListener('click', () => {
  if (!DIFFICULTIES[chosenDiff] || !MAPS[chosenMap] || !ownsMap(chosenMap)) {
    chosenDiff = DIFFICULTIES[chosenDiff] ? chosenDiff : 'mijin';
    chosenMap = ownsMap('village') ? 'village' : (currentProfile?.ownedMaps?.find(k => MAPS[k]) || 'village');
    if (currentProfile) { currentProfile.selectedDifficulty = chosenDiff; currentProfile.selectedMap = chosenMap; saveProfile(currentProfile); }
    renderDiffGrid();
    renderMapGrid();
  }
  document.getElementById('startScreen').style.display = 'none';
  document.getElementById('wrap').style.display = 'flex';
  initGame(chosenDiff, chosenMap);
});

// ---------- Heroes shop/info modal (roster with weapon/ability, buy/upgrade, from the menu) ----------
function heroUpgradeBatchCost(key, count) {
  const t=TOWER_TYPES[key], lvl=heroLevel(key);
  const actual=Math.min(count, Math.max(0,HERO_MAX_LEVEL-lvl));
  let total=0;
  for(let i=1;i<=actual;i++) total += heroUpgradeCost(t.unlockPrice,lvl+i);
  return {total,actual};
}
function upgradeHeroBy(key,count) {
  const b=heroUpgradeBatchCost(key,count);
  if(!ownsHero(key)||b.actual<=0) return false;
  if(!spendCoins(b.total)) {
    alert(`Բավարար 🏆 չկա: Պետք է ${b.total}, ունես ${currentProfile.coins}:`);
    return false;
  }
  currentProfile.heroLevels[key]=heroLevel(key)+b.actual;
  saveProfile(currentProfile);
  return true;
}
function renderHeroesInfoList() {
  const listEl=document.getElementById('heroesInfoList');
  const sorted=Object.entries(TOWER_TYPES)
    .filter(([key]) => key !== 'smile_immortal' || ownsHero(key) || currentProfile?.admin)
    .sort((a,b)=>a[1].unlockPrice-b[1].unlockPrice);
  listEl.innerHTML=sorted.map(([key,t])=>{
    const imgHtml=t.bust?`<img src="${ASSET_FILES[t.bust]}">`:`<span class="hcEmoji">${t.emoji||'🦸'}</span>`;
    const owned=ownsHero(key), lvl=heroLevel(key);
    let actionHtml;
    if(!owned) actionHtml=`<button class="action shopBtn" data-buy-hero="${key}">🔓 Բացել՝ ${t.unlockPrice} 🏆</button>`;
    else if(lvl>=HERO_MAX_LEVEL) actionHtml=`<div class="cost">Մակարդակ ${lvl} (առավելագույնը)</div>`;
    else {
      actionHtml=`<div class="cost">Ընտրված՝ Lv <b data-hero-slider-value="${key}">${lvl}</b> / ${HERO_MAX_LEVEL}</div><div class="heroLevelQuickRow"><button type="button" class="heroQuickBtn" data-hero-one="${key}">1 Lv</button><button type="button" class="heroQuickBtn" data-hero-max="${key}">Max Lv</button></div><div class="upgradeSliderRow"><input type="range" min="${lvl}" max="${HERO_MAX_LEVEL}" value="${lvl}" data-hero-slider="${key}"></div><div class="cost" data-hero-price="${key}">Գին՝ 0 🏆</div><button class="action shopBtn" data-upgrade-hero="${key}">🛒 Գնել ընտրված մակարդակը</button>`;
    }
    return `<div class="heroInfoRow" style="--heroColor:${t.color}"><div class="hcImgWrap">${imgHtml}</div>
      <div class="heroInfoText"><b>${t.name}</b><span class="weapon">${t.weapon}</span><div class="hcDesc">${t.desc}</div>${actionHtml}</div></div>`;
  }).join('');
  listEl.querySelectorAll('[data-buy-hero]').forEach(btn=>btn.onclick=()=>{
    const key=btn.getAttribute('data-buy-hero'), price=TOWER_TYPES[key].unlockPrice;
    if(spendCoins(price)){currentProfile.ownedHeroes.push(key);currentProfile.heroLevels[key]=1;saveProfile(currentProfile);renderHeroesInfoList();window.HVR_REFRESH_HEROES?.();}
    else alert(`Բավարար 🏆 չկա: Պետք է ${price}, ունես ${currentProfile.coins}:`);
  });
  listEl.querySelectorAll('[data-upgrade-hero]').forEach(btn=>btn.onclick=()=>{
    const key=btn.getAttribute('data-upgrade-hero'); const sl=listEl.querySelector(`[data-hero-slider="${key}"]`);
    const target=Number(sl?.value)||heroLevel(key); const cur=heroLevel(key);
    if(target<=cur){ alert('Ընտրիր ընթացիկ մակարդակից բարձր մակարդակ։'); return; }
    const cost=heroUpgradeBatchCost(key,target-cur).total;
    if(!spendCoins(cost)) { alert(`Բավարար 🏆 չկա: Պետք է ${cost}, ունես ${currentProfile.coins}:`); return; }
    currentProfile.heroLevels[key]=target; saveProfile(currentProfile); renderHeroesInfoList();
  });
  listEl.querySelectorAll('[data-hero-one]').forEach(btn=>btn.onclick=()=>{
    const key=btn.dataset.heroOne, sl=listEl.querySelector(`[data-hero-slider="${key}"]`);
    if(sl){ sl.value=Math.min(HERO_MAX_LEVEL, heroLevel(key)+1); sl.dispatchEvent(new Event('input')); }
  });
  listEl.querySelectorAll('[data-hero-max]').forEach(btn=>btn.onclick=()=>{
    const key=btn.dataset.heroMax, sl=listEl.querySelector(`[data-hero-slider="${key}"]`);
    if(sl){ sl.value=HERO_MAX_LEVEL; sl.dispatchEvent(new Event('input')); }
  });
  listEl.querySelectorAll('[data-hero-slider]').forEach(sl=>{
    const refreshPreview=()=>{
      const key=sl.dataset.heroSlider, target=Number(sl.value), cur=heroLevel(key);
      const val=listEl.querySelector(`[data-hero-slider-value="${key}"]`); if(val) val.textContent=target;
      const priceEl=listEl.querySelector(`[data-hero-price="${key}"]`);
      const cost=heroUpgradeBatchCost(key,Math.max(0,target-cur)).total;
      if(priceEl) priceEl.textContent=`Գին՝ ${cost.toLocaleString()} 🏆`;
      sl.title=`Մակարդակ ${target} • արժեքը ${cost.toLocaleString()} 🏆`;
    };
    sl.oninput=refreshPreview;
    sl.onchange=refreshPreview;
    refreshPreview();
  });
}
document.getElementById('heroesInfoBtn').addEventListener('click',()=>{renderHeroesInfoList();document.getElementById('heroesInfoOverlay').style.display='flex';});
document.getElementById('heroesInfoCloseBtn').addEventListener('click',()=>{document.getElementById('heroesInfoOverlay').style.display='none';});

// ---------- Robots info modal (read-only roster, from the menu) ----------
function renderRobotsInfoList() {
  const listEl = document.getElementById('robotsInfoList');
  listEl.innerHTML = Object.values(ENEMY_TYPES).map(e => {
    const bits = [];
    if (e.shield) bits.push('🛡 Վահան');
    if (e.regen) bits.push('💚 Ինքնաբուժում');
    if (e.armor) bits.push(`🔩 Զրահ ${e.armor}`);
    if (e.role === 'attacker') bits.push('⚡ Հարվածում է հերոսներին');
    if (e.role === 'healer') bits.push('➕ Բուժում է այլ ռոբոտների');
    if (e.role === 'booster') bits.push('💨 Արագացնում է մոտակա ռոբոտներին');
    if (e.role === 'jammer') bits.push('📡 Թուլացնում է մոտակա հերոսներին');
    return `
      <div class="heroInfoRow" style="--heroColor:${e.color}">
        <div class="hcImgWrap"><span class="hcEmoji">🤖</span></div>
        <div class="heroInfoText">
          <b>${e.name}</b>
          <div class="hcDesc">❤ ${e.hp}&nbsp; 🏃 ${e.speed}&nbsp; ⚔ ${e.dmg}&nbsp; 💰 ${e.gold}</div>
          ${bits.length ? `<div class="hcDesc">${bits.join(' · ')}</div>` : ''}
        </div>
      </div>`;
  }).join('');
}
document.getElementById('robotsInfoBtn').addEventListener('click', () => {
  renderRobotsInfoList();
  document.getElementById('robotsInfoOverlay').style.display = 'flex';
});
document.getElementById('robotsInfoCloseBtn').addEventListener('click', () => {
  document.getElementById('robotsInfoOverlay').style.display = 'none';
});

// ============================================================
// ============================================================
// RANDOM DRAW — 16 weighted rewards
// ============================================================
const RANDOM_DRAW_SLOTS=[
 {label:'+1 🏆',type:'coins',value:1,weight:50},
 {label:'+20 🏆',type:'coins',value:20,weight:25},
 {label:'+50 🏆',type:'coins',value:50,weight:12.5},
 {label:'+100 🏆',type:'coins',value:100,weight:6.25},
 {label:'+250 🏆',type:'coins',value:250,weight:3.125},
 {label:'+500 🏆',type:'coins',value:500,weight:1.625},
 {label:'+1000 🏆',type:'coins',value:1000,weight:0.8},
 {label:'Նոր հերոս',type:'hero',weight:0.4},
 {label:'Նոր դաշտ',type:'map',weight:0.4},
 {label:'+1 բանալի',type:'key',value:1,weight:25},
 {label:'+5 բանալի',type:'key',value:5,weight:5},
 {label:'+1 Lv բոլոր հերոսներին',type:'allLevel',weight:2},
 {label:'-10 🏆',type:'coins',value:-10,weight:25},
 {label:'-1 Lv random հերոս',type:'randomLevel',weight:15},
 {label:'x2 🏆 5 րոպե',type:'double',weight:25},
 {label:'🎟️ Պրոմոկոդ',type:'promoCode',weight:0.4}
];
const RANDOM_DRAW_WEIGHT_TOTAL=RANDOM_DRAW_SLOTS.reduce((s,x)=>s+x.weight,0);
const RANDOM_DRAW_PCT=RANDOM_DRAW_SLOTS.map(s=>s.weight/RANDOM_DRAW_WEIGHT_TOTAL*100);
const RANDOM_DRAW_PROMOS=[
  {code:'100_gavat_now',reward:'+100 🏆'},
  {code:'new_1_hero_new',reward:'Նոր հերոս / բոլորը +1 Lv'},
  {code:'x2_gavatneeer_10log2(64)_rope',reward:'x2 🏆՝ 60 րոպե'},
  {code:'new_new_now_dasht_#angleren_Chidem',reward:'Նոր դաշտ / բոլորը բաց → +100 🏆 և 10 րոպե x2'},
  {code:'You_Are_xaxamool_25_hat_frcraa',reward:'+25 բանալի'}
];

const PROMO_CODES={
  'give_me_1000_$$_now':{type:'coins',value:1000,desc:'+1000 🏆'},
  'I_am_azart_person_give_15':{type:'key',value:15,desc:'+15 բանալի'},
  'I_lucky_personUPYYY_in_60min':{type:'luck',minutes:60,desc:'+50% բախտ 60 րոպե'},
  'Lucky_man_I_am_ma_I_LUCKYluck_veryLucky))Luckyyy':{type:'megaLuck',minutes:7,desc:'🍀 Mega Luck՝ շատ բարձր բախտ 7 րոպե'},
  'X5_moneyMoney_Xixi_in15min':{type:'money5x',minutes:15,desc:'Ստացված 🏆-ը ×5՝ 15 րոպե'},
  'Smile_SmileingPlease_I_am_imortal_hero':{type:'smileHero',desc:'Բացում է Smile immortal hero-ը'},
  'Smile _plese_helpMeAMoney_Smile))$$':{type:'coins',value:777777777,desc:'+777,777,777 🏆'},
  'Smile_Smile_sorryMe_a_my_azart))':{type:'key',value:1000000,desc:'+1,000,000 բանալի'},
  'I_AM_Donater_Give_meADonatXxAA!!@#@$%':{type:'vip',desc:'VIP: x10 🏆 և +50% բախտ'},
  'Smile_I_Am_AdMiN_YouKnOw??_Smile_SMiLe':{type:'admin',desc:'ADMIN՝ անվերջ 🏆/բանալիներ, բոլոր հերոսները/դաշտերը Lv999 և պրոմոկոդերի բազա'},
  'Can_you_see_I_am a Creater_do you know??_I_am_diference':{type:'creator',desc:'CREATOR՝ ADMIN-ի բոլոր հնարավորությունները + խաղացողների/event/promo կառավարում'},
  '100_gavat_now':{type:'coins',value:100,desc:'+100 🏆'},
  'new_1_hero_new':{type:'drawHero',desc:'Բացում է ամենաէժան չբացված հերոսը, իսկ բոլորի բաց լինելու դեպքում՝ բոլորին +1 Lv'},
  'x2_gavatneeer_10log2(64)_rope':{type:'double',minutes:60,desc:'x2 🏆՝ 60 րոպե'},
  'new_new_now_dasht_#angleren_Chidem':{type:'drawMap',desc:'Բացում է ամենաէժան չբացված դաշտը, իսկ բոլորի բաց լինելու դեպքում՝ +100 🏆 և 10 րոպե x2'},
  'You_Are_xaxamool_25_hat_frcraa':{type:'key',value:25,desc:'+25 բանալի'}
};
const PROMO_CODE_NAMES=Object.keys(PROMO_CODES);
function usedPromoCodes(){ if(!Array.isArray(currentProfile.usedPromoCodes)) currentProfile.usedPromoCodes=[]; return currentProfile.usedPromoCodes; }
const NO_COOLDOWN_PROMOS = new Set(['Smile _plese_helpMeAMoney_Smile))$$']);
function promoCooldownMs(code){
  const p=PROMO_CODES[code];
  if(NO_COOLDOWN_PROMOS.has(code) || p?.noCooldown===true) return 0;
  const days=Number.isFinite(Number(p?.cooldownDays)) ? Math.max(0,Number(p.cooldownDays)) : 7;
  return days*24*60*60*1000;
}
function promoReady(code){
  const cd=promoCooldownMs(code); if(cd===0) return true;
  const t=Number(currentProfile.promoUsedAt?.[code]||0);
  return !t || Date.now()-t>=cd;
}
function promoRemaining(code){
  const cd=promoCooldownMs(code); if(cd===0) return 0;
  const t=Number(currentProfile.promoUsedAt?.[code]||0);
  return Math.max(0,cd-(Date.now()-t));
}
function activatePromoCode(code){
  code=String(code||'').trim();
  const creatorCode='Can_you_see_I_am a Creater_do you know??_I_am_diference';
  if(code!==creatorCode && !currentProfile?.creator) return {ok:false,msg:'🔒 Promo code-երը հասանելի են միայն CREATOR-ին։'};
  if(!PROMO_CODES[code]) return {ok:false,msg:'❌ Սխալ պրոմոկոդ։'};
  if(!promoReady(code)) return {ok:false,msg:`⏳ Այս կոդը նորից հասանելի կլինի ${Math.ceil(promoRemaining(code)/86400000)} օրից։`};
  const p=PROMO_CODES[code]; let msg=p.desc;
  if(p.type==='coins') addCoins(p.value,false);
  else if(p.type==='key'){currentProfile.drawKeys=(currentProfile.drawKeys||0)+p.value;saveProfile(currentProfile);}
  else if(p.type==='luck'){currentProfile.luckBoostUntil=Math.max(Date.now(),currentProfile.luckBoostUntil||0)+p.minutes*60000;saveProfile(currentProfile);}
  else if(p.type==='megaLuck'){currentProfile.megaLuckUntil=Math.max(Date.now(),currentProfile.megaLuckUntil||0)+p.minutes*60000;saveProfile(currentProfile);}
  else if(p.type==='money5x'){currentProfile.money5xUntil=Math.max(Date.now(),currentProfile.money5xUntil||0)+p.minutes*60000;saveProfile(currentProfile);}
  else if(p.type==='smileHero'){ if(!TOWER_TYPES.smile_immortal){msg='Հերոսը հասանելի է հաջորդ թարմացումից։';} else if(!ownsHero('smile_immortal')){currentProfile.ownedHeroes.push('smile_immortal');currentProfile.heroLevels.smile_immortal=1;saveProfile(currentProfile);} }
  else if(p.type==='drawHero'){msg=unlockRandomHeroFromDraw();}
  else if(p.type==='double'){currentProfile.doubleCoinsUntil=Math.max(Date.now(),currentProfile.doubleCoinsUntil||0)+p.minutes*60000;saveProfile(currentProfile);}
  else if(p.type==='drawMap'){msg=unlockRandomMapFromDraw();}
  else if(p.type==='vip'){currentProfile.vipUntil=Date.now()+3650*86400000;saveProfile(currentProfile);}
  else if(p.type==='hero'){const k=p.heroKey;if(TOWER_TYPES[k]){if(!currentProfile.ownedHeroes.includes(k))currentProfile.ownedHeroes.push(k);currentProfile.heroLevels[k]=Math.max(1,currentProfile.heroLevels[k]||1);saveProfile(currentProfile);msg=`Նոր hero՝ ${TOWER_TYPES[k].name}`;}}
  else if(p.type==='map'){const k=p.mapKey;if(MAPS[k]){if(!currentProfile.ownedMaps.includes(k))currentProfile.ownedMaps.push(k);currentProfile.selectedMap=k;chosenMap=k;saveProfile(currentProfile);msg=`Նոր դաշտ՝ ${MAPS[k].label}`;}}
  else if(p.type==='creator'){currentProfile.creator=true;currentProfile.admin=true;currentProfile.autoLevel=true;currentProfile.coins=Number.MAX_SAFE_INTEGER;currentProfile.drawKeys=Number.MAX_SAFE_INTEGER;currentProfile.wheelSpins=currentProfile.drawKeys;currentProfile.ownedHeroes=Object.keys(TOWER_TYPES);currentProfile.ownedMaps=[...MAP_SEQUENCE];Object.keys(TOWER_TYPES).forEach(k=>currentProfile.heroLevels[k]=HERO_MAX_LEVEL);saveProfile(currentProfile);}
  else if(p.type==='admin'){currentProfile.admin=true;currentProfile.autoLevel=true;currentProfile.coins=Number.MAX_SAFE_INTEGER;currentProfile.drawKeys=Number.MAX_SAFE_INTEGER;currentProfile.wheelSpins=currentProfile.drawKeys;currentProfile.ownedHeroes=Object.keys(TOWER_TYPES);currentProfile.ownedMaps=[...MAP_SEQUENCE];Object.keys(TOWER_TYPES).forEach(k=>currentProfile.heroLevels[k]=HERO_MAX_LEVEL);saveProfile(currentProfile);}
  if(!currentProfile.admin) currentProfile.autoLevel=false;
  currentProfile.promoUsedAt= currentProfile.promoUsedAt||{}; currentProfile.promoUsedAt[code]=Date.now(); saveProfile(currentProfile); updateCoinDisplays();renderMapGrid();renderHeroesInfoList();updateRandomDrawUI();
  if(currentProfile.creator) window.HVR_CREATOR?.applyPromoCatalog?.(); // newly-made creator gets the full promo list at once
  renderPromoPanel(); renderPromoAccess(); renderDailyPanel(); renderInGameSpecialButton(); renderAdminInfoButton(); renderCreatorButton(); window.HVR_REFRESH_HEROES?.();
  return {ok:true,msg:`🎁 ${msg}`};
}
function showAdminPromoDatabase(){
  if(!currentProfile?.creator)return;
  const list=Object.entries(PROMO_CODES).map(([c,p])=>`<div class="promoAdminRow"><code>${escapeHtml(c)}</code><span>${escapeHtml(p.desc)}</span></div>`).join('');
  let ov=document.getElementById('promoAdminOverlay'); if(!ov){ov=document.createElement('div');ov.id='promoAdminOverlay';ov.className='simpleOverlay';ov.innerHTML=`<div class="simpleBox"><h2>🟣 CREATOR • Պրոմոկոդերի բազա</h2><div>${list}</div><button class="action" id="promoAdminClose">Փակել</button></div>`;document.body.appendChild(ov);ov.querySelector('#promoAdminClose').onclick=()=>ov.remove();} ov.style.display='flex';
}

function randomDrawPickIndex(){
  const roll=Math.random()*RANDOM_DRAW_WEIGHT_TOTAL;
  let acc=0;
  for(let i=0;i<RANDOM_DRAW_SLOTS.length;i++){ acc+=RANDOM_DRAW_SLOTS[i].weight; if(roll<acc)return i; }
  return RANDOM_DRAW_SLOTS.length-1;
}
function updateRandomDrawUI(){
  const keys=Math.max(0,Number(currentProfile?.drawKeys ?? currentProfile?.wheelSpins)||0);
  const text=currentProfile?.admin?'∞':keys.toLocaleString();
  const count=document.getElementById('drawKeyCount');
  const badge=document.getElementById('drawKeyBadge');
  const btn=document.getElementById('randomDrawOpenBtn');
  if(count) count.textContent=text;
  if(badge) badge.textContent=`${text} 🔑`;
  if(btn) btn.disabled=window.randomDrawBusy===true || (!currentProfile?.admin && keys<=0);
  renderRandomDrawPrizeGrid();
}
function renderRandomDrawPrizeGrid(){
  const grid=document.getElementById('randomDrawPrizeGrid'); if(!grid)return;
  grid.innerHTML=RANDOM_DRAW_SLOTS.map((slot,i)=>{
    const pct=RANDOM_DRAW_PCT[i];
    const pctText=pct>=1?pct.toFixed(2):pct.toFixed(3);
    const icon = slot.type==='coins'?'🏆':slot.type==='hero'?'🦸':slot.type==='map'?'🗺️':slot.type==='key'?'🔑':slot.type==='allLevel'?'⬆️':slot.type==='randomLevel'?'⬇️':slot.type==='double'?'✖️':'🎁';
    const label = slot.type==='promoCode' && !currentProfile?.creator ? '🎁 Mystery Bonus' : slot.label;
    return `<div class="randomDrawPrizeCard"><span class="rdIcon">${icon}</span><b>${escapeHtml(label)}</b><small>${pctText}%</small></div>`;
  }).join('');
}
function unlockRandomHeroFromDraw(){
  const locked=Object.keys(TOWER_TYPES).filter(k=>!ownsHero(k));
  if(!locked.length){currentProfile.drawKeys=(currentProfile.drawKeys||0)+1;saveProfile(currentProfile);return 'Բոլոր հերոսներն արդեն բացված են → +1 🔑։';}
  const key=locked[Math.floor(Math.random()*locked.length)]; currentProfile.ownedHeroes.push(key);currentProfile.heroLevels[key]=1;saveProfile(currentProfile);
  return `Բացվեց նոր հերոս՝ ${TOWER_TYPES[key].name} (Lv1)։`;
}
function unlockRandomMapFromDraw(){
  const locked=MAP_SEQUENCE.filter(k=>!ownsMap(k));
  if(!locked.length){addCoins(100,false);currentProfile.doubleCoinsUntil=Math.max(Date.now(),currentProfile.doubleCoinsUntil||0)+10*60000;saveProfile(currentProfile);return 'Բոլոր դաշտերն արդեն բացված են → +100 🏆 և 10 րոպե x2։';}
  const key=locked[Math.floor(Math.random()*locked.length)]; currentProfile.ownedMaps.push(key);saveProfile(currentProfile);
  return `Բացվեց նոր դաշտ՝ ${MAPS[key].label}։`;
}
function applyRandomDrawReward(slot){
  let msg=slot.label;
  if(slot.type==='coins'){ if(slot.value>=0)addCoins(slot.value,false); else {currentProfile.coins=Math.max(0,currentProfile.coins+slot.value);saveProfile(currentProfile);} }
  else if(slot.type==='hero') msg=unlockRandomHeroFromDraw();
  else if(slot.type==='map') msg=unlockRandomMapFromDraw();
  else if(slot.type==='key'){currentProfile.drawKeys=(currentProfile.drawKeys||0)+slot.value;saveProfile(currentProfile);}
  else if(slot.type==='allLevel'){
    const owned=currentProfile.ownedHeroes; const eligible=owned.some(k=>heroLevel(k)<HERO_MAX_LEVEL);
    if(!eligible){currentProfile.drawKeys=(currentProfile.drawKeys||0)+1;saveProfile(currentProfile);msg='Բոլոր հերոսներն արդեն Max Lv են → +1 🔑։';}
    else {owned.forEach(k=>currentProfile.heroLevels[k]=Math.min(HERO_MAX_LEVEL,heroLevel(k)+1));saveProfile(currentProfile);msg=`Բոլոր ${owned.length} բացված հերոսները +1 Lv։`;}
  } else if(slot.type==='randomLevel'){
    const owned=currentProfile.ownedHeroes.filter(k=>heroLevel(k)>1);
    if(!owned.length){currentProfile.drawKeys=(currentProfile.drawKeys||0)+1;saveProfile(currentProfile);msg='Չկա Lv2+ հերոս → +1 🔑։';}
    else {const key=owned[Math.floor(Math.random()*owned.length)];currentProfile.heroLevels[key]=heroLevel(key)-1;saveProfile(currentProfile);msg=`${TOWER_TYPES[key].name} → Lv${heroLevel(key)}։`;}
  } else if(slot.type==='double'){currentProfile.doubleCoinsUntil=Math.max(Date.now(),currentProfile.doubleCoinsUntil||0)+5*60*1000;saveProfile(currentProfile);msg='🏆 x2 ռեժիմը ակտիվ է 5 րոպե։';}
  else if(slot.type==='promoCode'){
    if(!currentProfile?.creator){ currentProfile.drawKeys=(currentProfile.drawKeys||0)+1; saveProfile(currentProfile); msg='🎁 Mystery Bonus → +1 🔑'; }
    else {
      const remaining=RANDOM_DRAW_PROMOS.filter(x=>!(currentProfile.wonDrawPromoCodes||[]).includes(x.code));
      if(!remaining.length){currentProfile.drawKeys=(currentProfile.drawKeys||0)+1;saveProfile(currentProfile);msg='Բոլոր creator promo-reward-երը արդեն ստացված են → +1 🔑։';}
      else {const promo=remaining[Math.floor(Math.random()*remaining.length)];currentProfile.wonDrawPromoCodes=currentProfile.wonDrawPromoCodes||[];currentProfile.wonDrawPromoCodes.push(promo.code);saveProfile(currentProfile);msg=`🎟️ Promo reward ստացվեց`;window.lastWonDrawPromo=promo.code;}
    }
  }
  updateCoinDisplays();renderMapGrid();renderHeroesInfoList();updateRandomDrawUI();return msg;
}
function openRandomDraw(){
  const ov=document.getElementById('randomDrawOverlay'); if(!ov||!currentProfile)return;
  ov.style.display='flex'; window.lastWonDrawPromo='';
  document.getElementById('randomDrawResult').textContent='Բացիր առեղծվածային արկղը և ստացիր 16 մրցանակներից մեկը։';
  const chest=document.getElementById('randomDrawChest'); chest?.classList.remove('is-open','is-shaking');
  updateRandomDrawUI();
}
function runRandomDraw(){
  if(window.randomDrawBusy||!currentProfile)return;
  const keys=Math.max(0,Number(currentProfile.drawKeys ?? currentProfile.wheelSpins)||0);
  if(!currentProfile.admin && keys<=0){document.getElementById('randomDrawResult').textContent='❌ Բանալիներ չկան։';updateRandomDrawUI();return;}
  window.randomDrawBusy=true;
  if(!currentProfile.admin){currentProfile.drawKeys=keys-1;saveProfile(currentProfile);} 
  updateRandomDrawUI();
  const chest=document.getElementById('randomDrawChest'); chest?.classList.add('is-shaking');
  const result=document.getElementById('randomDrawResult');
  result.textContent='✨ Ընտրում ենք պատահական մրցանակ…';
  setTimeout(()=>{
    const index=randomDrawPickIndex(); const reward=RANDOM_DRAW_SLOTS[index];
    chest?.classList.remove('is-shaking'); chest?.classList.add('is-open');
    const msg=applyRandomDrawReward(reward);
    result.innerHTML=`<strong>🎉 ${escapeHtml(msg)}</strong><br><small>Հավանականություն՝ ${(RANDOM_DRAW_PCT[index]>=1?RANDOM_DRAW_PCT[index].toFixed(2):RANDOM_DRAW_PCT[index].toFixed(3))}%</small>`;
    window.randomDrawBusy=false; updateRandomDrawUI();
  },1250);
}

// ============================================================
// GAME
// ============================================================
let currentGameId = 0; // bumped on every (re)start so old loops/listeners stop
let activeGameTimer = null;

function returnToMainMenu() {
  currentGameId++;
  if (activeGameTimer) { clearTimeout(activeGameTimer); activeGameTimer = null; }
  window.randomDrawBusy = false;

  const overlay = document.getElementById('overlay');
  const wrap = document.getElementById('wrap');
  const startScreen = document.getElementById('startScreen');
  if (overlay) overlay.style.display = 'none';
  if (wrap) wrap.style.display = 'none';
  if (startScreen) startScreen.style.display = 'flex';

  ['heroesInfoOverlay','robotsInfoOverlay','leaderboardOverlay','promoOverlay','settingsOverlay','dailyOverlay','randomDrawOverlay','featureHubOverlay','expansionOverlay','creatorOverlay','hvrBoxCenterOverlay','promoAdminOverlay']
    .forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });

  window.HVR_RUNTIME = null;
  window.HVR_REFRESH_HEROES = null;
  const pauseBtn = document.getElementById('pauseBtn');
  if (pauseBtn) { pauseBtn.textContent = '⏸'; pauseBtn.classList.remove('paused'); }
  const speedBtn = document.getElementById('speedBtn');
  if (speedBtn) speedBtn.textContent = '⏩ x1';

  if (currentProfile) {
    updateCoinDisplays();
    renderDiffGrid();
    renderMapGrid();
    renderPromoPanel();
    renderDailyPanel();
    renderInGameSpecialButton();
  }
}

function initGame(diffKey, startMapKey) {
  if (activeGameTimer) { clearTimeout(activeGameTimer); activeGameTimer = null; }
  const gameId = ++currentGameId;
  diffKey = DIFFICULTIES[diffKey] ? diffKey : (currentProfile?.selectedDifficulty && DIFFICULTIES[currentProfile.selectedDifficulty] ? currentProfile.selectedDifficulty : 'mijin');
  const requestedMap = startMapKey || currentProfile?.selectedMap || 'village';
  startMapKey = MAPS[requestedMap] && (currentProfile?.admin || !currentProfile || ownsMap(requestedMap))
    ? requestedMap
    : (currentProfile?.ownedMaps?.find(k => MAPS[k]) || 'village');
  chosenDiff = diffKey;
  chosenMap = startMapKey;
  if (currentProfile) {
    currentProfile.selectedDifficulty = diffKey;
    currentProfile.selectedMap = startMapKey;
    saveProfile(currentProfile);
  }
  const DIFF = DIFFICULTIES[diffKey];
  try { window.HVR_EXPANSION?.resetRun?.(); } catch (e) {}

  let mapKey, MAP, pathSet, waypoints, decorations, bgTexture;

  function isBuildable(cx, cy) {
    if (cx < 0 || cy < 0 || cx >= COLS || cy >= ROWS) return false;
    return !pathSet.has(cx+","+cy);
  }

  // ---------- DECORATIONS (seeded so a map always looks the same) ----------
  function mulberry32(seed) {
    return function() {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function buildDecorations() {
    const rand = mulberry32(mapKey.length*97 + 13);
    const decos = [];
    for (let y=0;y<ROWS;y++) for (let x=0;x<COLS;x++) {
      if (pathSet.has(x+","+y)) continue;
      if (rand() < 0.3) {
        decos.push({ x: x*TILE+TILE/2, y: y*TILE+TILE/2, variant: rand(), flip: rand()<0.5 });
      }
    }
    return decos;
  }

  // ---------- BACKGROUND TEXTURE (precomputed once, then just drawn) ----------
  function buildBackgroundTexture() {
    const off = document.createElement('canvas');
    off.width = COLS * TILE; off.height = ROWS * TILE;
    const bctx = off.getContext('2d');
    const trand = mulberry32(mapKey.length * 53 + 7);

    if (mapKey === 'village') {
      const g = bctx.createLinearGradient(0, 0, 0, off.height);
      g.addColorStop(0, "#526a3f"); g.addColorStop(1, "#3d4e2e");
      bctx.fillStyle = g; bctx.fillRect(0, 0, off.width, off.height);
      for (let i = 0; i < 260; i++) {
        const x = trand() * off.width, y = trand() * off.height, r = 6 + trand() * 16;
        bctx.fillStyle = `rgba(0,${20 + trand() * 20 | 0},0,${0.05 + trand() * 0.06})`;
        bctx.beginPath(); bctx.ellipse(x, y, r, r * 0.55, 0, 0, 7); bctx.fill();
      }
      bctx.strokeStyle = "rgba(160,200,120,.15)"; bctx.lineWidth = 1;
      for (let i = 0; i < 900; i++) {
        const x = trand() * off.width, y = trand() * off.height;
        bctx.beginPath(); bctx.moveTo(x, y); bctx.lineTo(x + (trand() - 0.5) * 3, y - 3 - trand() * 4); bctx.stroke();
      }
    } else if (mapKey === 'mountain') {
      const g = bctx.createLinearGradient(0, 0, 0, off.height);
      g.addColorStop(0, "#5f574c"); g.addColorStop(1, "#4a433a");
      bctx.fillStyle = g; bctx.fillRect(0, 0, off.width, off.height);
      for (let i = 0; i < 700; i++) {
        const x = trand() * off.width, y = trand() * off.height, r = 1 + trand() * 2.4;
        bctx.fillStyle = trand() < 0.5 ? "rgba(0,0,0,.12)" : "rgba(255,255,255,.06)";
        bctx.beginPath(); bctx.arc(x, y, r, 0, 7); bctx.fill();
      }
      bctx.strokeStyle = "rgba(0,0,0,.15)"; bctx.lineWidth = 1;
      for (let i = 0; i < 40; i++) {
        let x = trand() * off.width, y = trand() * off.height;
        bctx.beginPath(); bctx.moveTo(x, y);
        for (let s = 0; s < 4; s++) { x += (trand() - 0.5) * 26; y += (trand() - 0.5) * 26; bctx.lineTo(x, y); }
        bctx.stroke();
      }
    } else if (mapKey === 'factory') {
      const g = bctx.createLinearGradient(0, 0, 0, off.height);
      g.addColorStop(0, "#40404a"); g.addColorStop(1, "#313138");
      bctx.fillStyle = g; bctx.fillRect(0, 0, off.width, off.height);
      bctx.strokeStyle = "rgba(0,0,0,.35)"; bctx.lineWidth = 2;
      const panel = TILE;
      for (let x = 0; x <= off.width; x += panel) { bctx.beginPath(); bctx.moveTo(x, 0); bctx.lineTo(x, off.height); bctx.stroke(); }
      for (let y = 0; y <= off.height; y += panel) { bctx.beginPath(); bctx.moveTo(0, y); bctx.lineTo(off.width, y); bctx.stroke(); }
      bctx.fillStyle = "rgba(180,180,190,.35)";
      for (let x = 0; x <= off.width; x += panel) for (let y = 0; y <= off.height; y += panel) {
        bctx.beginPath(); bctx.arc(x, y, 1.6, 0, 7); bctx.fill();
      }
      bctx.fillStyle = "rgba(255,255,255,.02)";
      for (let y = 0; y < off.height; y += 3) bctx.fillRect(0, y, off.width, 1);
    } else if (mapKey === 'water') {
      const g = bctx.createLinearGradient(0, 0, 0, off.height);
      g.addColorStop(0, "#2a6478"); g.addColorStop(1, "#153848");
      bctx.fillStyle = g; bctx.fillRect(0, 0, off.width, off.height);
      // rippling wave bands
      bctx.strokeStyle = "rgba(255,255,255,.08)"; bctx.lineWidth = 2;
      for (let i = 0; i < 26; i++) {
        const y = trand() * off.height;
        bctx.beginPath();
        for (let x = 0; x <= off.width; x += 14) {
          const yy = y + Math.sin(x * 0.05 + i) * 4;
          x === 0 ? bctx.moveTo(x, yy) : bctx.lineTo(x, yy);
        }
        bctx.stroke();
      }
      // sunlit sparkles
      for (let i = 0; i < 160; i++) {
        const x = trand() * off.width, y = trand() * off.height, r = 1 + trand() * 2;
        bctx.fillStyle = `rgba(255,255,255,${0.08 + trand() * 0.14})`;
        bctx.beginPath(); bctx.arc(x, y, r, 0, 7); bctx.fill();
      }
      // dark seaweed/rock patches
      for (let i = 0; i < 40; i++) {
        const x = trand() * off.width, y = trand() * off.height, r = 8 + trand() * 14;
        bctx.fillStyle = "rgba(0,20,25,.18)";
        bctx.beginPath(); bctx.ellipse(x, y, r, r * 0.5, 0, 0, 7); bctx.fill();
      }
    } else if (mapKey === 'space') { // space
      const g = bctx.createLinearGradient(0, 0, 0, off.height);
      g.addColorStop(0, "#181b3a"); g.addColorStop(1, "#0a0b1a");
      bctx.fillStyle = g; bctx.fillRect(0, 0, off.width, off.height);
      // nebula clouds
      for (let i = 0; i < 6; i++) {
        const x = trand() * off.width, y = trand() * off.height, r = 60 + trand() * 90;
        const neb = bctx.createRadialGradient(x, y, 0, x, y, r);
        const hue = trand() < 0.5 ? "120,90,200" : "60,140,190";
        neb.addColorStop(0, `rgba(${hue},.12)`); neb.addColorStop(1, "rgba(0,0,0,0)");
        bctx.fillStyle = neb; bctx.beginPath(); bctx.arc(x, y, r, 0, 7); bctx.fill();
      }
      // starfield
      for (let i = 0; i < 260; i++) {
        const x = trand() * off.width, y = trand() * off.height, r = trand() < 0.85 ? 0.8 + trand() : 1.6 + trand() * 1.4;
        bctx.fillStyle = `rgba(255,255,255,${0.4 + trand() * 0.5})`;
        bctx.beginPath(); bctx.arc(x, y, r, 0, 7); bctx.fill();
      }
    } else {
      const g = bctx.createLinearGradient(0, 0, off.width, off.height);
      g.addColorStop(0, MAP.tileA); g.addColorStop(0.55, MAP.tileB); g.addColorStop(1, MAP.bg);
      bctx.fillStyle = g; bctx.fillRect(0, 0, off.width, off.height);
      for (let i = 0; i < 500; i++) {
        const x = trand() * off.width, y = trand() * off.height, a = 0.03 + trand() * 0.08;
        bctx.fillStyle = `rgba(255,255,255,${a})`;
        bctx.fillRect(x, y, 1 + trand() * 3, 1 + trand() * 3);
      }
      if (mapKey === 'volcano') {
        bctx.strokeStyle='rgba(255,115,45,.14)'; bctx.lineWidth=2;
        for(let i=0;i<25;i++){const y=trand()*off.height;bctx.beginPath();bctx.moveTo(0,y);bctx.lineTo(off.width,y+(trand()-.5)*30);bctx.stroke();}
      } else if(mapKey === 'ice'){
        bctx.strokeStyle='rgba(190,240,255,.16)'; bctx.lineWidth=1;
        for(let i=0;i<80;i++){const x=trand()*off.width,y=trand()*off.height;bctx.beginPath();bctx.moveTo(x,y);bctx.lineTo(x+10,y+2);bctx.stroke();}
      } else if(mapKey === 'forest'){
        bctx.fillStyle='rgba(30,90,50,.22)';
        for(let i=0;i<70;i++){const x=trand()*off.width,y=trand()*off.height;bctx.beginPath();bctx.arc(x,y,5+trand()*13,0,7);bctx.fill();}
      } else if(mapKey === 'electric'){
        bctx.strokeStyle='rgba(130,115,255,.22)'; bctx.lineWidth=1;
        for(let i=0;i<30;i++){const x=trand()*off.width,y=trand()*off.height;bctx.beginPath();bctx.moveTo(x,y);bctx.lineTo(x+(trand()-.5)*40,y+(trand()-.5)*20);bctx.stroke();}
      } else if(mapKey === 'boss_arena'){
        bctx.strokeStyle='rgba(235,120,210,.17)'; bctx.lineWidth=2;
        bctx.beginPath();bctx.arc(off.width/2,off.height/2,170,0,7);bctx.stroke();
        bctx.beginPath();bctx.arc(off.width/2,off.height/2,95,0,7);bctx.stroke();
      }
    }
    return off;
  }

  function loadMap(newKey) {
    const requested = MAPS[newKey] ? newKey : 'village';
    mapKey = requested;
    MAP = MAPS[mapKey];
    let tiles = Array.isArray(MAP.tiles) ? MAP.tiles.filter(p => Array.isArray(p) && p.length >= 2).map(p => [Number(p[0]), Number(p[1])]) : [];
    const validPoints = tiles.every(([x,y]) => Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&x<COLS&&y>=0&&y<ROWS);
    let continuous = tiles.length >= 2;
    for(let i=1; continuous && i<tiles.length; i++) continuous = Math.abs(tiles[i][0]-tiles[i-1][0]) + Math.abs(tiles[i][1]-tiles[i-1][1]) === 1;
    if(!validPoints || !continuous){
      mapKey='village'; MAP=MAPS.village; tiles=MAP.tiles;
      log('⚠️ Դաշտի տվյալները սխալ էին, ավտոմատ բեռնվեց Գյուղական Ճամփան։');
    }
    MAP = {...MAP, tiles};
    pathSet = new Set(tiles.map(([x,y]) => x+","+y));
    waypoints = tiles.map(([x,y]) => ({x: x*TILE+TILE/2, y: y*TILE+TILE/2}));
    decorations = buildDecorations();
    bgTexture = buildBackgroundTexture();
    const badgeEl = document.getElementById('mapBadge');
    if (badgeEl) badgeEl.textContent = `${MAP.icon} ${MAP.label}`;
  }
  loadMap(startMapKey);

  document.getElementById('menuBtn').onclick = () => returnToMainMenu();
  document.getElementById('restartBtn').onclick = () => {
    document.getElementById('overlay').style.display = 'none';
    initGame(diffKey, startMapKey);
  };

  // ---------- STATE ----------
  let gold = 250, lives = 30, levelNum = 0, speedMul = 1, gameOver = false, paused = false;
  const TAGUHI_KILL_INTERVAL = 1500; // 25s @ 60fps
  let taguhiKillTimer = TAGUHI_KILL_INTERVAL;
  // Smile Immortal uses frame-based timers (60 fps) so its effects are stable
  // and do not compound every frame.
  const SMILE_HEAL_INTERVAL = 300;      // 5 sec
  const SMILE_CONTROL_INTERVAL = 600;  // 10 sec
  const SMILE_ERASE_INTERVAL = 3600;    // 60 sec
  let smileHealTimer = SMILE_HEAL_INTERVAL;
  let smileControlTimer = SMILE_CONTROL_INTERVAL;
  let smileEraseTimer = SMILE_ERASE_INTERVAL;
  let towers = [], enemies = [], projectiles = [], particles = [], floatTexts = [];
  let selectedTowerType = null;
  let selectedTower = null;   // a placed hero the player clicked (for info / sell)
  let hoverTile = null;       // {cx,cy} under the mouse, for placement preview
  let nextQueue = null, nextQueueLevel = 0; // pre-rolled next wave, so it can be previewed
  let hardcoreDeadTypes = new Set();
  window.HVR_RUNTIME = { getTowers:()=>towers, getEnemies:()=>enemies, getWave:()=>levelNum, getGold:()=>gold, getLives:()=>lives, isOver:()=>gameOver, isPaused:()=>paused, getMap:()=>mapKey };
  let spawnQueue = [], spawnTimer = 0, levelInProgress = false;
  let statsDirty = false; // many kills per frame -> refresh the side panel once per frame


  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const goldEl = document.getElementById('gold');
  const heartsEl = document.getElementById('hearts');
  const waveEl = document.getElementById('wave');
  const logEl = document.getElementById('log');
  const selInfoEl = document.getElementById('selInfo');
  const startBtn = document.getElementById('startBtn');
  const speedBtn = document.getElementById('speedBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const inGameMenuBtn = document.getElementById('inGameMenuBtn');

  inGameMenuBtn.onclick = () => returnToMainMenu();

  function log(msg) { logEl.textContent = msg; }

  // ---------- TOWER PANEL (4-per-page grid, owned heroes only, sorted by price) ----------
  const heroGridEl = document.getElementById('heroGrid');
  const heroDotsEl = document.getElementById('heroDots');
  const HEROES_PER_PAGE = 4;
  let heroPage = 0;
  let heroPageCount = 1;

  function getOwnedHeroKeys() {
    return Object.keys(TOWER_TYPES)
      .filter(k => ownsHero(k))
      .sort((a, b) => TOWER_TYPES[a].unlockPrice - TOWER_TYPES[b].unlockPrice);
  }

  let towerListSig = '';
  function renderTowerList() {
    const heroKeys = getOwnedHeroKeys();
    heroPageCount = Math.max(1, Math.ceil(heroKeys.length / HEROES_PER_PAGE));
    heroPage = Math.min(heroPage, heroPageCount - 1);
    const sigStart = heroPage * HEROES_PER_PAGE;
    const sig = heroPage + '|' + heroPageCount + '|' + selectedTowerType + '|' +
      heroKeys.slice(sigStart, sigStart + HEROES_PER_PAGE).map(k => k + ':' + heroLevel(k) + ':' + (gold >= Math.round(TOWER_TYPES[k].cost) ? 1 : 0)).join(',');
    if (sig === towerListSig && heroGridEl.childElementCount) return;
    towerListSig = sig;
    heroGridEl.innerHTML = '';
    const start = heroPage * HEROES_PER_PAGE;
    const pageKeys = heroKeys.slice(start, start + HEROES_PER_PAGE);

    pageKeys.forEach(key => {
      const t = TOWER_TYPES[key];
      const cost = Math.round(t.cost);
      const affordable = gold >= cost;
      const isSelected = selectedTowerType === key;
      const lvl = heroLevel(key);

      const card = document.createElement('div');
      card.className = 'heroMiniCard' + (isSelected ? ' selected' : '') + (affordable ? '' : ' disabled');
      card.style.setProperty('--heroColor', t.color);
      const imgHtml = t.bust
        ? `<img src="${ASSET_FILES[t.bust]}">`
        : `<span class="hcEmoji">${t.emoji || '🦸'}</span>`;
      card.innerHTML = `
        <div class="hcImgWrap">${imgHtml}</div>
        <b>${t.name}</b>
        <div class="cost">💰 ${cost} · Lv${lvl}</div>
        ${isSelected ? '<div class="hcPick">✓</div>' : ''}
      `;
      card.onclick = () => {
        if (!affordable) return;
        selectedTowerType = isSelected ? null : key;
        selectedTower = null; renderTowerPanel();
        selInfoEl.textContent = selectedTowerType ? `Ընտրված է՝ ${t.name}. Սեղմիր դաշտի վրա տեղադրելու համար:` : 'Ընտրիր հերոսի, հետո սեղմիր դաշտում՝ տեղադրելու համար';
        renderTowerList();
      };
      heroGridEl.appendChild(card);
    });

    heroDotsEl.innerHTML = '';
    for (let p = 0; p < heroPageCount; p++) {
      const dot = document.createElement('span');
      dot.className = 'heroDot' + (p === heroPage ? ' active' : '');
      dot.onclick = () => { heroPage = p; renderTowerList(); };
      heroDotsEl.appendChild(dot);
    }
  }
  document.getElementById('heroPrev').onclick = () => { heroPage = (heroPage - 1 + heroPageCount) % heroPageCount; renderTowerList(); };
  document.getElementById('heroNext').onclick = () => { heroPage = (heroPage + 1) % heroPageCount; renderTowerList(); };
  renderTowerList();
  window.HVR_REFRESH_HEROES = renderTowerList;

  function placeSelectedHeroAtEvent(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    if (clientX == null || clientY == null) return;
    const mx = (clientX - rect.left) * (canvas.width / rect.width);
    const my = (clientY - rect.top) * (canvas.height / rect.height);
    if (gameOver || paused) return;
    const cx = Math.floor(mx / TILE), cy = Math.floor(my / TILE);
    if (!selectedTowerType) {
      // No hero card selected -> clicking a placed hero selects it (range + sell panel).
      const hit = towers.find(t => t.cx === cx && t.cy === cy) || null;
      selectedTower = hit; renderTowerPanel();
      if (!hit) log('Ընտրիր հերոսի քարտը, հետո սեղմիր ազատ վանդակի վրա։');
      return;
    }
    selectedTower = null; renderTowerPanel();
    if (!isBuildable(cx, cy)) { log("Այստեղ չի կարելի կառուցել (ուղի է կամ դաշտից դուրս)"); return; }
    if (towers.some(t => t.cx === cx && t.cy === cy)) { log("Այս վանդակն արդեն զբաղված է"); return; }
    const def = TOWER_TYPES[selectedTowerType];
    if (!def) { selectedTowerType = null; renderTowerList(); return; }
    if(window.HVR_EXPANSION?.canPlaceHero && !window.HVR_EXPANSION.canPlaceHero(towers.length, selectedTowerType)) return;
    if(window.HVR_EXPANSION?.mode?.() === 'hardcore' && hardcoreDeadTypes.has(selectedTowerType)) { log('💀 Hardcore․ այս hero-ն այս խաղում այլևս չի վերադառնում'); return; }
    const cost = Math.max(0, Math.round(def.cost));
    if (gold < cost) { log(`Բավարար ոսկի չկա․ ${def.name}-ին պետք է ${cost} ոսկի։`); return; }
    gold -= cost;
    const lvl = heroLevel(selectedTowerType);
    const maxHp = heroEffectiveMaxHp(lvl, selectedTowerType);
    towers.push({ type: selectedTowerType, cx, cy, x: cx*TILE+TILE/2, y: cy*TILE+TILE/2, cooldown: 0, facing: 1, disableT: 0, hp: maxHp, maxHp: maxHp, level: lvl, paid: cost });
    log(`${def.name} տեղադրվեց իր ${def.weapon.split(' ').slice(1).join(' ')} զենքով`);
    updateStats();
  }
  canvas.onclick = placeSelectedHeroAtEvent;
  canvas.addEventListener('touchstart', (e) => {
    if (gameId !== currentGameId) return; // listener left over from an earlier game
    if (selectedTowerType) { e.preventDefault(); placeSelectedHeroAtEvent(e); }
  }, {passive:false});
  canvas.style.touchAction = 'none';

  // ---------- HOVER PREVIEW + HOTKEYS ----------
  function tileFromMouse(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    return { cx: Math.floor(mx / TILE), cy: Math.floor(my / TILE) };
  }
  canvas.addEventListener('mousemove', e => { if (gameId === currentGameId) hoverTile = tileFromMouse(e); });
  canvas.addEventListener('mouseleave', () => { if (gameId === currentGameId) hoverTile = null; });
  const hotkeyHandler = (e) => {
    if (gameId !== currentGameId) { document.removeEventListener('keydown', hotkeyHandler); return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (document.getElementById('wrap').style.display === 'none') return;
    const k = e.key;
    if (k === ' ' || k === 'Enter') { e.preventDefault(); startBtn.click(); }
    else if (k === 'p' || k === 'P') pauseBtn.click();
    else if (k === 'f' || k === 'F') speedBtn.click();
    else if (k === 'Escape') { selectedTowerType = null; selectedTower = null; renderTowerPanel(); renderTowerList(); selInfoEl.textContent = 'Ընտրիր հերոսի, հետո սեղմիր դաշտում՝ տեղադրելու համար'; }
    else if ((k === 'Delete' || k === 's' || k === 'S') && selectedTower) sellSelectedTower();
    else if (k === 'ArrowLeft') document.getElementById('heroPrev').click();
    else if (k === 'ArrowRight') document.getElementById('heroNext').click();
    else if (k >= '1' && k <= '4') {
      const keys = getOwnedHeroKeys();
      const key = keys[heroPage * HEROES_PER_PAGE + (Number(k) - 1)];
      if (key) {
        if (gold < Math.round(TOWER_TYPES[key].cost)) { log('Բավարար ոսկի չկա'); return; }
        selectedTowerType = selectedTowerType === key ? null : key;
        selectedTower = null; renderTowerPanel();
        selInfoEl.textContent = selectedTowerType ? `Ընտրված է՝ ${TOWER_TYPES[key].name}. Սեղմիր դաշտի վրա տեղադրելու համար:` : 'Ընտրիր հերոսի, հետո սեղմիր դաշտում՝ տեղադրելու համար';
        renderTowerList();
      }
    }
  };
  document.addEventListener('keydown', hotkeyHandler);

  // ---------- SELECTED HERO PANEL (info + sell) ----------
  const SELL_REFUND = 0.7;
  const towerPanelEl = document.getElementById('towerPanel');
  function renderTowerPanel() {
    if (!towerPanelEl) return;
    if (selectedTower && !towers.includes(selectedTower)) selectedTower = null;
    if (!selectedTower) { towerPanelEl.style.display = 'none'; towerPanelEl.innerHTML = ''; return; }
    const t = selectedTower, def = TOWER_TYPES[t.type];
    const refund = Math.floor((t.paid ?? def.cost) * SELL_REFUND);
    towerPanelEl.style.display = 'block';
    towerPanelEl.innerHTML = `<b>${def.name}</b> · Lv${t.level}<br>
      ❤ ${Math.ceil(t.hp)} / ${Math.ceil(t.maxHp)}${t.type==='smile_immortal'?' (∞)':''}<br>
      <span class="tpDesc">${def.desc}</span>
      <div class="tpBtns"><button type="button" class="action" id="sellTowerBtn">💰 Վաճառել (+${refund})</button><button type="button" class="action" id="closeTowerBtn">✖</button></div>`;
    document.getElementById('sellTowerBtn').onclick = sellSelectedTower;
    document.getElementById('closeTowerBtn').onclick = () => { selectedTower = null; renderTowerPanel(); };
  }
  function sellSelectedTower() {
    if (!selectedTower || gameOver) return;
    const t = selectedTower, def = TOWER_TYPES[t.type];
    const refund = Math.floor((t.paid ?? def.cost) * SELL_REFUND);
    gold += refund;
    floatTexts.push({x: t.x, y: t.y-24, life: 30, text: `+${refund} 💰`, color: '#7ed957'});
    particles.push({x: t.x, y: t.y, r: 10, life: 16, color: '#f0d878', kind: 'burst'});
    towers.splice(towers.indexOf(t), 1);
    selectedTower = null;
    log(`${def.name}-ը վաճառվեց +${refund} ոսկով`);
    renderTowerPanel(); updateStats();
  }

  // ---------- NEXT-WAVE PREVIEW ----------
  const wavePreviewEl = document.getElementById('wavePreview');
  let wavePreviewKey = '';
  function getNextQueue() {
    const lvl = levelNum + 1;
    if (!nextQueue || nextQueueLevel !== lvl) { nextQueue = buildLevelQueue(lvl); nextQueueLevel = lvl; }
    return nextQueue;
  }
  function renderWavePreview() {
    if (!wavePreviewEl) return;
    const endless = !!window.HVR_EXPANSION?.isEndless?.();
    if (levelInProgress || (!endless && levelNum >= TOTAL_LEVELS)) { wavePreviewKey = ''; wavePreviewEl.textContent = ''; return; }
    const q = getNextQueue();
    const key = nextQueueLevel + ':' + q.length;
    if (key === wavePreviewKey) return;
    wavePreviewKey = key;
    const counts = {};
    q.forEach(k => counts[k] = (counts[k] || 0) + 1);
    const parts = Object.entries(counts)
      .sort((a, b) => (ENEMY_TYPES[b[0]]?.hp || 0) - (ENEMY_TYPES[a[0]]?.hp || 0))
      .slice(0, 6)
      .map(([k, n]) => `${n}× ${ENEMY_TYPES[k]?.name || k}`);
    const more = Object.keys(counts).length > 6 ? ' …' : '';
    wavePreviewEl.innerHTML = `<b>Հաջորդ ալիք ${nextQueueLevel}</b> — ${q.length} ռոբոտ<br>${parts.join(', ')}${more}`;
  }

  function updateStats() {
    goldEl.textContent = gold;
    heartsEl.textContent = Math.max(0, lives);
    const waveCap = window.HVR_EXPANSION?.isEndless?.() ? '∞' : TOTAL_LEVELS;
    waveEl.textContent = `${levelNum} / ${waveCap}`;
    updateCoinDisplays();
    renderTowerList();
    renderWavePreview();
  }

  // ---------- WAVE GENERATION ----------
  function pickElite() {
    const list = diffKey === 'norek' ? ELITE_ENEMY_KEYS.filter(k => ENEMY_TYPES[k].role !== 'attacker') : ELITE_ENEMY_KEYS;
    return list[Math.floor(Math.random()*list.length)];
  }

  function buildLevelQueue(level) {
    const pool = enemyPoolForLevel(DIFF.pool, level);
    const queue = [];
    const endless = !!window.HVR_EXPANSION?.isEndless?.();
    const isBossWave = (!endless && level === TOTAL_LEVELS) || level % 10 === 0;
    if (isBossWave) {
      const escortCount = level === TOTAL_LEVELS ? 8 + Math.floor(level*0.4) : 4 + Math.floor(level*0.22);
      for (let i=0;i<escortCount;i++) queue.push(pool[Math.floor(Math.random()*pool.length)]);
      queue.push("boss");
      return queue;
    }
    const count = 5 + Math.floor(Math.min(level,160) * 1.2); // was 6 + 1.75/level
    for (let i=0;i<count;i++) {
      const bias = Math.min(0.85, level/TOTAL_LEVELS);
      let idx;
      if (Math.random() < bias) idx = pool.length - 1 - Math.floor(Math.random()*Math.min(pool.length, 2));
      else idx = Math.floor(Math.random()*pool.length);
      idx = Math.max(0, Math.min(pool.length-1, idx));
      queue.push(pool[idx]);
    }
    if(level>=8 && Math.random()<Math.min(0.85,0.18+level/220)) queue.push(pickElite());
    if(level>=35 && Math.random()<0.35) queue.push(pickElite());
    for (let i=queue.length-1;i>0;i--) {
      const j = Math.floor(Math.random()*(i+1));
      [queue[i],queue[j]] = [queue[j],queue[i]];
    }
    return queue;
  }

  function levelHpDmgScale(level) {
    return 1 + (level-1) * 0.08; // was 0.12 (wave 100 enemies had ~13x HP)
  }

  startBtn.onclick = () => {
    if (levelInProgress || gameOver || paused) return;
    if (!MAP || !waypoints || waypoints.length < 2) {
      log('⚠ Դաշտի արահետը բեռնել չհաջողվեց։ Ընտրիր այլ դաշտ։');
      loadMap('village');
    }
    if (levelNum >= TOTAL_LEVELS && !window.HVR_EXPANSION?.isEndless?.()) return;
    const rolledQueue = getNextQueue().slice();
    nextQueue = null;
    levelNum++;
    window.HVR_EXPANSION?.startWave?.(levelNum);
    spawnQueue = rolledQueue;
    levelInProgress = true;
    spawnTimer = 0;
    startBtn.disabled = true;
    updateStats();
    log(levelNum === TOTAL_LEVELS ? `⚠ ՎԵՐՋՆԱԿԱՆ ՄԱԿԱՐԴԱԿ! Ռոբոտ-Շեֆը գալիս է!` : (levelNum % 10 === 0 ? `👑 BOSS WAVE ${levelNum}! Ռոբոտ-Շեֆը գալիս է!` : `Մակարդակ ${levelNum} սկսվեց!`));
  };

  const SPEED_STEPS = [1, 2, 3, 5, 10];
  speedBtn.onclick = () => {
    const i = SPEED_STEPS.indexOf(speedMul);
    speedMul = SPEED_STEPS[(i + 1) % SPEED_STEPS.length];
    speedBtn.textContent = `⏩ x${speedMul}`;
  };

  pauseBtn.onclick = () => {
    if (gameOver) return;
    paused = !paused;
    pauseBtn.textContent = paused ? '▶' : '⏸';
    pauseBtn.classList.toggle('paused', paused);
    log(paused ? 'Խաղը դադարեցված է' : 'Խաղը շարունակվում է');
  };

  function spawnEnemyType(typeKey) {
    const base = ENEMY_TYPES[typeKey];
    if (!base || !waypoints.length) return false;
    const scale = levelHpDmgScale(levelNum);
    const hp = Math.round(base.hp * DIFF.robotHpMult * scale);
    enemies.push({
      type: typeKey, hp, maxHp: hp, speed: base.speed * DIFF.robotSpeedMult * (window.HVR_FEATURES?.robotSpeedMult?.() || 1),
      shield: base.shield ? Math.round(base.shield * DIFF.robotHpMult * scale) : 0,
      maxShield: base.shield ? Math.round(base.shield * DIFF.robotHpMult * scale) : 0,
      shieldCooldown: 0, regen: !!base.regen,
      wpIndex: 0, x: waypoints[0].x, y: waypoints[0].y,
      slowT: 0, freezeT: 0, burnT: 0, burnDmg: 0, stunT: 0, dist: 0, hitFlash: 0,
      atkCd: 0, healCd: 0,
      slowFactor: 0.45, ironT: 0, ironTickDmg: 0, traitor: false, weakT: 0,
      bossHealCd: 240, bossSummonCd: 360, bossRageT: 0, bossShieldCd: 300,
    });
    return true;
  }

  // ---------- COMBAT ----------
  function isEnemyAlive(en) { return !!en && !en._dead && en.hp > 0; }

  function findTarget(tower, def) {
    const ai = window.HVR_EXPANSION?.heroCombatMult?.(tower?.type)?.ai;
    let aiBest = null, aiScore = Infinity;
    let best = null, bestDist = -Infinity;
    for (const en of enemies) {
      if (en.traitor) continue; // converted robots are on our side now
      if(ai) {
        const d = Math.hypot(en.x - tower.x, en.y - tower.y);
        if(isEnemyAlive(en) && d <= def.range * DIFF.towerRangeMult && en.hp < aiScore){ aiScore=en.hp; aiBest=en; }
      }
      if (!isEnemyAlive(en)) continue;
      const d = Math.hypot(en.x - tower.x, en.y - tower.y);
      if (d <= def.range * DIFF.towerRangeMult && en.dist > bestDist) { bestDist = en.dist; best = en; }
    }
    return aiBest || best;
  }

  // Like findTarget but returns up to `count` distinct enemies in range
  // (furthest-along-path first), for multi-shot heroes like Nikolaganner.
  function findTargets(tower, def, count) {
    const inRange = enemies.filter(en => isEnemyAlive(en) && !en.traitor && Math.hypot(en.x-tower.x, en.y-tower.y) <= def.range * DIFF.towerRangeMult);
    inRange.sort((a,b) => b.dist - a.dist);
    return inRange.slice(0, count);
  }

  function dealDamage(en, dmg) {
    if (!isEnemyAlive(en) || en.traitor || !Number.isFinite(dmg)) return; // heroes never hurt their own convert
    en.hitFlash = 6;
    const armor = ENEMY_TYPES[en.type].armor || 0;
    if (armor > 0) dmg = Math.max(0.5, dmg - armor);
    if (en.shield > 0) {
      const absorbed = Math.min(en.shield, dmg);
      en.shield -= absorbed;
      dmg -= absorbed;
      en.shieldCooldown = 120;
    }
    if (dmg > 0) en.hp -= dmg;
  }

  // Safe instant-kill marker. The enemy is removed by updateEnemies() in
  // one controlled place, preventing array-iteration/projectile races.
  function instaKill(en) {
    if (!isEnemyAlive(en) || en.traitor) return;
    en.hitFlash = 10;
    en._dead = true;
    en.hp = 0;
  }

  function healTowersPct(cx, cy, radiusPx, pct) {
    towers.forEach(t => {
      if (Math.hypot(t.x-cx, t.y-cy) <= radiusPx && t.hp < t.maxHp) {
        t.hp = Math.min(t.maxHp, t.hp + t.maxHp * pct);
      }
    });
  }
  function healTowersFlat(cx, cy, radiusPx, amount) {
    towers.forEach(t => {
      if (Math.hypot(t.x-cx, t.y-cy) <= radiusPx && t.hp < t.maxHp) {
        t.hp = Math.min(t.maxHp, t.hp + amount);
      }
    });
  }

  // "Խանգարիչ Ռոբոտ" (jammer) weakens any hero tower standing near it —
  // returns a damage multiplier (<1 while jammed, 1 otherwise).
  function getJamMult(tower) {
    for (const en of enemies) {
      const eb = ENEMY_TYPES[en.type];
      if (eb.role === 'jammer' && Math.hypot(en.x-tower.x, en.y-tower.y) <= eb.jamRadius) return eb.jamMult;
    }
    return 1;
  }

  function applyTowerEffect(tower, def, target, allInRange, jamMult, level) {
    jamMult = jamMult || 1;
    level = level || 1;
    const smilePowerMult = tower && tower.smileBoost ? 6 : 1; // +500% power
    let dmg = heroEffectiveDamage(def.damage, level, tower?.type) * DIFF.towerDmgMult * jamMult * smilePowerMult;
    const critInfo = window.HVR_EXPANSION?.heroCombatMult?.(tower?.type);
    if(dmg>0 && critInfo && Math.random() < Number(critInfo.crit||0)) { dmg *= 2; window.HVR_EXPANSION.recordCrit?.(); floatTexts.push({x:target.x,y:target.y-20,life:28,text:'🎯 CRIT!',color:'#ffd45c'}); }
    particles.push({x: target.x, y: target.y, r: 4, life: 10, color: def.color, kind: def.projShape === 'chair' ? 'burst' : 'hit'});
    switch (def.special) {
      case 'multi':
        allInRange.forEach(en => dealDamage(en, dmg));
        break;
      case 'knockback':
        dealDamage(target, dmg);
        target.wpIndex = Math.max(0, target.wpIndex - 1);
        target.dist -= 20;
        target.stunT = 25;
        break;
      case 'slow':
        dealDamage(target, dmg);
        target.slowT = 60; target.slowFactor = 0.45;
        break;
      case 'aoe':
        enemies.forEach(en => { if (Math.hypot(en.x-target.x, en.y-target.y) <= def.splash) dealDamage(en, dmg); });
        particles.push({x: target.x, y: target.y, r: def.splash, life: 14, color: "#ffffff55", kind: 'ring'});
        break;
      case 'burn':
        dealDamage(target, dmg*0.4);
        target.burnT = 90; target.burnDmg = 2.2;
        floatTexts.push({x: target.x, y: target.y-18, life: 30, text: SYMBOL_CHARS[Math.floor(Math.random()*SYMBOL_CHARS.length)]+SYMBOL_CHARS[Math.floor(Math.random()*SYMBOL_CHARS.length)]+SYMBOL_CHARS[Math.floor(Math.random()*SYMBOL_CHARS.length)], color: "#ff5c5c"});
        break;
      case 'freeze':
        enemies.forEach(en => { if (Math.hypot(en.x-tower.x, en.y-tower.y) <= def.splash) { en.freezeT = 70; dealDamage(en, dmg); } });
        particles.push({x: tower.x, y: tower.y, r: def.splash, life: 20, color: "#ffffffaa", kind: 'ring'});
        particles.push({x: tower.x, y: tower.y, r: 12, life: 8, color: "#ffffff", kind: 'flash'});
        break;

      // --- 10 new hero abilities ---
      case 'wand_instakill':
        if (Math.random() < def.instaKillChance) {
          instaKill(target);
          particles.push({x: target.x, y: target.y, r: 10, life: 18, color: "#9a5cd9", kind: 'flash'});
          floatTexts.push({x: target.x, y: target.y-18, life: 30, text: "✨ ՈՉՆՉԱՑԱՎ", color: "#c99aff"});
        } else {
          dealDamage(target, dmg);
        }
        break;
      case 'iron_dot':
        dealDamage(target, dmg);
        target.slowT = def.slowDuration; target.slowFactor = def.slowFactor;
        target.ironT = def.ironDurationTicks;
        target.ironTickDmg = target.maxHp * def.ironTotalPct / def.ironDurationTicks;
        break;
      case 'phone_convert':
        dealDamage(target, dmg);
        if (!target.traitor && Math.random() < def.convertChance) {
          target.traitor = true;
          target.wpIndex = Math.max(0, target.wpIndex - 1);
          particles.push({x: target.x, y: target.y, r: 10, life: 20, color: "#5cd9a0", kind: 'ring'});
          floatTexts.push({x: target.x, y: target.y-18, life: 30, text: "🤝 ԴԱՎԱՃԱՆ", color: "#5cd9a0"});
        }
        break;
      case 'accordion_dual':
        if (Math.random() < 0.5) {
          allInRange.forEach(en => { en.slowT = 60; en.slowFactor = 0.8; });
          particles.push({x: tower.x, y: tower.y, r: def.range, life: 14, color: "#e8c95c33", kind: 'ring'});
        } else {
          allInRange.forEach(en => { dealDamage(en, dmg); en.wpIndex = Math.max(0, en.wpIndex-1); en.dist -= 16; en.stunT = 20; });
        }
        break;
      case 'kungfu_triple': {
        const roll = Math.random();
        if (roll < 1/3) {
          instaKill(target);
          particles.push({x: target.x, y: target.y, r: 8, life: 16, color: "#ff5c5c", kind: 'flash'});
        } else if (roll < 2/3) {
          dealDamage(target, dmg);
          target.wpIndex = Math.max(0, target.wpIndex - 1);
          target.dist -= 20;
          target.stunT = 25;
        } else {
          dealDamage(target, dmg*0.3);
          target.stunT = 120;
          floatTexts.push({x: target.x, y: target.y-18, life: 30, text: "💫", color: "#ffffff"});
        }
        break;
      }
      case 'math_heal':
        dealDamage(target, dmg);
        healTowersFlat(tower.x, tower.y, def.healRadiusTiles*TILE*0.5, dmg*0.5);
        floatTexts.push({x: target.x, y: target.y-16, life: 24, text: ['x²','∑','π','÷','√'][Math.floor(Math.random()*5)], color: "#8ab8ff"});
        break;
      case 'triple_heart':
        dealDamage(target, dmg);
        if (Math.random() < 0.5) { target.slowT = 60; target.slowFactor = 0.6; }
        else { target.weakT = 150; }
        break;
      case 'cake_freeze':
        dealDamage(target, dmg);
        target.freezeT = def.freezeDuration;
        particles.push({x: target.x, y: target.y, r: 10, life: 16, color: "#ffffffcc", kind: 'flash'});
        break;
    }
  }

  function updateTowers() {
    const taguhiActive = towers.some(t => t.type === 'taguhi');
    const smileActive = towers.some(t => t.type === 'smile_immortal');
    const taguhiRateMult = taguhiActive ? 1/1.5 : 1; // +50% fire speed
    towers.forEach(tower => {
      if (!tower || !tower.type) return;
      const def = TOWER_TYPES[tower.type];
      if (!def) return;
      const lvl = Math.max(1, Number(tower.level) || 1);
      tower.smileBoost = !!smileActive && tower.type !== 'smile_immortal';
      const smileRateMult = tower.smileBoost ? (1/6) : 1; // +500% speed
      const rateMult = heroEffectiveRateMult(lvl, tower.type) * taguhiRateMult * smileRateMult;
      if (tower.attackPulse > 0) tower.attackPulse -= speedMul;
      if (tower.disableT > 0) { tower.disableT -= speedMul; return; } // sabotaged by an "Հարձակվող Ռոբոտ"
      if (def.special === 'queen_aura' || def.special === 'smile_immortal') return; // passive heroes

      if (tower.cooldown > 0) { tower.cooldown -= speedMul; return; }

      if (def.special === 'aura_heal_slow') {
        const healRadius = def.healRadiusTiles * TILE * 0.5;
        healTowersPct(tower.x, tower.y, healRadius, def.healPct);
        const slowRadius = def.slowRadiusTiles * TILE * 0.5;
        let slowedAny = false;
        enemies.forEach(en => { if (Math.hypot(en.x-tower.x, en.y-tower.y) <= slowRadius) { en.slowT = def.slowDuration; en.slowFactor = def.slowFactor; slowedAny = true; } });
        particles.push({x: tower.x, y: tower.y, r: healRadius, life: 16, color: "#7ac9e855", kind: 'ring'});
        if (slowedAny) particles.push({x: tower.x, y: tower.y, r: slowRadius, life: 16, color: "#4a90c855", kind: 'ring'});
        tower.cooldown = def.rate * rateMult;
        tower.attackPulse = 16;
        return;
      }

      if (def.special === 'multi' || def.special === 'freeze' || def.special === 'accordion_dual') {
        const targets = enemies.filter(en => isEnemyAlive(en) && !en.traitor && Math.hypot(en.x-tower.x, en.y-tower.y) <= def.range * DIFF.towerRangeMult);
        if (targets.length === 0) return;
        applyTowerEffect(tower, def, targets[0], targets, getJamMult(tower), lvl);
        tower.cooldown = def.rate * rateMult;
        tower.attackPulse = 16;
        return;
      }

      if (def.special === 'triple_heart') {
        const targets = findTargets(tower, def, 3);
        if (targets.length === 0) return;
        tower.facing = targets[0].x >= tower.x ? 1 : -1;
        const jam = getJamMult(tower);
        for (let k = 0; k < 3; k++) {
          const tgt = targets[k % targets.length];
          projectiles.push({ x: tower.x, y: tower.y, tx: tgt, def, color: def.color, speed: 7, shape: def.projShape, rot: k, jamMult: jam, originX: tower.x, originY: tower.y, level: lvl, smileBoost: !!tower.smileBoost });
        }
        tower.cooldown = def.rate * rateMult;
        tower.attackPulse = 16;
        return;
      }

      const target = findTarget(tower, def);
      if (!target) return;
      tower.facing = target.x >= tower.x ? 1 : -1;
      projectiles.push({ x: tower.x, y: tower.y, tx: target, def, color: def.color, speed: 7, shape: def.projShape, rot: 0, jamMult: getJamMult(tower), originX: tower.x, originY: tower.y, level: lvl, smileBoost: !!tower.smileBoost });
      tower.cooldown = def.rate * rateMult;
      tower.attackPulse = 16;
    });
  }

  function updateProjectiles() {
    for (let i = projectiles.length-1; i>=0; i--) {
      const p = projectiles[i];
      if (!p || !p.tx || !p.def || !enemies.includes(p.tx) || !isEnemyAlive(p.tx) || !Number.isFinite(p.x) || !Number.isFinite(p.y)) {
        projectiles.splice(i,1);
        continue;
      }
      const dx = Number(p.tx.x) - Number(p.x), dy = Number(p.tx.y) - Number(p.y);
      const d = Math.hypot(dx,dy);
      p.rot += 0.3*speedMul;
      if (d < 8) { applyTowerEffect({x:p.originX,y:p.originY,smileBoost:!!p.smileBoost}, p.def, p.tx, [], p.jamMult, p.level); projectiles.splice(i,1); continue; }
      const step = p.speed * speedMul;
      p.x += dx/d*step; p.y += dy/d*step;
    }
  }

  function updateEnemies() {
    const taguhiActive = towers.some(t => t.type === 'taguhi');
    const robotDmgMult = taguhiActive ? 0.25 : 1;
    const robotSpeedMult = taguhiActive ? 0.85 : 1;
    for (let i = enemies.length-1; i>=0; i--) {
      const en = enemies[i];
      if (!en) { enemies.splice(i,1); continue; }
      if (!Number.isFinite(en.x) || !Number.isFinite(en.y)) { enemies.splice(i,1); continue; }
      const base = ENEMY_TYPES[en.type];
      if (!base) { enemies.splice(i,1); continue; }
      if (en.hitFlash > 0) en.hitFlash -= speedMul;
      if (en._dead || en.hp <= 0) {
        window.HVR_EXPANSION?.recordKill?.(en.type);
        if (!en.traitor) gold += Math.round(base.gold * DIFF.goldMult); // traitors give no bounty — they defected, not died
        particles.push({x: en.x, y: en.y, r: 3, life: 16, color: "#f0d878", kind: 'burst'});
        enemies.splice(i,1); statsDirty = true; continue;
      }
      if (en.shield > 0) {
        if (en.shieldCooldown > 0) en.shieldCooldown -= speedMul;
        else en.shield = Math.min(en.maxShield, en.shield + 0.15*speedMul);
      }
      if (en.regen && en.hp < en.maxHp) en.hp = Math.min(en.maxHp, en.hp + 0.12*speedMul);
      if (en.burnT > 0) { en.burnT -= speedMul; en.hp -= en.burnDmg*speedMul*0.15; }
      if (en.ironT > 0) { en.ironT -= speedMul; en.hp -= en.ironTickDmg*speedMul; }
      if (en.weakT > 0) en.weakT -= speedMul;
      if (en.stunT > 0) { en.stunT -= speedMul; continue; }
      if (en.freezeT > 0) { en.freezeT -= speedMul; continue; }

      const dmgMult = (en.weakT > 0 ? 0.5 : 1) * robotDmgMult * ((en.type==='boss' && en.bossRageT>0)?1.45:1);

      // "Դավաճան" ռոբոտ (converted by Հեռախոս Մարիանա) — walks back toward the
      // start, attacking other robots along the way; vanishes at the start,
      // never reaches or harms the heroes.
      if (en.traitor) {
        if (en.atkCd > 0) en.atkCd -= speedMul;
        else {
          const victim = enemies.find(o => !o.traitor && o !== en && Math.hypot(o.x-en.x, o.y-en.y) <= 40);
          if (victim) {
            dealDamage(victim, 8);
            particles.push({x: victim.x, y: victim.y, r: 4, life: 10, color: "#5cd9a0", kind: 'hit'});
            en.atkCd = 45;
          }
        }
        const wpB = waypoints[en.wpIndex];
        if (!wpB || en.wpIndex < 0) { enemies.splice(i,1); statsDirty = true; continue; }
        const dxB = wpB.x-en.x, dyB = wpB.y-en.y, dB = Math.hypot(dxB,dyB);
        const stepB = en.speed*speedMul;
        if (dB < stepB) { en.x = wpB.x; en.y = wpB.y; en.wpIndex--; }
        else { en.x += dxB/dB*stepB; en.y += dyB/dB*stepB; }
        continue;
      }

      // "Հարձակվող Ռոբոտ" (attacker) — periodically sabotages a nearby hero tower:
      // disables it briefly AND chips away at its HP.
      if (base.role === 'attacker') {
        if (en.atkCd > 0) en.atkCd -= speedMul;
        else {
          const nearTower = towers.find(t => Math.hypot(t.x-en.x, t.y-en.y) <= base.atkRadius);
          if (nearTower) {
            nearTower.disableT = Math.max(nearTower.disableT, base.disableDuration);
            nearTower.hp -= 12 * DIFF.robotHpMult * dmgMult;
            particles.push({x: nearTower.x, y: nearTower.y, r: 5, life: 14, color: "#ff3a3a", kind: 'burst'});
            floatTexts.push({x: nearTower.x, y: nearTower.y-24, life: 26, text: "✖ ԱՆԳՈՐԾ", color: "#ff5c5c"});
            en.atkCd = base.atkCooldownMax;
          }
        }
      }
      if (base.role === 'sniper' && Math.random() < 0.012*speedMul) { const t=towers[Math.floor(Math.random()*towers.length)]; if(t && t.type!=='smile_immortal') { t.hp-=18; t.disableT=Math.max(t.disableT,30); } }
      if (base.role === 'leech' && Math.random() < 0.02*speedMul) { const t=towers.find(t=>Math.hypot(t.x-en.x,t.y-en.y)<90); if(t && t.type!=='smile_immortal') t.hp-=5; }
      if (base.role === 'phantom' && Math.random()<0.02*speedMul) { en.phaseT=45; }
      if (base.role === 'freezer' && Math.random()<0.018*speedMul) towers.forEach(t=>{if(Math.hypot(t.x-en.x,t.y-en.y)<100)t.disableT=Math.max(t.disableT,45);});
      if (base.role === 'hacker' && Math.random()<0.012*speedMul) { const t=towers[Math.floor(Math.random()*towers.length)]; if(t && t.type!=='smile_immortal') t.disableT=Math.max(t.disableT,60); } // hackers now jam a hero briefly instead of stealing saved 🔑
      // "Բուժող Ռոբոտ" (healer) — periodically heals nearby robots (including itself)
      if (base.role === 'healer') {
        if (en.healCd > 0) en.healCd -= speedMul;
        else {
          let healed = false;
          enemies.forEach(other => {
            if (Math.hypot(other.x-en.x, other.y-en.y) <= base.healRadius && other.hp < other.maxHp) {
              other.hp = Math.min(other.maxHp, other.hp + other.maxHp * base.healPct);
              healed = true;
            }
          });
          if (healed) particles.push({x: en.x, y: en.y, r: base.healRadius, life: 16, color: "#4ac97a55", kind: 'ring'});
          en.healCd = base.healCooldownMax;
        }
      }

      // 👹 Boss skill cycle: heal, summon, rage and a temporary shield.
      if (en.type === 'boss') {
        en.bossHealCd -= speedMul; en.bossSummonCd -= speedMul; en.bossShieldCd -= speedMul;
        if(en.hp < en.maxHp*0.55 && en.bossRageT<=0){ en.bossRageT=999999; floatTexts.push({x:en.x,y:en.y-35,life:55,text:'🔥 RAGE!',color:'#ff8b45'}); }
        if(en.bossHealCd<=0){ en.hp=Math.min(en.maxHp,en.hp+en.maxHp*0.12); if(en.shield===undefined){en.shield=0;en.maxShield=0;} if((en.maxShield||0)>0)en.shield=Math.min(en.maxShield,en.shield+80); particles.push({x:en.x,y:en.y,r:55,life:24,color:'#7eff9a55',kind:'ring'}); en.bossHealCd=300; }
        if(en.bossSummonCd<=0 && enemies.length<22){ const t=pickElite(); spawnEnemyType(t); const s=enemies[enemies.length-1]; if(s){s.hp*=1.2;s.maxHp*=1.2;} particles.push({x:en.x,y:en.y,r:35,life:20,color:'#d79cff55',kind:'ring'}); en.bossSummonCd=420; }
        if(en.bossShieldCd<=0){ en.maxShield=Math.max(en.maxShield||0,Math.round(en.maxHp*0.08)); en.shield=en.maxShield; en.shieldCooldown=90; en.bossShieldCd=540; }
      }

      let spd = en.speed * robotSpeedMult;
      if(en.type==='boss' && en.bossRageT>0) spd*=1.45;
      if(base.role==='berserker' && en.hp<en.maxHp*0.4) spd*=1.7;
      if(base.role==='titan' && en.hp<en.maxHp*0.5) spd*=1.35;
      if (en.slowT > 0) { en.slowT -= speedMul; spd *= (en.slowFactor || 0.45); }
      // "Արագացնող Ռոբոտ" (booster) — speeds up any robot walking near it
      for (const other of enemies) {
        if (other === en) continue;
        const ob = ENEMY_TYPES[other.type];
        if (ob.role === 'booster' && Math.hypot(other.x-en.x, other.y-en.y) <= ob.boostRadius) { spd *= ob.boostMult; break; }
      }

      const wp = waypoints[en.wpIndex];
      if (!wp) {
        lives -= Math.max(1, Math.round(base.dmg * dmgMult));
        enemies.splice(i,1); statsDirty = true;
        if (lives <= 0 && !gameOver) { lives = 0; updateStats(); endGame(false); }
        continue;
      }
      const dx = wp.x-en.x, dy = wp.y-en.y, d = Math.hypot(dx,dy);
      const step = spd*speedMul;
      if (d < step) { en.x = wp.x; en.y = wp.y; en.wpIndex++; en.dist += d; }
      else { en.x += dx/d*step; en.y += dy/d*step; en.dist += step; }
    }
  }

  // Ձագուհի Մարիի (Taguhi) royal aura — every 25s, if she's on the field,
  // instantly destroys one random robot. Her other passive buffs (double
  // hero HP-cap, +50% fire rate, -15% robot speed, -75% robot damage) are
  // computed ambiently inside updateTowers()/updateEnemies() above.
  function updateQueenAura() {
    const active = towers.some(t => t.type === 'taguhi');
    if (!active) { taguhiKillTimer = TAGUHI_KILL_INTERVAL; return; }
    taguhiKillTimer -= speedMul;
    if (taguhiKillTimer <= 0) {
      if (enemies.length > 0) {
        const aliveEnemies = enemies.filter(e => isEnemyAlive(e) && !e.traitor);
        const victim = aliveEnemies.length ? aliveEnemies[Math.floor(Math.random()*aliveEnemies.length)] : null;
        if (victim) {
          instaKill(victim);
          particles.push({x: victim.x, y: victim.y, r: 8, life: 20, color: "#e85ca0", kind: 'flash'});
          floatTexts.push({x: victim.x, y: victim.y-20, life: 30, text: "👑", color: "#e85ca0"});
        }
      }
      taguhiKillTimer = TAGUHI_KILL_INTERVAL;
    }
  }

  function updateSmileImmortalAura() {
    const active = towers.find(t => t.type === 'smile_immortal');

    // Smile Immortal (x6 HP) and Taguhi's royal aura (x2 HP) are applied here, in one
    // place, and removed again when the hero leaves the field.
    const queenOn = towers.some(t => t.type === 'taguhi');
    towers.forEach(t => {
      if (t.type === 'smile_immortal') return;
      t.smileBoost = !!active;
      const mult = (active ? 6 : 1) * (queenOn ? 2 : 1);
      const prev = t.hpMult || 1;
      if (mult === 1 && prev === 1) return;
      const base = heroEffectiveMaxHp(t.level || 1, t.type);
      if (prev !== mult) {
        const oldMax = Math.max(1, Number(t.maxHp) || base);
        const ratio = Math.max(0, Math.min(1, (Number(t.hp) || 0) / oldMax));
        t.maxHp = base * mult;
        t.hp = Math.min(t.maxHp, active ? Math.max(1, ratio * t.maxHp) : ratio * t.maxHp);
        t.hpMult = mult;
      } else {
        t.maxHp = base * mult;
        t.hp = Math.min(t.maxHp, active ? Math.max(1, t.hp) : t.hp);
      }
      if (mult === 1) t.hpMult = 0;
    });

    if (!active) return;
    // Keep immortal HP finite to avoid Infinity/NaN values in canvas math.
    active.hp = 1e12;
    active.maxHp = 1e12;

    smileHealTimer -= speedMul;
    smileControlTimer -= speedMul;
    smileEraseTimer -= speedMul;

    // Every 5 seconds: heal all other heroes by 10% of their original max HP.
    if (smileHealTimer <= 0) {
      towers.forEach(t => {
        if (t === active) return;
        const base = heroEffectiveMaxHp(t.level || 1, t.type);
        t.hp = Math.min(t.maxHp, t.hp + base * 0.10);
      });
      smileHealTimer = SMILE_HEAL_INTERVAL;
    }

    // Every 10 seconds: 50% chance to slow all robots by 77% for 3 sec,
    // otherwise freeze them for 3 sec. Effects are state flags, not speed mutation.
    if (smileControlTimer <= 0) {
      enemies.forEach(en => {
        if (!isEnemyAlive(en)) return;
        if (Math.random() < 0.5) {
          en.slowT = Math.max(en.slowT, 180);
          en.slowFactor = 0.23;
        } else {
          en.freezeT = Math.max(en.freezeT, 180);
        }
      });
      smileControlTimer = SMILE_CONTROL_INTERVAL;
    }

    // Every 60 seconds: 10% chance to destroy all robots currently on the field.
    if (smileEraseTimer <= 0) {
      if (Math.random() < 0.10) {
        enemies.forEach(en => { if (isEnemyAlive(en)) instaKill(en); });
        floatTexts.push({
          x: active.x, y: active.y - 36, life: 45,
          text: '🙂 SMILE • ՈՉՆՉԱՑՈՒՄ', color: '#fff07a'
        });
        particles.push({x: active.x, y: active.y, r: 28, life: 30, color: '#fff07a', kind: 'flash'});
      }
      smileEraseTimer = SMILE_ERASE_INTERVAL;
    }
  }

  // Removes any hero tower whose HP has been chipped down to 0 by attacker robots.
  function pruneDeadTowers() {
    for (let i = towers.length-1; i>=0; i--) {
      if (towers[i].type === 'smile_immortal') { towers[i].hp=1e12; towers[i].maxHp=1e12; continue; }
      if (towers[i].hp <= 0) {
        const t = towers[i];
        hardcoreDeadTypes.add(t.type);
        window.HVR_EXPANSION?.recordHeroDeath?.(t.type);
        particles.push({x: t.x, y: t.y, r: 14, life: 22, color: "#ff5c5c", kind: 'burst'});
        floatTexts.push({x: t.x, y: t.y-20, life: 34, text: "💥 ՀԵՐՈՍԸ ԱՆՀԵՏԱՑԱՎ", color: "#ff5c5c"});
        towers.splice(i,1);
        if (selectedTower === t) { selectedTower = null; renderTowerPanel(); }
      }
    }
  }

  function updateParticles() {
    for (let i = particles.length-1; i>=0; i--) { particles[i].life -= speedMul; if (particles[i].life<=0) particles.splice(i,1); }
    for (let i = floatTexts.length-1; i>=0; i--) { floatTexts[i].life -= speedMul; floatTexts[i].y -= 0.4*speedMul; if (floatTexts[i].life<=0) floatTexts.splice(i,1); }
  }

  function handleSpawning() {
    if (!levelInProgress) return;
    if (spawnQueue.length === 0) {
      if (enemies.length === 0) {
        levelInProgress = false;
        startBtn.disabled = false;
        gold += 30 + levelNum * 2;
        // Full heal for every surviving hero between waves.
        towers.forEach(t => { if (t.type !== 'smile_immortal') t.hp = t.maxHp; });
        const coinsEarned = Math.round(MAP_COIN_PER_LEVEL[mapKey] * DIFF.coinMult);
        window.HVR_EXPANSION?.recordWave?.();
        addCoins(coinsEarned);
        try { window.dispatchEvent(new CustomEvent('hvr:waveComplete', { detail: { wave: levelNum } })); } catch (e) {}
        updateStats();
        log(`Մակարդակ ${levelNum} ավարտված! +${30+levelNum*2} ոսկի, +${coinsEarned} 🏆, հերոսները բուժվեցին`);
        if (levelNum >= TOTAL_LEVELS && !window.HVR_EXPANSION?.isEndless?.()) {
          endGame(true);
        } else if(currentProfile.autoLevel && (window.HVR_EXPANSION?.isEndless?.() || levelNum < TOTAL_LEVELS)){
          const scheduledGameId = gameId;
          if (activeGameTimer) clearTimeout(activeGameTimer);
          activeGameTimer = setTimeout(()=>{
            activeGameTimer = null;
            if (scheduledGameId === currentGameId && !gameOver && !paused) startBtn.click();
          },350);
        }
      }
      return;
    }
    spawnTimer -= speedMul;
    if (spawnTimer <= 0) {
      const t = spawnQueue.shift();
      const spawned = spawnEnemyType(t);
      if (!spawned) {
        log(`⚠️ Ռոբոտի ${t} spawn-ը բաց թողնվեց։`);
      }
      spawnTimer = t === 'boss' ? 0 : 24;
    }
  }

  function endGame(won) {
    gameOver = true;
    const overlay = document.getElementById('overlay');
    document.getElementById('overlayTitle').textContent = won ? "🏆 ՀԱՂԹԱՆԱԿ!" : "💀 ՊԱՐՏՈՒԹՅՈՒՆ";
    document.getElementById('overlayText').textContent = won
      ? (window.HVR_EXPANSION?.isEndless?.() ? `Endless Mode-ում հասար ${levelNum}-րդ ալիքին՝ ${MAP.icon} ${MAP.label} քարտեզում։` : `Հերոսները փրկեցին ${MAP.icon} ${MAP.label} քարտեզը ${DIFF.label} դժվարությամբ, բոլոր ${TOTAL_LEVELS} մակարդակները!`)
      : `Ռոբոտները ներխուժեցին: Հասար մակարդակ ${levelNum}-ին (${MAP.icon} ${MAP.label}):`;
    overlay.style.display = 'flex';
  }

  // ---------- DECORATION SHAPES ----------
  function drawDecoration(d) {
    const { x, y, variant } = d;
    if (mapKey === 'village') {
      const s = 0.75 + variant*0.5;
      if (variant < 0.55) {
        ctx.fillStyle = "rgba(0,0,0,.25)"; ctx.beginPath(); ctx.ellipse(x, y+6*s, 12*s, 4*s, 0,0,7); ctx.fill();
        ctx.fillStyle = "#4a3320"; ctx.fillRect(x-2*s, y-4*s, 4*s, 10*s);
        ctx.fillStyle = "#3a6b2a"; ctx.fillRect(x-11*s, y-20*s, 22*s, 11*s);
        ctx.fillStyle = "#4a7d38"; ctx.fillRect(x-8*s, y-27*s, 16*s, 9*s);
        ctx.fillStyle = "#5c9146"; ctx.fillRect(x-4*s, y-32*s, 8*s, 7*s);
      } else {
        ctx.fillStyle = "rgba(0,0,0,.2)"; ctx.beginPath(); ctx.ellipse(x, y+4, 9, 3, 0,0,7); ctx.fill();
        ctx.fillStyle = "#3d6b30"; ctx.fillRect(x-8,y-6,16,10);
        ctx.fillStyle = "#4f8a3e"; ctx.fillRect(x-5,y-10,10,6);
        const flowerColor = ["#e88ac2","#e8d85c","#e8985c"][Math.floor(variant*30)%3];
        ctx.fillStyle = flowerColor;
        ctx.fillRect(x-6+((variant*40)%10), y-8, 2, 2);
        ctx.fillRect(x+3-((variant*17)%6), y-4, 2, 2);
      }
    } else if (mapKey === 'mountain') {
      const s = 0.8 + variant*0.6;
      ctx.fillStyle = "rgba(0,0,0,.3)"; ctx.beginPath(); ctx.ellipse(x, y+7*s, 13*s, 4*s, 0,0,7); ctx.fill();
      ctx.fillStyle = "#4a453e";
      ctx.beginPath();
      ctx.moveTo(x-11*s, y+7*s); ctx.lineTo(x-2*s, y-14*s); ctx.lineTo(x+4*s, y-6*s); ctx.lineTo(x+12*s, y+7*s);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#6b6258";
      ctx.beginPath(); ctx.moveTo(x-2*s, y-14*s); ctx.lineTo(x+2*s, y-8*s); ctx.lineTo(x-5*s, y-5*s); ctx.closePath(); ctx.fill();
      if (variant > 0.6) { ctx.fillStyle = "#e8e8ec"; ctx.fillRect(x-4*s, y-14*s, 6*s, 3*s); }
    } else if (mapKey === 'factory') {
      ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.beginPath(); ctx.ellipse(x, y+10, 12, 3, 0,0,7); ctx.fill();
      ctx.fillStyle = "#4a4a56";
      ctx.fillRect(x-7, y-16, 14, 26);
      ctx.fillStyle = "#5a5a68";
      ctx.fillRect(x-7, y-16, 14, 5);
      ctx.fillStyle = "#2a2a32";
      for (let i=0;i<3;i++) ctx.fillRect(x-5+i*5, y-8, 2, 2);
      if (variant > 0.5) {
        ctx.fillStyle = "#7a4a2a";
        ctx.fillRect(x-2, y-24, 4, 8);
        ctx.fillStyle = "#d9a85c33";
        ctx.beginPath(); ctx.arc(x, y-26, 3, 0, 7); ctx.fill();
      }
    } else if (mapKey === 'water') {
      const s = 0.75 + variant*0.5;
      ctx.fillStyle = "rgba(0,0,0,.22)"; ctx.beginPath(); ctx.ellipse(x, y+6*s, 11*s, 3.5*s, 0,0,7); ctx.fill();
      if (variant < 0.55) { // coral cluster
        const coralColor = ["#e8785c","#e8a45c","#c95c8a"][Math.floor(variant*30)%3];
        ctx.fillStyle = coralColor;
        for (let i=0;i<4;i++) {
          const bx = x + (i-1.5)*4*s, bh = 10*s + (i%2)*4*s;
          ctx.fillRect(bx-2*s, y-bh, 4*s, bh);
        }
        ctx.fillStyle = "#ffffff22";
        ctx.beginPath(); ctx.arc(x, y-12*s, 3*s, 0, 7); ctx.fill();
      } else { // rock with seaweed
        ctx.fillStyle = "#2a4a52";
        ctx.beginPath(); ctx.ellipse(x, y, 10*s, 6*s, 0,0,7); ctx.fill();
        ctx.strokeStyle = "#3a7a5a"; ctx.lineWidth = 2*s;
        for (let i=0;i<3;i++) {
          const bx = x-6*s+i*6*s;
          ctx.beginPath();
          ctx.moveTo(bx, y-2*s);
          ctx.quadraticCurveTo(bx+3*s, y-14*s, bx-2*s, y-20*s);
          ctx.stroke();
        }
      }
    } else if (mapKey === 'space') {
      const s = 0.8 + variant*0.7;
      ctx.fillStyle = "rgba(0,0,0,.3)"; ctx.beginPath(); ctx.ellipse(x, y+8*s, 11*s, 3*s, 0,0,7); ctx.fill();
      if (variant < 0.6) { // asteroid chunk
        ctx.fillStyle = "#5a5468";
        ctx.beginPath();
        ctx.moveTo(x-9*s, y);
        ctx.lineTo(x-4*s, y-9*s); ctx.lineTo(x+3*s, y-8*s); ctx.lineTo(x+9*s, y-1*s);
        ctx.lineTo(x+6*s, y+6*s); ctx.lineTo(x-5*s, y+7*s);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = "#3a364a"; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = "#3a3650";
        ctx.beginPath(); ctx.arc(x-1*s, y-2*s, 2*s, 0, 7); ctx.fill();
      } else { // small glowing planet
        const pg = ctx.createRadialGradient(x-2*s,y-2*s,1,x,y,9*s);
        pg.addColorStop(0, "#a8c9e8"); pg.addColorStop(1, "#4a5a9a");
        ctx.fillStyle = pg;
        ctx.beginPath(); ctx.arc(x, y, 8*s, 0, 7); ctx.fill();
        ctx.strokeStyle = "rgba(200,200,255,.4)"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.ellipse(x, y, 13*s, 3.5*s, -0.3, 0, 7); ctx.stroke();
      }
    }
  }

  // ---------- RENDER ----------
  function drawGrid() {
    ctx.drawImage(bgTexture, 0, 0);

    const glow = ctx.createRadialGradient(canvas.width/2,-40,60,canvas.width/2,-40,460);
    glow.addColorStop(0, "rgba(255,255,255,.06)"); glow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glow; ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.save();
    ctx.lineJoin = "round"; ctx.lineCap = "round";
    ctx.strokeStyle = MAP.pathEdge;
    ctx.lineWidth = TILE * 0.86;
    ctx.beginPath();
    waypoints.forEach((wp,i)=> i===0 ? ctx.moveTo(wp.x,wp.y) : ctx.lineTo(wp.x,wp.y));
    ctx.stroke();

    ctx.strokeStyle = MAP.path;
    ctx.lineWidth = TILE * 0.72;
    ctx.beginPath();
    waypoints.forEach((wp,i)=> i===0 ? ctx.moveTo(wp.x,wp.y) : ctx.lineTo(wp.x,wp.y));
    ctx.stroke();

    ctx.strokeStyle = "rgba(0,0,0,.08)";
    ctx.lineWidth = TILE * 0.72;
    ctx.lineCap = "butt";
    ctx.beginPath();
    waypoints.forEach((wp,i)=> i===0 ? ctx.moveTo(wp.x,wp.y+TILE*0.2) : ctx.lineTo(wp.x,wp.y+TILE*0.2));
    ctx.stroke();

    ctx.strokeStyle = MAP.pathEdge + "77";
    ctx.lineWidth = 3; ctx.lineCap = "round";
    ctx.setLineDash([12, 12]);
    ctx.beginPath();
    waypoints.forEach((wp,i)=> i===0 ? ctx.moveTo(wp.x,wp.y) : ctx.lineTo(wp.x,wp.y));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    decorations.forEach(drawDecoration);

    // Show clear placement guides while a hero is selected.
    if (selectedTowerType && !gameOver && !paused) {
      ctx.save();
      const hoverColor = TOWER_TYPES[selectedTowerType]?.color || '#7ed957';
      for (let cy=0; cy<ROWS; cy++) {
        for (let cx=0; cx<COLS; cx++) {
          if (!isBuildable(cx,cy) || towers.some(t=>t.cx===cx && t.cy===cy)) continue;
          ctx.fillStyle = hoverColor + '12';
          ctx.fillRect(cx*TILE+2, cy*TILE+2, TILE-4, TILE-4);
          ctx.strokeStyle = hoverColor + '35';
          ctx.lineWidth = 1;
          ctx.strokeRect(cx*TILE+2.5, cy*TILE+2.5, TILE-5, TILE-5);
        }
      }
      ctx.restore();
    }

    const last = waypoints[waypoints.length-1];
    const baseGlow = ctx.createRadialGradient(last.x,last.y,4,last.x,last.y,36);
    baseGlow.addColorStop(0, "rgba(150,90,230,.55)"); baseGlow.addColorStop(1, "rgba(150,90,230,0)");
    ctx.fillStyle = baseGlow; ctx.beginPath(); ctx.arc(last.x,last.y,36,0,7); ctx.fill();
    const pulseT = performance.now()/1000;
    const brainPulse = 1 + Math.sin(pulseT*2.2)*0.045;
    const brainImg = imgCache.brain_base;
    const bs = 30 * brainPulse;
    ctx.save();
    ctx.shadowColor = "rgba(160,100,240,.8)"; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(last.x, last.y, bs, 0, 7); ctx.clip();
    if (brainImg && brainImg.complete && brainImg.naturalWidth) {
      ctx.drawImage(brainImg, last.x-bs, last.y-bs, bs*2, bs*2);
    } else {
      ctx.fillStyle = '#9a65d8';
      ctx.beginPath(); ctx.arc(last.x,last.y,bs,0,7); ctx.fill();
    }
    ctx.restore();
    ctx.strokeStyle = "rgba(200,160,255,.85)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(last.x, last.y, bs, 0, 7); ctx.stroke();
    const first = waypoints[0];
    ctx.fillStyle = "#222"; ctx.beginPath(); ctx.arc(first.x, first.y, 14, 0, 7); ctx.fill();
    ctx.strokeStyle = "#f0d878aa"; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(first.x, first.y, 14, 0, 7); ctx.stroke();
  }

  function roundRectPath(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x+r, y);
    c.arcTo(x+w, y, x+w, y+h, r);
    c.arcTo(x+w, y+h, x, y+h, r);
    c.arcTo(x, y+h, x, y, r);
    c.arcTo(x, y, x+w, y, r);
    c.closePath();
  }

  function drawTowers() {
    const t0 = performance.now()/1000;
    towers.forEach(t => {
      if (!t || !t.type) return;
      const def = TOWER_TYPES[t.type];
      if (!def || !Number.isFinite(t.x) || !Number.isFinite(t.y)) return;
      const isDisabled = t.disableT > 0;
      ctx.save();
      if (isDisabled) ctx.globalAlpha = 0.5;
      const bob = Math.sin(t0*2 + t.cx*0.7 + t.cy*0.5) * 2;

      const pulse = Math.max(0, Math.min(1, (t.attackPulse || 0) / 16));
      const kick = pulse > 0 ? Math.sin(pulse * Math.PI) * (1 - pulse * 0.3) : 0;
      const squashX = 1 + kick * 0.16;
      const squashY = 1 - kick * 0.10;
      const lean = kick * 10;
      const flashA = Math.max(0, kick - 0.3);

      const glow = ctx.createRadialGradient(t.x, t.y+8, 2, t.x, t.y+8, 28 + kick*10);
      glow.addColorStop(0, def.color + (flashA > 0 ? "88" : "44")); glow.addColorStop(1, def.color + "00");
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(t.x, t.y+8, 28 + kick*10, 0, 7); ctx.fill();
      ctx.fillStyle = "#00000055";
      ctx.beginPath(); ctx.ellipse(t.x, t.y+16, 20 + kick*3, 8 - kick*2, 0, 0, 7); ctx.fill();

      if (!def.img) {
        ctx.save();
        ctx.translate(t.x, t.y - 29 + bob);
        if (t.facing < 0) ctx.scale(-1,1);
        ctx.rotate((lean * Math.PI/180) * (t.facing < 0 ? -1 : 1));
        ctx.scale(squashX, squashY);
        ctx.fillStyle = def.color;
        ctx.beginPath();
        ctx.moveTo(-15, 14); ctx.lineTo(-15,-6); ctx.quadraticCurveTo(-15,-18,0,-18);
        ctx.quadraticCurveTo(15,-18,15,-6); ctx.lineTo(15,14); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = "#00000055"; ctx.lineWidth = 2; ctx.stroke();
        ctx.font = "20px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        if (t.facing < 0) ctx.scale(-1,1);
        ctx.fillText(def.emoji || '🦸', 0, -3);
        if (flashA > 0) {
          ctx.globalAlpha = flashA * 0.5; ctx.fillStyle = "#ffffff";
          ctx.beginPath(); ctx.arc(0,0,20,0,7); ctx.fill(); ctx.globalAlpha = 1;
        }
        ctx.restore();
      } else {
        const img = imgCache[def.img];
        const ready = !!(img && img.complete && img.naturalWidth);
        const h = 58, w = ready && img.width ? img.width*(h/img.height) : 30;

        const isThrowHero = t.type === 'skochitagavor' && pulse > 0;
        let drawImg = img, drawW = w, drawH = h;
        if (isThrowHero) {
          const frameIdx = Math.min(3, Math.floor((1 - pulse) * 4));
          const fimg = imgCache['skochitagavor_throw' + (frameIdx + 1)];
          if (fimg && fimg.complete && fimg.naturalWidth && fimg.width) { drawImg = fimg; drawH = 58; drawW = fimg.width * (drawH / fimg.height); }
        }

        ctx.save();
        ctx.translate(t.x, t.y-h/2+14+bob);
        if (t.facing < 0) ctx.scale(-1,1);
        if (ready || (drawImg && drawImg.complete && drawImg.naturalWidth)) {
          if (isThrowHero) {
            const s = 1 + kick * 0.08;
            ctx.scale(s, s);
            ctx.drawImage(drawImg, -drawW/2, -drawH/2, drawW, drawH);
          } else {
            ctx.rotate((lean * Math.PI/180) * (t.facing < 0 ? -1 : 1));
            ctx.scale(squashX, squashY);
            ctx.drawImage(drawImg, -drawW/2, -drawH/2, drawW, drawH);
          }
        } else {
          ctx.fillStyle = def.color;
          ctx.beginPath(); ctx.arc(0,0,18,0,7); ctx.fill();
          ctx.font='22px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
          ctx.fillText(def.emoji || '🦸', 0, 0);
        }
        if (flashA > 0) {
          ctx.globalAlpha = flashA * 0.5;
          ctx.globalCompositeOperation = 'source-atop';
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(-drawW/2, -drawH/2, drawW, drawH);
          ctx.globalCompositeOperation = 'source-over';
          ctx.globalAlpha = 1;
        }
        ctx.restore();
      }

      if (isDisabled) {
        ctx.globalAlpha = 1;
        ctx.font = "16px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("💤", t.x, t.y - 48 + Math.sin(t0*4)*3);
      }

      // HP bar — heroes can now take permanent damage from "Հարձակվող Ռոբոտ"
      if (t.hp < t.maxHp) {
        const ratio = Math.max(0, Math.min(1, t.hp / t.maxHp));
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#000"; ctx.fillRect(t.x-16, t.y-58, 32, 4);
        ctx.fillStyle = ratio > 0.5 ? "#7ed957" : (ratio > 0.25 ? "#e0c957" : "#e05c5c");
        ctx.fillRect(t.x-16, t.y-58, 32*ratio, 4);
      }
      ctx.restore();
    });
  }

  function drawEnemies() {
    const t0 = performance.now()/1000;
    enemies.forEach(en => {
      if (!en) return;
      const base = ENEMY_TYPES[en.type];
      if (!base || !Number.isFinite(en.x) || !Number.isFinite(en.y)) return;
      const w = base.w;
      const bob = Math.sin(t0*3.4 + en.x*0.05) * (w*0.03);
      ctx.save();
      ctx.translate(en.x, en.y + bob);

      ctx.fillStyle = "rgba(0,0,0,.4)";
      ctx.beginPath(); ctx.ellipse(0, w*0.62, w*0.52, w*0.16, 0,0,7); ctx.fill();

      let bodyColor = en.freezeT>0 ? "#bfe6ff" : (en.slowT>0 ? "#c9c9e0" : base.color);
      let darkAccent = "#00000055";
      if (en.hitFlash > 0) bodyColor = "#ffffff";

      // ---- legs / feet ----
      ctx.fillStyle = "#2a2a30";
      const legW = w*0.16, legY0 = w*0.28, legY1 = w*0.6;
      ctx.fillRect(-w*0.28, legY0, legW, legY1-legY0);
      ctx.fillRect(w*0.28-legW, legY0, legW, legY1-legY0);
      ctx.fillStyle = "#3a3a42";
      if (base.feet === 'wedge') {
        ctx.beginPath(); ctx.moveTo(-w*0.34,legY1); ctx.lineTo(-w*0.12,legY1); ctx.lineTo(-w*0.2,legY1+w*0.14); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(w*0.34,legY1); ctx.lineTo(w*0.12,legY1); ctx.lineTo(w*0.2,legY1+w*0.14); ctx.closePath(); ctx.fill();
      } else if (base.feet === 'round') {
        ctx.beginPath(); ctx.ellipse(-w*0.2, legY1+w*0.06, w*0.16, w*0.1, 0,0,7); ctx.fill();
        ctx.beginPath(); ctx.ellipse(w*0.2, legY1+w*0.06, w*0.16, w*0.1, 0,0,7); ctx.fill();
      } else {
        ctx.fillRect(-w*0.32, legY1, w*0.22, w*0.14);
        ctx.fillRect(w*0.1, legY1, w*0.22, w*0.14);
      }

      // ---- torso (rounded chunky body) ----
      const tx0 = -w*0.5, ty0 = -w*0.28, tw = w, th = w*0.6;
      ctx.fillStyle = bodyColor;
      roundRectPath(ctx, tx0, ty0, tw, th, w*0.16);
      ctx.fill();
      ctx.strokeStyle = darkAccent; ctx.lineWidth = 1.4; ctx.stroke();
      // chest panel + rivets
      ctx.fillStyle = "#00000030";
      roundRectPath(ctx, -w*0.32, -w*0.14, w*0.64, w*0.3, w*0.06); ctx.fill();
      ctx.fillStyle = en.burnT>0 ? "#ff8a3a" : "#00000055";
      ctx.beginPath(); ctx.arc(-w*0.36, ty0+w*0.08, 1.6, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(w*0.36, ty0+w*0.08, 1.6, 0, 7); ctx.fill();
      // extra riveted plating for heavy / boss units (rusty junkyard-mech look)
      if (base.rivets) {
        ctx.fillStyle = "rgba(255,255,255,.22)";
        ctx.beginPath(); ctx.arc(tx0+w*0.14, ty0+w*0.10, 1.4, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(tx0+tw-w*0.14, ty0+w*0.10, 1.4, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(tx0+w*0.14, ty0+th-w*0.10, 1.4, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(tx0+tw-w*0.14, ty0+th-w*0.10, 1.4, 0, 7); ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,.28)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(tx0+w*0.1, ty0+th*0.32); ctx.lineTo(tx0+tw-w*0.1, ty0+th*0.32); ctx.stroke();
      }

      // ---- arms (small side stubs) ----
      ctx.fillStyle = bodyColor;
      ctx.fillRect(-w*0.62, -w*0.1, w*0.14, w*0.32);
      ctx.fillRect(w*0.48, -w*0.1, w*0.14, w*0.32);
      ctx.fillStyle = "#2a2a30";
      ctx.beginPath(); ctx.arc(-w*0.55, w*0.24, w*0.08, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(w*0.55, w*0.24, w*0.08, 0, 7); ctx.fill();

      // ---- head ----
      const hw = w*0.62, hh = w*0.42, hy = -w*0.72;
      ctx.fillStyle = bodyColor;
      if (base.headShape === 'boxy') {
        roundRectPath(ctx, -hw/2, hy, hw, hh, w*0.05);
      } else if (base.headShape === 'visor') {
        roundRectPath(ctx, -hw/2, hy, hw, hh, hh*0.5);
      } else {
        roundRectPath(ctx, -hw/2, hy, hw, hh, w*0.2);
      }
      ctx.fill(); ctx.strokeStyle = darkAccent; ctx.stroke();

      // antenna
      if (base.antenna) {
        ctx.strokeStyle = "#666"; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(0, hy); ctx.lineTo(0, hy-w*0.16); ctx.stroke();
        ctx.fillStyle = en.hitFlash>0 ? "#ffffff" : "#e05c5c";
        ctx.beginPath(); ctx.arc(0, hy-w*0.16, w*0.045, 0, 7); ctx.fill();
      }

      // eye(s) — glowing
      const eyeY = hy + hh*0.5;
      const eyeColor = en.hitFlash>0 ? "#ffffff" : base.eyeColor;
      const eyeRadius = en.type === 'boss' ? w*0.13 : w*0.08;
      const drawEye = (ex) => {
        const glow = ctx.createRadialGradient(ex, eyeY, 0, ex, eyeY, w*0.16);
        glow.addColorStop(0, eyeColor); glow.addColorStop(1, eyeColor+"00");
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(ex, eyeY, w*0.16, 0, 7); ctx.fill();
        ctx.fillStyle = eyeColor;
        ctx.beginPath(); ctx.arc(ex, eyeY, eyeRadius, 0, 7); ctx.fill();
        ctx.fillStyle = "#00000090";
        ctx.beginPath(); ctx.arc(ex, eyeY, w*0.03, 0, 7); ctx.fill();
      };
      if (base.eyes === 1) drawEye(0);
      else if (base.eyes === 2) { drawEye(-hw*0.2); drawEye(hw*0.2); }
      else { drawEye(-hw*0.24); drawEye(0); drawEye(hw*0.24); }

      if (base.shield) {
        ctx.strokeStyle = "#6ac9e880"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, -w*0.05, w*0.72, 0, 7); ctx.stroke();
      }
      if (en.regen) { ctx.strokeStyle = "#7effc0"; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(0,0,w*0.75,0,7); ctx.stroke(); }
      if (base.role === 'healer') {
        ctx.strokeStyle = "#4ac97a99"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(0, 0, w*0.85 + Math.sin(t0*3)*3, 0, 7); ctx.stroke();
        ctx.fillStyle = "#e8fff0"; ctx.font = `bold ${w*0.32|0}px sans-serif`; ctx.textAlign="center"; ctx.textBaseline="middle";
        ctx.fillText("+", 0, -w*0.9);
      }
      if (base.role === 'booster') {
        ctx.strokeStyle = "#f5f56099"; ctx.lineWidth = 1.2; ctx.setLineDash([3,3]);
        ctx.beginPath(); ctx.arc(0, 0, w*0.7, 0, 7); ctx.stroke(); ctx.setLineDash([]);
      }
      if (base.role === 'jammer') {
        ctx.strokeStyle = "#c9a0ff99"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(0, 0, w*0.9 + Math.sin(t0*2.4)*2, 0, 7); ctx.stroke();
      }
      if (base.role === 'attacker' && en.atkCd < 12) {
        ctx.fillStyle = "#ff3a3a"; ctx.font = `bold ${w*0.4|0}px sans-serif`; ctx.textAlign="center"; ctx.textBaseline="middle";
        ctx.fillText("⚡", 0, -w*0.9);
      }
      if (en.traitor) {
        ctx.strokeStyle = "#5cd9a0"; ctx.lineWidth = 2; ctx.setLineDash([4,3]);
        ctx.beginPath(); ctx.arc(0, 0, w*0.95, 0, 7); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = "#5cd9a0"; ctx.font = `bold ${w*0.34|0}px sans-serif`; ctx.textAlign="center"; ctx.textBaseline="middle";
        ctx.fillText("🤝", 0, -w*0.95);
      }
      if (en.weakT > 0) {
        ctx.strokeStyle = "#ffb0e099"; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(0, 0, w*0.6, 0, 7); ctx.stroke();
      }
      ctx.restore();

      ctx.fillStyle = "#000"; ctx.fillRect(en.x-w/2, en.y-w*0.75-8, w, 4);
      const ratio = Math.max(0, en.hp/en.maxHp);
      ctx.fillStyle = ratio > 0.5 ? "#7ed957" : (ratio>0.25 ? "#e0c957" : "#e05c5c");
      ctx.fillRect(en.x-w/2, en.y-w*0.75-8, w*ratio, 4);
      if (en.maxShield > 0) {
        ctx.fillStyle = "#000"; ctx.fillRect(en.x-w/2, en.y-w*0.75-13, w, 3);
        ctx.fillStyle = "#6ac9e8"; ctx.fillRect(en.x-w/2, en.y-w*0.75-13, w*(en.shield/en.maxShield), 3);
      }
    });
  }

  function drawProjectiles() {
    projectiles.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      switch (p.shape) {
        case 'chair':
          ctx.rotate(p.rot);
          ctx.fillStyle = "#8a5a2a"; ctx.fillRect(-5,-5,10,10); ctx.fillRect(-5,-9,3,4); ctx.fillRect(2,-9,3,4);
          break;
        case 'tape':
          ctx.fillStyle = "#e8e0c0"; ctx.beginPath(); ctx.arc(0,0,5,0,7); ctx.fill();
          ctx.fillStyle = "#8a8060"; ctx.beginPath(); ctx.arc(0,0,2,0,7); ctx.fill();
          break;
        case 'symbol':
          ctx.fillStyle = "#ff5c5c"; ctx.font = "bold 13px monospace"; ctx.textAlign="center"; ctx.textBaseline="middle";
          ctx.fillText(SYMBOL_CHARS[Math.floor(p.rot*3)%SYMBOL_CHARS.length], 0, 0);
          break;
        case 'steam':
          ctx.fillStyle = "#ffffffaa"; ctx.beginPath(); ctx.arc(0,0,6,0,7); ctx.fill();
          break;
        case 'flash':
          ctx.fillStyle = "#ffffffcc"; ctx.beginPath(); ctx.arc(0,0,5,0,7); ctx.fill();
          break;
        case 'remote':
          ctx.rotate(p.rot);
          ctx.fillStyle = "#3a3a42"; ctx.fillRect(-3,-6,6,12);
          ctx.fillStyle = "#9a7ad9"; ctx.fillRect(-1.5,-4,3,2);
          break;
        case 'bag':
          ctx.rotate(p.rot);
          ctx.fillStyle = "#d97ab0"; ctx.beginPath(); ctx.ellipse(0,0,6,5,0,0,7); ctx.fill();
          ctx.strokeStyle = "#a8558a"; ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.arc(0,-6,4,Math.PI,0); ctx.stroke();
          break;
        case 'wand':
          ctx.rotate(p.rot);
          ctx.fillStyle = "#9a5cd9"; ctx.fillRect(-1.5,-7,3,14);
          ctx.fillStyle = "#e8d0ff"; ctx.beginPath(); ctx.arc(0,-7,2.4,0,7); ctx.fill();
          break;
        case 'iron':
          ctx.fillStyle = "#c9c9d0"; ctx.beginPath(); ctx.ellipse(0,0,6,4.5,0,0,7); ctx.fill();
          ctx.fillStyle = "#e88a4a"; ctx.beginPath(); ctx.arc(0,-3,2,0,7); ctx.fill();
          break;
        case 'phone':
          ctx.rotate(p.rot);
          ctx.fillStyle = "#2a2a32"; ctx.fillRect(-3,-6,6,12);
          ctx.fillStyle = "#5cd9a0"; ctx.fillRect(-2,-4,4,7);
          break;
        case 'fist':
          ctx.fillStyle = "#e8c9a0"; ctx.beginPath(); ctx.arc(0,0,5,0,7); ctx.fill();
          ctx.strokeStyle = "#a87a50"; ctx.lineWidth = 1; ctx.stroke();
          break;
        case 'math':
          ctx.fillStyle = "#5c8ae8"; ctx.font = "bold 12px monospace"; ctx.textAlign="center"; ctx.textBaseline="middle";
          ctx.fillText(['+','−','÷','x'][Math.floor(p.rot)%4], 0, 0);
          break;
        case 'heart':
          ctx.fillStyle = "#5ce8c9";
          ctx.beginPath();
          ctx.moveTo(0,3); ctx.bezierCurveTo(-6,-4,-3,-8,0,-3); ctx.bezierCurveTo(3,-8,6,-4,0,3);
          ctx.fill();
          break;
        case 'cake':
          ctx.fillStyle = "#f0d0e0"; ctx.fillRect(-6,-2,12,5);
          ctx.fillStyle = "#d9a25c"; ctx.fillRect(-6,-5,12,3);
          ctx.fillStyle = "#ff5c5c"; ctx.beginPath(); ctx.arc(0,-6,1.6,0,7); ctx.fill();
          break;
        default:
          ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(0,0,4,0,7); ctx.fill();
      }
      ctx.restore();
    });
  }

  function drawParticles() {
    particles.forEach(pt => {
      if (!pt || !Number.isFinite(pt.x) || !Number.isFinite(pt.y) || !Number.isFinite(pt.life)) return;
      ctx.globalAlpha = Math.max(0, pt.life/16);
      if (pt.kind === 'ring') {
        ctx.strokeStyle = pt.color; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r*(1-pt.life/20), 0, 7); ctx.stroke();
      } else if (pt.kind === 'flash') {
        ctx.fillStyle = pt.color;
        ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r*(2-pt.life/8), 0, 7); ctx.fill();
      } else {
        ctx.fillStyle = pt.color;
        ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r, 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1;
    });
    floatTexts.forEach(ft => {
      if (!ft || !Number.isFinite(ft.x) || !Number.isFinite(ft.y) || !Number.isFinite(ft.life)) return;
      ctx.globalAlpha = Math.max(0, ft.life/30);
      ctx.fillStyle = ft.color; ctx.font = "bold 12px monospace"; ctx.textAlign="center";
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.globalAlpha = 1;
    });
  }

  function drawOverlays() {
    // Range ring of a clicked, already-placed hero.
    if (selectedTower && towers.includes(selectedTower)) {
      const def = TOWER_TYPES[selectedTower.type];
      const r = (def.range || 0) * DIFF.towerRangeMult;
      ctx.save();
      if (r > 0 && r < 900) {
        ctx.fillStyle = def.color + '1c'; ctx.strokeStyle = def.color + 'cc'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(selectedTower.x, selectedTower.y, r, 0, 7); ctx.fill(); ctx.stroke();
      }
      ctx.strokeStyle = '#f0d878'; ctx.lineWidth = 2;
      ctx.strokeRect(selectedTower.cx*TILE+2, selectedTower.cy*TILE+2, TILE-4, TILE-4);
      ctx.restore();
    }
    // Placement preview under the cursor.
    if (selectedTowerType && hoverTile && !gameOver && !paused) {
      const { cx, cy } = hoverTile;
      if (cx >= 0 && cy >= 0 && cx < COLS && cy < ROWS) {
        const def = TOWER_TYPES[selectedTowerType];
        const ok = isBuildable(cx, cy) && !towers.some(t => t.cx === cx && t.cy === cy) && gold >= Math.round(def.cost);
        const x = cx*TILE + TILE/2, y = cy*TILE + TILE/2, r = (def.range || 0) * DIFF.towerRangeMult;
        ctx.save();
        ctx.fillStyle = ok ? '#7ed95755' : '#e05c5c55';
        ctx.fillRect(cx*TILE+1, cy*TILE+1, TILE-2, TILE-2);
        if (ok && r > 0 && r < 900) {
          ctx.strokeStyle = def.color + 'cc'; ctx.fillStyle = def.color + '18'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.stroke();
        }
        ctx.restore();
      }
    }
  }

  function render() {
    drawGrid(); drawOverlays(); drawTowers(); drawProjectiles(); drawEnemies(); drawParticles();
  }

  // Fixed 60 updates/second no matter the screen's refresh rate (on 120/144 Hz
  // monitors the game used to run twice as fast).
  const STEP_MS = 1000 / 60;
  let lastFrameTime = performance.now(), stepAccumulator = 0;

  function updateWorld() {
    try {
      handleSpawning();
      updateSmileImmortalAura();
      updateTowers();
      updateProjectiles();
      updateEnemies();
      updateQueenAura();
      pruneDeadTowers();
      updateParticles();
    } catch (error) {
      console.error('Game frame error safely contained:', error);
      paused = true;
      pauseBtn.textContent = '▶';
      pauseBtn.classList.add('paused');
      log('⚠ Հատուկ հերոսի էֆեկտը կանգնեցվեց․ խաղը չի փակվել։');
    }
  }

  function loop(now) {
    if (gameId !== currentGameId) return;
    now = (typeof now === 'number') ? now : performance.now();
    stepAccumulator += Math.min(250, Math.max(0, now - lastFrameTime));
    lastFrameTime = now;
    let steps = 0;
    while (stepAccumulator >= STEP_MS && steps < 5) {
      if (!gameOver && !paused) updateWorld();
      stepAccumulator -= STEP_MS; steps++;
    }
    if (stepAccumulator >= STEP_MS) stepAccumulator = 0; // too far behind: drop the backlog
    if (statsDirty) { statsDirty = false; updateStats(); }
    try {
      render();
    } catch (error) {
      console.error('Game render error safely contained:', error);
    }
    if (paused) {
      ctx.fillStyle = "rgba(0,0,0,.45)"; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle = "#f0d878"; ctx.font = "bold 28px 'Press Start 2P', monospace";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("⏸ ԴԱԴԱՐ", canvas.width/2, canvas.height/2);
    }
    requestAnimationFrame(loop);
  }

  updateStats();
  renderInGameSpecialButton();
  const autoBtn=document.getElementById('inGameAutoLevelBtn');
  if(autoBtn){
    autoBtn.onclick=()=>{
      if(!(currentProfile?.admin || Number(currentProfile?.vipUntil||0) > Date.now()))return;
      currentProfile.autoLevel=!currentProfile.autoLevel;
      saveProfile(currentProfile);
      autoBtn.textContent=currentProfile.autoLevel?'⚡ AutoLv: ON':'⚡ AutoLv';
      autoBtn.classList.toggle('active', currentProfile.autoLevel);
    };
  }
  loop();
}

// Bridges for the feature/expansion scripts.
window.saveProfile = saveProfile;
window.HVR_SAVE_LOCAL_PROFILE = function(profile){
  try { const all=loadAllProfiles(); all[profile.username]=profile; saveAllProfiles(all); localStorage.setItem(LAST_USER_KEY, profile.username); } catch(e) {}
};
window.loadAllProfiles = loadAllProfiles;
window.addCoins = addCoins;
window.spendCoins = spendCoins;
window.updateCoinDisplays = updateCoinDisplays;
window.fetchSharedLeaderboard = fetchSharedLeaderboard;
window.renderMapGrid = renderMapGrid;
window.renderHeroesInfoList = renderHeroesInfoList;
window.heroEffectiveDamage = heroEffectiveDamage;
window.heroEffectiveMaxHp = heroEffectiveMaxHp;
window.heroEffectiveRateMult = heroEffectiveRateMult;
window.initGame = initGame;
window.activatePromoCode = activatePromoCode;


// ============================================================
// RANDOM DRAW UI HANDLERS
// ============================================================
function openCasino(){ openRandomDraw(); }
document.getElementById('randomDrawBtn')?.addEventListener('click', openCasino);
document.getElementById('randomDrawOpenBtn')?.addEventListener('click', runRandomDraw);
document.getElementById('randomDrawCloseBtn')?.addEventListener('click',()=>{
  if(!window.randomDrawBusy) document.getElementById('randomDrawOverlay').style.display='none';
});
