/* Kuchyna shared sync (favourites, cooked ribbons, 'Joe' chat) via Supabase.
 * Classic script: <script src="js/sync.js"></script> BEFORE js/app.js.
 * Exposes window.KuchynaSync. Offline-first: localStorage stays the source the
 * app reads; this module merges it two-way with Supabase whenever possible.
 *
 * Only public values live here. The URL and publishable (anon) key are meant to be
 * public; access is protected by Row Level Security + the shared account password,
 * which is NEVER stored in this file (the user types it once per laptop).
 */
(function () {
  'use strict';
  var CFG = {
    url: 'https://fplyvfuxbbdqipzqbudr.supabase.co',
    key: 'sb_publishable_6p6cu3Zo5WjVM0o8Tq2VKQ_LBYdCart',   // public publishable key
    email: 'kuchyna@kuchyna.example',                       // the one shared account
    lib: 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/+esm',
    keys: { fav: 'tami.fav', cooked: 'tami.cooked', chat: 'tami.joe.chat' },
    tables: { fav: 'favourites', cooked: 'cooked', chat: 'chat_messages' },
    meta: 'tami.sync.meta',          // shadow of last server state + dirty timestamps
    authKey: 'tami.sync.auth',       // supabase-js session storage key
    dismissKey: 'tami.sync.dismissed'
  };

  // ---------- tiny helpers ----------
  function lsRead(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function lsWrite(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function iso(t) { var d = new Date(t || Date.now()); return isNaN(d) ? new Date().toISOString() : d.toISOString(); }
  function ms(s) { var t = Date.parse(s); return isNaN(t) ? Date.now() : t; }
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    var b = crypto.getRandomValues(new Uint8Array(16)); b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
    var h = Array.prototype.map.call(b, function (x) { return (x + 256).toString(16).slice(1); }).join('');
    return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20);
  }
  function splitKey(k) { var i = k.indexOf('|'); return i < 0 ? [k, ''] : [k.slice(0, i), k.slice(i + 1)]; }
  function rowKey(r) { return r.flavor ? r.recipe_id + '|' + r.flavor : r.recipe_id; }
  function meta() { var m = lsRead(CFG.meta, {}); m.shadow = m.shadow || {}; m.dirty = m.dirty || {}; m.shadow.fav = m.shadow.fav || {}; m.shadow.cooked = m.shadow.cooked || {}; m.dirty.fav = m.dirty.fav || {}; m.dirty.cooked = m.dirty.cooked || {}; return m; }

  // ---------- events ----------
  var listeners = { change: [], status: [] };
  function emit(type, detail) {
    (listeners[type] || []).forEach(function (fn) { try { fn(detail); } catch (e) { console.error(e); } });
    try { window.dispatchEvent(new CustomEvent('kuchyna:' + type, { detail: detail })); } catch (e) {}
  }
  var status = 'locked';
  function setStatus(s, extra) { status = s; emit('status', Object.assign({ state: s }, extra || {})); }

  // ---------- client ----------
  var sb = null, session = null, channel = null;
  var ready = import(CFG.lib).then(function (mod) {
    sb = mod.createClient(CFG.url, CFG.key, {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: CFG.authKey, detectSessionInUrl: false }
    });
    sb.auth.onAuthStateChange(function (ev, s) {
      var had = !!session; session = s;
      if (!s) { stopRealtime(); setStatus('locked'); }
      else if (!had) { startRealtime(); schedule(0); }
    });
    return sb.auth.getSession().then(function (r) {
      session = r.data.session;
      if (session) { startRealtime(); return sync(); }
      setStatus('locked');
    });
  }).catch(function (e) { console.warn('[sync] supabase unavailable (offline?)', e); setStatus('offline'); });

  // ---------- favourites / cooked ----------
  function toRow(kind, k, v, deleted, updatedAt, count) {
    var p = splitKey(k);
    var r = { recipe_id: p[0], flavor: p[1], flavor_sk: (v && v.fl && v.fl.sk) || null, updated_at: iso(updatedAt), deleted: !!deleted };
    if (kind === 'fav') r.created_at = iso(v && v.t);
    else { r.cooked_at = iso(v && v.t); r.count = count; }
    return r;
  }
  function fromRow(kind, r) {
    return {
      t: ms(kind === 'fav' ? r.created_at : r.cooked_at),
      fl: r.flavor ? { en: r.flavor, sk: r.flavor_sk || r.flavor } : null,
      n: kind === 'cooked' ? r.count : undefined,
      u: ms(r.updated_at), del: r.deleted
    };
  }
  async function syncMarks(kind, m) {
    var table = CFG.tables[kind], lsKey = CFG.keys[kind];
    var local = lsRead(lsKey, {}) || {}, shadow = m.shadow[kind], dirty = m.dirty[kind], rows = [], now = Date.now();
    Object.keys(local).forEach(function (k) {
      var s = shadow[k];
      if (s && !s.del) return;                                 // already on server
      var n = (s && s.n || 0) + 1;                             // cooked again => count+1
      rows.push(toRow(kind, k, local[k], false, dirty[k] || local[k].t || now, n));
    });
    Object.keys(shadow).forEach(function (k) {
      var s = shadow[k];
      if (s.del || local[k]) return;
      rows.push(toRow(kind, k, { t: s.t, fl: s.fl }, true, dirty[k] || now, s.n || 0)); // removed locally => tombstone
    });
    if (rows.length) {
      var up = await sb.from(table).upsert(rows, { onConflict: 'recipe_id,flavor' });
      if (up.error) throw up.error;
    }
    var all = [], from = 0;
    for (;;) {
      var res = await sb.from(table).select('*').order('recipe_id').order('flavor').range(from, from + 999);
      if (res.error) throw res.error;
      all = all.concat(res.data); if (res.data.length < 1000) break; from += 1000;
    }
    var newShadow = {}, newLocal = {};
    all.forEach(function (r) {
      var k = rowKey(r), v = fromRow(kind, r); newShadow[k] = v;
      if (!r.deleted) { newLocal[k] = { t: v.t, fl: v.fl }; if (kind === 'cooked') newLocal[k].n = v.n; }
    });
    return { kind: kind, local: local, newLocal: newLocal, newShadow: newShadow };
  }

  // ---------- chat ----------
  // localStorage[CFG.keys.chat] = { v:1, cursor:'<iso>', msgs:{ id:{id,thread_id,role,content,who,t,del?,p?} } }
  // p = pending push. Messages are immutable; deleting marks del (tombstone).
  function chatRead() { var c = lsRead(CFG.keys.chat, null); if (!c || typeof c !== 'object' || !c.msgs) c = { v: 1, cursor: null, msgs: {} }; return c; }
  async function syncChat() {
    var c = chatRead(), pending = Object.keys(c.msgs).filter(function (id) { return c.msgs[id].p; }), changed = false;
    if (pending.length) {
      var rows = pending.map(function (id) { var x = c.msgs[id]; return { id: x.id, thread_id: x.thread_id, role: x.role, content: x.content, who: x.who || null, created_at: iso(x.t), deleted: !!x.del }; });
      for (var i = 0; i < rows.length; i += 500) {
        var up = await sb.from(CFG.tables.chat).upsert(rows.slice(i, i + 500), { onConflict: 'id' });
        if (up.error) throw up.error;
      }
    }
    var got = [], cursor = c.cursor;
    for (;;) {
      var q = sb.from(CFG.tables.chat).select('*').order('updated_at').order('id').limit(1000);
      if (cursor) q = q.gte('updated_at', cursor);   // gte + idempotent apply: never miss same-timestamp rows
      var res = await q; if (res.error) throw res.error;
      got = got.concat(res.data);
      if (res.data.length < 1000) break;
      var last = res.data[res.data.length - 1].updated_at;
      if (last === cursor) break; cursor = last;
    }
    // re-read in case the app wrote meanwhile, then apply
    var c2 = chatRead();
    pending.forEach(function (id) { var x = c2.msgs[id]; if (x && x.p) delete x.p; });
    got.forEach(function (r) {
      var x = c2.msgs[r.id];
      if (r.deleted) { if (x) { delete c2.msgs[r.id]; changed = true; } return; }
      if (x && x.p) return;
      if (!x || x.content !== r.content) changed = true;
      c2.msgs[r.id] = { id: r.id, thread_id: r.thread_id, role: r.role, content: r.content, who: r.who, t: ms(r.created_at) };
    });
    if (got.length) c2.cursor = got[got.length - 1].updated_at;
    Object.keys(c2.msgs).forEach(function (id) { var x = c2.msgs[id]; if (x.del && !x.p) delete c2.msgs[id]; });
    lsWrite(CFG.keys.chat, c2);
    return changed;
  }
  var chat = {
    key: CFG.keys.chat,
    /** add({thread_id, role, content, who}) -> message (stored locally at once, pushed in background) */
    add: function (o) {
      var c = chatRead(), m = { id: o.id || uuid(), thread_id: String(o.thread_id || 'default'), role: o.role || 'user', content: String(o.content || ''), who: o.who || null, t: o.t || Date.now(), p: 1 };
      c.msgs[m.id] = m; lsWrite(CFG.keys.chat, c); schedule(); return m;
    },
    list: function (threadId) {
      var c = chatRead();
      return Object.keys(c.msgs).map(function (k) { return c.msgs[k]; })
        .filter(function (m) { return !m.del && (threadId == null || m.thread_id === threadId); })
        .sort(function (a, b) { return a.t - b.t || (a.id < b.id ? -1 : 1); });
    },
    threads: function () {
      var by = {};
      chat.list().forEach(function (m) { var t = by[m.thread_id] || (by[m.thread_id] = { thread_id: m.thread_id, first: m, last: m, count: 0 }); t.last = m; t.count++; });
      return Object.keys(by).map(function (k) { return by[k]; }).sort(function (a, b) { return b.last.t - a.last.t; });
    },
    deleteThread: function (threadId) {
      var c = chatRead(); Object.keys(c.msgs).forEach(function (id) { var m = c.msgs[id]; if (m.thread_id === threadId) { m.del = 1; m.p = 1; } });
      lsWrite(CFG.keys.chat, c); schedule();
    }
  };

  // ---------- orchestration ----------
  var gen = 0, running = null, timer = null;
  function schedule(delay) {
    clearTimeout(timer);
    timer = setTimeout(function () { sync(); }, delay == null ? 700 : delay);
  }
  function sync() {
    if (running) { running.then(function () { schedule(); }); return running; }
    running = (async function () {
      if (!sb || !session) return;
      if (!navigator.onLine) { setStatus('offline'); return; }
      setStatus('syncing');
      try {
        for (var round = 0; round < 3; round++) {
          var g = gen, m = meta();
          var res = await Promise.all([syncMarks('fav', m), syncMarks('cooked', m)]);
          var chatChanged = await syncChat();
          if (g !== gen) continue;           // the user clicked something meanwhile: redo
          var kinds = [];
          res.forEach(function (r) {
            if (JSON.stringify(r.local) !== JSON.stringify(r.newLocal)) kinds.push(r.kind);
            lsWrite(CFG.keys[r.kind], r.newLocal);
            m.shadow[r.kind] = r.newShadow; m.dirty[r.kind] = {};
          });
          m.lastSync = Date.now(); lsWrite(CFG.meta, m);
          if (chatChanged) kinds.push('chat');
          if (kinds.length) emit('change', { kinds: kinds });
          break;
        }
        setStatus('synced', { at: Date.now() });
      } catch (e) {
        console.warn('[sync] failed, will retry', e);
        setStatus(navigator.onLine ? 'error' : 'offline', { error: String(e && e.message || e) });
        if (e && (e.code === 'PGRST301' || e.status === 401)) { /* expired: supabase-js refreshes */ }
        clearTimeout(timer); timer = setTimeout(sync, 30000);
      }
    })().finally(function () { running = null; });
    return running;
  }
  function startRealtime() {
    if (!sb || channel) return;
    channel = sb.channel('kuchyna-sync');
    ['favourites', 'cooked', 'chat_messages'].forEach(function (t) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table: t }, function () { schedule(400); });
    });
    channel.subscribe();
  }
  function stopRealtime() { if (channel && sb) { sb.removeChannel(channel); } channel = null; }

  window.addEventListener('online', function () { schedule(0); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) schedule(0); });
  setInterval(function () { if (!document.hidden) schedule(0); }, 5 * 60 * 1000);

  // ---------- unlock UI ----------
  var TXT = {
    sk: { title: 'Zdieľané obľúbené a história', body: 'Zadaj heslo, aby sa obľúbené recepty, uvarené jedlá a chat s Joem zdieľali medzi notebookmi. Stačí raz na tomto notebooku.', ph: 'Heslo', ok: 'Odomknúť', later: 'Neskôr', bad: 'Nesprávne heslo.', net: 'Nedá sa pripojiť. Skús znova.' },
    en: { title: 'Shared favourites & history', body: 'Enter the password to share favourites, cooked dishes and the Joe chat between laptops. Only once on this laptop.', ph: 'Password', ok: 'Unlock', later: 'Later', bad: 'Wrong password.', net: 'Can\u2019t connect. Try again.' }
  };
  function showUnlock() {
    return new Promise(function (resolve) {
      var old = document.getElementById('ksync-unlock'); if (old) old.remove();
      var t = TXT[(document.documentElement.lang || 'sk').slice(0, 2)] || TXT.sk;
      var w = document.createElement('div'); w.id = 'ksync-unlock';
      w.setAttribute('style', 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.45);font:inherit');
      w.innerHTML = '<form style="background:var(--surface,#fff);color:var(--text,#222);max-width:22rem;width:calc(100% - 2rem);padding:1.4rem;border-radius:14px;box-shadow:0 10px 40px rgba(0,0,0,.25)">' +
        '<h2 style="margin:0 0 .5rem;font-size:1.2rem;font-family:var(--fh,inherit)"></h2><p style="margin:0 0 1rem;font-size:.92rem;line-height:1.4"></p>' +
        '<input type="password" name="pw" autocomplete="current-password" required style="width:100%;box-sizing:border-box;padding:.6rem .7rem;font:inherit;border:1px solid var(--line,#bbb);border-radius:8px;background:var(--surface2,#fff);color:inherit">' +
        '<p class="ksync-err" role="alert" style="color:#b3261e;min-height:1.2em;margin:.4rem 0;font-size:.85rem"></p>' +
        '<div style="display:flex;gap:.5rem;justify-content:flex-end"><button type="button" data-later style="font:inherit;padding:.5rem .9rem;border-radius:8px;border:1px solid #bbb;background:transparent;color:inherit;cursor:pointer"></button>' +
        '<button type="submit" style="font:inherit;padding:.5rem .9rem;border-radius:8px;border:0;background:var(--accent,#2b6);color:var(--onaccent,#fff);cursor:pointer"></button></div></form>';
      w.querySelector('h2').textContent = t.title; w.querySelector('p').textContent = t.body;
      w.querySelector('input').placeholder = t.ph; w.querySelector('[data-later]').textContent = t.later;
      w.querySelector('[type=submit]').textContent = t.ok;
      var f = w.querySelector('form'), err = w.querySelector('.ksync-err');
      w.querySelector('[data-later]').onclick = function () { try { localStorage.setItem(CFG.dismissKey, '1'); } catch (e) {} w.remove(); resolve(false); };
      f.onsubmit = function (e) {
        e.preventDefault(); err.textContent = '';
        var btn = f.querySelector('[type=submit]'); btn.disabled = true;
        unlock(f.pw.value).then(function () { w.remove(); resolve(true); }, function (e2) {
          btn.disabled = false; err.textContent = (e2 && /invalid|credential/i.test(e2.message || '')) ? t.bad : t.net; f.pw.select();
        });
      };
      document.body.appendChild(w); setTimeout(function () { f.pw.focus(); }, 30);
    });
  }
  async function unlock(password) {
    await ready; if (!sb) throw new Error('offline');
    var r = await sb.auth.signInWithPassword({ email: CFG.email, password: String(password || '') });
    if (r.error) throw r.error;
    session = r.data.session; startRealtime(); await sync(); return true;
  }
  async function lock() { await ready; if (sb) await sb.auth.signOut({ scope: 'local' }); session = null; stopRealtime(); setStatus('locked'); }

  window.KuchynaSync = {
    ready: ready,
    /** call right after the app writes tami.fav / tami.cooked */
    changed: function (kind, key) {
      gen++;
      if ((kind === 'fav' || kind === 'cooked') && key) { var m = meta(); m.dirty[kind][key] = Date.now(); lsWrite(CFG.meta, m); }
      schedule();
    },
    sync: function () { return ready.then(sync); },
    isUnlocked: function () { return !!session; },
    status: function () { return status; },
    unlock: unlock, lock: lock, showUnlock: showUnlock,
    /** shows the unlock dialog once per laptop unless already unlocked or dismissed */
    autoPrompt: function () {
      return ready.then(function () { if (!session && sb && localStorage.getItem(CFG.dismissKey) !== '1') return showUnlock(); return !!session; });
    },
    on: function (type, fn) { (listeners[type] = listeners[type] || []).push(fn); return function () { listeners[type] = listeners[type].filter(function (f) { return f !== fn; }); }; },
    chat: chat,
    keys: CFG.keys
  };
})();
