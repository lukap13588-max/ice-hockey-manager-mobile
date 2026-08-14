(function(g){
const I=g.IHM=g.IHM||{};

function staffBonus(type){
 const id=I.state.staff?.[type];if(!id)return 0;
 const s=I.staffMember(id);return s?Math.max(0,(s.rating-70)/100):0
}
function strength(name){
 if(name!==I.USER){
   const base=I.team(name)?.rating||75;
   return base + Math.sin((I.state.seasonYear-2026)*.9 + base)*1.2;
 }
 const ids=[...I.state.lineup.f1,...I.state.lineup.f2,...I.state.lineup.f3,...I.state.lineup.f4,...I.state.lineup.d1,...I.state.lineup.d2,...I.state.lineup.d3,I.state.lineup.g1];
 const ps=ids.map(I.player).filter(Boolean);
 let avg=ps.reduce((s,p)=>s+I.effective(p),0)/Math.max(1,ps.length);
 if(I.state.training.doneRound===I.state.round)avg+=.8;
 avg+=staffBonus("head")*4+staffBonus("assistant")*2;
 avg+=(I.teamChemistry()-70)*.035;
 const ident=I.state.identity;
 if(ident==="speed")avg+=.35;
 if(ident==="possession")avg+=.45;
 if(ident==="physical")avg+=.25;
 const d=I.state.manager.difficulty;
 if(d==="easy")avg+=2.2;if(d==="hard")avg-=1.8;
 return avg;
}
function tactic(){
 const x=I.state.tactics.approach;
 if(x==="attack")return{atk:1.075,def:.955,shots:1.08,pen:1.08};
 if(x==="protect")return{atk:.965,def:1.075,shots:.96,pen:.92};
 return{atk:1,def:1,shots:1,pen:1};
}
function poisson(lambda){
 let L=Math.exp(-lambda),k=0,p=1;do{k++;p*=Math.random()}while(p>L);return k-1;
}
function chooseWeighted(list,fn){
 const total=list.reduce((s,x)=>s+Math.max(.1,fn(x)),0);let x=Math.random()*total;
 for(const p of list){x-=Math.max(.1,fn(p));if(x<=0)return p}return list[0]
}
function forwards(){return [...I.state.lineup.f1,...I.state.lineup.f2,...I.state.lineup.f3,...I.state.lineup.f4].map(I.player).filter(Boolean)}
function defense(){return [...I.state.lineup.d1,...I.state.lineup.d2,...I.state.lineup.d3].map(I.player).filter(Boolean)}
function scorer(){
 const pool=forwards();return chooseWeighted(pool,p=>(p.shot||70)*I.effective(p)/80)
}
function assister(exclude){
 const pool=forwards().filter(p=>p.id!==exclude?.id).concat(defense());return chooseWeighted(pool,p=>(p.pass||70))
}
function liveEventGoal(team,period,pp=false){
 const min=I.rnd((period-1)*20+1,period*20),sec=String(I.rnd(0,59)).padStart(2,"0");
 if(team===I.USER){
   const s=scorer(),a1=assister(s),a2=Math.random()<.55?assister(a1):null;
   const st=I.stat(s.id);st.g++;st.pts++;st.shots+=I.rnd(2,5);
   if(a1){const x=I.stat(a1.id);x.a++;x.pts++}
   if(a2&&a2.id!==s.id&&a2.id!==a1?.id){const x=I.stat(a2.id);x.a++;x.pts++}
   return{time:`${min}:${sec}`,team,type:"goal",player:s.name,pp,text:`🥅 TOR ${I.USER}! ${s.name}${a1?` (${a1.name})`:""}${pp?" · POWERPLAY":""}`}
 }
 return{time:`${min}:${sec}`,team,type:"goal",pp,text:`Tor ${team}${pp?" · Powerplay":""}`}
}
function simulatePeriod(home,away,period){
 const hs=strength(home),as=strength(away),uH=home===I.USER,uA=away===I.USER,t=tactic();
 let ha=hs,aa=as,hshots=10+(hs-as)*.085,ashots=10+(as-hs)*.085;
 if(uH){ha*=t.atk;aa/=t.def;hshots*=t.shots}
 if(uA){aa*=t.atk;ha/=t.def;ashots*=t.shots}
 let hPP=Math.random()<.45?1:0,aPP=Math.random()<.45?1:0;
 if(uH&&I.specialTeamsRating("pp")>=80)hPP+=Math.random()<.18?1:0;
 if(uA&&I.specialTeamsRating("pp")>=80)aPP+=Math.random()<.18?1:0;
 const hg=poisson(I.clamp(.95+(ha-aa)*.017+hPP*.17,.28,1.85));
 const ag=poisson(I.clamp(.95+(aa-ha)*.017+aPP*.17,.28,1.85));
 const hS=Math.max(hg+4,Math.round(hshots+I.rnd(-3,3))),aS=Math.max(ag+4,Math.round(ashots+I.rnd(-3,3)));
 const ev=[];
 for(let i=0;i<hg;i++)ev.push(liveEventGoal(home,period,i<hPP));
 for(let i=0;i<ag;i++)ev.push(liveEventGoal(away,period,i<aPP));
 if(Math.random()<.45)ev.push({time:`${I.rnd((period-1)*20+1,period*20)}:${String(I.rnd(0,59)).padStart(2,"0")}`,team:Math.random()<.5?home:away,type:"penalty",text:"2 Minuten Strafe"});
 ev.sort((a,b)=>a.time.localeCompare(b.time));
 return{hg,ag,hs:hS,as:aS,hPP,aPP,events:ev}
}
function applyTable(home,away,hg,ag){
 const h=I.state.table[home],a=I.state.table[away];h.gp++;a.gp++;h.gf+=hg;h.ga+=ag;a.gf+=ag;a.ga+=hg;
 if(hg>ag){h.w++;a.l++;h.pts+=3}else{a.w++;h.l++;a.pts+=3}
}
function simGame(home,away){
 let hg=0,ag=0;for(let p=1;p<=3;p++){const r=simulatePeriod(home,away,p);hg+=r.hg;ag+=r.ag}
 while(hg===ag){Math.random()<.5?hg++:ag++}
 return{home,away,hg,ag}
}
function updateUserStatsAfterGame(L){
 const roster=I.getRoster();
 roster.forEach(p=>{
   const st=I.stat(p.id),cs=I.careerStat(p.id);
   st.gp++;cs.gp++;
   st.shots+=p.pos!=="G"?I.rnd(0,4):0;
   if(p.pos==="G"&&p.id===I.state.lineup.g1){
     const userHome=L.fixture.home===I.USER;
     const sa=userHome?L.as:L.hs,ga=userHome?L.ag:L.hg;
     st.sa+=sa;st.sv+=Math.max(0,sa-ga);if(ga===0)st.so++;
     cs.sa+=sa;cs.sv+=Math.max(0,sa-ga);if(ga===0)cs.so++;
   }
   cs.g=st.g; cs.a=st.a; cs.pts=st.pts; cs.pim=st.pim; cs.plusMinus=st.plusMinus; cs.shots=st.shots;
 })
}
function updateMoraleAndInjuries(won){
 const med=staffBonus("physio"),medical=1+(I.state.facilities.medical-1)*.09;
 I.getRoster().forEach(p=>{
   const c=I.condition(p.id);
   c.energy=I.clamp(c.energy-I.rnd(4,8),35,100);
   c.form=I.clamp(c.form+(won?I.rnd(0,2):I.rnd(-2,1)),48,99);
   c.happiness=I.clamp(c.happiness+(won?1:-1),30,100);
   if(c.injury<=0 && Math.random() < .014/(medical*(1+med))){
     c.injury=I.rnd(1,4);I.addNews(`🩺 ${p.name} fällt ${c.injury} Spieltag(e) aus.`)
   }
 })
}
function homeRevenue(){
 const cap=6500+(I.state.facilities.arena-1)*1200;
 const rep=(I.state.reputation||20)/100;
 const interest=I.clamp(.56+(I.state.finance.fans/22000)+(I.rank()<=4?.08:0)+rep*.13,.42,1);
 const att=Math.min(cap,Math.round(cap*interest*(31/Math.max(16,I.state.finance.ticketPrice))));
 const rev=att*I.state.finance.ticketPrice + att*(2.6+I.state.facilities.catering*.9)+I.state.facilities.shop*2200;
 I.state.finance.fans=I.clamp(I.state.finance.fans+I.rnd(-20,70)+(I.rank()<=4?35:0),3500,35000);
 I.addMoney(Math.round(rev),`Heimspiel (${att.toLocaleString("de-DE")} Zuschauer)`);
}
function monthlyPayroll(){
 const wages=I.getRoster().reduce((s,p)=>s+(I.state.contracts[p.id]?.salary||0),0);
 const staff=Object.values(I.state.staff||{}).reduce((s,id)=>s+(I.staffMember(id)?.salary||0),0);
 I.addMoney(-(wages+staff), "Gehälter & Staff");
}
function sponsorGoalMet(){
 const sp=I.sponsors.find(x=>x.id===I.state.sponsor);if(!sp)return false;
 const r=I.state.table[I.USER],rank=I.rank();
 if(sp.goal==="playoffs")return rank<=4;
 if(sp.goal==="top2")return rank<=2;
 if(sp.goal==="wins10")return r.w>=10;
 if(sp.goal==="champion")return I.state.playoffs?.champion===I.USER;
 return false
}
I.chooseSponsor=function(id){
 const s=I.sponsors.find(x=>x.id===id);if(!s||I.state.sponsor)return false;
 I.state.sponsor=id;I.addMoney(s.base,`Sponsor ${s.name}`);I.state.sponsorPaid=true;I.addNews(`🤝 ${s.name} wird Hauptsponsor.`);I.save();return true
};
I.nextUserGame=function(){
 if(I.state.phase!=="regular")return null;
 return (I.schedule[I.state.round]||[]).find(g=>g.home===I.USER||g.away===I.USER)||null
};
I.startMatch=function(){
 if(I.state.live&&!I.state.live.finished)return I.state.live;
 const f=I.nextUserGame();if(!f)return null;
 I.state.live={fixture:f,period:0,hg:0,ag:0,hs:0,as:0,periods:[],events:[],finished:false,momentum:50,pp:{home:0,away:0},coachUsed:{}};
 I.save();return I.state.live
};
I.playPeriod=function(){
 const L=I.state.live;if(!L||L.finished)return L;
 const p=L.period+1;if(p>3)return I.finishLive();
 const r=simulatePeriod(L.fixture.home,L.fixture.away,p);
 L.period=p;L.hg+=r.hg;L.ag+=r.ag;L.hs+=r.hs;L.as+=r.as;L.pp.home+=r.hPP;L.pp.away+=r.aPP;L.periods.push(r);L.events.push(...r.events);
 const uH=L.fixture.home===I.USER;const diff=uH?(r.hg-r.ag):(r.ag-r.hg);
 L.momentum=I.clamp(L.momentum+diff*9+I.rnd(-4,4),10,90);
 if(p===3)return I.finishLive();I.save();return L
};
I.coachTalk=function(kind){
 const L=I.state.live;if(!L||L.finished||L.period<1||L.period>2||L.coachUsed[L.period])return false;
 L.coachUsed[L.period]=kind;
 I.getRoster().forEach(p=>{
   const c=I.condition(p.id);
   if(kind==="fire"){c.form=I.clamp(c.form+1,50,99);c.energy=I.clamp(c.energy-2,35,100)}
   if(kind==="calm"){c.happiness=I.clamp(c.happiness+1,30,100);c.energy=I.clamp(c.energy+1,35,100)}
   if(kind==="adjust"){c.form=I.clamp(c.form+1,50,99)}
 });
 L.events.push({time:`${L.period*20}:00`,team:I.USER,type:"coach",text:`🎧 Coaching: ${kind==="fire"?"Mehr Intensität":kind==="calm"?"Ruhe & Fokus":"Taktisch anpassen"}`});
 I.save();return true
};
I.finishLive=function(){
 const L=I.state.live;if(!L||L.finished)return L;
 while(L.hg===L.ag){Math.random()<.5?L.hg++:L.ag++;L.events.push({time:"OT",team:L.hg>L.ag?L.fixture.home:L.fixture.away,type:"goal",text:"Entscheidung in der Verlängerung!"})}
 L.finished=true;applyTable(L.fixture.home,L.fixture.away,L.hg,L.ag);
 const won=L.fixture.home===I.USER?L.hg>L.ag:L.ag>L.hg;
 updateUserStatsAfterGame(L);updateMoraleAndInjuries(won);
 I.addNews(`${won?"✅":"❌"} ${L.fixture.home} ${L.hg}:${L.ag} ${L.fixture.away}`);
 I.state.history=I.state.history||[];I.state.history.push({round:I.state.round,home:L.fixture.home,away:L.fixture.away,hg:L.hg,ag:L.ag});I.state.history=I.state.history.slice(-80);
 if(L.fixture.home===I.USER)homeRevenue();
 I.addMoney(-17000,"Spieltagskosten");
 I.managerXP(won?18:9);I.addRep(won?1:0);
 const opp=L.fixture.home===I.USER?L.fixture.away:L.fixture.home;I.rivalryTick(opp,won);
 I.storyTick();I.proTick();
 I.save();return L
};
I.advanceRound=function(){
 const games=I.schedule[I.state.round]||[];
 for(const f of games){if(f.home===I.USER||f.away===I.USER)continue;const x=simGame(f.home,f.away);applyTable(x.home,x.away,x.hg,x.ag)}
 I.simOtherLeaguesRound?.();
 I.state.round++;I.state.live=null;
 I.getRoster().forEach(p=>{const c=I.condition(p.id);c.energy=I.clamp(c.energy+I.rnd(4,8),35,100);if(c.injury>0)c.injury--});
 if(I.state.round%3===0)monthlyPayroll();
 if(I.state.round>=I.schedule.length)I.startPlayoffs();
 I.storyTick();I.save()
};
I.completeGameDay=function(){if(!I.state.live?.finished)return false;I.advanceRound();return true};

I.runTraining=function(focus,intensity){
 if(I.state.training.doneRound===I.state.round)return false;
 const mult=intensity==="light"?.65:intensity==="hard"?1.3:1;
 const facility=1+(I.state.facilities.training-1)*.09+staffBonus("assistant")*.12;
 I.getRoster().forEach(p=>{
  const c=I.condition(p.id),young=p.age<=23?1.28:p.age>=30?.58:1;
  c.xp+=(8*mult*facility*young);c.energy=I.clamp(c.energy-(intensity==="hard"?10:intensity==="light"?3:6),35,100);
  if(focus==="offense"&&p.pos!=="G")p.shot+=Math.random()<.08*mult?1:0;
  if(focus==="defense"&&p.pos==="D")p.def+=Math.random()<.08*mult?1:0;
  if(focus==="skills"&&p.pos!=="G")p.pass+=Math.random()<.06*mult?1:0;
  if(c.xp>=100){c.xp-=100;p.ovr=I.clamp(p.ovr+1,55,93)}
 });
 I.state.training={focus,intensity,doneRound:I.state.round};I.addNews(`🏋️ Training: ${focus} / ${intensity}`);I.managerXP(4);I.save();return true
};
I.autoLineup=function(){
 const roster=I.getRoster().filter(p=>I.condition(p.id).injury<=0).sort((a,b)=>I.effective(b)-I.effective(a));
 const by=pos=>roster.filter(p=>p.pos===pos),lw=by("LW"),c=by("C"),rw=by("RW"),d=by("D"),gg=by("G");
 const pick=(arr,i,fallback)=>arr[i]?.id||fallback[i]?.id||fallback[0]?.id;
 const w=roster.filter(p=>["LW","RW"].includes(p.pos));
 I.state.lineup={
  f1:[pick(lw,0,w),pick(c,0,roster),pick(rw,0,w)],f2:[pick(lw,1,w),pick(c,1,roster),pick(rw,1,w)],
  f3:[pick(lw,2,w),pick(c,2,roster),pick(rw,2,w)],f4:[pick(lw,3,w),pick(c,3,roster),pick(rw,3,w)],
  d1:[d[0]?.id,d[1]?.id],d2:[d[2]?.id,d[3]?.id],d3:[d[4]?.id,d[5]?.id],g1:gg[0]?.id,g2:gg[1]?.id
 };I.save()
};
I.buyPlayer=function(id){
 const x=I.state.market.find(p=>p.id===Number(id));if(!x)return{ok:false,msg:"Spieler nicht gefunden"};
 if(I.state.budget<x.price)return{ok:false,msg:"Budget reicht nicht"};
 I.addMoney(-x.price,`Transfer ${x.name}`);
 const p={...x,form:78};I.state.players.push(p);I.state.rosterIds.push(p.id);I.state.conditions[p.id]={energy:95,form:78,happiness:78,injury:0,xp:0};
 I.state.contracts[p.id]={salary:x.salary,years:2};I.state.playerStats[p.id]={gp:0,g:0,a:0,pts:0,pim:0,plusMinus:0,shots:0,sv:0,sa:0,so:0};
 I.state.careerStats[p.id]={gp:0,g:0,a:0,pts:0,pim:0,plusMinus:0,shots:0,sv:0,sa:0,so:0,seasons:0};
 I.state.market=I.state.market.filter(m=>m.id!==p.id);I.addNews(`✍️ ${p.name} unterschreibt.`);I.managerXP(5);I.save();return{ok:true}
};
I.sellPlayer=function(id){
 id=Number(id);const p=I.player(id);if(!p||I.state.rosterIds.length<=18)return{ok:false,msg:"Kader wäre zu klein"};
 const value=Math.max(60000,Math.round(((p.ovr-65)*26000+70000)*(p.age<=23?1.15:p.age>=31?.8:1)/5000)*5000);
 I.state.rosterIds=I.state.rosterIds.filter(x=>x!==id);I.addMoney(value,`Verkauf ${p.name}`);I.addNews(`⇄ ${p.name} verlässt den Club.`);I.autoLineup();I.save();return{ok:true,value}
};
I.extendContract=function(id,years){
 const p=I.player(id),c=I.state.contracts[id];if(!p||!c)return false;
 const salary=Math.round((6000+(p.ovr-65)*1050)*(1+(I.condition(id).happiness<60?.12:0))/1000)*1000;
 const bonus=salary*2;if(I.state.budget<bonus)return false;
 I.addMoney(-bonus,`Unterschriftsbonus ${p.name}`);c.years=years;c.salary=salary;I.condition(id).happiness=I.clamp(I.condition(id).happiness+4,30,100);I.save();return true
};
I.hireStaff=function(id){
 const s=I.staffMember(id);if(!s)return false;
 const key=s.type==="Head Coach"?"head":s.type==="Assistant Coach"?"assistant":s.type==="Scout"?"scout":"physio";
 I.state.staff[key]=id;I.addNews(`👔 ${s.name} wird ${s.type}.`);I.save();return true
};
I.scoutPlayer=function(id){
 const p=I.state.market.find(x=>x.id===Number(id));if(!p)return null;
 const bonus=staffBonus("scout")*15,accuracy=I.clamp(.68+bonus/100+(I.state.facilities.academy-1)*.03,.68,.95);
 const report={ceiling:I.clamp(Math.round(p.ovr+I.rnd(1,10)*accuracy),p.ovr,94),risk:I.rnd(1,5),fit:["Top-6","Bottom-6","Powerplay","Penalty Kill","Prospect"][I.rnd(0,4)],accuracy:Math.round(accuracy*100)};
 I.state.scouting.reports[p.id]=report;I.save();return report
};
I.upgradeFacility=function(key){
 const lvl=I.state.facilities[key],def=I.facilities[key];if(!def||lvl>=5)return false;
 const cost=Math.round(def.base*Math.pow(1.55,lvl-1));if(I.state.budget<cost)return false;
 I.addMoney(-cost,`${def.name} Ausbau`);I.state.facilities[key]++;I.addRep(1);I.managerXP(6);I.addNews(`${def.icon} ${def.name} erreicht Level ${lvl+1}.`);I.save();return true
};
I.storyTick=function(){
 const S=I.state.seasonStory;if(!S)return;
 const key=`${I.state.seasonYear}:${I.state.round}`;if(S.flags[key])return;S.flags[key]=true;
 const r=I.state.table[I.USER],rank=I.rank();
 let msg=null;
 if(I.state.round===0)msg={from:"Präsident",title:"Neue Saison",text:"Der Vorstand erwartet Fortschritt und einen konkurrenzfähigen Club."};
 else if(r.w>=3&&!S.flags.win3){S.flags.win3=true;msg={from:"Sportdirektor",title:"Gute Phase",text:"Die Kabine glaubt an den Kurs. Jetzt nicht nachlassen."}}
 else if(rank<=3&&I.state.round>=5&&!S.flags.top3){S.flags.top3=true;msg={from:"Presse",title:"Frost City oben dabei",text:"Die Erwartungen steigen. Fans sprechen bereits von einem Titelkandidaten."}}
 else if(rank>=8&&I.state.round>=6&&!S.flags.crisis){S.flags.crisis=true;msg={from:"Vorstand",title:"Druck wächst",text:"Die aktuelle Platzierung ist unter den Erwartungen. Der Vorstand verlangt eine Reaktion."}}
 if(msg){S.messages.unshift({...msg,round:I.state.round,season:I.state.seasonYear});S.messages=S.messages.slice(0,12)}
};
I.startPlayoffs=function(){
 const top=I.sortedTable().slice(0,4).map(x=>x.name);
 I.state.phase="playoffs";I.state.playoffs={round:"semi",series:[{a:top[0],b:top[3],aw:0,bw:0},{a:top[1],b:top[2],aw:0,bw:0}],champion:null};
 I.addNews("🏆 Playoffs beginnen. Best-of-3.");I.addRep(2);I.save()
};
function playoffOne(s){const x=simGame(s.a,s.b);if(x.hg>x.ag)s.aw++;else s.bw++;return x}
I.simPlayoffStep=function(){
 const P=I.state.playoffs;if(!P||P.champion)return;
 if(P.round==="semi"){
  P.series.forEach(s=>{if(s.aw<2&&s.bw<2)playoffOne(s)});
  if(P.series.every(s=>s.aw===2||s.bw===2)){const w=P.series.map(s=>s.aw===2?s.a:s.b);P.round="final";P.series=[{a:w[0],b:w[1],aw:0,bw:0}];I.addNews(`🏆 Finale: ${w[0]} vs ${w[1]}`)}
 }else{
  const s=P.series[0];if(s.aw<2&&s.bw<2)playoffOne(s);
  if(s.aw===2||s.bw===2){
    P.champion=s.aw===2?s.a:s.b;I.state.champions.unshift({year:I.state.seasonYear,team:P.champion});
    if(P.champion===I.USER){I.addRep(10);I.managerXP(100);I.addTrophy("championship","League Championship")}
    const sp=I.sponsors.find(x=>x.id===I.state.sponsor);if(sp&&sponsorGoalMet())I.addMoney(sp.bonus,`Sponsorbonus ${sp.name}`);
    I.addNews(`🏆 MEISTER: ${P.champion}`);I.calculateAwards()
  }
 }I.save()
};
I.calculateAwards=function(){
 const skaters=I.getRoster().filter(p=>p.pos!=="G").map(p=>({p,st:I.stat(p.id)}));
 const goalies=I.getRoster().filter(p=>p.pos==="G").map(p=>({p,st:I.stat(p.id)}));
 const scorer=skaters.sort((a,b)=>b.st.pts-a.st.pts)[0],mvp=skaters.sort((a,b)=>(b.st.pts+b.st.g*.3)-(a.st.pts+a.st.g*.3))[0];
 const goalie=goalies.sort((a,b)=>((b.st.sv/Math.max(1,b.st.sa))-(a.st.sv/Math.max(1,a.st.sa))))[0];
 const def=skaters.filter(x=>x.p.pos==="D").sort((a,b)=>b.st.pts-a.st.pts)[0];
 const rookie=skaters.filter(x=>x.p.age<=23).sort((a,b)=>b.st.pts-a.st.pts)[0];
 const arr=[];if(mvp)arr.push({award:"MVP",player:mvp.p.name});if(scorer)arr.push({award:"Top Scorer",player:scorer.p.name});
 if(goalie)arr.push({award:"Best Goalie",player:goalie.p.name});if(def)arr.push({award:"Best Defenseman",player:def.p.name});if(rookie)arr.push({award:"Rookie of the Year",player:rookie.p.name});
 I.state.awards.unshift({season:I.state.seasonYear,items:arr});I.addNews(`🏅 Saison-Awards wurden vergeben.`)
};
function generateMarket(){
 const first=["Mason","Elias","Viktor","Noah","Jonas","Liam","Anton","Leo","Eric","Felix","Simon","Theo","Nils","Adam","Mika"];
 const last=["Reed","Keller","Novak","Berg","Andersson","Rossi","Dubois","Hartmann","König","Sokolov","Pierce","Lind","Frei"];
 const pos=["C","LW","RW","D","D","G"];const arr=[];
 for(let i=0;i<12;i++){const o=I.rnd(71,84),p=pos[I.rnd(0,pos.length-1)],id=I.state.seasonYear*100+i+500;
  arr.push({id,pos:p,name:`${first[I.rnd(0,first.length-1)]} ${last[I.rnd(0,last.length-1)]}`,age:I.rnd(20,31),ovr:o,shot:p==="G"?0:I.rnd(o-5,o+4),pass:p==="G"?0:I.rnd(o-5,o+4),skate:p==="G"?0:I.rnd(o-4,o+4),def:p==="G"?0:I.rnd(o-6,o+5),role:p==="G"?"Goalie":"Pro",price:Math.random()<.25?0:Math.round((o-68)*45000/5000)*5000,salary:Math.round((o-68)*1800/1000)*1000+8000})
 }I.state.market=arr
}
I.newSeason=function(){
 I.finishUniverseSeason?.();
 if(!I.state.playoffs?.champion)return false;
 I.archiveSeason();
 // archive and reset stats
 I.getRoster().forEach(p=>{
   const st=I.stat(p.id),cs=I.careerStat(p.id);cs.g+=st.g;cs.a+=st.a;cs.pts+=st.pts;cs.pim+=st.pim;cs.plusMinus+=st.plusMinus;cs.shots+=st.shots;cs.sv+=st.sv;cs.sa+=st.sa;cs.so+=st.so;cs.seasons++;
   I.state.playerStats[p.id]={gp:0,g:0,a:0,pts:0,pim:0,plusMinus:0,shots:0,sv:0,sa:0,so:0}
 });
 I.state.seasonYear++;I.state.phase="regular";I.state.round=0;
 I.state.table=Object.fromEntries(I.teams.map(t=>[t.name,{name:t.name,gp:0,w:0,l:0,ot:0,gf:0,ga:0,pts:0}]));
 I.state.playoffs=null;I.state.live=null;I.state.training.doneRound=-1;I.state.sponsor=null;I.state.sponsorPaid=false;I.state.seasonStory={messages:[],flags:{},choices:{}};
 I.getRoster().forEach(p=>{
   p.age++;const c=I.condition(p.id);c.energy=95;c.form=I.clamp(75+I.rnd(-5,7),55,95);
   const con=I.state.contracts[p.id];if(con){con.years--;if(con.years<=0)c.happiness=I.clamp(c.happiness-8,30,100)}
   if(p.age<=23&&Math.random()<.32)p.ovr=Math.min(93,p.ovr+1);if(p.age>=32&&Math.random()<.3)p.ovr=Math.max(60,p.ovr-1)
 });
 generateMarket();
 // annual academy prospect
 const id=I.state.seasonYear*1000+77,ovr=I.rnd(67,74)+(I.state.facilities.academy-1);
 const pos=["C","LW","RW","D","G"][I.rnd(0,4)];
 const prospect={id,pos,name:`Academy Prospect ${String(I.state.seasonYear).slice(-2)}`,age:18,ovr,shot:pos==="G"?0:ovr,pass:pos==="G"?0:ovr,skate:pos==="G"?0:ovr,def:pos==="G"?0:ovr,role:"Academy Prospect",form:76};
 I.state.players.push(prospect);I.state.rosterIds.push(id);I.state.conditions[id]={energy:95,form:76,happiness:85,injury:0,xp:0};I.state.contracts[id]={salary:5000,years:3};I.state.playerStats[id]={gp:0,g:0,a:0,pts:0,pim:0,plusMinus:0,shots:0,sv:0,sa:0,so:0};I.state.careerStats[id]={gp:0,g:0,a:0,pts:0,pim:0,plusMinus:0,shots:0,sv:0,sa:0,so:0,seasons:0};
 I.addNews(`🎓 ${prospect.name} steigt aus der Akademie auf.`);I.addNews(`📅 Saison ${I.state.seasonYear}/${String(I.state.seasonYear+1).slice(-2)} startet.`);I.save();return true
};
})(typeof window!=="undefined"?window:globalThis);