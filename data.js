(function(g){
const I=g.IHM=g.IHM||{};
I.VERSION="1.0.0";
I.USER="Frost City HC";
I.teams=[
{name:"Frost City HC",badge:"🐺",rating:78},{name:"Northridge Bears",badge:"🐻",rating:76},
{name:"Silver Lake Kings",badge:"👑",rating:80},{name:"Ironwood Jets",badge:"✈️",rating:74},
{name:"Maplewood Lions",badge:"🦁",rating:77},{name:"Alpine Eagles",badge:"🦅",rating:79},
{name:"Thunder HC",badge:"⚡",rating:75},{name:"Glacier Wolves",badge:"❄️",rating:73},
{name:"Red River Foxes",badge:"🦊",rating:72},{name:"Capital Blades",badge:"🗡️",rating:81}
];
I.basePlayers=[
{id:1,pos:"C",name:"Jason Miller",age:28,ovr:82,shot:84,pass:83,skate:81,def:74,form:87,role:"Playmaker"},
{id:2,pos:"LW",name:"Tyler Anderson",age:24,ovr:79,shot:83,pass:76,skate:84,def:67,form:82,role:"Sniper"},
{id:3,pos:"RW",name:"Daniel Novak",age:27,ovr:80,shot:82,pass:80,skate:80,def:72,form:84,role:"Two-Way Forward"},
{id:4,pos:"C",name:"Lukas Steiner",age:22,ovr:77,shot:75,pass:81,skate:78,def:73,form:79,role:"Playmaker"},
{id:5,pos:"LW",name:"Marco Berger",age:30,ovr:76,shot:79,pass:74,skate:73,def:70,form:76,role:"Power Forward"},
{id:6,pos:"RW",name:"Elias Weber",age:25,ovr:75,shot:78,pass:74,skate:77,def:68,form:80,role:"Sniper"},
{id:7,pos:"C",name:"Jonas Frei",age:21,ovr:73,shot:70,pass:75,skate:78,def:69,form:75,role:"Two-Way Forward"},
{id:8,pos:"LW",name:"Noah Keller",age:23,ovr:72,shot:74,pass:71,skate:76,def:66,form:72,role:"Sniper"},
{id:9,pos:"RW",name:"Mikael Larsson",age:29,ovr:74,shot:76,pass:73,skate:72,def:72,form:78,role:"Power Forward"},
{id:10,pos:"C",name:"David Hofer",age:26,ovr:71,shot:69,pass:72,skate:73,def:71,form:74,role:"Defensive Forward"},
{id:11,pos:"LW",name:"Alex Petrov",age:20,ovr:70,shot:73,pass:68,skate:75,def:63,form:77,role:"Prospect"},
{id:12,pos:"RW",name:"Simon Wolf",age:24,ovr:72,shot:72,pass:70,skate:74,def:67,form:73,role:"Two-Way Forward"},
{id:13,pos:"D",name:"Noah Schneider",age:29,ovr:81,shot:70,pass:78,skate:76,def:84,form:85,role:"Two-Way Defense"},
{id:14,pos:"D",name:"Erik Karlsson",age:31,ovr:80,shot:68,pass:80,skate:75,def:85,form:82,role:"Defensive Defense"},
{id:15,pos:"D",name:"Jan Huber",age:26,ovr:77,shot:67,pass:75,skate:74,def:80,form:79,role:"Two-Way Defense"},
{id:16,pos:"D",name:"Timo Graf",age:24,ovr:75,shot:72,pass:76,skate:76,def:75,form:77,role:"Offensive Defense"},
{id:17,pos:"D",name:"Oskar Lind",age:27,ovr:74,shot:64,pass:70,skate:73,def:79,form:74,role:"Defensive Defense"},
{id:18,pos:"D",name:"Ben Maurer",age:22,ovr:71,shot:62,pass:69,skate:74,def:76,form:76,role:"Prospect"},
{id:19,pos:"D",name:"Leon Fischer",age:25,ovr:70,shot:66,pass:68,skate:72,def:74,form:71,role:"Depth Defense"},
{id:20,pos:"D",name:"Theo Jansen",age:23,ovr:69,shot:65,pass:67,skate:73,def:72,form:73,role:"Depth Defense"},
{id:21,pos:"G",name:"Michael Smith",age:26,ovr:82,shot:0,pass:0,skate:0,def:0,form:88,role:"Starting Goalie"},
{id:22,pos:"G",name:"Felix Bauer",age:23,ovr:76,shot:0,pass:0,skate:0,def:0,form:81,role:"Backup Goalie"}
];
I.marketSeed=[
{id:101,pos:"C",name:"Mason Reed",age:25,ovr:79,shot:78,pass:82,skate:80,def:72,role:"Playmaker",price:420000,salary:22000},
{id:102,pos:"LW",name:"Viktor Sokolov",age:27,ovr:81,shot:86,pass:77,skate:82,def:68,role:"Sniper",price:520000,salary:28000},
{id:103,pos:"RW",name:"Liam O'Connor",age:23,ovr:76,shot:79,pass:74,skate:80,def:67,role:"Sniper",price:0,salary:14000},
{id:104,pos:"D",name:"Anton Berg",age:29,ovr:82,shot:73,pass:79,skate:77,def:86,role:"Two-Way Defense",price:560000,salary:30000},
{id:105,pos:"D",name:"Emil Rossi",age:24,ovr:75,shot:68,pass:73,skate:76,def:79,role:"Defensive Defense",price:0,salary:14000},
{id:106,pos:"G",name:"Jonas Berglund",age:28,ovr:80,shot:0,pass:0,skate:0,def:0,role:"Starting Goalie",price:470000,salary:25000},
{id:107,pos:"C",name:"Mateo Novak",age:20,ovr:74,shot:72,pass:78,skate:79,def:66,role:"Prospect",price:0,salary:10000},
{id:108,pos:"LW",name:"Felix Hartmann",age:26,ovr:77,shot:80,pass:75,skate:79,def:69,role:"Two-Way Forward",price:310000,salary:18000},
{id:109,pos:"RW",name:"Leo Andersson",age:24,ovr:78,shot:81,pass:76,skate:82,def:68,role:"Sniper",price:340000,salary:19000},
{id:110,pos:"D",name:"Samuel König",age:25,ovr:78,shot:70,pass:78,skate:78,def:81,role:"Two-Way Defense",price:330000,salary:18000},
{id:111,pos:"G",name:"Adam Pierce",age:22,ovr:74,shot:0,pass:0,skate:0,def:0,role:"Prospect Goalie",price:0,salary:11000},
{id:112,pos:"C",name:"Eric Dubois",age:30,ovr:83,shot:82,pass:86,skate:78,def:75,role:"Elite Playmaker",price:650000,salary:34000}
];
I.defaultLineup={f1:[2,1,3],f2:[5,4,6],f3:[8,7,9],f4:[11,10,12],d1:[13,14],d2:[15,16],d3:[17,18],g1:21,g2:22};
I.facilities={
 arena:{name:"Arena",icon:"🏟️",base:180000,effect:"Mehr Kapazität und Heimspiel-Einnahmen"},
 training:{name:"Training Center",icon:"🏋️",base:150000,effect:"Bessere Spielerentwicklung"},
 medical:{name:"Medical Center",icon:"🩺",base:135000,effect:"Weniger Verletzungsrisiko"},
 academy:{name:"Jugendakademie",icon:"🎓",base:160000,effect:"Bessere Nachwuchstalente"},
 shop:{name:"Fanshop",icon:"🛍️",base:120000,effect:"Mehr Merchandising-Umsatz"},
 catering:{name:"Catering",icon:"🍔",base:110000,effect:"Mehr Umsatz pro Zuschauer"}
};

I.staffPool=[
{id:"hc1",type:"Head Coach",name:"Marek Havel",rating:82,salary:18000,trait:"Taktiker"},
{id:"hc2",type:"Head Coach",name:"Patrick O'Neil",rating:78,salary:14000,trait:"Motivator"},
{id:"ac1",type:"Assistant Coach",name:"Jonas Moser",rating:76,salary:9000,trait:"Spielerentwicklung"},
{id:"ac2",type:"Assistant Coach",name:"Riku Laine",rating:80,salary:12000,trait:"Special Teams"},
{id:"sc1",type:"Scout",name:"Nils Berger",rating:75,salary:8000,trait:"Europa"},
{id:"sc2",type:"Scout",name:"Adam Price",rating:81,salary:12000,trait:"Nordamerika"},
{id:"med1",type:"Physio",name:"Dr. Elias Kern",rating:79,salary:10000,trait:"Regeneration"},
{id:"med2",type:"Physio",name:"Sofia Lind",rating:83,salary:13000,trait:"Verletzungsprävention"}
];
I.sponsors=[
{id:"sp1",name:"AlpenSteel",base:220000,bonus:90000,goal:"playoffs",label:"Playoffs erreichen"},
{id:"sp2",name:"NordTech",base:180000,bonus:150000,goal:"top2",label:"Top 2 der Liga"},
{id:"sp3",name:"IceFuel",base:260000,bonus:60000,goal:"wins10",label:"10 Siege"},
{id:"sp4",name:"PeakBank",base:150000,bonus:180000,goal:"champion",label:"Meister werden"}
];
I.awards=["MVP","Top Scorer","Best Goalie","Best Defenseman","Rookie of the Year"];


I.rivals={
 "Frost City HC":["Capital Blades","Alpine Eagles"],
 "Capital Blades":["Frost City HC","Silver Lake Kings"],
 "Alpine Eagles":["Frost City HC","Northridge Bears"]
};
I.teamIdentities=[
 {id:"speed",name:"Tempo Hockey",icon:"⚡",desc:"Mehr Schüsse, höheres Tempo, etwas mehr Risiko."},
 {id:"physical",name:"Physical Hockey",icon:"💥",desc:"Mehr Intensität und Defensive, dafür etwas weniger Skill."},
 {id:"possession",name:"Puck Control",icon:"🎯",desc:"Mehr Kontrolle, bessere Chancenqualität."},
 {id:"balanced",name:"Balanced Club",icon:"⚖️",desc:"Keine Extreme – stabile Entwicklung über die Saison."}
];

})(typeof window!=="undefined"?window:globalThis);
