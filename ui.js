(function(g){
const I=g.IHM=g.IHM||{},U=I.UI={};
const $=s=>document.querySelector(s),E=id=>document.getElementById(id);
U.toast=function(msg){const t=E("toast");t.textContent=msg;t.classList.add("show");clearTimeout(U.tt);U.tt=setTimeout(()=>t.classList.remove("show"),2000)};
U.go=function(name){document.querySelectorAll(".screen").forEach(x=>x.classList.toggle("active",x.id===`screen-${name}`));document.querySelectorAll(".nav button").forEach(x=>x.classList.toggle("active",x.dataset.screen===name));U.render(name)};
U.modal=function(html){E("modalCard").innerHTML=`<button class="btn ghost modal-close" onclick="IHM.UI.close()">✕</button>${html}`;E("modal").classList.remove("hidden")};
U.close=()=>E("modal").classList.add("hidden");
function teamBadge(name){const t=I.team(name);return`<div class="badge">${t?.badge||"🏒"}</div>`}
function next(){return I.nextUserGame()}
function record(){const x=I.state.table[I.USER];return`${x.w}-${x.l}`}
function objectiveData(){
 const r=I.state.table[I.USER],rank=I.rank();
 return[
  {t:"Playoffs erreichen",x:"Top 4 nach der Regular Season",done:I.state.phase!=="regular"&&rank<=4},
  {t:"8 Siege",x:`${r.w}/8 Siege`,done:r.w>=8},
  {t:"Club ausbauen",x:"Ein Gebäude auf Level 2",done:Object.values(I.state.facilities).some(v=>v>=2)}
 ]
}
U.renderHome=function(){
 const f=next(),rank=I.rank(),r=I.state.table[I.USER];
 E("screen-home").innerHTML=`<h1 class="page-title">Dashboard</h1>
 <div class="card hero"><div class="card-body"><div class="kicker">MANAGER ${I.state.manager.name}</div><div class="big">${I.USER}</div><div class="muted">Rang ${rank} · ${record()} · ${r.pts} Punkte</div>
 ${f?`<div class="matchup">${`<div class="team">${teamBadge(f.home)}${f.home}</div>`}<div class="vs">VS</div>${`<div class="team">${teamBadge(f.away)}${f.away}</div>`}</div><button class="btn primary wide" onclick="IHM.UI.go('match')">ZUM NÄCHSTEN SPIEL</button>`:`<div class="divider"></div><b>Regular Season abgeschlossen</b>`}
 </div></div>
 <div class="row" style="margin:-2px 0 11px"><button class="btn" onclick="IHM.UI.go('league')">LIGA & TABELLE</button><button class="btn" onclick="IHM.UI.go('team')">TRAINING & REIHEN</button></div>
 <div class="grid4"><div class="stat-box"><span>RANG</span><b>#${rank}</b></div><div class="stat-box"><span>TEAM OVR</span><b>${Math.round(I.getRoster().reduce((s,p)=>s+I.effective(p),0)/I.getRoster().length)}</b></div><div class="stat-box"><span>MANAGER</span><b>LV ${I.state.manager.level}</b></div><div class="stat-box"><span>REPUTATION</span><b>${Math.round(I.state.reputation||20)}</b></div></div>
 <div class="card premium-card"><div class="card-head"><b>GM COMMAND CENTER</b><span class="chip">LEVEL ${I.state.manager.level}</span></div><div class="card-body">${(()=>{I.ensureProSystems();const h=I.healthReport(),m=I.matchPreview();return`<div class="grid4"><div class="stat-box"><span>CHEMIE</span><b>${I.teamChemistry()}%</b></div><div class="stat-box"><span>READINESS</span><b>${h.readiness}%</b></div><div class="stat-box"><span>REPUTATION</span><b>${I.state.reputation}</b></div><div class="stat-box"><span>DRUCK</span><b>${I.state.media.pressure}</b></div></div>${m?`<div class="next-match-strip"><span>NÄCHSTER GEGNER</span><b>${m.rival?"🔥 ":""}${m.opp}</b><small>${m.edge}</small></div>`:""}`})()}<div class="grid4" style="margin-top:10px"><button class="btn" onclick="IHM.UI.showInbox()">📬 INBOX</button><button class="btn" onclick="IHM.UI.showStats()">📊 STATS</button><button class="btn" onclick="IHM.UI.scouting()">🔭 SCOUTING</button><button class="btn" onclick="IHM.UI.showLegacy()">🏆 LEGACY</button><button class="btn" onclick="IHM.UI.world()">🌍 WELT</button></div></div></div>
 <div class="card"><div class="card-head"><b>Saisonziele</b><span class="chip">${I.state.phase.toUpperCase()}</span></div><div class="card-body">${objectiveData().map(o=>`<div class="objective ${o.done?"done":""}"><b>${o.done?"✓ ":""}${o.t}</b><span>${o.x}</span></div>`).join("")}</div></div>
 <div class="card"><div class="card-head"><b>Club News</b></div><div class="card-body">${I.state.news.slice(0,7).map(n=>`<div class="news">${n}</div>`).join("")}</div></div>`
};
function playerOpts(pos,selected){
 return I.getRoster().filter(p=>p.pos===pos||((pos==="LW"||pos==="RW")&&["LW","RW"].includes(p.pos))).sort((a,b)=>I.effective(b)-I.effective(a)).map(p=>`<option value="${p.id}" ${p.id===selected?"selected":""}>${p.name} · ${I.effective(p)}</option>`).join("")
}
U.renderTeam=function(){
 const L=I.state.lineup;
 E("screen-team").innerHTML=`<h1 class="page-title">Team</h1><div class="page-sub">Aufstellung, Form, Zufriedenheit und Training.</div>
 <div class="card"><div class="card-head"><b>Team-DNA</b><span class="chip">${I.identity().icon} ${I.identity().name}</span></div><div class="card-body">
 <div class="chem"><b>${I.teamChemistry()}%</b><div class="meter"><i style="width:${I.teamChemistry()}%"></i></div></div>
 <div class="pmeta">Teamchemie beeinflusst die tatsächliche Matchleistung.</div>
 <div class="grid2" style="margin-top:9px"><button class="btn" onclick="IHM.UI.identity()">CLUB-IDENTITÄT</button><button class="btn" onclick="IHM.UI.captain()">CAPTAIN WÄHLEN</button></div>
 </div></div>
 <div class="card"><div class="card-head"><b>Reihen</b><button class="btn" onclick="IHM.autoLineup();IHM.UI.renderTeam()">AUTO</button></div><div class="card-body">
 ${["f1","f2","f3","f4"].map((k,i)=>`<div class="line-row"><label>R${i+1} · ${I.lineChemistry(L[k])}%</label><select onchange="IHM.UI.line('${k}',0,this.value)">${playerOpts("LW",L[k][0])}</select><select onchange="IHM.UI.line('${k}',1,this.value)">${playerOpts("C",L[k][1])}</select><select onchange="IHM.UI.line('${k}',2,this.value)">${playerOpts("RW",L[k][2])}</select></div>`).join("")}
 ${["d1","d2","d3"].map((k,i)=>`<div class="line-row def"><label>D-PAIR ${i+1}</label><select onchange="IHM.UI.line('${k}',0,this.value)">${playerOpts("D",L[k][0])}</select><select onchange="IHM.UI.line('${k}',1,this.value)">${playerOpts("D",L[k][1])}</select></div>`).join("")}
 <div class="line-row goalies"><label>STARTER</label><select onchange="IHM.state.lineup.g1=+this.value;IHM.save()">${playerOpts("G",L.g1)}</select></div>
 </div></div>
 <div class="card"><div class="card-head"><b>Training</b><span class="chip">${I.state.training.doneRound===I.state.round?"ERLEDIGT":"OFFEN"}</span></div><div class="card-body"><div class="grid2"><select id="focus"><option value="balanced">Ausgeglichen</option><option value="offense">Offensive</option><option value="defense">Defensive</option><option value="skills">Skills</option></select><select id="intensity"><option value="light">Leicht</option><option value="normal" selected>Normal</option><option value="hard">Hart</option></select></div><button class="btn green wide" style="margin-top:8px" ${I.state.training.doneRound===I.state.round?"disabled":""} onclick="IHM.UI.train()">TRAINING ABSCHLIESSEN</button></div></div>
 <div class="card"><div class="card-head"><b>Special Teams</b></div><div class="card-body"><div class="grid2"><div class="stat-box"><span>POWERPLAY</span><b>${I.specialTeamsRating("pp")}</b></div><div class="stat-box"><span>PENALTY KILL</span><b>${I.specialTeamsRating("pk")}</b></div></div><button class="btn wide" style="margin-top:9px" onclick="IHM.UI.special()">SPECIAL TEAMS BEARBEITEN</button></div></div>
 <div class="card"><div class="card-head"><b>Kader</b><span class="chip">${I.getRoster().length} SPIELER</span></div><div class="card-body">${I.getRoster().sort((a,b)=>I.effective(b)-I.effective(a)).map(p=>{const c=I.condition(p.id);return`<div class="player-row" onclick="IHM.UI.player(${p.id})"><div class="avatar">${p.pos==="G"?"🥅":"🏒"}</div><div><div class="pname">${c.injury>0?"🩺 ":""}${p.name}</div><div class="pmeta">${p.pos} · ${p.age} J. · ${p.role} · ${I.state.playerStats[p.id]?.g||0}T ${I.state.playerStats[p.id]?.a||0}A</div><div class="meter"><i style="width:${c.form}%"></i></div></div><div><span class="rating">${I.effective(p)}</span><div class="mood ${c.happiness>=70?"good":c.happiness<55?"bad":"warn"}">${c.happiness}% 🙂</div></div></div>`}).join("")}</div></div>`
};
U.line=function(k,i,v){I.state.lineup[k][i]=+v;I.save()};
U.train=function(){if(I.runTraining(E("focus").value,E("intensity").value)){U.toast("Training abgeschlossen");U.renderTeam()}};
U.player=function(id){const p=I.player(id),c=I.condition(id),con=I.state.contracts[id];U.modal(`<div class="modal-title">${p.name}</div><div class="page-sub">${p.pos} · ${p.age} Jahre · ${p.role}</div><div class="grid3"><div class="stat-box"><span>OVR</span><b>${I.effective(p)}</b></div><div class="stat-box"><span>FORM</span><b>${c.form}</b></div><div class="stat-box"><span>ENERGIE</span><b>${c.energy}</b></div></div><div class="divider"></div><div class="between"><span>Saisonstatistik</span><b>${I.state.playerStats[id]?.gp||0} SP · ${I.state.playerStats[id]?.g||0} T · ${I.state.playerStats[id]?.a||0} A</b></div><div class="between"><span>Vertrag</span><b>${con?.years||1} J. · ${I.money(con?.salary||0)}/Monat</b></div><div class="between"><span>Zufriedenheit</span><b>${c.happiness}%</b></div>
<div class="divider"></div>
<div class="grid3"><div class="stat-box"><span>TORE</span><b>${I.stat(p.id).g}</b></div><div class="stat-box"><span>ASSISTS</span><b>${I.stat(p.id).a}</b></div><div class="stat-box"><span>PUNKTE</span><b>${I.stat(p.id).pts}</b></div></div>
<button class="btn wide" style="margin-top:10px" onclick="IHM.UI.contract(${p.id})">VERTRAG VERHANDELN</button>
<button class="btn red wide" style="margin-top:8px" onclick="IHM.UI.sell(${p.id})">SPIELER VERKAUFEN</button>`)};
U.sell=function(id){const p=I.player(id);if(!confirm(`${p.name} wirklich verkaufen?`))return;const r=I.sellPlayer(id);if(r.ok){U.close();U.toast(`${p.name} verkauft`);U.renderTeam()}else U.toast(r.msg)};

U.renderMatch=function(){
 const L=I.state.live,f=next();
 if(I.state.phase==="playoffs"){U.renderPlayoffs();return}
 if(!L){
  E("screen-match").innerHTML=`<h1 class="page-title">Match Center</h1>${f?`<div class="card hero"><div class="card-body"><div class="kicker">SPIELTAG ${I.state.round+1}</div><div class="matchup"><div class="team">${teamBadge(f.home)}${f.home}</div><div class="vs">VS</div><div class="team">${teamBadge(f.away)}${f.away}</div></div><div class="coach-grid"><button class="coach-btn ${I.state.tactics.approach==="attack"?"active":""}" onclick="IHM.UI.tactic('attack')">🔥 DRUCK</button><button class="coach-btn ${I.state.tactics.approach==="balanced"?"active":""}" onclick="IHM.UI.tactic('balanced')">⚖️ BALANCE</button><button class="coach-btn ${I.state.tactics.approach==="protect"?"active":""}" onclick="IHM.UI.tactic('protect')">🛡️ SICHERN</button></div><button class="btn primary wide" style="margin-top:10px" onclick="IHM.UI.startMatch()">MATCH STARTEN</button></div></div>`:`<div class="card"><div class="card-body">Kein Regular-Season-Spiel mehr offen.</div></div>`}`;return
 }
 const userHome=L.fixture.home===I.USER,ug=userHome?L.hg:L.ag,og=userHome?L.ag:L.hg;
 E("screen-match").innerHTML=`<h1 class="page-title">Match Center</h1><div class="card hero"><div class="card-body"><div class="kicker">${L.finished?"FINAL":"LIVE · DRITTEL "+Math.max(1,L.period)}</div><div class="matchup"><div class="team">${teamBadge(L.fixture.home)}${L.fixture.home}</div><div class="score">${L.hg}:${L.ag}</div><div class="team">${teamBadge(L.fixture.away)}${L.fixture.away}</div></div><div class="period-row">${[1,2,3].map((p,i)=>`<div class="period-box ${L.period===p&&!L.finished?"active":""}">D${p}<b>${L.periods[i]?L.periods[i].hg+":"+L.periods[i].ag:"-"}</b></div>`).join("")}</div>${!L.finished?`<div class="coach-grid" style="margin-top:9px"><button class="coach-btn ${I.state.tactics.approach==="attack"?"active":""}" onclick="IHM.UI.tactic('attack')">🔥 DRUCK</button><button class="coach-btn ${I.state.tactics.approach==="balanced"?"active":""}" onclick="IHM.UI.tactic('balanced')">⚖️ BALANCE</button><button class="coach-btn ${I.state.tactics.approach==="protect"?"active":""}" onclick="IHM.UI.tactic('protect')">🛡️ SICHERN</button></div><button class="btn green wide" style="margin-top:9px" onclick="IHM.UI.period()">${L.period<2?"NÄCHSTES DRITTEL":"SPIEL BEENDEN"}</button>`:`<button class="btn primary wide" style="margin-top:10px" onclick="IHM.completeGameDay();IHM.UI.go('home')">WEITER ZUM NÄCHSTEN SPIELTAG</button>`}</div></div>
 <div class="grid4"><div class="stat-box"><span>SCHÜSSE</span><b>${L.hs}:${L.as}</b></div><div class="stat-box"><span>DEIN SCORE</span><b>${ug}:${og}</b></div><div class="stat-box"><span>MOMENTUM</span><b>${L.momentum||50}</b></div><div class="stat-box"><span>POWERPLAY</span><b>${L.pp?.home||0}:${L.pp?.away||0}</b></div></div>
 ${!L.finished&&L.period>=1&&L.period<=2&&!L.coachUsed?.[L.period]?`<div class="card"><div class="card-head"><b>Drittelpause</b></div><div class="card-body"><div class="coach-grid"><button class="coach-btn" onclick="IHM.UI.talk('fire')">🔥 MOTIVIEREN</button><button class="coach-btn" onclick="IHM.UI.talk('calm')">🧊 RUHE & FOKUS</button><button class="coach-btn" onclick="IHM.UI.talk('adjust')">📋 ANPASSEN</button></div></div></div>`:""}
 <div class="card"><div class="card-head"><b>Live Ticker</b></div><div class="card-body">${L.events.length?L.events.slice().reverse().map(e=>`<div class="event"><span class="event-time">${e.time}</span>${e.text}</div>`).join(""):`<div class="muted">Das Spiel beginnt gleich …</div>`}</div></div>`
};
U.tactic=function(x){I.state.tactics.approach=x;I.save();U.renderMatch()};
U.startMatch=async function(){await I.audio.unlock();I.startMatch();I.audio.matchIntro();I.audio.sync();U.renderMatch()};
U.period=function(){
 const before=I.state.live,uh=before.fixture.home===I.USER,old=uh?before.hg:before.ag;
 I.playPeriod();const now=uh?I.state.live.hg:I.state.live.ag;if(now>old)I.audio.goal();
 if(I.state.live.finished){const ug=uh?I.state.live.hg:I.state.live.ag,og=uh?I.state.live.ag:I.state.live.hg;if(ug>og)I.audio.win()}
 I.audio.sync();U.renderMatch()
};
U.renderPlayoffs=function(){
 const P=I.state.playoffs;
 E("screen-match").innerHTML=`<h1 class="page-title">Playoffs</h1><div class="card hero"><div class="card-body"><div class="kicker">${P.round==="semi"?"HALBFINALE":"FINALE"} · BEST OF 3</div><div class="big">${P.champion?`🏆 ${P.champion}`:"Der Titel wird entschieden"}</div></div></div>${P.series.map(s=>`<div class="card"><div class="card-body"><div class="between"><b>${s.a}</b><b>${s.aw} : ${s.bw}</b><b>${s.b}</b></div></div></div>`).join("")}${P.champion?`<button class="btn green wide" onclick="IHM.newSeason();IHM.UI.go('home')">NEUE SAISON STARTEN</button>`:`<button class="btn primary wide" onclick="IHM.simPlayoffStep();IHM.UI.renderMatch()">PLAYOFF-SPIEL SIMULIEREN</button>`}`
};

U.renderLeague=function(){
 E("screen-league").innerHTML=`<h1 class="page-title">Liga</h1><button class="btn wide" style="margin-bottom:10px" onclick="IHM.UI.world()">🌍 HOCKEY-WELT & LIGEN</button><div class="card"><div class="card-head"><b>Tabelle</b><span class="chip">ST ${Math.min(I.state.round+1,I.schedule.length)}/${I.schedule.length}</span></div><div class="card-body table-wrap"><table><thead><tr><th>#</th><th>Team</th><th>SP</th><th>S</th><th>N</th><th>TD</th><th>PTS</th></tr></thead><tbody>${I.sortedTable().map((x,i)=>`<tr class="${x.name===I.USER?"me":""}"><td>${i+1}</td><td>${I.team(x.name)?.badge||""} ${x.name}</td><td>${x.gp}</td><td>${x.w}</td><td>${x.l}</td><td>${x.gf-x.ga}</td><td><b>${x.pts}</b></td></tr>`).join("")}</tbody></table></div></div><div class="card"><div class="card-head"><b>Liga Leader</b></div><div class="card-body">${I.getRoster().map(p=>({p,st:I.stat(p.id)})).filter(x=>x.p.pos!=="G").sort((a,b)=>b.st.pts-a.st.pts).slice(0,5).map((x,i)=>`<div class="between" style="margin-bottom:7px"><span>${i+1}. ${x.p.name}</span><b>${x.st.pts} PTS</b></div>`).join("")}</div></div>
 <div class="card"><div class="card-head"><b>Rivalitäten</b></div><div class="card-body">${(I.rivals[I.USER]||[]).map(n=>{const r=I.state.rivalry[n]||{games:0,w:0,l:0,intensity:50};return`<div class="rival" style="margin-bottom:7px"><b>${I.team(n)?.badge||"🏒"} ${n}</b><div class="pmeta">${r.w}-${r.l} · Intensität ${r.intensity}</div></div>`}).join("")}</div></div>
 <div class="card"><div class="card-head"><b>Letzte Ergebnisse</b></div><div class="card-body">${I.state.history.slice(-8).reverse().map(x=>`<div class="news">${x.home} ${x.hg}:${x.ag} ${x.away}</div>`).join("")||'<div class="muted">Noch keine Ergebnisse.</div>'}</div></div>`
};
U.renderMarket=function(){
 E("screen-market").innerHTML=`<h1 class="page-title">Transfermarkt</h1><div class="page-sub">Verstärke gezielt deinen Kader. Transfers sind dauerhaft und beeinflussen dein Budget.</div><div class="card"><div class="card-head"><b>Verfügbare Spieler</b><span class="chip">${I.state.market.length}</span></div><div class="card-body">${I.state.market.map(p=>`<div class="market-row"><div class="avatar">${p.pos==="G"?"🥅":"🏒"}</div><div><div class="pname">${p.name}</div><div class="pmeta">${p.pos} · ${p.age} J. · ${p.role} · Gehalt ${I.money(p.salary)}</div></div><div class="price"><span class="rating">${p.ovr}</span><br>${p.price?I.money(p.price):"ABlösefrei"}<br><button class="btn" onclick="IHM.UI.scout(${p.id})">REPORT</button> <button class="btn" onclick="IHM.UI.transferTalk(${p.id})">VERHANDELN</button></div></div>`).join("")}</div></div>`
};
U.buy=function(id){const p=I.state.market.find(x=>x.id===id);if(!confirm(`${p.name} für ${p.price?I.money(p.price):"0 €"} verpflichten?`))return;const r=I.buyPlayer(id);U.toast(r.ok?`${p.name} verpflichtet`:r.msg);U.renderMarket()};

U.renderClub=function(){
 E("screen-club").innerHTML=`<h1 class="page-title">Club</h1><div class="grid3"><div class="stat-box"><span>BUDGET</span><b>${I.money(I.state.budget)}</b></div><div class="stat-box"><span>SAISONPROFIT</span><b>${I.money(I.state.finance.profit)}</b></div><div class="stat-box"><span>FANS</span><b>${I.state.finance.fans.toLocaleString("de-DE")}</b></div></div>
 <div class="card"><div class="card-head"><b>Jugendakademie</b><span class="chip">${I.state.youth.lastSeason===I.state.seasonYear?"GESICHTET":"BEREIT"}</span></div><div class="card-body"><div class="between"><div><b>Nachwuchstalent sichten</b><div class="pmeta">Qualität steigt mit dem Akademie-Level. Ein Talent pro Saison.</div></div><button class="btn green" ${I.state.youth.lastSeason===I.state.seasonYear?"disabled":""} onclick="IHM.UI.youth()">20.000 €</button></div></div></div>
 <div class="card"><div class="card-head"><b>Hauptsponsor</b></div><div class="card-body">${I.state.sponsor?(()=>{const s=I.sponsors.find(x=>x.id===I.state.sponsor);return`<b>${s.name}</b><div class="pmeta">${s.label} · Bonus ${I.money(s.bonus)}</div>`})():`<div class="grid2">${I.sponsors.map(s=>`<button class="btn" onclick="IHM.UI.sponsor('${s.id}')">${s.name}<br>${I.money(s.base)} + Bonus</button>`).join("")}</div>`}</div></div>
 <div class="card"><div class="card-head"><b>Staff</b></div><div class="card-body">${["head","assistant","scout","physio"].map(k=>{const id=I.state.staff[k],m=id?I.staffMember(id):null;return`<div class="between" style="margin-bottom:8px"><span>${k.toUpperCase()}</span><b>${m?m.name:"nicht besetzt"}</b></div>`}).join("")}<button class="btn wide" onclick="IHM.UI.staff()">STAFF-MARKT ÖFFNEN</button></div></div>
 <div class="card"><div class="card-head"><b>Franchise Campus</b></div><div class="card-body">${Object.entries(I.facilities).map(([k,d])=>{const l=I.state.facilities[k],cost=l>=5?0:Math.round(d.base*Math.pow(1.55,l-1));return`<div class="facility"><div class="facility-icon">${d.icon}</div><div><b>${d.name} · Level ${l}</b><small>${d.effect}</small></div><div class="price">${l>=5?"MAX":I.money(cost)}<br><button class="btn" ${l>=5?"disabled":""} onclick="IHM.UI.upgrade('${k}')">AUSBAU</button></div></div>`}).join("")}</div></div>
 <div class="card trophy-card"><div class="card-head"><b>🏆 Trophy Room</b><span class="chip">${(I.state.trophyRoom||[]).length} TROPHÄEN</span></div><div class="card-body">${(I.state.trophyRoom||[]).length?(I.state.trophyRoom||[]).slice(0,4).map(x=>`<div class="trophy"><span>🏆</span><div><b>${x.label}</b><small>Saison ${x.season}</small></div></div>`).join(""):`<div class="empty-state">Der erste große Titel wartet noch.</div>`}</div></div><div class="card"><div class="card-head"><b>Franchise History</b></div><div class="card-body"><div class="grid2"><button class="btn" onclick="IHM.UI.records()">REKORDE</button><button class="btn" onclick="IHM.UI.history()">SAISONHISTORIE</button></div></div></div>
 <div class="card"><div class="card-head"><b>Spielstand & Einstellungen</b></div><div class="card-body"><div class="grid2"><button class="btn" onclick="IHM.exportSave()">SPIELSTAND EXPORTIEREN</button><button class="btn" onclick="document.getElementById('saveImport').click()">SPIELSTAND IMPORTIEREN</button></div><input id="saveImport" class="hidden" type="file" accept=".json" onchange="IHM.importSave(this.files[0],ok=>{IHM.UI.toast(ok?'Import erfolgreich':'Import fehlgeschlagen');if(ok)location.reload()})"><div class="divider"></div><button class="btn red wide" onclick="IHM.UI.newCareer()">NEUE KARRIERE</button></div></div>`
};
U.youth=function(){const r=I.promoteYouth();U.toast(r.ok?`${r.p.name} rückt hoch`:r.msg);U.renderClub()};
U.upgrade=function(k){if(I.upgradeFacility(k)){U.toast("Gebäude ausgebaut");U.renderClub()}else U.toast("Nicht genug Budget oder bereits Maximum")};
U.newCareer=function(){if(confirm("Neue Karriere starten? Exportiere vorher deinen Spielstand, wenn du ihn behalten willst.")){localStorage.removeItem("ihm_rebuild_v1");location.reload()}};
U.render=function(name){E("clubName").textContent=I.USER;E("seasonLabel").textContent=`Saison ${I.state.seasonYear}/${String(I.state.seasonYear+1).slice(-2)}`;E("budgetLabel").textContent=I.money(I.state.budget);({home:U.renderHome,team:U.renderTeam,match:U.renderMatch,league:U.renderLeague,market:U.renderMarket,club:U.renderClub}[name]||U.renderHome)()};

U.talk=function(k){if(I.coachTalk(k)){U.toast("Coaching-Entscheidung gespeichert");U.renderMatch()}};
U.extend=function(id){if(I.extendContract(id,2)){U.toast("Vertrag um 2 Jahre verlängert");U.player(id)}else U.toast("Verlängerung nicht möglich")};
U.scout=function(id){const r=I.scoutPlayer(id);if(r)U.modal(`<div class="modal-title">Scouting Report</div><div class="page-sub">Genauigkeit ${r.accuracy}%</div><div class="grid3"><div class="stat-box"><span>POTENZIAL</span><b>${r.ceiling}</b></div><div class="stat-box"><span>RISIKO</span><b>${r.risk}/5</b></div><div class="stat-box"><span>FIT</span><b>${r.fit}</b></div></div>`)};
U.sponsor=function(id){if(I.chooseSponsor(id)){U.toast("Sponsorvertrag abgeschlossen");U.renderClub()}};
U.staff=function(){
 U.modal(`<div class="modal-title">Staff-Markt</div><div class="page-sub">Stärkerer Staff verbessert Matchleistung, Training, Scouting und Regeneration.</div>${I.staffPool.map(s=>`<div class="market-row"><div class="avatar">👔</div><div><div class="pname">${s.name}</div><div class="pmeta">${s.type} · ${s.trait}</div></div><div class="price"><span class="rating">${s.rating}</span><br>${I.money(s.salary)}/Monat<br><button class="btn" onclick="IHM.hireStaff('${s.id}');IHM.UI.toast('Staff verpflichtet');IHM.UI.staff()">HOLEN</button></div></div>`).join("")}`)
};
U.showInbox=function(){
 const msgs=I.state.seasonStory?.messages||[];
 U.modal(`<div class="modal-title">Club Inbox</div><div class="page-sub">Vorstand, Presse und Sportdirektion reagieren auf deine Saison.</div>${msgs.length?msgs.map(m=>`<div class="news"><b>${m.from}: ${m.title}</b><br><span class="muted">${m.text}</span></div>`).join(""):`<div class="muted">Noch keine neuen Nachrichten.</div>`}`)
};
U.showStats=function(){
 const rows=I.getRoster().map(p=>({p,st:I.stat(p.id)})).sort((a,b)=>b.st.pts-a.st.pts);
 U.modal(`<div class="modal-title">Spielerstatistiken</div><div class="table-wrap"><table><thead><tr><th>Spieler</th><th>SP</th><th>T</th><th>A</th><th>PTS</th></tr></thead><tbody>${rows.map(x=>`<tr><td>${x.p.name}</td><td>${x.st.gp}</td><td>${x.st.g}</td><td>${x.st.a}</td><td><b>${x.st.pts}</b></td></tr>`).join("")}</tbody></table></div>`)
};
U.showLegacy=function(){
 I.checkAchievements();
 const ach=I.achievementDefs.map(a=>`<div class="objective ${I.state.achievements[a.id]?"done":""}"><b>${I.state.achievements[a.id]?"✓ ":"🔒 "}${a.icon} ${a.name}</b></div>`).join("");
 const awards=(I.state.awards||[]).slice(0,3).map(s=>`<div class="news"><b>Saison ${s.season}</b><br>${s.items.map(x=>`${x.award}: ${x.player}`).join(" · ")}</div>`).join("");
 U.modal(`<div class="modal-title">Club Legacy</div><div class="grid3"><div class="stat-box"><span>REPUTATION</span><b>${I.state.reputation}</b></div><div class="stat-box"><span>MANAGER LVL</span><b>${I.state.manager.level}</b></div><div class="stat-box"><span>TITEL</span><b>${I.state.champions.filter(x=>x.team===I.USER).length}</b></div></div><div class="divider"></div>${ach}<div class="divider"></div>${awards||'<div class="muted">Noch keine Saison-Awards.</div>'}`)
};


U.identity=function(){
 U.modal(`<div class="modal-title">Club-Identität</div><div class="page-sub">Bestimmt, wofür Frost City auf dem Eis stehen soll.</div>${I.teamIdentities.map(x=>`<button class="start-btn ${I.state.identity===x.id?"primary":""}" style="width:100%;margin-bottom:8px" onclick="IHM.setIdentity('${x.id}');IHM.UI.close();IHM.UI.renderTeam()"><b>${x.icon} ${x.name}</b><span>${x.desc}</span></button>`).join("")}`)
};
U.captain=function(){
 U.modal(`<div class="modal-title">Captain bestimmen</div><div class="page-sub">Der Captain verbessert die Chemie seiner Reihe.</div>${I.getRoster().sort((a,b)=>I.effective(b)-I.effective(a)).slice(0,12).map(p=>`<div class="between" style="margin-bottom:7px"><span>${p.name} · ${p.age} J.</span><button class="btn" onclick="IHM.setCaptain(${p.id});IHM.UI.close();IHM.UI.renderTeam()">${I.state.leadership.captain===p.id?"©️ CAPTAIN":"WÄHLEN"}</button></div>`).join("")}`)
};
U.special=function(){
 const all=I.getRoster().filter(p=>p.pos!=="G").sort((a,b)=>I.effective(b)-I.effective(a));
 U.modal(`<div class="modal-title">Special Teams</div><div class="page-sub">Powerplay und Penalty Kill beeinflussen Special-Teams-Chancen in der Match Engine.</div><div class="grid2"><div class="stat-box"><span>PP RATING</span><b>${I.specialTeamsRating("pp")}</b></div><div class="stat-box"><span>PK RATING</span><b>${I.specialTeamsRating("pk")}</b></div></div><div class="divider"></div><div class="pmeta">Powerplay 1</div>${I.state.specialTeams.pp1.map((id,i)=>`<select style="margin-top:6px" onchange="IHM.state.specialTeams.pp1[${i}]=+this.value;IHM.save()">${all.map(p=>`<option value="${p.id}" ${p.id===id?"selected":""}>${p.name} · ${I.effective(p)}</option>`).join("")}</select>`).join("")}<button class="btn green wide" style="margin-top:10px" onclick="IHM.UI.close();IHM.UI.renderTeam()">SPEICHERN</button>`)
};
U.contract=function(id){
 const p=I.player(id),c=I.state.contracts[id],market=Math.round((6000+(p.ovr-65)*1050)*(p.age<=23?1.05:p.age>=31?.94:1)/1000)*1000;
 U.modal(`<div class="modal-title">Vertragsverhandlung</div><div class="page-sub">${p.name} · aktueller Vertrag ${c.years} J. / ${I.money(c.salary)} pro Monat</div><div class="contract-offer"><div><div class="kicker">LAUFZEIT</div><select id="contractYears"><option>1</option><option selected>2</option><option>3</option><option>4</option><option>5</option></select></div><div><div class="kicker">GEHALT / MONAT</div><input id="contractSalary" type="number" step="1000" value="${market}"></div></div><div class="pmeta" style="margin-top:8px">Geschätzter Marktwert: ${I.money(market)} / Monat. Stimmung und Laufzeit beeinflussen die Annahmechance.</div><button class="btn green wide" style="margin-top:10px" onclick="IHM.UI.offerContract(${id})">ANGEBOT ABSENDEN</button>`)
};
U.offerContract=function(id){
 const r=I.negotiateContract(id,+document.getElementById("contractYears").value,+document.getElementById("contractSalary").value);
 U.toast(r.ok?"Vertrag unterschrieben":r.msg);if(r.ok){U.close();U.player(id)}
};
U.records=function(){
 const R=I.state.records.team;
 const players=Object.entries(I.state.records.players||{}).map(([id,r])=>({p:I.player(+id),r})).filter(x=>x.p).sort((a,b)=>b.r.points-a.r.points).slice(0,6);
 U.modal(`<div class="modal-title">Franchise Rekorde</div><div class="grid3"><div class="stat-box"><span>MEISTE SIEGE</span><b>${R.mostWins.value}</b></div><div class="stat-box"><span>MEISTE PUNKTE</span><b>${R.mostPoints.value}</b></div><div class="stat-box"><span>BESTE TD</span><b>${R.bestGoalDiff.value===-999?0:R.bestGoalDiff.value}</b></div></div><div class="divider"></div>${players.length?players.map(x=>`<div class="between" style="margin-bottom:7px"><span>${x.p.name}</span><b>${x.r.points} PTS Bestwert</b></div>`).join(""):`<div class="muted">Rekorde entstehen nach abgeschlossenen Saisons.</div>`}`)
};
U.history=function(){
 const h=I.state.seasonHistory||[];
 U.modal(`<div class="modal-title">Saisonhistorie</div><div class="timeline">${h.length?h.map(s=>`<div class="season-snap"><div class="between"><b>${s.year}/${String(s.year+1).slice(-2)}</b><span class="chip">Rang ${s.rank}</span></div><div class="pmeta">${s.w}-${s.l} · ${s.pts} PTS · ${s.gf}:${s.ga} Tore · Meister: ${s.champion}</div><div class="pmeta">Team-Leader: ${s.teamLeader} (${s.teamLeaderPts} PTS)</div></div>`).join(""):`<div class="muted">Noch keine Saison abgeschlossen.</div>`}</div>`)
};


U.scouting=function(){I.ensureProSystems();I.refreshScoutBoard();const S=I.state.scoutNetwork;U.modal(`<div class="modal-title">Prospect Scouting</div><div class="page-sub">${S.points} Scout-Punkte verfügbar</div>${S.board.map(p=>`<div class="prospect-card"><div class="avatar">${p.pos}</div><div class="prospect-main"><b>${p.name}</b><span>${p.age} J. · ${p.region}</span><div class="prospect-bars"><small>OVR ${p.scouted?p.ovr:"??"}</small><small>POT ${p.scouted?p.potential:"??"}</small><small>${p.certainty}% Info</small></div></div><div>${p.scouted?`<button class="btn green" onclick="IHM.signProspect(${p.id});IHM.UI.scouting()">SIGN</button>`:`<button class="btn" onclick="IHM.scoutProspect(${p.id});IHM.UI.scouting()">SCOUT</button>`}</div></div>`).join("")}`)};
U.transferTalk=function(id){const p=I.state.market.find(x=>x.id===id),n=I.openTransferNegotiation(id);if(!p||!n)return;U.modal(`<div class="modal-title">Transferverhandlung</div><div class="page-sub">${p.name} · ${p.pos} · OVR ${p.ovr}</div><div class="negotiation-box"><span>Forderung</span><b>${I.money(n.asking)}</b></div><div class="kicker">DEIN ANGEBOT</div><input id="transferOffer" type="number" step="5000" value="${n.offer}"><div class="pmeta">Maximal drei Verhandlungsrunden.</div><button class="btn green wide" style="margin-top:10px" onclick="IHM.UI.sendTransfer(${id})">ANGEBOT SENDEN</button>`)};
U.sendTransfer=function(id){const r=I.submitTransferOffer(id,+document.getElementById("transferOffer").value);U.toast(r.msg);if(r.ok){U.close();U.renderMarket()}else if(r.counter)document.getElementById("transferOffer").value=Math.round(r.counter*.96/5000)*5000};


U.world=function(){
 I.ensureUniverse();
 const cards=I.leagueDefs.map(ld=>{const s=I.leagueSummary(ld.id);return`<button class="league-card ${I.state.managerCareer.league===ld.id?"active":""}" onclick="IHM.UI.worldLeague('${ld.id}')"><div><span>${ld.country}</span><b>${ld.name}</b><small>${ld.teams.length} Clubs · Prestige ${ld.prestige} · ${ld.style}</small></div><strong>›</strong></button>`}).join("");
 const mc=I.state.managerCareer;
 U.modal(`<div class="modal-title">🌍 Hockey-Welt</div><div class="page-sub">${I.leagueDefs.reduce((s,l)=>s+l.teams.length,0)} Clubs in ${I.leagueDefs.length} Ligen werden parallel simuliert.</div><div class="world-manager"><span>DEINE KARRIERE</span><b>${mc.club}</b><small>${I.leagueById(mc.league)?.country} ${I.leagueById(mc.league)?.name}</small></div>${cards}<div class="grid2" style="margin-top:10px"><button class="btn" onclick="IHM.UI.jobOffers()">💼 JOBANGEBOTE</button><button class="btn" onclick="IHM.UI.worldCup()">🏆 WORLD CUP</button></div><button class="btn wide" style="margin-top:8px" onclick="IHM.UI.managerHistory()">📖 MANAGER-KARRIERE</button>`)
};
U.worldLeague=function(id){
 const s=I.leagueSummary(id),ld=s.def;
 U.modal(`<div class="modal-title">${ld.country} ${ld.name}</div><div class="page-sub">${ld.style} · Prestige ${ld.prestige} · Gehaltsniveau ×${ld.salary.toFixed(2)}</div><div class="table-wrap"><table><thead><tr><th>#</th><th>Club</th><th>SP</th><th>S</th><th>N</th><th>TD</th><th>PTS</th></tr></thead><tbody>${s.rows.map((r,i)=>`<tr class="${r.name===I.state.managerCareer.club?"me":""}"><td>${i+1}</td><td>${r.badge||"🏒"} ${r.name}</td><td>${r.gp}</td><td>${r.w}</td><td>${r.l}</td><td>${r.gf-r.ga}</td><td><b>${r.pts}</b></td></tr>`).join("")}</tbody></table></div><div class="grid2" style="margin-top:10px"><button class="btn" onclick="IHM.UI.world()">← LIGEN</button><button class="btn" onclick="IHM.UI.leagueEconomy('${id}')">💰 FINANZEN</button></div>`)
};
U.jobOffers=function(){
 I.ensureUniverse();I.generateJobOffers();const a=I.state.managerCareer.offers||[];
 U.modal(`<div class="modal-title">💼 Manager-Karriere</div><div class="page-sub">Erfolge und Club-Reputation öffnen dir stärkere Ligen.</div>${a.length?a.map(o=>`<div class="job-offer"><div class="job-badge">${o.badge}</div><div><b>${o.club}</b><small>${I.leagueById(o.league).country} ${I.leagueById(o.league).name} · Club ${o.rating}</small></div><div><span>${I.money(o.salary)}/Monat</span><button class="btn green" onclick="IHM.acceptJob('${o.league}','${o.club}');IHM.UI.world()">ANNEHMEN</button></div></div>`).join(""):`<div class="empty-state">Aktuell keine Angebote. Steigere deine Reputation durch Siege, Playoffs und Titel.</div>`}`)
};


U.worldCup=function(){
 I.ensureReleaseSystems();const c=I.state.worldCup.current;
 U.modal(`<div class="modal-title">🏆 World Champions Cup</div><div class="page-sub">Die Meister aller sieben Ligen treffen nach Saisonende aufeinander.</div>${c?`<div class="world-cup-hero"><span>${c.badge}</span><small>CHAMPION · SAISON ${c.season}</small><b>${c.champion}</b></div>${c.games.map(g=>`<div class="cup-game"><span>${g.a}</span><b>VS</b><span>${g.b}</span><strong>✓ ${g.winner}</strong></div>`).join("")}`:`<div class="empty-state">Der erste World Champions Cup wird nach Saisonende ausgespielt.</div>`}`)
};
U.leagueEconomy=function(id){
 const e=I.leagueEconomyInfo(id);
 U.modal(`<div class="modal-title">💰 ${e.league}</div><div class="page-sub">Jede Liga hat ein eigenes wirtschaftliches Niveau.</div><div class="grid2"><div class="stat-box"><span>GEHALTSFAKTOR</span><b>×${e.salaryFactor.toFixed(2)}</b></div><div class="stat-box"><span>PRESTIGE</span><b>${e.prestige}</b></div><div class="stat-box"><span>SIEGPRÄMIE</span><b>${I.money(e.winBonus)}</b></div><div class="stat-box"><span>TITELBONUS</span><b>${I.money(e.titleBonus)}</b></div></div>`)
};
U.managerHistory=function(){
 I.ensureReleaseSystems();const h=I.state.managerCareer.history||[];
 U.modal(`<div class="modal-title">📖 Manager-Karriere</div><div class="page-sub">Dein Weg durch die internationale Hockey-Welt.</div>${h.map((x,i)=>`<div class="career-stop"><span>${i+1}</span><div><b>${x.club}</b><small>${I.leagueById(x.league)?.country||""} ${I.leagueById(x.league)?.name||x.league} · Saison ${x.season}</small></div></div>`).join("")}`)
};

})(window);
