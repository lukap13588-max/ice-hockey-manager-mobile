(function(g){
const I=g.IHM=g.IHM||{};
const clone=x=>JSON.parse(JSON.stringify(x));
I.clone=clone;
I.money=n=>new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(Number(n||0));
I.rnd=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
I.clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
I.team=name=>I.teams.find(t=>t.name===name);
I.player=id=>I.state?.players?.find(p=>p.id===Number(id));

function schedule(){
 const names=I.teams.map(t=>t.name),arr=names.slice(),rounds=[];
 if(arr.length%2)arr.push(null);
 const n=arr.length;
 for(let leg=0;leg<2;leg++){
  let a=arr.slice();
  for(let r=0;r<n-1;r++){
   const games=[];
   for(let i=0;i<n/2;i++){
    let h=a[i],aw=a[n-1-i]; if(!h||!aw)continue;
    if((r+leg)%2){const x=h;h=aw;aw=x}
    games.push({home:leg?h:aw,away:leg?aw:h});
   }
   rounds.push(games);
   a=[a[0],a[n-1],...a.slice(1,n-1)];
  }
 }
 return rounds;
}
I.schedule=schedule();

function blankTable(){
 const x={};I.teams.forEach(t=>x[t.name]={name:t.name,gp:0,w:0,l:0,ot:0,gf:0,ga:0,pts:0});return x;
}
function conditions(players){
 const x={};players.forEach(p=>x[p.id]={energy:95,form:p.form||78,happiness:75,injury:0,xp:0});return x;
}
function contracts(players){
 const x={};players.forEach(p=>x[p.id]={salary:Math.max(6000,Math.round(((p.ovr-65)*800+6000)/1000)*1000),years:p.age<=23?3:p.age>=30?1:2});return x;
}
I.freshState=function(profile={}){
 const ps=clone(I.basePlayers),diff=profile.difficulty||"normal";
 const startBudget=diff==="easy"?1500000:diff==="hard"?1050000:1250000;
 return{
  schema:1,build:I.VERSION,manager:{name:profile.name||"Manager",difficulty:diff,level:1,xp:0,reputation:20},
  seasonYear:2026,phase:"regular",round:0,table:blankTable(),history:[],champions:[],
  players:ps,rosterIds:ps.map(p=>p.id),lineup:clone(I.defaultLineup),conditions:conditions(ps),contracts:contracts(ps),playerStats:Object.fromEntries(ps.map(p=>[p.id,{gp:0,g:0,a:0,pts:0}])),
  tactics:{approach:"balanced"},training:{focus:"balanced",intensity:"normal",doneRound:-1},
  budget:startBudget,finance:{revenue:0,costs:0,profit:0,ticketPrice:24,fans:6200,capacity:6500,sponsorPerRound:90000},
  facilities:{arena:1,training:1,medical:1,academy:1,shop:1,catering:1},youth:{lastSeason:0,graduates:0},
  market:clone(I.marketSeed),news:["🏒 Die Saison 2026/27 beginnt. Frost City HC will in die Playoffs."],
  inbox:[],objectives:{},live:null,playoffs:null,audio:{enabled:true},
  playerStats:Object.fromEntries(ps.map(p=>[p.id,{gp:0,g:0,a:0,pts:0,pim:0,plusMinus:0,shots:0,sv:0,sa:0,so:0}])),
  careerStats:Object.fromEntries(ps.map(p=>[p.id,{gp:0,g:0,a:0,pts:0,pim:0,plusMinus:0,shots:0,sv:0,sa:0,so:0,seasons:0}])),
  staff:{head:null,assistant:null,scout:null,physio:null},
  leadership:{captain:1,alternates:[13,21]},
  specialTeams:{pp1:[2,1,3,13,16],pp2:[5,4,6,14,15],pk1:[1,3,13,14],pk2:[4,6,15,17]},
  identity:"balanced",
  sponsor:null,sponsorPaid:false,reputation:20,
  scouting:{reports:{},lastRound:-1},
  awards:[],hallOfFame:[],achievements:{},
  records:{team:{mostWins:{value:0,season:null},mostPoints:{value:0,season:null},bestGoalDiff:{value:-999,season:null}},players:{}},
  seasonHistory:[],
  rivalry:{},
  seasonStory:{messages:[],flags:{},choices:{}},
  meta:{createdAt:Date.now(),lastSaved:Date.now()}
 };
};
const KEY="ihm_rebuild_v1";
I.hasSave=()=>{try{return !!localStorage.getItem(KEY)}catch(e){return false}};
I.save=function(){
 if(!I.state)return;
 I.state.build=I.VERSION;I.state.meta=I.state.meta||{};I.state.meta.lastSaved=Date.now();
 try{localStorage.setItem(KEY,JSON.stringify(I.state));return true}catch(e){return false}
};
I.load=function(){
 try{const raw=localStorage.getItem(KEY);if(raw){I.state=JSON.parse(raw);return I.state}}catch(e){}
 return null;
};
I.exportSave=function(){
 const blob=new Blob([JSON.stringify(I.state,null,2)],{type:"application/json"});
 const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`ice-hockey-manager-${I.state.seasonYear}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)
};
I.importSave=function(file,done){
 const r=new FileReader();r.onload=()=>{try{const s=JSON.parse(r.result);if(!s||!s.schema)throw Error();I.state=s;I.save();done(true)}catch(e){done(false)}};r.readAsText(file)
};
I.reset=function(profile){I.state=I.freshState(profile);I.save();return I.state};
I.addNews=function(x){I.state.news.unshift(x);I.state.news=I.state.news.slice(0,15)};
I.addMoney=function(n,label){
 I.state.budget+=n;
 if(n>=0)I.state.finance.revenue+=n;else I.state.finance.costs+=-n;
 I.state.finance.profit=I.state.finance.revenue-I.state.finance.costs;
 if(label)I.addNews(`${n>=0?"💰":"💸"} ${label}: ${I.money(n)}`);
};
I.getRoster=()=>I.state.rosterIds.map(I.player).filter(Boolean);
I.condition=id=>I.state.conditions[id]||(I.state.conditions[id]={energy:95,form:75,happiness:75,injury:0,xp:0});
I.effective=function(p){
 const c=I.condition(p.id),m=(c.form-75)*.035+(c.happiness-75)*.018+(c.energy-80)*.012;
 return I.clamp(Math.round(p.ovr+m),55,95)
};
I.sortedTable=function(){
 return Object.values(I.state.table).sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf)
};
I.rank=()=>I.sortedTable().findIndex(x=>x.name===I.USER)+1;

I.stat=id=>I.state.playerStats[id]||(I.state.playerStats[id]={gp:0,g:0,a:0,pts:0,pim:0,plusMinus:0,shots:0,sv:0,sa:0,so:0});
I.careerStat=id=>I.state.careerStats[id]||(I.state.careerStats[id]={gp:0,g:0,a:0,pts:0,pim:0,plusMinus:0,shots:0,sv:0,sa:0,so:0,seasons:0});
I.staffMember=id=>I.staffPool.find(x=>x.id===id);
I.teamOverall=function(){
 const r=I.getRoster();return Math.round(r.reduce((s,p)=>s+I.effective(p),0)/Math.max(1,r.length))
};
I.managerXP=function(n){
 I.state.manager.xp=(I.state.manager.xp||0)+n;
 const needed=I.state.manager.level*100;
 if(I.state.manager.xp>=needed){I.state.manager.xp-=needed;I.state.manager.level++;I.addNews(`🎧 Manager-Level ${I.state.manager.level} erreicht.`)}
};
I.addRep=function(n){I.state.reputation=I.clamp((I.state.reputation||20)+n,0,100)};


I.identity=()=>I.teamIdentities.find(x=>x.id===I.state.identity)||I.teamIdentities[3];
I.isRival=name=>(I.rivals[I.USER]||[]).includes(name);
I.lineChemistry=function(ids){
 const ps=(ids||[]).map(I.player).filter(Boolean);if(!ps.length)return 50;
 let score=70;
 const ages=ps.map(p=>p.age),avg=ages.reduce((a,b)=>a+b,0)/ages.length;
 const ageSpread=Math.max(...ages)-Math.min(...ages); score-=Math.max(0,ageSpread-7)*1.2;
 const roles=ps.map(p=>p.role||"");
 if(new Set(roles).size===ps.length)score+=6;
 const forms=ps.map(p=>I.condition(p.id).form),favg=forms.reduce((a,b)=>a+b,0)/forms.length;score+=(favg-75)*.22;
 if((ids||[]).includes(I.state.leadership.captain))score+=3;
 return I.clamp(Math.round(score),35,100)
};
I.teamChemistry=function(){
 const L=I.state.lineup,groups=[L.f1,L.f2,L.f3,L.f4,L.d1,L.d2,L.d3];
 return Math.round(groups.reduce((s,g)=>s+I.lineChemistry(g),0)/groups.length)
};
I.recordFor=id=>{
 I.state.records.players[id]=I.state.records.players[id]||{games:0,goals:0,assists:0,points:0};
 return I.state.records.players[id]
};

})(typeof window!=="undefined"?window:globalThis);
