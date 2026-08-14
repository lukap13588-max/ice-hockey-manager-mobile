(function(g){
const I=g.IHM=g.IHM||{};

I.ensureReleaseSystems=function(){
 I.ensureUniverse?.();
 const s=I.state;
 s.release=s.release||{version:"1.0",featureFreeze:true};
 s.worldCup=s.worldCup||{history:[],current:null};
 s.leagueEconomy=s.leagueEconomy||{};
 I.leagueDefs.forEach(ld=>{
   s.leagueEconomy[ld.id]=s.leagueEconomy[ld.id]||{
     salaryFactor:ld.salary,
     winBonus:Math.round(ld.prestige*900),
     titleBonus:Math.round(ld.prestige*18000),
     mediaValue:Math.round(ld.prestige*12500)
   };
 });
 s.managerCareer=s.managerCareer||{club:I.USER,league:"ALP",seasons:0,reputation:20,offers:[]};
 s.managerCareer.club=s.managerCareer.club||I.USER;
 s.managerCareer.league=s.managerCareer.league||"ALP";
 s.managerCareer.offers=Array.isArray(s.managerCareer.offers)?s.managerCareer.offers:[];
 s.managerCareer.history=Array.isArray(s.managerCareer.history)?s.managerCareer.history:[{season:s.seasonYear,club:s.managerCareer.club,league:s.managerCareer.league}];
};

I.playWorldChampionsCup=function(){
 I.ensureReleaseSystems();
 const season=I.state.seasonYear;
 if(I.state.worldCup.current?.season===season)return I.state.worldCup.current;
 const entrants=I.leagueDefs.map(ld=>{
   const L=I.state.universe.leagues[ld.id];
   const team=L.champion||I.sortedLeague(ld.id)[0]?.name;
   const def=ld.teams.find(t=>t[0]===team);
   return{league:ld.id,team,badge:def?.[1]||"🏒",rating:def?.[2]||78}
 }).filter(x=>x.team);
 const games=[];
 let pool=[...entrants].sort(()=>Math.random()-.5);
 while(pool.length>1){
   const a=pool.shift(),b=pool.shift();
   if(!b){pool.push(a);break}
   const as=a.rating+Math.random()*14,bs=b.rating+Math.random()*14;
   const winner=as>=bs?a:b,loser=winner===a?b:a;
   games.push({a:a.team,b:b.team,winner:winner.team,round:"Knockout"});
   winner.rating=Math.min(96,winner.rating+1);pool.push(winner)
 }
 const champion=pool[0]||entrants[0];
 const cup={season,champion:champion?.team||"-",badge:champion?.badge||"🏆",games,entrants:entrants.map(x=>x.team)};
 I.state.worldCup.current=cup;
 I.state.worldCup.history.unshift(cup);
 if(cup.champion===I.state.managerCareer.club){
   I.addMoney?.(1500000,"World Champions Cup");
   I.addRep?.(15);I.addTrophy?.("world","World Champions Cup");
 }
 I.save();return cup
};

I.releaseSeasonAwards=function(){
 const top=I.sortedTable?.()||[];
 const champion=I.state.playoffs?.champion||top[0]?.name||"-";
 const stats=I.getRoster?.().map(p=>({p,st:I.stat(p.id)}))||[];
 const scorer=stats.sort((a,b)=>b.st.pts-a.st.pts)[0];
 return{
   champion,
   scorer:scorer?`${scorer.p.name} · ${scorer.st.pts} PTS`:"-",
   manager:I.rank?.()<=3?"Elite":"Developing",
   world:I.state.worldCup?.current?.champion||"-"
 }
};

I.leagueEconomyInfo=function(id){
 I.ensureReleaseSystems();const ld=I.leagueById(id),e=I.state.leagueEconomy[id];
 return{...e,league:ld?.name||id,prestige:ld?.prestige||0};
};

I.recordManagerMove=function(){
 I.ensureReleaseSystems();
 const h=I.state.managerCareer.history,last=h[h.length-1];
 if(!last||last.club!==I.state.managerCareer.club||last.league!==I.state.managerCareer.league)
   h.push({season:I.state.seasonYear,club:I.state.managerCareer.club,league:I.state.managerCareer.league});
};

I.releaseTick=function(){
 I.ensureReleaseSystems();I.recordManagerMove();I.save()
};
})(window);