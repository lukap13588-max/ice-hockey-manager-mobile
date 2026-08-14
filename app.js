(function(){
const I=window.IHM, E=id=>document.getElementById(id);
function showStart(){
 const has=I.hasSave(),s=E("start");s.classList.remove("hidden");
 s.innerHTML=`<div class="start-inner"><div class="start-mark">🏒</div><h1>Ice Hockey Manager</h1><div class="lead">Ein sauber neu aufgebauter Hockey-Manager: Teamchemie, Captaincy, Special Teams, Vertragsverhandlungen, Scouting, Staff, Sponsoren, Rivalitäten, Rekorde, Live-Matches, Playoffs und langfristige Franchise-Historie.</div><div class="start-stack">${has?`<button class="start-btn primary" onclick="IHM_APP.continue()"><b>FORTSETZEN</b><span>Letzten Spielstand laden</span></button>`:""}<button class="start-btn ${has?"":"primary"}" onclick="IHM_APP.newGame()"><b>NEUE KARRIERE</b><span>Managername und Schwierigkeit wählen</span></button></div><div class="card" style="margin-top:12px"><div class="card-body"><div class="kicker">IHM 1.0 1.0 RC2</div><div style="font-size:9px;color:var(--muted);line-height:1.5;margin-top:6px">Neue modulare Codebasis statt übereinanderliegender Versions-Patches. Dieser Build ist als neue Release-Basis gedacht.</div></div></div></div>`
}
window.IHM_APP={
 continue(){I.load();startApp()},
 newGame(){I.UI.modal(`<div class="modal-title">Neue Karriere</div><div class="page-sub">Lege dein Managerprofil fest.</div><label class="kicker">MANAGERNAME</label><input id="newName" value="Manager" maxlength="24"><div class="divider"></div><label class="kicker">SCHWIERIGKEIT</label><select id="newDiff"><option value="easy">Entspannt</option><option value="normal" selected>Standard</option><option value="hard">Profi</option></select><button class="btn green wide" style="margin-top:12px" onclick="IHM_APP.create()">KARRIERE STARTEN</button>`)},
 create(){const name=E("newName").value.trim()||"Manager",difficulty=E("newDiff").value;I.reset({name,difficulty});I.UI.close();startApp()}
};
function startApp(){
 E("start").classList.add("hidden");E("app").classList.remove("hidden");I.audio.init();I.audio.unlock().catch(()=>{});
 document.querySelectorAll(".nav button").forEach(b=>b.addEventListener("click",()=>I.UI.go(b.dataset.screen)));
 E("audioBtn").addEventListener("click",()=>I.audio.toggle());
 document.querySelector(".brand").addEventListener("click",()=>{I.ensureUniverse?.();I.ensureReleaseSystems?.();I.UI.go("home")});
 E("modal").addEventListener("click",e=>{if(e.target===E("modal"))I.UI.close()});
 I.ensureUniverse?.();I.ensureReleaseSystems?.();I.UI.go("home");I.audio.sync()
}
window.addEventListener("load",()=>{
 setTimeout(()=>{E("boot").classList.add("hide");setTimeout(()=>E("boot").remove(),260);showStart()},240);
 if("serviceWorker"in navigator)navigator.serviceWorker.register("./sw.js",{updateViaCache:"none"}).catch(()=>{});
});
})();