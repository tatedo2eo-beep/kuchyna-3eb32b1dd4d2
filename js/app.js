(function(){
'use strict';
const $=s=>document.querySelector(s);
const S={lang:'sk',design:'e',pal:'',idx:null,meta:null,ch:{},serv:{},ver:'tami'};
try{S.lang=localStorage.getItem('tami.lang')||'sk';S.design=localStorage.getItem('tami.design')||'e';if(S.design==='a')S.design='e';S.pal=localStorage.getItem('tami.pal')||'';}catch(e){}
if(!['sk','en'].includes(S.lang))S.lang='sk';
const T=()=>I18N[S.lang];
function lsGet(k){try{return JSON.parse(localStorage.getItem(k)||'{}')||{};}catch(e){return {};}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
S.fav=lsGet('tami.fav');S.cooked=lsGet('tami.cooked');
const hasMark=(store,id)=>Object.keys(store).some(k=>k===id||k.startsWith(id+'|'));
const HEART='<svg viewBox="0 0 24 24" class="ic hrt"><path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.2 3 4.5 6.6 4.5c2.1 0 3.6 1.2 5.4 3.2 1.8-2 3.3-3.2 5.4-3.2 3.6 0 5.7 3.7 4.2 7.2C19.5 16.4 12 21 12 21z"/></svg>';
function markBtns(id,fl){const t=T();const k=fl?id+'|'+fl.en:id;const f=!!S.fav[k],c=S.cooked[k];
  return '<span class="marks"><button class="heart'+(f?' on':'')+'" data-act="fav" data-k="'+esc(k)+'" data-fen="'+esc(fl?fl.en:'')+'" data-fsk="'+esc(fl?fl.sk:'')+'" aria-pressed="'+f+'">'+HEART+'<span>'+esc(f?t.favOn:t.favAdd)+'</span></button>'+
  '<button class="stamp'+(c?' on':'')+'" data-act="cooked" data-k="'+esc(k)+'" data-fen="'+esc(fl?fl.en:'')+'" data-fsk="'+esc(fl?fl.sk:'')+'" aria-pressed="'+!!c+'"><span class="seal">'+(c?'✓':'')+'</span><span>'+esc(c?t.cookedOn+' '+fmtDate(c.t):t.cookedAdd)+'</span></button></span>';}
const cap=x=>x?x[0].toUpperCase()+x.slice(1):x;
function fmtDate(ts){try{return new Date(ts).toLocaleDateString(S.lang==='sk'?'sk-SK':'en-GB',{day:'numeric',month:'numeric',year:'numeric'});}catch(e){return '';}}
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function linkify(s){return esc(s).replace(/https?:\/\/[^\s<>"]+/g,u=>{let t='';while(/[).,;:]$/.test(u)&&!(u.endsWith(')')&&u.split('(').length>u.split(')').length-1)){t=u.slice(-1)+t;u=u.slice(0,-1);}return '<a href="'+u+'" target="_blank" rel="noopener noreferrer">'+u.replace(/^https?:\/\/(www\.)?/,'').replace(/\/$/,'')+'</a>'+t;});}
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const L=o=>o?(o[S.lang]!=null?o[S.lang]:o.en):'';
const ICON={pal:'<svg viewBox="0 0 24 24" class="ic" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-.5-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.9.7-1.6 1.6-1.6H16a5 5 0 0 0 5-5C21 6.4 17 3 12 3z"/><circle cx="7.5" cy="11" r="1.2"/><circle cx="10.5" cy="7.5" r="1.2"/><circle cx="15" cy="7.5" r="1.2"/></svg>',
 search:'<svg viewBox="0 0 24 24" class="ic" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
 clock:'<svg viewBox="0 0 24 24" class="ic" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
 cat:'<svg viewBox="0 0 24 24" class="ic" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 20v-9l2-6 3 4h6l3-4 2 6v9z"/><circle cx="9" cy="14" r=".8"/><circle cx="15" cy="14" r=".8"/></svg>'};

// ---------------- theme ----------------
let themeKeys=[];
function applyTheme(design,pal){
  const D=DESIGNS.find(d=>d.k===design)||DESIGNS[0];
  const P=D.pals.find(p=>p[0]===pal)||D.pals[0];
  const changed=S.design!==D.k||S.pal!==P[0];
  S.design=D.k;S.pal=P[0];
  const r=document.documentElement;r.dataset.design=D.k;r.dataset.pal=P[0];
  themeKeys.forEach(k=>{if(!(k in P[2]))r.style.removeProperty('--'+k);});   // no stale variables left from the previous palette
  for(const k in P[2])r.style.setProperty('--'+k,P[2][k]);
  themeKeys=Object.keys(P[2]);
  r.style.setProperty('--fh',D.fonts[0]);r.style.setProperty('--fb',D.fonts[1]);
  try{localStorage.setItem('tami.design',D.k);localStorage.setItem('tami.pal',P[0]);}catch(e){}
  if(!$('#palpanel').hidden)renderPal();
  if(changed&&S.cur)rerender(true);   // repaint the open page at once, whatever page it is
}
const PV={
 e:'<span class="pv-mast"><b class="pv-fh">Kuchárka <i>pre Tami</i></b></span><span class="pv-nav"><i></i><i></i><i></i><i></i><i></i></span><span class="pv-full"><span class="pv-fh">Aa</span></span><span class="pv-row"><i></i><i></i><i></i><i></i></span>',
 b:'<span class="pv-sb"><i></i><i></i><i></i><i></i><i></i><i></i></span><span class="pv-book"><span class="pv-pg"><span class="pv-ph"></span><span class="pv-fh">Aa</span><i></i><i></i></span><span class="pv-pg"><i></i><i></i><i></i><i></i><i></i></span></span>',
 c:'<span class="pv-cork"><span class="pv-pol p1"><i></i></span><span class="pv-pol p2"><i></i></span><span class="pv-note"><span class="pv-fh">Aa</span></span><span class="pv-pol p3"><i></i></span><span class="pv-pol p4"><i></i></span></span>',
 d:'<span class="pv-arch"></span><span class="pv-bub"><span class="pv-fh">Aa</span></span><span class="pv-cat"></span><span class="pv-arches"><i></i><i></i><i></i></span><span class="pv-dock"></span>',
 g:'<span class="pv-rail"><i></i><i></i><i></i><i></i></span><span class="pv-bento"><i class="w2 h2 im"></i><i class="ac"><span class="pv-fh">Aa</span></i><i></i><i class="im"></i><i class="w2"></i><i class="im"></i></span>'};
function renderPal(){
  const t=T();
  $('#palpanel').innerHTML='<div class="palbox" role="dialog" aria-label="'+esc(t.themeH)+'"><div class="palhead"><div><h3>'+esc(t.themeH)+'</h3><p>'+esc(t.themeP)+'</p></div><button class="palx" data-act="palclose" aria-label="'+esc(t.close)+'">×</button></div><div class="palgrid">'+
  DESIGNS.map(D=>{const cur=D.pals.find(p=>p[0]===S.pal&&D.k===S.design)||D.pals[0];const c=cur[2];
    return '<div class="pald'+(D.k===S.design?' on':'')+'"><button class="prev prev-'+D.k+'" data-act="theme" data-d="'+D.k+'" data-p="'+(D.k===S.design?S.pal:D.pals[0][0])+'" aria-label="'+esc(D[S.lang])+'" style="--pbg:'+c.bg+';--psf:'+c.surface+';--pac:'+c.accent+';--ptx:'+c.text+';--pln:'+c.line+';--pmu:'+c.muted+';--pside:'+(c.side||c.surface2)+';--pfh:'+D.fonts[0]+';font-family:'+D.fonts[1]+'">'+PV[D.k]+'</button>'+
      '<div class="palmeta"><b>'+esc(D[S.lang])+'</b><span class="dots">'+D.pals.map(p=>'<button class="dot'+(S.design===D.k&&S.pal===p[0]?' on':'')+'" title="'+esc(p[1])+'" aria-label="'+esc(p[1])+'" data-act="theme" data-d="'+D.k+'" data-p="'+p[0]+'" style="--d1:'+p[2].bg+';--d2:'+p[2].accent+';--d3:'+(p[2].side||p[2].surface2)+'"></button>').join('')+'</span></div><div class="palname">'+esc(cur[1])+(D.lay?' · <span class="lay">'+esc(L(D.lay))+'</span>':'')+'</div></div>';}).join('')+'</div></div>';
}
function togglePal(open){const p=$('#palpanel');p.hidden=!open;if(open)renderPal();}

// ---------------- data ----------------
let idxP=null;
function loadIndex(){return idxP||(idxP=fetch('data/index.json').then(r=>{if(!r.ok)throw new Error('index '+r.status);return r.json();}).then(d=>{S.meta=d.meta;S.idx=d.r;S.chMap={};d.meta.chapters.forEach(c=>S.chMap[c.stem]=c);return d;}));}
function loadCh(stem){return S.ch[stem]?Promise.resolve(S.ch[stem]):fetch('data/ch/'+encodeURIComponent(stem)+'.json').then(r=>{if(!r.ok)throw new Error('chapter '+r.status);return r.json();}).then(d=>(S.ch[stem]=d));}
const chName=stem=>{const c=S.chMap[stem];return c?(S.lang==='sk'?c.sk:c.en):stem;};
const lvlName=l=>T().levels[l]||l;

// ---------------- header / toc / footer ----------------
const NI={home:'<svg viewBox="0 0 24 24" class="ic" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 11 12 4l9 7v9h-6v-6H9v6H3z"/></svg>',
 chapters:'<svg viewBox="0 0 24 24" class="ic" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 5h6a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h6z"/></svg>',
 search:'<svg viewBox="0 0 24 24" class="ic" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
 healthy:'<svg viewBox="0 0 24 24" class="ic" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 19c0-8 6-14 15-14 0 9-6 15-14 15M5 19l7-7"/></svg>',
 countries:'<svg viewBox="0 0 24 24" class="ic" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>',
 chefs:'<svg viewBox="0 0 24 24" class="ic" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 14a4 4 0 1 1 1.5-7.7A4 4 0 0 1 16 6a4 4 0 1 1 1 8v5H7z"/><path d="M7 17h10"/></svg>',
 fridge:'<svg viewBox="0 0 24 24" class="ic" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M5 10h14M9 6v2M9 13v3"/></svg>',
 meals:'<svg viewBox="0 0 24 24" class="ic" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="13" r="6.5"/><circle cx="12" cy="13" r="3.2"/><path d="M3 4v5a1.5 1.5 0 0 0 3 0V4M4.5 9v11M20 4c-1.6 1-2.2 3-2.2 6h2.2v10"/></svg>',
 seasonal:'<svg viewBox="0 0 24 24" class="ic" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21c-4.4 0-7-3-7-7 0-5 4-9 9-10-1 2 0 3 1.5 4.5C17 10 19 12 19 15c0 3.5-3 6-7 6z"/><path d="M12 21c0-5 1-8 3-10"/></svg>',
 favorites:'<svg viewBox="0 0 24 24" class="ic" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20s-7-4.4-8.6-8.6C2.3 8.4 4.2 5 7.4 5c2 0 3.3 1.1 4.6 2.8C13.3 6.1 14.6 5 16.6 5c3.2 0 5.1 3.4 4 6.4C19 15.6 12 20 12 20z"/></svg>'};
function renderChrome(route){
  const t=T(),d=S.design;document.documentElement.lang=S.lang;document.title=t.brand1+' '+t.brand2;
  const nav=[['#/',t.home,'home'],['#/chapters',t.chapters,'chapters'],['#/search',t.search,'search'],['#/healthy',t.healthy,'healthy'],['#/countries',t.countries,'countries'],['#/meals',t.meals,'meals'],['#/seasonal',t.seasonal,'seasonal'],['#/chefs',t.chefsShort,'chefs'],['#/fridge',t.fridgeShort,'fridge'],['#/favorites',t.favorites,'favorites']];
  const soon=[['shopping',t.shopping],['joe',t.joe],['about',S.lang==='sk'?'O kuchárke':'About']];
  const links=(icons)=>nav.map(n=>'<a href="'+n[0]+'" class="'+(route===n[2]?'on':'')+'"'+(icons?' title="'+esc(n[1])+'"':'')+'>'+(icons?'<span class="ni">'+NI[n[2]]+'</span>':'')+'<span class="nl">'+esc(n[1])+'</span></a>').join('');
  const soonL='<span class="soonwrap"><span class="soonlab">'+esc(t.more)+':</span>'+soon.map(s=>s[0]==='joe'?'<a href="#" data-joeopen class="soon joelink">'+esc(s[1])+' <i class="joeai">AI</i></a>':'<a href="'+({shopping:'#/shop',about:'#/about'}[s[0]]||'#/soon/'+s[0])+'" class="soon'+((s[0]==='shopping'&&route==='shop')||(s[0]==='about'&&route==='about')?' on':'')+'">'+esc(s[1])+'</a>').join('')+'</span>';
  const tools='<div class="tools"><div class="lang" role="group" aria-label="Language"><button data-act="lang" data-l="sk" class="'+(S.lang==='sk'?'on':'')+'">SK</button><button data-act="lang" data-l="en" class="'+(S.lang==='en'?'on':'')+'">EN</button></div>'+
   '<button class="palbtn" data-act="pal" title="'+esc(t.theme)+'" aria-label="'+esc(t.theme)+'">'+ICON.pal+'<span>'+esc(t.theme)+'</span></button></div>';
  const qs='<form class="qs" data-act="qs"><span class="qsi">'+ICON.search+'</span><input name="q" type="search" placeholder="'+esc(t.searchPh)+'" aria-label="'+esc(t.search)+'"></form>';
  const brand='<a class="brand" href="#/"><span class="logo">T</span><span class="bt">'+esc(t.brand1)+' <i>'+esc(t.brand2)+'</i></span></a>';
  const nRec=S.idx?S.idx.length:0;
  let top='',toc='';
  if(d==='b'){
    top='<div class="topbar"><div class="wrap topin"><span class="runner">'+esc(t.brand1)+' <i>'+esc(t.brand2)+'</i></span>'+qs+tools+'</div></div>';
    const groups=[[t.savory,c=>c.num<24],[t.sweet,c=>c.num>=24&&c.num<34],[t.drinks,c=>c.num===34]];
    const roman=['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
    toc=S.meta?'<a class="tocbrand" href="#/">'+esc(t.brand1)+' <i>'+esc(t.brand2)+'</i></a><div class="toch">'+esc(t.contents)+'</div><nav class="tocnav">'+nav.map((n,i)=>'<a href="'+n[0]+'" class="'+(route===n[2]?'on':'')+'"><span class="rn">'+roman[i]+'.</span><span>'+esc(n[1])+'</span></a>').join('')+'</nav><details class="tocch"'+(S.tocOpen!==false&&(S.tocOpen||innerWidth>=1100)?' open':'')+'><summary class="toch"><span>'+esc(t.chapters)+'</span><b>'+S.meta.chapters.length+'</b></summary>'+groups.map(g=>'<div class="tocg">'+esc(g[0])+'</div>'+S.meta.chapters.filter(g[1]).map(c=>'<a href="#/c/'+c.stem+'" class="tc'+(location.hash.split('?')[0]==='#/c/'+c.stem?' on':'')+'"><span>'+esc(S.lang==='sk'?c.sk:c.en)+'</span><em></em><b>'+c.n+'</b></a>').join('')).join('')+'</details><div class="toch">'+esc(t.more)+'</div>'+soon.map(s=>'<a href="'+({shopping:'#/shop',about:'#/about'}[s[0]]||'#/soon/'+s[0])+'" class="tc soon">'+esc(s[1])+'</a>').join(''):'';
  }else if(d==='c'){
    top='<div class="cbar"><div class="wrap cbarin">'+brand+'<nav class="cnotes">'+links(false)+'</nav></div><div class="wrap cbar2">'+qs+tools+soonL+'</div></div>';
  }else if(d==='d'){
    top='<div class="wrap dtop">'+brand+qs+tools+'</div><nav class="dock">'+links(true)+'</nav>';
  }else if(d==='g'){
    top='<div class="wrap gtop"><div class="greet"><b>'+esc(S.lang==='sk'?'Ahoj, Tami':'Hi, Tami')+'</b><span>'+esc(t.recipes(nRec))+'</span></div>'+qs+tools+'</div>';
    toc='<a class="glogo" href="#/" title="'+esc(t.brand1+' '+t.brand2)+'">T</a><nav class="rail">'+links(true)+'</nav><div class="railsoon"><span>'+esc(t.soon)+'</span>'+soon.map(s=>'<a href="'+({shopping:'#/shop',about:'#/about'}[s[0]]||'#/soon/'+s[0])+'" title="'+esc(s[1])+'">'+esc(s[1])+'</a>').join('')+'</div>';
  }else{ // e · magazine
    top='<div class="mast"><div class="wrap mastin"><span class="dateline">'+esc(t.issue)+' · '+esc(t.recipes(nRec))+'</span>'+brand+tools+'</div></div><nav class="mainnav"><div class="wrap navin">'+links(false)+'<span class="navq">'+qs+'</span></div></nav>';
  }
  $('#top').innerHTML=top;$('#toc').innerHTML=toc;
  fitToc();
  $('#foot').innerHTML='<div class="wrap footin"><span class="fb">'+esc(t.brand1)+' <i>'+esc(t.brand2)+'</i></span>'+soonL+'<span>'+(S.idx?esc(t.recipes(S.idx.length))+' · '+S.meta.chapters.length+' '+esc(t.chapters.toLowerCase()):'')+'</span></div>';
}
// design B: the contents sidebar scrolls with the page and then stays put once its end is in view (no inner scroll area)
function fitToc(){const el=$('#toc');if(!el)return;if(S.design!=='b'){el.style.removeProperty('--tt');return;}
  requestAnimationFrame(()=>el.style.setProperty('--tt',(innerWidth<1100?0:Math.min(0,innerHeight-el.offsetHeight))+'px'));}
window.addEventListener('resize',fitToc);
document.addEventListener('toggle',e=>{if(e.target.classList&&e.target.classList.contains('tocch')){S.tocOpen=e.target.open;fitToc();}},true);
// ---------------- cards ----------------
function card(r){
  const t=T();
  const al=r.al.length?r.al.map(a=>t.al[a]).join(', '):t.noAllergens;
  const badges=[r.h?'<span class="bdg h">'+esc(t.healthyBadge)+'</span>':'',r.af?'<span class="bdg">'+esc(t.af)+'</span>':'',r.sp?'<span class="bdg sp">'+esc(t.spicy)+'</span>':'',r.caf?'<span class="bdg">'+esc(t.caf)+'</span>':''].join('');
  const fv=hasMark(S.fav,r.id),ck=hasMark(S.cooked,r.id);
  return '<a class="rc" href="#/r/'+r.id+'"><span class="rimg">'+(ck?'<span class="ribbon">'+esc(t.cookedRibbon)+'</span>':'')+(fv?'<span class="favdot" title="'+esc(t.favorites)+'">'+HEART+'</span>':'')+(r.img?'<img loading="lazy" src="'+r.img+'" alt="'+esc(L(r.t))+'">':'')+'</span><span class="rcb"><span class="no">'+esc(chName(r.ch))+' · '+esc(lvlName(r.lvl))+'</span><h3>'+esc(L(r.t))+'</h3><span class="meta">'+(r.total?ICON.clock+' '+fmtMin(r.total):'')+(r.kcal?' · '+r.kcal+' kcal':'')+'</span><span class="al">'+esc(al)+'</span><span class="bdgs">'+badges+'</span></span></a>';
}
function fmtMin(m){if(m<90)return m+' min';const d=Math.floor(m/1440),h=Math.floor((m%1440)/60),mm=m%60;return (d?d+(S.lang==='sk'?' d ':' d '):'')+(h?h+' h':'')+(mm?' '+mm+' min':'');}
// per-design featured-image picks (meta.picks, from design_picks.py): no photo shared between designs or slots
const PK=()=>(S.meta.picks||{})[S.design]||{home:{},covers:{},meals:{}};
const coverOf=c=>{const p=PK().covers[c.stem];return p?p.img:'';};
const grid=list=>'<div class="rgrid">'+list.map(card).join('')+'</div>';

// ---------------- views ----------------
function vHome(){
  const t=T(),M=S.meta,d=S.design;
  const byId=id=>S.idx.find(r=>r.id===id);
  const P0=PK().home,pr=x=>{const r=x&&byId(x.id);return r?Object.assign({},r,{img:x.img}):null;};
  const hero=pr(P0.hero),featL=(P0.feat||[]).map(pr).filter(Boolean);const abs=u=>new URL(u,location.href).href;
  const nRec=S.idx.length,nCh=M.chapters.length;
  const grpDef=[['savory',t.savory,c=>c.num<24,'01-fries-potatoes/hasselback-advanced'],['sweet',t.sweet,c=>c.num>=24&&c.num<34,'24-cookies-bars-brownies/brownie-fudgy-or-cakey-brownies'],['drinks',t.drinks,c=>c.num===34,'34-drinks/lemonade-basic']];
  const grpInfo=g=>{const cs=M.chapters.filter(g[2]);const n=cs.reduce((a,c)=>a+c.n,0);const p=P0.grp&&P0.grp[g[0]];return {k:g[0],name:g[1],cs:cs.length,n,img:p?p.img:'',f:g[2]};};
  const G=grpDef.map(grpInfo);
  const chW=n=>S.lang==='sk'?(n==1?'kapitola':n<5?'kapitoly':'kapitol'):(n==1?'chapter':'chapters');
  // no cats on the home screen (Joe, 16 Oct): dish pictures only
  const dishTile=(cls,r)=>r?'<a data-slot="hero" class="'+cls+'" href="#/r/'+r.id+'"><img src="'+r.img+'" alt=""><span class="ctb"><span class="pl">'+esc(t.featured)+'</span><b>'+esc(L(r.t))+'</b><em>'+esc(chName(r.ch))+'</em></span></a>':'';
  const sform=(cls)=>'<form class="sbox '+(cls||'')+'" data-act="qs">'+ICON.search+'<input name="q" type="search" placeholder="'+esc(t.searchPh)+'"><button class="go">'+esc(t.go)+'</button></form>';
  const quick='<div class="chips qchips"><a class="chip" href="#/search?time=30">'+esc(t.upTo(30))+'</a><a class="chip" href="#/search?af=1">'+esc(t.af)+'</a><a class="chip" href="#/search?no=gluten">'+esc(t.without)+': '+esc(t.al.gluten)+'</a><a class="chip" href="#/search?no=milk">'+esc(t.without)+': '+esc(t.al.milk)+'</a><a class="chip" href="#/search?no=eggs">'+esc(t.without)+': '+esc(t.al.eggs)+'</a><a class="chip" href="#/search?lvl=Basic">'+esc(t.levels.Basic)+'</a><a class="chip" href="#/search?lvl=Advanced">'+esc(t.levels.Advanced)+'</a></div>';
  const sub=esc(t.recipes(nRec))+' · '+nCh+' '+esc(chW(nCh));
  const featSec=(cls)=>'<section class="sec" data-slot="feat"><div class="wrap"><div class="sh2"><h2>'+esc(t.featured)+'</h2></div>'+grid(featL,cls)+'</div></section>';
  if(d==='b'){
    const toc=G.map(g=>'<div class="ctg"><h3>'+esc(g.name)+'</h3>'+M.chapters.filter(g.f).map(c=>'<a class="ctl" href="#/c/'+c.stem+'"><span class="cn">'+String(c.num).padStart(2,'0')+'</span><span class="ct">'+esc(S.lang==='sk'?c.sk:c.en)+'</span><em></em><b>'+c.n+'</b></a>').join('')+'</div>').join('');
    return '<section class="book wrap"><div class="spread home"><div class="page left title">'+(()=>{const r=pr(P0.plate);return r?'<a class="frontis" data-slot="plate" href="#/r/'+r.id+'"><span class="fpl"><img src="'+r.img+'" alt="'+esc(L(r.t))+'"></span><span class="fcap">'+esc(L(r.t))+'</span></a>':'';})()+'<span class="kicker">'+esc(t.heroK)+' · SK / EN</span><h1>'+esc(t.brand1)+' <i>'+esc(t.brand2)+'</i></h1><div class="orn">❦</div><p>'+sub+'. '+esc(t.heroP)+'</p>'+sform()+quick+'<span class="folio">i</span></div>'+
     '<div class="page right"><div class="runhead"><span>'+esc(t.contents)+'</span><span>'+sub+'</span></div><h2 class="pageh">'+esc(t.contents)+'</h2>'+toc+'<span class="folio">ii</span></div></div></section>'+featSec();
  }
  if(d==='c'){
    const tiles=(P0.cpin||[]).map(pr).filter(Boolean);
    return '<section class="chero wrap"><div class="cnote big"><h1>'+esc(t.heroH).replace(/(\S+)\?$/,'<span>$1</span>?')+'</h1><p>'+sub+'</p>'+sform('big')+quick+'</div>'+dishTile('catcard dishcard',hero)+'</section>'+
      '<section class="wrap crow"><a class="ccount" href="#/chapters"><b>'+esc(t.recipes(nRec))+'</b><span>'+esc(t.heroP)+'</span><em>'+esc(t.chapters)+' →</em></a>'+tiles.map((r,i)=>'<a class="cpin" data-slot="cpin'+i+'" href="#/r/'+r.id+'"><img src="'+r.img+'" alt=""><span>'+esc(chName(r.ch))+'</span><b>'+esc(L(r.t))+'</b></a>').join('')+'</section>'+chapterGroups()+featSec();
  }
  if(d==='d'){
    return '<section class="dhero wrap">'+(()=>{const r=hero;return r?'<a class="dcat dpic" data-slot="hero" href="#/r/'+r.id+'" aria-label="'+esc(L(r.t))+'" style="--cat-img:url(&quot;'+abs(r.img)+'&quot;)"></a>':'';})()+'<div class="dbubble"><span class="kicker">'+esc(t.heroK)+'</span><h1>'+esc(t.heroH)+'</h1><p>'+sub+'</p>'+sform()+'</div></section>'+
      '<section class="wrap dgrps">'+G.map(g=>'<a href="#/chapters?g='+g.k+'" data-slot="grp:'+g.k+'"><span class="arch"><img src="'+g.img+'" alt=""></span><b>'+esc(g.name)+'</b><span>'+g.cs+' '+esc(chW(g.cs))+' · '+esc(t.recipes(g.n))+'</span></a>').join('')+'</section>'+
      '<section class="wrap dquick">'+quick+'</section>'+featSec()+chapterGroups();
  }
  if(d==='g'){
    return '<section class="gbento wrap"><div class="gbig" data-slot="hero" style="--hero-img:url(&quot;'+(hero?abs(hero.img):'')+'&quot;)"><div class="glass"><span class="pill">'+esc(S.lang==='sk'?'Ahoj, Tami':'Hi, Tami')+'</span><h1>'+esc(t.heroH)+'</h1><p>'+sub+'</p>'+sform()+'</div></div>'+
      '<div class="gstat"><span class="kicker">'+esc(t.brand1)+'</span><b>'+nRec+'</b><span>'+esc(t.heroP)+'</span></div>'+
      G.map(g=>'<a class="gtile" data-slot="grp:'+g.k+'" href="#/chapters?g='+g.k+'"><img src="'+g.img+'" alt=""><span class="glab"><b>'+esc(g.name)+'</b><span>'+g.cs+' '+esc(chW(g.cs))+' · '+esc(t.recipes(g.n))+'</span><i>›</i></span></a>').join('')+
      '<a class="gsm gseas" href="#/seasonal"><span class="kicker">'+esc(t.seasonal)+'</span><b>'+esc(t.months[new Date().getMonth()])+'</b><span>'+esc(t.szIn)+' · '+(S.lang==='sk'?'Slovensko':'Slovakia')+'</span></a><a class="gsm" href="#/healthy"><b>'+esc(t.healthy)+'</b><span>'+esc(t.sugarShort)+' · '+esc(t.caf)+'</span></a><a class="gsm" href="#/countries"><b>'+esc(t.countries)+'</b><span>'+esc(t.countriesP)+'</span></a></section>'+featSec()+chapterGroups();
  }
  // E · magazine
  const issue=(P0.issue||[]).map(pr).filter(Boolean);
  return '<section class="ehero" data-slot="hero" style="--hero-img:url(&quot;'+(hero?abs(hero.img):'')+'&quot;)"><div class="eshade"></div><div class="wrap ehin"><span class="kicker">'+esc(t.heroK)+'</span><h1>'+esc(t.heroH)+'</h1><p>'+esc(t.heroP)+'</p>'+sform('big')+
    '<a class="ecover" href="#/r/'+hero.id+'"><span class="kicker">'+esc(t.featured)+'</span><b>'+esc(L(hero.t))+'</b><span>'+esc(chName(hero.ch))+' →</span></a></div></section>'+
    '<section class="wrap eissue"><h2 class="ekick">'+esc(t.issue)+'</h2><ol>'+issue.map((r,i)=>'<li><a data-slot="issue'+i+'" href="#/r/'+r.id+'"><span class="enum">'+String(i+1).padStart(2,'0')+'</span>'+(r.img?'<img loading="lazy" src="'+r.img+'" alt="">':'')+'<span class="eis"><small>'+esc(chName(r.ch))+'</small><b>'+esc(L(r.t))+'</b></span></a></li>').join('')+'</ol></section>'+
    '<section class="wrap eidx"><h2 class="ekick">'+esc(t.chapters)+' · '+sub+'</h2><div class="ecols">'+G.map(g=>'<div><h3>'+esc(g.name)+'</h3>'+M.chapters.filter(g.f).map(c=>'<a href="#/c/'+c.stem+'"><span>'+String(c.num).padStart(2,'0')+'</span>'+esc(S.lang==='sk'?c.sk:c.en)+'<em>'+c.n+'</em></a>').join('')+'</div>').join('')+'</div></section>'+
    '<section class="sec quick"><div class="wrap"><div class="chips">'+Object.entries(t.types).map(([k,v])=>'<a class="chip" href="#/search?type='+k+'">'+esc(v)+'</a>').join('')+'<a class="chip h" href="#/healthy">'+esc(t.healthy)+'</a><a class="chip" href="#/search?af=1">'+esc(t.af)+'</a></div></div></section>'+featSec();
}
function chapterGroups(only){
  const t=T(),M=S.meta;const groups=[['savory',t.savory,c=>c.num<24],['sweet',t.sweet,c=>c.num>=24&&c.num<34],['drinks',t.drinks,c=>c.num===34]].filter(g=>!only||g[0]===only);
  if(S.design==='b')return '<section class="book wrap"><div class="spread single"><div class="page"><div class="runhead"><span>'+esc(t.contents)+'</span><span>'+esc(t.recipes(S.idx.length))+'</span></div><h1 class="pageh">'+esc(t.chapters)+'</h1>'+
    groups.map(g=>'<div class="ctg"><h3>'+esc(g[1])+'</h3>'+M.chapters.filter(g[2]).map(c=>'<a class="ctl" data-slot="cover:'+c.stem+'" href="#/c/'+c.stem+'"><span class="cn">'+String(c.num).padStart(2,'0')+'</span>'+(coverOf(c)?'<img loading="lazy" src="'+coverOf(c)+'" alt="">':'')+'<span class="ct">'+esc(S.lang==='sk'?c.sk:c.en)+'</span><em></em><b>'+c.n+'</b></a>').join('')+'</div>').join('')+'</div></div></section>';
  return '<section class="sec chg"><div class="wrap"><div class="sh2"><h2>'+esc(t.chapters)+'</h2><span>'+esc(t.recipes(S.idx.length))+'</span></div>'+
   groups.map(g=>'<div class="grp" id="g-'+g[0]+'"><h3>'+esc(g[1])+'</h3></div><div class="tgrid">'+M.chapters.filter(g[2]).map(c=>'<a class="tile" data-slot="cover:'+c.stem+'" href="#/c/'+c.stem+'"><span class="ti">'+(coverOf(c)?'<img loading="lazy" src="'+coverOf(c)+'" alt="">':'')+'</span><span class="num">'+String(c.num).padStart(2,'0')+'</span><h4>'+esc(S.lang==='sk'?c.sk:c.en)+'</h4><span class="cnt">'+esc(t.recipes(c.n))+'</span></a>').join('')+'</div>').join('')+'</div></section>';
}
function vChapters(params){return chapterGroups(params&&params.get('g')||'');}
function vChapter(stem,params){
  const t=T(),c=S.chMap[stem],d=S.design;if(!c)return vNotFound();
  let list=S.idx.filter(r=>r.ch===stem);const lv=params.get('lvl')||'',so=params.get('sort')||'';
  const lvls=[...new Set(list.map(r=>r.lvl))];
  if(lv)list=list.filter(r=>r.lvl===lv);
  if(so==='az')list=list.slice().sort((a,b)=>L(a.t).localeCompare(L(b.t),S.lang));
  if(so==='time')list=list.slice().sort((a,b)=>(a.total||1e9)-(b.total||1e9));
  const u=(k,v)=>{const p=new URLSearchParams(params);v?p.set(k,v):p.delete(k);const s=p.toString();return '#/c/'+stem+(s?'?'+s:'');};
  const name=esc(S.lang==='sk'?c.sk:c.en),num=String(c.num).padStart(2,'0');
  const crumbs='<div class="crumbs"><a href="#/chapters">'+esc(t.chapters)+'</a> / <b>'+name+'</b></div>';
  const chips='<span class="fl">'+esc(t.level)+'</span><a class="chip'+(!lv?' on':'')+'" href="'+u('lvl','')+'">'+esc(t.allLevels)+'</a>'+lvls.map(l=>'<a class="chip'+(lv===l?' on':'')+'" href="'+u('lvl',l)+'">'+esc(lvlName(l))+'</a>').join('')+
   '<span class="fl sp">'+esc(t.sort)+'</span>'+[['',t.sortDefault],['az',t.sortAz],['time',t.sortTime]].map(s=>'<a class="chip'+(so===s[0]?' on':'')+'" href="'+u('sort',s[0])+'">'+esc(s[1])+'</a>').join('')+'<span class="cnt">'+esc(t.recipes(list.length))+'</span>';
  const fbar='<div class="fbar"><div class="wrap fbin">'+chips+'</div></div>';
  const cv=coverOf(c);const cov=cv?'<img data-slot="cover:'+c.stem+'" src="'+cv+'" alt="">':'';
  if(d==='b')return '<section class="book wrap"><div class="spread"><div class="page left opener">'+crumbs+'<div class="bignum">'+num+'</div><h1>'+name+'</h1><div class="orn">❦</div><p class="dek">'+esc(t.recipes(c.n))+'</p>'+(cov?'<figure class="plate">'+cov+'</figure>':'')+'<span class="folio">'+num+'</span></div>'+
    '<div class="page right"><div class="runhead"><span>'+name+'</span><span>'+esc(t.contents)+'</span></div><div class="fbin pagef">'+chips+'</div>'+grid(list)+'</div></div></section>';
  if(d==='c')return '<section class="wrap chead"><div class="cnote">'+crumbs+'<h1>'+name+'</h1><p class="dek">'+esc(t.recipes(c.n))+'</p></div>'+(cov?'<figure class="polaroid tilt">'+cov+'<figcaption>'+num+'</figcaption></figure>':'')+'</section>'+fbar+'<section class="wrap">'+grid(list)+'</section>';
  if(d==='d')return '<section class="wrap dchap">'+(cov?'<span class="arch big">'+cov+'</span>':'')+'<div class="dribbon">'+crumbs+'<h1>'+name+'</h1><p class="dek">'+esc(t.recipes(c.n))+'</p></div></section>'+fbar+'<section class="wrap">'+grid(list)+'</section>';
  if(d==='g')return '<section class="wrap gchap"><div class="gt gimg">'+cov+'</div><div class="gt gtitle">'+crumbs+'<h1>'+name+'</h1></div><div class="gt gnum"><small>'+esc(t.chapter)+'</small><b>'+num+'</b></div><div class="gt gcount"><small>'+esc(t.results)+'</small><b>'+list.length+'</b></div><div class="gt gfil">'+chips+'</div></section><section class="wrap">'+grid(list)+'</section>';
  return '<section class="echap" data-slot="cover:'+c.stem+'" style="--hero-img:url(&quot;'+(cv?new URL(cv,location.href).href:'')+'&quot;)"><div class="eshade"></div><div class="wrap ehin">'+crumbs+'<div class="bignum">'+num+'</div><h1>'+name+'</h1><p class="dek">'+esc(t.recipes(c.n))+'</p></div></section>'+fbar+'<section class="wrap">'+grid(list)+'</section>';
}
function vSearch(params){
  const t=T(),d=S.design,q=params.get('q')||'',ch=params.get('ch')||'',ty=params.get('type')||'',co=params.get('co')||'',lv=params.get('lvl')||'',tm=+params.get('time')||0,h=params.get('h')==='1',af=params.get('af')==='1',ns=params.get('ns')==='1';
  const no=(params.get('no')||'').split(',').filter(Boolean);
  const words=norm(q).split(/\s+/).filter(Boolean);
  let list=S.idx.filter(r=>{
    if(words.length){const hay=norm(r.t.en+' '+r.t.sk+' '+chName(r.ch)+' '+S.chMap[r.ch].en+' '+S.chMap[r.ch].sk);if(!words.every(w=>hay.includes(w)))return false;}
    if(ch&&r.ch!==ch)return false;if(ty&&r.type!==ty)return false;if(co&&!r.co.includes(co))return false;if(lv&&r.lvl!==lv)return false;
    if(tm&&!(r.total&&r.total<=tm))return false;if(h&&!r.h)return false;if(af&&!r.af)return false;if(ns&&r.sp)return false;
    if(no.length&&(r.nal||no.some(a=>r.al.includes(a))))return false;return true;});
  const sel=(name,val,opts)=>'<label class="sel"><span>'+esc(name)+'</span><select data-f="'+opts.k+'"><option value="">'+esc(t.any)+'</option>'+opts.o.map(o=>'<option value="'+esc(o[0])+'"'+(o[0]===val?' selected':'')+'>'+esc(o[1])+'</option>').join('')+'</select></label>';
  const coUsed=new Set(S.idx.flatMap(r=>r.co));const cos=Object.entries(S.meta.countries).filter(([k])=>coUsed.has(k)).map(([k,v])=>[k,S.lang==='sk'?v[1]:v[0]]).sort((a,b)=>a[1].localeCompare(b[1],S.lang));
  const show=list.slice(0,+params.get('n')||60);
  const head='<div class="sh2"><h1>'+esc(t.search)+'</h1><span>'+list.length+' '+esc(t.results)+'</span></div>';
  const box='<form class="sbox" data-act="sq">'+ICON.search+'<input name="q" type="search" value="'+esc(q)+'" placeholder="'+esc(t.searchPh)+'"><button class="go">'+esc(t.go)+'</button></form>';
  const sels=sel(t.chapter,ch,{k:'ch',o:S.meta.chapters.map(c=>[c.stem,String(c.num).padStart(2,'0')+' '+(S.lang==='sk'?c.sk:c.en)])})+sel(t.dishType,ty,{k:'type',o:Object.entries(t.types)})+sel(t.country,co,{k:'co',o:cos})+
   sel(t.level,lv,{k:'lvl',o:[['Basic',t.levels.Basic],['Advanced',t.levels.Advanced]]})+sel(t.time,tm?String(tm):'',{k:'time',o:[15,30,45,60,90,120].map(m=>[String(m),t.upTo(m)])});
  const alc='<span class="fl">'+esc(t.without)+'</span><span class="cs">'+Object.entries(t.al).map(([k,v])=>'<button type="button" class="chip'+(no.includes(k)?' on':'')+'" data-act="noal" data-a="'+k+'">'+esc(v)+'</button>').join('')+'</span>';
  const togs='<span class="cs"><button type="button" class="chip'+(h?' on':'')+'" data-act="tog" data-k="h">'+esc(t.healthyOnly)+'</button><button type="button" class="chip'+(af?' on':'')+'" data-act="tog" data-k="af">'+esc(t.airfryer)+'</button><button type="button" class="chip'+(ns?' on':'')+'" data-act="tog" data-k="ns">'+esc(t.notSpicy)+'</button><a class="chip ghost" href="#/search">'+esc(t.reset)+'</a></span>';
  const res=(list.length?grid(show)+(list.length>show.length?'<div class="more"><a class="btn" href="#/search?'+(()=>{const p=new URLSearchParams(params);p.set('n',show.length+60);return p.toString();})()+'">+ '+(list.length-show.length)+'</a></div>':''):'<p class="empty">'+esc(t.noResults)+'</p>');
  if(d==='b')return '<section class="book wrap"><div class="spread"><div class="page left sidx"><div class="runhead"><span>'+esc(t.search)+'</span></div><h1 class="pageh">'+esc(t.search)+'</h1>'+box+'<div class="filters">'+sels+'<div class="frow">'+alc+'</div><div class="frow">'+togs+'</div></div></div><div class="page right"><div class="runhead"><span>'+list.length+' '+esc(t.results)+'</span></div>'+res+'</div></div></section>';
  if(d==='c')return '<section class="sec"><div class="wrap cs2"><div class="cres">'+head+res+'</div><aside class="cnote filters">'+box+sels+'<div class="frow">'+alc+'</div><div class="frow">'+togs+'</div></aside></div></section>';
  if(d==='d')return '<section class="sec"><div class="wrap"><div class="dsearch"><div class="dcat sm" style="--cat-img:url(&quot;'+new URL('img/cat-master-final.jpg',location.href).href+'&quot;)"></div><div class="dbubble">'+head+box+'</div></div><div class="filters"><div class="frow">'+sels+'</div><div class="frow">'+alc+'</div><div class="frow">'+togs+'</div></div>'+res+'</div></section>';
  if(d==='g')return '<section class="sec"><div class="wrap"><div class="gsearch"><div class="gt gq">'+head+box+'</div><div class="gt gsel">'+sels+'</div><div class="gt gal">'+alc+'</div><div class="gt gtog">'+togs+'</div></div>'+res+'</div></section>';
  return '<section class="esearch"><div class="wrap"><span class="kicker">'+esc(t.issue)+'</span><h1>'+esc(t.search)+'</h1>'+box+'</div></section><div class="fbar"><div class="wrap filters"><div class="frow">'+sels+'</div><div class="frow">'+alc+togs+'</div></div></div><section class="sec"><div class="wrap"><div class="sh2"><h2>'+list.length+' '+esc(t.results)+'</h2></div>'+res+'</div></section>';
}
function vHealthy(){const t=T();const list=S.idx.filter(r=>r.h);return '<section class="sec"><div class="wrap"><div class="sh2"><h1>'+esc(t.healthyH)+'</h1><span>'+esc(t.recipes(list.length))+'</span></div><p class="lead">'+esc(t.healthyP)+'</p>'+grid(list)+'</div></section>';}
function coName(c){const v=S.meta.countries[c];return v?(S.lang==='sk'?v[1]:v[0]):c;}
function coLine(o,link){const t=T();if(!o||!o.codes||!o.codes.length)return '';
  const nm=o.codes.map(c=>link?'<a href="#/countries/'+c+'">'+esc(coName(c))+'</a>':esc(coName(c))).join(' / ');
  const dis=o.note==='disputed'?' <span class="tsrc">· '+esc(t.coDisputed)+'</span>':'';
  if(o.basis==='source')return nm+' <span class="tag src">'+esc(t.coSource)+'</span>'+dis+' <span class="coq">'+(S.lang==='sk'?'„'+esc(o.quote)+'“ (EN)':'“'+esc(o.quote)+'”')+' — '+linkify(o.url)+'</span>';
  return nm+' <span class="tag own">'+esc(t.coOwn)+'</span>'+dis;}
function vCountries(code){const t=T();const cnt={},src={};S.idx.forEach(r=>r.co.forEach(c=>{cnt[c]=(cnt[c]||0)+1;if(r.cob==='s')src[c]=(src[c]||0)+1;}));
  const none=S.idx.filter(r=>!r.co.length).length,withS=S.idx.filter(r=>r.cob==='s').length,withO=S.idx.filter(r=>r.cob==='o').length;
  const G=S.meta.cgroups||{};const gOf=c=>(S.meta.cgroup||{})[c]||'';
  const groups=Object.keys(G).map(g=>[g,Object.keys(cnt).filter(c=>gOf(c)===g).sort((a,b)=>cnt[b]-cnt[a]||coName(a).localeCompare(coName(b),S.lang))]).filter(g=>g[1].length);
  let h='<section class="sec"><div class="wrap"><div class="sh2"><h1>'+esc(t.countriesH)+'</h1><span>'+esc(t.recipes(withS+withO))+'</span></div><p class="lead">'+esc(t.countriesP)+'</p>'+
   '<p class="nutnote"><span class="tag src">'+esc(t.coSource)+'</span> '+esc(t.coSourceP(withS))+' &nbsp; <span class="tag own">'+esc(t.coOwn)+'</span> '+esc(t.coOwnP(withO))+' &nbsp; '+esc(t.coNoneP(none))+'</p>'+
   groups.map(g=>'<div class="grp"><h3>'+esc(S.lang==='sk'?G[g[0]][1]:G[g[0]][0])+'</h3></div><div class="cobtns">'+g[1].map(c=>'<a class="cobtn'+(c===code?' on':'')+'" href="#/countries/'+c+'"><b>'+esc(coName(c))+'</b><span>'+esc(t.recipes(cnt[c]))+(src[c]?' · '+esc(t.coSourceN(src[c])):'')+'</span></a>').join('')+'</div>').join('');
  if(code&&cnt[code]){const list=S.idx.filter(r=>r.co.includes(code)).sort((a,b)=>(a.cob===b.cob?0:a.cob==='s'?-1:1)||L(a.t).localeCompare(L(b.t),S.lang));
    h+='<div class="sh2" id="co-list"><h2>'+esc(coName(code))+'</h2><span>'+esc(t.recipes(list.length))+'</span></div><div class="rgrid">'+list.map(r=>'<div class="favitem">'+card(r)+'<div class="frmeta"><span>'+(r.cob==='s'?'<span class="tag src">'+esc(t.coSource)+'</span>':'<span class="tag own">'+esc(t.coOwn)+'</span>')+(r.co.length>1?' '+esc(r.co.map(coName).join(' / ')):'')+'</span></div></div>').join('')+'</div>';}
  return h+'</div></section>';}
// meal sets: source pairings (quoted, linked) first, then my picks
const MEALS=['breakfast','lunch','dinner'];
function mealItems(st){return [st.items.find(i=>i.role==='main')].concat(st.items.filter(i=>i.role!=='main'&&i.basis==='source'),st.items.filter(i=>i.role!=='main'&&i.basis!=='source')).filter(Boolean);}
function vMeals(k,params){const t=T();const sets=S.meta.meals||[];const byId=id=>S.idx.find(x=>x.id===id);
  const st=k&&sets.find(x=>x.k===k);
  if(st){const items=mealItems(st);
    const srcN=items.filter(i=>i.basis==='source').length;
    return '<section class="sec"><div class="wrap"><div class="crumbs"><a href="#/meals">'+esc(t.mealsH)+'</a> · <a href="#/meals?m='+st.meal+'">'+esc(t.mealT[st.meal])+'</a></div><div class="sh2"><h1>'+esc(S.lang==='sk'?st.sk:st.en)+'</h1><span>'+esc(t.recipes(items.length))+'</span></div>'+
     '<p class="nutnote">'+(srcN?'<span class="tag src">'+esc(t.mealSrc)+'</span> '+esc(t.mealSrcP)+' &nbsp; ':'')+'<span class="tag own">'+esc(t.mealPick)+'</span> '+esc(t.mealPickP)+'</p>'+
     '<div class="rgrid mgrid">'+items.map(i=>{const r=byId(i.id);if(!r)return '';
       const of=byId(i.of||i.id);
       const why=i.role==='main'?'':i.basis==='source'?'<span class="tag src">'+esc(t.mealSrc)+'</span><span class="coq">'+esc(t.mealSrcOf)+' '+(of?'<a href="#/r/'+of.id+'">'+esc(L(of.t))+'</a>':'')+': '+(S.lang==='sk'?'„'+esc(i.quote)+'“ (EN)':'“'+esc(i.quote)+'”')+' — '+linkify(i.url)+'</span>':'<span class="tag own">'+esc(t.mealPick)+'</span>';
       return '<div class="favitem mitem"><span class="mrole">'+esc(t.mealRole[i.role]||i.role)+'</span>'+card(r)+(why?'<div class="frmeta">'+why+'</div>':'')+'</div>';}).join('')+'</div></div></section>';}
  const m=MEALS.includes(params.get('m'))?params.get('m'):'';
  const tile=x=>{const items=mealItems(x);const main=byId(items[0].id);const srcN=items.filter(i=>i.basis==='source').length;
    return '<a class="mset" data-slot="meal:'+x.k+'" href="#/meals/'+x.k+'"><span class="msimg">'+(()=>{const p=PK().meals[x.k];if(!p)return '';const pr=byId(p.id);return '<img loading="lazy" src="'+p.img+'" alt="">'+(p.own===false&&pr?'<span class="mspic">'+esc(T().pictured)+': '+esc(L(pr.t))+'</span>':'');})()+'</span><span class="msb"><span class="no">'+esc(t.mealT[x.meal])+'</span><b>'+esc(S.lang==='sk'?x.sk:x.en)+'</b><span class="msl">'+items.map(i=>{const r=byId(i.id);return r?esc(L(r.t)):'';}).filter(Boolean).join(' · ')+'</span>'+(srcN?'<span class="tag src">'+esc(t.mealSrcN(srcN))+'</span>':'<span class="tag own">'+esc(t.mealPick)+'</span>')+'</span></a>';};
  return '<section class="sec"><div class="wrap"><div class="sh2"><h1>'+esc(t.mealsH)+'</h1><span>'+sets.length+'</span></div><p class="lead">'+esc(t.mealsP)+'</p>'+
   '<div class="frow mfil"><span class="cs"><a class="chip'+(m?'':' on')+'" href="#/meals">'+esc(t.allMeals)+'</a>'+MEALS.map(x=>'<a class="chip'+(m===x?' on':'')+'" href="#/meals?m='+x+'">'+esc(t.mealT[x])+'</a>').join('')+'</span></div>'+
   MEALS.filter(x=>!m||x===m).map(x=>{const l=sets.filter(y=>y.meal===x);return l.length?'<div class="grp"><h3>'+esc(t.mealT[x])+'</h3></div><div class="msets">'+l.map(tile).join('')+'</div>':'';}).join('')+'</div></section>';}
// ---------------- seasonal (Slovakia) ----------------
// Produce months: official "Sezónny kalendár" (opotravinach.sk); holidays: zákon 241/1993 Z. z.; recipe matches: my picks.
let szP=null;
function loadSeason(){return szP||(szP=fetch('data/seasonal.json').then(r=>{if(!r.ok)throw new Error('seasonal '+r.status);return r.json();}).then(d=>(S.sz=d)));}
function easter(y){const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),da=((h+l-7*m+114)%31)+1;return new Date(y,mo-1,da);}
function holDate(h,y){if(h.d.startsWith('easter')){const e=easter(y);e.setDate(e.getDate()+parseInt(h.d.slice(6),10));return e;}const [m,d]=h.d.split('-').map(Number);return new Date(y,m-1,d);}
function szPicks(m){const Z=S.sz;const sc={};
  Z.produce.filter(p=>p.m.includes(m)&&p.m.length<=9).forEach(p=>{const w=1+(12-p.m.length)/12;p.title.forEach(id=>sc[id]=(sc[id]||0)+3*w);p.ing.forEach(id=>sc[id]=(sc[id]||0)+w);});
  return Object.keys(sc).map(id=>({r:S.idx.find(x=>x.id===id),s:sc[id]})).filter(o=>o.r).sort((a,b)=>b.s-a.s||a.r.id.localeCompare(b.r.id)).slice(0,12).map(o=>o.r);}
function vSeasonal(params){const t=T(),Z=S.sz;const now=new Date();const cm=now.getMonth()+1;const y=now.getFullYear();
  let m=parseInt(params.get('m'),10);if(!(m>=1&&m<=12))m=cm;
  const pk=params.get('p');const prod=pk&&Z.produce.find(p=>p.k===pk);
  const pn=p=>S.lang==='sk'?p.sk:p.en;
  const rom=['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
  const mon='<div class="frow szmon"><span class="cs">'+t.months.map((n,i)=>'<a class="chip'+(i+1===m?' on':'')+'" href="#/seasonal?m='+(i+1)+'">'+esc(n)+(i+1===cm?' <span class="sznow">· '+esc(t.szNow)+'</span>':'')+'</a>').join('')+'</span></div>';
  const months=p=>p.m.length===12?t.szAllYear:p.m.map(x=>rom[x-1]).join(' ');
  const pchips=g=>{const l=Z.produce.filter(p=>p.g===g&&p.m.includes(m)).sort((a,b)=>a.m.length-b.m.length||pn(a).localeCompare(pn(b),S.lang));
    return '<div class="szg"><h3>'+esc(g==='veg'?t.szVeg:t.szFruit)+' <span>'+l.length+'</span></h3><div class="chips">'+l.map(p=>{const n=p.title.length+p.ing.length;return '<a class="chip szc'+(prod&&prod.k===p.k?' on':'')+'" href="#/seasonal?m='+m+'&p='+encodeURIComponent(p.k)+'" title="'+esc(months(p))+'">'+esc(pn(p))+' <span class="szn">'+(n||'–')+'</span></a>';}).join('')+'</div></div>';};
  let body;
  if(prod){const l=[...prod.title,...prod.ing].map(id=>S.idx.find(x=>x.id===id)).filter(Boolean);
    body='<div class="sh2"><h2>'+esc(t.szWith)+': '+esc(pn(prod))+'</h2><span>'+esc(months(prod))+'</span></div><p class="nutnote"><span class="tag own">'+esc(t.mealPick)+'</span> '+esc(t.mealPickP)+' · <a href="#/seasonal?m='+m+'">← '+esc(t.szAll)+'</a></p>'+(l.length?'<div class="rgrid">'+l.map(card).join('')+'</div>':'<p class="empty">'+esc(t.szNone)+'</p>');}
  else{const l=szPicks(m);body='<div class="sh2"><h2>'+esc(t.szPicks)+'</h2><span>'+esc(t.months[m-1])+'</span></div><p class="nutnote"><span class="tag own">'+esc(t.mealPick)+'</span> '+esc(t.szPicksP)+'</p><div class="rgrid">'+l.map(card).join('')+'</div>';}
  const hy=m<cm?y+1:y;
  const hols=Z.holidays.map(h=>({h,d:holDate(h,hy)})).filter(o=>o.d.getMonth()+1===m).sort((a,b)=>a.d-b.d);
  const hol='<div class="sh2"><h2>'+esc(t.szHol)+'</h2><span>'+hy+'</span></div>'+(hols.length?'<div class="szhols">'+hols.map(({h,d})=>{const st=h.law.startsWith('§ 1');const off=h.off&&!(h.noOff||[]).includes(hy);
      const offT=off?t.szOff:(h.off?t.szNotOffY(hy):t.szNotOff);
      return '<div class="szhol"><div class="szdate"><b>'+d.getDate()+'.</b><span>'+esc(t.monthsGen[d.getMonth()])+'</span></div><div class="szhb"><span class="kicker">'+esc(st?t.szState:t.szRest)+' · '+esc(offT)+'</span><h3>'+esc(S.lang==='sk'?cap(h.sk):h.en)+'</h3>'+(S.lang==='en'?'<p class="szsk">'+esc(cap(h.sk))+'</p>':'')+'<p class="src">'+esc(h.law)+' · '+linkify(Z.src.law.url)+'</p>'+
       '<div class="szhp"><span class="tag own">'+esc(t.mealPick)+'</span> '+esc(t.szHolP)+'</div><div class="rgrid szrg">'+h.p.map(id=>S.idx.find(x=>x.id===id)).filter(Boolean).map(card).join('')+'</div></div></div>';}).join('')+'</div>':'<p class="empty">'+esc(t.szNoHol)+'</p>');
  const src='<div class="szsrc"><h3>'+esc(t.szSrc)+'</h3><ul>'+['veg','fruit','site','law'].map(k=>'<li>'+esc(S.lang==='sk'?Z.src[k].sk:Z.src[k].en)+' — '+linkify(Z.src[k].url)+'</li>').join('')+'</ul><p>'+esc(t.szSrcNote)+'</p></div>';
  return '<section class="sec"><div class="wrap"><div class="sh2"><h1>'+esc(t.seasonalH)+' · '+esc(t.months[m-1])+'</h1><span>'+(S.lang==='sk'?'Slovensko':'Slovakia')+'</span></div><p class="lead">'+esc(t.seasonalP)+'</p>'+mon+
   '<div class="sh2"><h2>'+esc(t.szIn)+'</h2><span>'+esc(t.months[m-1])+'</span></div><div class="szprod">'+pchips('veg')+pchips('fruit')+'</div>'+body+hol+src+'</div></section>';}
function vChefs(){const t=T();return '<section class="sec"><div class="wrap"><div class="sh2"><h1>'+esc(t.chefs)+'</h1></div><p class="lead">'+esc(t.chefsP)+'</p><div class="chefs">'+S.meta.chefs.map(c=>{const r=S.idx.find(x=>x.id===c.open);return '<div class="chef">'+(r&&r.img?'<a href="#/r/'+r.id+'"><img loading="lazy" src="'+r.img+'" alt=""></a>':'')+'<div class="chefb"><span class="kicker">'+esc(c.chef)+'</span><h3>'+esc(S.lang==='sk'?c.sk:c.en)+'</h3><p>'+esc(S.lang==='sk'?c.d_sk:c.d_en)+'</p>'+(c.url?'<p class="src">'+esc(t.source)+': '+linkify(c.url)+'</p>':'')+(r?'<a class="btn" href="#/r/'+r.id+'">'+esc(t.viewRecipe)+'</a>':'')+'</div></div>';}).join('')+'</div></div></section>';}
function vFav(){const t=T();
  const rows=(store)=>Object.entries(store).sort((a,b)=>(b[1].t||0)-(a[1].t||0)).map(([k,v])=>{const id=k.split('|')[0];const r=S.idx.find(x=>x.id===id);return r?{r,k,v}:null;}).filter(Boolean);
  const box=(list,cooked)=>list.length?'<div class="rgrid">'+list.map(o=>'<div class="favitem">'+card(o.r)+'<div class="favmeta">'+(o.v.fl?'<span class="tag">'+esc(t.flavor)+': '+esc(cap(S.lang==='sk'?o.v.fl.sk:o.v.fl.en))+'</span> ':'<span class="tag">'+esc(t.mainRecipe)+'</span> ')+(cooked?'<span class="tsrc">'+esc(t.cookedOn)+' '+fmtDate(o.v.t)+'</span>':'')+'</div></div>').join('')+'</div>':'<p class="empty">'+esc(cooked?t.noCooked:t.noFav)+'</p>';
  return '<section class="sec"><div class="wrap"><div class="sh2"><h1>'+esc(t.favorites)+'</h1><span>'+Object.keys(S.fav).length+'</span></div><p class="lead">'+esc(t.favP)+'</p>'+box(rows(S.fav),false)+
   '<div class="sh2"><h2>'+esc(t.cookedH)+'</h2><span>'+Object.keys(S.cooked).length+'</span></div>'+box(rows(S.cooked),true)+'</div></section>';}
// ---------------- cook mode ----------------
let wake=null;
async function wakeOn(){const t=T();const el=()=>document.querySelector('.wakest');
  if(!('wakeLock' in navigator)){if(el())el().textContent=t.wakeNo;return;}
  try{wake=await navigator.wakeLock.request('screen');if(el())el().textContent=t.wakeOn;wake.addEventListener('release',()=>{if(el()&&curCook)el().textContent=t.wakeOff;});}catch(e){if(el())el().textContent=t.wakeOff;}}
function wakeOff(){if(wake){wake.release().catch(()=>{});wake=null;}}
document.addEventListener('visibilitychange',()=>{if(curCook&&document.visibilityState==='visible')wakeOn();});
let curCook=null;
function cookSteps(r){const ver=S.ver;const en=S.lang==='en';
  const skNoOrig=ver==='orig'&&!en&&!(r.orig.ing.sk&&r.orig.method.sk);const showT=ver==='tami'||skNoOrig;
  let m=showT?L(r.tami.method).c:L(r.orig.method);if(!m||!m.length)m=L(r.orig.method)&&L(r.orig.method).length?L(r.orig.method):L(r.tami.method).c;
  const ing=showT?(L(r.tami.ing)||r.tami.ing.en):L(r.orig.ing);
  return {steps:(m||[]).map(n=>({t:n.t.replace(/^\d+\.\s/,''),c:n.c})),ing,showT};}
function vCook(r){const t=T();const {steps,ing,showT}=cookSteps(r);const n=steps.length;let i=Math.min(Math.max(0,S.cookStep||0),Math.max(0,n-1));S.cookStep=i;
  const base=r.serv||null;const want=S.serv[r.id]||base;const k=base?want/base:1;
  const st=steps[i]||{t:''};
  return '<section class="cook"><div class="cooktop wrap"><a class="btn sm ghostbtn" href="#/r/'+r.id+'">✕ '+esc(t.cookExit)+'</a><div class="cooktitle"><span class="kicker">'+esc(t.cook)+' · '+esc(showT?t.tamiV:t.origV)+(base?' · '+fmtServ(want)+' '+esc(t.servings.toLowerCase()):'')+'</span><h1>'+esc(L(r.t))+'</h1></div><span class="wakest">'+esc(t.wakeWait)+'</span></div>'+
   '<div class="cookbody wrap"><aside class="cookings"><h3>'+esc(t.ingredients)+'</h3>'+tree(ing,{scale:k,cls:'ing'})+'</aside>'+
   '<div class="cookstep"><div class="cprog"><i style="width:'+(n?((i+1)/n*100):0)+'%"></i></div><div class="cnum">'+esc(t.step)+' '+(i+1)+' / '+n+'</div><p class="ctext">'+linkify(st.t).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>')+'</p>'+(st.c?tree(st.c):'')+
   '<div class="cnav"><button class="btn cprev" data-act="cstep" data-d="-1"'+(i===0?' disabled':'')+'>← '+esc(t.prev)+'</button><span class="cdots">'+steps.map((x,j)=>'<button class="cdot'+(j===i?' on':'')+(j<i?' done':'')+'" data-act="cgo" data-i="'+j+'" aria-label="'+(j+1)+'"></button>').join('')+'</span>'+
   (i<n-1?'<button class="btn cnext" data-act="cstep" data-d="1">'+esc(t.next)+' →</button>':'<a class="btn cnext" href="#/r/'+r.id+'">'+esc(t.done)+' ✓</a>')+'</div><p class="ckeys">'+esc(t.keysHint)+'</p></div></div></section>';}
// ---------------- what can I make ----------------
let frP=null;S.have=(()=>{try{return JSON.parse(localStorage.getItem('tami.fridge')||'[]');}catch(e){return [];}})();
function loadFridge(){return frP||(frP=fetch('data/fridge.json').then(r=>{if(!r.ok)throw new Error('fridge '+r.status);return r.json();}).then(d=>(S.fr=d)));}
function vFridge(params){const t=T(),F=S.fr;const have=new Set(S.have);const name=k=>{const i=F.ings.find(x=>x.k===k);return i?(S.lang==='sk'?i.sk:i.en):k;};
  const chips=Object.keys(F.groups).map(g=>'<div class="frg"><h3>'+esc(S.lang==='sk'?F.groups[g][0]:F.groups[g][1])+'</h3><div class="chips">'+F.ings.filter(i=>i.g===g).map(i=>'<button class="chip'+(have.has(i.k)?' on':'')+'" data-act="have" data-k="'+i.k+'">'+(have.has(i.k)?'✓ ':'')+esc(S.lang==='sk'?i.sk:i.en)+'</button>').join('')+'</div></div>').join('');
  let res=[];
  if(have.size){for(const r of S.idx){const ks=F.r[r.id];if(!ks)continue;const h=ks.filter(k=>have.has(k));if(!h.length)continue;res.push({r,h,miss:ks.filter(k=>!have.has(k)),n:ks.length});}
    res.sort((a,b)=>(a.miss.length?1:0)-(b.miss.length?1:0)||a.miss.length-b.miss.length||b.h.length-a.h.length||L(a.r.t).localeCompare(L(b.r.t),S.lang));}
  const n=+params.get('n')||48;const show=res.slice(0,n);
  return '<section class="sec"><div class="wrap"><div class="sh2"><h1>'+esc(t.fridge)+'</h1><span>'+(have.size?res.length+' '+esc(t.results):'')+'</span></div><p class="lead">'+esc(t.fridgeP)+'</p>'+
   '<div class="frbox"><div class="frhead"><b>'+esc(t.fridgeHave)+' ('+have.size+')</b>'+(have.size?'<button class="chip ghost" data-act="haveclr">'+esc(t.reset)+'</button>':'')+'</div>'+chips+'<p class="nutnote">'+esc(t.fridgeStaples)+'</p></div>'+
   (have.size?(res.length?'<div class="rgrid">'+show.map(o=>'<div class="favitem">'+card(o.r)+'<div class="frmeta"><b>'+esc(t.fridgeScore(o.h.length,o.n))+'</b>'+(o.miss.length?'<span>'+esc(t.fridgeMiss)+': '+esc(o.miss.slice(0,6).map(name).join(', '))+(o.miss.length>6?'…':'')+'</span>':'<span class="ok">'+esc(t.fridgeAll)+'</span>')+'</div></div>').join('')+'</div>'+(res.length>n?'<div class="more"><a class="btn" href="#/fridge?n='+(n+48)+'">+ '+(res.length-n)+'</a></div>':''):'<p class="empty">'+esc(t.noResults)+'</p>'):'<p class="empty">'+esc(t.fridgeEmpty)+'</p>')+'</div></section>';}
function vSoon(k){const t=T();return '<section class="sec"><div class="wrap soonpage"><span class="kicker">'+esc(t.soon)+'</span><h1>'+esc(t[k]||'')+'</h1><p class="lead">'+esc(t.soonP)+'</p><a class="btn" href="#/">'+esc(t.home)+'</a></div></section>';}
function vNotFound(){return '<section class="sec"><div class="wrap"><p class="empty">'+esc(T().notFound)+'</p></div></section>';}

// ---------------- scaling ----------------
const FR={'¼':.25,'½':.5,'¾':.75,'⅓':1/3,'⅔':2/3,'⅛':.125,'⅜':.375,'⅝':.625,'⅞':.875};
const QN='(?:\\d+\\s?[¼½¾⅓⅔⅛⅜⅝⅞]|\\d+\\s+\\d+\\/\\d+|\\d+\\/\\d+|[¼½¾⅓⅔⅛⅜⅝⅞]|\\d+(?:[.,]\\d+)?)';
const QRX=new RegExp('(^|[\\s(\\[≈~])('+QN+')(\\s?[–-]\\s?('+QN+'))?(?=(\\s?)([^\\s\\d]*))','g');
function pq(s){s=s.trim();let m;if(m=s.match(/^(\d+)\s?([¼½¾⅓⅔⅛⅜⅝⅞])$/))return +m[1]+FR[m[2]];if(m=s.match(/^(\d+)\s+(\d+)\/(\d+)$/))return +m[1]+m[2]/m[3];if(m=s.match(/^(\d+)\/(\d+)$/))return m[1]/m[2];if(FR[s]!=null)return FR[s];return parseFloat(s.replace(',','.'));}
function fq(v,unit){
  const sk=S.lang==='sk';const u=(unit||'').toLowerCase();
  if(/^(g|ml|mg)\b/.test(u)){const r=v>=100?Math.round(v/5)*5:v>=10?Math.round(v):Math.round(v*10)/10;return sk?String(r).replace('.',','):String(r);}
  const q=Math.round(v*4)/4;if(q===0)return sk?String(Math.round(v*100)/100).replace('.',','):String(Math.round(v*100)/100);
  const w=Math.floor(q),f=q-w;const fs={0.25:'¼',0.5:'½',0.75:'¾'}[f]||'';return (w?String(w):'')+(w&&fs&&sk?' ':'')+fs||'0';
}
// per-piece amounts ("4 slices (28 g each)", "2 plechovky (po 795 g)", "225 g each") stay fixed; only the count scales
function perPiece(s){const R=[];let m;const re=/\([^()]*\)/g;
  while(m=re.exec(s))if(/\beach\b|(^|[\s(;])(asi |približne |cca )?po\s+\d|\bkažd/i.test(m[0]))R.push([m.index,m.index+m[0].length]);return R;}
function scaleText(s,k,lead){
  if(k===1)return s;let first=true;const PP=perPiece(s);
  return s.replace(QRX,(all,pre,a,rng,b,sp,unit,off)=>{
    const isLead=first&&off===0&&lead;first=false;
    const at=off+pre.length;
    if(!isLead&&(PP.some(([x,y])=>at>x&&at<y)||/(^|\s)po\s$/i.test(s.slice(Math.max(0,at-4),at))||/^\s?(g|ml|mg|kg)\s+each\b/i.test(s.slice(at+all.length-pre.length))))return all;
    const un=(unit||'').replace(/[),.;:]+$/,'');
    if(/^(cm|mm|°|%|min|h|hod|x|×|sec|s\b|sekúnd|minút|day|dní|hours?)/i.test(un))return all;
    const unitOk=/^(g|ml|mg|tsp|tbsp|pl|čl|kl|g\)|ml\))$/i.test(un)||/^(g|ml|tsp|tbsp|PL|ČL)\b/.test(un);
    if(!isLead&&!unitOk)return all;
    let out=fq(pq(a)*k,un);if(rng)out+=rng.replace(b,'')+fq(pq(b)*k,un);
    return pre+out;});
}

// ---------------- recipe ----------------
function tagLine(s){
  const t=T();let m,tag='';
  if(m=s.match(/^(.*?)\s+—\s+(own adjustment|vlastná úprava)\s*$/))return esc0(m[1])+' <span class="tag own">'+esc(t.own)+'</span>';
  if(m=s.match(/^(.*?)\s+—\s+(?:sourced|podľa zdroja)\s*\((.*)\)\s*$/))return esc0(m[1])+' <span class="tag src">'+esc(t.sourced)+'</span> <span class="tsrc">'+linkify(m[2])+'</span>';
  if(m=s.match(/^(.*?)\s+—\s*$/))return esc0(m[1])+' <span class="tag joe">'+esc(t.joeTag)+'</span>';
  if(m=s.match(/^(.*?)\s+—\s+(own adjustment|vlastná úprava);?\s*(.*)$/))return esc0(m[1])+' <span class="tag own">'+esc(t.own)+'</span> '+esc0(m[3]);
  if(m=s.match(/^(.*?)\s+—\s+(?:sourced|podľa zdroja)\s*\((.*?)\)(.*)$/))return esc0(m[1])+' <span class="tag src">'+esc(t.sourced)+'</span> <span class="tsrc">'+linkify(m[2])+'</span>'+esc0(m[3]);
  return esc0(s);
}
function esc0(s){return linkify(s);}
function tree(nodes,opt){
  opt=opt||{};if(!nodes||!nodes.length)return '';
  const ord=nodes.every(n=>/^\d+\.\s/.test(n.t));
  const li=n=>{let txt=n.t;if(ord)txt=txt.replace(/^\d+\.\s/,'');
    const mild=/^(Mild swap \(optional\)|Jemná verzia \(nepovinné\)):\s*/.exec(txt);
    let h;if(mild)h='<span class="tag mild">'+esc(T().mild)+'</span> '+(opt.tag?tagLine(txt.slice(mild[0].length)):linkify(txt.slice(mild[0].length)));
    else{if(opt.scale)txt=scaleText(txt,opt.scale,true);h=opt.tag?tagLine(txt):linkify(txt);}
    if(/^\*\*.*\*\*:?$/.test(n.t.replace(/^\d+\.\s/,'')))h='<b>'+esc(txt.replace(/\*\*/g,''))+'</b>';
    h=h.replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');
    const sub=n.c?tree(n.c,opt):'';
    return '<li'+(n.en?' class="enln"':'')+'>'+(n.en?'<span class="entag">EN</span> ':'')+(ord?'<span class="n">'+n.t.match(/^\d+/)[0]+'</span><p>'+h+'</p>':h)+sub+'</li>';};
  return ord?'<ol class="steps">'+nodes.map(li).join('')+'</ol>':'<ul class="'+(opt.cls||'lst')+'">'+nodes.map(li).join('')+'</ul>';
}
function fieldBlock(f,cls){if(!f||(!f.v&&!(f.c&&f.c.length)))return '';return '<div class="'+(cls||'fb')+'">'+(f.v?'<p>'+linkify(f.v)+'</p>':'')+tree(f.c)+'</div>';}
function labelClean(k){return k.replace(/\s*\((?:sourced|podľa zdroja)[^)]*\)?.*$/,'').replace(/\s*\(site-plan[^)]*\)/,'').trim();}
function rParts(r){
  const t=T(),en=S.lang==='en';
  const base=r.serv||null;const want=S.serv[r.id]||base;const k=base?want/base:1;
  const ver=S.ver;
  const skNoOrig=ver==='orig'&&!en&&!(r.orig.ing.sk&&r.orig.method.sk);
  const showT=ver==='tami'||skNoOrig;
  const ingN=showT?(L(r.tami.ing)||r.tami.ing.en):L(r.orig.ing);
  let methN=showT?L(r.tami.method).c:L(r.orig.method);
  if(!methN||!methN.length)methN=L(r.orig.method)&&L(r.orig.method).length?L(r.orig.method):L(r.tami.method).c;
  const P={r,k,showT,methN};
  P.origNote=skNoOrig?'<div class="orignote"><p>'+esc(t.skNoOrig)+'</p><button class="btn sm" data-act="lang" data-l="en">'+esc(t.showEn)+'</button></div>':'';
  P.tmv=showT&&r.tami.method[S.lang].v&&!/^(with|s Tamin)/i.test(r.tami.method[S.lang].v)?'<p class="mnote">'+linkify(r.tami.method[S.lang].v)+'</p>':'';
  const chg=L(r.tami.chg);
  const mext=L(r.mext)||[];const text=L(r.tami.ext)||[];
  const getK=(arr,re)=>arr.find(f=>re.test(f.k));
  const spicy=getK(mext,/^(Spicy|Pálivé)$/),spn=getK(mext,/^(Spicy note|Upozornenie)$/),lac=getK(mext,/^(Lactose|Laktóza)$/),lacn=getK(mext,/^(Lactose note|Poznámka k laktóze)$/);
  const otherM=mext.filter(f=>![spicy,spn,lac,lacn].includes(f)&&!/^(Recept)$/.test(f.k));
  const cafF=r.caf&&L(r.caf);
  const extra=text.filter(f=>!/^(Caffeine note|Kofeín)/.test(f.k));
  const sug=r.sugar;
  P.crumbs='<div class="crumbs"><a href="#/chapters">'+esc(T().chapters)+'</a> / <a href="#/c/'+r.ch+'">'+esc(chName(r.ch))+'</a> · <a href="#/c/'+r.ch+'?lvl='+encodeURIComponent(r.lvl)+'">'+esc(lvlName(r.lvl))+'</a></div>';
  P.h1='<h1>'+esc(L(r.t))+(en?'':'<i>'+esc(r.t.en)+'</i>')+'</h1>';
  P.src='<div class="src">'+esc(t.source)+': '+esc(r.src||'')+(r.urls.length?' · '+r.urls.map(u=>linkify(u)).join(' · '):'')+'</div>';
  if(r.origin&&r.origin.codes&&r.origin.codes.length)P.src+='<div class="origin"><b>'+esc(t.origin)+':</b> '+coLine(r.origin,true)+'</div>';
  P.stats='<div class="stats">'+timeStats(L(r.time))+'</div>';
  P.badges='<div class="badges">'+(r.spicy?'<span class="bdg sp">🌶 '+esc(t.spicy)+'</span>':'')+(lac?'<span class="bdg lac">'+esc(t.lowLac)+'</span>':'')+(r.healthy&&r.healthy.ok?'<span class="bdg h">'+esc(t.healthyBadge)+'</span>':'')+(r.af?'<span class="bdg">'+esc(t.af)+'</span>':'')+(r.caf?'<span class="bdg">'+esc(t.caf)+'</span>':'')+(r.mild?'<span class="bdg">'+esc(t.mild)+'</span>':'')+'</div>';
  P.scaler=base?'<div class="scaler"><span class="sl">'+esc(t.servings)+'</span><button class="sb" data-act="serv" data-d="-1" aria-label="−">−</button><span class="sn">'+fmtServ(want)+'</span><button class="sb" data-act="serv" data-d="1" aria-label="+">+</button><span class="so">'+esc(t.origServ)+': '+esc(L(r.servT)||'')+'</span></div>':'<div class="scaler"><span class="sl">'+esc(t.servings)+'</span><span class="so">'+esc(L(r.servT)||'')+'</span></div>';
  P.vtog='<div class="vtoggle"><button data-act="ver" data-v="tami" class="'+(ver==='tami'?'on':'')+'">'+esc(t.tamiV)+'</button><button data-act="ver" data-v="orig" class="'+(ver==='orig'?'on':'')+'">'+esc(t.origV)+'</button></div>';
  P.marks=markBtns(r.id);P.cook='<a class="btn cookbtn" href="#/cook/'+r.id+'">▶ '+esc(t.cook)+'</a>'+(window.TamiShop?TamiShop.btn(r.id):'');
  P.ctrls='<div class="ctrls">'+P.scaler+P.vtog+'</div><div class="ctrls">'+P.marks+P.cook+'</div>';
  P.img=r.img?'<img class="rimg-main" src="'+r.img+'" alt="'+esc(L(r.t))+'">':'';
  P.imgUrl=r.img?new URL(r.img,location.href).href:'';
  P.warns=(spicy||lac)?'<section class="wrap warns">'+(spicy?'<div class="warn sp"><b>🌶 '+esc(spicy.k)+': '+esc(spicy.v)+'</b>'+(spn?'<p>'+linkify(spn.v)+'</p>':'')+'</div>':'')+(lac?'<div class="warn lac"><b>'+esc(lac.k)+': '+esc(lac.v)+'</b>'+(lacn?'<p>'+linkify(lacn.v)+'</p>':'')+'</div>':'')+'</section>':'';
  const nut=L(r.nut);
  P.allerg='<span class="alh">'+esc(t.allergens)+'</span><div class="algrid">'+Object.entries(t.al).map(([a,v])=>'<span class="al'+(r.al.includes(a)?' on':'')+'">'+esc(v)+'</span>').join('')+'</div>';
  P.ingTitle=esc(t.ingredients);
  P.ing=P.origNote+'<p class="unit">'+esc(showT?t.tamiV:t.origV)+(k!==1?' · '+esc(t.scaled):'')+'</p>'+tree(ingN,{scale:k,cls:'ing'});
  P.chg=chg&&chg.length?'<div class="chgbox"><h4>'+esc(t.changes)+'</h4>'+tree(chg,{tag:true})+'</div>':'';
  P.methTitle=esc(t.method);
  P.steps=tree(methN);
  P.extra=extra.length&&showT?'<div class="extra"><h3 class="h4s">'+esc(t.moreTami)+'</h3>'+extra.map(f=>'<div class="xf"><h4>'+linkify(labelClean(f.k))+'</h4>'+(f.k!==labelClean(f.k)?'<p class="tsrc">'+linkify(f.k.slice(labelClean(f.k).length).replace(/^\s*\(|\)$/g,''))+'</p>':'')+(f.v?'<p>'+linkify(f.v)+'</p>':'')+tree(f.c,{tag:true})+'</div>').join('')+'</div>':'';
  P.cat=catCard(r);
  P.info=(cafF||sug)?'<div class="infobox"><h4>'+(cafF?esc(t.caffeine)+(sug?' · ':''):'')+(sug?esc(t.sugarShort):'')+'</h4>'+(cafF?'<div class="caf"><b>'+esc(t.caffeine)+'</b>'+(cafF.v?'<p>'+linkify(cafF.v)+'</p>':'')+tree(cafF.c)+'</div>':'')+sugarBox(sug)+'</div>':'';
  P.misc=(L(r.equip)?'<h4>'+esc(t.equipment)+'</h4>'+fieldBlock(L(r.equip),'s'):'')+(L(r.store)?'<h4>'+esc(t.storage)+'</h4>'+fieldBlock(L(r.store),'s'):'')+otherM.map(f=>'<h4>'+esc(f.k)+'</h4>'+fieldBlock(f,'s')).join('');
  P.flv=r.flavors.length?'<section class="wrap flv"><h2>'+esc(t.flavors)+'</h2><div class="flgrid">'+r.flavors.map(f=>'<div class="fcard">'+(f.img?'<img loading="lazy" src="'+f.img+'" alt="'+esc(L(f))+'">':'')+'<div class="fb2"><h3>'+esc(cap(L(f)))+'</h3>'+markBtns(r.id,f)+(f.tip?'<div class="cat mini">'+(f.cat?'<img loading="lazy" src="'+f.cat+'" alt="'+esc(t.catAlt)+'">':'')+'<div><span class="pl">'+ICON.cat+esc(t.catTip[f.tip.type]||t.catTip.tip)+'</span><p>'+esc(L(f.tip))+'</p>'+(f.tip.url?'<span class="tsrc">'+linkify(f.tip.url)+'</span>':'')+'</div></div>':'')+'</div></div>').join('')+'</div></section>':'';
  P.nutTitle='<h2>'+esc(t.nutrition)+' <small>('+esc(t.tamiV)+')</small></h2>';
  P.nutT=nutTable(nut);
  P.nutX=(nut&&nut.vit?'<h3 class="h4s">'+esc(t.vit)+'</h3><div class="vit">'+nut.vit.split(';').map(s=>'<span>'+esc(s.trim())+'</span>').join('')+'</div>':'')+
   (r.healthy&&r.healthy.claims.length?'<h3 class="h4s">'+esc(t.claims)+'</h3><ul class="lst claims">'+r.healthy.claims.map(c=>'<li><b>'+esc(L({en:c.en,sk:c.sk}))+'</b> — '+esc(en?c.d_en:c.d_sk)+'</li>').join('')+'</ul>':'')+
   '<p class="nutnote">'+esc(t.nutEstimate)+(nut&&nut.notes?' '+esc(nut.notes):'')+'</p>';
  P.nut='<section class="wrap rnut"><div>'+P.nutTitle+P.nutT+'</div><div>'+P.nutX+'</div></section>';
  P.notes=L(r.notes)?'<section class="wrap notes"><h2>'+esc(t.notesSrc)+'</h2>'+fieldBlock(L(r.notes))+'</section>':'';
  return P;
}
function vRecipe(r){const P=rParts(r);return ({b:recB,c:recC,d:recD,g:recG}[S.design]||recE)(P,r);}
function recE(P,r){
  return '<section class="ehero rh" style="--hero-img:url(&quot;'+P.imgUrl+'&quot;)"><div class="eshade"></div><div class="wrap ehin">'+P.crumbs+P.h1+P.src+'</div></section>'+
   '<section class="wrap estrip">'+P.stats+P.badges+'</section><section class="wrap ectl">'+P.ctrls+'</section>'+P.warns+
   '<section class="wrap alstrip">'+P.allerg+'</section>'+
   '<section class="wrap ebody"><aside class="eing"><h2>'+P.ingTitle+'</h2>'+P.ing+P.chg+'</aside><div class="emeth"><h2>'+P.methTitle+'</h2>'+P.tmv+P.steps+P.extra+'</div></section>'+
   '<section class="wrap eside">'+P.cat+P.info+(P.misc?'<div class="emisc">'+P.misc+'</div>':'')+'</section>'+P.flv+P.nut+P.notes;
}
function recB(P,r){const t=T();
  return '<section class="book wrap"><div class="spread rec"><div class="page left"><div class="runhead"><span>'+esc(chName(r.ch))+'</span><span>'+esc(lvlName(r.lvl))+'</span></div>'+
   (P.img?'<figure class="plate">'+P.img+'</figure>':'')+P.crumbs+P.h1+'<div class="orn">❦</div>'+P.src+P.stats+P.badges+P.ctrls+
   '<h2 class="pageh">'+P.ingTitle+'</h2>'+P.ing+P.chg+'<span class="folio">'+esc(t.page)+' 1</span></div>'+
   '<div class="page right"><div class="runhead"><span>'+esc(L(r.t))+'</span><span>'+esc(t.brand1)+' '+esc(t.brand2)+'</span></div>'+P.warns+
   '<h2 class="pageh">'+P.methTitle+'</h2>'+P.tmv+P.steps+'<div class="margin">'+P.cat+P.info+'</div>'+P.extra+P.misc+
   '<div class="alstrip">'+P.allerg+'</div><span class="folio">'+esc(t.page)+' 2</span></div></div></section>'+P.flv+P.nut+P.notes;
}
function recC(P,r){
  return '<section class="wrap crh"><figure class="polaroid big tilt">'+(P.img||'<span class="noimg"></span>')+'<figcaption>'+esc(L(r.t))+'</figcaption></figure><div class="cnote">'+P.crumbs+P.h1+P.src+P.stats+P.badges+P.ctrls+'</div>'+(P.cat?'<div class="cnote pink catn">'+P.cat+'</div>':'')+'</section>'+P.warns+
   '<section class="wrap cboard"><div class="notepad"><h2>'+P.ingTitle+'</h2>'+P.ing+P.chg+'</div><div class="ccards"><h2>'+P.methTitle+'</h2>'+P.tmv+P.steps+P.extra+'</div></section>'+
   '<section class="wrap cboard2"><div class="cnote stick alst">'+P.allerg+'</div>'+(P.info?'<div class="cnote blue">'+P.info+'</div>':'')+(P.misc?'<div class="icard">'+P.misc+'</div>':'')+'</section>'+P.flv+P.nut+P.notes;
}
function recD(P,r){const t=T();
  const steps=(P.methN||[]).map(n=>({t:n.t.replace(/^\d+\.\s/,''),c:n.c}));const n=steps.length;
  S.dStep=S.dStep||{};let i=Math.min(Math.max(0,S.dStep[r.id]||0),Math.max(0,n-1));const all=S.dAll;
  const st=steps[i]||{t:''};
  const pager=all?P.steps:'<div class="dpage"><div class="dpn">'+(i+1)+'</div><p class="dpt">'+linkify(st.t).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>')+'</p>'+(st.c?tree(st.c):'')+
   '<div class="dpnav"><button class="btn" data-act="dpg" data-d="-1"'+(i===0?' disabled':'')+'>← '+esc(t.prev)+'</button><span class="cdots">'+steps.map((x,j)=>'<button class="cdot'+(j===i?' on':'')+(j<i?' done':'')+'" data-act="dgo" data-i="'+j+'" aria-label="'+(j+1)+'"></button>').join('')+'</span><button class="btn" data-act="dpg" data-d="1"'+(i>=n-1?' disabled':'')+'>'+esc(t.next)+' →</button></div><div class="dpcount">'+esc(t.step)+' '+(i+1)+' / '+n+'</div></div>';
  const c=r.cat;
  const narr=c?'<section class="wrap dnarr"><span class="dava"><img src="'+c.img+'" alt="'+esc(t.catAlt)+'"></span><div class="dbubble"><span class="pl">'+ICON.cat+esc(t.catTip[c.type]||t.catTip.tip)+'</span><p>'+esc(L(c))+'</p>'+(c.url?'<span class="tsrc">'+esc(t.source)+': '+linkify(c.url)+'</span>':'')+'</div></section>':'';
  return '<section class="wrap drh"><span class="arch big">'+(P.img||'')+'</span><div class="dribbon">'+P.crumbs+P.h1+'</div>'+P.src+P.stats+P.badges+P.ctrls+'</section>'+narr+P.warns+
   '<section class="wrap dneed"><h2>'+esc(t.needH)+'</h2>'+P.ing+P.chg+'</section>'+
   '<section class="wrap dsteps"><div class="dsh"><h2>'+P.methTitle+'</h2><button class="chip'+(all?' on':'')+'" data-act="dall">'+esc(all?t.pagesView:t.allSteps)+'</button></div>'+P.tmv+pager+P.extra+'</section>'+
   '<section class="wrap dmore">'+P.info+(P.misc?'<div class="dcard">'+P.misc+'</div>':'')+'<div class="dcard alstrip">'+P.allerg+'</div></section>'+P.flv+P.nut+P.notes;
}
function recG(P,r){
  return P.warns+'<section class="wrap grec"><div class="gt gimg">'+P.img+'</div><div class="gt gtitle">'+P.crumbs+P.h1+P.src+P.badges+'</div>'+
   '<div class="gt gstats">'+P.stats+'</div><div class="gt gscale">'+P.scaler+P.vtog+'</div><div class="gt gmarks">'+P.marks+P.cook+'</div>'+
   '<div class="gt ging"><h2>'+P.ingTitle+'</h2>'+P.ing+P.chg+'</div><div class="gt gmeth"><h2>'+P.methTitle+'</h2>'+P.tmv+P.steps+P.extra+'</div>'+
   (P.cat?'<div class="gt gcatt">'+P.cat+'</div>':'')+(P.info?'<div class="gt ginfo">'+P.info+'</div>':'')+'<div class="gt galg">'+P.allerg+'</div>'+(P.misc?'<div class="gt gmisc">'+P.misc+'</div>':'')+
   '<div class="gt gnut">'+P.nutTitle+P.nutT+'</div><div class="gt gnutx">'+P.nutX+'</div></section>'+P.flv+P.notes;
}
function fmtServ(n){return S.lang==='sk'?String(n).replace('.',','):String(n);}
function timeStats(s){if(!s)return '';return s.split('|').map((p,j)=>{if(j===0&&p.indexOf(':')<0)p=T().prep+': '+p;const i=p.indexOf(':');return '<div><small>'+esc(p.slice(0,i).trim())+'</small><b>'+esc(p.slice(i+1).trim())+'</b></div>';}).join('');}
function catCard(r){const t=T(),c=r.cat;if(!c)return '';return '<div class="cat"><img src="'+c.img+'" alt="'+esc(t.catAlt)+'"><div><span class="pl">'+ICON.cat+esc(t.catTip[c.type]||t.catTip.tip)+'</span><p>'+esc(L(c))+'</p>'+(c.url?'<span class="tsrc">'+esc(t.source)+': '+linkify(c.url)+'</span>':'')+'</div></div>';}
function sugarBox(s){const t=T();if(!s)return '';const p=s.p50;const bar=(typeof p==='number')?'<div class="bar"><i style="width:'+Math.min(100,p)+'%"></i></div>':'';
  const lab=S.lang==='sk'?(s.lab_sk||t.sugarShort):(s.lab_en||t.sugarShort);
  if(s.g==null)return '<div class="sug"><b>'+esc(t.sugar)+'</b><p>'+linkify(L(s))+'</p></div>';
  return '<div class="sug"><b>'+esc(t.sugar)+'</b><p class="big">'+esc(lab)+': '+fmtNum(s.g)+' g '+esc(t.perServing)+'</p>'+bar+'<p>'+fmtNum(p)+' % '+esc(t.ofMax)+' · '+fmtNum(s.p25)+' % '+esc(t.ofIdeal)+'</p><p class="tsrc">'+linkify(L(S.meta.sugar)||'')+' '+(S.meta.sugar.url?linkify(S.meta.sugar.url):'')+'</p></div>';}
function fmtNum(v){if(v==null)return '';const r=Math.round(v*10)/10;return S.lang==='sk'?String(r).replace('.',','):String(r);}
function nutTable(n){const t=T();if(!n||!n.rows||n.rows.length<2)return '<p class="nutnote">'+esc(t.noNut)+'</p>';
  const hd=n.rows[0];return '<table class="nut"><thead><tr>'+hd.map(c=>'<th>'+esc(c)+'</th>').join('')+'</tr></thead><tbody>'+n.rows.slice(1).map(r=>'<tr>'+r.map(c=>'<td>'+esc(c)+'</td>').join('')+'</tr>').join('')+'</tbody></table>'+(n.status&&!/^OK/.test(n.status)?'<p class="nutnote">'+esc(t.nutPartial)+'</p>':'');}

// ---------------- router ----------------
// Every navigation gets a number; a slower, older navigation (e.g. still waiting for a chapter file) never paints over a newer one.
// The open page is kept as a synchronous render function, so a theme / language / serving change repaints it instantly
// from memory (on every page, not only home) instead of re-running the async router.
let curRecipe=null,navSeq=0;S.cur=null;
async function route(){
  const my=++navSeq;
  const h=location.hash.replace(/^#/,'')||'/';const [path,qs]=h.split('?');const params=new URLSearchParams(qs||'');const parts=path.split('/').filter(Boolean);
  try{
    await loadIndex();if(my!==navSeq)return false;
    let name=parts[0]||'home',chrome=name,render,rec=null,cook=null;
    if(name==='home')render=vHome;
    else if(name==='chapters')render=()=>vChapters(params);
    else if(name==='c'){render=()=>vChapter(parts[1],params);chrome='chapters';}
    else if(name==='search')render=()=>vSearch(params);
    else if(name==='healthy')render=vHealthy;
    else if(name==='countries')render=()=>vCountries(parts[1]||'');
    else if(name==='meals')render=()=>vMeals(parts[1]||'',params);
    else if(name==='seasonal'){await loadSeason();if(my!==navSeq)return false;render=()=>vSeasonal(params);}
    else if(name==='chefs')render=vChefs;
    else if(name==='soon')render=()=>vSoon(parts[1]);
    else if(name==='favorites')render=vFav;
    else if(name==='about'&&window.TamiAbout){await TamiAbout.load();if(my!==navSeq)return false;render=TamiAbout.view;}
    else if(name==='shop'&&window.TamiShop){await TamiShop.load();if(my!==navSeq)return false;render=TamiShop.view;}
    else if(name==='fridge'){await loadFridge();if(my!==navSeq)return false;render=()=>vFridge(params);}
    else if(name==='cook'||name==='r'){const id=parts.slice(1).join('/');const d=await loadCh(parts[1]);if(my!==navSeq)return false;const r=d.find(x=>x.id===id);chrome='chapters';
      if(!r)render=vNotFound;else if(name==='cook'){cook=r;render=()=>vCook(r);}else{rec=r;render=()=>vRecipe(r);}}
    else render=vNotFound;
    if(cook){if(!curCook||curCook.id!==cook.id)S.cookStep=0;}else{curCook=null;wakeOff();}
    curCook=cook;curRecipe=rec;S.cur={chrome,render};paint();return true;
  }catch(e){if(my!==navSeq)return false;console.error(e);S.cur=null;$('#view').innerHTML='<section class="sec"><div class="wrap"><p class="empty">'+esc(String(e.message||e))+'</p></div></section>';return true;}
}
function paint(){if(!S.cur)return;renderChrome(S.cur.chrome);$('#view').innerHTML=S.cur.render();document.body.classList.toggle('cooking',!!curCook);
  if(curCook){if(wake){const w=$('.wakest');if(w)w.textContent=T().wakeOn;}else wakeOn();}}
function rerender(keepScroll){const y=window.scrollY;if(S.cur)paint();else route();if(keepScroll)window.scrollTo(0,y);}
window.addEventListener('hashchange',()=>{route().then(ok=>{if(ok)window.scrollTo(0,0);});});
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act;
  if(a==='lang'){S.lang=b.dataset.l;try{localStorage.setItem('tami.lang',S.lang);}catch(x){}rerender(true);if(!$('#palpanel').hidden)renderPal();}
  else if(a==='pal'){togglePal($('#palpanel').hidden);}
  else if(a==='palclose'){togglePal(false);}
  else if(a==='theme'){applyTheme(b.dataset.d,b.dataset.p);}
  else if(a==='serv'&&curRecipe){const base=curRecipe.serv;let n=S.serv[curRecipe.id]||base;const step=base>=8?Math.max(1,Math.round(base/4)):1;n=Math.max(1,n+(+b.dataset.d)*step);S.serv[curRecipe.id]=n;rerender(true);}
  else if(a==='fav'||a==='cooked'){const store=a==='fav'?S.fav:S.cooked;const k=b.dataset.k;
    if(store[k])delete store[k];else store[k]={t:Date.now(),fl:b.dataset.fen?{en:b.dataset.fen,sk:b.dataset.fsk}:null};
    lsSet(a==='fav'?'tami.fav':'tami.cooked',store);const was=!!store[k];rerender(true);
    if(was){const sel='[data-act="'+a+'"][data-k="'+(window.CSS&&CSS.escape?CSS.escape(k):k)+'"]';const el=document.querySelector(sel);if(el){el.classList.add('pop');}}}
  else if(a==='cstep'&&curCook){S.cookStep=(S.cookStep||0)+(+b.dataset.d);rerender(false);}
  else if(a==='cgo'&&curCook){S.cookStep=+b.dataset.i;rerender(false);}
  else if(a==='have'){const k=b.dataset.k;S.have=S.have.includes(k)?S.have.filter(x=>x!==k):S.have.concat(k);try{localStorage.setItem('tami.fridge',JSON.stringify(S.have));}catch(x){}rerender(true);}
  else if(a==='haveclr'){S.have=[];try{localStorage.setItem('tami.fridge','[]');}catch(x){}rerender(true);}
  else if(a==='ver'){S.ver=b.dataset.v;rerender(true);}
  else if(a==='dpg'&&curRecipe){S.dStep=S.dStep||{};S.dStep[curRecipe.id]=(S.dStep[curRecipe.id]||0)+(+b.dataset.d);rerender(true);}
  else if(a==='dgo'&&curRecipe){S.dStep=S.dStep||{};S.dStep[curRecipe.id]=+b.dataset.i;rerender(true);}
  else if(a==='dall'){S.dAll=!S.dAll;rerender(true);}
  else if(a==='noal'||a==='tog'){const h=location.hash.replace(/^#/,'');const [p,qs]=h.split('?');const ps=new URLSearchParams(qs||'');ps.delete('n');
    if(a==='noal'){let no=(ps.get('no')||'').split(',').filter(Boolean);const k=b.dataset.a;no=no.includes(k)?no.filter(x=>x!==k):no.concat(k);no.length?ps.set('no',no.join(',')):ps.delete('no');}
    else{const k=b.dataset.k;ps.get(k)==='1'?ps.delete(k):ps.set(k,'1');}
    location.hash='#/search?'+ps.toString();}
});
document.addEventListener('click',e=>{const p=$('#palpanel');if(!p.hidden&&e.target===p)togglePal(false);});
document.addEventListener('keydown',e=>{if(e.key==='Escape')togglePal(false);
  if(curCook&&!/INPUT|SELECT|TEXTAREA/.test((e.target.tagName||''))){const n=cookSteps(curCook).steps.length;if((e.key==='ArrowRight'||e.key===' ')&&S.cookStep<n-1){e.preventDefault();S.cookStep++;rerender(false);}else if(e.key==='ArrowLeft'&&S.cookStep>0){S.cookStep--;rerender(false);}}});
document.addEventListener('submit',e=>{const f=e.target.closest('[data-act]');if(!f)return;e.preventDefault();const q=f.querySelector('input[name=q]').value.trim();
  const h=location.hash.replace(/^#/,'');const [p,qs]=h.split('?');const ps=new URLSearchParams(f.dataset.act==='sq'?(qs||''):'');q?ps.set('q',q):ps.delete('q');ps.delete('n');location.hash='#/search?'+ps.toString();});
document.addEventListener('change',e=>{const s=e.target.closest('select[data-f]');if(!s)return;const h=location.hash.replace(/^#/,'');const [p,qs]=h.split('?');const ps=new URLSearchParams(qs||'');ps.delete('n');s.value?ps.set(s.dataset.f,s.value):ps.delete(s.dataset.f);location.hash='#/search?'+ps.toString();});
applyTheme(S.design,S.pal);
window.TamiShop&&TamiShop.init({S,rerender});window.TamiAbout&&TamiAbout.init({S,rerender});
route();
})();
