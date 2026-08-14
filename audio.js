(function(g){
const I=g.IHM=g.IHM||{};
const A=I.audio={unlocked:false,enabled:true,menu:null,crowd:null};
const q=s=>document.querySelector(s);
function el(id){return document.getElementById(id)}
A.init=function(){A.enabled=I.state?.audio?.enabled!==false;A.menu=new Audio("./menu-loop.wav");A.menu.loop=true;A.menu.volume=.24;A.crowd=new Audio("./crowd-loop.wav");A.crowd.loop=true;A.crowd.volume=.16};
A.unlock=async function(){
 if(A.unlocked)return true;try{A.menu.load();await A.menu.play();A.menu.pause();A.menu.currentTime=0;A.unlocked=true;A.sync();I.UI?.toast("🔊 Audio aktiviert");return true}catch(e){return false}
};
A.sync=function(){
 if(!A.menu)return;A.enabled=I.state.audio.enabled!==false;
 const b=el("audioBtn");if(b)b.textContent=A.enabled?"🔊":"🔇";
 if(!A.unlocked||!A.enabled){A.menu.pause();A.crowd.pause();return}
 if(I.state.live&&!I.state.live.finished){A.menu.pause();if(A.crowd.paused)A.crowd.play().catch(()=>{})}
 else{A.crowd.pause();if(A.menu.paused)A.menu.play().catch(()=>{})}
};
A.toggle=async function(){if(!A.unlocked){const ok=await A.unlock();if(!ok){I.UI.toast("Tippe noch einmal auf Ton aktivieren");return}}I.state.audio.enabled=!I.state.audio.enabled;I.save();A.sync()};
A.sfx=function(name,volume=.8){if(!A.unlocked||!A.enabled)return;const a=new Audio(`./${name}.wav`);a.volume=volume;a.play().catch(()=>{})};
A.matchIntro=()=>A.sfx("match-intro",.7);A.goal=()=>A.sfx("goal-horn",.95);A.win=()=>A.sfx("win",.75);
})(window);
