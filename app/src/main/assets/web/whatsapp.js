/* GS Agenda: analizar un chat de WhatsApp exportado (.txt), ver qué mensajes recibidos quedaron sin responder y crear tareas.
 * Todo se procesa en el equipo; el chat no se sube a ningún lado. */
(function () {
  const norm = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9ñ ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const hash = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
  const clean = s => String(s).replace(/[‎‏‪-  ]/g, ' ');

  /* ---- lectura del archivo exportado (Android: "12/11/2026, 1:23 p. m. - Ana: hola"; iPhone: "[12/11/26, 1:23:45 p. m.] Ana: hola") ---- */
  const D = '(\\d{1,2})[\\/.\\-](\\d{1,2})[\\/.\\-](\\d{2,4})', T = '(\\d{1,2}):(\\d{2})(?::\\d{2})?\\s*(?:([ap])\\.?\\s?m\\.?)?';
  const RE_A = new RegExp('^' + D + ',?\\s+' + T + '\\s*[-–]\\s+([^:]{1,80}?):\\s([\\s\\S]*)$', 'i');
  const RE_I = new RegExp('^\\[' + D + ',?\\s+' + T + '\\]\\s+([^:]{1,80}?):\\s([\\s\\S]*)$', 'i');
  const RE_SYS = new RegExp('^' + D + ',?\\s+' + T + '\\s*[-–]\\s+', 'i');
  const MEDIA = /(<multimedia omitido>|<media omitted>|imagen omitida|image omitted|video omitido|audio omitido|sticker omitido|documento omitido|\(archivo adjunto\)|\.(jpg|jpeg|png|pdf|opus|mp4|docx?|xlsx?)\s*\(archivo adjunto\))/i;

  function parseChat(raw) {
    const text = clean(String(raw || '').replace(/^﻿/, '')).replace(/\r/g, '');
    if (text.startsWith('PK')) throw new Error('Ese es un .zip. Exporta el chat «Sin archivos multimedia» y abre el .txt.');
    const msgs = []; let cur = null, unknownDay = 0;
    const push = m => { if (cur) msgs.push(cur); cur = m; };
    for (const line of text.split('\n')) {
      const m = line.match(RE_A) || line.match(RE_I);
      if (m) {
        let [, d, mo, y, h, mi, ap, who, body] = m; y = +y < 100 ? 2000 + +y : +y; h = +h;
        if (ap) { ap = ap.toLowerCase(); if (ap === 'p' && h < 12) h += 12; if (ap === 'a' && h === 12) h = 0; }
        let day = +d, mon = +mo; if (mon > 12 && day <= 12) { [day, mon] = [mon, day]; unknownDay++; }
        push({ ts: new Date(y, mon - 1, day, h, +mi).getTime(), who: who.trim(), text: body });
      } else if (RE_SYS.test(line)) { push(null); }               /* línea del sistema (cifrado, se unió, etc.) */
      else if (cur) cur.text += '\n' + line;
    }
    push(null);
    return msgs.filter(m => m.text.trim() !== '').map(m => ({ ...m, text: m.text.trim(), media: MEDIA.test(m.text) }));
  }

  /* ---- clasificación ---- */
  const ACK = /^(ok|oki|okey|vale|listo|gracias|muchas gracias|mil gracias|perfecto|dale|de acuerdo|recibido|entendido|buenos dias|buenas tardes|buenas noches|buen dia|hola|si|sí|no|jaja+|ja+|👍|🙏|👌|✅|ok gracias|gracias a ti|con gusto|igualmente)[ .!👍🙏👌✅]*$/i;
  const ASK = /(\?|¿|\bfavor\b|\bnecesit|\benvi(a|e|ar|en|enme|ame)\b|\bmand(a|e|ar|en|ame|enme)\b|\bconfirm|\brevis(a|e|ar|en)\b|\bcu(a|á)ndo\b|\bc(o|ó)mo\b|\bqu(e|é) (paso|pas(o|ó)|hay)\b|\bpendiente|\burgente|\bpuedes\b|\bpodr(i|í)as\b|\bme (ayudas|colaboras|regalas|indicas|dices|cuentas)\b|\bpor qu(e|é)\b|\bd(o|ó)nde\b|\bcolabor|\bagend|\bresponde|\bavis(a|ame|en)\b|\bquedo atent|\bquedamos)/i;
  const URG = /(urgente|hoy mismo|para hoy|lo antes posible|asap|ya mismo)/i;

  function analyze(msgs, me, opts) {
    opts = opts || {};
    const from = opts.from || 0;
    const list = msgs.filter(m => m.ts >= from);
    const out = [];
    for (let i = 0; i < list.length; i++) {
      const m = list[i]; if (m.who === me) continue;
      let reply = null;
      for (let j = i + 1; j < list.length; j++) if (list[j].who === me) { reply = list[j]; break; }
      const t = m.text, n = norm(t);
      let kind = ACK.test(t.trim()) || n === '' ? 'cortesia' : m.media && t.replace(MEDIA, '').trim() === '' ? 'adjunto' : ASK.test(t) ? 'solicitud' : 'informativo';
      const mentions = !!opts.myName && n.includes(norm(opts.myName).split(' ')[0] || '§');
      out.push({ ...m, reply, kind, urgent: URG.test(t), mentions, delayMin: reply ? Math.round((reply.ts - m.ts) / 60000) : null,
        estado: reply ? 'Respondido' : kind === 'solicitud' ? 'Pendiente' : kind === 'adjunto' ? 'Revisar adjunto' : kind === 'cortesia' ? 'Sin respuesta (cortesía)' : 'Sin respuesta (informativo)' });
    }
    return out;
  }

  /* ---- interfaz ---- */
  const fmt = ts => new Date(ts).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit' });
  const short = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
  const csvCell = v => '"' + String(v ?? '').replace(/"/g, '""').replace(/\n/g, ' ') + '"';

  async function open(raw) {
    let msgs;
    try { msgs = parseChat(raw); } catch (e) { UI.toast(e.message); return; }
    if (!msgs.length) { UI.toast('No encontré mensajes. Exporta el chat desde WhatsApp (⋮ > Más > Exportar chat > Sin archivos).'); return; }
    const people = {}; msgs.forEach(m => people[m.who] = (people[m.who] || 0) + 1);
    const names = Object.keys(people).sort((a, b) => people[b] - people[a]);
    const myName = S.state.settings.name || '';
    const guess = names.find(n => myName && norm(n).includes(norm(myName).split(' ')[0])) || '';
    const d0 = new Date(msgs[0].ts), d1 = new Date(msgs[msgs.length - 1].ts);
    const body = `<p>Encontré <b>${msgs.length}</b> mensajes entre <b>${names.length}</b> personas, del <b>${esc(fmtDate(d0.getTime()))}</b> al <b>${esc(fmtDate(d1.getTime()))}</b>.</p>
      <div class="field"><label for="waMe">¿Cuál eres tú en este chat?</label><select class="input" id="waMe"><option value="">Elige tu nombre…</option>${names.map(n => `<option value="${esc(n)}"${n === guess ? ' selected' : ''}>${esc(n)} (${people[n]})</option>`).join('')}</select></div>
      <div class="field"><label for="waFrom">Revisar</label><select class="input" id="waFrom"><option value="7">Últimos 7 días</option><option value="30" selected>Últimos 30 días</option><option value="90">Últimos 90 días</option><option value="0">Todo el chat</option></select></div>`;
    let pick = null;
    const go = await modal('Chat de WhatsApp', body, [{ label: 'Cancelar', value: false }, { label: 'Analizar', value: true, primary: true, check: async m => { const me = m.querySelector('#waMe').value; if (!me) { UI.toast('Elige cuál eres tú'); return false; } pick = { me, days: +m.querySelector('#waFrom').value }; return true; } }]);
    if (!go || !pick) return;
    const from = pick.days ? Date.now() - pick.days * 86400000 : 0;
    const res = analyze(msgs, pick.me, { from, myName });
    const pend = res.filter(r => r.estado === 'Pendiente').sort((a, b) => b.ts - a.ts);
    const rev = res.filter(r => r.estado === 'Revisar adjunto').length, done = res.filter(r => r.reply).length, info = res.filter(r => r.estado === 'Sin respuesta (informativo)').length;
    const shown = pend.slice(0, 40);
    const lis = shown.map((r, i) => `<label style="display:flex;gap:8px;align-items:flex-start;margin:6px 0;font-size:13px"><input type="checkbox" data-wa="${i}" checked style="margin-top:3px"><span><b>${esc(r.who)}</b> · ${esc(fmt(r.ts))}${r.urgent ? ' · <b style="color:#b42318">urgente</b>' : ''}<br>${esc(short(r.text.replace(/\n/g, ' '), 140))}</span></label>`).join('');
    const body2 = `<p><b>${res.length}</b> mensajes recibidos · <b>${done}</b> con respuesta tuya · <b style="color:#b42318">${pend.length}</b> pendientes por responder${rev ? ` · ${rev} adjuntos por revisar` : ''}${info ? ` · ${info} informativos sin respuesta` : ''}.</p>
      ${pend.length ? `<div style="max-height:44vh;overflow:auto;border:1px solid var(--line,#dde3e9);border-radius:10px;padding:6px 10px">${lis}</div>${pend.length > shown.length ? `<div class="p-sub">Se muestran los ${shown.length} más recientes de ${pend.length}. El Excel trae todos.</div>` : ''}` : '<p>No quedó nada pendiente. 👏</p>'}
      <div class="p-sub">Pendiente = mensaje de otra persona con pregunta o solicitud, sin ningún mensaje tuyo después. Es una ayuda: revisa antes de crear tareas.</div>`;
    let sel = [];
    const act = await modal('Pendientes por responder', body2, [
      { label: 'Cerrar', value: 'x' },
      { label: 'Excel (CSV)', value: 'csv' },
      ...(pend.length ? [{ label: 'Crear tareas', value: 'tasks', primary: true, check: async m => { sel = [...m.querySelectorAll('[data-wa]')].filter(c => c.checked).map(c => shown[+c.dataset.wa]); if (!sel.length) { UI.toast('Marca al menos un mensaje'); return false; } return true; } }] : []),
    ]);
    if (act === 'csv') {
      const head = ['Fecha', 'Hora', 'De', 'Mensaje', 'Tipo', 'Estado', 'Urgente', 'Mi respuesta (fecha)', 'Mi respuesta', 'Demora (min)'];
      const rows = res.map(r => [new Date(r.ts).toLocaleDateString('es-CO'), new Date(r.ts).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }), r.who, r.text, r.kind, r.estado, r.urgent ? 'Sí' : '', r.reply ? new Date(r.reply.ts).toLocaleString('es-CO') : '', r.reply ? r.reply.text : '', r.delayMin ?? '']);
      downloadText(`WhatsApp-pendientes-${toDateInput(Date.now())}.csv`, 'text/csv', '﻿' + [head, ...rows].map(r => r.map(csvCell).join(';')).join('\r\n'));
    } else if (act === 'tasks') {
      const now = Date.now(); let added = 0;
      commit(() => {
        for (const r of sel) {
          const id = 'wa-' + hash(r.ts + r.who + r.text); if (getTask(id)) continue;
          S.state.tasks.push(normalizeTask({ id, title: short('Responder a ' + r.who + ': ' + r.text.replace(/\n/g, ' '), 90), category: 'WhatsApp', notes: r.text + '\n\n' + fmt(r.ts) + ' · ' + r.who,
            dueAt: now + 3600000, durationMin: 15, priority: r.urgent || r.mentions ? 'HIGH' : 'MEDIUM', status: 'PENDING', reminders: [30], source: { from: r.who + ' (WhatsApp)', received: r.ts }, createdAt: now, updatedAt: now }));
          added++;
        }
      });
      UI.toast(added ? `${added} tareas creadas` : 'Esas tareas ya existían');
    }
  }

  /* ---- cargar el archivo (web: selector; Android: el mismo lector que usa «Importar tareas») ---- */
  let pending = false;
  ACT.whatsapp = () => {
    if (IS_ANDROID) { pending = true; try { Native.openBackup(); } catch { pending = false; UI.toast('No se pudo abrir el selector'); } return; }
    const i = document.createElement('input'); i.type = 'file'; i.accept = '.txt,text/plain';
    i.onchange = async () => { const f = i.files[0]; if (f) open(await f.text()); };
    i.click();
  };
  const prevRestore = ACT.restore;
  ACT.restore = (...a) => { pending = false; return prevRestore(...a); };
  const prevBackup = nativeHandlers.backup;
  nativeHandlers.backup = text => { if (pending) { pending = false; if (text) open(text); else UI.toast('No se pudo leer el archivo'); } else prevBackup && prevBackup(text); };
  window.__gsWhatsapp = { parseChat, analyze, open };
})();
