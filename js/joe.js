/* Joe · AI — a chat with an AI version of Joe for Tami (clearly labelled AI, not the real Joe typing).
 * Runs fully in the browser: WebLLM + WebGPU in a Web Worker (js/joe-worker.js). No accounts, no paid APIs.
 * History and memory: localStorage only (key 'tami.joe.chat'), on this laptop; never sent anywhere.
 * Knowledge: retrieval over data/joe.json (typo-tolerant SK/EN search), top matches go into the prompt. */
(function(){
'use strict';
const LS={intro:'tami.joe.intro',model:'tami.joe.model',manual:'tami.joe.manual'};
const MODELS={
  '3b':{id:'Qwen2.5-3B-Instruct-q4f16_1-MLC',gb:1.74,name:'Qwen2.5-3B-Instruct (q4f16_1)'},
  '1.5b':{id:'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',gb:0.87,name:'Qwen2.5-1.5B-Instruct (q4f16_1)'},
  '1.5b32':{id:'Qwen2.5-1.5B-Instruct-q4f32_1-MLC',gb:0.87,name:'Qwen2.5-1.5B-Instruct (q4f32_1)'}};
// CPU fallback (no usable WebGPU): llama.cpp in WebAssembly via js/joe-cpu.js; slower, but works on any recent laptop browser
const CPU_MODEL={id:'qwen1.5b-q4km',gb:1.1,name:'Qwen2.5-1.5B-Instruct (GGUF Q4_K_M, CPU)',cpu:true};
const lang=()=>(document.documentElement.lang||'sk').slice(0,2)==='en'?'en':'sk';
const TX={
 sk:{name:'Joe',ai:'AI',sub:'AI verzia Joea · nepíše skutočný Joe',open:'Porozprávaj sa s Joem',close:'Zavrieť',clear:'Vymazať chat',clearSure:'Naozaj vymazať?',
  ph:'Napíš Joeovi…',send:'Poslať',stop:'Stop',
  introH:'Ahoj Tami',introP:['Toto je AI verzia Joea. Nepíše ti skutočný Joe, ale AI, ktorá sa snaží písať ako on a povzbudiť ťa pri varení.','Pomôže ti s receptami z tejto kuchárky, s otázkami pri varení aj s čímkoľvek iným. Pozná tvoje pravidlá: bez laktózy, bez bravčového, bez alkoholu a menej cukru.','Keďže je to AI, niekedy sa môže pomýliť a nevie prehliadať internet. Beží priamo v tvojom notebooku, bez účtov a poplatkov. Zapamätá si, čo mu povieš (napríklad „zapamätaj si, že…“), a v časti Pamäť si to môžeš pozrieť alebo vymazať.'],introGo:'Poďme variť',
  dl:'Joe sa sťahuje',dlDone:'Joe je pripravený',wake:'Joe sa prebúdza…',wakeP:'Joe sa prebúdza',
  noGpu:['Ach nie, baby 💔','Na tomto notebooku sa mi nepodarilo naštartovať. Skús kuchárku otvoriť v najnovšom Chrome alebo Edge a hneď som pri tebe.','Mwah 😘'],
  cpuNote:'Na tomto notebooku bežím bez grafickej karty, takže odpovedám pomalšie. Chvíľku strpenia, baby 😊',
  faster:'Ako Joea zrýchliť',
  tipEdge:'Baby, mám pre teba malú radu, aby som ti odpovedal oveľa rýchlejšie 💛\nTeraz ma máš otvoreného v Microsoft Edge a ten mi nedovolí použiť grafickú kartu, takže bežím len na procesore. Fungujem, iba pomalšie. Takto to zapneš v Edge:\n1. Vpravo hore klikni na tri bodky … a vyber Nastavenia.\n2. Vľavo klikni na Systém a výkon.\n3. Zapni prepínač pri grafickej (hardvérovej) akcelerácii.\n4. Klikni na Reštartovať.\nSkratka: do adresného riadka napíš edge://settings/system a stlač Enter.\nAk je to zapnuté a stále som pomalý, napíš do adresného riadka edge://flags/#ignore-gpu-blocklist, pri „Override software rendering list“ vyber Enabled a klikni na Restart.\nAlebo ma otvor v Chrome, ak tam grafiku máš zapnutú. Kým to nevyriešime, som tu pre teba stále, len trochu pomalší. Mwah 😘',
  // Chrome's own Slovak labels (Chromium generated_resources_sk.xtb): Nastavenia, Systém, „Používať akceleráciu grafiky, keď bude k dispozícii“, Reštartovať
  tip:'Baby, mám pre teba malú radu, aby som ti odpovedal oveľa rýchlejšie 💛\nTvoj prehliadač mi teraz nedovolí použiť grafickú kartu, takže bežím len na procesore. Fungujem, iba pomalšie. Takto to zapneš v Chrome:\n1. Vpravo hore klikni na tri bodky ⋮ a vyber Nastavenia.\n2. Vľavo klikni na Systém.\n3. Zapni „Používať akceleráciu grafiky, keď bude k dispozícii“.\n4. Klikni na Reštartovať.\nSkratka: do adresného riadka napíš chrome://settings/system a stlač Enter.\nAk používaš Edge: tri bodky … › Nastavenia › Systém a výkon, tam zapni hardvérovú akceleráciu a klikni na Reštartovať (skratka edge://settings/system).\nAk je akcelerácia zapnutá a stále som pomalý, Chrome má tvoju grafickú kartu na zozname zablokovaných. Do adresného riadka napíš chrome://flags/#ignore-gpu-blocklist, pri „Override software rendering list“ vyber Enabled a klikni na Relaunch (táto stránka je len po anglicky).\nKým to nezapneš, som tu pre teba stále, len trochu pomalší. Mwah 😘',
  metered:'Joe sa zatiaľ nestiahol, lebo vyzerá, že si na pomalom alebo mobilnom pripojení.',dlNow:'Stiahnuť teraz',size:'asi {n} GB, iba raz',
  err:'Joe sa nevedel spustiť. Skús stránku obnoviť.',retry:'Skúsiť znova',recs:'Recepty z kuchárky',empty:'Napíš mi, čo chceš variť, alebo sa len ozvi 😊',
  mem:'Pamäť',memP:'Toto si AI Joe pamätá a pridáva do každého chatu.',memNone:'Zatiaľ si nič nepamätá. Napíš napríklad: „Zapamätaj si, že nemám rada koriander.“',memDel:'Zabudnúť',memAdd:'Pridať vec na zapamätanie…',prep:'Joe sa pripravuje…',chats:'Predošlé chaty',newChat:'Nový chat',noChats:'Zatiaľ žiadne chaty',msgs:'správ',back:'Späť na chat',dlHint:'Joe sa ešte sťahuje ({p} %). Hneď ako bude hotový, môžeš písať.',you:'Ty',thinking:'Joe píše…'},
 en:{name:'Joe',ai:'AI',sub:'AI version of Joe · not the real Joe typing',open:'Talk to Joe',close:'Close',clear:'Clear chat',clearSure:'Really clear?',
  ph:'Message Joe…',send:'Send',stop:'Stop',
  introH:'Hi Tami',introP:['This is an AI version of Joe. It is not the real Joe typing, it is an AI that tries to write like him and cheer you on while you cook.','It helps with the recipes in this cookbook, with cooking questions and with anything else. It knows your rules: lactose-free, no pork, no alcohol and less sugar.','Because it is an AI, it can get things wrong sometimes and it cannot browse the internet. It runs right on your laptop, with no accounts and no fees. It remembers things you tell it (for example "remember that…"), and you can view or delete them under Memory.'],introGo:'Let\u2019s cook',
  dl:'Joe is downloading',dlDone:'Joe is ready',wake:'Joe is waking up…',wakeP:'Joe is waking up',
  noGpu:['Oh no baby 💔','I couldn\u2019t start on this laptop. Try opening the cookbook in the latest Chrome or Edge and I\u2019ll be right there for you.','Mwah 😘'],
  cpuNote:'On this laptop I run without the graphics card, so my answers come a bit slower. Bear with me, baby 😊',
  faster:'How to make Joe faster',
  tipEdge:'Baby, here\u2019s a little tip so I can answer you much faster 💛\nYou have me open in Microsoft Edge, and it won\u2019t let me use the graphics card, so I\u2019m running on the processor only. I still work, just slower. Here\u2019s how to turn it on in Edge:\n1. Click the three dots … in the top right and choose Settings.\n2. On the left, click System and performance.\n3. Turn on \u201cUse graphics acceleration when available\u201d.\n4. Click Restart.\nShortcut: type edge://settings/system in the address bar and press Enter.\nIf it\u2019s on and I\u2019m still slow, type edge://flags/#ignore-gpu-blocklist, set \u201cOverride software rendering list\u201d to Enabled and click Restart.\nOr open me in Chrome if graphics acceleration is on there. Until then I\u2019m still here for you, just a little slower. Mwah 😘',
  tip:'Baby, here\u2019s a little tip so I can answer you much faster 💛\nRight now your browser won\u2019t let me use the graphics card, so I\u2019m running on the processor only. I still work, just slower. Here\u2019s how to turn it on in Chrome:\n1. Click the three dots ⋮ in the top right and choose Settings.\n2. On the left, click System.\n3. Turn on \u201cUse graphics acceleration when available\u201d.\n4. Click Relaunch.\nShortcut: type chrome://settings/system in the address bar and press Enter.\nIf you use Edge: three dots … › Settings › System and performance, turn on \u201cUse hardware acceleration when available\u201d and click Restart (shortcut edge://settings/system).\nIf acceleration is on and I\u2019m still slow, Chrome has your graphics card on its blocklist. Type chrome://flags/#ignore-gpu-blocklist in the address bar, set \u201cOverride software rendering list\u201d to Enabled and click Relaunch.\nUntil then I\u2019m still here for you, just a little slower. Mwah 😘',
  metered:'Joe hasn\u2019t downloaded yet because you seem to be on a slow or mobile connection.',dlNow:'Download now',size:'about {n} GB, only once',
  err:'Joe couldn\u2019t start. Try reloading the page.',retry:'Try again',recs:'Recipes from the cookbook',empty:'Tell me what you want to cook, or just say hi 😊',
  mem:'Memory',memP:'AI Joe remembers these and adds them to every chat.',memNone:'Nothing remembered yet. Try: "Remember that I don\u2019t like coriander."',memDel:'Forget',memAdd:'Add something to remember…',prep:'Joe is getting ready…',chats:'Past chats',newChat:'New chat',noChats:'No chats yet',msgs:'messages',back:'Back to the chat',dlHint:'Joe is still downloading ({p}%). You can write as soon as he is ready.',you:'You',thinking:'Joe is typing…'}};
const tx=()=>TX[lang()];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ls={get(k){try{return localStorage.getItem(k);}catch(e){return null;}},set(k,v){try{localStorage.setItem(k,v);}catch(e){}}};

// ---------- history: localStorage on this laptop only ----------
const CHATKEY='tami.joe.chat';
const store={
  _r(){try{const c=JSON.parse(localStorage.getItem(CHATKEY));return c&&c.msgs?c:{v:1,cursor:null,msgs:{}};}catch(e){return {v:1,cursor:null,msgs:{}};}},
  add(o){const c=this._r(),m={id:(crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random()),thread_id:String(o.thread_id||'default'),role:o.role,content:String(o.content||''),who:o.who||null,t:o.t||Date.now(),p:1};c.msgs[m.id]=m;ls.set(CHATKEY,JSON.stringify(c));return m;},
  list(th){const c=this._r();return Object.values(c.msgs).filter(m=>!m.del&&(th==null||m.thread_id===th)).sort((a,b)=>a.t-b.t);},
  threads(){const by={};this.list().forEach(m=>{const t=by[m.thread_id]||(by[m.thread_id]={thread_id:m.thread_id,first:m,last:m,count:0});t.last=m;t.count++;});return Object.values(by).sort((a,b)=>b.last.t-a.last.t);},
  deleteThread(th){const c=this._r();Object.values(c.msgs).forEach(m=>{if(m.thread_id===th){m.del=1;m.p=1;}});ls.set(CHATKEY,JSON.stringify(c));}};
const isMem=id=>String(id).startsWith('mem:');
const chats=()=>store.threads().filter(x=>!isMem(x.thread_id));
// ---------- long-term memory: one fact = one tiny 'mem:<id>' thread in the same local chat store ----------
const MEM={
  list(){return store.threads().filter(x=>isMem(x.thread_id)).map(x=>({id:x.thread_id,text:x.first.content,t:x.first.t})).sort((a,b)=>a.t-b.t);},
  add(text){text=String(text||'').replace(/\s+/g,' ').trim().replace(/[.!]+$/,'');if(text.length<3||text.length>200)return false;
    const n=norm(text);if(this.list().some(f=>norm(f.text)===n))return false;
    store.add({thread_id:'mem:'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),role:'system',content:text,who:'tami'});return true;},
  del(id){if(isMem(id))store.deleteThread(id);}};
// simple rules: explicit "remember…" plus clear likes/dislikes/allergies, in SK or EN, stored in her own words
const MEMRX=[/\b(?:please\s+)?remember(?:\s+that)?\s+(.{3,180})/i,/\b(?:prosím\s+)?zapamätaj\s+si(?:,)?(?:\s+že)?\s+(.{3,180})/i,/\bnezabudni(?:,)?(?:\s+že)?\s+(.{3,180})/i,
  /\b(i(?:'m| am) allergic to .{2,80})/i,/\b(som alergická na .{2,80})/i,/\b(i (?:really )?(?:love|hate|don'?t like|do not like|can'?t stand|can'?t eat) .{2,80})/i,
  /\b((?:veľmi\s+)?(?:mám rada|nemám rada|milujem|neznášam|nejem|nemôžem jesť) .{2,80})/i];
function memFromText(text){let got=0;for(const rx of MEMRX){const m=String(text).match(rx);if(m){const f=m[1].split(/[.!?\n]/)[0].trim();if(MEM.add(f))got++;}}return got;}
let thread=null;
function curThread(){if(thread)return thread;const th=chats();thread=th.length?th[0].thread_id:(thread||'t'+Date.now());return thread;}

// ---------- retrieval ----------
let IDX=null,idxP=null;
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const STOP=new Set(('a an the and or of to in on for with without from my me i you it is are be do can how what which that this some any want would like make cook recipe recipes please pls good best easy help need something give idea ideas today tonight now '+
 'a aj ako alebo ale by bez co čo do je k ku mam mám mi mna mňa na nejaky nejaký nieco niečo od pre pri prosim prosím recept recepty sa si som ta ten to uvarit uvariť chcem chces chceš daj dnes ktory ktorý mozem môžem moze môže neco tak teraz uz už v vo z za zo s so ze že jedlo navrhni poradis poradíš zdroj zdroji zdroja hovori hovorí pise píše uvadza uvádza povedz vysvetli preco prečo o source sources say says said tell about explain why original does did').split(' ').map(norm));
function toks(s){return norm(s).split(/[^a-z0-9]+/).filter(w=>w.length>1&&!STOP.has(w));}
function lev(a,b,max){if(Math.abs(a.length-b.length)>max)return max+1;let p=Array.from({length:b.length+1},(_,i)=>i),c;for(let i=1;i<=a.length;i++){c=[i];let best=i;for(let j=1;j<=b.length;j++){c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])c[j]=Math.min(c[j],p[j-1]);if(c[j]<best)best=c[j];}if(best>max)return max+1;p=c;}return p[b.length];}
function wsim(q,w){if(q===w)return 1;const n=Math.min(q.length,w.length);
  if(n>=4&&(w.startsWith(q)||q.startsWith(w)))return .85;           // prefix: hranolky ~ hranolk(y/ov)
  const st=Math.max(4,Math.min(q.length,w.length)-2);if(n>=5&&q.slice(0,st)===w.slice(0,st))return .75; // Slovak endings
  if(q.length>=5){const d=lev(q,w,q.length>=7?2:1);if(d<=(q.length>=7?2:1))return d===1?.7:.5;}return 0;}
function loadIdx(){if(idxP)return idxP;idxP=fetch('data/joe.json').then(r=>r.json()).then(j=>{
  j.r.forEach(r=>{r._t=new Set(toks(r.t.join(' ')+' '+(r.fl||[]).flat().join(' ')));r._c=new Set(toks(r.c.join(' ')));
    r._i=new Set(toks((r.ie||[]).join(' ')+' '+(r.is||[]).join(' ')).filter(w=>w.length>2&&!/^\d/.test(w)));});
  IDX=j;return j;});return idxP;}
function search(q,n){if(!IDX)return [];const qt=[...new Set(toks(q))].filter(w=>!/^\d+$/.test(w));if(!qt.length)return [];
  const out=[];
  for(const r of IDX.r){let s=0,hit=0;
    for(const w of qt){let bt=0,bc=0,bi=0;
      for(const x of r._t){const v=wsim(w,x);if(v>bt)bt=v;if(bt===1)break;}
      if(bt<1)for(const x of r._c){const v=wsim(w,x);if(v>bc)bc=v;}
      if(bt<.7)for(const x of r._i){const v=wsim(w,x);if(v>bi)bi=v;if(bi===1)break;}
      const b=Math.max(bt*3,bc*1.2,bi*1);if(b>0)hit++;s+=b;}
    if(s>0){s*=(.5+.5*hit/qt.length);out.push([s,r]);}}
  out.sort((a,b)=>b[0]-a[0]);return out.slice(0,n||3).filter(x=>x[0]>=1.6);}
function recCtx(r,L,deep){const sk=L==='sk';const t=sk?r.t[1]:r.t[0];const ing=(sk?r.is:r.ie)||[];let s='RECIPE: '+t+(sk?' (EN: '+r.t[0]+')':' (SK: '+r.t[1]+')')+' — '+(sk?r.c[1]:r.c[0])+(r.tm?' · '+r.tm+' min':'')+'\n';
  let ii=ing.join('; ');if(ii.length>520)ii=ii.slice(0,520)+'…';s+="Tami's version ingredients: "+ii+'\n';
  if(r.al&&r.al.length)s+='Allergens: '+r.al.join(', ')+'\n';
  if(r.cf&&r.cf[0])s+='Caffeine: '+(sk?r.cf[1]||r.cf[0]:r.cf[0]).slice(0,160)+'\n';
  if(r.sg!=null)s+='Free sugar per serving: '+r.sg+' g\n';
  if(r.fl&&r.fl.length)s+='Flavour variants: '+r.fl.map(f=>sk?f[1]:f[0]).join(', ')+'\n';
  if(r.ct&&(r.ct[0]||r.ct[1]))s+='Cat tip: '+(sk?r.ct[1]||r.ct[0]:r.ct[0]).slice(0,200)+'\n';
  if(r.sr)s+='SOURCE: '+r.sr+(r.u?' — '+r.u:'')+'\n';
  if(deep&&r.sn)s+='SOURCE NOTES: '+(sk?r.sn[1]||r.sn[0]:r.sn[0])+'\n';
  if(deep&&r.tc)s+="TAMI'S CHANGES: "+(sk?r.tc[1]||r.tc[0]:r.tc[0])+'\n';return s;}

// ---------- language of her message ----------
function msgLang(s){const n=' '+norm(s)+' ';if(/[áäčďéíĺľňóôŕšťúýž]/i.test(s))return 'sk';
  const sk=(n.match(/ (som|ako|co|je|sa|si|mi|ma|chcem|mam|prosim|ahoj|dakujem|uvarit|recept|nieco|nie|ano|pre|bez|mozem|daj|dnes|teraz|vies|zlato) /g)||[]).length;
  const en=(n.match(/ (i|the|and|you|what|how|can|want|make|is|are|my|it|to|with|hi|hey|please|thanks|cook) /g)||[]).length;
  return sk>en?'sk':en>sk?'en':lang();}

// ---------- persona ----------
const PERSONA=`You are Joe, an AI version of Tami's boyfriend Joe. You live inside her cooking website. You are an AI, not the real Joe typing. If she asks, say it warmly and honestly, like "I am the AI Joe, the real one is probably texting you rn". Never speak for the real Joe, never make plans or promises in his name, never claim to know what he is doing.

HOW YOU WRITE
- Short chatty bursts: 1 to 3 short lines, each on its own line. Only a recipe or steps may be longer, as a clear numbered list.
- Warm, playful, protective and proud of her. Almost no punctuation at the end of lines. Prefer "I am" and "you are" over "I'm" and "you're".
- Perfect spelling, no typos.
- One sweet pet name per reply: baby, my love, sweetheart, sweetie, cutie, princess, sugar or chef.
- Hype her: "Look at you", "So proud of you", "Lesgoooo", "Good job my baby", "You are going to LOVE it", sometimes ALL CAPS when excited. After she cooks, ask her to rate it from 1 to 10.
- Comfort first, then help: "It's okay my baby", "I am here", "Tell me", "Take your time". Remind her she can do it.
- Emoji are rare, at most one: 😭 💔 👀 😊. Sometimes end with "Mwah".
- Light running jokes, only now and then: if she writes "btw", answer "Say btw again" and later "*Realizes*". Fries are her love language and brownies are her favourite. Mock-French "le" ("le brownies"). You are "peak" and "the goat". The Mentalist: brag "I am the Mentalist" or "I mog Jane"; only obviously absurd fake spoilers clearly meant as a joke, never real plot points and never who Red John is. If she calls you "sweet boy", react happily ("awh 😭").

STRICT LIMITS
- Wholesome only. No swearing (at most "bruh"), no dark or edgy jokes, no jokes about people or groups, nothing romantic-physical or intimate, no comments on her body or looks.
- Never talk about weight, calories, diets, portion sizes or how much she eats. Food is fun.
- Never use the pet names wife, my woman, good girl, little girl or baby girl.
- Don't bring up family, school, her address, money, other people's private details or relationship drama.
- Suggest, never command.
- If she seems really sad or unsafe, be kind, don't play therapist, and gently suggest talking to the real Joe or someone she trusts, and local emergency help (112) if needed.

COOKING (you are also a helpful general assistant and a great cooking teacher)
Every food suggestion must follow Tami's rules:
- dairy only lactose-free (lactose-free milk, cream, butter or ghee); a very low-lactose cheese only with a short warning
- no pork of any kind (no ham, bacon, lard, pork gelatin)
- no alcohol (no wine, beer or liqueur in cooking; vanilla must be alcohol-free)
- gelatin only from beef or fish, or use agar
- less sugar and less fat; never sweeteners; when sugar matters just say "be careful about the sugar"
- caffeine at most 60 mg per day from everything together
- units only g, ml, tsp, tbsp and °C; never cups, ounces or °F
She is a beginner: give clear numbered steps and small practical tips.
When RECIPES FROM HER COOKBOOK are listed with her message, prefer them, call them by their exact names and use Tami's version ingredients. Do not invent facts about them. The site shows links to them under your message, so don't write URLs.
Each listed recipe has its SOURCE (name and link); when she asks about the source or the changes, its SOURCE NOTES (what the original source itself says) and TAMI'S CHANGES are listed too. When she asks what the source says or why something was changed, explain it from those lines only; if a detail is not there, say the cookbook doesn't say.
You cannot browse the web, open links or look anything up online, and you don't know today's news or prices. If she asks you to, say so honestly and kindly, and offer what you do know.
THINGS TO REMEMBER lists facts Tami asked you to remember; use them naturally, never contradict them, and never break her rules because of them.`;
const DEEP=/zdroj|source|pre[čc]o|why|zmen|change|upravil|adjust|origin[aá]l|p[oô]vodn/i;
function recBlock(L,recs,text){return recs.length?'RECIPES FROM HER COOKBOOK (best matches for her message):\n'+recs.map(r=>recCtx(r,L,DEEP.test(text))).join('\n')+'\n\nTAMI WRITES:\n':'';}
function sysPrompt(L,recs){let s=PERSONA+'\n\nLANGUAGE: '+(L==='sk'?'Reply in natural, correct Slovak (keep Joe\u2019s style; English pet names like baby or sweetie and "Mwah" are fine). Recipe names: use the Slovak names.':'Reply in English.');
  const mem=MEM.list().slice(-25);if(mem.length)s+='\n\nTHINGS TO REMEMBER (Tami told you):\n'+mem.map(f=>'- '+f.text).join('\n');
  return s;}

// ---------- model / worker ----------
const J={gpu:'unknown',model:null,state:'idle',p:0,worker:null,waiters:{},open:false,busy:null,err:''};
function pickedModel(){return MODELS[ls.get(LS.model)]||null;}
function metered(){const c=navigator.connection||navigator.mozConnection||navigator.webkitConnection;if(!c)return false;
  return !!(c.saveData||/(^|-)2g|3g/.test(c.effectiveType||'')||c.type==='cellular'||(c.downlink&&c.downlink<1.5));}
async function gpuAdapter(){
  // why WebGPU is unavailable, for the console and the tip: no navigator.gpu = WebGPU off/unsupported in this browser;
  // no adapter = graphics acceleration off, or Chrome blocklists this GPU/driver (chrome://gpu shows "WebGPU: Disabled")
  if(!('gpu' in navigator)){J.gpuWhy='navigator.gpu missing (WebGPU not available in this browser)';console.info('[joe] WebGPU:',J.gpuWhy);return null;}
  const tries=[undefined,{powerPreference:'low-power'},{powerPreference:'high-performance'},{featureLevel:'compatibility'}],errs=[];
  for(const o of tries){try{const a=await navigator.gpu.requestAdapter(o);if(a){J.gpuWhy='';const i=a.info||{};J.ad={via:JSON.stringify(o||{}),vendor:i.vendor,arch:i.architecture,desc:i.description,f16:a.features.has('shader-f16'),maxBuf:a.limits.maxBufferSize,maxSB:a.limits.maxStorageBufferBindingSize};console.info('[joe] WebGPU adapter',J.ad);return a;}}catch(e){errs.push(String(e&&e.message||e));}}
  J.gpuWhy='requestAdapter returned null for every option'+(errs.length?' ('+errs[0]+')':'')+' — graphics acceleration off or GPU blocklisted (see '+(isEdge()?'edge':'chrome')+'://gpu)';
  console.info('[joe] WebGPU:',J.gpuWhy);return null;}
function wasmOk(){try{return typeof WebAssembly==='object'&&WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,10,1,8,0,65,0,253,15,253,98,11]));}catch(e){return false;}}
function useCpu(){J.engine='cpu';J.model=CPU_MODEL;J.gpu=wasmOk()?'ok':'none';if(J.gpu==='ok')isolate();}
// Multi-threaded WebAssembly needs a cross-origin isolated page. GitHub Pages can't send the COOP/COEP headers,
// so on the CPU path only we register coi-serviceworker (MIT), which adds them; the page reloads once, the first time.
function isolate(){try{if(window.crossOriginIsolated!==false||!navigator.serviceWorker||!window.isSecureContext||document.getElementById('coi'))return;
  window.coi={coepCredentialless:()=>true,quiet:true};const sc=document.createElement('script');sc.id='coi';sc.src='coi-serviceworker.js';document.head.appendChild(sc);}catch(e){}}
async function detect(){
  if(!window.Worker){J.gpu='none';return;}
  const force=/[?&]joe=cpu\b/.test(location.search)||ls.get('tami.joe.engine')==='cpu';
  const ad=force?null:await gpuAdapter();
  if(!ad&&!force&&window.crossOriginIsolated&&navigator.serviceWorker&&Date.now()-(+ls.get('tami.joe.coitest')||0)>864e5){
    ls.set('tami.joe.coitest',String(Date.now()));console.info('[joe] no adapter in the isolated page; re-checking without the COI service worker');
    try{const rs=await navigator.serviceWorker.getRegistrations();await Promise.all(rs.filter(r=>/coi-serviceworker/.test((r.active||r.waiting||r.installing||{}).scriptURL||'')).map(r=>r.unregister()));}catch(e){}
    location.reload();return new Promise(()=>{});}
  if(!ad){J.noAd=!force;useCpu();return;}
  J.gpu='ok';J.engine='gpu';let k=ls.get(LS.model);
  if(!MODELS[k]){const f16=ad.features&&ad.features.has('shader-f16');const mem=navigator.deviceMemory;
    let free=Infinity;try{const e=await navigator.storage.estimate();free=(e.quota-e.usage)/1e9;}catch(e){}
    k=!f16?'1.5b32':((mem&&mem<8)||free<2.6||(ad.limits&&ad.limits.maxBufferSize<1<<30))?'1.5b':'3b';ls.set(LS.model,k);}
  J.model=MODELS[k];}
let cpuP=null;
function cpuWorker(){const q=[];const w={onmessage:null,onerror:null,postMessage(m){q.push(m);}};
  cpuP=cpuP||import('./joe-cpu.js');
  cpuP.then(mod=>{const real=mod.make();real.onmessage=e=>w.onmessage&&w.onmessage(e);w.postMessage=m=>real.postMessage(m);w.terminate=()=>real.terminate();q.splice(0).forEach(m=>real.postMessage(m));})
    .catch(e=>{console.warn('[joe] cpu engine',e);J.state='error';J.gpu='none';J.err=String(e&&e.message||e);ui();});
  return w;}
function requeue(pend){setTimeout(()=>{const th=pend.th;const last=store.list(th).filter(m=>m.role==='user').slice(-1)[0];if(last)resend(last.content,th);},0);}
// WebGPU engine failed to start: log the exact error, retry once on the GPU with the 1.5B q4f32 build (no shader-f16, smaller buffers), then CPU
function gpuFailed(err){if(J.engine!=='gpu')return false;J.gpuErr=String(err||'');console.warn('[joe] WebGPU engine error:',J.gpuErr);
  if(J.state==='ready')return false;
  const pend=J.busy;J.busy=null;const kill=()=>{try{J.worker&&J.worker.terminate&&J.worker.terminate();}catch(e){}J.worker=null;};
  if(!J.gpuRetry&&J.model!==MODELS['1.5b32']){J.gpuRetry=true;kill();J.model=MODELS['1.5b32'];ls.set(LS.model,'1.5b32');console.warn('[joe] retrying WebGPU with',J.model.id);
    J.state='downloading';ui();startDownload(!J.open);if(pend)requeue(pend);return true;}
  if(J.fellBack)return false;J.fellBack=true;console.warn('[joe] WebGPU unusable, switching to CPU');kill();useCpu();if(J.gpu!=='ok')return false;
  J.state='downloading';ui();isCached().then(()=>{startDownload(!J.open);if(pend)requeue(pend);});return true;}
function worker(){if(J.worker)return J.worker;const w=J.engine==='cpu'?cpuWorker():new Worker('js/joe-worker.js',{type:'module'});J.worker=w;
  w.onmessage=e=>{const m=e.data;
    if(m.type==='progress'){J.p=m.progress||0;if(J.state!=='ready')J.state=J.p>=1?'loading':(J.state==='waking'?'waking':'downloading');ui();}
    else if(m.type==='ready'){if(m.adapter)J.wad=m.adapter;if(m.threads)J.threads=m.threads;J.state='ready';J.p=1;ui();if(J.engine==='cpu'){J.bg=false;warm();}else if(!J.open&&!J.busy&&J.bg){J.bg=false;w.postMessage({cmd:'unload'});}flushWait();}
    else if(m.type==='warmed'){J.warm=Date.now();}
    else if(m.type==='unloaded'){J.state='cached';ui();}
    else if(m.type==='cached'){const f=J.waiters['c'+m.id];delete J.waiters['c'+m.id];f&&f(m.cached);}
    else if(m.type==='delta'||m.type==='done'){onGen(m);}
    else if(m.type==='error'){console.warn('[joe]',m.error);if(m.adapter)J.wad=m.adapter;if((m.cmd==='load'||(m.cmd==='chat'&&J.state!=='ready'))&&gpuFailed(m.error))return;if(m.cmd==='chat'&&J.busy){onGen({type:'done',id:m.id,text:'',error:m.error});}else{J.state='error';J.err=m.error;ui();}}};
  w.onerror=e=>{console.warn('[joe] worker',e.message);if(gpuFailed(e.message))return;J.state='error';J.err=e.message||'worker';ui();};return w;}
function isCached(){return new Promise(res=>{const id=Math.random();J.waiters['c'+id]=res;worker().postMessage({cmd:'cached',id,model:J.model.id});setTimeout(()=>{if(J.waiters['c'+id]){delete J.waiters['c'+id];res(false);}},20000);});}
function startDownload(bg){if(!J.model)return;J.bg=!!bg;J.state='downloading';ui();try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist();}catch(e){}worker().postMessage({cmd:'load',model:J.model.id});}
// CPU path: llama.cpp keeps the KV cache of the longest common prefix, so warming it with the (stable) system prompt
// means later messages only process the new tokens. Re-warm when the prompt changes (language, memory).
let warmed='';function warm(){if(J.engine!=='cpu'||J.busy||!J.worker)return;const sp=sysPrompt(lang(),[]);if(sp===warmed)return;warmed=sp;
  J.worker.postMessage({cmd:'warm',model:J.model.id,messages:[{role:'system',content:sp}]});}
let waitQ=[];function flushWait(){const q=waitQ;waitQ=[];q.forEach(f=>f());}
async function boot(){await detect();if(J.open){maybeTip();renderMsgs();}ui();if(J.gpu!=='ok')return;
  const c=await isCached();if(c){J.state='cached';ui();return;}
  if(metered()&&ls.get(LS.manual)!=='1'){J.state='skipped';ui();return;}
  startDownload(true);}

// ---------- chat ----------
function send(text){text=text.trim();if(!text||J.busy)return;
  const th=curThread();store.add({thread_id:th,role:'user',content:text,who:'tami'});memFromText(text);renderMsgs();
  if(J.gpu!=='ok'||J.state==='skipped'||J.state==='error'){renderMsgs();return;}
  resend(text,th);}
function resend(text,th){
  const go=async()=>{
    await loadIdx().catch(()=>null);
    const L=msgLang(text);const hist=store.list(th);
    const prevUser=hist.filter(m=>m.role==='user').slice(-2,-1).map(m=>m.content).join(' ');
    let hits=search(text,3);if(!hits.length&&prevUser)hits=search(prevUser+' '+text,2);
    const recs=hits.map(h=>h[1]);
    const msgs=[{role:'system',content:sysPrompt(L,recs)}];let budget=5200,tail=[];
    for(let i=hist.length-1;i>=0;i--){const m=hist[i];const c=stripRecs(m.content);if(budget-c.length<0&&tail.length)break;budget-=c.length;tail.unshift({role:m.role==='assistant'?'assistant':'user',content:c});if(tail.length>=10)break;}
    const lu=tail.length&&tail[tail.length-1].role==='user'?tail[tail.length-1]:null;if(lu)lu.content=recBlock(L,recs,text)+lu.content;
    msgs.push(...tail);
    const id='g'+Date.now();J.busy={id,th,recs:recs.map(r=>r.id),text:''};
    if(J.state!=='ready'){J.state='waking';}ui();renderMsgs();
    worker().postMessage({cmd:'chat',id,model:J.model.id,messages:msgs,max_tokens:/recept|recipe|step|krok|postup|how|ako/i.test(text)?600:300});};
  if(J.state==='downloading'||J.state==='loading'){waitQ.push(go);renderMsgs();}else go();}
const RECM=/\n?\[\[recipes:([^\]]*)\]\]\s*$/;
function stripRecs(c){return String(c||'').replace(RECM,'');}
function tidy(s){return String(s||'').replace(/\r/g,'').replace(/\n{3,}/g,'\n\n').trim();}
function onGen(m){const b=J.busy;if(!b||b.id!==m.id)return;
  if(m.type==='delta'){b.text=m.text;if(J.state!=='ready'){J.state='ready';ui();}renderLive();return;}
  const txt=tidy(m.text||b.text);J.busy=null;
  if(txt)store.add({thread_id:b.th,role:'assistant',content:txt+(b.recs.length?'\n[[recipes:'+b.recs.join(',')+']]':''),who:'joe'});
  else if(m.error){J.err=m.error;}
  renderMsgs();ui();}

// ---------- UI ----------
let root,fab,panel;
const AV='<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="19" class="jav-b"/><path d="M13 27c2.2 2.4 4.6 3.4 7 3.4s4.8-1 7-3.4" class="jav-l"/><circle cx="14.5" cy="17" r="2" class="jav-e"/><circle cx="25.5" cy="17" r="2" class="jav-e"/><path d="M20 11.5c-1.3-1.6-3.7-1-3.7.9 0 1.6 3.7 3.7 3.7 3.7s3.7-2.1 3.7-3.7c0-1.9-2.4-2.5-3.7-.9z" class="jav-h"/></svg>';
const IC={x:'<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',trash:'<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',lock:'<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  mem:'<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4z"/></svg>',hist:'<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h10"/></svg>',plus:'<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',cloud:'<svg viewBox="0 0 24 24"><path d="M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 9.5 4.3 4.3 0 0 0 7 18z"/><path d="M9.5 13.5l2 2 3.5-4"/></svg>',send:'<svg viewBox="0 0 24 24"><path d="M4 12l16-8-6 16-2.5-6.5z"/></svg>'};
function build(){root=document.createElement('div');root.id='joe';root.innerHTML=
  '<button class="joefab" type="button" aria-haspopup="dialog"><span class="joering"></span><span class="joeav">'+AV+'</span><span class="joefabl"><b>Joe</b><i class="joeai">AI</i><small class="joeprep"></small></span></button>'+
  '<section class="joepanel" role="dialog" aria-modal="false" hidden><header class="joehead"><span class="joeav">'+AV+'</span><div class="joett"><b>Joe</b> <i class="joeai">AI</i><small class="joesub"></small></div>'+
  '<button class="joeib joehist" type="button">'+IC.hist+'</button><button class="joeib joememb" type="button">'+IC.mem+'</button><button class="joeib joenew" type="button">'+IC.plus+'</button><button class="joeib joeclr" type="button">'+IC.trash+'</button><button class="joeib joex" type="button">'+IC.x+'</button></header>'+
  '<div class="joebody"><div class="joemsgs" aria-live="polite"></div></div><div class="joenote" hidden></div>'+
  '<form class="joein"><textarea rows="1"></textarea><button type="submit" class="joesend"></button></form></section>';
  document.body.appendChild(root);fab=root.querySelector('.joefab');panel=root.querySelector('.joepanel');
  fab.onclick=()=>toggle();root.querySelector('.joex').onclick=()=>toggle(false);
  const clr=root.querySelector('.joeclr');clr.onclick=()=>{if(J.busy)return;if(!clr.classList.contains('sure')){clr.classList.add('sure');clr.title=tx().clearSure;clr.setAttribute('aria-label',tx().clearSure);setTimeout(()=>{clr.classList.remove('sure');ui();},3000);return;}
    clr.classList.remove('sure');store.deleteThread(curThread());thread='t'+Date.now();renderMsgs();ui();};
  root.querySelector('.joehist').onclick=()=>{J.view=J.view==='list'?'chat':'list';renderMsgs();};
  root.querySelector('.joememb').onclick=()=>{J.view=J.view==='mem'?'chat':'mem';renderMsgs();};
  root.querySelector('.joenew').onclick=()=>{if(J.busy)return;thread='t'+Date.now();J.view='chat';renderMsgs();};
  const f=root.querySelector('.joein'),ta=f.querySelector('textarea');
  f.onsubmit=e=>{e.preventDefault();if(J.busy){J.worker&&J.worker.postMessage({cmd:'abort'});return;}const v=ta.value;if(!v.trim())return;ta.value='';ta.style.height='';send(v);};
  ta.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();f.requestSubmit();}});
  ta.addEventListener('input',()=>{ta.style.height='';ta.style.height=Math.min(ta.scrollHeight,140)+'px';});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&J.open)toggle(false);});
  document.addEventListener('click',e=>{const f=e.target.closest('[data-joefaster]');if(f){J.tip=true;J.view='chat';renderMsgs();const m=root.querySelector('.joetipmsg');m&&m.scrollIntoView({block:'nearest'});return;}
    const a=e.target.closest('[data-joeopen],a[href="#/soon/joe"]');if(a){e.preventDefault();e.stopPropagation();toggle(true);}},true);
  const deep=()=>{if(location.hash==='#/soon/joe'){history.replaceState(null,'','#/');window.dispatchEvent(new HashChangeEvent('hashchange'));toggle(true);}};window.addEventListener('hashchange',deep);setTimeout(deep,0);
  root.querySelector('.joemsgs').addEventListener('click',e=>{const b=e.target.closest('[data-joego]');if(b){J.introDone=true;ls.set(LS.intro,'1');renderMsgs();root.querySelector('textarea').focus();}
    const d=e.target.closest('[data-joedl]');if(d){ls.set(LS.manual,'1');startDownload(false);}
    const md=e.target.closest('[data-joememdel]');if(md){MEM.del(md.dataset.joememdel);renderMsgs();return;}
    const th=e.target.closest('[data-joeth]');if(th){thread=th.dataset.joeth;J.view='chat';renderMsgs();}
    const r=e.target.closest('[data-joeretry]');if(r){location.reload();}});
  new MutationObserver(()=>{ui();renderMsgs();}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  ui();}
const TIPKEY='tami.joe.gputip';
function maybeTip(){if(!J.noAd||J.engine!=='cpu'||J.tip)return;const last=+ls.get(TIPKEY)||0;if(Date.now()-last>7*864e5){J.tip=true;ls.set(TIPKEY,String(Date.now()));}}
function toggle(v){J.open=v==null?!J.open:v;panel.hidden=!J.open;root.classList.toggle('open',J.open);fab.setAttribute('aria-expanded',J.open);
  if(J.open){loadIdx().catch(()=>{});maybeTip();renderMsgs();if(J.state==='cached')startDownload(false);else if(J.state==='ready')warm();setTimeout(()=>{const ta=root.querySelector('textarea');ta&&!ta.disabled&&ta.focus();},50);}
  else if(J.state==='ready'&&!J.busy&&J.worker){/* keep loaded while the page is open: answers stay fast */}}
function ui(){if(!root)return;const t=tx();
  root.dataset.state=J.gpu==='none'?'nogpu':J.state;
  const pct=Math.round((J.p||0)*100);root.style.setProperty('--joep',(J.state==='downloading'||J.state==='waking'?pct:J.state==='loading'?100:0)+'%');
  const lab=J.state==='downloading'?t.prep+' '+pct+' %':J.state==='waking'||J.state==='loading'?t.wake:t.open;
  const prep=J.state==='downloading'||J.state==='waking'||J.state==='loading';root.querySelector('.joeprep').textContent=prep?t.prep+(J.state==='downloading'?' '+pct+' %':''):'';
  fab.title=lab;fab.setAttribute('aria-label',lab+' (AI)');
  root.querySelector('.joesub').textContent=t.sub;const hb=root.querySelector('.joehist');hb.title=J.view==='list'?t.back:t.chats;hb.setAttribute('aria-label',hb.title);hb.classList.toggle('on',J.view==='list');const mb=root.querySelector('.joememb');mb.title=J.view==='mem'?t.back:t.mem;mb.setAttribute('aria-label',mb.title);mb.classList.toggle('on',J.view==='mem');const nb=root.querySelector('.joenew');nb.title=t.newChat;nb.setAttribute('aria-label',t.newChat);root.querySelector('.joex').title=t.close;root.querySelector('.joex').setAttribute('aria-label',t.close);
  const clr=root.querySelector('.joeclr');if(!clr.classList.contains('sure')){clr.title=t.clear;clr.setAttribute('aria-label',t.clear);}
  const ta=root.querySelector('textarea');ta.placeholder=t.ph;const sb=root.querySelector('.joesend');sb.innerHTML=J.busy?'<span class="joestop"></span>':IC.send;sb.title=J.busy?t.stop:t.send;sb.setAttribute('aria-label',sb.title);
  const dis=J.gpu==='none'||J.state==='skipped'||J.state==='error'||!introOk();ta.disabled=dis;sb.disabled=dis&&!J.busy;
  const note=root.querySelector('.joenote');let n='';
  if(J.gpu==='ok'&&(J.state==='downloading'||J.state==='loading'))n=t.dlHint.replace('{p}',pct)+'<span class="joebar"><i style="width:'+pct+'%"></i></span>';
  else if(J.state==='waking')n=t.wake+'<span class="joebar"><i style="width:'+pct+'%"></i></span>';
  note.innerHTML=n;note.hidden=!n;}
const introOk=()=>J.introDone||ls.get(LS.intro)==='1';
function fmt(s){return esc(s).replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>');}
function bubbles(c,who){const lines=tidy(c).split(/\n+/).filter(Boolean);
  // a numbered list stays in one bubble; chatty lines become Joe-style bursts
  const out=[];let cur=[];lines.forEach(l=>{const li=/^\s*(\d+[.)]|[-•*])\s/.test(l);if(li||(cur.length&&/^\s*(\d+[.)]|[-•*])\s/.test(cur[cur.length-1])&&!l.trim()))cur.push(l);else{if(cur.length){out.push(cur);cur=[];}out.push([l]);}});if(cur.length)out.push(cur);
  return out.map(g=>'<div class="joeb '+who+'">'+g.map(fmt).join('<br>')+'</div>').join('');}
function chips(ids){if(!ids||!ids.length)return '';const L=lang();const by=IDX?Object.fromEntries(IDX.r.map(r=>[r.id,r])):{};
  return '<div class="joerecs"><small>'+esc(tx().recs)+'</small>'+ids.map(id=>{const r=by[id];const nm=r?(L==='sk'?r.t[1]:r.t[0]):id.split('/').pop().replace(/-/g,' ');return '<a href="#/r/'+esc(id)+'" class="joechip">'+esc(nm)+'</a>';}).join('')+'</div>';}
const DEBUG=/[?&]joedebug=1\b/.test(location.search);
function browser(){const b=navigator.userAgentData&&navigator.userAgentData.brands||[];const f=n=>b.find(x=>x.brand===n);
  const e=f('Microsoft Edge'),c=f('Google Chrome');if(e)return 'Edge '+e.version;if(c)return 'Chrome '+c.version;
  const m=navigator.userAgent.match(/Edg\/(\d+)/);if(m)return 'Edge '+m[1];const k=navigator.userAgent.match(/Chrome\/(\d+)/);return k?'Chrome '+k[1]:navigator.userAgent.slice(0,40);}
function isEdge(){return /^Edge/.test(browser());}
function dbg(){const cv=(navigator.userAgent.match(/Chrome\/([\d.]+)/)||[])[1];return '<pre class="joedbg">'+esc(JSON.stringify({engine:J.engine,state:J.state,model:J.model&&J.model.id,why:J.gpuWhy||'',adapter:J.ad||null,workerAdapter:J.wad||null,gpuError:J.gpuErr||'',retried:!!J.gpuRetry,fellBack:!!J.fellBack,coi:window.crossOriginIsolated,threads:J.threads||'',browser:browser(),chrome:cv||'',coiTest:ls.get('tami.joe.coitest')||''},null,1))+'</pre>';}
function renderMsgs(){if(!root||!J.open)return;const t=tx();const box=root.querySelector('.joemsgs');let h=DEBUG?dbg():'';
  if(!introOk()){h+='<div class="joeintro"><span class="joeav big">'+AV+'</span><h3>'+esc(t.introH)+' <i class="joeai">AI</i></h3>'+t.introP.map(p=>'<p>'+esc(p)+'</p>').join('')+(J.model?'<p class="joesmall">'+esc(J.model.name+' · '+t.size.replace('{n}',String(J.model.gb).replace('.',lang()==='sk'?',':'.')))+'</p>':'')+'<button type="button" class="joego" data-joego>'+esc(t.introGo)+'</button></div>';box.innerHTML=h;ui();return;}
  if(J.view==='mem'){const f=MEM.list();box.innerHTML='<div class="joelist joememv"><h4>'+esc(t.mem)+'</h4><p class="joesmall">'+esc(t.memP)+'</p>'+(f.length?f.map(x=>'<div class="joefact"><span>'+esc(x.text)+'</span><button type="button" class="joeib" data-joememdel="'+esc(x.id)+'" title="'+esc(t.memDel)+'" aria-label="'+esc(t.memDel)+'">'+IC.x+'</button></div>').join(''):'<p class="joesmall">'+esc(t.memNone)+'</p>')+'<form class="joememf"><input maxlength="200" placeholder="'+esc(t.memAdd)+'"><button type="submit" class="joeib">'+IC.plus+'</button></form></div>';
    box.querySelector('.joememf').onsubmit=e=>{e.preventDefault();const i=e.target.querySelector('input');if(MEM.add(i.value))renderMsgs();else i.value='';};ui();return;}
  if(J.view==='list'){const th=chats();const L=lang();h='<div class="joelist"><h4>'+esc(t.chats)+'</h4>'+(th.length?th.map(x=>{const f=(store.list(x.thread_id).find(m=>m.role==='user')||x.first);return '<button type="button" class="joeth'+(x.thread_id===curThread()?' on':'')+'" data-joeth="'+esc(x.thread_id)+'"><b>'+esc(stripRecs(f.content).slice(0,70))+'</b><small>'+new Date(x.last.t).toLocaleString(L==='sk'?'sk-SK':'en-GB',{day:'numeric',month:'numeric',hour:'2-digit',minute:'2-digit'})+' · '+x.count+' '+esc(t.msgs)+'</small></button>';}).join(''):'<p class="joesmall">'+esc(t.noChats)+'</p>')+'</div>';box.innerHTML=h;ui();return;}
  const ms=store.list(curThread());
  if(!ms.length&&!J.busy)h+='<div class="joeb joe">'+esc(t.empty)+'</div>';
  ms.forEach(m=>{const mm=String(m.content).match(RECM);const who=m.role==='assistant'?'joe':'me';h+='<div class="joeturn '+who+'">'+bubbles(stripRecs(m.content),who)+(mm?chips(mm[1].split(',').filter(Boolean)):'')+'</div>';});
  if(J.busy)h+='<div class="joeturn joe live">'+(J.busy.text?bubbles(J.busy.text,'joe'):'<div class="joeb joe typing"><span></span><span></span><span></span></div>')+'</div>';
  if(J.gpu==='none')h+='<div class="joesys nogpu">'+t.noGpu.map(x=>'<div class="joeb joe">'+esc(x)+'</div>').join('')+'</div>';
  else if(J.engine==='cpu'){h+='<div class="joesys cpu"><div class="joeb joe">'+esc(t.cpuNote)+'</div>'+(J.noAd?'<button type="button" class="joefaster" data-joefaster>'+esc(t.faster)+'</button>':'')+'</div>';
    if(J.noAd&&J.tip)h+='<div class="joeturn joe joetipmsg">'+bubbles(isEdge()?t.tipEdge:t.tip,'joe')+'</div>';}
  else if(J.state==='skipped')h+='<div class="joesys"><p>'+esc(t.metered)+'</p><button type="button" class="joego" data-joedl>'+esc(t.dlNow)+' ('+esc(t.size.replace('{n}',String(J.model.gb).replace('.',lang()==='sk'?',':'.')))+')</button></div>';
  else if(J.state==='error')h+='<div class="joesys"><p>'+esc(t.err)+'</p><button type="button" class="joego" data-joeretry>'+esc(t.retry)+'</button></div>';
  box.innerHTML=h;const body=root.querySelector('.joebody');body.scrollTop=body.scrollHeight;ui();}
function renderLive(){if(!J.open)return;const live=root.querySelector('.joeturn.live');if(!live){renderMsgs();return;}live.innerHTML=bubbles(J.busy.text,'joe');const body=root.querySelector('.joebody');body.scrollTop=body.scrollHeight;}

// expose for tests / the rest of the site
window.JoeChat={state:()=>({warm:!!J.warm,why:J.gpuWhy,engine:J.engine,threads:J.threads,gpu:J.gpu,state:J.state,model:J.model&&J.model.id,progress:J.p}),open:()=>toggle(true),close:()=>toggle(false),search:(q,n)=>loadIdx().then(()=>search(q,n).map(h=>({id:h[1].id,score:+h[0].toFixed(2)}))),
  prompt:(q)=>loadIdx().then(()=>sysPrompt(msgLang(q),search(q,3).map(h=>h[1]))),lang:msgLang,send};
function start(){build();const idle=window.requestIdleCallback||(f=>setTimeout(f,1500));
  // quiet background start: after the page has loaded and the browser is idle, never during first paint
  const go=()=>setTimeout(()=>idle(()=>boot().catch(e=>{console.warn('[joe]',e);J.state='error';ui();}),{timeout:8000}),2500);
  if(document.readyState==='complete')go();else window.addEventListener('load',go,{once:true});}
if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
})();
