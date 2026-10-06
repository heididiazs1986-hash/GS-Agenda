'use strict';
/* GS Agenda — asistente animado (la Gestora Social) */

const BUDDY_C = {
  skin: '#D1884F', skinTop: '#E8AE78', skinSide: '#9C6034',
  hatTxt: '#1F4FA3', hatSh: '#C9D1DA',
  shirtTop: '#A9C8F5', shirtSide: '#4670B5', shirtLine: '#4A78BF',
  navyTop: '#3A4FA6', navySide: '#111943', navyLine: '#141E52',
  orange: '#FF7A1A', silver: '#D3D8DE', lanyard: '#2A4FA8', gold: '#EBB94F',
};
let BUDDY_N = 0;

/* Dibujo vectorial con volumen: cada bloque tiene cara frontal, superior y lateral, como una pieza de juguete. */
function buddySVG({ mood = 'happy', screen = '', label = 'Tu asistente', cls = '' } = {}) {
  const c = BUDDY_C, k = ++BUDDY_N, id = n => `b${k}-${n}`, u = n => `url(#${id(n)})`;
  /* bloque 3D: cara lateral derecha + cara superior + frente con brillo */
  const box = (x, y, w, h, r, fill, top, side, d = 8, dy = -4.5, sheen = .2) =>
    `<path d="M${x} ${y}L${x + d} ${y + dy}H${x + w + d}L${x + w} ${y}Z" fill="${top}" stroke="${top}" stroke-width="1.4" stroke-linejoin="round"/>` +
    `<path d="M${x + w} ${y}L${x + w + d} ${y + dy}V${y + h + dy}L${x + w} ${y + h}Z" fill="${side}" stroke="${side}" stroke-width="1.4" stroke-linejoin="round"/>` +
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>` +
    `<rect x="${x + 2}" y="${y + 2}" width="${Math.max(w * .22, 3)}" height="${h - 4}" rx="${r * .6}" fill="#fff" opacity="${sheen}"/>`;
  const curl = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${u('hair')}"/><ellipse cx="${x - r * .32}" cy="${y - r * .42}" rx="${r * .3}" ry="${r * .18}" fill="#fff" opacity=".22" transform="rotate(-30 ${x - r * .32} ${y - r * .42})"/>`;
  const claw = (x, y, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot})">
      <path d="M-6.5 -5 A9 9 0 1 0 6.5 -5" fill="none" stroke="${c.skinSide}" stroke-width="9.5" stroke-linecap="round"/>
      <path d="M-6.5 -5.4 A9 9 0 1 0 6.5 -5.4" fill="none" stroke="${u('skin')}" stroke-width="7.4" stroke-linecap="round"/>
      <path d="M-7.2 1 A8 8 0 0 0 -3 7.2" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".35"/></g>`;
  const band = (x, y, w, tf = '') => `<g ${tf ? `transform="${tf}"` : ''}><rect x="${x}" y="${y}" width="${w}" height="10" fill="${c.orange}"/><rect x="${x}" y="${y + 2.8}" width="${w}" height="4.4" fill="${c.silver}"/><rect x="${x}" y="${y + 2.8}" width="${w}" height="1.5" fill="#fff" opacity=".5"/></g>`;
  const conf = [[56, 40, '#7DD3FC'], [160, 30, '#C8A0F0'], [44, 98, '#FF7A1A'], [178, 88, '#7DD3FC'], [100, 8, '#C8A0F0'], [134, 14, '#FF7A1A']]
    .map(([x, y, col], i) => `<rect x="${x}" y="${y}" width="6" height="${i % 2 ? 9 : 6}" rx="1.5" fill="${col}" transform="rotate(${i * 37} ${x + 3} ${y + 3})"/>`).join('');
  return `<svg class="buddy ${cls}" data-mood="${mood}" viewBox="0 0 224 300" role="img" aria-label="${esc(label)}">
  <defs>
    <linearGradient id="${id('skin')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E49B63"/><stop offset="1" stop-color="#BC7742"/></linearGradient>
    <linearGradient id="${id('shirt')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8CB3EE"/><stop offset="1" stop-color="#5A8AD6"/></linearGradient>
    <linearGradient id="${id('navy')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2E4396"/><stop offset="1" stop-color="#1A2866"/></linearGradient>
    <linearGradient id="${id('hat')}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#F0F3F7"/><stop offset="1" stop-color="#CBD3DC"/></linearGradient>
    <linearGradient id="${id('boot')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#43434B"/><stop offset="1" stop-color="#141417"/></linearGradient>
    <linearGradient id="${id('tab')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#40444C"/><stop offset="1" stop-color="#202328"/></linearGradient>
    <linearGradient id="${id('scr')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1F4157"/><stop offset="1" stop-color="#11222E"/></linearGradient>
    <radialGradient id="${id('hair')}" cx=".34" cy=".3" r=".8"><stop offset="0" stop-color="#4C4C58"/><stop offset=".5" stop-color="#1B1B21"/><stop offset="1" stop-color="#09090C"/></radialGradient>
    <radialGradient id="${id('gold')}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#FFF0B8"/><stop offset="1" stop-color="#C98F25"/></radialGradient>
    <linearGradient id="${id('ao')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1B2A3A" stop-opacity=".34"/><stop offset="1" stop-color="#1B2A3A" stop-opacity="0"/></linearGradient>
  </defs>
  <ellipse class="b-shadow" cx="112" cy="291" rx="62" ry="8" fill="rgba(0,50,75,.2)"/>
  <g class="b-conf">${conf}</g>
  <g class="b-body">
    <!-- piernas -->
    ${box(76, 196, 30, 76, 5, u('navy'), c.navyTop, c.navySide, 6, -3.5, .12)}
    ${box(113, 196, 30, 76, 5, u('navy'), c.navyTop, c.navySide, 6, -3.5, .12)}
    ${box(68, 212, 11, 30, 3.5, u('navy'), c.navyTop, c.navySide, 5, -3, .14)}
    ${box(141, 212, 11, 30, 3.5, u('navy'), c.navyTop, c.navySide, 5, -3, .14)}
    <path d="M76 214H106M113 214H143" stroke="${c.navyLine}" stroke-width="1.4" opacity=".55"/>
    ${band(76, 250, 30)}${band(113, 250, 30)}
    ${box(70, 268, 40, 17, 6, u('boot'), '#52525B', '#0B0B0E', 6, -3.5, .18)}
    ${box(110, 268, 40, 17, 6, u('boot'), '#52525B', '#0B0B0E', 6, -3.5, .18)}
    <rect x="70" y="282" width="40" height="5.5" rx="2.5" fill="#050507"/><rect x="110" y="282" width="40" height="5.5" rx="2.5" fill="#050507"/>
    <path d="M76 285H104M116 285H144" stroke="#3A3A42" stroke-width="1.4" stroke-dasharray="3 3"/>
    <!-- cintura y torso -->
    ${box(73, 188, 74, 15, 4, u('navy'), c.navyTop, c.navySide, 8, -4.5, .1)}
    ${box(69, 118, 82, 76, 12, u('shirt'), c.shirtTop, c.shirtSide, 9, -5, .16)}
    <path d="M99 119L110 135L121 119Z" fill="#1B2A6A"/>
    <path d="M95 117L110 135L102 146L86 124Z" fill="#9DBFF3" stroke="${c.shirtLine}" stroke-width="1"/>
    <path d="M125 117L110 135L118 146L134 124Z" fill="#9DBFF3" stroke="${c.shirtLine}" stroke-width="1"/>
    <line x1="110" y1="137" x2="110" y2="190" stroke="${c.shirtLine}" stroke-width="2"/>
    <g fill="#5E7FB8"><circle cx="110" cy="152" r="2"/><circle cx="110" cy="168" r="2"/><circle cx="110" cy="183" r="2"/></g>
    <g>${[[79, 148], [120, 148]].map(([px, py]) => `<rect x="${px}" y="${py}" width="22" height="19" rx="3.5" fill="#7FA8EA" stroke="${c.shirtLine}" stroke-width="1.6"/><rect x="${px + 1.5}" y="${py + 1.5}" width="19" height="6" rx="2" fill="#fff" opacity=".2"/><rect x="${px + 8}" y="${py + 6}" width="6" height="3.4" rx="1.2" fill="#4A6EA8"/>`).join('')}</g>
    <path d="M98 119Q104 148 110 158Q116 148 122 119" fill="none" stroke="${c.lanyard}" stroke-width="3.2"/>
    <g><rect x="100.5" y="157" width="19" height="25" rx="3" fill="#fff" stroke="${c.lanyard}" stroke-width="1.8"/>
      <rect x="106" y="153.5" width="8" height="5" rx="1.5" fill="#8C97A8"/>
      <circle cx="110" cy="166" r="3.8" fill="${u('skin')}"/><path d="M106.2 164.6Q110 159 113.8 164.6Z" fill="#fff" stroke="#B9C2CE" stroke-width=".7"/>
      <line x1="105" y1="173.5" x2="115" y2="173.5" stroke="${c.lanyard}" stroke-width="1.7" stroke-linecap="round"/><line x1="105" y1="177.5" x2="112" y2="177.5" stroke="${c.lanyard}" stroke-width="1.7" stroke-linecap="round"/></g>
    <!-- rulos sobre los hombros -->
    ${curl(74, 124, 11)}${curl(85, 131, 8)}${curl(146, 124, 11)}${curl(135, 131, 8)}
    <!-- brazo que saluda -->
    <g class="b-arm">
      ${box(54, 122, 21, 66, 9, u('shirt'), c.shirtTop, c.shirtSide, 6, -3.5, .2)}
      ${band(54, 148, 21)}
      <rect x="54" y="176" width="21" height="12" rx="5" fill="#5C8BD3"/>
      ${claw(64.5, 197)}
    </g>
    <!-- brazo con tableta -->
    <g transform="rotate(-8 153 124)">${box(143, 122, 21, 48, 9, u('shirt'), c.shirtTop, c.shirtSide, 6, -3.5, .2)}${band(143, 138, 21)}</g>
    <g transform="rotate(13 184 140)">
      ${box(163, 108, 40, 58, 6, u('tab'), '#5A5F69', '#16181C', 6, -3.5, .12)}
      <rect x="167" y="112" width="32" height="50" rx="3" fill="${u('scr')}"/>
      <rect x="168" y="113" width="30" height="9" rx="2" fill="#7DD3FC" opacity=".14"/>
      <circle cx="170.5" cy="109.6" r="1.1" fill="#0B0C0E"/>
      <text class="b-screen" x="183" y="143" text-anchor="middle" style="font:800 19px Inter,Segoe UI,Arial,sans-serif;fill:#7DD3FC">${esc(screen)}</text>
      <text x="183" y="155" text-anchor="middle" style="font:600 7px Inter,Segoe UI,Arial,sans-serif;fill:#A0CDE5">${screen !== '' ? 'hoy' : ''}</text>
    </g>
    ${claw(166, 168, 62)}
    <!-- cabeza -->
    <g class="b-head">
      ${curl(66, 82, 15)}${curl(60, 102, 13)}${curl(70, 118, 11)}${curl(78, 62, 14)}
      ${curl(156, 82, 15)}${curl(162, 102, 13)}${curl(152, 118, 11)}${curl(144, 62, 14)}
      ${box(100, 107, 20, 16, 4, u('skin'), c.skinTop, c.skinSide, 5, -3, .08)}
      ${box(79, 50, 62, 62, 15, u('skin'), c.skinTop, c.skinSide, 8, -4.5, .14)}
      <circle cx="79" cy="95" r="3.6" fill="${u('gold')}"/><circle cx="141" cy="95" r="3.6" fill="${u('gold')}"/>
      <g fill="none" stroke="#17171B" stroke-width="3.2" stroke-linecap="round">
        <path class="br-flat" d="M92 74.5Q99 71 106 74M114 74Q121 71 128 74.5"/>
        <path class="br-up" d="M92 73Q99 71.5 106 69M114 69Q121 71.5 128 73"/>
      </g>
      <g class="b-eyes">
        <ellipse cx="99" cy="84" rx="4.7" ry="5.6" fill="#18181B"/><ellipse cx="121" cy="84" rx="4.7" ry="5.6" fill="#18181B"/>
        <g class="b-pupils" fill="#fff"><circle cx="100.5" cy="82" r="1.7"/><circle cx="122.5" cy="82" r="1.7"/><circle cx="97.8" cy="86.4" r=".8" opacity=".7"/><circle cx="119.8" cy="86.4" r=".8" opacity=".7"/></g>
        <path d="M94 81L91.2 79M126 81L128.8 79" stroke="#18181B" stroke-width="1.7" stroke-linecap="round"/>
      </g>
      <circle cx="91" cy="96" r="5.2" fill="#E2725F" opacity=".26"/><circle cx="129" cy="96" r="5.2" fill="#E2725F" opacity=".26"/>
      <path d="M107.5 92Q110 95.3 112.5 92" fill="none" stroke="${c.skinSide}" stroke-width="1.9" stroke-linecap="round"/>
      <g class="mo mo-happy"><path d="M98 99Q110 113 122 99Z" fill="#6E1824"/><path d="M100.4 99.6Q110 104 119.6 99.6L119 102Q110 105.6 101 102Z" fill="#fff"/></g>
      <g class="mo mo-celebrate"><path d="M96 98Q110 118 124 98Z" fill="#6E1824"/><path d="M98.6 98.7Q110 103.4 121.4 98.7L120.6 101.4Q110 105.4 99.4 101.4Z" fill="#fff"/><path d="M103.5 109.5Q110 105.5 116.5 109.5Q110 113 103.5 109.5Z" fill="#D9606A"/></g>
      <path class="mo mo-concerned" d="M102 106Q110 101.5 118 106" fill="none" stroke="#6E1824" stroke-width="2.8" stroke-linecap="round"/>
      <path class="mo mo-thinking" d="M103 104Q111 107 118 102.5" fill="none" stroke="#6E1824" stroke-width="2.8" stroke-linecap="round"/>
      <!-- casco -->
      <rect x="70" y="61" width="86" height="12" fill="url(#${id('ao')})"/>
      <clipPath id="${id('dome')}"><path d="M72 60C70 25 92 9 112 9C132 9 152 25 150 60Z"/></clipPath>
      <path d="M72 60C70 25 92 9 112 9C132 9 152 25 150 60Z" fill="${u('hat')}"/>
      <path clip-path="${u('dome')}" d="M139 8C150 22 153 40 151 62L141 62C143 44 141 26 132 8Z" fill="#AEB9C6" opacity=".55"/>
      <path d="M94 20Q87 38 88 58M130 20Q137 38 136 58" fill="none" stroke="${c.hatSh}" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="92" cy="22" rx="11" ry="5.5" fill="#fff" opacity=".9" transform="rotate(-24 92 22)"/>
      <path d="M65 60H157L160 55H68Z" fill="#E4E9EF"/>
      ${box(64, 57, 92, 11, 5.5, '#F4F6F9', '#fff', '#B5BFCB', 6, -3.5, .3)}
      <text x="110" y="37.5" text-anchor="middle" style="font:800 9.8px Inter,Segoe UI,Arial,sans-serif;fill:${c.hatTxt};letter-spacing:.2px">GESTORA</text>
      <text x="110" y="48.5" text-anchor="middle" style="font:800 9.8px Inter,Segoe UI,Arial,sans-serif;fill:${c.hatTxt};letter-spacing:.2px">SOCIAL</text>
    </g>
  </g>
</svg>`;
}

const buddyOn = () => !S.state || S.state.settings.buddy !== false;

/* Mensajes según el estado real de las tareas */
function buddyMessages() {
  const now = Date.now(), d0 = startOfDay(now);
  const byDue = (a, b) => a.dueAt - b.dueAt;
  const open = liveTasks().filter(isOpen);
  const overdue = open.filter(t => t.dueAt < now).sort(byDue);
  const today = open.filter(t => t.dueAt >= now && t.dueAt < d0 + DAY).sort(byDue);
  const doneWeek = liveTasks().filter(t => t.completedAt && t.completedAt >= startOfWeek(now)).length;
  const q = s => `«${s.length > 60 ? s.slice(0, 57) + '…' : s}»`;
  const msgs = [];
  if (S.inbox.length) msgs.push({ mood: 'happy', text: S.inbox.length === 1 ? 'Llegó 1 solicitud del correo. ¿La convertimos en tarea?' : `Llegaron ${S.inbox.length} solicitudes del correo. ¿Las convertimos en tareas?`, act: 'go', v: 'inbox', label: 'Revisar' });
  if (overdue.length) msgs.push({ mood: 'concerned', text: `Tienes ${overdue.length} ${overdue.length === 1 ? 'tarea vencida' : 'tareas vencidas'}. Te sugiero empezar por ${q(overdue[0].title)}.`, act: 'go', v: 'plan', label: 'Ver plan' });
  if (today.length) msgs.push({ mood: 'thinking', text: `Hoy te ${today.length === 1 ? 'queda 1 tarea' : `quedan ${today.length} tareas`}. La próxima es ${q(today[0].title)} a las ${fmtTime(today[0].dueAt)}.`, act: 'edit', id: today[0].id, label: 'Abrirla' });
  else if (!overdue.length) {
    const next = [...open].sort(byDue)[0];
    msgs.push(next
      ? { mood: 'happy', text: `Por hoy estás al día. Buen momento para adelantar ${q(next.title)}.`, act: 'edit', id: next.id, label: 'Abrirla' }
      : { mood: 'happy', text: 'Todo al día. Cuando quieras, agrega tu próxima tarea y la organizamos.', act: 'new', label: 'Nueva tarea' });
  }
  if (doneWeek) msgs.push({ mood: 'celebrate', text: `Esta semana llevas ${doneWeek} ${doneWeek === 1 ? 'tarea completada' : 'tareas completadas'}. ¡Vas muy bien!` });
  msgs.push({ mood: 'happy', text: 'Toca cualquier gráfico del tablero y todo lo demás se filtra con ese dato.' });
  msgs.push({ mood: 'happy', text: 'Puedes dictarme una tarea: toca el micrófono y di “informe mañana a las 3 prioridad alta”.' });
  msgs.push(IS_ANDROID
    ? { mood: 'happy', text: 'Desde la notificación puedes marcar una tarea como lista o posponerla 30 minutos.' }
    : { mood: 'happy', text: 'Atajo: presiona N para crear una tarea y / para buscar.' });
  return msgs;
}
const todayLeft = () => { const d0 = startOfDay(Date.now()); return liveTasks().filter(t => isOpen(t) && t.dueAt < d0 + DAY).length; };

function buddyActHtml(m) {
  if (!m.act) return '';
  const attrs = m.act === 'go' ? `data-v="${m.v}"` : m.act === 'edit' ? `data-id="${m.id}"` : '';
  return `<button class="btn-primary btn-sm" data-act="${m.act}" ${attrs}>${esc(m.label)}</button>`;
}

/* Tarjeta del tablero */
function buddyCard() {
  const msgs = buddyMessages(), m = msgs[(UI.buddyIdx || 0) % msgs.length];
  return `<section class="buddy-card" aria-label="Tu asistente">
    <button class="buddy-hit" data-act="buddyNext" aria-label="Otra sugerencia de tu asistente" title="Tócame para otra sugerencia">${buddySVG({ mood: m.mood, screen: String(todayLeft()), label: 'Asistente Gestora Social' })}</button>
    <div class="bubble" aria-live="polite"><h1 class="greet">${greeting()}, ${esc(S.state.settings.name)}</h1>
      <p class="b-msg">${esc(m.text)}</p>
      <div class="b-acts">${buddyActHtml(m)}<span class="b-hint">${(UI.buddyIdx || 0) === 0 ? 'Tócame para más sugerencias' : `${((UI.buddyIdx || 0) % msgs.length) + 1} de ${msgs.length}`}</span></div></div>
  </section>`;
}

function buddyAnimate(svg, cls, ms = 1400) {
  if (!svg) return;
  svg.classList.remove('wave', 'celebrate'); void svg.getBoundingClientRect();
  svg.classList.add(cls); setTimeout(() => svg.classList.remove(cls), ms);
}

/* Toque: siguiente mensaje sin redibujar el tablero */
function buddyNext(el) {
  UI.buddyIdx = (UI.buddyIdx || 0) + 1;
  const msgs = buddyMessages(), m = msgs[UI.buddyIdx % msgs.length];
  const card = el.closest('.buddy-card'), svg = el.querySelector('.buddy');
  svg.dataset.mood = m.mood;
  card.querySelector('.b-msg').textContent = m.text;
  card.querySelector('.b-acts').innerHTML = buddyActHtml(m) + `<span class="b-hint">${(UI.buddyIdx % msgs.length) + 1} de ${msgs.length}</span>`;
  buddyAnimate(svg, m.mood === 'celebrate' ? 'celebrate' : 'wave', 1700);
}

/* Celebración al completar una tarea */
function buddyCelebrate() {
  if (!buddyOn()) return;
  const left = todayLeft();
  const old = $('#buddyPop'); if (old) old.remove();
  const el = document.createElement('div');
  el.id = 'buddyPop'; el.className = 'buddy-pop'; el.setAttribute('role', 'status');
  el.innerHTML = buddySVG({ mood: 'celebrate', screen: String(left), cls: 'celebrate', label: 'Celebración' }) +
    `<div><b>${left ? '¡Una menos!' : '¡Terminaste lo de hoy!'}</b><span>${left ? `Te ${left === 1 ? 'queda 1 tarea' : `quedan ${left} tareas`} para hoy.` : 'Excelente trabajo. Puedes adelantar lo de mañana.'}</span></div>`;
  document.body.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 320); }, 2800);
}

/* Los ojos siguen el puntero y la figura se inclina en 3D (PC); se puede arrastrar para girarla */
const clampN = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const BUDDY_SEL = '.buddy-card .buddy, .lock .buddy';
let buddyRaf = 0, buddyDrag = null, buddySwallow = false;
document.addEventListener('pointermove', e => {
  if (buddyDrag) {
    const dx = e.clientX - buddyDrag.x;
    if (Math.abs(dx) > 5) buddyDrag.moved = true;
    if (buddyDrag.moved) { buddyDrag.svg.style.transition = 'none'; buddyDrag.svg.style.transform = `perspective(640px) rotateY(${clampN(dx * .7, -38, 38)}deg)`; }
    return;
  }
  if (e.pointerType !== 'mouse' || buddyRaf) return;
  buddyRaf = requestAnimationFrame(() => {
    buddyRaf = 0;
    document.querySelectorAll(BUDDY_SEL).forEach(svg => {
      const r = svg.getBoundingClientRect(); if (!r.width) return;
      const cx = r.left + r.width / 2, cy = r.top + r.height * .27;
      const dx = e.clientX - cx, dy = e.clientY - cy, d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 300) * 1.7;
      const p = svg.querySelector('.b-pupils'); if (p) p.style.transform = `translate(${(dx / d * k).toFixed(2)}px,${(dy / d * k).toFixed(2)}px)`;
      svg.style.transition = 'transform .25s ease-out';
      svg.style.transform = `perspective(640px) rotateY(${(clampN(dx / 450, -1, 1) * 11).toFixed(1)}deg) rotateX(${(-clampN(dy / 450, -1, 1) * 6).toFixed(1)}deg)`;
    });
  });
}, { passive: true });
document.addEventListener('pointerdown', e => {
  const svg = e.target.closest && e.target.closest(BUDDY_SEL);
  if (svg) buddyDrag = { x: e.clientX, svg, moved: false };
}, { passive: true });
const buddyRelease = () => {
  if (!buddyDrag) return;
  const { svg, moved } = buddyDrag; buddyDrag = null;
  svg.style.transition = 'transform .7s cubic-bezier(.2,1.6,.4,1)'; svg.style.transform = '';
  if (moved) { buddySwallow = true; setTimeout(() => { buddySwallow = false; }, 80); }
};
document.addEventListener('pointerup', buddyRelease, { passive: true });
document.addEventListener('pointercancel', buddyRelease, { passive: true });
document.addEventListener('click', e => { if (buddySwallow) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);
