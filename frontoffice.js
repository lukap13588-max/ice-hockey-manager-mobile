(function(g){
const I=g.IHM=g.IHM||{};

I.setCaptain=function(id){
 id=Number(id);if(!I.player(id))return false;
 I.state.leadership.captain=id;
 I.addNews(`©️ ${I.player(id).name} wird neuer Captain.`);
 I.save();return true
};
I.setIdentity=function(id){
 if(!I.teamIdentities.some(x=>x.id===id))return false;
 I.state.identity=id;I.addNews(`${I.identity().icon} Neue Club-Identität: ${I.identity().name}`);I.save();return true
};
I.specialTeamsRating=function(kind){
 const ids=kind==="pp"?I.state.specialTeams.pp1:I.state.specialTeams.pk1;
 const ps=ids.map(I.player).filter(Boolean);
 if(!ps.length)return 50;
 if(kind==="pp")return Math.round(ps.reduce((s,p)=>s+(p.shot+p.pass+p.skate)/3,0)/ps.length);
 return Math.round(ps.reduce((s,p)=>s+((p.def||70)+(p.skate||70))/2,0)/ps.length);
};
I.negotiateContract=function(id,years,salary){
 id=Number(id);years=Number(years);salary=Number(salary);
 const p=I.player(id),c=I.state.contracts[id];if(!p||!c||years<1||years>5)return{ok:false,msg:"Ungültiges Angebot"};
 const market=Math.round((6000+(p.ovr-65)*1050)*(p.age<=23?1.05:p.age>=31?.94:1)/1000)*1000;
 const happiness=I.condition(id).happiness;
 let acceptance=.48+(salary-market)/Math.max(1,market)*.58+(years-2)*.05+(happiness-70)*.004;
 if(p.age>=31&&years>=4)acceptance-=.12;
 acceptance=I.clamp(acceptance,.08,.95);
 if(Math.random()>acceptance){
   I.condition(id).happiness=I.clamp(happiness-2,30,100);
   I.addNews(`❌ ${p.name} lehnt das Vertragsangebot ab.`);
   I.save();return{ok:false,msg:"Spieler lehnt ab",chance:Math.round(acceptance*100),market}
 }
 const bonus=Math.round(salary*1.5);
 if(I.state.budget<bonus)return{ok:false,msg:"Budget für Bonus reicht nicht"};
 I.addMoney(-bonus,`Signing Bonus ${p.name}`);c.years=years;c.salary=salary;
 I.condition(id).happiness=I.clamp(happiness+5,30,100);
 I.addNews(`✍️ ${p.name} verlängert um ${years} Jahre.`);
 I.save();return{ok:true,market}
};
I.rivalryTick=function(opponent,won){
 if(!I.isRival(opponent))return;
 const r=I.state.rivalry[opponent]||(I.state.rivalry[opponent]={games:0,w:0,l:0,intensity:50});
 r.games++;won?r.w++:r.l++;r.intensity=I.clamp(r.intensity+(won?2:1),50,100)
};
I.archiveSeason=function(){
 const row=I.state.table[I.USER],rank=I.rank(),champ=I.state.playoffs?.champion;
 const leaders=I.getRoster().map(p=>({id:p.id,name:p.name,pts:I.stat(p.id).pts,g:I.stat(p.id).g,a:I.stat(p.id).a})).sort((a,b)=>b.pts-a.pts);
 const snap={year:I.state.seasonYear,rank,w:row.w,l:row.l,pts:row.pts,gf:row.gf,ga:row.ga,champion:champ,teamLeader:leaders[0]?.name||"-",teamLeaderPts:leaders[0]?.pts||0};
 I.state.seasonHistory.unshift(snap);I.state.seasonHistory=I.state.seasonHistory.slice(0,25);
 const R=I.state.records.team;
 if(row.w>R.mostWins.value)R.mostWins={value:row.w,season:I.state.seasonYear};
 if(row.pts>R.mostPoints.value)R.mostPoints={value:row.pts,season:I.state.seasonYear};
 const gd=row.gf-row.ga;if(gd>R.bestGoalDiff.value)R.bestGoalDiff={value:gd,season:I.state.seasonYear};
 I.getRoster().forEach(p=>{
   const st=I.stat(p.id),r=I.recordFor(p.id);
   r.games=Math.max(r.games,st.gp);r.goals=Math.max(r.goals,st.g);r.assists=Math.max(r.assists,st.a);r.points=Math.max(r.points,st.pts)
 });
};
})(window);