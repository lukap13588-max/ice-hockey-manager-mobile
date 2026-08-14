(function(g){
const I=g.IHM=g.IHM||{};
I.achievementDefs=[
 {id:"firstwin",icon:"🥇",name:"Erster Sieg",test:()=>I.state.table[I.USER].w>=1},
 {id:"tenwins",icon:"🔥",name:"10 Siege",test:()=>I.state.table[I.USER].w>=10},
 {id:"rep50",icon:"⭐",name:"Club mit Namen",test:()=>I.state.reputation>=50},
 {id:"level5",icon:"🎧",name:"Manager Level 5",test:()=>I.state.manager.level>=5},
 {id:"champ",icon:"🏆",name:"Meister",test:()=>I.state.champions.some(x=>x.team===I.USER)},
 {id:"campus",icon:"🏙️",name:"Franchise Campus",test:()=>Object.values(I.state.facilities).reduce((a,b)=>a+b,0)>=20}
];
I.checkAchievements=function(){
 I.state.achievements=I.state.achievements||{};
 for(const a of I.achievementDefs)if(!I.state.achievements[a.id]&&a.test()){I.state.achievements[a.id]=Date.now();I.addNews(`${a.icon} Erfolg freigeschaltet: ${a.name}`);I.managerXP(20)}
};
})(window);