/* AnimeRank v0.3 – cloud-ready multiplayer build. */
const RANKS={6:{name:'Absolute Peak',icon:'🔥'},5:{name:'Sehr gut',icon:'🟧'},4:{name:'Gut',icon:'🟨'},3:{name:'OK',icon:'🟩'},2:{name:'Mh....',icon:'🟦'},1:{name:'Arsch',icon:'💀'}};
const seed=[
 {id:1,title:'Frieren: Nach dem Ende der Reise',cover:'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-y6L7X0h4Jp3L.png',votes:[6,6,6,6,5,6]},
 {id:2,title:'Steins;Gate',cover:'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx9253-5vQf1q1G8JrR.png',votes:[6,6,6,5,5,6]},
 {id:3,title:'Re:ZERO -Starting Life in Another World-',cover:'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21355-4Qv4b1n2d3xS.png',votes:[6,5,6,5,6,5]},
 {id:4,title:'Attack on Titan',cover:'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-9fJ7JtqLxYbG.png',votes:[6,5,5,4,5,4]},
 {id:5,title:'Jujutsu Kaisen',cover:'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-3rjzQ5Kqv9sV.png',votes:[5,5,4,5,4,5]},
 {id:6,title:'Vinland Saga',cover:'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101759-rJcQYx0mJ2gN.png',votes:[5,4,5,5,4,4]},
 {id:7,title:'Demon Slayer',cover:'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-8G6tL2pK4xDq.png',votes:[5,5,4,4,3,4]},
 {id:8,title:'Naruto',cover:'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20-6R8J9xW0qKpL.png',votes:[5,4,4,4,3,3]},
 {id:9,title:'Sword Art Online',cover:'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20474-q0Y4V7L1p9bM.png',votes:[5,4,3,2,2,3]},
 {id:10,title:'The Promised Neverland',cover:'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101759-rJcQYx0mJ2gN.png',votes:[3,3,2,2,2,3]}
];
const cfg=window.ANIMERANK_CONFIG||{};
const cloud=Boolean(cfg.supabaseUrl&&cfg.supabaseKey&&window.supabase);
const sb=cloud?window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseKey,{db:{schema:'public'},auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}):null;
let session=null, group=null, members=[];
let state={view:'dashboard',username:localStorage.getItem('ar-user')||'Dennis',group:localStorage.getItem('ar-group')||'Demo-Modus',anime:JSON.parse(localStorage.getItem('ar-anime')||'null')||structuredClone(seed)};
const save=()=>{localStorage.setItem('ar-user',state.username);localStorage.setItem('ar-group',state.group);localStorage.setItem('ar-anime',JSON.stringify(state.anime))};
const avg=a=>a.votes.length?a.votes.reduce((s,v)=>s+v,0)/a.votes.length:0;
const rankFor=s=>Math.max(1,Math.min(6,Math.round(s)));
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const cover=(url,title)=>url||`https://placehold.co/500x750/171824/ffffff?text=${encodeURIComponent((title||'Anime').slice(0,18))}`;
const sorted=()=>[...state.anime].sort((a,b)=>avg(b)-avg(a));
const totalVotes=()=>state.anime.reduce((n,a)=>n+a.votes.length,0);

function render(){
 document.getElementById('groupPill').textContent=group?.name||state.group;
 document.getElementById('profileBtn').textContent=(state.username[0]||'?').toUpperCase();
 document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===state.view));
 document.getElementById('app').innerHTML=session?state.view==='stats'?statsView():dashboardView():authView()
}

function authView(){
 return `<div class="container" style="max-width:720px"><section class="hero"><div><div class="eyebrow">AnimeRank v0.3 · Multiplayer</div><h1>Eure Anime.<br><span class="accent">Eure Meinung.</span></h1><p>Logge dich ein, erstelle eine Gruppe und rankt gemeinsam – auf jedem Gerät.</p></div></section><div class="tier" style="padding:24px"><div class="modal-body"><div class="section-head" style="margin-top:0"><div><h2 id="authTitle">Einloggen</h2><small id="authHint">Mit deinem AnimeRank-Account verbinden.</small></div></div><div class="profile"><label>E-Mail</label><input id="authEmail" class="input" type="email" placeholder="du@example.de"><label>Passwort</label><input id="authPassword" class="input" type="password" placeholder="Mindestens 6 Zeichen"><label id="usernameLabel" style="display:none">Name</label><input id="authUsername" class="input" style="display:none" placeholder="Dein Name"><button class="btn primary" onclick="submitAuth()" id="authSubmit">Einloggen</button><button class="btn ghost" onclick="toggleAuth()" id="authToggle">Noch keinen Account? Registrieren</button>${!cloud?`<div class="notice">Demo-Modus aktiv: In <b>config.js</b> fehlen noch Supabase URL und öffentlicher Key. Du kannst trotzdem die Oberfläche testen.</div>`:''}</div></div></div></div>`
}

let authMode='login';

function toggleAuth(){
 authMode=authMode==='login'?'signup':'login';
 document.getElementById('authTitle').textContent=authMode==='login'?'Einloggen':'Account erstellen';
 document.getElementById('authHint').textContent=authMode==='login'?'Mit deinem AnimeRank-Account verbinden.':'Erstelle deinen persönlichen Account.';
 document.getElementById('authSubmit').textContent=authMode==='login'?'Einloggen':'Registrieren';
 document.getElementById('authToggle').textContent=authMode==='login'?'Noch keinen Account? Registrieren':'Du hast schon einen Account? Einloggen';
 document.getElementById('authUsername').style.display=authMode==='signup'?'block':'none';
 document.getElementById('usernameLabel').style.display=authMode==='signup'?'block':'none'
}

async function submitAuth(){
 if(!cloud){session={demo:true};state.username=document.getElementById('authUsername').value.trim()||'Dennis';render();return}
 const email=document.getElementById('authEmail').value.trim(),password=document.getElementById('authPassword').value,username=document.getElementById('authUsername').value.trim()||email.split('@')[0];
 if(!email||!password)return toast('Bitte E-Mail und Passwort eingeben.');
 let r=authMode==='login'?await sb.auth.signInWithPassword({email,password}):await sb.auth.signUp({email,password,options:{data:{username}}});
 if(r.error)return toast(r.error.message);
 if(authMode==='signup'&&!r.data.session)return toast('Account erstellt. Prüfe deine E-Mails und bestätige den Account.');
 session=r.data.session;
 await bootCloud();
 render()
}

function dashboardView(){
 return `<div class="container"><section class="hero"><div><div class="eyebrow">${cloud?'Private Anime Ranking · Cloud':'Demo-Modus · lokal im Browser'}</div><h1>Eure Anime.<br><span class="accent">Eure Meinung.</span></h1><p>Bewertet gemeinsam Anime und lasst die Gruppe entscheiden, was wirklich <b>Peak</b> ist.</p><div class="hero-meta"><span>👥 ${esc(group?.name||state.group)}</span><span>🎌 ${state.anime.length} Anime</span><span>⭐ ${totalVotes()} Stimmen</span></div></div><button class="btn primary hero-btn" onclick="openAdd()">＋ Anime hinzufügen</button></section><section class="home-search"><div class="home-search-heading"><div><h2>🔎 Anime schnell finden</h2><p>Suche einen Anime in eurem Ranking und öffne direkt die Bewertung.</p></div></div><div class="home-search-bar"><input id="homeAnimeSearch" class="search" type="search" placeholder="z. B. Frieren, Re:Zero, One Piece…" autocomplete="off" oninput="updateHomeSearch()" onkeydown="if(event.key==='Enter')searchHomeAnime()"><button class="btn primary" onclick="searchHomeAnime()">Suchen</button></div><div id="homeSearchResults" class="home-search-results"><p class="home-search-hint">Gib einen Namen ein, um passende Anime aus eurer Gruppe zu finden.</p></div></section><div class="section-head"><div><h2>🏆 Unser Ranking</h2><small>Sortiert nach dem Gruppen-Durchschnitt</small></div><div class="head-actions"><button class="btn ghost" onclick="openGroup()">👥 Gruppe</button><button class="btn ghost" onclick="openSettings()">⚙</button></div></div><div class="ranking-board">${[6,5,4,3,2,1].map(tier).join('')}</div></div>`
}

function updateHomeSearch(){
 const input=document.getElementById('homeAnimeSearch');
 const out=document.getElementById('homeSearchResults');
 if(!input||!out)return;
 const q=input.value.trim().toLocaleLowerCase();
 if(!q){out.innerHTML='<p class="home-search-hint">Gib einen Namen ein, um passende Anime aus eurer Gruppe zu finden.</p>';return;}
 const matches=state.anime.filter(a=>String(a.title||'').toLocaleLowerCase().includes(q)).slice(0,8);
 out.innerHTML=(matches.length?matches.map(a=>`<button class="home-search-result" onclick="openAnime('${String(a.id).replace(/'/g, '&#39;')}')"><img src="${cover(a.cover,a.title)}" alt=""><span class="home-result-title">${esc(a.title)}<small>⭐ ${avg(a).toFixed(2)} / 6 · ${a.votes.length} Bewertungen</small></span><span class="home-result-action">Bewerten →</span></button>`).join(''):'<p class="home-search-hint">Kein passender Anime in eurem Ranking gefunden.</p>')+`<button class="home-search-anilist" onclick="searchHomeAnime()">${matches.length?'Nicht dabei?':'Nicht im Ranking?'} AniList durchsuchen und hinzufügen →</button>`;
}

function searchHomeAnime(){
 const input=document.getElementById('homeAnimeSearch');
 const q=input?.value.trim()||'';
 openAdd(q)
}

function tier(g){
 const list=sorted().filter(a=>rankFor(avg(a))===g);
 return `<section class="tier ${list.length?'':'empty-tier'}"><div class="tier-head"><span class="tier-icon">${RANKS[g].icon}</span><span class="tier-title">${RANKS[g].name}</span><span class="tier-count">${list.length} Anime</span></div>${list.length?`<div class="anime-grid">${list.map(card).join('')}</div>`:`<div class="empty">Noch kein Anime in diesem Bereich.</div>`}</section>`
}

function card(a){
 const position=sorted().findIndex(x=>x.id===a.id)+1;
 return `<article class="anime-card" onclick="openAnime('${a.id}')"><span class="rank-badge">#${position}</span><img class="cover" src="${cover(a.cover,a.title)}" onerror="this.src='https://placehold.co/500x750/171824/ffffff?text=Anime'"><div class="card-body"><div class="title">${esc(a.title)}</div><div class="score">⭐ ${avg(a).toFixed(2)} / 6 <span>· ${a.votes.length}</span></div></div></article>`
}
