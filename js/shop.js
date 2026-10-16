/* Shopping list (Joe 2026-10-16): product TYPES only (no product matches, no prices, no store photos/logos).
 * Every item links to the chosen store's own search page (or its offers/leaflet page where it has no search),
 * so Tami checks the current product and price there. One store per trip; a store without online search is
 * flagged with the nearest store that has one.
 * Location: only with her permission, only on this device, only to list stores nearest first. The precise position
 * never leaves the browser and is never saved: Overpass (OpenStreetMap) gets the position rounded to ~1 km,
 * results are cached in memory only. If she says no, or Overpass fails, the researched home-area stores are used. */
(function(){
'use strict';
const LS={list:'tami.shop',done:'tami.shop.done'};
const get=k=>{try{return JSON.parse(localStorage.getItem(k)||'{}')||{};}catch(e){return {};}};
const put=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const TX={
 sk:{h:'Nákupný zoznam',kick:'Nákup',lead:'Pre každú surovinu ukazujeme len druh výrobku. Odkaz otvorí vyhľadávanie alebo ponuku vybraného obchodu, kde si skontroluješ aktuálny výrobok a cenu. Ceny tu neukazujeme.',
  add:'Do nákupného zoznamu',added:'V nákupnom zozname',empty:'Zoznam je prázdny. Na stránke receptu klikni na „Do nákupného zoznamu“.',
  home:'Obchody v okolí: Vinohrady nad Váhom a Sereď (domáca oblasť)',near:'Obchody v tvojom okolí (podľa polohy, len na tomto zariadení)',
  useLoc:'Použiť moju polohu',useHome:'Späť na domácu oblasť',locWait:'Hľadám obchody v okolí…',locNo:'Poloha nie je dostupná, ukazujem domácu oblasť.',locFail:'Obchody v okolí sa nepodarilo načítať, ukazujem domácu oblasť.',
  locNote:'Poloha sa použije len na zoradenie obchodov od najbližšieho. Neukladá sa a nikam sa neposiela; mapovej službe OpenStreetMap ide len zaokrúhlená oblasť (asi 1 km).',
  trip:'Nákup v obchode',pick:'Vyber obchod na tento nákup',car:'autom',air:'vzdušnou čiarou',
  kind:{search:'vyhľadávanie',offers:'akciová ponuka',leaflet:'leták',map:'mapa'},
  open:{search:'Hľadať v {s}',offers:'Ponuka {s}',leaflet:'Leták {s}',map:'{s} na mape'},
  flag:'{s} nemá online vyhľadávanie výrobkov, takže výrobok over priamo v predajni. Alternatíva s vyhľadávaním: {a}.',
  flagNone:'{s} nemá online vyhľadávanie výrobkov, takže výrobok over priamo v predajni.',
  alt:'alebo hľadať v {a}',tesco:'Tesco online obchod: sortiment malej predajne Expres sa môže líšiť.',lidl:'Lidl online ukazuje hlavne aktuálnu ponuku.',
  copy:'Kopírovať ako text',copied:'Skopírované',remove:'Odstrániť',clear:'Vymazať celý zoznam',byStore:'Zoznam podľa obchodu',items:'položiek',
  recipe:'Recept',noPrice:'Bez cien: cenu a dostupnosť skontroluj na stránke obchodu alebo v predajni.',cat:{dairy:'mliečne',eggs:'vajcia',produce:'ovocie a zelenina',meat:'mäso',fish:'ryby',bakery:'pečivo a múka',spices:'koreniny',pantry:'trvanlivé',other:'ostatné'}},
 en:{h:'Shopping list',kick:'Shopping',lead:'For each ingredient we show only the kind of product. The link opens the chosen store\u2019s own search or offers page, where you check the current product and price. No prices are shown here.',
  add:'Add to shopping list',added:'On the shopping list',empty:'The list is empty. On a recipe page, click \u201cAdd to shopping list\u201d.',
  home:'Stores nearby: Vinohrady nad Váhom and Sereď (home area)',near:'Stores near you (from your location, on this device only)',
  useLoc:'Use my location',useHome:'Back to the home area',locWait:'Looking for stores nearby…',locNo:'Location isn\u2019t available, showing the home area.',locFail:'Couldn\u2019t load nearby stores, showing the home area.',
  locNote:'Your location is only used to sort stores nearest first. It is never saved or sent anywhere; the OpenStreetMap map service only gets a rounded area (about 1 km).',
  trip:'Shopping at',pick:'Pick one store for this trip',car:'by car',air:'straight line',
  kind:{search:'search',offers:'offers',leaflet:'leaflet',map:'map'},
  open:{search:'Search at {s}',offers:'{s} offers',leaflet:'{s} leaflet',map:'{s} on the map'},
  flag:'{s} has no online product search, so check the product in the store. Alternative with search: {a}.',
  flagNone:'{s} has no online product search, so check the product in the store.',
  alt:'or search at {a}',tesco:'Tesco online shop: a small Expres store\u2019s range can differ.',lidl:'Lidl online mostly shows the current offers.',
  copy:'Copy as text',copied:'Copied',remove:'Remove',clear:'Clear the whole list',byStore:'List by store',items:'items',
  recipe:'Recipe',noPrice:'No prices: check the price and availability on the store\u2019s website or in the store.',cat:{dairy:'dairy',eggs:'eggs',produce:'fruit & veg',meat:'meat',fish:'fish',bakery:'bakery & flour',spices:'spices',pantry:'pantry',other:'other'}}};
// chains: how to open "this ingredient" at each store (verified 2026-10-16: Tesco and Lidl search URLs; BILLA/Kaufland/COOP have no public product search)
const CH={
 tesco:{n:'Tesco',kind:'search',url:q=>'https://potravinydomov.itesco.sk/shop/sk-SK/search?query='+encodeURIComponent(q),note:'tesco'},
 lidl:{n:'Lidl',kind:'search',url:q=>'https://www.lidl.sk/q/search?q='+encodeURIComponent(q),note:'lidl'},
 billa:{n:'BILLA',kind:'offers',url:()=>'https://www.billa.sk/produkty'},
 kaufland:{n:'Kaufland',kind:'offers',url:()=>'https://predajne.kaufland.sk/aktualna-ponuka/prehlad.html'},
 coop:{n:'COOP Jednota',kind:'leaflet',url:()=>'https://www.coop.sk/letaky'}};
// researched home-area stores (recipe-site/shopping/stores.md): driving km from the home area (OSRM); no home coordinates on the site
const HOME=[
 {c:'coop',place:'Vinohrady nad Váhom',km:0.8,url:'https://www.coop.sk/letaky/galanta/regionalny-letak-coop-jednota-galanta-2'},
 {c:'coop',place:'Šintava, Seredská 4',km:2.9,url:'https://www.coop.sk/letaky/galanta/regionalny-letak-coop-jednota-galanta-2'},
 {c:'lidl',place:'Sereď, Námestie slobody 4333/50',km:3.3},
 {c:'billa',place:'Sereď, Cukrovarská 9a/49',km:4.5},
 {c:'kaufland',place:'Sereď, Cukrovarská 742/28',km:4.6,url:'https://predajne.kaufland.sk/aktualna-ponuka/prehlad.storeName=SK5420.html'},
 {c:'billa',place:'Sereď, Šulekovská 5033/50',km:5.8},
 {c:'tesco',place:'Pata, Nitrianska 243 (Expres)',km:9.3},
 {c:'kaufland',place:'Galanta, Esterházyovcov 2381/26',km:15.5},
 {c:'tesco',place:'Galanta, Drevená 762/2 (Hypermarket)',km:17.4}].map(s=>Object.assign({mode:'car'},s));
const IC={
 dairy:'<path d="M8 3h8v3l2 3v12H6V9l2-3z"/><path d="M6 13h12"/>',
 eggs:'<path d="M12 3c3.5 0 6 5.5 6 10a6 6 0 0 1-12 0c0-4.5 2.5-10 6-10z"/>',
 produce:'<path d="M12 21c-5 0-7-4-7-8 0-3 2-5 4-5 1.3 0 2.2.6 3 1.2.8-.6 1.7-1.2 3-1.2 2 0 4 2 4 5 0 4-2 8-7 8z"/><path d="M12 9c0-3 1.5-5 4-6"/>',
 meat:'<path d="M15 4a5 5 0 0 1 2 9.6l-5.4 5.4a2.5 2.5 0 1 1-3.5-3.5L13.5 10A5 5 0 0 1 15 4z"/><path d="M7 19l-2 2"/>',
 fish:'<path d="M3 12c3-4 7-6 11-6 3 0 5 2 7 6-2 4-4 6-7 6-4 0-8-2-11-6z"/><path d="M3 12l-1-3M3 12l-1 3"/><circle cx="16" cy="11" r=".8"/>',
 bakery:'<path d="M4 11a6 4 0 0 1 16 0v8H4z"/><path d="M8 11v8M12 11v8M16 11v8"/>',
 spices:'<path d="M9 3h6v4H9z"/><path d="M8 7h8l1 14H7z"/><path d="M11 12h2M11 16h2"/>',
 pantry:'<path d="M7 5h10v3H7z"/><path d="M6 8h12v13H6z"/><path d="M9 13h6"/>',
 other:'<path d="M6 8h12l-1 13H7z"/><path d="M9 8a3 3 0 0 1 6 0"/>'};
const icon=k=>'<svg class="shic shic-'+k+'" viewBox="0 0 24 24" aria-hidden="true">'+(IC[k]||IC.other)+'</svg>';
const CART='<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 4h2l2.4 11h10.2L20 7H6.2"/><circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/></svg>';

let A=null,DATA=null,dataP=null;
const st={stores:HOME,mode:'home',sel:0,msg:'',busy:false,cache:{}};
const t=()=>TX[A.S.lang]||TX.sk;
function load(){return dataP||(dataP=fetch('data/shop.json').then(r=>r.json()).then(d=>{DATA=d;return d;}));}
const list=()=>get(LS.list);
function toggle(id){const l=list();if(l[id])delete l[id];else l[id]={t:Date.now()};put(LS.list,l);}
const name=s=>CH[s.c]?CH[s.c].n:(s.name||'?');
const kind=s=>s.url&&s.c==='coop'?'leaflet':CH[s.c]?CH[s.c].kind:'map';
function link(s,q){const c=CH[s.c];if(!c)return s.map;if(c.kind==='search')return c.url(q);return s.url||c.url(q);}
const dist=s=>(s.km<10?s.km.toFixed(1):Math.round(s.km))+' km '+(s.mode==='car'?t().car:t().air);
const label=s=>'<span class="shlab shlab-'+(CH[s.c]?s.c:'osm')+'">'+esc(name(s))+'</span>';
function altFor(s){if(kind(s)==='search')return null;return st.stores.find(x=>kind(x)==='search')||null;}

// ---------- location (her browser only) ----------
const R=6371,rad=x=>x*Math.PI/180;
function hav(a,b,c,d){const x=Math.sin(rad(c-a)/2)**2+Math.cos(rad(a))*Math.cos(rad(c))*Math.sin(rad(d-b)/2)**2;return 2*R*Math.asin(Math.sqrt(x));}
function chainOf(tg){const s=((tg.brand||'')+' '+(tg.name||'')+' '+(tg.operator||'')).toLowerCase();
  return /tesco/.test(s)?'tesco':/\blidl\b/.test(s)?'lidl':/\bbilla\b/.test(s)?'billa':/kaufland/.test(s)?'kaufland':/\bcoop\b|jednota/.test(s)?'coop':null;}
async function overpass(lat,lon){const la=lat.toFixed(2),lo=lon.toFixed(2),key=la+','+lo;
  if(st.cache[key]&&Date.now()-st.cache[key].t<30*60e3)return st.cache[key].d;
  const q='[out:json][timeout:20];nwr["shop"~"^(supermarket|convenience|greengrocer)$"](around:10000,'+la+','+lo+');out center tags 200;';
  let err;
  for(const ep of ['https://overpass-api.de/api/interpreter','https://overpass.private.coffee/api/interpreter']){
    const ctl=new AbortController();const to=setTimeout(()=>ctl.abort(),45000);
    try{const r=await fetch(ep,{method:'POST',body:'data='+encodeURIComponent(q),headers:{'Content-Type':'application/x-www-form-urlencoded'},signal:ctl.signal});
      if(!r.ok)throw new Error('overpass '+r.status);const d=await r.json();st.cache[key]={t:Date.now(),d};return d;}
    catch(e){err=e;}finally{clearTimeout(to);}}
  throw err;}
function useLoc(){if(!navigator.geolocation){st.msg=t().locNo;A.rerender(true);return;}
  st.busy=true;st.msg=t().locWait;A.rerender(true);
  navigator.geolocation.getCurrentPosition(async p=>{const {latitude:lat,longitude:lon}=p.coords;
    try{const d=await overpass(lat,lon);
      const out=(d.elements||[]).map(e=>{const la=e.lat??(e.center&&e.center.lat),lo=e.lon??(e.center&&e.center.lon);if(la==null)return null;const tg=e.tags||{};const c=chainOf(tg);
        const pl=[tg['addr:street']||tg['addr:place'],tg['addr:housenumber']].filter(Boolean).join(' ');
        return {c:c||'osm',name:c?null:(tg.name||(tg.shop==='greengrocer'?(A.S.lang==='sk'?'Zelovoc':'Greengrocer'):(A.S.lang==='sk'?'Potraviny':'Grocery'))),place:[tg['addr:city'],pl].filter(Boolean).join(', '),
          km:hav(lat,lon,la,lo),mode:'air',map:'https://www.openstreetmap.org/'+({n:'node',w:'way',r:'relation'}[e.type[0]])+'/'+e.id};}).filter(Boolean).sort((a,b)=>a.km-b.km).slice(0,40);
      if(!out.length)throw new Error('none');st.stores=out;st.mode='near';st.sel=0;st.msg='';}
    catch(e){st.stores=HOME;st.mode='home';st.sel=0;st.msg=t().locFail;}
    st.busy=false;A.rerender(true);},
  ()=>{st.busy=false;st.stores=HOME;st.mode='home';st.sel=0;st.msg=t().locNo;A.rerender(true);},{enableHighAccuracy:false,timeout:15000,maximumAge:600000});}

// ---------- views ----------
function btn(id){const on=!!list()[id];const x=t();
  return '<button class="btn shopbtn'+(on?' on':'')+'" data-shop-add="'+esc(id)+'" aria-pressed="'+on+'">'+CART+'<span>'+esc(on?x.added:x.add)+'</span></button>';}
function rows(){const l=list(),ids=Object.keys(l).sort((a,b)=>l[a].t-l[b].t);
  return ids.map(id=>({id,r:(A.S.idx||[]).find(x=>x.id===id),items:(DATA&&DATA[id])||[]})).filter(x=>x.r);}
function text(){const x=t(),s=st.stores[st.sel],sk=A.S.lang==='sk',done=get(LS.done);const al=altFor(s);
  let o=x.trip+': '+name(s)+(s.place?' ('+s.place+')':'')+'\n';if(al)o+=x.flag.replace('{s}',name(s)).replace('{a}',name(al)+(al.place?' ('+al.place+')':''))+'\n';
  rows().forEach(g=>{o+='\n'+(sk?g.r.t.sk:g.r.t.en)+'\n';g.items.forEach((it,i)=>{o+=(done[g.id+'|'+i]?'[x] ':'[ ] ')+(sk?it[1]:it[0])+'\n';});});
  return o+'\n'+x.noPrice+'\n';}
function view(){const x=t(),sk=A.S.lang==='sk',d=A.S.design,done=get(LS.done);if(st.sel>=st.stores.length)st.sel=0;
  const s=st.stores[st.sel],al=altFor(s),gs=rows();
  const loc='<div class="shloc"><p class="shwhere">'+esc(st.mode==='near'?x.near:x.home)+'</p>'+(st.msg?'<p class="shmsg">'+esc(st.msg)+'</p>':'')+
    '<button class="btn ghost" data-shop-loc="'+(st.mode==='near'?'home':'near')+'"'+(st.busy?' disabled':'')+'>'+esc(st.mode==='near'?x.useHome:x.useLoc)+'</button><p class="shnote">'+esc(x.locNote)+'</p></div>';
  const stores='<div class="shstores" role="radiogroup" aria-label="'+esc(x.pick)+'"><span class="shpick">'+esc(x.pick)+'</span>'+st.stores.slice(0,st.mode==='near'?16:12).map((o,i)=>
    '<button class="shstore'+(i===st.sel?' on':'')+'" role="radio" aria-checked="'+(i===st.sel)+'" data-shop-store="'+i+'">'+label(o)+'<span class="shpl">'+esc(o.place||'')+'</span><span class="shkm">'+esc(dist(o))+'</span><span class="shkind">'+esc(x.kind[kind(o)])+'</span></button>').join('')+'</div>';
  const flag=kind(s)==='search'?'':'<p class="shflag">⚑ '+(al?esc(x.flag).replace('{s}',label(s)).replace('{a}',label(al)+(al.place?' <small>('+esc(al.place)+', '+esc(dist(al))+')</small>':'')):esc(x.flagNone).replace('{s}',label(s)))+'</p>';
  const note=CH[s.c]&&CH[s.c].note?'<p class="shnote">'+esc(x[CH[s.c].note])+'</p>':'';
  const lk=(o,q)=>'<a class="shgo shgo-'+kind(o)+'" href="'+esc(link(o,q))+'" target="_blank" rel="noopener">'+esc(x.open[kind(o)].replace('{s}',name(o)))+' ↗</a>';
  const lists=gs.length?gs.map(g=>{const tt=sk?g.r.t.sk:g.r.t.en;
    return '<article class="shrec"><a class="rc shpic" href="#/r/'+esc(g.id)+'" style="background-image:url(\''+esc(g.r.img)+'\')" aria-label="'+esc(tt)+'"></a><div class="shbody"><header><a href="#/r/'+esc(g.id)+'" class="shrt">'+esc(tt)+'</a><button class="shx" data-shop-add="'+esc(g.id)+'" title="'+esc(x.remove)+'" aria-label="'+esc(x.remove)+'">×</button></header><ul class="shitems">'+
      g.items.map((it,i)=>{const k=g.id+'|'+i,dn=!!done[k];return '<li class="'+(dn?'done':'')+'"><label><input type="checkbox" data-shop-done="'+esc(k)+'"'+(dn?' checked':'')+'>'+icon(it[3])+'<span class="shn">'+esc(sk?it[1]:it[0])+'<small>'+esc(x.cat[it[3]]||'')+'</small></span></label><span class="shlinks">'+lk(s,it[2])+(al?'<span class="shalt">'+lk(al,it[2])+'</span>':'')+'</span></li>';}).join('')+'</ul></div></article>';}).join(''):'<p class="empty">'+esc(x.empty)+'</p>';
  const n=gs.reduce((a,g)=>a+g.items.length,0);
  const by=gs.length?'<div class="shby"><h2>'+esc(x.byStore)+'</h2><div class="shgrp"><h3>'+label(s)+' <small>'+esc((s.place||'')+' · '+dist(s))+' · '+n+' '+x.items+'</small></h3>'+note+'<p class="shnote">'+esc(x.noPrice)+'</p><div class="shbtns"><button class="btn" data-shop-copy>'+esc(x.copy)+'</button><button class="btn ghost" data-shop-clear>'+esc(x.clear)+'</button></div></div></div>':'';
  return '<section class="sec shop shop-'+d+'"><div class="wrap"><div class="shhead"><span class="kicker">'+esc(x.kick)+'</span><h1>'+esc(x.h)+'</h1><p class="lead">'+esc(x.lead)+'</p></div>'+
    '<div class="shgrid"><aside class="shside">'+loc+stores+'</aside><div class="shmain"><div class="shtrip"><span>'+esc(x.trip)+'</span> '+label(s)+(s.place?' <small>'+esc(s.place)+'</small>':'')+'</div>'+flag+by+'<div class="shlists">'+lists+'</div></div></div></div></section>';}

document.addEventListener('click',e=>{if(!A)return;
  const a=e.target.closest('[data-shop-add]');if(a){e.preventDefault();toggle(a.dataset.shopAdd);A.rerender(true);return;}
  const s=e.target.closest('[data-shop-store]');if(s){st.sel=+s.dataset.shopStore;A.rerender(true);return;}
  const l=e.target.closest('[data-shop-loc]');if(l){if(l.dataset.shopLoc==='near')useLoc();else{st.stores=HOME;st.mode='home';st.sel=0;st.msg='';A.rerender(true);}return;}
  if(e.target.closest('[data-shop-clear]')){put(LS.list,{});put(LS.done,{});A.rerender(true);return;}
  const c=e.target.closest('[data-shop-copy]');if(c){const tx=text();const ok=()=>{c.textContent=t().copied;setTimeout(()=>{c.textContent=t().copy;},1600);};
    (navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(tx):Promise.reject()).then(ok,()=>{const ta=document.createElement('textarea');ta.value=tx;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');}catch(x){}ta.remove();ok();});}});
document.addEventListener('change',e=>{const c=e.target.closest('[data-shop-done]');if(!c)return;const d=get(LS.done);if(c.checked)d[c.dataset.shopDone]=1;else delete d[c.dataset.shopDone];put(LS.done,d);c.closest('li').classList.toggle('done',c.checked);});
window.TamiShop={init(o){A=o;},load,view,btn,text:()=>text(),state:()=>({mode:st.mode,sel:st.sel,n:st.stores.length,first:st.stores[0]&&name(st.stores[0])})};
})();
