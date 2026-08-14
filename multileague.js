(function(g){
const I=g.IHM=g.IHM||{};

I.leagueDefs=[
 {id:"ALP",country:"🇦🇹",name:"Alpine Premier League",style:"Ausgeglichen",prestige:68,salary:1.00,teams:[
  ["Frost City HC","❄️",78],["Capital Blades","⚔️",80],["Alpine Eagles","🦅",77],["Northridge Bears","🐻",76],["Silver Lake Kings","👑",79],
  ["Tyrol Wolves","🐺",75],["Danube Falcons","🦅",74],["Vienna Guardians","🛡️",78],["Salzburg Peaks","🏔️",76],["Iron Valley HC","⚙️",73],["Red Mountain Foxes","🦊",74],["Lakeview Storm","🌩️",75]
 ]},
 {id:"GER",country:"🇩🇪",name:"German Elite League",style:"Physisch",prestige:78,salary:1.18,teams:[
  ["Berlin Iceguard","🛡️",83],["Munich Royals","👑",84],["Hamburg Mariners","⚓",80],["Cologne Wolves","🐺",82],["Rhine Titans","⚡",81],["Black Forest Lynx","🐈",78],
  ["Dresden Forge","🔥",79],["Bavaria Bulls","🐂",81],["North Sea Sharks","🦈",77],["Frankfurt Comets","☄️",80],["Ruhr Miners","⛏️",78],["Stuttgart Hawks","🦅",79]
 ]},
 {id:"SUI",country:"🇨🇭",name:"Swiss Hockey League",style:"Technisch",prestige:82,salary:1.32,teams:[
  ["Zurich Lions HC","🦁",85],["Bern Capitals","🐻",84],["Geneva Knights","⚔️",82],["Lugano Stars","⭐",83],["Lausanne Falcons","🦅",81],["Basel Rhinos","🦏",78],
  ["Alpine Red Wings","🔴",80],["Lucerne Guardians","🛡️",79],["Fribourg Foxes","🦊",80],["Davos Peaks","🏔️",84],["Zug Thunder","⚡",83],["Aargau Ice","🧊",77]
 ]},
 {id:"SWE",country:"🇸🇪",name:"Nordic Hockey League",style:"Nachwuchs & Tempo",prestige:84,salary:1.20,teams:[
  ["Stockholm Vikings","⚔️",85],["Gothenburg Waves","🌊",83],["Malmö Redhawks","🦅",82],["Uppsala Kings","👑",80],["Lulea Northstars","⭐",84],["Örebro Wolves","🐺",81],
  ["Västerås Ice","🧊",79],["Karlstad Bears","🐻",82],["Skelleftea Gold","🟡",85],["Linköping Jets","✈️",80],["Jönköping Storm","🌩️",81],["Umeå Lynx","🐈",78]
 ]},
 {id:"FIN",country:"🇫🇮",name:"Finnish Elite League",style:"Defensiv & Entwicklung",prestige:83,salary:1.16,teams:[
  ["Helsinki Northern HC","❄️",84],["Tampere Steel","⚙️",85],["Turku Mariners","⚓",82],["Oulu Polar Bears","🐻",83],["Espoo Blues HC","🔷",80],["Kuopio Wolves","🐺",81],
  ["Lahti Icehawks","🦅",79],["Jyväskylä Storm","🌩️",82],["Vaasa Vikings","⚔️",78],["Pori Titans","⚡",80],["Kouvola Foxes","🦊",77],["Rovaniemi North","🌌",79]
 ]},
 {id:"CZE",country:"🇨🇿",name:"Czech Hockey League",style:"Skill & Scoring",prestige:79,salary:1.08,teams:[
  ["Prague Royals","👑",84],["Brno Dragons","🐉",82],["Ostrava Steel","⚙️",81],["Pilsen Knights","⚔️",80],["Liberec White Tigers","🐯",82],["Pardubice Racers","🏎️",83],
  ["Olomouc Eagles","🦅",78],["Zlin Rams","🐏",77],["Kladno Miners","⛏️",79],["Hradec Lions","🦁",81],["Karlovy Ice","🧊",76],["Ceske Wolves","🐺",78]
 ]},
 {id:"CON",country:"🇨🇦🇺🇸",name:"Continental Hockey League",style:"Stars & großes Budget",prestige:95,salary:1.70,teams:[
  ["Toronto Towers","🏙️",89],["Montreal Voyageurs","⚜️",88],["Vancouver Orcas","🐋",87],["Calgary Mustangs","🐎",86],["Edmonton Northstars","⭐",87],["Ottawa Guardians","🛡️",84],
  ["New York Empire","🗽",90],["Boston Harbors","⚓",88],["Chicago Steel","⚙️",87],["Detroit Motors","🏎️",86],["Seattle Krakenfire","🌊",85],["Denver Peaks","🏔️",86],
  ["Los Angeles Gold","🌟",88],["San Francisco Waves","🌊",85],["Dallas Outlaws","🤠",86],["Minnesota Frost","❄️",87],["Philadelphia Foundry","🔥",85],["Buffalo Bisons","🦬",84],
  ["Washington Eagles","🦅",87],["Pittsburgh Forge","🔨",86]
 ]}
];

I.ensureUniverse=function(){
 const s=I.state;
 if(s.universe&&s.universe.version>=2)return;
 s.managerCareer=s.managerCareer||{club:I.USER,league:"ALP",seasons:0,reputation:20,offers:[]};
 s.universe={version:2,season:s.seasonYear,leagues:{},champions:[],continental:null};
 I.leagueDefs.forEach(ld=>{
  const table={};
  ld.teams.forEach(([name,badge,rating])=>table[name]={name,badge,rating,gp:0,w:0,l:0,gf:0,ga:0,pts:0});
  s.universe.leagues[ld.id]={id:ld.id,name:ld.name,country:ld.country,prestige:ld.prestige,style:ld.style,table,champion:null};
 });
 // Mirror user's existing league state into Alpine league
 if(s.table) Object.values(s.table).forEach(r=>{
   if(s.universe.leagues.ALP.table[r.name]) Object.assign(s.universe.leagues.ALP.table[r.name],r);
 });
 I.save()
};

I.leagueById=id=>I.leagueDefs.find(x=>x.id===id);
I.currentLeague=function(){I.ensureUniverse();return I.leagueById(I.state.managerCareer.league)||I.leagueDefs[0]};
I.universeLeague=function(id){I.ensureUniverse();return I.state.universe.leagues[id]};

function simGoals(a,b){
 const diff=(a.rating-b.rating)*.025;
 let ag=Math.max(0,Math.round(2.6+diff+(Math.random()-.5)*3));
 let bg=Math.max(0,Math.round(2.6-diff+(Math.random()-.5)*3));
 if(ag===bg)Math.random()<.5?ag++:bg++;
 return [ag,bg]
}
function addResult(A,B,ag,bg){
 A.gp++;B.gp++;A.gf+=ag;A.ga+=bg;B.gf+=bg;B.ga+=ag;
 if(ag>bg){A.w++;B.l++;A.pts+=3}else{B.w++;A.l++;B.pts+=3}
}
I.simOtherLeaguesRound=function(){
 I.ensureUniverse();
 I.leagueDefs.filter(ld=>ld.id!=="ALP").forEach(ld=>{
   const L=I.state.universe.leagues[ld.id],arr=Object.values(L.table);
   // deterministic rotating pairings based on current user round
   const r=I.state.round;
   const fixed=arr[0],rest=arr.slice(1),rot=r%(arr.length-1);
   const ring=[fixed,...rest.slice(rot),...rest.slice(0,rot)];
   for(let i=0;i<Math.floor(ring.length/2);i++){
     const A=ring[i],B=ring[ring.length-1-i],[ag,bg]=simGoals(A,B);addResult(A,B,ag,bg)
   }
 });
 // sync Alpine table
 Object.values(I.state.table||{}).forEach(r=>{if(I.state.universe.leagues.ALP.table[r.name])Object.assign(I.state.universe.leagues.ALP.table[r.name],r)});
 I.save()
};
I.sortedLeague=function(id){
 const L=I.universeLeague(id);if(!L)return[];
 return Object.values(L.table).sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf)
};
I.finishUniverseSeason=function(){
 I.ensureUniverse();
 I.leagueDefs.forEach(ld=>{
   const L=I.state.universe.leagues[ld.id],top=I.sortedLeague(ld.id)[0];
   L.champion=top?.name||null;
   if(top)I.state.universe.champions.unshift({season:I.state.seasonYear,league:ld.id,team:top.name});
 });
 const champs=I.leagueDefs.map(ld=>({league:ld.id,team:I.state.universe.leagues[ld.id].champion,rating:I.leagueDefs.find(x=>x.id===ld.id).teams.find(t=>t[0]===I.state.universe.leagues[ld.id].champion)?.[2]||80}));
 champs.sort((a,b)=>b.rating+Math.random()*8-(a.rating+Math.random()*8));
 I.state.universe.continental={season:I.state.seasonYear,champion:champs[0]?.team||null,participants:champs.map(x=>x.team)};
 I.generateJobOffers();
 I.playWorldChampionsCup?.();
 I.save()
};
I.generateJobOffers=function(){
 I.ensureUniverse();const rep=I.state.reputation||20,offers=[];
 I.leagueDefs.forEach(ld=>{
   if(ld.id===I.state.managerCareer.league)return;
   const min=ld.prestige-48;
   if(rep>=min){
     const candidates=ld.teams.filter(t=>t[2]<=Math.min(90,72+rep*.25)).sort(()=>Math.random()-.5).slice(0,rep>65?2:1);
     candidates.forEach(t=>offers.push({league:ld.id,club:t[0],badge:t[1],rating:t[2],salary:Math.round((18000+ld.prestige*450)/1000)*1000,prestige:ld.prestige}));
   }
 });
 I.state.managerCareer.offers=offers.slice(0,5)
};
I.acceptJob=function(league,club){
 I.ensureUniverse();const o=I.state.managerCareer.offers.find(x=>x.league===league&&x.club===club);if(!o)return false;
 I.state.managerCareer.club=club;I.state.managerCareer.league=league;I.state.managerCareer.seasons++;
 I.pushNotification?.("💼","Neuer Managerjob",`${club} · ${I.leagueById(league).name}`);
 I.addNews(`💼 Managerwechsel: ${club} (${I.leagueById(league).name})`);
 I.state.managerCareer.offers=[];I.save();return true
};
I.leagueSummary=function(id){
 const ld=I.leagueById(id),rows=I.sortedLeague(id);return{def:ld,rows,leader:rows[0],champion:I.universeLeague(id)?.champion}
};
})(window);