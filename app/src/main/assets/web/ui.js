'use strict';
/* GS Agenda — interfaz */

const ICON = {
  dash: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  plan: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  tasks: '<path d="M10 6h10M10 12h10M10 18h10"/><path d="M3.5 6l1.3 1.3L7.3 5M3.5 12l1.3 1.3 2.5-2.3M3.5 18l1.3 1.3 2.5-2.3"/>',
  cal: '<rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9.5h18M8 3v3M16 3v3"/>',
  inbox: '<path d="M3 13l2.5-7.5A2 2 0 0 1 7.4 4h9.2a2 2 0 0 1 1.9 1.5L21 13v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 13h5l1.5 2.5h5L16 13h5"/>',
  settings: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
  sync: '<path d="M20 11a8 8 0 0 0-14.5-4.5L4 8"/><path d="M4 4v4h4"/><path d="M4 13a8 8 0 0 0 14.5 4.5L20 16"/><path d="M20 20v-4h-4"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5l8.5 6.5 8.5-6.5"/>',
  finger: '<path d="M12 11v3a8 8 0 0 1-1.5 4.5"/><path d="M8.5 9.5a3.5 3.5 0 0 1 7 0v3.5a12 12 0 0 1-.8 4.3"/><path d="M5.5 15.5A12 12 0 0 0 5.5 13V9.5a6.5 6.5 0 0 1 13 0V12"/><path d="M18.3 16.5c.1-.6.2-1.3.2-2"/>',
  repeat: '<path d="M17 2l3 3-3 3"/><path d="M4 11V9a4 4 0 0 1 4-4h12"/><path d="M7 22l-3-3 3-3"/><path d="M20 13v2a4 4 0 0 1-4 4H4"/>',
  play: '<path d="M8 5.5l11 6.5-11 6.5z"/>',
  next: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  upload: '<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  chevL: '<path d="M15 6l-6 6 6 6"/>', chevR: '<path d="M9 6l6 6-6 6"/>',
  sub: '<path d="M9 6h11M9 12h11M9 18h11"/><rect x="3" y="4.5" width="3" height="3" rx=".8"/><rect x="3" y="10.5" width="3" height="3" rx=".8"/><rect x="3" y="16.5" width="3" height="3" rx=".8"/>',
};
const ic = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICON[n] || ''}</svg>`;

const VIEWS = [
  ['dash', 'Tablero', 'dash'], ['plan', 'Plan de hoy', 'plan'], ['tasks', 'Tareas', 'tasks'],
  ['cal', 'Calendario', 'cal'], ['inbox', 'Solicitudes', 'inbox'], ['settings', 'Ajustes', 'settings'],
];

const UI = {
  view: 'dash', q: '',
  dash: { period: 'month', cat: '', f: {} },
  list: { show: 'open', prio: '', cat: '' },
  cal: { month: startOfMonth(Date.now()), sel: startOfDay(Date.now()) },
  sort: { k: 'dueAt', dir: 1 },
  draft: null, buddyIdx: 0, lastAct: Date.now(), hiddenAt: 0, fails: 0, waitUntil: 0,
};

/* ---------- Utilidades de estado ---------- */
const touch = t => { t.updatedAt = Date.now(); };
function commit(fn) { fn(); saveLocal(); scheduleSync(); UI.renderContent(); UI.renderNav(); }
function setStatus(t, st) {
  t.status = st; t.completedAt = st === 'COMPLETED' ? Date.now() : null; touch(t);
  if (st === 'COMPLETED') ensureRecurrences();
}
const catKey = c => c || '__none';
const catName = c => c || 'Sin categoría';
const categories = () => [...new Set(liveTasks().map(t => t.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'; };
const matchQ = (t, q) => !q || (t.title + ' ' + t.notes + ' ' + t.category).toLowerCase().includes(q.toLowerCase());

/* ================= BLOQUEO ================= */
UI.showLock = function (mode) {
  S.unlocked = false; UI.closeEditor(true); UI.closeMenu(); UI.closeModal();
  $('#app').classList.add('hidden');
  const el = $('#lock'); el.classList.remove('hidden');
  if (IS_ANDROID) { const dk = document.documentElement.dataset.theme === 'dark'; try { Native.setBars(dk ? '#0B1620' : '#F9F9F9', dk); } catch { } }
  const mark = LS.get('gs.buddy') === false ? '<div class="brand-mark">GS</div>' : buddySVG({ mood: 'happy', cls: 'wave', label: 'Asistente Gestora Social' });
  const bio = IS_ANDROID && LS.get('gs.bio') && (() => { try { return Native.canBiometric(); } catch { return false; } })();
  if (!cryptoReady()) {
    el.innerHTML = `<div class="lock-box"><div class="brand-mark">GS</div><h1>No se puede abrir aquí</h1><p>Este navegador no permite el cifrado que protege tus tareas. Ábrela en Microsoft Edge o Google Chrome actualizados.</p></div>`;
    return;
  }
  if (mode === 'create') {
    el.innerHTML = `<form class="lock-box" id="lockForm" autocomplete="off">
      ${mark}<h1>Crea tu clave de acceso</h1>
      <p>Protege tus tareas con 6 o más caracteres. Si combinas letras y números es más segura. Usa la misma clave en el celular y en el PC: también cifra tu archivo de sincronización.</p>
      <input type="password" id="c1" placeholder="Clave" aria-label="Clave" minlength="6" required>
      <input type="password" id="c2" placeholder="Repite la clave" aria-label="Repite la clave" style="margin-top:10px" required>
      <button class="btn-primary" type="submit">Crear clave y entrar</button>
      <div class="err" id="lockErr" role="alert"></div></form>`;
    $('#c1').focus();
    $('#lockForm').onsubmit = async e => {
      e.preventDefault();
      const a = $('#c1').value, b = $('#c2').value;
      if (a.length < 6) return ($('#lockErr').textContent = 'La clave debe tener al menos 6 caracteres.');
      if (a !== b) return ($('#lockErr').textContent = 'Las dos claves no coinciden.');
      $('#lockErr').textContent = 'Preparando…';
      await setCode(a);
      await UI.enter(true);
    };
    return;
  }
  el.innerHTML = `<form class="lock-box" id="lockForm" autocomplete="off">
    ${mark}<h1>¡Hola de nuevo!</h1><p>Escribe tu clave para entrar a GS Agenda</p>
    <input type="password" id="c1" placeholder="Clave" aria-label="Clave" required>
    <button class="btn-primary" type="submit">Entrar</button>
    <div class="err" id="lockErr" role="alert"></div>
    ${bio ? `<button type="button" class="alt" id="bioBtn">${ic('finger')} Usar huella</button><br>` : ''}
    <button type="button" class="alt" id="forgot" style="font-size:13px">¿Olvidaste la clave?</button></form>`;
  if (!bio) $('#c1').focus();
  $('#lockForm').onsubmit = async e => {
    e.preventDefault();
    if (Date.now() < UI.waitUntil) return ($('#lockErr').textContent = `Demasiados intentos. Espera ${Math.ceil((UI.waitUntil - Date.now()) / 1000)} s.`);
    $('#lockErr').textContent = 'Verificando…';
    if (await verifyCode($('#c1').value)) { UI.fails = 0; await UI.enter(false); }
    else {
      UI.fails++; if (UI.fails >= 5) { UI.waitUntil = Date.now() + 30000; UI.fails = 0; }
      $('#lockErr').textContent = 'Clave incorrecta.'; $('#c1').select();
    }
  };
  if (bio) {
    $('#bioBtn').onclick = () => { try { Native.biometric(); } catch { } };
    setTimeout(() => { try { Native.biometric(); } catch { } }, 350);
  }
  $('#forgot').onclick = async () => {
    const ok = await UI.confirm('Restablecer la app en este dispositivo', 'Sin la clave no es posible leer tus tareas cifradas. Puedes empezar de cero: se borrarán las tareas guardadas en este dispositivo y la conexión con el archivo. El archivo de OneDrive no se modifica, pero solo podrás abrirlo con la clave anterior.', 'Borrar y empezar de cero', true);
    if (!ok) return;
    ['gs.lock', 'gs.salt', 'gs.vault', 'gs.bio', 'gs.syncName', 'gs.lastSync', 'gs.fired'].forEach(LS.del);
    if (IS_ANDROID) { try { Native.saveState(''); Native.secretSet('code', ''); Native.disconnectSyncFile(); } catch { } }
    else await IDB.del('dir');
    UI.showLock('create');
  };
};
nativeHandlers.biometric = async ok => {
  if (!ok || S.unlocked) return;
  let code = ''; try { code = Native.secretGet('code'); } catch { }
  if (code && await verifyCode(code)) UI.enter(false);
  else { const e = $('#lockErr'); if (e) e.textContent = 'Escribe tu clave; la huella se volverá a activar.'; LS.del('gs.bio'); }
};

UI.enter = async function (fresh) {
  try { S.state = await loadLocal(); }
  catch (e) { console.warn(e); S.state = defaultState(); }
  S.unlocked = true; UI.lastAct = Date.now();
  if (ensureRecurrences()) saveLocal();
  if (fresh && !IS_ANDROID) saveLocal();
  $('#lock').classList.add('hidden'); $('#lock').innerHTML = '';
  $('#app').classList.remove('hidden');
  S.sync.name = LS.get('gs.syncName') || '';
  S.sync.last = LS.get('gs.lastSync') || 0;
  UI.applyTheme(); UI.renderShell();
  const hash = location.hash.replace('#', '');
  UI.go(VIEWS.some(v => v[0] === hash) ? hash : (UI.view || 'dash'));
  await restoreFolder();
  syncNow(false);
  if (fresh && IS_ANDROID) {
    let can = false; try { can = Native.canBiometric(); } catch { }
    if (can && await UI.confirm('¿Entrar con huella?', 'Podrás desbloquear GS Agenda con tu huella en lugar de escribir la clave.', 'Activar huella')) {
      try { Native.secretSet('code', S.code); LS.set('gs.bio', true); } catch { }
    }
    try { Native.requestNotifications(); } catch { }
  }
};
UI.lockNow = function () { S.state = null; S.code = null; S.keys.clear(); S.inbox = []; UI.showLock('unlock'); };

/* ================= ESTRUCTURA ================= */
UI.applyTheme = function () {
  const pref = (S.state && S.state.settings.theme) || LS.get('gs.theme') || 'auto';
  let sysDark = matchMedia('(prefers-color-scheme: dark)').matches;
  if (IS_ANDROID) { try { sysDark = Native.isNightMode(); } catch { } }
  const dark = pref === 'dark' || (pref === 'auto' && sysDark);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  LS.set('gs.theme', pref);
  const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = dark ? '#0B1620' : '#F9F9F9';
  if (IS_ANDROID) { try { Native.setBars(dark ? '#0B1620' : '#F9F9F9', dark); } catch { } }
};

UI.renderShell = function () {
  $('#app').innerHTML = `
  <nav class="side" aria-label="Secciones">
    <div class="logo"><span class="brand-mark">GS</span><b>GS Agenda</b></div>
    <div id="navList"></div>
    <div class="spacer"></div>
    <button class="sync-pill" data-act="syncPill" id="syncSide"></button>
    <button class="nav-btn" data-act="lock">${ic('lock')} Bloquear</button>
  </nav>
  <section class="main">
    <header class="top">
      <div><h2 id="viewTitle"></h2><div class="sub" id="viewSub"></div></div>
      <div class="grow"></div>
      <label class="search">${ic('search')}<input id="q" type="search" placeholder="Buscar tareas" aria-label="Buscar tareas" value="${esc(UI.q)}"></label>
      <button class="icon-btn" data-act="syncPill" id="syncTop" aria-label="Sincronizar" style="display:none"></button>
      <button class="btn-primary new-top" data-act="new">${ic('plus')} Nueva tarea</button>
    </header>
    <main class="content" id="content"><div class="content-inner" id="inner"></div></main>
  </section>
  <nav class="bottom" id="bottomNav" aria-label="Secciones"></nav>
  <button class="fab" data-act="new" aria-label="Nueva tarea">${ic('plus')}</button>`;
  $('#q').addEventListener('input', e => {
    UI.q = e.target.value;
    if (UI.view !== 'tasks' && UI.view !== 'dash') UI.go('tasks'); else UI.renderContent();
  });
  if (matchMedia('(max-width:860px)').matches) $('#syncTop').style.display = '';
  UI.renderNav(); UI.renderSyncBadge();
};

UI.renderNav = function () {
  if (!S.unlocked || !$('#navList')) return;
  const n = S.inbox.length;
  const overdue = liveTasks().filter(t => isOverdue(t)).length;
  $('#navList').innerHTML = VIEWS.filter(v => !(IS_ANDROID && v[0] === 'inbox')).map(([k, label, icon]) =>
    `<button class="nav-btn ${UI.view === k ? 'on' : ''}" data-act="go" data-v="${k}" ${UI.view === k ? 'aria-current="page"' : ''}>${ic(icon)} ${label}
      ${k === 'inbox' && n ? `<span class="badge">${n}</span>` : ''}${k === 'tasks' && overdue ? `<span class="badge">${overdue}</span>` : ''}</button>`).join('');
  const mob = [['dash', 'Tablero', 'dash'], ['plan', 'Plan', 'plan'], ['tasks', 'Tareas', 'tasks'], ['cal', 'Calendario', 'cal'], ['settings', 'Ajustes', 'settings']];
  $('#bottomNav').innerHTML = mob.map(([k, label, icon]) =>
    `<button class="${UI.view === k ? 'on' : ''}" data-act="go" data-v="${k}">${ic(icon)}${label}${k === 'tasks' && overdue ? `<span class="badge">${overdue}</span>` : ''}</button>`).join('');
};

UI.renderSyncBadge = function () {
  const s = S.sync, side = $('#syncSide'), top = $('#syncTop');
  if (!side) return;
  const cls = s.status === 'ok' ? 'ok' : s.status === 'err' ? 'err' : s.status === 'busy' ? 'warn' : '';
  let label = s.label;
  if (s.status === 'ok' && s.last) label = 'Sincronizado ' + fmtAgo(s.last);
  side.innerHTML = `<span class="dot ${cls}"></span><span>${esc(label)}${s.name ? `<br><span style="opacity:.7">${esc(s.name)}</span>` : ''}</span>`;
  side.title = 'Sincronizar ahora';
  if (top) top.innerHTML = `<span style="position:relative;display:inline-grid">${ic('sync')}<span class="dot ${cls}" style="position:absolute;right:-2px;top:-2px"></span></span>`;
};

const SUBS = {
  dash: () => fmtLongDate(Date.now()), plan: () => 'Ordenado por urgencia dentro de tu jornada',
  tasks: () => `${liveTasks().filter(isOpen).length} abiertas`, cal: () => 'Vista mensual', inbox: () => 'Correos marcados para convertir en tareas', settings: () => `Versión ${APP_VERSION}`,
};
UI.go = function (v) {
  UI.view = v; history.replaceState(null, '', '#' + v);
  const name = VIEWS.find(x => x[0] === v)[1];
  $('#viewTitle').textContent = name; $('#viewSub').textContent = SUBS[v]();
  UI.renderNav(); UI.renderContent();
  $('#content').scrollTop = 0;
};
UI.render = function () { if (!S.unlocked) return; UI.renderNav(); UI.renderContent(); };
UI.renderContent = function () {
  if (!S.unlocked) return;
  const f = { dash: viewDash, plan: viewPlan, tasks: viewTasks, cal: viewCal, inbox: viewInbox, settings: viewSettings }[UI.view];
  $('#inner').innerHTML = f();
  $('#viewSub').textContent = SUBS[UI.view]();
};

/* ================= TABLERO ================= */
function periodWindow(p, now = Date.now()) {
  if (p === 'today') { const a = startOfDay(now); return [a, a + DAY]; }
  if (p === 'week') { const a = startOfWeek(now); return [a, addDays(a, 7)]; }
  if (p === 'month') { const a = startOfMonth(now); return [a, addMonths(a, 1)]; }
  return null;
}
function matchStatus(t, v) { return v === 'OVERDUE' ? isOverdue(t) : v === 'OPEN' ? isOpen(t) : t.status === v; }
function dayKey(t, now = Date.now()) { const d0 = startOfDay(now); return t.dueAt < d0 ? 'late' : String(startOfDay(t.dueAt)); }
function applyF(list, except) {
  const f = UI.dash.f;
  return list.filter(t =>
    (except === 'status' || !f.status || matchStatus(t, f.status)) &&
    (except === 'prio' || !f.prio || t.priority === f.prio) &&
    (except === 'cat' || !f.cat || catKey(t.category) === f.cat) &&
    (except === 'day' || !f.day || (isOpen(t) && dayKey(t) === f.day)));
}
function dashBase() {
  const win = periodWindow(UI.dash.period);
  return liveTasks().filter(t => (!UI.dash.cat || t.category === UI.dash.cat) && matchQ(t, UI.q) &&
    (!win || (t.dueAt >= win[0] && t.dueAt < win[1]) || (isOpen(t) && t.dueAt < win[0])));
}
const F_LABEL = {
  status: v => ({ OVERDUE: 'Vencidas', OPEN: 'Abiertas' }[v] || STATUS[v]),
  prio: v => 'Prioridad ' + PRIO[v].toLowerCase(),
  cat: v => v === '__none' ? 'Sin categoría' : v,
  day: v => v === 'late' ? 'Atrasadas' : fmtDate(+v),
};

function viewDash() {
  const base = dashBase(), all = applyF(base), now = Date.now();
  const open = all.filter(isOpen), done = all.filter(t => t.status === 'COMPLETED');
  const onTime = done.filter(t => t.completedAt && t.completedAt <= t.dueAt + 59 * MIN).length;
  const pct = done.length ? Math.round(onTime / done.length * 100) : null;
  const f = UI.dash.f;
  const name = S.state.settings.name;
  const cats = categories();
  const chips = Object.entries(f).filter(([, v]) => v).map(([k, v]) => `<span class="fchip">${esc(F_LABEL[k](v))}<button data-act="xfClear" data-dim="${k}" aria-label="Quitar filtro">${ic('x')}</button></span>`).join('');
  const kpi = (lbl, val, foot, color, sv, alert) => {
    const sel = f.status === sv;
    return `<button class="kpi ${alert && val ? 'alert' : ''} ${sel ? 'sel' : ''}" data-act="xf" data-dim="status" data-val="${sv}" aria-pressed="${sel}">
      <div class="k-lbl">${lbl}</div><div class="k-val">${val}</div><div class="k-foot">${foot}</div><i class="k-bar" style="background:${color};opacity:${sel ? 1 : .55}"></i></button>`;
  };
  const inboxBanner = S.inbox.length ? `<div class="banner">${ic('mail')}<div class="grow"><b>${S.inbox.length} ${S.inbox.length === 1 ? 'solicitud' : 'solicitudes'} del correo</b> por convertir en tarea.</div><button class="btn btn-sm" data-act="go" data-v="inbox">Revisar</button></div>` : '';
  const reconnect = S.needsReconnect ? `<div class="banner">${ic('folder')}<div class="grow">Tu carpeta de OneDrive está conectada, pero Edge pide confirmar el permiso en cada inicio.</div><button class="btn btn-sm" data-act="reconnect">Permitir acceso</button></div>` : '';

  if (!liveTasks().length) {
    if (buddyOn()) return `${reconnect}${buddyCard()}${inboxBanner}`;
    return `${reconnect}<div class="dash-head"><div><h1 class="greet">${greeting()}, ${esc(name)}</h1><div class="greet-sub">${fmtLongDate(now)}</div></div></div>
    <div class="panel empty">${ic('dash', 'big')}<h3>Tu tablero se arma con tus tareas</h3><p>Crea la primera y aquí verás tu carga de trabajo, lo vencido y tu cumplimiento.</p><button class="btn-primary" data-act="new">${ic('plus')} Crear tarea</button></div>${inboxBanner}`;
  }
  const slicersOnly = buddyOn();
  return `${reconnect}${slicersOnly ? buddyCard() : inboxBanner}
  <div class="${slicersOnly ? 'dash-tools' : 'dash-head'}">
    ${slicersOnly ? '' : `<div><h1 class="greet">${greeting()}, ${esc(name)}</h1><div class="greet-sub">${open.filter(t => isOverdue(t)).length ? `Tienes ${open.filter(t => isOverdue(t)).length} vencidas. ` : ''}${fmtLongDate(now)}</div></div>`}
    <div class="slicers">
      <div class="seg" role="group" aria-label="Periodo">${[['today', 'Hoy'], ['week', 'Semana'], ['month', 'Mes'], ['all', 'Todo']].map(([k, l]) => `<button class="${UI.dash.period === k ? 'on' : ''}" data-act="period" data-v="${k}">${l}</button>`).join('')}</div>
      <select data-act="dashCat" aria-label="Categoría"><option value="">Todas las categorías</option>${cats.map(c => `<option ${UI.dash.cat === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select>
    </div>
  </div>
  ${chips ? `<div class="filterbar"><span class="muted">Filtrando por</span>${chips}<button class="btn btn-ghost btn-sm" data-act="xfReset">Quitar todos</button></div>` : ''}
  <div class="kpis">
    ${kpi('Abiertas', open.length, UI.dash.period === 'all' ? 'todas las fechas' : 'incluye pendientes anteriores', 'var(--c-slate)', 'OPEN')}
    ${kpi('En progreso', all.filter(t => t.status === 'IN_PROGRESS').length, 'trabajando ahora', 'var(--c-indigo)', 'IN_PROGRESS')}
    ${kpi('Vencidas', open.filter(t => t.dueAt < now).length, 'pasaron su fecha límite', 'var(--c-alert)', 'OVERDUE', true)}
    ${kpi('Completadas', done.length, 'en el periodo', 'var(--ok)', 'COMPLETED')}
    <div class="kpi"><div class="k-lbl">Cumplimiento a tiempo</div><div class="k-val">${pct === null ? '–' : pct + '%'}</div><div class="k-foot">${done.length ? `${onTime} de ${done.length} antes de su hora` : 'sin tareas completadas'}</div><i class="k-bar" style="background:linear-gradient(90deg,var(--ok) ${pct || 0}%,var(--line) ${pct || 0}%)"></i></div>
  </div>
  <div class="grid">
    <section class="panel s4"><h3>Por estado</h3><div class="p-sub">Toca un segmento para filtrar todo el tablero</div>${donutStatus(applyF(base, 'status'))}</section>
    <section class="panel s4"><h3>Por prioridad</h3><div class="p-sub">Tareas abiertas</div>${hbarPrio(applyF(base, 'prio').filter(isOpen))}</section>
    <section class="panel s4"><h3>Por categoría</h3><div class="p-sub">Tareas abiertas</div>${hbarCat(applyF(base, 'cat').filter(isOpen))}</section>
    <section class="panel s8"><h3>Carga de los próximos 14 días</h3><div class="p-sub">Tareas abiertas por día de vencimiento y prioridad. Toca una columna para ver ese día.</div>${colLoad(applyF(liveTasks().filter(t => (!UI.dash.cat || t.category === UI.dash.cat) && matchQ(t, UI.q)), 'day').filter(isOpen))}</section>
    <section class="panel s4"><h3>Ritmo semanal</h3><div class="p-sub">Creadas frente a completadas, últimas 8 semanas</div>${lineTrend(applyF(liveTasks().filter(t => (!UI.dash.cat || t.category === UI.dash.cat) && matchQ(t, UI.q)), 'status'))}</section>
    <section class="panel s12"><div class="panel-head"><div><h3>Detalle</h3><div class="p-sub">${all.length} ${all.length === 1 ? 'tarea' : 'tareas'} con los filtros actuales</div></div><button class="btn btn-sm" data-act="exportCsv">${ic('download')} Exportar a Excel</button></div>${tableDetail(all)}</section>
  </div>`;
}

function donutStatus(list) {
  const now = Date.now();
  const items = [
    { k: 'OVERDUE', l: 'Vencidas', c: 'var(--c-alert)', v: list.filter(t => isOverdue(t, now)).length },
    { k: 'PENDING', l: 'Pendientes', c: 'var(--c-slate)', v: list.filter(t => t.status === 'PENDING' && t.dueAt >= now).length },
    { k: 'IN_PROGRESS', l: 'En progreso', c: 'var(--c-indigo)', v: list.filter(t => t.status === 'IN_PROGRESS' && t.dueAt >= now).length },
    { k: 'WAITING', l: 'En espera', c: 'var(--c-amber)', v: list.filter(t => t.status === 'WAITING' && t.dueAt >= now).length },
    { k: 'COMPLETED', l: 'Completadas', c: 'var(--ok)', v: list.filter(t => t.status === 'COMPLETED').length },
  ];
  const total = items.reduce((s, i) => s + i.v, 0), sel = UI.dash.f.status;
  const R = 52, C = 2 * Math.PI * R; let off = 0;
  const segs = total ? items.filter(i => i.v).map(i => {
    const len = i.v / total * C, gap = items.filter(x => x.v).length > 1 ? 2 : 0;
    const s = `<circle class="clk" cx="70" cy="70" r="${R}" fill="none" stroke="${i.c}" stroke-width="20" stroke-dasharray="${Math.max(len - gap, .5)} ${C}" stroke-dashoffset="${-off}" transform="rotate(-90 70 70)" style="pointer-events:stroke" opacity="${sel && sel !== i.k ? .25 : 1}" data-act="xf" data-dim="status" data-val="${i.k}"><title>${i.l}: ${i.v}</title></circle>`;
    off += len; return s;
  }).join('') : `<circle cx="70" cy="70" r="${R}" fill="none" stroke="var(--line-2)" stroke-width="20"/>`;
  return `<div class="donut-wrap chart"><svg width="140" height="140" viewBox="0 0 140 140" role="img" aria-label="Tareas por estado">${segs}
    <text x="70" y="68" text-anchor="middle" style="font:600 28px var(--f-num);fill:var(--ink)">${total}</text><text x="70" y="88" text-anchor="middle">tareas</text></svg>
    <div class="legend">${items.map(i => `<button class="${sel && sel !== i.k ? 'dim' : ''}" data-act="xf" data-dim="status" data-val="${i.k}"><span class="sw" style="background:${i.c}"></span>${i.l}<span class="lv">${i.v}</span></button>`).join('')}</div></div>`;
}
function hbar(items, dim) {
  if (!items.some(i => i.v)) return '<div class="empty-mini">Sin tareas abiertas con estos filtros.</div>';
  const max = Math.max(...items.map(i => i.v), 1), sel = UI.dash.f[dim];
  return `<div class="hbar">${items.map(i => `<button class="${sel && sel !== i.k ? 'dim' : ''}" data-act="xf" data-dim="${dim}" data-val="${esc(i.k)}" title="${esc(i.l)}: ${i.v}">
    <span class="hb-name">${esc(i.l)}</span><span class="hb-track"><span class="hb-fill" style="display:block;width:${i.v / max * 100}%;background:${i.c}"></span></span><span class="hb-v">${i.v}</span></button>`).join('')}</div>`;
}
const hbarPrio = list => hbar(['HIGH', 'MEDIUM', 'LOW'].map(k => ({ k, l: PRIO[k], c: PRIO_COLOR[k], v: list.filter(t => t.priority === k).length })), 'prio');
function hbarCat(list) {
  const m = new Map(); list.forEach(t => m.set(catKey(t.category), (m.get(catKey(t.category)) || 0) + 1));
  const arr = [...m.entries()].sort((a, b) => b[1] - a[1]);
  const pal = ['var(--c-indigo)', 'var(--c-teal)', 'var(--c-violet)', 'var(--c-amber)', 'var(--gs)', 'var(--c-slate)'];
  return hbar(arr.slice(0, 7).map(([k, v], i) => ({ k, l: k === '__none' ? 'Sin categoría' : k, v, c: pal[i % pal.length] })), 'cat');
}
function colLoad(list) {
  const now = Date.now(), d0 = startOfDay(now);
  const cols = [{ k: 'late', top: 'Atrasadas', bot: '', late: true }];
  for (let i = 0; i < 14; i++) { const d = addDays(d0, i), dt = new Date(d); cols.push({ k: String(d), top: i === 0 ? 'Hoy' : DOW[dt.getDay()], bot: String(dt.getDate()), we: dt.getDay() === 0 || dt.getDay() === 6 }); }
  cols.forEach(c => { const ts = list.filter(t => dayKey(t, now) === c.k); c.h = ts.filter(t => t.priority === 'HIGH').length; c.m = ts.filter(t => t.priority === 'MEDIUM').length; c.l = ts.filter(t => t.priority === 'LOW').length; c.n = ts.length; });
  const max = Math.max(4, ...cols.map(c => c.n));
  const W = 720, H = 220, pl = 26, pr = 6, pt = 12, pb = 40, cw = (W - pl - pr) / cols.length, bw = Math.min(cw * .58, 30), ch = H - pt - pb;
  const y = v => pt + ch - v / max * ch, sel = UI.dash.f.day;
  const grid = [0, Math.round(max / 2), max].map(v => `<line x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line-2)"/><text x="${pl - 6}" y="${y(v) + 4}" text-anchor="end">${v}</text>`).join('');
  const bars = cols.map((c, i) => {
    const x = pl + i * cw + (cw - bw) / 2; let acc = 0;
    const seg = (n, col) => { if (!n) return ''; const y1 = y(acc + n), hh = y(acc) - y1; acc += n; return `<rect x="${x}" y="${y1}" width="${bw}" height="${Math.max(hh - 1, 1)}" rx="2" fill="${col}"/>`; };
    const stack = c.late ? seg(c.n, 'var(--c-alert)') : seg(c.l, 'var(--c-teal)') + seg(c.m, 'var(--c-violet)') + seg(c.h, 'var(--c-alert)');
    const dim = sel && sel !== c.k ? .25 : 1;
    return `<g class="clk" data-act="xf" data-dim="day" data-val="${c.k}" opacity="${dim}"><title>${c.late ? 'Atrasadas' : fmtDate(+c.k)}: ${c.n}</title>
      <rect x="${pl + i * cw}" y="${pt}" width="${cw}" height="${ch + pb}" fill="${c.we ? 'var(--panel-2)' : 'transparent'}"/>${stack}
      ${c.n ? `<text x="${x + bw / 2}" y="${y(c.n) - 5}" text-anchor="middle" style="fill:var(--ink);font-weight:600">${c.n}</text>` : ''}
      <text x="${x + bw / 2}" y="${H - pb + 16}" text-anchor="middle" style="${c.top === 'Hoy' ? 'fill:var(--gs);font-weight:700' : c.late ? 'fill:var(--c-alert);font-weight:600' : ''}">${c.late ? 'Atras.' : c.top}</text>
      <text x="${x + bw / 2}" y="${H - pb + 31}" text-anchor="middle">${c.bot}</text></g>`;
  }).join('');
  const sep = `<line x1="${pl + cw}" x2="${pl + cw}" y1="${pt}" y2="${H - pb + 34}" stroke="var(--line)" stroke-dasharray="3 3"/>`;
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Carga de los próximos 14 días">${grid}${bars}${sep}</svg></div>
    <div class="row" style="gap:14px;font-size:12px;color:var(--muted);margin-top:6px;flex-wrap:wrap">${['HIGH', 'MEDIUM', 'LOW'].map(k => `<span class="row" style="gap:6px"><i style="width:10px;height:10px;border-radius:3px;background:${PRIO_COLOR[k]}"></i>${PRIO[k]}</span>`).join('')}</div>`;
}
function lineTrend(list) {
  const w0 = startOfWeek(Date.now()), weeks = [];
  for (let i = 7; i >= 0; i--) { const a = addDays(w0, -7 * i), b = addDays(a, 7); weeks.push({ a, c: list.filter(t => t.createdAt >= a && t.createdAt < b).length, d: list.filter(t => t.completedAt && t.completedAt >= a && t.completedAt < b).length }); }
  const max = Math.max(3, ...weeks.map(w => Math.max(w.c, w.d)));
  const W = 340, H = 200, pl = 22, pr = 8, pt = 12, pb = 26, cw = (W - pl - pr) / (weeks.length - 1), ch = H - pt - pb;
  const X = i => pl + i * cw, Y = v => pt + ch - v / max * ch;
  const line = (k, col, dash) => `<polyline fill="none" stroke="${col}" stroke-width="2.4" ${dash ? 'stroke-dasharray="5 4"' : ''} points="${weeks.map((w, i) => X(i) + ',' + Y(w[k])).join(' ')}"/>` + weeks.map((w, i) => `<circle cx="${X(i)}" cy="${Y(w[k])}" r="3.4" fill="var(--panel)" stroke="${col}" stroke-width="2"><title>${k === 'c' ? 'Creadas' : 'Completadas'} semana del ${fmtDate(w.a)}: ${w[k]}</title></circle>`).join('');
  const area = `<polygon fill="color-mix(in srgb,var(--ok) 12%,transparent)" points="${X(0)},${Y(0)} ${weeks.map((w, i) => X(i) + ',' + Y(w.d)).join(' ')} ${X(weeks.length - 1)},${Y(0)}"/>`;
  const grid = [0, Math.round(max / 2), max].map(v => `<line x1="${pl}" x2="${W - pr}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line-2)"/><text x="${pl - 6}" y="${Y(v) + 4}" text-anchor="end">${v}</text>`).join('');
  const lbl = weeks.map((w, i) => i % 2 === 1 || i === weeks.length - 1 ? `<text x="${X(i)}" y="${H - 6}" text-anchor="middle">${new Date(w.a).getDate()} ${MON[new Date(w.a).getMonth()]}</text>` : '').join('');
  return `<div class="row" style="gap:14px;font-size:12px;color:var(--muted);margin-bottom:6px"><span class="row" style="gap:6px"><i style="width:14px;border-top:2.4px dashed var(--c-slate)"></i>Creadas</span><span class="row" style="gap:6px"><i style="width:14px;border-top:2.4px solid var(--ok)"></i>Completadas</span></div>
    <div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Ritmo semanal">${grid}${area}${line('c', 'var(--c-slate)', true)}${line('d', 'var(--ok)')}${lbl}</svg></div>`;
}
const statusPill = t => `<span class="pill p-${t.status}"><span class="dot" style="background:${STATUS_COLOR[t.status]}"></span>${STATUS[t.status]}</span>`;
const prioTag = t => `<span class="prio"><i style="background:${PRIO_COLOR[t.priority]}"></i>${PRIO[t.priority]}</span>`;
function tableDetail(list) {
  if (!list.length) return '<div class="empty-mini">No hay tareas con estos filtros.</div>';
  const { k, dir } = UI.sort;
  const val = { title: t => t.title.toLowerCase(), category: t => t.category.toLowerCase(), status: t => t.status, priority: t => PRIO_RANK[t.priority], dueAt: t => t.dueAt };
  const rows = [...list].sort((a, b) => { const x = val[k](a), y = val[k](b); return (x < y ? -1 : x > y ? 1 : 0) * dir; }).slice(0, 80);
  const th = (key, label) => `<th data-act="sort" data-k="${key}" aria-sort="${k === key ? (dir > 0 ? 'ascending' : 'descending') : 'none'}">${label}${k === key ? (dir > 0 ? ' ▲' : ' ▼') : ''}</th>`;
  const now = Date.now();
  return `<div class="tbl-wrap"><table class="tbl"><thead><tr>${th('title', 'Tarea')}${th('category', 'Categoría')}${th('priority', 'Prioridad')}${th('status', 'Estado')}${th('dueAt', 'Fecha límite')}</tr></thead><tbody>
  ${rows.map(t => `<tr data-act="edit" data-id="${t.id}"><td><div class="t-title">${t.source ? ic('mail', 'faint') + ' ' : ''}${esc(t.title)}</div></td><td>${t.category ? `<span class="tag">${esc(t.category)}</span>` : '<span class="faint">–</span>'}</td><td>${prioTag(t)}</td><td>${statusPill(t)}</td><td class="${isOverdue(t, now) ? 'late' : ''}">${fmtDue(t.dueAt, now)}</td></tr>`).join('')}
  </tbody></table></div>${list.length > 80 ? `<div class="faint" style="padding:12px 0 0;font-size:12.5px">Mostrando 80 de ${list.length}. Usa los filtros para acotar.</div>` : ''}`;
}

/* ================= PLAN ================= */
function viewPlan() {
  const p = buildPlan(), now = Date.now(), st = S.state.settings;
  const hrs = Math.round(p.busyMin / 6) / 10;
  const head = `<div class="plan-head"><div><h1 class="greet">${p.forTomorrow ? 'Tu jornada terminó. Así queda mañana' : 'Plan para hoy'}</h1>
    <div class="greet-sub">${fmtLongDate(p.day0)}, jornada de ${fmtTime(p.ws)} a ${fmtTime(p.we)}${st.planEnabled ? `<br>Lo recibes cada día a las ${fmtTime(startOfDay(now) + parseHM(st.planTime))}` : ''}</div></div>
    <div class="plan-sum"><div><b>${p.blocks.length}</b>programadas</div><div><b>${hrs}</b>horas ocupadas</div><div><b style="${p.overdue ? 'color:var(--c-alert)' : ''}">${p.overdue}</b>vencidas incluidas</div><div><b>${p.overflow.length}</b>no alcanzan</div></div></div>`;
  if (!p.blocks.length && !p.overflow.length && !p.waiting.length) {
    return head + `<div class="panel empty">${ic('plan', 'big')}<h3>Nada urgente ${p.forTomorrow ? 'para mañana' : 'por hoy'}</h3><p>No hay tareas vencidas, ni con fecha ${p.forTomorrow ? 'de mañana' : 'de hoy'}, ni en progreso. Buen momento para adelantar lo que viene.</p><button class="btn-primary" data-act="new">${ic('plus')} Nueva tarea</button></div>`;
  }
  let nowDrawn = p.forTomorrow || now < p.ws || now > p.we;
  const nowLine = `<div class="now-line"><span>${fmtTime(now).replace(' ', '\u00a0')}</span></div>`;
  const blocks = p.blocks.map(b => {
    let pre = '';
    if (!nowDrawn && now < b.start) { pre = nowLine; nowDrawn = true; }
    const t = b.t, prog = t.status === 'IN_PROGRESS';
    return pre + `<div class="slot"><div class="tm num">${fmtTime(b.start)}<small>${fmtTime(b.end)}</small></div>
      <div class="block" data-act="edit" data-id="${t.id}" style="border-left-color:${PRIO_COLOR[t.priority]}">
        <div class="body"><div class="ttl">${esc(t.title)}</div><div class="why ${t.dueAt < p.day0 ? 'late' : ''}">${esc(b.reason)}${b.late ? ' · termina después de su hora límite' : ''}${t.category ? ` · ${esc(t.category)}` : ''}</div></div>
        <div class="acts">${prog ? '<span class="pill p-IN_PROGRESS">En progreso</span>' : `<button class="icon-btn" data-act="planStart" data-id="${t.id}" title="Empezar" aria-label="Empezar">${ic('play')}</button>`}
          <button class="icon-btn" data-act="toggle" data-id="${t.id}" title="Marcar como lista" aria-label="Marcar como lista">${ic('check')}</button>
          <button class="icon-btn" data-act="tomorrow" data-id="${t.id}" title="Pasar a mañana" aria-label="Pasar a mañana">${ic('next')}</button></div></div></div>`;
  }).join('') + (!nowDrawn ? nowLine : '');
  const over = p.overflow.length ? `<div class="overflow"><div class="group-h">No alcanzan en la jornada <span class="num">${p.overflow.length}</span><span class="grow" style="flex:1"></span><button class="btn btn-sm" data-act="overflowTomorrow">Pasar todas a mañana</button></div><div class="tasks">${p.overflow.map(taskRow).join('')}</div></div>` : '';
  const wait = p.waiting.length ? `<div class="overflow"><div class="group-h">En espera de otros <span class="num">${p.waiting.length}</span></div><div class="tasks">${p.waiting.map(taskRow).join('')}</div></div>` : '';
  return head + (p.blocks.length ? `<div class="timeline">${blocks}</div>` : '') + over + wait;
}

/* ================= TAREAS ================= */
function taskRow(t) {
  const now = Date.now(), done = t.status === 'COMPLETED', late = isOverdue(t, now);
  const subDone = t.subtasks.filter(s => s.done).length;
  return `<div class="task ${done ? 'done' : ''}" data-act="edit" data-id="${t.id}">
    <i class="edge" style="background:${PRIO_COLOR[t.priority]}"></i>
    <button class="check" data-act="toggle" data-id="${t.id}" aria-label="${done ? 'Marcar como pendiente' : 'Marcar como lista'}">${ic('check')}</button>
    <div class="body"><div class="ttl">${esc(t.title)}</div>
      <div class="meta"><span class="${late ? 'late' : ''}">${ic('plan')}${late ? esc(overdueText(t.dueAt, now)) : fmtDue(t.dueAt, now)}</span>
        ${t.category ? `<span class="tag">${esc(t.category)}</span>` : ''}
        ${t.subtasks.length ? `<span class="sub-prog"><span class="bar"><i style="width:${subDone / t.subtasks.length * 100}%"></i></span>${subDone}/${t.subtasks.length}</span>` : ''}
        ${t.source ? `<span title="Viene de un correo">${ic('mail')}</span>` : ''}${t.repeatType !== 'NONE' ? `<span title="${REPEAT[t.repeatType]}">${ic('repeat')}</span>` : ''}</div></div>
    <button class="pill p-${t.status} status-btn" data-act="statusMenu" data-id="${t.id}" aria-label="Cambiar estado: ${STATUS[t.status]}"><span class="dot" style="background:${STATUS_COLOR[t.status]}"></span>${STATUS[t.status]}</button>
  </div>`;
}
function viewTasks() {
  const L = UI.list, now = Date.now(), d0 = startOfDay(now);
  let list = liveTasks().filter(t => matchQ(t, UI.q) && (!L.prio || t.priority === L.prio) && (!L.cat || catKey(t.category) === L.cat));
  if (L.show === 'open') list = list.filter(isOpen); else if (L.show === 'done') list = list.filter(t => !isOpen(t));
  const cats = categories();
  const tools = `<div class="list-tools">
    <div class="seg" role="group" aria-label="Mostrar">${[['open', 'Abiertas'], ['all', 'Todas'], ['done', 'Completadas']].map(([k, l]) => `<button class="${L.show === k ? 'on' : ''}" data-act="listShow" data-v="${k}">${l}</button>`).join('')}</div>
    <div class="chips">${['HIGH', 'MEDIUM', 'LOW'].map(k => `<button class="chip ${L.prio === k ? 'on' : ''}" data-act="listPrio" data-v="${k}"><i style="width:8px;height:8px;border-radius:50%;background:${PRIO_COLOR[k]}"></i>${PRIO[k]}</button>`).join('')}</div>
    ${cats.length ? `<select class="input" style="width:auto" data-act="listCat" aria-label="Categoría"><option value="">Todas las categorías</option>${cats.map(c => `<option value="${esc(c)}" ${L.cat === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}<option value="__none" ${L.cat === '__none' ? 'selected' : ''}>Sin categoría</option></select>` : ''}
  </div>`;
  if (!list.length) {
    const any = liveTasks().length;
    return tools + `<div class="panel empty">${ic('tasks', 'big')}<h3>${UI.q ? 'Sin resultados' : any ? 'Nada por aquí' : 'Empieza creando una tarea'}</h3><p>${UI.q ? `Ninguna tarea contiene “${esc(UI.q)}”.` : any ? 'Cambia los filtros para ver otras tareas.' : 'Escríbela o díctala; puedes decir cosas como “Informe de diagnóstico mañana a las 3 prioridad alta”.'}</p>${!UI.q ? `<button class="btn-primary" data-act="new">${ic('plus')} Nueva tarea</button>` : ''}</div>`;
  }
  const groups = [
    ['Atrasadas', t => isOverdue(t, now), true], ['Hoy', t => t.dueAt >= d0 && t.dueAt < d0 + DAY], ['Mañana', t => t.dueAt >= d0 + DAY && t.dueAt < d0 + 2 * DAY],
    ['Próximos 7 días', t => t.dueAt >= d0 + 2 * DAY && t.dueAt < d0 + 7 * DAY], ['Más adelante', t => t.dueAt >= d0 + 7 * DAY], ['Anteriores', t => t.dueAt < d0],
  ];
  const used = new Set();
  const html = groups.map(([name, fn, danger]) => {
    const g = list.filter(t => !used.has(t.id) && fn(t)).sort((a, b) => a.dueAt - b.dueAt || PRIO_RANK[a.priority] - PRIO_RANK[b.priority]);
    g.forEach(t => used.add(t.id));
    if (!g.length) return '';
    return `<section class="group"><h3 class="group-h ${danger ? 'danger' : ''}">${name} <span class="num">${g.length}</span></h3><div class="tasks">${g.map(taskRow).join('')}</div></section>`;
  }).join('');
  return tools + html;
}

/* ================= CALENDARIO ================= */
function viewCal() {
  const m = UI.cal.month, first = startOfWeek(m), today = startOfDay(Date.now()), md = new Date(m);
  const byDay = new Map();
  liveTasks().forEach(t => { const k = startOfDay(t.dueAt); if (!byDay.has(k)) byDay.set(k, []); byDay.get(k).push(t); });
  let cells = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'].map(d => `<div class="dow">${d}</div>`).join('');
  for (let i = 0; i < 42; i++) {
    const d = addDays(first, i), dt = new Date(d), ts = (byDay.get(d) || []).sort((a, b) => a.dueAt - b.dueAt);
    if (i === 35 && dt.getMonth() !== md.getMonth()) break;
    cells += `<button class="day ${dt.getMonth() !== md.getMonth() ? 'out' : ''} ${d === today ? 'today' : ''} ${d === UI.cal.sel ? 'sel' : ''}" data-act="calSel" data-d="${d}" aria-label="${fmtLongDate(d)}, ${ts.length} tareas">
      <span class="dn">${dt.getDate()}</span>
      ${ts.slice(0, 3).map(t => `<span class="ev" style="border-left-color:${t.status === 'COMPLETED' ? 'var(--ok)' : PRIO_COLOR[t.priority]};${t.status === 'COMPLETED' ? 'text-decoration:line-through;opacity:.6' : ''}">${esc(t.title)}</span>`).join('')}
      ${ts.length > 3 ? `<span class="more">+${ts.length - 3} más</span>` : ''}
      <span class="pips">${ts.slice(0, 5).map(t => `<i class="pip" style="background:${t.status === 'COMPLETED' ? 'var(--ok)' : PRIO_COLOR[t.priority]}"></i>`).join('')}</span></button>`;
  }
  const selTs = (byDay.get(UI.cal.sel) || []).sort((a, b) => a.dueAt - b.dueAt);
  return `<div class="cal-head"><button class="icon-btn" data-act="calMove" data-v="-1" aria-label="Mes anterior">${ic('chevL')}</button><h3>${MON_L[md.getMonth()]} ${md.getFullYear()}</h3><button class="icon-btn" data-act="calMove" data-v="1" aria-label="Mes siguiente">${ic('chevR')}</button><button class="btn btn-sm" data-act="calToday">Hoy</button></div>
  <div class="cal">${cells}</div>
  <div class="cal-side"><div class="group-h" style="text-transform:none">${fmtLongDate(UI.cal.sel)} <span class="num">${selTs.length}</span><span style="flex:1"></span><button class="btn btn-sm" data-act="newOn" data-d="${UI.cal.sel}">${ic('plus')} Agregar</button></div>
  ${selTs.length ? `<div class="tasks">${selTs.map(taskRow).join('')}</div>` : '<div class="panel empty-mini" style="text-align:center">Sin tareas este día.</div>'}</div>`;
}

/* ================= BANDEJA ================= */
function viewInbox() {
  if (IS_ANDROID) return `<div class="panel empty">${ic('inbox', 'big')}<h3>Las solicitudes se revisan en el PC</h3><p>Los correos que marques llegan a tu carpeta de OneDrive y los conviertes en tareas desde GS Agenda en el PC. Esas tareas aparecen aquí al sincronizar.</p></div>`;
  if (!canPickFolder()) return `<div class="panel empty">${ic('inbox', 'big')}<h3>Abre GS Agenda en Edge o Chrome</h3><p>Para leer las solicitudes del correo, este navegador debe permitir el acceso a carpetas. Microsoft Edge y Google Chrome lo permiten.</p></div>`;
  if (!S.dir) return `<div class="panel empty">${ic('folder', 'big')}<h3>${S.needsReconnect ? 'Confirma el acceso a tu carpeta' : 'Conecta tu carpeta de OneDrive'}</h3><p>Power Automate deja cada correo marcado en la subcarpeta “${INBOX_DIR}”. Conecta la carpeta GS Agenda de tu OneDrive para verlos aquí.</p><button class="btn-primary" data-act="${S.needsReconnect ? 'reconnect' : 'connectFolder'}">${ic('folder')} ${S.needsReconnect ? 'Permitir acceso' : 'Conectar carpeta'}</button></div>`;
  const head = `<div class="row" style="margin-bottom:14px"><div class="grow muted" style="font-size:14px">${S.inbox.length ? `${S.inbox.length} por revisar. Al crear la tarea o descartar, el correo sale de esta lista.` : ''}</div><button class="btn btn-sm" data-act="syncNow">${ic('sync')} Buscar nuevas</button></div>`;
  if (!S.inbox.length) return head + `<div class="panel empty">${ic('inbox', 'big')}<h3>Bandeja al día</h3><p>Cuando marques un correo con bandera o lo muevas a tu carpeta “Tareas” en Outlook, aparecerá aquí en uno o dos minutos.</p></div>`;
  return head + `<div class="tasks">${S.inbox.map((m, i) => `<div class="mail"><div class="ic">${ic('mail')}</div>
    <div class="body"><div class="ttl">${esc(m.subject)}</div><div class="from">${esc(m.from)}${m.received ? ` · ${fmtDue(m.received)}` : ''}</div>${m.preview ? `<div class="prev">${esc(m.preview)}</div>` : ''}</div>
    <div class="acts"><button class="btn-primary btn-sm" data-act="mailTask" data-i="${i}">Crear tarea</button>${m.link ? `<button class="btn btn-sm" data-act="mailOpen" data-i="${i}">${ic('ext')} Abrir correo</button>` : ''}<button class="btn btn-sm btn-ghost" data-act="mailDiscard" data-i="${i}">Descartar</button></div></div>`).join('')}</div>`;
}

/* ================= AJUSTES ================= */
function viewSettings() {
  const st = S.state.settings;
  let bioAvail = false; if (IS_ANDROID) { try { bioAvail = Native.canBiometric(); } catch { } }
  const sw = (act, on, label) => `<label class="switch"><input type="checkbox" data-act="${act}" ${on ? 'checked' : ''} aria-label="${label}"><span></span></label>`;
  const connected = syncConnected();
  const syncPanel = IS_ANDROID ? `
    <div class="set-row"><div><div class="t">${connected ? 'Archivo conectado' : 'Sin archivo conectado'}</div><div class="d">${connected ? esc(Native.syncFileName()) : 'Elige el archivo gs-agenda.datos que creó el PC en tu OneDrive, o crea uno nuevo.'}</div></div>
      ${connected ? `<button class="btn btn-sm" data-act="syncNow">${ic('sync')} Sincronizar</button>` : ''}</div>
    <div class="set-row"><div class="row" style="flex-wrap:wrap"><button class="btn btn-sm" data-act="pickFile">${ic('folder')} Elegir archivo existente</button><button class="btn btn-sm" data-act="createFile">${ic('plus')} Crear archivo nuevo</button>${connected ? `<button class="btn btn-sm btn-ghost btn-danger" data-act="disconnect">Desconectar</button>` : ''}</div></div>
    <div class="note">Para elegir un archivo de OneDrive o Google Drive desde el celular, la app correspondiente debe estar instalada y con tu cuenta abierta.</div>`
    : canPickFolder() ? `
    <div class="set-row"><div><div class="t">${S.dir ? 'Carpeta conectada' : S.needsReconnect ? 'Falta confirmar el permiso' : 'Sin carpeta conectada'}</div><div class="d">${S.dir || S.needsReconnect ? esc(S.sync.name) : 'Crea una carpeta “GS Agenda” dentro de tu OneDrive y conéctala.'}</div></div>
      ${S.dir ? `<button class="btn btn-sm" data-act="syncNow">${ic('sync')} Sincronizar</button>` : S.needsReconnect ? `<button class="btn btn-sm" data-act="reconnect">Permitir acceso</button>` : ''}</div>
    <div class="set-row"><div class="row" style="flex-wrap:wrap"><button class="btn btn-sm" data-act="connectFolder">${ic('folder')} ${S.dir ? 'Cambiar carpeta' : 'Conectar carpeta'}</button>${S.dir || S.needsReconnect ? `<button class="btn btn-sm btn-ghost btn-danger" data-act="disconnect">Desconectar</button>` : ''}</div></div>
    <div class="note">En esa carpeta se guarda <b>${AGENDA_FILE}</b> (tus tareas cifradas) y la subcarpeta <b>${INBOX_DIR}</b>, donde Power Automate deja los correos. En el celular elige ese mismo archivo.</div>`
    : `<div class="note">Este navegador no permite conectar carpetas. Usa Microsoft Edge o Google Chrome para sincronizar, o mueve tus datos con la copia de seguridad.</div>`;
  const notifPanel = IS_ANDROID
    ? `<div class="set-row"><div><div class="t">Permisos del celular</div><div class="d">Notificaciones y alarmas exactas para que los avisos lleguen a tiempo.</div></div><button class="btn btn-sm" data-act="androidPerms">${ic('bell')} Revisar</button></div>`
    : `<div class="set-row"><div><div class="t">Avisos de escritorio</div><div class="d">${!('Notification' in window) ? 'Este navegador no los permite.' : Notification.permission === 'granted' ? 'Activados. Llegan mientras GS Agenda esté abierta, aunque esté minimizada.' : Notification.permission === 'denied' ? 'Bloqueados. Actívalos en la configuración del sitio en Edge.' : 'Recibe recordatorios y tu plan diario mientras la app esté abierta.'}</div></div>${'Notification' in window && Notification.permission === 'default' ? `<button class="btn btn-sm" data-act="deskNotif">${ic('bell')} Activar</button>` : ''}</div>`;
  return `<div class="settings">
  <section class="panel"><h3>Sincronización</h3><div class="p-sub">${esc(S.sync.label)}</div>${syncPanel}</section>
  <section class="panel"><h3>Plan de trabajo diario</h3><div class="p-sub">Cada mañana se ordena lo vencido, lo de hoy y lo prioritario dentro de tu jornada</div>
    <div class="set-row"><div><div class="t">Enviarme el plan cada día</div><div class="d">${IS_ANDROID ? 'Notificación en el celular' : 'Aviso de escritorio si la app está abierta'}</div></div>${sw('setPlan', st.planEnabled, 'Enviar plan diario')}</div>
    <div class="set-row"><div class="t">Hora del plan</div><input type="time" data-act="setTime" data-k="planTime" value="${st.planTime}" aria-label="Hora del plan"></div>
    <div class="set-row"><div class="t">Inicio de jornada</div><input type="time" data-act="setTime" data-k="workStart" value="${st.workStart}" aria-label="Inicio de jornada"></div>
    <div class="set-row"><div class="t">Fin de jornada</div><input type="time" data-act="setTime" data-k="workEnd" value="${st.workEnd}" aria-label="Fin de jornada"></div></section>
  <section class="panel"><h3>Seguridad</h3><div class="p-sub">Solo tú puedes abrir GS Agenda</div>
    <div class="set-row"><div><div class="t">Clave de acceso</div><div class="d">También cifra el archivo de sincronización. Si la cambias aquí, el otro dispositivo te pedirá la nueva.</div></div><button class="btn btn-sm" data-act="changeCode">Cambiar</button></div>
    ${bioAvail ? `<div class="set-row"><div><div class="t">Desbloquear con huella</div><div class="d">Usa el sensor del celular en lugar de la clave</div></div>${sw('setBio', !!LS.get('gs.bio'), 'Desbloquear con huella')}</div>` : ''}
    <div class="set-row"><div class="t">Bloquear tras inactividad</div><select class="input" style="width:auto" data-act="setLock" aria-label="Bloquear tras inactividad">${[[1, '1 minuto'], [5, '5 minutos'], [15, '15 minutos'], [30, '30 minutos'], [0, 'Nunca']].map(([v, l]) => `<option value="${v}" ${+st.lockMinutes === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
    <div class="set-row"><div class="t">Bloquear ahora</div><button class="btn btn-sm" data-act="lock">${ic('lock')} Bloquear</button></div></section>
  <section class="panel"><h3>Notificaciones</h3><div class="p-sub">Recordatorios de tus tareas</div>${notifPanel}</section>
  <section class="panel"><h3>Apariencia</h3><div class="p-sub">Tema y nombre</div>
    <div class="set-row"><div class="t">Tema</div><div class="seg">${[['auto', 'Automático'], ['light', 'Claro'], ['dark', 'Oscuro']].map(([k, l]) => `<button class="${st.theme === k ? 'on' : ''}" data-act="setTheme" data-v="${k}">${l}</button>`).join('')}</div></div>
    <div class="set-row"><div><div class="t">Mostrar a tu asistente</div><div class="d">La Gestora Social te saluda, te sugiere por dónde empezar y celebra tus avances</div></div>${sw('setBuddy', st.buddy !== false, 'Mostrar asistente')}</div>
    <div class="set-row"><div class="t">Tu nombre</div><input class="input" style="width:180px" data-act="setName" value="${esc(st.name)}" aria-label="Tu nombre"></div></section>
  <section class="panel"><h3>Datos</h3><div class="p-sub">Llévalos a Excel o Power BI, o guarda una copia</div>
    <div class="set-row"><div><div class="t">Exportar a Excel</div><div class="d">Archivo CSV con todas tus tareas, listo para Excel o Power BI</div></div><button class="btn btn-sm" data-act="exportCsv">${ic('download')} Exportar</button></div>
    <div class="set-row"><div><div class="t">Copia de seguridad</div><div class="d">Archivo cifrado con tu clave</div></div><button class="btn btn-sm" data-act="backup">${ic('download')} Guardar copia</button></div>
    <div class="set-row"><div><div class="t">Restaurar copia</div><div class="d">Se combina con tus tareas actuales, no las reemplaza</div></div><button class="btn btn-sm" data-act="restore">${ic('upload')} Restaurar</button></div>
    <div class="set-row"><div><div class="t">Importar tareas</div><div class="d">Carga un archivo CSV o JSON, por ejemplo tu plan de estudio</div></div><button class="btn btn-sm" data-act="importar">${ic('upload')} Importar</button></div>
    <input type="file" id="restoreFile" accept=".datos,.json,application/json" class="hidden"></section>
  </div>`;
}

/* ================= EDITOR ================= */
UI.openEditor = function (task, preset = {}) {
  const now = Date.now();
  const def = () => { const d = new Date(now); d.setMinutes(0, 0, 0); d.setHours(d.getHours() + 1); return d.getTime(); };
  const t = task ? JSON.parse(JSON.stringify(task)) : normalizeTask({ id: uid(), title: '', dueAt: preset.dueAt || def(), reminders: [30, 60], category: UI.list.cat && UI.list.cat !== '__none' ? UI.list.cat : '', ...preset });
  if (!task) t.title = preset.title || '';
  UI.draft = { t, isNew: !task, mail: preset.mail || null };
  const cats = categories();
  const seg = (act, cur, opts) => `<div class="seg" role="group">${opts.map(([k, l]) => `<button type="button" class="${cur === k ? 'on' : ''}" data-act="${act}" data-v="${k}" aria-pressed="${cur === k}">${l}</button>`).join('')}</div>`;
  const src = t.source ? `<div class="src-box">${ic('mail')}<div class="grow" style="flex:1;min-width:0">De <b>${esc(t.source.from || 'correo')}</b>${t.source.received ? ', ' + fmtDue(t.source.received) : ''}</div>${t.source.link ? `<a href="#" data-act="openLink" data-url="${esc(t.source.link)}">Abrir correo</a>` : ''}</div>` : '';
  $('#editor').innerHTML = `<div class="scrim" data-act="closeEditor"></div>
  <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="edH">
    <div class="drawer-h"><h3 id="edH">${UI.draft.isNew ? 'Nueva tarea' : 'Editar tarea'}</h3><button class="icon-btn" data-act="closeEditor" aria-label="Cerrar">${ic('x')}</button></div>
    <div class="drawer-b">
      ${src}
      <div class="field"><label for="edTitle">Título</label><div class="row"><input id="edTitle" class="input title-in grow" value="${esc(t.title)}" placeholder="¿Qué hay que hacer?" autocomplete="off"><button type="button" class="icon-btn" data-act="voice" aria-label="Dictar por voz" title="Dictar: “Informe mañana a las 3 prioridad alta”">${ic('mic')}</button></div><div class="faint" id="voiceHint" style="font-size:12.5px;min-height:16px"></div></div>
      <div class="row"><div class="field grow"><label for="edDate">Fecha límite</label><input type="date" id="edDate" class="input" value="${toDateInput(t.dueAt)}"></div><div class="field grow"><label for="edTime">Hora</label><input type="time" id="edTime" class="input" value="${toTimeInput(t.dueAt)}"></div></div>
      <div class="row"><div class="field grow"><label for="edCat">Categoría</label><input id="edCat" class="input" list="catList" value="${esc(t.category)}" placeholder="Ej.: Informes, Campo"><datalist id="catList">${cats.map(c => `<option value="${esc(c)}">`).join('')}</datalist></div>
        <div class="field grow"><label for="edDur">Tiempo estimado</label><select id="edDur" class="input">${DURATION_OPTS.map(([v, l]) => `<option value="${v}" ${t.durationMin === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div></div>
      <div class="field"><span class="lbl">Prioridad</span><div id="edPrio">${seg('edPrio', t.priority, [['HIGH', 'Alta'], ['MEDIUM', 'Media'], ['LOW', 'Baja']])}</div></div>
      <div class="field"><span class="lbl">Estado</span><div id="edStatus">${seg('edStatus', t.status, Object.entries(STATUS))}</div></div>
      <div class="field"><span class="lbl">Avisos</span><div class="chips" id="edRem">${REMINDER_OPTS.map(([v, l]) => `<button type="button" class="chip ${t.reminders.includes(v) ? 'on' : ''}" data-act="edRem" data-v="${v}" aria-pressed="${t.reminders.includes(v)}">${l}</button>`).join('')}</div></div>
      <div class="field"><label for="edRepeat">Repetir</label><select id="edRepeat" class="input">${Object.entries(REPEAT).map(([k, l]) => `<option value="${k}" ${t.repeatType === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
      ${IS_ANDROID ? `<div class="row" style="margin-bottom:14px;gap:22px"><label class="row" style="gap:10px">${'<span class="switch"><input type="checkbox" id="edSound" ' + (t.sound ? 'checked' : '') + '><span></span></span>'} Sonido</label><label class="row" style="gap:10px">${'<span class="switch"><input type="checkbox" id="edVib" ' + (t.vibration ? 'checked' : '') + '><span></span></span>'} Vibración</label></div>` : ''}
      <div class="field"><span class="lbl">Subtareas</span><div class="subtasks" id="edSubs"></div>
        <div class="row" style="margin-top:6px"><input id="edSubNew" class="input grow" placeholder="Agregar subtarea y presionar Enter"><button type="button" class="btn btn-sm" data-act="subAdd">${ic('plus')}</button></div></div>
      <div class="field"><label for="edNotes">Notas</label><textarea id="edNotes" class="input" rows="4">${esc(t.notes)}</textarea></div>
    </div>
    <div class="drawer-f">${!UI.draft.isNew ? `<button class="btn btn-ghost btn-danger" data-act="delete">${ic('trash')} Eliminar</button>` : ''}<span class="grow"></span><button class="btn" data-act="closeEditor">Cancelar</button><button class="btn-primary" data-act="save">Guardar</button></div>
  </aside>`;
  renderSubs();
  setTimeout(() => { if (UI.draft && UI.draft.isNew) $('#edTitle').focus(); }, 60);
  $('#edSubNew').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addSub(); } });
};
function renderSubs() {
  const d = UI.draft; if (!d) return;
  $('#edSubs').innerHTML = d.t.subtasks.map(s => `<div class="subtask"><button type="button" class="check ${s.done ? 'on' : ''}" data-act="subToggle" data-s="${s.id}" aria-label="Subtarea lista">${ic('check')}</button><input type="text" value="${esc(s.text)}" data-sub="${s.id}" aria-label="Subtarea"><button type="button" class="icon-btn" data-act="subDel" data-s="${s.id}" aria-label="Quitar subtarea">${ic('x')}</button></div>`).join('');
}
function addSub() { const i = $('#edSubNew'); const v = i.value.trim(); if (!v) return; syncSubTexts(); UI.draft.t.subtasks.push({ id: uid(), text: v, done: false }); i.value = ''; renderSubs(); i.focus(); }
function syncSubTexts() { document.querySelectorAll('#edSubs [data-sub]').forEach(inp => { const s = UI.draft.t.subtasks.find(x => x.id === inp.dataset.sub); if (s) s.text = inp.value; }); }
UI.closeEditor = function (silent) { UI.draft = null; const e = $('#editor'); if (e) e.innerHTML = ''; void silent; };
function saveDraft() {
  const d = UI.draft; if (!d) return;
  syncSubTexts(); addSub();
  const t = d.t;
  t.title = $('#edTitle').value.trim() || 'Sin título';
  t.dueAt = fromInputs($('#edDate').value || toDateInput(Date.now()), $('#edTime').value);
  t.category = $('#edCat').value.trim();
  t.durationMin = +$('#edDur').value;
  t.repeatType = $('#edRepeat').value;
  t.notes = $('#edNotes').value;
  t.subtasks = t.subtasks.filter(s => s.text.trim());
  if (IS_ANDROID) { t.sound = $('#edSound').checked; t.vibration = $('#edVib').checked; }
  const old = getTask(t.id);
  if (old && old.dueAt !== t.dueAt) t.nextSpawned = old.status === 'COMPLETED' ? old.nextSpawned : null;
  t.completedAt = t.status === 'COMPLETED' ? (old && old.completedAt) || Date.now() : null;
  touch(t);
  const mail = d.mail;
  commit(() => {
    const i = S.state.tasks.findIndex(x => x.id === t.id);
    if (i >= 0) S.state.tasks[i] = normalizeTask(t); else S.state.tasks.push(normalizeTask(t));
    if (t.status === 'COMPLETED') ensureRecurrences();
  });
  UI.closeEditor();
  UI.toast(d.isNew ? 'Tarea creada' : 'Cambios guardados');
  if (mail) finishInboxItem(mail).then(() => UI.render());
}

/* ---------- Voz ---------- */
function applyVoice(text) {
  if (!UI.draft || !text) return;
  const p = parseVoice(text);
  if (p.title) $('#edTitle').value = p.title;
  if (p.priority) { UI.draft.t.priority = p.priority; refreshSeg('edPrio', p.priority); }
  if (p.status) { UI.draft.t.status = p.status; refreshSeg('edStatus', p.status); }
  if (p.repeat) $('#edRepeat').value = p.repeat;
  if (p.when) {
    const curDay = startOfDay(fromInputs($('#edDate').value, $('#edTime').value));
    const day = p.when.day ?? curDay;
    const time = p.when.time ?? (fromInputs($('#edDate').value, $('#edTime').value) - curDay);
    $('#edDate').value = toDateInput(day); $('#edTime').value = toTimeInput(day + time);
  }
  $('#voiceHint').textContent = `Entendí: “${text}”`;
}
function refreshSeg(id, val) { document.querySelectorAll(`#${id} button`).forEach(b => { b.classList.toggle('on', b.dataset.v === val); b.setAttribute('aria-pressed', b.dataset.v === val); }); }
nativeHandlers.voice = text => applyVoice(text);
function startVoice() {
  if (IS_ANDROID) { try { Native.startVoice(); } catch { UI.toast('El dictado no está disponible'); } return; }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return UI.toast('Este navegador no permite dictado. Prueba en Edge o Chrome.');
  const r = new SR(); r.lang = 'es-CO'; r.interimResults = false; r.maxAlternatives = 1;
  $('#voiceHint').textContent = 'Escuchando… di la tarea, la fecha y la prioridad.';
  r.onresult = e => applyVoice(e.results[0][0].transcript);
  r.onerror = () => { $('#voiceHint').textContent = 'No te escuché bien. Intenta de nuevo.'; };
  r.start();
}

/* ================= MENÚS, AVISOS Y DIÁLOGOS ================= */
UI.closeMenu = () => { const m = $('#menu'); if (m) m.remove(); };
function openMenu(anchor, items) {
  UI.closeMenu();
  const m = document.createElement('div'); m.id = 'menu'; m.className = 'menu'; m.setAttribute('role', 'menu');
  m.innerHTML = items.map((it, i) => `<button role="menuitem" data-mi="${i}">${it.html}</button>`).join('');
  document.body.appendChild(m);
  const r = anchor.getBoundingClientRect(), mw = m.offsetWidth, mh = m.offsetHeight;
  m.style.left = Math.max(8, Math.min(r.right - mw, innerWidth - mw - 8)) + 'px';
  m.style.top = (r.bottom + mh + 8 > innerHeight ? r.top - mh - 6 : r.bottom + 6) + 'px';
  m.addEventListener('click', e => { const b = e.target.closest('[data-mi]'); if (b) { e.stopPropagation(); UI.closeMenu(); items[+b.dataset.mi].fn(); } });
  m.querySelector('button').focus();
}
let toastTimer;
UI.toast = function (msg, undo) {
  let t = $('#toast'); if (t) t.remove();
  t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status');
  t.innerHTML = `<span>${esc(msg)}</span>${undo ? '<button>Deshacer</button>' : ''}`;
  document.body.appendChild(t);
  if (undo) t.querySelector('button').onclick = () => { undo(); t.remove(); };
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.remove(), undo ? 6000 : 3200);
};
UI.closeModal = () => { const m = $('#modal'); if (m) { m.remove(); if (UI._modalResolve) { UI._modalResolve(null); UI._modalResolve = null; } } };
function modal(title, bodyHtml, actions) {
  UI.closeModal();
  return new Promise(res => {
    const m = document.createElement('div'); m.id = 'modal'; m.className = 'modal';
    m.innerHTML = `<div class="scrim" data-x></div><div class="card" role="dialog" aria-modal="true" aria-labelledby="mH"><h3 id="mH">${esc(title)}</h3>${bodyHtml}<div class="acts">${actions.map((a, i) => `<button class="${a.primary ? 'btn-primary' : 'btn'} ${a.danger ? 'btn-danger' : ''}" data-ma="${i}" ${a.danger && a.primary ? 'style="background:var(--c-alert);border-color:var(--c-alert);color:#fff"' : ''}>${esc(a.label)}</button>`).join('')}</div></div>`;
    document.body.appendChild(m);
    UI._modalResolve = res;
    const done = v => { UI._modalResolve = null; m.remove(); res(v); };
    m.querySelector('[data-x]').onclick = () => done(null);
    m.querySelectorAll('[data-ma]').forEach(b => b.onclick = async () => { const a = actions[+b.dataset.ma]; if (a.check) { const ok = await a.check(m); if (!ok) return; } done(a.value !== undefined ? a.value : a.label); });
    const first = m.querySelector('input') || m.querySelector('[data-ma]:last-child'); if (first) first.focus();
    m.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); m.querySelector('.btn-primary')?.click(); } });
  });
}
UI.confirm = (title, text, ok, danger) => modal(title, `<p>${esc(text)}</p>`, [{ label: 'Cancelar', value: false }, { label: ok, value: true, primary: true, danger }]).then(v => !!v);
UI.askFileCode = function (env) {
  modal('El archivo usa otra clave', `<p>La clave de GS Agenda se cambió en otro dispositivo. Escríbela para seguir sincronizando; también quedará como tu clave aquí.</p><input type="password" class="input" id="fcode" placeholder="Clave del otro dispositivo"><div class="late" id="fErr" style="font-size:13px;min-height:18px;margin-top:6px"></div>`,
    [{ label: 'Ahora no', value: false }, { label: 'Usar esta clave', value: true, primary: true, check: async m => { const ok = await adoptFileCode(m.querySelector('#fcode').value, env); if (!ok) m.querySelector('#fErr').textContent = 'Esa clave tampoco abre el archivo.'; return ok; } }]);
};

/* ================= ACCIONES ================= */
const ACT = {
  go: el => UI.go(el.dataset.v),
  buddyNext: el => buddyNext(el),
  new: () => UI.openEditor(null),
  newOn: el => { const d = +el.dataset.d; UI.openEditor(null, { dueAt: d + 9 * HOUR }); },
  edit: el => { const t = getTask(el.dataset.id); if (t) UI.openEditor(t); },
  toggle: el => {
    const t = getTask(el.dataset.id); if (!t) return;
    const prev = { status: t.status, completedAt: t.completedAt };
    el.classList.add('pop');
    setTimeout(() => {
      commit(() => setStatus(t, t.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'));
      if (t.status === 'COMPLETED') { UI.toast(`“${t.title}” lista`, () => commit(() => { t.status = prev.status; t.completedAt = prev.completedAt; touch(t); })); buddyCelebrate(); }
    }, 180);
  },
  statusMenu: el => {
    const t = getTask(el.dataset.id); if (!t) return;
    openMenu(el, Object.entries(STATUS).map(([k, l]) => ({ html: `<span class="dot" style="background:${STATUS_COLOR[k]}"></span>${l}${t.status === k ? ' ✓' : ''}`, fn: () => commit(() => setStatus(t, k)) })));
  },
  planStart: el => { const t = getTask(el.dataset.id); if (t) commit(() => setStatus(t, 'IN_PROGRESS')); },
  tomorrow: el => { const t = getTask(el.dataset.id); if (t) { moveTomorrow(t); UI.toast('Pasó a mañana'); } },
  overflowTomorrow: () => { const p = buildPlan(); commit(() => p.overflow.forEach(t => moveTomorrow(t, true))); UI.toast(`${p.overflow.length} tareas pasaron a mañana`); },
  xf: el => { const f = UI.dash.f, d = el.dataset.dim, v = el.dataset.val; f[d] = f[d] === v ? null : v; UI.renderContent(); },
  xfClear: el => { UI.dash.f[el.dataset.dim] = null; UI.renderContent(); },
  xfReset: () => { UI.dash.f = {}; UI.renderContent(); },
  period: el => { UI.dash.period = el.dataset.v; UI.renderContent(); },
  sort: el => { const k = el.dataset.k; UI.sort = { k, dir: UI.sort.k === k ? -UI.sort.dir : 1 }; UI.renderContent(); },
  listShow: el => { UI.list.show = el.dataset.v; UI.renderContent(); },
  listPrio: el => { UI.list.prio = UI.list.prio === el.dataset.v ? '' : el.dataset.v; UI.renderContent(); },
  calSel: el => { UI.cal.sel = +el.dataset.d; const m = startOfMonth(UI.cal.sel); if (m !== UI.cal.month) UI.cal.month = m; UI.renderContent(); },
  calMove: el => { UI.cal.month = addMonths(UI.cal.month, +el.dataset.v); UI.renderContent(); },
  calToday: () => { UI.cal.month = startOfMonth(Date.now()); UI.cal.sel = startOfDay(Date.now()); UI.renderContent(); },
  closeEditor: () => UI.closeEditor(),
  save: () => saveDraft(),
  delete: async () => {
    const d = UI.draft; if (!d) return;
    const t = getTask(d.t.id); UI.closeEditor(); if (!t) return;
    commit(() => { t.deleted = true; touch(t); });
    UI.toast('Tarea eliminada', () => commit(() => { t.deleted = false; touch(t); }));
  },
  edPrio: el => { UI.draft.t.priority = el.dataset.v; refreshSeg('edPrio', el.dataset.v); },
  edStatus: el => { UI.draft.t.status = el.dataset.v; refreshSeg('edStatus', el.dataset.v); },
  edRem: el => { const r = UI.draft.t.reminders, v = +el.dataset.v, i = r.indexOf(v); if (i >= 0) r.splice(i, 1); else r.push(v); el.classList.toggle('on', i < 0); el.setAttribute('aria-pressed', i < 0); },
  subAdd: () => addSub(),
  subToggle: el => { syncSubTexts(); const s = UI.draft.t.subtasks.find(x => x.id === el.dataset.s); if (s) s.done = !s.done; renderSubs(); },
  subDel: el => { syncSubTexts(); UI.draft.t.subtasks = UI.draft.t.subtasks.filter(x => x.id !== el.dataset.s); renderSubs(); },
  voice: () => startVoice(),
  openLink: (el, e) => { e.preventDefault(); openUrl(el.dataset.url); },
  lock: () => UI.lockNow(),
  syncPill: () => { if (S.needsReconnect) return reconnectFolder(); if (!syncConnected()) return UI.go('settings'); syncNow(true); },
  syncNow: () => syncNow(true),
  connectFolder: () => connectFolder(),
  reconnect: () => reconnectFolder(),
  disconnect: async () => { if (await UI.confirm('Desconectar sincronización', 'Tus tareas siguen en este dispositivo, pero dejarán de sincronizarse con el archivo.', 'Desconectar')) disconnectSync(); },
  pickFile: () => { try { Native.pickSyncFile(false); } catch { } },
  createFile: () => { try { Native.pickSyncFile(true); } catch { } },
  androidPerms: () => { try { Native.requestNotifications(); Native.openAlarmSettings(); } catch { } },
  deskNotif: async () => { try { await Notification.requestPermission(); } catch { } UI.renderContent(); },
  setTheme: el => { setSetting('theme', el.dataset.v); UI.applyTheme(); },
  exportCsv: () => { downloadText(`GS-Agenda-${toDateInput(Date.now())}.csv`, 'text/csv', toCSV()); },
  backup: async () => { downloadText(`GS-Agenda-copia-${toDateInput(Date.now())}.datos`, 'application/json', JSON.stringify(await sealWith(S.code, S.salt, S.state))); },
  restore: () => {
    if (IS_ANDROID) { try { Native.openBackup(); } catch { } return; }
    const i = $('#restoreFile'); i.value = ''; i.onchange = async () => { const f = i.files[0]; if (f) restoreBackup(await f.text()); }; i.click();
  },
  changeCode: async () => {
    const v = await modal('Cambiar clave', `<div class="field"><label for="k0">Clave actual</label><input type="password" class="input" id="k0"></div><div class="field"><label for="k1">Nueva clave (6 o más caracteres)</label><input type="password" class="input" id="k1"></div><div class="field"><label for="k2">Repite la nueva clave</label><input type="password" class="input" id="k2"></div><div class="late" id="kErr" style="font-size:13px;min-height:18px"></div>`,
      [{ label: 'Cancelar', value: false }, { label: 'Cambiar clave', value: true, primary: true, check: async m => {
        const e = m.querySelector('#kErr'), a = m.querySelector('#k1').value;
        if (m.querySelector('#k0').value !== S.code) { e.textContent = 'La clave actual no es correcta.'; return false; }
        if (a.length < 6) { e.textContent = 'La nueva clave debe tener al menos 6 caracteres.'; return false; }
        if (a !== m.querySelector('#k2').value) { e.textContent = 'Las claves nuevas no coinciden.'; return false; }
        await setCode(a); await reencryptLocal();
        if (IS_ANDROID && LS.get('gs.bio')) { try { Native.secretSet('code', a); } catch { } }
        return true;
      } }]);
    if (v) { UI.toast('Clave cambiada'); scheduleSync(300); }
  },
  mailTask: el => {
    const m = S.inbox[+el.dataset.i]; if (!m) return;
    UI.openEditor(null, { title: m.subject.replace(/^(re|rv|fw|fwd|reenviado)\s*:\s*/i, ''), notes: [m.from && 'De: ' + m.from, m.preview].filter(Boolean).join('\n\n'), category: 'Correo',
      source: { type: 'email', from: m.from, subject: m.subject, received: m.received, link: m.link }, mail: m, priority: 'MEDIUM' });
  },
  mailOpen: el => { const m = S.inbox[+el.dataset.i]; if (m && m.link) openUrl(m.link); },
  mailDiscard: async el => { const m = S.inbox[+el.dataset.i]; if (!m) return; await finishInboxItem(m); UI.render(); UI.toast('Solicitud descartada'); },
};
const CHANGE = {
  dashCat: el => { UI.dash.cat = el.value; UI.renderContent(); },
  listCat: el => { UI.list.cat = el.value; UI.renderContent(); },
  setPlan: el => setSetting('planEnabled', el.checked),
  setTime: el => { if (el.value) setSetting(el.dataset.k, el.value); },
  setLock: el => setSetting('lockMinutes', +el.value),
  setName: el => setSetting('name', el.value.trim() || 'Heidi'),
  setBuddy: el => { LS.set('gs.buddy', el.checked); setSetting('buddy', el.checked); },
  setBio: async el => {
    if (el.checked) { try { Native.secretSet('code', S.code); LS.set('gs.bio', true); UI.toast('Huella activada'); } catch { el.checked = false; } }
    else { try { Native.secretSet('code', ''); } catch { } LS.del('gs.bio'); UI.toast('Huella desactivada'); }
  },
};
function setSetting(k, v) { commit(() => { S.state.settings[k] = v; S.state.settings.updatedAt = Date.now(); }); }
function moveTomorrow(t, silent) {
  const tod = t.dueAt - startOfDay(t.dueAt), base = Math.max(startOfDay(Date.now()), startOfDay(t.dueAt));
  const fn = () => { t.dueAt = addDays(base, 1) + tod; touch(t); };
  if (silent) fn(); else commit(fn);
}
function openUrl(url) {
  if (!/^https?:\/\//i.test(url)) return;
  if (IS_ANDROID) { try { Native.openUrl(url); } catch { } } else window.open(url, '_blank', 'noopener');
}
async function restoreBackup(text) {
  try {
    const env = JSON.parse(text);
    let st;
    try { st = normalizeState(await openWith(S.code, env)); }
    catch {
      const code = await modal('Copia con otra clave', '<p>Esta copia se guardó con una clave distinta. Escríbela para restaurarla.</p><input type="password" class="input" id="bcode">', [{ label: 'Cancelar', value: false }, { label: 'Restaurar', primary: true, check: async m => { try { st = normalizeState(await openWith(m.querySelector('#bcode').value, env)); return true; } catch { return false; } } }]);
      if (!code || !st) return;
    }
    commit(() => { S.state = mergeStates(S.state, st); ensureRecurrences(); });
    UI.toast(`Copia restaurada: ${st.tasks.length} tareas combinadas`);
  } catch { UI.toast('Ese archivo no es una copia de GS Agenda'); }
}

/* ---------- Respuestas del lado Android ---------- */
nativeHandlers.syncFile = p => { if (p && p.ok) { S.sync.name = p.name || ''; LS.set('gs.syncName', S.sync.name); syncNow(true); } else if (p && p.error) UI.toast(p.error); UI.renderContent(); };
nativeHandlers.saved = ok => UI.toast(ok ? 'Archivo guardado' : 'No se guardó el archivo');
nativeHandlers.backup = text => { if (text) restoreBackup(text); };
nativeHandlers.resume = () => {
  if (!S.unlocked) return;
  const lm = S.state.settings.lockMinutes;
  if (lm && UI.hiddenAt && Date.now() - UI.hiddenAt > lm * MIN) return UI.lockNow();
  UI.hiddenAt = 0;
  try { S.state = normalizeState(JSON.parse(Native.loadState() || 'null')); } catch { }
  if (ensureRecurrences()) saveLocal();
  UI.render(); syncNow(false);
};
nativeHandlers.pause = () => { UI.hiddenAt = Date.now(); };
nativeHandlers.theme = () => UI.applyTheme();
nativeHandlers.open = v => { if (S.unlocked && VIEWS.some(x => x[0] === v)) UI.go(v); else location.hash = v; };

/* Botón atrás de Android */
window.GS_onBack = function () {
  if ($('#menu')) { UI.closeMenu(); return true; }
  if ($('#modal')) { UI.closeModal(); return true; }
  if (UI.draft) { UI.closeEditor(); return true; }
  if (S.unlocked && UI.view !== 'dash') { UI.go('dash'); return true; }
  return false;
};

/* ================= ARRANQUE ================= */
document.addEventListener('click', e => {
  if (!e.target.closest('#menu')) UI.closeMenu();
  const a = e.target.closest('[data-act]'); if (!a || a.tagName === 'SELECT' || (a.tagName === 'INPUT' && a.type !== 'button')) return;
  const fn = ACT[a.dataset.act]; if (fn) { e.stopPropagation(); fn(a, e); }
});
document.addEventListener('change', e => { const a = e.target.closest('[data-act]'); if (a && CHANGE[a.dataset.act]) CHANGE[a.dataset.act](a, e); });
document.addEventListener('keydown', e => {
  UI.lastAct = Date.now();
  if (e.key === 'Escape') { if ($('#menu')) UI.closeMenu(); else if ($('#modal')) UI.closeModal(); else if (UI.draft) UI.closeEditor(); return; }
  if (UI.draft && e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { saveDraft(); return; }
  const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '');
  if (!S.unlocked || typing || UI.draft || $('#modal')) return;
  if (e.key === 'n' || e.key === 'N') { e.preventDefault(); UI.openEditor(null); }
  if (e.key === '/') { e.preventDefault(); $('#q')?.focus(); }
});
['pointerdown', 'touchstart'].forEach(ev => document.addEventListener(ev, () => { UI.lastAct = Date.now(); }, { passive: true }));
document.addEventListener('visibilitychange', () => {
  if (IS_ANDROID) return;
  if (document.hidden) UI.hiddenAt = Date.now();
  else if (S.unlocked) {
    const lm = S.state.settings.lockMinutes;
    if (lm && UI.hiddenAt && Date.now() - UI.hiddenAt > lm * MIN) UI.lockNow(); else syncNow(false);
    UI.hiddenAt = 0;
  }
});
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => UI.applyTheme());
setInterval(() => {
  if (!S.unlocked) return;
  const lm = S.state.settings.lockMinutes;
  if (lm && Date.now() - UI.lastAct > lm * MIN) return UI.lockNow();
  desktopTick(); UI.renderSyncBadge();
}, 30000);
setInterval(() => { if (S.unlocked && !document.hidden) syncNow(false); }, 120000);

(function boot() {
  UI.applyTheme();
  if (!IS_ANDROID && 'serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => { });
  UI.showLock(hasCode() ? 'unlock' : 'create');
})();
