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
   ['Uložené v tomto notebooku','obľúbené, uvarené recepty, chaty s Joeom a jeho pamäť sa ukladajú len v prehliadači na tomto notebooku a nikam sa neposielajú.']],
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
   ['Saved on this laptop','favourites, cooked recipes, the Joe chats and his memory are kept only in the browser on this laptop and are never sent anywhere.']],
  thH:'Looks',thP:'The \u201cLook\u201d button next to SK | EN picks one of 5 designs, each in 3 colours (15 options). Your choice is remembered.',
  joeH:'Joe · AI',joeP:'Joe · AI is an AI version of Joe, always labelled AI. It is not the real Joe typing. It runs right on the laptop, knows Tami\u2019s rules and the cookbook\u2019s recipes, remembers what you tell it, and can\u2019t browse the internet. Open it with the Joe button in the corner.'}};

// "What the labels mean": label text is taken from I18N (the exact words on the site), explanation in plain words
const LBL={
 sk:{h:'Čo znamenajú štítky',p:'Všetky štítky a označenia na stránke, jednoducho vysvetlené.',
  groups:[
  ['Recept',[
   [t=>t.tamiV+' / '+t.origV,'Prepínač pri recepte: Tamina verzia je upravená podľa Taminých pravidiel, Originál je recept tak, ako ho uvádza zdroj.'],
   [t=>t.own,'Úprava v Taminej verzii, ktorú som urobil sám (Jarvis), nie zdroj.'],
   [t=>t.sourced,'Úprava prevzatá zo zdroja; hneď vedľa je odkaz, odkiaľ pochádza.'],
   [t=>t.joeTag,'Úprava, o ktorej rozhodol Joe.'],
   [t=>t.notesSrc,'Poznámky, ktoré k receptu píše samotný zdroj.'],
   [t=>t.catTip.tip+' · '+t.catTip['common mistake']+' · '+t.catTip['useful note'],'Krátka rada zo zdroja, ktorú rozpráva mačka: tip, častá chyba, ktorej sa treba vyhnúť, alebo užitočná poznámka.'],
   [t=>t.levels.Basic+' / '+t.levels.Advanced,'Úroveň receptu: základný alebo pokročilý.'],
   [t=>t.flavors+' · '+t.flavor+' · '+t.mainRecipe,'Ďalšie chute toho istého receptu; Hlavný recept je základná verzia.'],
   [t=>t.scaled,'Zobrazí sa, keď zmeníš počet porcií: množstvá sa prepočítali.']]],
  ['Pálivé, laktóza, fritéza, zdravé',[
   [t=>'🌶 '+t.spicy+' + '+t.spicyNote,'Jedlo, pri ktorom je pálivosť podstatou jedla. Pálivosť zostáva ako v origináli a upozornenie to pripomenie.'],
   [t=>t.mild,'Nepovinná jemnejšia možnosť priamo v surovinách, napríklad menej čili alebo jeho vynechanie.'],
   [t=>t.notSpicy,'Filter vo vyhľadávaní, ktorý skryje pálivé jedlá.'],
   [t=>t.lowLac,'Zriedkavé recepty, v ktorých zostal syr alebo mliečny výrobok s prirodzene nízkym obsahom laktózy; poznámka pri recepte vysvetlí, čo s tým.'],
   [t=>t.af,'Recept má aj možnosť prípravy v teplovzdušnej fritéze, prevzatú zo zdroja.'],
   [t=>t.healthyBadge,'Zdravý recept podľa oficiálnych výživových pravidiel (EÚ 1924/2006, WHO).']]],
  ['Alergény, cukor, kofeín, výživa',[
   [t=>t.allergens,'Ktoré zo 14 alergénov EÚ recept obsahuje. „'+'Žiadny zo 14 alergénov'+'“ znamená, že sa nenašiel ani jeden.'],
   [t=>t.sugarShort+' · '+t.ofMax+' · '+t.ofIdeal,'Koľko z denného sprievodcu cukrom (WHO) zaberie jedna porcia Taminej verzie. Ak sa voľné cukry nedali vypočítať, je uvedený celkový cukor a štítok to povie.'],
   [t=>t.caffeine+' · '+t.limitNote,'Pri nápojoch s kofeínom: koľko kofeínu má porcia (podľa USDA) v porovnaní s Taminým denným limitom.'],
   [t=>t.nutrition+' · '+t.perServ+' / '+t.per100,'Odhad výživových hodnôt z databáz Ciqual, USDA a Open Food Facts; ak sa nedali priradiť všetky suroviny, je to pri recepte napísané.'],
   [t=>t.claims,'Výživové tvrdenia podľa nariadenia EÚ 1924/2006, napríklad „vysoký obsah bielkovín“.']]],
  ['Krajiny, menu, sezóna, šéfkuchári',[
   [t=>t.coSource+' · '+t.coSourceN(3),'Pôvod jedla uvádza samotný zdroj (s citátom a odkazom). Číslo hovorí, pri koľkých receptoch krajiny to tak je.'],
   [t=>t.coOwn,'Pôvod som určil sám (Jarvis), lebo zdroj ho neuvádza.'],
   [t=>t.coDisputed,'Pôvod jedla je sporný, napríklad si ho nárokuje viac krajín.'],
   [t=>t.mealSrc+' · '+t.mealSrcN(1),'V menu: spojenie jedál, ktoré odporúča samotný zdroj receptu. Číslo ukazuje, koľko takých spojení menu má.'],
   [t=>t.mealPick,'V menu: spojenie, ktoré som vybral sám (Jarvis), nie zdroj.'],
   [t=>t.pictured,'Pri menu: ktoré jedlo je na fotke, ak to nie je hlavné jedlo.'],
   [t=>t.szIn,'Ovocie a zelenina v sezóne na Slovensku v tomto mesiaci (podľa sezónnych kalendárov).'],
   [t=>t.szHolP,'Môj tip na recept k sviatku v daný deň.'],
   [t=>t.szState+' / '+t.szRest,'Štátny sviatok alebo iný sviatok podľa slovenského zákona; „'+'deň pracovného pokoja'+'“ znamená voľno, inak je napísané, že voľno nie je.'],
   [t=>t.chefs,'Jedlá, ktoré samotný zdroj označuje za podpisové jedlo šéfkuchára.']]],
  ['Obľúbené, varenie, nákup, Joe',[
   [t=>t.favOn+' ♥ · '+t.cookedAdd+' · '+t.cookedRibbon,'Srdiečko pridá recept k obľúbeným, pečiatka „Uvarila som“ si zapamätá dátum; na kartičke potom svieti stužka Uvarené.'],
   [t=>t.cook,'Veľké kroky jeden po druhom; štítok ukáže, či obrazovka zostane zapnutá.'],
   [t=>t.fridgeHave+' · '+t.fridgeMiss,'V časti Z chladničky: čo máš doma a čo ti k receptu ešte chýba.'],
   [()=>'Tesco · Lidl · BILLA · Kaufland · COOP Jednota','Farebné názvy obchodov v nákupnom zozname (žiadne logá). Pri každom je, čo odkaz otvorí: vyhľadávanie, akciovú ponuku, leták, alebo pri neznámom obchode mapu OpenStreetMap.'],
   [()=>'autom / vzdušnou čiarou','Vzdialenosť obchodu: pri domácej oblasti autom (približne), pri tvojej polohe vzdušnou čiarou.'],
   [()=>'⚑','Vybraný obchod nemá online vyhľadávanie výrobkov; navrhne sa najbližší obchod, ktorý ho má.'],
   [()=>'Joe · AI','AI verzia Joea. Štítok AI pripomína, že nepíše skutočný Joe.']]]],
  mealsH:'Menu a kapitola Raňajky',mealsP:'Kapitola Raňajky je zoznam receptov na raňajky. Menu je celé zostavené jedlo (raňajky, obed alebo večera) z viacerých kapitol: hlavné jedlo, príloha, omáčka, predjedlo a nápoj.',
  szH:'Ako sa mení Sezónne',szP:'Mesiac sa berie z dátumu na tvojom notebooku, takže stránka sa mení sama. Dátum Veľkej noci a sviatkov, ktoré od nej závisia, sa každý rok vypočíta. Zoznam sviatkov zodpovedá súčasnému slovenskému zákonu.'},
 en:{h:'What the labels mean',p:'Every label and tag on the site, in plain words.',
  groups:[
  ['Recipe',[
   [t=>t.tamiV+' / '+t.origV,'The switch on a recipe: Tami\u2019s version is adjusted to her rules, Original is the recipe as its source gives it.'],
   [t=>t.own,'A change in Tami\u2019s version that I (Jarvis) made myself, not the source.'],
   [t=>t.sourced,'A change taken from a source; the link next to it shows where it comes from.'],
   [t=>t.joeTag,'A change Joe decided on.'],
   [t=>t.notesSrc,'Notes the recipe\u2019s own source gives.'],
   [t=>t.catTip.tip+' · '+t.catTip['common mistake']+' · '+t.catTip['useful note'],'A short tip from the source, told by the cat: a tip, a common mistake to avoid, or a useful note.'],
   [t=>t.levels.Basic+' / '+t.levels.Advanced,'The recipe\u2019s level.'],
   [t=>t.flavors+' · '+t.flavor+' · '+t.mainRecipe,'Other flavours of the same recipe; Main recipe is the basic version.'],
   [t=>t.scaled,'Shown when you change the servings: the amounts have been recalculated.']]],
  ['Spicy, lactose, air fryer, healthy',[
   [t=>'🌶 '+t.spicy+' + '+t.spicyNote,'A dish where the heat is the point of the dish. The heat stays as in the original, and the warning says so.'],
   [t=>t.mild,'An optional milder option right in the ingredients, such as less chilli or leaving it out.'],
   [t=>t.notSpicy,'A Search filter that hides spicy dishes.'],
   [t=>t.lowLac,'The few recipes that keep a cheese or dairy product that is naturally low in lactose; the note on the recipe explains what to do.'],
   [t=>t.af,'The recipe also has an air-fryer option, taken from a source.'],
   [t=>t.healthyBadge,'Healthy by official nutrition rules (EU 1924/2006, WHO).']]],
  ['Allergens, sugar, caffeine, nutrition',[
   [t=>t.allergens,'Which of the 14 EU allergens the recipe contains. \u201cNone of the 14 allergens\u201d means none was found.'],
   [t=>t.sugarShort+' · '+t.ofMax+' · '+t.ofIdeal,'How much of the WHO daily sugar guide one serving of Tami\u2019s version uses. Where free sugars couldn\u2019t be worked out, total sugars are shown and the label says so.'],
   [t=>t.caffeine+' · '+t.limitNote,'On drinks with caffeine: the caffeine per serving (from USDA) next to Tami\u2019s daily limit.'],
   [t=>t.nutrition+' · '+t.perServ+' / '+t.per100,'Estimated from the Ciqual, USDA and Open Food Facts databases; if not every ingredient could be matched, the recipe says so.'],
   [t=>t.claims,'Nutrition claims under EU Regulation 1924/2006, such as \u201chigh in protein\u201d.']]],
  ['Countries, meal sets, seasonal, chefs',[
   [t=>t.coSource+' · '+t.coSourceN(3),'The dish\u2019s origin is stated by its own source (with a quote and a link). The number says for how many of a country\u2019s recipes that is the case.'],
   [t=>t.coOwn,'I (Jarvis) classified the origin myself, because the source doesn\u2019t state it.'],
   [t=>t.coDisputed,'The dish\u2019s origin is disputed, for example several countries claim it.'],
   [t=>t.mealSrc+' · '+t.mealSrcN(1),'In meal sets: a pairing the recipe\u2019s own source suggests. The number shows how many such pairings the set has.'],
   [t=>t.mealPick,'In meal sets: a pairing I (Jarvis) picked myself, not the source.'],
   [t=>t.pictured,'On a meal set: which dish the photo shows, when it isn\u2019t the main dish.'],
   [t=>t.szIn,'Fruit and vegetables in season in Slovakia this month (from seasonal calendars).'],
   [t=>t.szHolP,'My recipe pick for a holiday on that day.'],
   [t=>t.szState+' / '+t.szRest,'A public holiday or another holiday under Slovak law; \u201cday off\u201d means a day off work, otherwise the page says it isn\u2019t one.'],
   [t=>t.chefs,'Dishes the source itself names as the chef\u2019s signature.']]],
  ['Favourites, cooking, shopping, Joe',[
   [t=>t.favOn+' ♥ · '+t.cookedAdd+' · '+t.cookedRibbon,'The heart adds a recipe to favourites; the \u201cI cooked this\u201d stamp remembers the date, and the card then shows a Cooked ribbon.'],
   [t=>t.cook,'Big steps one at a time; a label shows whether the screen will stay on.'],
   [t=>t.fridgeHave+' · '+t.fridgeMiss,'In What can I make: what you have at home and what a recipe still needs.'],
   [()=>'Tesco · Lidl · BILLA · Kaufland · COOP Jednota','Coloured store names in the shopping list (no logos). Each shows what its link opens: a search, the offers, a leaflet, or for an unknown shop an OpenStreetMap map.'],
   [()=>'by car / straight line','Store distance: by car (approximate) for the home area, straight line from your location.'],
   [()=>'⚑','The chosen store has no online product search; the nearest store that has one is suggested.'],
   [()=>'Joe · AI','An AI version of Joe. The AI label is a reminder that it isn\u2019t the real Joe typing.']]]],
  mealsH:'Meal sets vs the Breakfast chapter',mealsP:'The Breakfast chapter is a list of breakfast recipes. A meal set is a whole meal (breakfast, lunch or dinner) put together from several chapters: a main, a side, a sauce, an appetizer and a drink.',
  szH:'How Seasonal updates',szP:'The month comes from the date on your laptop, so the page changes by itself. Easter, and the holidays that depend on it, are worked out for each year. The holiday list follows the current Slovak law.'}};
function labels(L){const x=LBL[L],t=window.I18N[L];
  return '<section class="ab ab-lbl"><h2>'+esc(x.h)+'</h2><p>'+esc(x.p)+'</p>'+x.groups.map(g=>'<h3>'+esc(g[0])+'</h3><dl class="ablbl">'+g[1].map(i=>'<div><dt><span class="ablab">'+esc(i[0](t))+'</span></dt><dd>'+esc(i[1])+'</dd></div>').join('')+'</dl>').join('')+
   '<h3>'+esc(x.mealsH)+'</h3><p>'+esc(x.mealsP)+'</p><h3>'+esc(x.szH)+'</h3><p>'+esc(x.szP)+'</p></section>';}
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
   labels(L)+
   sec('joe',x.joeH,'<p>'+esc(x.joeP)+'</p><button class="btn" data-joeopen>'+esc(L==='sk'?'Otvoriť Joe · AI':'Open Joe · AI')+'</button>');
  return '<section class="sec about about-'+des+'"><div class="wrap"><header class="abhead"><span class="kicker">'+esc(x.kick)+'</span><h1>'+esc(x.h)+'</h1><p class="lead">'+esc(x.lead(d))+'</p></header><div class="abgrid">'+body+'</div></div></section>';}
window.TamiAbout={init(o){A=o;},load,view};
})();
