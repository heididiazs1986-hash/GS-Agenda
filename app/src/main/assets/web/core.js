'use strict';
/* GS Agenda — núcleo (datos, cifrado, sincronización, plan) */

const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const Native = window.GSNative || null;
const IS_ANDROID = !!Native;
const MIN = 60000, HOUR = 3600000, DAY = 86400000;
const APP_VERSION = '2.0.0';
const AGENDA_FILE = 'gs-agenda.datos';
const INBOX_DIR = 'solicitudes';
const uid = () => 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const STATUS = { PENDING: 'Pendiente', IN_PROGRESS: 'En progreso', WAITING: 'En espera', COMPLETED: 'Completada' };
const STATUS_COLOR = { PENDING: 'var(--c-slate)', IN_PROGRESS: 'var(--c-indigo)', WAITING: 'var(--c-amber)', COMPLETED: 'var(--ok)' };
const PRIO = { HIGH: 'Alta', MEDIUM: 'Media', LOW: 'Baja' };
const PRIO_COLOR = { HIGH: 'var(--c-red)', MEDIUM: 'var(--c-amber)', LOW: 'var(--c-teal)' };
const PRIO_RANK = { HIGH: 0, MEDIUM: 1, LOW: 2 };
const REPEAT = { NONE: 'No se repite', DAILY: 'Cada día', WEEKLY: 'Cada semana', MONTHLY: 'Cada mes' };
const REMINDER_OPTS = [[0, 'A la hora'], [15, '15 min antes'], [30, '30 min antes'], [60, '1 hora antes'], [1440, '1 día antes']];
const DURATION_OPTS = [[15, '15 min'], [30, '30 min'], [60, '1 hora'], [90, '1 h 30 min'], [120, '2 horas'], [180, '3 horas'], [240, '4 horas'], [480, 'Todo el día']];

/* ---------- Fechas ---------- */
const startOfDay = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
const addDays = (t, n) => { const d = new Date(t); d.setDate(d.getDate() + n); return d.getTime(); };
const addMonths = (t, n) => { const d = new Date(t); const day = d.getDate(); d.setDate(1); d.setMonth(d.getMonth() + n); const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); d.setDate(Math.min(day, last)); return d.getTime(); };
const startOfWeek = t => { const d = new Date(startOfDay(t)); const wd = (d.getDay() + 6) % 7; return addDays(d.getTime(), -wd); };
const startOfMonth = t => { const d = new Date(t); return new Date(d.getFullYear(), d.getMonth(), 1).getTime(); };
const parseHM = s => { const [h, m] = String(s || '0:0').split(':').map(Number); return ((h || 0) * 60 + (m || 0)) * MIN; };
const pad = n => String(n).padStart(2, '0');
const toDateInput = t => { const d = new Date(t); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const toTimeInput = t => { const d = new Date(t); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const fromInputs = (date, time) => { const [y, mo, d] = date.split('-').map(Number); const [h, mi] = (time || '08:00').split(':').map(Number); return new Date(y, mo - 1, d, h, mi, 0, 0).getTime(); };

const fmtTime = t => { const d = new Date(t); let h = d.getHours(); const m = d.getMinutes(); const ap = h < 12 ? 'a. m.' : 'p. m.'; h = h % 12 || 12; return `${h}:${pad(m)} ${ap}`; };
const DOW = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const DOW_L = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MON = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MON_L = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const fmtDate = t => { const d = new Date(t); return `${DOW[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`; };
const fmtLongDate = t => { const d = new Date(t); return `${DOW_L[d.getDay()]} ${d.getDate()} de ${MON_L[d.getMonth()]}`; };
function fmtDue(t, now = Date.now()) {
  const d0 = startOfDay(now), td = startOfDay(t);
  const diff = Math.round((td - d0) / DAY);
  if (diff === 0) return `Hoy, ${fmtTime(t)}`;
  if (diff === 1) return `Mañana, ${fmtTime(t)}`;
  if (diff === -1) return `Ayer, ${fmtTime(t)}`;
  if (diff > 1 && diff < 7) return `${DOW_L[new Date(t).getDay()]}, ${fmtTime(t)}`;
  return `${fmtDate(t)}, ${fmtTime(t)}`;
}
function fmtAgo(t, now = Date.now()) {
  const m = Math.round((now - t) / MIN);
  if (m < 1) return 'hace un momento';
  if (m < 60) return `hace ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  return d === 1 ? 'hace 1 día' : `hace ${d} días`;
}
function overdueText(t, now = Date.now()) {
  const days = Math.floor((startOfDay(now) - startOfDay(t)) / DAY);
  if (days <= 0) return `Venció hoy a las ${fmtTime(t)}`;
  return days === 1 ? 'Venció ayer' : `Venció hace ${days} días`;
}

/* ---------- Estado ---------- */
const S = {
  state: null, code: null, keys: new Map(), salt: null, unlocked: false,
  sync: { status: 'off', label: 'Sin archivo conectado', last: 0, busy: false, dirty: false, name: '' },
  inbox: [], dir: null, needsReconnect: false,
};

function defaultSettings() {
  return { name: 'Heidi', planEnabled: true, planTime: '06:30', workStart: '07:00', workEnd: '17:00', theme: 'auto', lockMinutes: 5, updatedAt: 0 };
}
function defaultState() { return { v: 1, tasks: [], settings: defaultSettings(), inboxDone: [], updatedAt: Date.now() }; }

function normalizeTask(t) {
  const now = Date.now();
  return {
    id: String(t.id ?? uid()), title: String(t.title ?? '').trim() || 'Sin título', notes: String(t.notes ?? ''),
    category: String(t.category ?? '').trim(), dueAt: Number(t.dueAt) || now, durationMin: Number(t.durationMin) || 60,
    priority: PRIO[t.priority] ? t.priority : 'MEDIUM', status: STATUS[t.status] ? t.status : 'PENDING',
    repeatType: REPEAT[t.repeatType] ? t.repeatType : 'NONE',
    reminders: Array.isArray(t.reminders) ? [...new Set(t.reminders.map(Number).filter(n => n >= 0))] : [60, 30],
    sound: t.sound !== false, vibration: t.vibration !== false,
    subtasks: Array.isArray(t.subtasks) ? t.subtasks.map(s => ({ id: String(s.id ?? uid()), text: String(s.text ?? ''), done: !!s.done })) : [],
    source: t.source && typeof t.source === 'object' ? t.source : null,
    createdAt: Number(t.createdAt) || now, updatedAt: Number(t.updatedAt) || now,
    completedAt: t.completedAt ? Number(t.completedAt) : null, deleted: !!t.deleted, nextSpawned: t.nextSpawned || null,
  };
}
function normalizeState(s) {
  const base = defaultState();
  if (!s || typeof s !== 'object') return base;
  return {
    v: 1,
    tasks: Array.isArray(s.tasks) ? s.tasks.map(normalizeTask) : [],
    settings: Object.assign(defaultSettings(), s.settings || {}),
    inboxDone: Array.isArray(s.inboxDone) ? s.inboxDone.slice(-500) : [],
    updatedAt: Number(s.updatedAt) || Date.now(),
  };
}
const liveTasks = () => S.state.tasks.filter(t => !t.deleted);
const isOpen = t => t.status !== 'COMPLETED';
const isOverdue = (t, now = Date.now()) => isOpen(t) && t.dueAt < now;
const getTask = id => S.state.tasks.find(t => t.id === id);

function nextDue(t) {
  if (t.repeatType === 'DAILY') return addDays(t.dueAt, 1);
  if (t.repeatType === 'WEEKLY') return addDays(t.dueAt, 7);
  if (t.repeatType === 'MONTHLY') return addMonths(t.dueAt, 1);
  return null;
}
/* Crea la siguiente repetición de las tareas recurrentes ya completadas. Id determinista para no duplicar entre equipos. */
function ensureRecurrences() {
  let changed = false;
  const now = Date.now();
  for (const t of [...S.state.tasks]) {
    if (t.deleted || t.status !== 'COMPLETED' || t.repeatType === 'NONE' || t.nextSpawned) continue;
    const due = nextDue(t); if (!due) continue;
    const id = t.id.split('~')[0] + '~' + due;
    if (!getTask(id)) {
      S.state.tasks.push(normalizeTask({ ...t, id, dueAt: due, status: 'PENDING', completedAt: null, nextSpawned: null, createdAt: now, updatedAt: now,
        subtasks: t.subtasks.map(s => ({ ...s, done: false })) }));
    }
    t.nextSpawned = id; t.updatedAt = now; changed = true;
  }
  return changed;
}

/* ---------- Cifrado (AES-GCM con clave derivada por PBKDF2) ---------- */
const enc = new TextEncoder(), dec = new TextDecoder();
function b64(buf) { const a = new Uint8Array(buf); let s = ''; for (let i = 0; i < a.length; i += 0x8000) s += String.fromCharCode.apply(null, a.subarray(i, i + 0x8000)); return btoa(s); }
const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
function cryptoReady() { return !!(window.crypto && crypto.subtle); }
async function deriveKey(code, saltB64) {
  const cacheKey = saltB64 + '|' + code;
  if (S.keys.has(cacheKey)) return S.keys.get(cacheKey);
  const base = await crypto.subtle.importKey('raw', enc.encode(code), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: unb64(saltB64), iterations: 210000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  S.keys.set(cacheKey, key);
  return key;
}
const newSalt = () => b64(crypto.getRandomValues(new Uint8Array(16)));
async function sealWith(code, saltB64, obj) {
  const key = await deriveKey(code, saltB64);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(obj)));
  return { app: 'GS Agenda', v: 1, salt: saltB64, iv: b64(iv), data: b64(ct) };
}
async function openWith(code, env) {
  if (!env || !env.salt || !env.iv || !env.data) throw new Error('formato');
  const key = await deriveKey(code, env.salt);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(env.iv) }, key, unb64(env.data));
  return JSON.parse(dec.decode(pt));
}

/* ---------- Almacenamiento local ---------- */
const LS = {
  get(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { console.warn(e); } },
  del(k) { try { localStorage.removeItem(k); } catch { } },
};
const hasCode = () => !!LS.get('gs.lock');

async function setCode(code) {
  S.code = code; S.salt = newSalt();
  LS.set('gs.lock', await sealWith(code, S.salt, { check: 'gs-ok' }));
  LS.set('gs.salt', S.salt);
}
async function verifyCode(code) {
  const env = LS.get('gs.lock'); if (!env) return false;
  try { const o = await openWith(code, env); if (o.check !== 'gs-ok') return false; S.code = code; S.salt = LS.get('gs.salt') || env.salt; return true; }
  catch { return false; }
}
async function loadLocal() {
  if (IS_ANDROID) {
    let raw = ''; try { raw = Native.loadState() || ''; } catch { }
    return normalizeState(raw ? JSON.parse(raw) : null);
  }
  const env = LS.get('gs.vault');
  if (!env) return defaultState();
  return normalizeState(await openWith(S.code, env));
}
let saveTimer = null;
function saveLocal() {
  S.state.updatedAt = Date.now();
  if (IS_ANDROID) { try { Native.saveState(JSON.stringify(S.state)); } catch (e) { console.warn(e); } return; }
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => { try { LS.set('gs.vault', await sealWith(S.code, S.salt, S.state)); } catch (e) { console.warn(e); } }, 150);
}
async function reencryptLocal() { if (!IS_ANDROID) LS.set('gs.vault', await sealWith(S.code, S.salt, S.state)); }

/* ---------- IndexedDB (para recordar la carpeta conectada en el PC) ---------- */
const IDB = {
  db: null,
  open() { return this.db || (this.db = new Promise((res, rej) => { const r = indexedDB.open('gs-agenda', 1); r.onupgradeneeded = () => r.result.createObjectStore('kv'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); })); },
  async get(k) { try { const db = await this.open(); return await new Promise(res => { const q = db.transaction('kv').objectStore('kv').get(k); q.onsuccess = () => res(q.result); q.onerror = () => res(undefined); }); } catch { return undefined; } },
  async set(k, v) { try { const db = await this.open(); await new Promise(res => { const tx = db.transaction('kv', 'readwrite'); tx.objectStore('kv').put(v, k); tx.oncomplete = res; tx.onerror = res; }); } catch { } },
  async del(k) { try { const db = await this.open(); await new Promise(res => { const tx = db.transaction('kv', 'readwrite'); tx.objectStore('kv').delete(k); tx.oncomplete = res; tx.onerror = res; }); } catch { } },
};
const canPickFolder = () => !IS_ANDROID && 'showDirectoryPicker' in window;

/* ---------- Sincronización ---------- */
function mergeStates(a, b) {
  const map = new Map();
  for (const t of a.tasks) map.set(t.id, t);
  for (const t of b.tasks) { const cur = map.get(t.id); if (!cur || t.updatedAt > cur.updatedAt) map.set(t.id, t); }
  const cutoff = Date.now() - 60 * DAY;
  const tasks = [...map.values()].filter(t => !(t.deleted && t.updatedAt < cutoff));
  const settings = (b.settings.updatedAt || 0) > (a.settings.updatedAt || 0) ? b.settings : a.settings;
  const inboxDone = [...new Set([...a.inboxDone, ...b.inboxDone])].slice(-500);
  return { v: 1, tasks, settings, inboxDone, updatedAt: Math.max(a.updatedAt, b.updatedAt) };
}
const fingerprint = s => JSON.stringify([...s.tasks].sort((x, y) => x.id < y.id ? -1 : 1).map(t => [t.id, t.updatedAt]).concat([s.settings.updatedAt, s.inboxDone.length]));

function setSync(status, label) { S.sync.status = status; S.sync.label = label; UI.renderSyncBadge(); }
function syncConnected() {
  if (IS_ANDROID) { try { return !!Native.syncFileName(); } catch { return false; } }
  return !!S.dir;
}
async function remoteRead() {
  if (IS_ANDROID) { const t = (await Native.readSyncFile()) || ''; if (t.startsWith('\u0000ERR')) throw new Error(t.slice(5) || 'No se pudo leer el archivo'); return t; }
  try { const fh = await S.dir.getFileHandle(AGENDA_FILE); return await (await fh.getFile()).text(); }
  catch (e) { if (e && e.name === 'NotFoundError') return ''; throw e; }
}
async function remoteWrite(text) {
  if (IS_ANDROID) { if (!(await Native.writeSyncFile(text))) throw new Error('No se pudo escribir el archivo'); return; }
  const fh = await S.dir.getFileHandle(AGENDA_FILE, { create: true });
  const w = await fh.createWritable(); await w.write(text); await w.close();
}

let syncTimer = null;
function scheduleSync(delay = 2500) { S.sync.dirty = true; clearTimeout(syncTimer); syncTimer = setTimeout(() => syncNow(false), delay); }

async function syncNow(manual) {
  if (!S.unlocked || S.sync.busy) return;
  if (!syncConnected()) { setSync('off', IS_ANDROID ? 'Sin archivo conectado' : (S.needsReconnect ? 'Toca para reconectar la carpeta' : 'Sin carpeta conectada')); return; }
  S.sync.busy = true; setSync('busy', 'Sincronizando…');
  try {
    const text = await remoteRead();
    let remote = null;
    if (text && text.trim()) {
      let env; try { env = JSON.parse(text.slice(text.indexOf('{'), text.indexOf('}') + 1)); } catch { throw new Error('El archivo de sincronización está dañado'); }
      try { remote = normalizeState(await openWith(S.code, env)); }
      catch {
        S.sync.busy = false;
        setSync('err', 'El archivo usa otra clave');
        if (manual) UI.askFileCode(env);
        return;
      }
    }
    const before = fingerprint(S.state);
    const merged = remote ? mergeStates(S.state, remote) : S.state;
    S.state = merged;
    const recur = ensureRecurrences();
    if (fingerprint(S.state) !== before || recur) { saveLocal(); UI.render(); }
    if (!remote || fingerprint(remote) !== fingerprint(S.state)) await remoteWrite(JSON.stringify(await sealWith(S.code, S.salt, S.state)));
    S.sync.dirty = false; S.sync.last = Date.now();
    LS.set('gs.lastSync', S.sync.last);
    setSync('ok', 'Sincronizado ' + fmtAgo(S.sync.last));
    if (!IS_ANDROID) await readInbox();
    if (manual) UI.toast('Sincronización completa');
  } catch (e) {
    console.warn(e);
    setSync('err', 'Error al sincronizar');
    if (manual) UI.toast('No se pudo sincronizar: ' + (e.message || e.name || 'error'));
  } finally { S.sync.busy = false; }
}
/* El otro equipo cambió la clave: se adopta si el usuario la conoce */
async function adoptFileCode(code, env) {
  try { await openWith(code, env); } catch { return false; }
  await setCode(code); await reencryptLocal();
  if (IS_ANDROID && LS.get('gs.bio')) { try { Native.secretSet('code', code); } catch { } }
  await syncNow(true);
  return true;
}

/* PC: carpeta de OneDrive */
async function connectFolder() {
  try {
    const dir = await window.showDirectoryPicker({ id: 'gs-agenda', mode: 'readwrite', startIn: 'documents' });
    S.dir = dir; S.needsReconnect = false; await IDB.set('dir', dir);
    S.sync.name = dir.name; LS.set('gs.syncName', dir.name);
    await syncNow(true); UI.render();
  } catch (e) { if (e.name !== 'AbortError') UI.toast('No se pudo conectar la carpeta'); }
}
async function restoreFolder() {
  if (IS_ANDROID || !canPickFolder()) return;
  const dir = await IDB.get('dir'); if (!dir) return;
  S.sync.name = dir.name;
  try {
    const p = await dir.queryPermission({ mode: 'readwrite' });
    if (p === 'granted') { S.dir = dir; S.needsReconnect = false; }
    else { S.needsReconnect = true; S.pendingDir = dir; }
  } catch { S.needsReconnect = true; S.pendingDir = dir; }
}
async function reconnectFolder() {
  const dir = S.pendingDir; if (!dir) return connectFolder();
  try {
    const p = await dir.requestPermission({ mode: 'readwrite' });
    if (p === 'granted') { S.dir = dir; S.needsReconnect = false; S.pendingDir = null; await syncNow(true); UI.render(); }
  } catch { connectFolder(); }
}
async function disconnectSync() {
  if (IS_ANDROID) { try { Native.disconnectSyncFile(); } catch { } }
  else { S.dir = null; S.pendingDir = null; S.needsReconnect = false; await IDB.del('dir'); S.inbox = []; }
  LS.del('gs.syncName'); S.sync.name = '';
  setSync('off', 'Sin archivo conectado'); UI.render();
}

/* ---------- Bandeja: solicitudes que Power Automate deja en la carpeta ---------- */
function pick(o, keys) { for (const k of keys) { if (o[k] != null && o[k] !== '') return o[k]; } return ''; }
function parseMailFile(name, o) {
  const id = String(pick(o, ['id', 'messageId', 'Id', 'MessageId']) || name);
  const received = Date.parse(pick(o, ['received', 'recibido', 'fecha', 'DateTimeReceived', 'receivedDateTime'])) || null;
  const stripHtml = s => String(s).replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  return {
    file: name, id,
    subject: String(pick(o, ['subject', 'asunto', 'Subject']) || '(Sin asunto)'),
    from: String(pick(o, ['from', 'de', 'remitente', 'From'])),
    received,
    preview: stripHtml(pick(o, ['preview', 'vista', 'resumen', 'bodyPreview', 'BodyPreview', 'body', 'cuerpo'])).slice(0, 600),
    link: String(pick(o, ['link', 'enlace', 'webLink', 'WebLink'])),
  };
}
async function readInbox() {
  if (!S.dir) { S.inbox = []; return; }
  const list = [];
  try {
    const sub = await S.dir.getDirectoryHandle(INBOX_DIR, { create: true });
    for await (const [name, h] of sub.entries()) {
      if (h.kind !== 'file' || !/\.(json|txt)$/i.test(name)) continue;
      try {
        const txt = await (await h.getFile()).text();
        const m = parseMailFile(name, JSON.parse(txt.replace(/^\uFEFF/, '')));
        if (!S.state.inboxDone.includes(m.id)) list.push(m);
      } catch (e) { console.warn('Solicitud ilegible', name, e); }
    }
  } catch (e) { console.warn(e); }
  list.sort((a, b) => (b.received || 0) - (a.received || 0));
  S.inbox = list;
  UI.renderNav();
}
async function finishInboxItem(m) {
  if (!S.state.inboxDone.includes(m.id)) S.state.inboxDone.push(m.id);
  S.inbox = S.inbox.filter(x => x.id !== m.id);
  saveLocal(); scheduleSync(500);
  try { const sub = await S.dir.getDirectoryHandle(INBOX_DIR); await sub.removeEntry(m.file); } catch { }
}

/* ---------- Plan de trabajo diario ---------- */
function buildPlan(now = Date.now()) {
  const st = S.state.settings;
  let day0 = startOfDay(now);
  let we = day0 + parseHM(st.workEnd);
  let forTomorrow = false;
  if (now >= we - 15 * MIN) { day0 = addDays(day0, 1); we = day0 + parseHM(st.workEnd); forTomorrow = true; }
  const ws = day0 + parseHM(st.workStart);
  const dayEnd = day0 + DAY - 1;
  const open = liveTasks().filter(isOpen);
  const waiting = open.filter(t => t.status === 'WAITING' && t.dueAt <= dayEnd);
  const cands = open.filter(t => t.status !== 'WAITING' && (t.dueAt <= dayEnd || t.status === 'IN_PROGRESS' || (t.priority === 'HIGH' && t.dueAt <= day0 + 3 * DAY)));
  const rank = t => t.dueAt < day0 ? 0 : t.dueAt <= dayEnd ? 1 : t.status === 'IN_PROGRESS' ? 2 : 3;
  cands.sort((a, b) => rank(a) - rank(b) || (rank(a) === 1 ? a.dueAt - b.dueAt : (PRIO_RANK[a.priority] - PRIO_RANK[b.priority]) || a.dueAt - b.dueAt));
  const q = 15 * MIN;
  let cursor = Math.max(ws, Math.ceil(now / q) * q);
  const blocks = [], overflow = [];
  for (const t of cands) {
    const dur = Math.min(t.durationMin || 60, 480) * MIN;
    if (cursor + dur > we) { overflow.push(t); continue; }
    const reason = t.dueAt < day0 ? overdueText(t.dueAt, now)
      : t.dueAt <= dayEnd ? `Vence ${forTomorrow ? 'mañana' : 'hoy'} a las ${fmtTime(t.dueAt)}`
      : t.status === 'IN_PROGRESS' ? 'Ya está en progreso' : `Prioridad alta, vence ${fmtDate(t.dueAt)}`;
    blocks.push({ t, start: cursor, end: cursor + dur, reason, late: t.dueAt >= day0 && t.dueAt <= dayEnd && cursor + dur > t.dueAt });
    cursor += dur;
  }
  const busyMin = blocks.reduce((s, b) => s + (b.end - b.start), 0) / MIN;
  return { day0, ws, we, blocks, overflow, waiting, forTomorrow, busyMin, overdue: cands.filter(t => t.dueAt < day0).length };
}

/* ---------- Dictado por voz ---------- */
function parseVoice(input) {
  let text = ' ' + input + ' ';
  const s = () => text.toLowerCase();
  const out = {};
  const take = re => { const m = text.match(re); if (m) text = text.replace(m[0], ' '); return m; };
  if (take(/prioridad alta|urgente/i)) out.priority = 'HIGH';
  else if (take(/prioridad media/i)) out.priority = 'MEDIUM';
  else if (take(/prioridad baja/i)) out.priority = 'LOW';
  if (take(/\ben progreso\b/i)) out.status = 'IN_PROGRESS';
  else if (take(/\ben espera\b/i)) out.status = 'WAITING';
  if (take(/cada d[ií]a|diariamente|todos los d[ií]as/i)) out.repeat = 'DAILY';
  else if (take(/cada semana|semanalmente|todas las semanas/i)) out.repeat = 'WEEKLY';
  else if (take(/cada mes|mensualmente/i)) out.repeat = 'MONTHLY';
  let day = null; const today = startOfDay(Date.now());
  if (take(/pasado mañana/i)) day = addDays(today, 2);
  else if (!/(de|en|por) la mañana/i.test(input) && take(/\bmañana\b/i)) day = addDays(today, 1);
  else if (take(/\bhoy\b/i)) day = today;
  else {
    const m = take(/\b(el |este |el próximo |el proximo )?(lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo)\b/i);
    if (m) {
      const names = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
      const target = names.indexOf(m[2].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
      const cur = new Date(today).getDay(); let diff = (target - cur + 7) % 7; if (diff === 0) diff = 7;
      day = addDays(today, diff);
    }
  }
  const tm = take(/\ba las (\d{1,2})(?:[:.](\d{2})| y (media|cuarto))?\s*(de la (mañana|tarde|noche)|a\.? ?m\.?|p\.? ?m\.?)?/i);
  let time = null;
  if (tm) {
    let h = +tm[1]; let mi = tm[2] ? +tm[2] : tm[3] === 'media' ? 30 : tm[3] === 'cuarto' ? 15 : 0;
    const q = (tm[4] || '').toLowerCase();
    if (/tarde|noche|p/.test(q) && h < 12) h += 12;
    else if (!q && h >= 1 && h <= 6) h += 12;
    if (/mañana|a/.test(q) && h === 12) h = 0;
    time = (h * 60 + mi) * MIN;
  }
  if (day !== null || time !== null) out.when = { day, time };
  out.title = text.replace(/\s+/g, ' ').replace(/^[\s,.-]+|[\s,.-]+$/g, '');
  if (out.title) out.title = out.title[0].toUpperCase() + out.title.slice(1);
  void s;
  return out;
}

/* ---------- Avisos de escritorio (PC, mientras la app está abierta) ---------- */
function desktopTick() {
  if (IS_ANDROID || !S.unlocked || !('Notification' in window) || Notification.permission !== 'granted') return;
  const now = Date.now();
  const fired = LS.get('gs.fired') || {};
  let changed = false;
  for (const t of liveTasks().filter(isOpen)) {
    for (const m of new Set([0, ...t.reminders])) {
      const at = t.dueAt - m * MIN, key = t.id + '@' + at;
      if (now >= at && now - at < 10 * MIN && !fired[key]) {
        fired[key] = now; changed = true;
        try { new Notification(m ? `En ${m >= 60 ? (m / 60) + ' h' : m + ' min'}: ${t.title}` : `Ahora: ${t.title}`, { body: fmtDue(t.dueAt) + (t.notes ? '\n' + t.notes.slice(0, 120) : ''), tag: key }); } catch { }
      }
    }
  }
  const st = S.state.settings, day0 = startOfDay(now), planAt = day0 + parseHM(st.planTime), pk = 'plan@' + day0;
  if (st.planEnabled && now >= planAt && now < day0 + parseHM(st.workEnd) && !fired[pk]) {
    fired[pk] = now; changed = true;
    const p = buildPlan(now);
    try { const n = new Notification('Tu plan de hoy está listo', { body: `${p.blocks.length} tareas programadas${p.overdue ? `, ${p.overdue} vencidas` : ''}.` }); n.onclick = () => { window.focus(); UI.go('plan'); }; } catch { }
  }
  if (changed) { for (const k in fired) if (now - fired[k] > 3 * DAY) delete fired[k]; LS.set('gs.fired', fired); }
}

/* ---------- Exportar ---------- */
function toCSV() {
  const cols = ['Título', 'Categoría', 'Estado', 'Prioridad', 'Fecha límite', 'Hora', 'Duración (min)', 'Repetir', 'Creada', 'Completada', 'A tiempo', 'Subtareas', 'Subtareas listas', 'Origen', 'Notas'];
  const q = v => { const s = String(v ?? ''); return /[";\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const d = t => t ? toDateInput(t) : '';
  const rows = liveTasks().sort((a, b) => a.dueAt - b.dueAt).map(t => [
    t.title, t.category, STATUS[t.status], PRIO[t.priority], d(t.dueAt), toTimeInput(t.dueAt), t.durationMin, REPEAT[t.repeatType],
    d(t.createdAt), d(t.completedAt), t.completedAt ? (t.completedAt <= t.dueAt ? 'Sí' : 'No') : '',
    t.subtasks.length, t.subtasks.filter(s => s.done).length, t.source ? 'Correo' : 'Manual', t.notes,
  ]);
  return '\uFEFF' + [cols, ...rows].map(r => r.map(q).join(';')).join('\r\n');
}
function downloadText(name, mime, text) {
  if (IS_ANDROID) { try { Native.saveFile(name, mime, text); } catch { UI.toast('No se pudo guardar'); } return; }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: mime }));
  a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

/* ---------- Respuestas del lado Android ---------- */
const nativeHandlers = {};
window.__gsNative = (name, payload) => { try { nativeHandlers[name] && nativeHandlers[name](payload); } catch (e) { console.warn(e); } };
