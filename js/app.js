(function(){
'use strict';
const $=s=>document.querySelector(s);
const S={lang:'sk',design:'a',pal:'',idx:null,meta:null,ch:{},serv:{},ver:'tami'};
try{S.lang=localStorage.getItem('tami.lang')||'sk';S.design=localStorage.getItem('tami.design')||'a';S.pal=localStorage.getItem('tami.pal')||'';}catch(e){}
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
function applyTheme(design,pal){
  const D=DESIGNS.find(d=>d.k===design)||DESIGNS[0];
  const P=D.pals.find(p=>p[0]===pal)||D.pals[0];
  S.design=D.k;S.pal=P[0];
  const r=document.documentElement;r.dataset.design=D.k;r.dataset.pal=P[0];
  for(const k in P[2])r.style.setProperty('--'+k,P[2][k]);
  ['side','sideText','sideMuted','sideLine','pop','popText','tile1','tile2','tile2Text','shadow','hl'].forEach(k=>{if(!(k in P[2]))r.style.removeProperty('--'+k);});
  r.style.setProperty('--fh',D.fonts[0]);r.style.setProperty('--fb',D.fonts[1]);
  try{localStorage.setItem('tami.design',D.k);localStorage.setItem('tami.pal',P[0]);}catch(e){}
  if(!$('#palpanel').hidden)renderPal();
  if(S.idx&&!curRecipe&&(location.hash.replace(/^#\/?/,'')===''))rerender(true);
}
function renderPal(){
  const t=T();
  $('#palpanel').innerHTML='<div class="palbox" role="dialog" aria-label="'+esc(t.themeH)+'"><div class="palhead"><div><h3>'+esc(t.themeH)+'</h3><p>'+esc(t.themeP)+'</p></div><button class="palx" data-act="palclose" aria-label="'+esc(t.close)+'">×</button></div><div class="palgrid">'+
  DESIGNS.map(D=>{const cur=D.pals.find(p=>p[0]===S.pal&&D.k===S.design)||D.pals[0];const c=cur[2];
    return '<div class="pald'+(D.k===S.design?' on':'')+'"><button class="prev prev-'+D.k+'" data-act="theme" data-d="'+D.k+'" data-p="'+(D.k===S.design?S.pal:D.pals[0][0])+'" style="--pbg:'+c.bg+';--psf:'+c.surface+';--pac:'+c.accent+';--ptx:'+c.text+';--pln:'+c.line+';--pmu:'+c.muted+';--pside:'+(c.side||c.surface2)+';font-family:'+D.fonts[1]+'">'+
      '<span class="pv-top"><b style="font-family:'+D.fonts[0]+'">Kuchárka <i>pre Tami</i></b><em></em></span><span class="pv-side"></span><span class="pv-hero"><span class="pv-h" style="font-family:'+D.fonts[0]+'">Aa</span><span class="pv-img"></span></span><span class="pv-tiles"><i></i><i></i><i></i></span></button>'+
      '<div class="palmeta"><b>'+esc(D[S.lang])+'</b><span class="dots">'+D.pals.map(p=>'<button class="dot'+(S.design===D.k&&S.pal===p[0]?' on':'')+'" title="'+esc(p[1])+'" aria-label="'+esc(p[1])+'" data-act="theme" data-d="'+D.k+'" data-p="'+p[0]+'" style="--d1:'+p[2].bg+';--d2:'+p[2].accent+';--d3:'+(p[2].side||p[2].surface2)+'"></button>').join('')+'</span></div><div class="palname">'+esc(cur[1])+'</div></div>';}).join('')+'</div></div>';
}
function togglePal(open){const p=$('#palpanel');p.hidden=!open;if(open)renderPal();}

// ---------------- data ----------------
let idxP=null;
function loadIndex(){return idxP||(idxP=fetch('data/index.json').then(r=>{if(!r.ok)throw new Error('index '+r.status);return r.json();}).then(d=>{S.meta=d.meta;S.idx=d.r;S.chMap={};d.meta.chapters.forEach(c=>S.chMap[c.stem]=c);return d;}));}
function loadCh(stem){return S.ch[stem]?Promise.resolve(S.ch[stem]):fetch('data/ch/'+encodeURIComponent(stem)+'.json').then(r=>{if(!r.ok)throw new Error('chapter '+r.status);return r.json();}).then(d=>(S.ch[stem]=d));}
const chName=stem=>{const c=S.chMap[stem];return c?(S.lang==='sk'?c.sk:c.en):stem;};
const lvlName=l=>T().levels[l]||l;

// ---------------- header / toc / footer ----------------
function renderChrome(route){
  const t=T();document.documentElement.lang=S.lang;document.title=t.brand1+' '+t.brand2;
  const nav=[['#/',t.home,'home'],['#/chapters',t.chapters,'chapters'],['#/search',t.search,'search'],['#/healthy',t.healthy,'healthy'],['#/countries',t.countries,'countries'],['#/chefs',t.chefsShort,'chefs'],['#/fridge',t.fridgeShort,'fridge'],['#/favorites',t.favorites,'favorites']];
  const soon=[['meals',t.meals],['shopping',t.shopping],['seasonal',t.seasonal],['joe',t.joe]];
  $('#top').innerHTML='<div class="topbar"><div class="wrap topin"><a class="brand" href="#/"><span class="logo">T</span><span class="bt">'+esc(t.brand1)+' <i>'+esc(t.brand2)+'</i></span></a>'+
   '<form class="qs" data-act="qs"><span class="qsi">'+ICON.search+'</span><input name="q" type="search" placeholder="'+esc(t.searchPh)+'" aria-label="'+esc(t.search)+'"></form>'+
   '<div class="tools"><div class="lang" role="group" aria-label="Language"><button data-act="lang" data-l="sk" class="'+(S.lang==='sk'?'on':'')+'">SK</button><button data-act="lang" data-l="en" class="'+(S.lang==='en'?'on':'')+'">EN</button></div>'+
   '<button class="palbtn" data-act="pal" title="'+esc(t.theme)+'" aria-label="'+esc(t.theme)+'">'+ICON.pal+'<span>'+esc(t.theme)+'</span></button></div></div></div>'+
   '<nav class="mainnav"><div class="wrap navin">'+nav.map(n=>'<a href="'+n[0]+'" class="'+(route===n[2]?'on':'')+'">'+esc(n[1])+'</a>').join('')+
   '<span class="soonwrap"><span class="soonlab">'+esc(t.more)+':</span>'+soon.map(s=>'<a href="#/soon/'+s[0]+'" class="soon">'+esc(s[1])+'</a>').join('')+'</span></div></nav>';
  const groups=[[t.savory,c=>c.num<24],[t.sweet,c=>c.num>=24&&c.num<34],[t.drinks,c=>c.num===34]];
  $('#toc').innerHTML=S.meta?'<a class="tocbrand" href="#/">'+esc(t.brand1)+' <i>'+esc(t.brand2)+'</i></a><div class="toch">'+esc(t.chapters)+'</div>'+groups.map(g=>'<div class="tocg">'+esc(g[0])+'</div>'+S.meta.chapters.filter(g[1]).map(c=>'<a href="#/c/'+c.stem+'" class="'+(location.hash==='#/c/'+c.stem?'on':'')+'"><span>'+esc(S.lang==='sk'?c.sk:c.en)+'</span><em></em><b>'+c.n+'</b></a>').join('')).join(''):'';
  $('#foot').innerHTML='<div class="wrap footin"><span class="fb">'+esc(t.brand1)+' <i>'+esc(t.brand2)+'</i></span><span>'+(S.idx?esc(t.recipes(S.idx.length))+' · '+S.meta.chapters.length+' '+esc(t.chapters.toLowerCase()):'')+'</span></div>';
}

// ---------------- cards ----------------
function card(r){
  const t=T();
  const al=r.al.length?r.al.map(a=>t.al[a]).join(', '):t.noAllergens;
  const badges=[r.h?'<span class="bdg h">'+esc(t.healthyBadge)+'</span>':'',r.af?'<span class="bdg">'+esc(t.af)+'</span>':'',r.sp?'<span class="bdg sp">'+esc(t.spicy)+'</span>':'',r.caf?'<span class="bdg">'+esc(t.caf)+'</span>':''].join('');
  const fv=hasMark(S.fav,r.id),ck=hasMark(S.cooked,r.id);
  return '<a class="rc" href="#/r/'+r.id+'"><span class="rimg">'+(ck?'<span class="ribbon">'+esc(t.cookedRibbon)+'</span>':'')+(fv?'<span class="favdot" title="'+esc(t.favorites)+'">'+HEART+'</span>':'')+(r.img?'<img loading="lazy" src="'+r.img+'" alt="'+esc(L(r.t))+'">':'')+'</span><span class="rcb"><span class="no">'+esc(chName(r.ch))+' · '+esc(lvlName(r.lvl))+'</span><h3>'+esc(L(r.t))+'</h3><span class="meta">'+(r.total?ICON.clock+' '+fmtMin(r.total):'')+(r.kcal?' · '+r.kcal+' kcal':'')+'</span><span class="al">'+esc(al)+'</span><span class="bdgs">'+badges+'</span></span></a>';
}
function fmtMin(m){if(m<90)return m+' min';const d=Math.floor(m/1440),h=Math.floor((m%1440)/60),mm=m%60;return (d?d+(S.lang==='sk'?' d ':' d '):'')+(h?h+' h':'')+(mm?' '+mm+' min':'');}
const grid=list=>'<div class="rgrid">'+list.map(card).join('')+'</div>';

// ---------------- views ----------------
function vHome(){
  const t=T(),M=S.meta,d=S.design;
  const pick=['01-fries-potatoes/hasselback-advanced','24-cookies-bars-brownies/brownie-fudgy-or-cakey-brownies','22-breakfast/pancakes-american-basic','19-appetizers-dips/hummus-basic','02-burgers/smash-burger-basic','14-salads/greek-basic','07-pasta/gnocchi-basic','13-soups/minestrone-basic'];
  let feat=pick.map(id=>S.idx.find(r=>r.id===id)).filter(Boolean);
  if(feat.length<8)feat=feat.concat(S.idx.filter(r=>r.img&&!feat.includes(r)).slice(0,8-feat.length));
  const hero=feat[0];const abs=u=>new URL(u,location.href).href;
  const byId=id=>S.idx.find(r=>r.id===id);
  const nRec=S.idx.length,nCh=M.chapters.length;
  const grpDef=[['savory',t.savory,c=>c.num<24,'01-fries-potatoes/hasselback-advanced'],['sweet',t.sweet,c=>c.num>=24&&c.num<34,'24-cookies-bars-brownies/brownie-fudgy-or-cakey-brownies'],['drinks',t.drinks,c=>c.num===34,'34-drinks/lemonade-basic']];
  const grpInfo=g=>{const cs=M.chapters.filter(g[2]);const n=cs.reduce((a,c)=>a+c.n,0);const r=byId(g[3]);return {k:g[0],name:g[1],cs:cs.length,n,img:r?r.img:(cs[0]&&cs[0].cover)};};
  const G=grpDef.map(grpInfo);
  const chW=n=>S.lang==='sk'?(n==1?'kapitola':n<5?'kapitoly':'kapitol'):(n==1?'chapter':'chapters');
  const hc=(M.homeCats||[])[d==='g'?1:0]||(M.homeCats||[])[0];
  const catTile=(cls)=>hc?'<a class="'+cls+'" href="#/r/'+hc.id+'"><img src="'+hc.img+'" alt="'+esc(t.catAlt)+'"><span class="ctb"><span class="pl">'+ICON.cat+esc(t.catTip[hc.type]||t.catTip.tip)+'</span><b>'+esc(L(hc.t))+'</b><em>'+esc(L(hc))+'</em></span></a>':'';
  const sform=(cls)=>'<form class="sbox '+(cls||'')+'" data-act="qs">'+ICON.search+'<input name="q" type="search" placeholder="'+esc(t.searchPh)+'"><button class="go">'+esc(t.go)+'</button></form>';
  const quick='<div class="chips qchips"><a class="chip" href="#/search?time=30">'+esc(t.upTo(30))+'</a><a class="chip" href="#/search?af=1">'+esc(t.af)+'</a><a class="chip" href="#/search?no=gluten">'+esc(t.without)+': '+esc(t.al.gluten)+'</a><a class="chip" href="#/search?no=milk">'+esc(t.without)+': '+esc(t.al.milk)+'</a><a class="chip" href="#/search?no=eggs">'+esc(t.without)+': '+esc(t.al.eggs)+'</a><a class="chip" href="#/search?lvl=Basic">'+esc(t.levels.Basic)+'</a><a class="chip" href="#/search?lvl=Advanced">'+esc(t.levels.Advanced)+'</a></div>';
  const sub=esc(t.recipes(nRec))+' · '+nCh+' '+esc(chW(nCh));
  let top='';
  if(d==='b'){
    top='<section class="bhero wrap"><div><span class="kicker">'+esc(t.heroK)+' · SK / EN</span><h1>'+esc(t.brand1)+' <i>'+esc(t.brand2)+'</i></h1><p>'+sub+'. '+esc(t.heroP)+'</p></div>'+catTile('catcard')+'</section>'+
      '<section class="wrap bfind"><h2>'+esc(t.search)+'</h2>'+sform()+quick+'</section>';
  }else if(d==='c'){
    const tiles=['01-fries-potatoes/french-fries-double-fried-basic','02-burgers/smash-burger-basic','22-breakfast/pancakes-american-basic','04-meat/pan-seared-steak-basic'].map(byId).filter(Boolean);
    top='<section class="chero wrap"><div><h1>'+esc(t.heroH).replace(/(\S+)\?$/,'<span>$1</span>?')+'</h1><p>'+sub+'</p>'+sform('big')+quick+'</div>'+catTile('catcard')+'</section>'+
      '<section class="wrap crow"><a class="ccount" href="#/chapters"><b>'+esc(t.recipes(nRec))+'</b><span>'+esc(t.heroP)+'</span><em>'+esc(t.chapters)+' →</em></a>'+tiles.map(r=>'<a class="cpin" href="#/r/'+r.id+'"><img src="'+r.img+'" alt=""><span>'+esc(chName(r.ch))+'</span><b>'+esc(L(r.t))+'</b></a>').join('')+'</section>';
  }else if(d==='d'){
    top='<section class="dhero wrap"><div class="dcat" style="--cat-img:url(&quot;'+abs('img/cat-master-final.jpg')+'&quot;)"></div><div class="dbubble"><span class="kicker">'+esc(t.heroK)+'</span><h1>'+esc(t.heroH)+'</h1><p>'+sub+'</p><div class="dgrps">'+G.map(g=>'<a href="#/chapters?g='+g.k+'"><img src="'+g.img+'" alt=""><b>'+esc(g.name)+'</b><span>'+g.cs+' '+esc(chW(g.cs))+' · '+esc(t.recipes(g.n))+'</span></a>').join('')+'</div>'+sform()+'</div></section>'+
      '<section class="wrap">'+quick+'</section>';
  }else if(d==='g'){
    top='<section class="gbento wrap"><div class="gbig" style="--hero-img:url(&quot;'+abs(byId('22-breakfast/pancakes-american-basic')?byId('22-breakfast/pancakes-american-basic').img:hero.img)+'&quot;)"><div class="glass"><span class="pill">'+esc(S.lang==='sk'?'Ahoj, Tami':'Hi, Tami')+'</span><h1>'+esc(t.heroH)+'</h1><p>'+sub+'</p>'+sform()+'</div></div>'+
      '<div class="gstat"><span class="kicker">'+esc(t.brand1)+'</span><b>'+nRec+'</b><span>'+esc(t.heroP)+'</span></div>'+
      G.map(g=>'<a class="gtile" href="#/chapters?g='+g.k+'"><img src="'+g.img+'" alt=""><span class="glab"><b>'+esc(g.name)+'</b><span>'+g.cs+' '+esc(chW(g.cs))+' · '+esc(t.recipes(g.n))+'</span><i>›</i></span></a>').join('')+
      catTile('gcat')+'<a class="gsm" href="#/healthy"><b>'+esc(t.healthy)+'</b><span>'+esc(t.sugarShort)+' · '+esc(t.caf)+'</span></a><a class="gsm" href="#/countries"><b>'+esc(t.countries)+'</b><span>'+esc(t.countriesP)+'</span></a></section>';
  }else{
    top='<section class="hero" style="--hero-img:url(&quot;'+abs(hero.img)+'&quot;)"><div class="heroimg"><img src="'+hero.img+'" alt="'+esc(L(hero.t))+'"></div><div class="sh"></div><div class="wrap heroin"><div class="herotext"><span class="kicker">'+esc(t.heroK)+'</span><h1>'+esc(t.heroH)+'</h1><p>'+esc(t.heroP)+'</p>'+sform('big')+
     '<div class="herostats"><span><b>'+nRec+'</b> '+esc(t.recipes(nRec).replace(/^\d+ /,''))+'</span><span><b>'+nCh+'</b> '+esc(chW(nCh))+'</span></div></div>'+
     '<a class="herocard" href="#/r/'+hero.id+'"><span class="kicker">'+esc(t.featured)+'</span><b>'+esc(L(hero.t))+'</b><span>'+esc(chName(hero.ch))+'</span></a></div></section>'+
     '<section class="sec quick"><div class="wrap"><div class="chips">'+Object.entries(t.types).map(([k,v])=>'<a class="chip" href="#/search?type='+k+'">'+esc(v)+'</a>').join('')+'<a class="chip h" href="#/healthy">'+esc(t.healthy)+'</a><a class="chip" href="#/search?af=1">'+esc(t.af)+'</a></div></div></section>';
  }
  return top+chapterGroups()+'<section class="sec"><div class="wrap"><div class="sh2"><h2>'+esc(t.featured)+'</h2></div>'+grid(feat.slice(1,7))+'</div></section>';
}
function chapterGroups(only){
  const t=T(),M=S.meta;const groups=[['savory',t.savory,c=>c.num<24],['sweet',t.sweet,c=>c.num>=24&&c.num<34],['drinks',t.drinks,c=>c.num===34]].filter(g=>!only||g[0]===only);
  return '<section class="sec"><div class="wrap"><div class="sh2"><h2>'+esc(t.chapters)+'</h2><span>'+esc(t.recipes(S.idx.length))+'</span></div>'+
   groups.map(g=>'<div class="grp" id="g-'+g[0]+'"><h3>'+esc(g[1])+'</h3></div><div class="tgrid">'+M.chapters.filter(g[2]).map(c=>'<a class="tile" href="#/c/'+c.stem+'"><span class="ti">'+(c.cover?'<img loading="lazy" src="'+c.cover+'" alt="">':'')+'</span><span class="num">'+String(c.num).padStart(2,'0')+'</span><h4>'+esc(S.lang==='sk'?c.sk:c.en)+'</h4><span class="cnt">'+esc(t.recipes(c.n))+'</span></a>').join('')+'</div>').join('')+'</div></section>';
}
function vChapters(params){return chapterGroups(params&&params.get('g')||'');}
function vChapter(stem,params){
  const t=T(),c=S.chMap[stem];if(!c)return vNotFound();
  let list=S.idx.filter(r=>r.ch===stem);const lv=params.get('lvl')||'',so=params.get('sort')||'';
  const lvls=[...new Set(list.map(r=>r.lvl))];
  if(lv)list=list.filter(r=>r.lvl===lv);
  if(so==='az')list=list.slice().sort((a,b)=>L(a.t).localeCompare(L(b.t),S.lang));
  if(so==='time')list=list.slice().sort((a,b)=>(a.total||1e9)-(b.total||1e9));
  const u=(k,v)=>{const p=new URLSearchParams(params);v?p.set(k,v):p.delete(k);const s=p.toString();return '#/c/'+stem+(s?'?'+s:'');};
  return '<section class="opener wrap"><div><div class="crumbs"><a href="#/chapters">'+esc(t.chapters)+'</a> / <b>'+esc(S.lang==='sk'?c.sk:c.en)+'</b></div><div class="bignum">'+String(c.num).padStart(2,'0')+'</div><h1>'+esc(S.lang==='sk'?c.sk:c.en)+'</h1><p class="dek">'+esc(t.recipes(c.n))+'</p></div>'+(c.cover?'<img src="'+c.cover+'" alt="">':'')+'</section>'+
   '<div class="fbar"><div class="wrap fbin"><span class="fl">'+esc(t.level)+'</span><a class="chip'+(!lv?' on':'')+'" href="'+u('lvl','')+'">'+esc(t.allLevels)+'</a>'+lvls.map(l=>'<a class="chip'+(lv===l?' on':'')+'" href="'+u('lvl',l)+'">'+esc(lvlName(l))+'</a>').join('')+
   '<span class="fl sp">'+esc(t.sort)+'</span>'+[['',t.sortDefault],['az',t.sortAz],['time',t.sortTime]].map(s=>'<a class="chip'+(so===s[0]?' on':'')+'" href="'+u('sort',s[0])+'">'+esc(s[1])+'</a>').join('')+'<span class="cnt">'+esc(t.recipes(list.length))+'</span></div></div>'+
   '<section class="wrap">'+grid(list)+'</section>';
}
function vSearch(params){
  const t=T(),q=params.get('q')||'',ch=params.get('ch')||'',ty=params.get('type')||'',co=params.get('co')||'',lv=params.get('lvl')||'',tm=+params.get('time')||0,h=params.get('h')==='1',af=params.get('af')==='1',ns=params.get('ns')==='1';
  const no=(params.get('no')||'').split(',').filter(Boolean);
  const words=norm(q).split(/\s+/).filter(Boolean);
  let list=S.idx.filter(r=>{
    if(words.length){const hay=norm(r.t.en+' '+r.t.sk+' '+chName(r.ch)+' '+S.chMap[r.ch].en+' '+S.chMap[r.ch].sk);if(!words.every(w=>hay.includes(w)))return false;}
    if(ch&&r.ch!==ch)return false;if(ty&&r.type!==ty)return false;if(co&&!r.co.includes(co))return false;if(lv&&r.lvl!==lv)return false;
    if(tm&&!(r.total&&r.total<=tm))return false;if(h&&!r.h)return false;if(af&&!r.af)return false;if(ns&&r.sp)return false;
    if(no.length&&(r.nal||no.some(a=>r.al.includes(a))))return false;return true;});
  const sel=(name,val,opts)=>'<label class="sel"><span>'+esc(name)+'</span><select data-f="'+opts.k+'"><option value="">'+esc(t.any)+'</option>'+opts.o.map(o=>'<option value="'+esc(o[0])+'"'+(o[0]===val?' selected':'')+'>'+esc(o[1])+'</option>').join('')+'</select></label>';
  const cos=Object.entries(S.meta.countries).map(([k,v])=>[k,S.lang==='sk'?v[1]:v[0]]).sort((a,b)=>a[1].localeCompare(b[1],S.lang));
  const show=list.slice(0,+params.get('n')||60);
  return '<section class="sec"><div class="wrap"><div class="sh2"><h1>'+esc(t.search)+'</h1><span>'+list.length+' '+esc(t.results)+'</span></div>'+
   '<form class="sbox" data-act="sq">'+ICON.search+'<input name="q" type="search" value="'+esc(q)+'" placeholder="'+esc(t.searchPh)+'"><button class="go">'+esc(t.go)+'</button></form>'+
   '<div class="filters"><div class="frow">'+sel(t.chapter,ch,{k:'ch',o:S.meta.chapters.map(c=>[c.stem,String(c.num).padStart(2,'0')+' '+(S.lang==='sk'?c.sk:c.en)])})+sel(t.dishType,ty,{k:'type',o:Object.entries(t.types)})+sel(t.country,co,{k:'co',o:cos})+
   sel(t.level,lv,{k:'lvl',o:[['Basic',t.levels.Basic],['Advanced',t.levels.Advanced]]})+sel(t.time,tm?String(tm):'',{k:'time',o:[15,30,45,60,90,120].map(m=>[String(m),t.upTo(m)])})+'</div>'+
   '<div class="frow"><span class="fl">'+esc(t.without)+'</span><span class="cs">'+Object.entries(t.al).map(([k,v])=>'<button type="button" class="chip'+(no.includes(k)?' on':'')+'" data-act="noal" data-a="'+k+'">'+esc(v)+'</button>').join('')+'</span></div>'+
   '<div class="frow"><span class="cs"><button type="button" class="chip'+(h?' on':'')+'" data-act="tog" data-k="h">'+esc(t.healthyOnly)+'</button><button type="button" class="chip'+(af?' on':'')+'" data-act="tog" data-k="af">'+esc(t.airfryer)+'</button><button type="button" class="chip'+(ns?' on':'')+'" data-act="tog" data-k="ns">'+esc(t.notSpicy)+'</button><a class="chip ghost" href="#/search">'+esc(t.reset)+'</a></span></div></div>'+
   (list.length?grid(show)+(list.length>show.length?'<div class="more"><a class="btn" href="#/search?'+(()=>{const p=new URLSearchParams(params);p.set('n',show.length+60);return p.toString();})()+'">+ '+(list.length-show.length)+'</a></div>':''):'<p class="empty">'+esc(t.noResults)+'</p>')+'</div></section>';
}
function vHealthy(){const t=T();const list=S.idx.filter(r=>r.h);return '<section class="sec"><div class="wrap"><div class="sh2"><h1>'+esc(t.healthyH)+'</h1><span>'+esc(t.recipes(list.length))+'</span></div><p class="lead">'+esc(t.healthyP)+'</p>'+grid(list)+'</div></section>';}
function vCountries(){const t=T();const cnt={};S.idx.forEach(r=>r.co.forEach(c=>cnt[c]=(cnt[c]||0)+1));const cos=Object.entries(S.meta.countries).filter(([k])=>cnt[k]).map(([k,v])=>[k,S.lang==='sk'?v[1]:v[0]]).sort((a,b)=>a[1].localeCompare(b[1],S.lang));
  return '<section class="sec"><div class="wrap"><div class="sh2"><h1>'+esc(t.countriesH)+'</h1></div><p class="lead">'+esc(t.countriesP)+'</p><div class="cobtns">'+cos.map(c=>'<a class="cobtn" href="#/search?co='+c[0]+'"><b>'+esc(c[1])+'</b><span>'+esc(t.recipes(cnt[c[0]]))+'</span></a>').join('')+'</div></div></section>';}
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
function vRecipe(r){
  const t=T(),en=S.lang==='en';const ix=S.idx.find(x=>x.id===r.id)||{};
  const base=r.serv||null;const want=S.serv[r.id]||base;const k=base?want/base:1;
  const ver=S.ver;
  const skNoOrig=ver==='orig'&&!en&&!(r.orig.ing.sk&&r.orig.method.sk);
  const showT=ver==='tami'||skNoOrig;
  const ingN=showT?(L(r.tami.ing)||r.tami.ing.en):L(r.orig.ing);
  let methN=showT?L(r.tami.method).c:L(r.orig.method);
  let methNote='';
  if(!methN||!methN.length)methN=L(r.orig.method)&&L(r.orig.method).length?L(r.orig.method):L(r.tami.method).c;
  const origNote=skNoOrig?'<div class="orignote"><p>'+esc(t.skNoOrig)+'</p><button class="btn sm" data-act="lang" data-l="en">'+esc(t.showEn)+'</button></div>':'';
  const tmv=showT&&r.tami.method[S.lang].v&&!/^(with|s Tamin)/i.test(r.tami.method[S.lang].v)?'<p class="mnote">'+linkify(r.tami.method[S.lang].v)+'</p>':'';
  const chg=L(r.tami.chg);
  const mext=L(r.mext)||[];const text=L(r.tami.ext)||[];
  const getK=(arr,re)=>arr.find(f=>re.test(f.k));
  const spicy=getK(mext,/^(Spicy|Pálivé)$/),spn=getK(mext,/^(Spicy note|Upozornenie)$/),lac=getK(mext,/^(Lactose|Laktóza)$/),lacn=getK(mext,/^(Lactose note|Poznámka k laktóze)$/);
  const otherM=mext.filter(f=>![spicy,spn,lac,lacn].includes(f)&&!/^(Recept)$/.test(f.k));
  const cafF=r.caf&&L(r.caf);
  const extra=text.filter(f=>!/^(Caffeine note|Kofeín)/.test(f.k));
  const sug=r.sugar;
  // header
  let h='<section class="rhero wrap"><div class="rhl"><div class="crumbs"><a href="#/c/'+r.ch+'">'+esc(chName(r.ch))+'</a> · '+esc(lvlName(r.lvl))+'</div><h1>'+esc(L(r.t))+(en?'':'<i>'+esc(r.t.en)+'</i>')+'</h1>'+
   '<div class="src">'+esc(t.source)+': '+esc(r.src||'')+(r.urls.length?' · '+r.urls.map(u=>linkify(u)).join(' · '):'')+'</div>'+
   '<div class="stats">'+timeStats(L(r.time))+'</div>'+
   '<div class="badges">'+(r.spicy?'<span class="bdg sp">🌶 '+esc(t.spicy)+'</span>':'')+(lac?'<span class="bdg lac">'+esc(t.lowLac)+'</span>':'')+(r.healthy&&r.healthy.ok?'<span class="bdg h">'+esc(t.healthyBadge)+'</span>':'')+(r.af?'<span class="bdg">'+esc(t.af)+'</span>':'')+(r.caf?'<span class="bdg">'+esc(t.caf)+'</span>':'')+(r.mild?'<span class="bdg">'+esc(t.mild)+'</span>':'')+'</div>'+
   '<div class="ctrls">'+(base?'<div class="scaler"><span class="sl">'+esc(t.servings)+'</span><button class="sb" data-act="serv" data-d="-1" aria-label="−">−</button><span class="sn">'+fmtServ(want)+'</span><button class="sb" data-act="serv" data-d="1" aria-label="+">+</button><span class="so">'+esc(t.origServ)+': '+esc(L(r.servT)||'')+'</span></div>':'<div class="scaler"><span class="sl">'+esc(t.servings)+'</span><span class="so">'+esc(L(r.servT)||'')+'</span></div>')+
   '<div class="vtoggle"><button data-act="ver" data-v="tami" class="'+(ver==='tami'?'on':'')+'">'+esc(t.tamiV)+'</button><button data-act="ver" data-v="orig" class="'+(ver==='orig'?'on':'')+'">'+esc(t.origV)+'</button></div></div><div class="ctrls">'+markBtns(r.id)+'<a class="btn cookbtn" href="#/cook/'+r.id+'">▶ '+esc(t.cook)+'</a></div></div>'+
   (r.img?'<img class="rimg-main" src="'+r.img+'" alt="'+esc(L(r.t))+'">':'')+'</section>';
  // warnings
  if(spicy||lac)h+='<section class="wrap warns">'+(spicy?'<div class="warn sp"><b>🌶 '+esc(spicy.k)+': '+esc(spicy.v)+'</b>'+(spn?'<p>'+linkify(spn.v)+'</p>':'')+'</div>':'')+(lac?'<div class="warn lac"><b>'+esc(lac.k)+': '+esc(lac.v)+'</b>'+(lacn?'<p>'+linkify(lacn.v)+'</p>':'')+'</div>':'')+'</section>';
  // allergens
  const nut=L(r.nut);
  h+='<section class="wrap alstrip"><span class="alh">'+esc(t.allergens)+'</span><div class="algrid">'+Object.entries(t.al).map(([a,v])=>'<span class="al'+(r.al.includes(a)?' on':'')+'">'+esc(v)+'</span>').join('')+'</div>'+(nut?'':'<span class="alh">—</span>')+'</section>';
  // body
  h+='<section class="wrap rbody"><div class="col-ing"><h2>'+esc(t.ingredients)+'</h2>'+origNote+'<p class="unit">'+esc(showT?t.tamiV:t.origV)+(k!==1?' · '+esc(t.scaled):'')+'</p>'+tree(ingN,{scale:k,cls:'ing'})+
   (chg&&chg.length?'<div class="chgbox"><h4>'+esc(t.changes)+'</h4>'+tree(chg,{tag:true})+'</div>':'')+'</div>'+
   '<div class="col-meth"><h2>'+esc(t.method)+'</h2>'+tmv+methNote+tree(methN)+
   (extra.length&&showT?'<div class="extra"><h3 class="h4s">'+esc(t.moreTami)+'</h3>'+extra.map(f=>'<div class="xf"><h4>'+linkify(labelClean(f.k))+'</h4>'+(f.k!==labelClean(f.k)?'<p class="tsrc">'+linkify(f.k.slice(labelClean(f.k).length).replace(/^\s*\(|\)$/g,''))+'</p>':'')+(f.v?'<p>'+linkify(f.v)+'</p>':'')+tree(f.c,{tag:true})+'</div>').join('')+'</div>':'')+
   '</div><aside class="side">'+catCard(r)+
   ((cafF||sug)?'<div class="infobox"><h4>'+(cafF?esc(t.caffeine)+(sug?' · ':''):'')+(sug?esc(t.sugarShort):'')+'</h4>'+(cafF?'<div class="caf"><b>'+esc(t.caffeine)+'</b>'+(cafF.v?'<p>'+linkify(cafF.v)+'</p>':'')+tree(cafF.c)+'</div>':'')+sugarBox(sug)+'</div>':'')+
   (L(r.equip)?'<h4>'+esc(t.equipment)+'</h4>'+fieldBlock(L(r.equip),'s'):'')+(L(r.store)?'<h4>'+esc(t.storage)+'</h4>'+fieldBlock(L(r.store),'s'):'')+
   otherM.map(f=>'<h4>'+esc(f.k)+'</h4>'+fieldBlock(f,'s')).join('')+'</aside></section>';
  // flavors
  if(r.flavors.length)h+='<section class="wrap flv"><h2>'+esc(t.flavors)+'</h2><div class="flgrid">'+r.flavors.map(f=>'<div class="fcard">'+(f.img?'<img loading="lazy" src="'+f.img+'" alt="'+esc(L(f))+'">':'')+'<div class="fb2"><h3>'+esc(cap(L(f)))+'</h3>'+markBtns(r.id,f)+(f.tip?'<div class="cat mini">'+(f.cat?'<img loading="lazy" src="'+f.cat+'" alt="'+esc(t.catAlt)+'">':'')+'<div><span class="pl">'+ICON.cat+esc(t.catTip[f.tip.type]||t.catTip.tip)+'</span><p>'+esc(L(f.tip))+'</p>'+(f.tip.url?'<span class="tsrc">'+linkify(f.tip.url)+'</span>':'')+'</div></div>':'')+'</div></div>').join('')+'</div></section>';
  // nutrition
  h+='<section class="wrap rnut"><div><h2>'+esc(t.nutrition)+' <small>('+esc(t.tamiV)+')</small></h2>'+nutTable(nut)+'</div><div>'+
   (nut&&nut.vit?'<h3 class="h4s">'+esc(t.vit)+'</h3><div class="vit">'+nut.vit.split(';').map(s=>'<span>'+esc(s.trim())+'</span>').join('')+'</div>':'')+
   (r.healthy&&r.healthy.claims.length?'<h3 class="h4s">'+esc(t.claims)+'</h3><ul class="lst claims">'+r.healthy.claims.map(c=>'<li><b>'+esc(L({en:c.en,sk:c.sk}))+'</b> — '+esc(en?c.d_en:c.d_sk)+'</li>').join('')+'</ul>':'')+
   '<p class="nutnote">'+esc(t.nutEstimate)+(nut&&nut.notes?' '+esc(nut.notes):'')+'</p></div></section>';
  if(L(r.notes))h+='<section class="wrap notes"><h2>'+esc(t.notesSrc)+'</h2>'+fieldBlock(L(r.notes))+'</section>';
  return h;
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
let curRecipe=null;
async function route(){
  const h=location.hash.replace(/^#/,'')||'/';const [path,qs]=h.split('?');const params=new URLSearchParams(qs||'');const parts=path.split('/').filter(Boolean);
  const v=$('#view');
  try{
    await loadIndex();
    let name=parts[0]||'home',html;curRecipe=null;const wasCook=curCook;if(parts[0]!=='cook'){curCook=null;wakeOff();}
    if(name==='home')html=vHome();
    else if(name==='chapters')html=vChapters(params);
    else if(name==='c')html=vChapter(parts[1],params);
    else if(name==='search')html=vSearch(params);
    else if(name==='healthy')html=vHealthy();
    else if(name==='countries')html=vCountries();
    else if(name==='chefs')html=vChefs();
    else if(name==='soon')html=vSoon(parts[1]);
    else if(name==='favorites')html=vFav();
    else if(name==='fridge'){await loadFridge();html=vFridge(params);}
    else if(name==='cook'){const id=parts.slice(1).join('/');const d=await loadCh(parts[1]);const r=d.find(x=>x.id===id);if(r){if(!curCook||curCook.id!==r.id)S.cookStep=0;curCook=r;html=vCook(r);}else html=vNotFound();name='chapters';}
    else if(name==='r'){const id=parts.slice(1).join('/');const d=await loadCh(parts[1]);const r=d.find(x=>x.id===id);curRecipe=r;html=r?vRecipe(r):vNotFound();name='chapters';}
    else html=vNotFound();
    renderChrome(name==='c'?'chapters':name);v.innerHTML=html;document.body.classList.toggle('cooking',!!curCook);if(curCook)wakeOn();
  }catch(e){console.error(e);v.innerHTML='<section class="sec"><div class="wrap"><p class="empty">'+esc(String(e.message||e))+'</p></div></section>';}
}
function rerender(keepScroll){const y=window.scrollY;if(curCook){renderChrome('chapters');$('#view').innerHTML=vCook(curCook);if(wake)$('.wakest').textContent=T().wakeOn;else wakeOn();return;}if(curRecipe){renderChrome('chapters');$('#view').innerHTML=vRecipe(curRecipe);}else route();if(keepScroll)window.scrollTo(0,y);}
window.addEventListener('hashchange',()=>{route().then(()=>window.scrollTo(0,0));});
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
route();
})();
