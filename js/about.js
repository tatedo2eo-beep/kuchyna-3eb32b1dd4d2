/* About page (SK/EN). Every number comes from data/about.json (built from the recipe data by about_index.py). */
(function(){
'use strict';
let A=null,D=null,P=null;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function load(){return P||(P=fetch('data/about.json').then(r=>r.json()).then(d=>{D=d;return d;}));}
const TX={
 sk:{kick:'O kuchárke',h:'Kuchárka pre Tami',lead:d=>d.recipes+' receptov v '+d.chapters+' kapitolách, po slovensky aj po anglicky. Pri každom recepte je pôvodný recept zo zdroja a Tamina verzia upravená podľa jej pravidiel.',
  verH:'Tamina verzia a jej pravidlá',verP:'Tlačidlom „Tamina verzia / Originál“ pri recepte prepínaš medzi úpravou pre Tami a pôvodným receptom. Tamina verzia dodržiava:',
  rules:d=>['mliečne výrobky len bez laktózy','bez bravčového mäsa','bez alkoholu','želatína len hovädzia alebo rybacia','menej cukru a tuku','žiadne sladidlá','kofeín najviac '+d.cafLimit+' mg denne','jednotky g, ml, ČL a PL'],
  spH:'Pálivé jedlá',spP:d=>d.spicy+' jedál, pri ktorých je pálivosť podstatou jedla, je označených 🌶 Pálivé s upozornením; ich pálivosť zostáva ako v origináli. V '+d.mild+' ďalších receptoch nájdeš v surovinách riadok „Jemná verzia (nepovinné)“ s jemnejšou možnosťou.',
  alH:'Alergény',alP:'Každý recept ukazuje, ktoré z 14 alergénov EÚ obsahuje. Mlieko bez laktózy je stále mlieko, preto zostáva označené ako alergén mlieko. Vo vyhľadávaní môžeš recepty s vybraným alergénom skryť.',alIn:'V receptoch sa vyskytujú:',
  sgH:'Cukor a kofeín',cfP:d=>d.caffeine+' receptov s kofeínom ukazuje, koľko kofeínu má porcia, vedľa Tamino denného limitu '+d.cafLimit+' mg.',sgLink:'Zdroj: WHO',
  srcH:'Zdroje',srcP:'Recepty pochádzajú len zo schválených zdrojov a každý má odkaz na pôvodnú stránku. Počet receptov podľa zdroja:',
  fH:'Čo všetko tu nájdeš',
  feats:d=>[['Hľadať','vyhľadávanie podľa názvu alebo suroviny, s filtrami: kapitola, druh jedla, krajina, úroveň, čas, alergény, len zdravé, teplovzdušná fritéza ('+d.airfryer+' receptov), nie pálivé.'],
   ['Zdravé','recepty označené ako zdravé podľa oficiálnych výživových pravidiel (EÚ 1924/2006, WHO).'],['Krajiny','recepty podľa krajiny pôvodu ('+d.countries+' krajín a oblastí).'],
   ['Menu',d.meals+' zostavených menu: hlavné jedlo, príloha, omáčka, predjedlo a nápoj.'],['Sezónne','výber podľa sezónnej zeleniny, ovocia a sviatkov.'],['Šéfkuchári','podpisové jedlá, ktoré tak označuje sám zdroj.'],
   ['Z chladničky','označ, čo máš doma, a uvidíš, čo z toho uvaríš.'],['Obľúbené a Uvarila som','srdiečko a pečiatka pri recepte; zoznam nájdeš v Obľúbených.'],
   ['Režim varenia','veľké kroky jeden po druhom, obrazovka počas varenia nezhasne.'],['Nákupný zoznam','pri recepte klikni na „Do nákupného zoznamu“; pri každej surovine je odkaz na vyhľadávanie alebo ponuku vybraného obchodu, ceny si overíš tam.'],
   ['Zdieľanie medzi notebookmi','obľúbené, uvarené recepty a chat s Joeom sa po zadaní hesla zdieľajú medzi notebookmi. Prehliadanie heslo nepotrebuje.']],
  thH:'Vzhľad',thP:'Tlačidlom „Vzhľad“ vedľa SK | EN vyberieš jeden z 5 dizajnov, každý v 3 farbách (15 možností). Voľba sa zapamätá.',
  joeH:'Joe · AI',joeP:'Joe · AI je AI verzia Joea, vždy označená štítkom AI. Nepíše skutočný Joe. Beží priamo v notebooku, pozná Tamine pravidlá a recepty z kuchárky, zapamätá si, čo mu povieš, a nevie prehliadať internet. Otvoríš ho tlačidlom Joe v rohu.'},
 en:{kick:'About',h:'Cookbook for Tami',lead:d=>d.recipes+' recipes in '+d.chapters+' chapters, in Slovak and English. Every recipe has the original recipe from its source and Tami\u2019s version, adjusted to her rules.',
  verH:'Tami\u2019s version and her rules',verP:'The \u201cTami\u2019s version / Original\u201d switch on a recipe flips between the version made for Tami and the original. Tami\u2019s version keeps to:',
  rules:d=>['dairy only lactose-free','no pork','no alcohol','gelatin only from beef or fish','less sugar and fat','no sweeteners','caffeine at most '+d.cafLimit+' mg a day','units g, ml, tsp and tbsp'],
  spH:'Spicy dishes',spP:d=>d.spicy+' dishes where the heat is the point of the dish are marked 🌶 Spicy with a note; their heat stays as in the original. In '+d.mild+' other recipes, a \u201cMild swap (optional)\u201d line in the ingredients gives a milder option.',
  alH:'Allergens',alP:'Every recipe shows which of the 14 EU allergens it contains. Lactose-free milk is still milk, so it stays marked as the milk allergen. In Search you can hide recipes with a chosen allergen.',alIn:'Found in the recipes:',
  sgH:'Sugar and caffeine',cfP:d=>d.caffeine+' recipes with caffeine show the caffeine per serving next to Tami\u2019s daily limit of '+d.cafLimit+' mg.',sgLink:'Source: WHO',
  srcH:'Sources',srcP:'Recipes come only from approved sources, and each links to its original page. Recipes per source:',
  fH:'What you\u2019ll find here',
  feats:d=>[['Search','by name or ingredient, with filters: chapter, dish type, country, level, time, allergens, healthy only, air fryer ('+d.airfryer+' recipes), not spicy.'],
   ['Healthy','recipes marked healthy by official nutrition rules (EU 1924/2006, WHO).'],['Countries','recipes by country of origin ('+d.countries+' countries and regions).'],
   ['Meal sets',d.meals+' meal sets: a main, a side, a sauce, an appetizer and a drink.'],['Seasonal','picks by seasonal produce and holidays.'],['Chefs','signature dishes, as named by the source itself.'],
   ['What can I make','tick what you have at home and see what you can cook with it.'],['Favourites and I cooked this','the heart and the stamp on a recipe; find them under Favourites.'],
   ['Cook mode','big steps one at a time, and the screen stays on while you cook.'],['Shopping list','click \u201cAdd to shopping list\u201d on a recipe; each ingredient links to the chosen store\u2019s search or offers page, where you check the price.'],
   ['Sharing between laptops','favourites, cooked recipes and the Joe chat are shared between laptops after you enter the password. Browsing never needs it.']],
  thH:'Looks',thP:'The \u201cLook\u201d button next to SK | EN picks one of 5 designs, each in 3 colours (15 options). Your choice is remembered.',
  joeH:'Joe · AI',joeP:'Joe · AI is an AI version of Joe, always labelled AI. It is not the real Joe typing. It runs right on the laptop, knows Tami\u2019s rules and the cookbook\u2019s recipes, remembers what you tell it, and can\u2019t browse the internet. Open it with the Joe button in the corner.'}};
function view(){const L=A.S.lang==='en'?'en':'sk',x=TX[L],d=D,des=A.S.design;const AL=(window.I18N&&I18N[L].al)||{};
  const sec=(k,h,body)=>'<section class="ab ab-'+k+'"><h2>'+esc(h)+'</h2>'+body+'</section>';
  const designs=(window.DESIGNS||[]).map(g=>'<li><b>'+esc(g[L])+'</b> <span>'+esc(g.lay[L])+'</span><small>'+g.pals.map(p=>esc(p[1])).join(' · ')+'</small></li>').join('');
  const body=
   sec('ver',x.verH,'<p>'+esc(x.verP)+'</p><ul class="abrules">'+x.rules(d).map(r=>'<li>'+esc(r)+'</li>').join('')+'</ul>')+
   sec('sp',x.spH,'<p>'+esc(x.spP(d))+'</p>')+
   sec('al',x.alH,'<p>'+esc(x.alP)+'</p><p class="abal"><span>'+esc(x.alIn)+'</span> '+d.allergens.map(a=>'<i>'+esc(AL[a]||a)+'</i>').join('')+'</p>')+
   sec('sg',x.sgH,'<p>'+esc(d.sugar[L])+' <a href="'+esc(d.sugar.url)+'" target="_blank" rel="noopener">'+esc(x.sgLink)+' ↗</a></p><p>'+esc(x.cfP(d))+'</p>')+
   sec('src',x.srcH,'<p>'+esc(x.srcP)+'</p><ul class="absrc">'+d.sources.map(s=>'<li><span>'+esc(s[0])+'</span><b>'+s[1]+'</b></li>').join('')+'</ul>')+
   sec('f',x.fH,'<dl class="abfeat">'+x.feats(d).map(f=>'<div><dt>'+esc(f[0])+'</dt><dd>'+esc(f[1])+'</dd></div>').join('')+'</dl>')+
   sec('th',x.thH,'<p>'+esc(x.thP)+'</p><ul class="abdes">'+designs+'</ul>')+
   sec('joe',x.joeH,'<p>'+esc(x.joeP)+'</p><button class="btn" data-joeopen>'+esc(L==='sk'?'Otvoriť Joe · AI':'Open Joe · AI')+'</button>');
  return '<section class="sec about about-'+des+'"><div class="wrap"><header class="abhead"><span class="kicker">'+esc(x.kick)+'</span><h1>'+esc(x.h)+'</h1><p class="lead">'+esc(x.lead(d))+'</p></header><div class="abgrid">'+body+'</div></div></section>';}
window.TamiAbout={init(o){A=o;},load,view};
})();
