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
const cfg=window.ANIMERANK_CONFIG||{}; const cloud=Boolean(cfg.supabaseUrl&&cfg.supabaseKey&&window.supabase);
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
function render(){document.getElementById('groupPill').textContent=group?.name||state.group;document.getElementById('profileBtn').textContent=(state.username[0]||'?').toUpperCase();document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===state.view));document.getElementById('app').innerHTML=session?state.view==='stats'?statsView():dashboardView():authView()}
function authView(){return `<div class="container" style="max-width:720px"><section class="hero"><div><div class="eyebrow">AnimeRank v0.3 · Multiplayer</div><h1>Eure Anime.<br><span class="accent">Eure Meinung.</span></h1><p>Logge dich ein, erstelle eine Gruppe und rankt gemeinsam – auf jedem Gerät.</p></div></section><div class="tier" style="padding:24px"><div class="modal-body"><div class="section-head" style="margin-top:0"><div><h2 id="authTitle">Einloggen</h2><small id="authHint">Mit deinem AnimeRank-Account verbinden.</small></div></div><div class="profile"><label>E-Mail</label><input id="authEmail" class="input" type="email" placeholder="du@example.de"><label>Passwort</label><input id="authPassword" class="input" type="password" placeholder="Mindestens 6 Zeichen"><label id="usernameLabel" style="display:none">Name</label><input id="authUsername" class="input" style="display:none" placeholder="Dein Name"><button class="btn primary" onclick="submitAuth()" id="authSubmit">Einloggen</button><button class="btn ghost" onclick="toggleAuth()" id="authToggle">Noch keinen Account? Registrieren</button>${!cloud?`<div class="notice">Demo-Modus aktiv: In <b>config.js</b> fehlen noch Supabase URL und öffentlicher Key. Du kannst trotzdem die Oberfläche testen.</div>`:''}</div></div></div></div>`}
let authMode='login';
function toggleAuth(){authMode=authMode==='login'?'signup':'login';document.getElementById('authTitle').textContent=authMode==='login'?'Einloggen':'Account erstellen';document.getElementById('authHint').textContent=authMode==='login'?'Mit deinem AnimeRank-Account verbinden.':'Erstelle deinen persönlichen Account.';document.getElementById('authSubmit').textContent=authMode==='login'?'Einloggen':'Registrieren';document.getElementById('authToggle').textContent=authMode==='login'?'Noch keinen Account? Registrieren':'Du hast schon einen Account? Einloggen';document.getElementById('authUsername').style.display=authMode==='signup'?'block':'none';document.getElementById('usernameLabel').style.display=authMode==='signup'?'block':'none'}
async function submitAuth(){if(!cloud){session={demo:true};state.username=document.getElementById('authUsername').value.trim()||'Dennis';render();return}const email=document.getElementById('authEmail').value.trim(),password=document.getElementById('authPassword').value,username=document.getElementById('authUsername').value.trim()||email.split('@')[0];if(!email||!password)return toast('Bitte E-Mail und Passwort eingeben.');let r=authMode==='login'?await sb.auth.signInWithPassword({email,password}):await sb.auth.signUp({email,password,options:{data:{username}}});if(r.error)return toast(r.error.message);if(authMode==='signup'&&!r.data.session)return toast('Account erstellt. Prüfe deine E-Mails und bestätige den Account.');session=r.data.session;await bootCloud();render()}
function dashboardView(){return `<div class="container"><section class="hero"><div><div class="eyebrow">${cloud?'Private Anime Ranking · Cloud':'Demo-Modus · lokal im Browser'}</div><h1>Eure Anime.<br><span class="accent">Eure Meinung.</span></h1><p>Bewertet gemeinsam Anime und lasst die Gruppe entscheiden, was wirklich <b>Peak</b> ist.</p><div class="hero-meta"><span>👥 ${esc(group?.name||state.group)}</span><span>🎌 ${state.anime.length} Anime</span><span>⭐ ${totalVotes()} Stimmen</span></div></div><button class="btn primary hero-btn" onclick="openAdd()">＋ Anime hinzufügen</button></section><div class="section-head"><div><h2>🏆 Unser Ranking</h2><small>Sortiert nach dem Gruppen-Durchschnitt</small></div><div class="head-actions"><button class="btn ghost" onclick="openGroup()">👥 Gruppe</button><button class="btn ghost" onclick="openSettings()">⚙</button></div></div><div class="ranking-board">${[6,5,4,3,2,1].map(tier).join('')}</div></div>`}
function tier(g){const list=sorted().filter(a=>rankFor(avg(a))===g);return `<section class="tier ${list.length?'':'empty-tier'}"><div class="tier-head"><span class="tier-icon">${RANKS[g].icon}</span><span class="tier-title">${RANKS[g].name}</span><span class="tier-count">${list.length} Anime</span></div>${list.length?`<div class="anime-grid">${list.map(card).join('')}</div>`:`<div class="empty">Noch kein Anime in diesem Bereich.</div>`}</section>`}
function card(a){
  const position=sorted().findIndex(x=>x.id===a.id)+1;
  return `<article class="anime-card" onclick="openAnime('${a.id}')"><span class="rank-badge">#${position}</span><img class="cover" src="${cover(a.cover,a.title)}" onerror="this.src='https://placehold.co/500x750/171824/ffffff?text=Anime'"><div class="card-body"><div class="title">${esc(a.title)}</div><div class="score">⭐ ${avg(a).toFixed(2)} / 6 <span>· ${a.votes.length}</span></div></div></article>`;
}
function statsView(){const all=state.anime,groupAvg=all.length?all.reduce((s,a)=>s+avg(a),0)/all.length:0,peak=all.filter(a=>rankFor(avg(a))===6).length;return `<div class="container"><div class="eyebrow">Gruppen-Übersicht</div><div class="page-title-row"><div><h1>Statistiken</h1><p class="muted">Ein schneller Blick auf euren Anime-Geschmack.</p></div><button class="btn primary" onclick="openAdd()">＋ Anime</button></div><div class="stats-grid"><div class="stat"><span>Anime im Ranking</span><b>${all.length}</b><small>🎌 gesammelt</small></div><div class="stat"><span>Gruppen-Durchschnitt</span><b>${groupAvg.toFixed(2)}</b><small>⭐ von 6 Punkten</small></div><div class="stat"><span>Absolute Peak</span><b>${peak}</b><small>🔥 Anime</small></div><div class="stat"><span>Abstimmungen</span><b>${totalVotes()}</b><small>🗳️ Stimmen</small></div></div><section class="analytics"><div class="section-head"><h2>📊 Verteilung</h2><small>Nach Anime-Anzahl</small></div>${[6,5,4,3,2,1].map(g=>{const n=all.filter(a=>rankFor(avg(a))===g).length,p=all.length?Math.round(n/all.length*100):0;return `<div class="dist-row"><span>${RANKS[g].icon} ${RANKS[g].name}</span><div class="bar"><div class="fill" style="width:${p}%"></div></div><b>${p}%</b></div>`}).join('')}</section><section class="analytics"><div class="section-head"><h2>🔥 Eure Top 5</h2><small>nach Durchschnitt</small></div><div class="top-list">${sorted().slice(0,5).map((a,i)=>`<button class="top-item" onclick="openAnime(${a.id})"><span>#${i+1}</span><img src="${cover(a.cover,a.title)}"><strong>${esc(a.title)}</strong><em>⭐ ${avg(a).toFixed(2)}</em></button>`).join('')}</div></section></div>`}
function openAnime(id){const a=state.anime.find(x=>x.id===id),score=avg(a),r=RANKS[rankFor(score)],counts=[6,5,4,3,2,1].map(x=>a.votes.filter(v=>v===x).length);showModal(`<div class="modal-head"><h3>Anime-Details</h3><button class="close" onclick="closeModal()">×</button></div><div class="modal-body"><div class="detail"><img src="${cover(a.cover,a.title)}"><div><span class="pill">${r.icon} ${r.name}</span><h2>${esc(a.title)}</h2><div class="big-score">⭐ ${score.toFixed(2)} <span>/ 6</span></div><p class="muted">${a.votes.length} Bewertungen · Deine Stimme wird nur einmal gezählt und kann geändert werden.</p><button class="btn primary" onclick="openVote('${a.id}')">Meine Bewertung</button></div></div><div class="distribution"><h3>Stimmenverteilung</h3>${[6,5,4,3,2,1].map((x,i)=>{const p=a.votes.length?Math.round(counts[i]/a.votes.length*100):0;return `<div class="dist-row"><span>${RANKS[x].icon} ${RANKS[x].name}</span><div class="bar"><div class="fill" style="width:${p}%"></div></div><b>${p}%</b></div>`}).join('')}</div></div>`)}
function openVote(id){const a=state.anime.find(x=>x.id===id);showModal(`<div class="modal-head"><h3>Deine Bewertung</h3><button class="close" onclick="closeModal()">×</button></div><div class="modal-body"><div class="vote-intro"><img src="${cover(a.cover,a.title)}"><div><span class="eyebrow">Dein Take</span><h2>${esc(a.title)}</h2><p class="muted">Wähle genau einen Rang. Deine bisherige Stimme wird ersetzt.</p></div></div><div class="vote-options">${[6,5,4,3,2,1].map(x=>`<button class="vote" onclick="castVote(${a.id},${x})"><span>${RANKS[x].icon}</span><b>${RANKS[x].name}</b><small>${x}/6</small></button>`).join('')}</div><button class="vote unseen" onclick="markUnseen(${a.id})">👁️ Nicht gesehen <small>nicht in die Berechnung einbeziehen</small></button></div>`)}
async function castVote(id,val){
  if(!cloud||session?.demo){
    const a=state.anime.find(x=>x.id===id);

    if(!a)return;

    a.votes.push(val);
    save();
    closeModal();
    render();
    toast(`Demo gespeichert: ${RANKS[val].icon} ${RANKS[val].name}`);
    return;
  }

  const a=state.anime.find(x=>x.id===id);

  if(!a)return toast('Anime nicht gefunden.');

  const {data:existing,error:findError}=await sb
    .from('ratings')
    .select('id')
    .eq('group_anime_id',a.id)
    .eq('user_id',session.user.id)
    .maybeSingle();

  if(findError)return toast(findError.message);

  let error;

  if(existing){
    ({error}=await sb
      .from('ratings')
      .update({
        rating:val,
        not_seen:false,
        updated_at:new Date().toISOString()
      })
      .eq('id',existing.id));
  }else{
    ({error}=await sb
      .from('ratings')
      .insert({
        group_anime_id:a.id,
        user_id:session.user.id,
        rating:val,
        not_seen:false
      }));
  }

  if(error)return toast(error.message);

  await loadCloud();
  closeModal();
  render();
  toast(`Gespeichert: ${RANKS[val].icon} ${RANKS[val].name}`);
}
async function markUnseen(id){if(cloud&&!session?.demo){const {error}=await sb.from('ratings').upsert({group_id:group.id,anime_id:id,user_id:session.user.id,score:null,seen:false,updated_at:new Date().toISOString()},{onConflict:'group_id,anime_id,user_id'});if(error)return toast(error.message);await loadCloud()}closeModal();render();toast('Als „Nicht gesehen“ markiert.')}
function openAdd(){showModal(`<div class="modal-head"><h3>＋ Anime hinzufügen</h3><button class="close" onclick="closeModal()">×</button></div><div class="modal-body"><div class="notice"><b>Automatische Daten:</b> Suche über AniList. Titel und Cover werden direkt übernommen.</div><div class="search-row"><input id="animeSearch" class="search" placeholder="z. B. Re:ZERO, Frieren, One Piece..." onkeydown="if(event.key==='Enter')searchAnime()"><button class="btn primary" onclick="searchAnime()">Suchen</button></div><div id="results"></div></div>`)}
async function searchAnime(){const q=document.getElementById('animeSearch').value.trim(),out=document.getElementById('results');if(!q)return;out.innerHTML='<div class="loading">🔎 Suche AniList…</div>';try{const res=await fetch('https://graphql.anilist.co',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:`query($search:String){Page(perPage:12){media(search:$search,type:ANIME,sort:SEARCH_MATCH){id title{romaji english native}coverImage{large}episodes seasonYear}}}`,variables:{search:q}})});const data=await res.json();const items=data?.data?.Page?.media||[];out.innerHTML=items.length?`<div class="search-results">${items.map(x=>`<button class="result" onclick='addAnime(${JSON.stringify(x).replace(/'/g,"&#39;")})'><img src="${cover(x.coverImage?.large,x.title.romaji)}"><div>${esc(x.title.english||x.title.romaji)}<small>${x.seasonYear||''} · ${x.episodes||'?'} Folgen</small></div></button>`).join('')}</div>`:'<div class="empty">Keinen Anime gefunden.</div>'}catch(e){out.innerHTML='<div class="notice">Die Anime-Suche konnte gerade nicht erreicht werden.</div>'}}
async function addAnime(x){
  const title=x.title.english||x.title.romaji||x.title.native;

  if(!cloud||session?.demo){
    if(state.anime.some(a=>a.externalId===x.id||a.title.toLowerCase()===title.toLowerCase()))
      return toast('Dieser Anime ist bereits im Ranking.');

    state.anime.push({
      id:Date.now(),
      externalId:x.id,
      title,
      cover:x.coverImage?.large,
      votes:[]
    });

    save();
    closeModal();
    render();
    toast(`${title} wurde hinzugefügt.`);
    return;
  }

  const {data:a,error}=await sb
    .from('group_anime')
    .insert({
      group_id:group.id,
      anilist_id:x.id,
      title:title,
      cover_url:x.coverImage?.large||null,
      year:x.year||null,
      added_by:session.user.id
    })
    .select()
    .single();

  if(error){
    if(error.code==='23505')
      return toast('Dieser Anime ist bereits in der Gruppe.');

    return toast(error.message);
  }

  await loadCloud();
  closeModal();
  render();
  toast(`${title} wurde zur Gruppe hinzugefügt.`);
}
function openGroup(){if(cloud&&!session?.demo&&!group){showModal(`<div class="modal-head"><h3>👥 Deine Gruppen</h3><button class="close" onclick="closeModal()">×</button></div><div class="modal-body profile"><p class="muted">Du bist noch keiner Gruppe beigetreten. Erstelle eine neue Gruppe oder nutze einen Einladungscode.</p><button class="btn primary" onclick="createGroup()">＋ Gruppe erstellen</button><button class="btn" onclick="openJoin()">🔗 Mit Einladungscode beitreten</button></div>`);return}if(!cloud||session?.demo){showModal(`<div class="modal-head"><h3>👥 ${esc(state.group)}</h3><button class="close" onclick="closeModal()">×</button></div><div class="modal-body profile"><label>Gruppenname</label><input id="groupName" class="input" value="${esc(state.group)}"><div class="notice">Cloud ist noch nicht eingerichtet. Nach dem Eintragen der Supabase-Daten kannst du hier echte Gruppen erstellen und Codes teilen.</div><button class="btn primary" onclick="saveGroup()">Speichern</button></div>`);return}showModal(`<div class="modal-head"><h3>👥 Gruppe</h3><button class="close" onclick="closeModal()">×</button></div><div class="modal-body profile"><label>Gruppenname</label><input id="groupName" class="input" value="${esc(group.name)}"><label>Einladungscode</label><div class="profile-row"><input class="input" value="${esc(group.invite_code)}" readonly><button class="btn" onclick="navigator.clipboard?.writeText('${group.invite_code}');toast('Code kopiert!')">Kopieren</button></div><div class="member-preview">${members.slice(0,6).map(m=>`<span>👤</span>`).join('')}<b>${members.length} Mitglieder</b></div><button class="btn primary" onclick="saveGroup()">Namen speichern</button><button class="btn" onclick="openJoin()">＋ Einer anderen Gruppe beitreten</button></div>`)}
async function saveGroup(){const name=document.getElementById('groupName').value.trim()||'Meine Anime-Gruppe';if(!cloud||session?.demo){state.group=name;save();closeModal();render();return}const {error}=await sb.from('groups').update({name}).eq('id',group.id);if(error)return toast(error.message);group.name=name;state.group=name;closeModal();render();toast('Gruppenname gespeichert.')}
function openJoin(){showModal(`<div class="modal-head"><h3>👥 Gruppe beitreten</h3><button class="close" onclick="closeModal()">×</button></div><div class="modal-body profile"><label>Einladungscode</label><input id="joinCode" class="input" placeholder="ANIME-7K4P"><div class="notice">Der Code kommt von einem Gruppenmitglied.</div><button class="btn primary" onclick="joinGroup()">Beitreten</button></div>`)}
async function createGroup(){showModal(`<div class="modal-head"><h3>＋ Gruppe erstellen</h3><button class="close" onclick="closeModal()">×</button></div><div class="modal-body profile"><label>Gruppenname</label><input id="newGroupName" class="input" placeholder="Die Anime-Suchtis"><button class="btn primary" onclick="doCreateGroup()">Gruppe erstellen</button></div>`)}
async function doCreateGroup(){const name=document.getElementById('newGroupName').value.trim()||'Meine Anime-Gruppe';const {data,error}=await sb.schema('public').rpc('create_animerank_group',{p_name:name});if(error)return toast(error.message);group=data;state.group=group.name;await loadCloud();closeModal();render();toast('Gruppe erstellt!')}
async function joinGroup(){const code=document.getElementById('joinCode').value.trim();if(!code)return;const {data,error}=await sb.schema('public').rpc('join_animerank_group',{p_code:code});if(error)return toast(error.message);group=data;state.group=group.name;await loadCloud();closeModal();render();toast(`Du bist jetzt in „${group.name}“.`)}
function openProfile(){showModal(`<div class="modal-head"><h3>👤 Profil</h3><button class="close" onclick="closeModal()">×</button></div><div class="modal-body profile"><label>Dein Name</label><input id="username" class="input" value="${esc(state.username)}"><button class="btn primary" onclick="saveProfile()">Speichern</button>${cloud?`<button class="btn" onclick="signOut()">Ausloggen</button>`:''}</div>`)}
async function saveProfile(){const username=document.getElementById('username').value.trim()||'Anime-Fan';state.username=username;save();if(cloud&&!session?.demo){const {error}=await sb.from('profiles').upsert({id:session.user.id,username});if(error)return toast(error.message)}closeModal();render();toast('Profil gespeichert.')}
async function signOut(){await sb.auth.signOut();session=null;group=null;state.anime=structuredClone(seed);render();toast('Ausgeloggt.')}
function openSettings(){showModal(`<div class="modal-head"><h3>⚙ Einstellungen</h3><button class="close" onclick="closeModal()">×</button></div><div class="modal-body profile"><div class="setting"><div><b>${cloud?'Cloud verbunden':'Demo-Modus'}</b><span>${cloud?'Supabase Auth + Datenbank':'Lokale Browser-Speicherung'}</span></div><span class="pill">${cloud?'ONLINE':'DEMO'}</span></div><div class="setting"><div><b>Demo-Daten</b><span>Lokales Ranking zurücksetzen</span></div><button class="btn" onclick="if(confirm('Demo-Daten wirklich zurücksetzen?')){state.anime=structuredClone(seed);save();closeModal();render();toast('Demo-Daten zurückgesetzt.')} ">Zurücksetzen</button></div></div>`)}
function showModal(body){document.getElementById('modalRoot').innerHTML=`<div class="modal-back" onclick="if(event.target===this)closeModal()"><div class="modal">${body}</div></div>`}function closeModal(){document.getElementById('modalRoot').innerHTML=''}function toast(t){const x=document.getElementById('toast');x.textContent=t;x.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>x.classList.remove('show'),2800)}
async function loadCloud(){
  if(!cloud||!session?.user)return;

  const {data:gs,error:ge}=await sb
    .from('group_members')
    .select('group_id,groups(*)')
    .eq('user_id',session.user.id);

  if(ge)return toast(ge.message);

  if(!group){
    group=gs?.[0]?.groups||null;
  }

  if(!group){
    state.anime=[];
    members=[];
    return;
  }

  const gid=group.id;

  const [ga,ms]=await Promise.all([
    sb.from('group_anime')
      .select('*')
      .eq('group_id',gid),

    sb.from('group_members')
      .select('*')
      .eq('group_id',gid)
  ]);

  if(ga.error)return toast(ga.error.message);

  members=ms.data||[];

  const groupAnimeIds=(ga.data||[]).map(a=>a.id);

  let ratings=[];

  if(groupAnimeIds.length){
    const {data:rt,error:re}=await sb
      .from('ratings')
      .select('*')
      .in('group_anime_id',groupAnimeIds);

    if(re)return toast(re.message);

    ratings=rt||[];
  }

  state.anime=(ga.data||[]).map(a=>({
    ...a,
    id:a.id,
    cover:a.cover_url,
    votes:ratings
      .filter(r=>r.group_anime_id===a.id&&!r.not_seen&&r.rating)
      .map(r=>r.rating)
  }));

  state.group=group.name;
}
async function bootCloud(){if(!cloud||!session?.user)return;const {data:p}=await sb.from('profiles').select('*').eq('id',session.user.id).maybeSingle();if(p)state.username=p.username;await loadCloud();setupRealtime()}
function setupRealtime(){if(!cloud||!group)return;sb.channel('animerank-'+group.id).on('postgres_changes',{event:'*',schema:'public',table:'ratings',filter:`group_id=eq.${group.id}`},async()=>{await loadCloud();render()}).on('postgres_changes',{event:'*',schema:'public',table:'group_anime',filter:`group_id=eq.${group.id}`},async()=>{await loadCloud();render()}).subscribe()}
const app={go(v){state.view=v;render()}};document.querySelectorAll('.nav-btn').forEach(b=>b.onclick=()=>app.go(b.dataset.view));document.getElementById('profileBtn').onclick=openProfile;
(async()=>{if(cloud){const {data}=await sb.auth.getSession();session=data.session;if(session)await bootCloud()}else{session=null}render()})();
