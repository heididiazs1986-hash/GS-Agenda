/* GS Agenda: importar tareas desde CSV o JSON (por ejemplo el plan de estudio). Liviano, sin librerías. */
(function () {
  const norm = s => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const KEYS = {
    date: ['fecha', 'fecha limite', 'vence', 'date', 'due', 'dueat'],
    time: ['hora', 'time'],
    title: ['tarea', 'titulo', 'title', 'nombre', 'actividad'],
    category: ['fase', 'categoria', 'category'],
    notes: ['notas', 'nota', 'notes', 'descripcion', 'plataforma'],
    week: ['semana', 'week'],
    duration: ['duracion min', 'duracion', 'durationmin', 'minutos'],
    priority: ['prioridad', 'priority'],
    status: ['estado', 'status'],
  };
  function pickKey(row, names) { for (const n of names) if (row[n] != null && String(row[n]).trim() !== '') return row[n]; return ''; }

  function parseCSV(text) {
    text = String(text).replace(/^\uFEFF/, '');
    const first = text.split(/\r?\n/, 1)[0] || '';
    const cnt = c => first.split(c).length - 1;
    const delim = cnt(';') >= cnt(',') && cnt(';') >= cnt('\t') ? ';' : (cnt('\t') > cnt(',') ? '\t' : ',');
    const rows = []; let row = [], cur = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
      else if (c === '"') q = true;
      else if (c === delim) { row.push(cur); cur = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cur); cur = ''; if (row.some(x => x.trim() !== '')) rows.push(row); row = []; }
      else cur += c;
    }
    row.push(cur); if (row.some(x => x.trim() !== '')) rows.push(row);
    if (rows.length < 2) return [];
    const head = rows[0].map(norm);
    return rows.slice(1).map(r => { const o = {}; head.forEach((h, i) => { if (h) o[h] = (r[i] ?? '').trim(); }); return o; });
  }

  function parseDay(v) {
    if (v == null || v === '') return null;
    if (typeof v === 'number') { if (v > 1e11) return startOfDay(v); if (v > 20000 && v < 80000) { const d = new Date(Math.round((v - 25569) * 86400000)); return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()).getTime(); } return null; }
    const s = String(v).trim(); let m;
    if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))) return new Date(+m[1], +m[2] - 1, +m[3]).getTime();
    if ((m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/))) { const y = +m[3] < 100 ? 2000 + +m[3] : +m[3]; return new Date(y, +m[2] - 1, +m[1]).getTime(); }
    if (/^\d+$/.test(s)) return parseDay(Number(s));
    return null;
  }
  const mapPrio = v => { const s = norm(v); return /^(alta|high|urgente)/.test(s) ? 'HIGH' : /^(baja|low)/.test(s) ? 'LOW' : 'MEDIUM'; };
  const mapStatus = v => { const s = norm(v); return /(hecho|complet|listo|done|termin)/.test(s) ? 'COMPLETED' : /(curso|progreso|progress)/.test(s) ? 'IN_PROGRESS' : /espera|wait/.test(s) ? 'WAITING' : 'PENDING'; };
  const hash = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };

  /* Convierte filas genéricas (CSV o JSON) en tareas. Devuelve { tasks, skipped } */
  function rowsToTasks(rows, defaultTime) {
    const tasks = [], seen = {}; let skipped = 0;
    for (const raw of rows) {
      const r = {}; for (const k in raw) r[norm(k)] = raw[k];
      const title = String(pickKey(r, KEYS.title)).trim();
      const day = parseDay(pickKey(r, KEYS.date));
      if (!title || day == null) { skipped++; continue; }
      const hm = String(pickKey(r, KEYS.time) || '').match(/^(\d{1,2}):(\d{2})/);
      const dueAt = (typeof pickKey(r, KEYS.date) === 'number' && pickKey(r, KEYS.date) > 1e11 && !hm) ? pickKey(r, KEYS.date) : startOfDay(day) + (hm ? (+hm[1] * 60 + +hm[2]) * MIN : parseHM(defaultTime));
      const status = mapStatus(pickKey(r, KEYS.status));
      const week = pickKey(r, KEYS.week), note = String(pickKey(r, KEYS.notes) || '').trim();
      const base = 'imp-' + toDateInput(day) + '-' + hash(title); seen[base] = (seen[base] || 0) + 1;
      tasks.push({
        id: seen[base] > 1 ? base + '-' + seen[base] : base, title, category: String(pickKey(r, KEYS.category) || '').trim(),
        notes: [note, week ? 'Semana ' + week : ''].filter(Boolean).join('\n'),
        dueAt, durationMin: Number(pickKey(r, KEYS.duration)) || 30, priority: mapPrio(pickKey(r, KEYS.priority)), status,
        reminders: [], completedAt: status === 'COMPLETED' ? dueAt : null,
      });
    }
    return { tasks, skipped };
  }

  /* Detecta el tipo de archivo y devuelve { tasks, skipped } o lanza un Error con un mensaje claro */
  function parseImport(text, defaultTime) {
    const t = String(text || '').replace(/^\uFEFF/, '').trim();
    if (!t) throw new Error('El archivo está vacío');
    if (t.startsWith('PK')) throw new Error('Ese es un archivo de Excel (.xlsx). En Excel usa Guardar como > CSV UTF-8, o importa el archivo .csv o .json del plan.');
    if (t[0] === '{' || t[0] === '[') {
      let j; try { j = JSON.parse(t); } catch { throw new Error('El archivo JSON no es válido'); }
      const arr = Array.isArray(j) ? j : (Array.isArray(j.tareas) ? j.tareas : Array.isArray(j.tasks) ? j.tasks : null);
      if (!arr) throw new Error('No encontré tareas en ese JSON. Si es una copia de seguridad, usa Restaurar copia.');
      return rowsToTasks(arr, defaultTime);
    }
    return rowsToTasks(parseCSV(t), defaultTime);
  }

  let pending = false;
  async function runImport(text) {
    const ok = await openImport(text); return ok;
  }
  async function openImport(text) {
    let res;
    try { res = parseImport(text, '19:00'); } catch (e) { UI.toast(e.message); return; }
    if (!res.tasks.length) { UI.toast('No encontré tareas con fecha y título en ese archivo'); return; }
    const all = res.tasks, dates = all.map(t => t.dueAt).sort((a, b) => a - b);
    const sample = all.slice().sort((a, b) => a.dueAt - b.dueAt).slice(0, 4).map(t => `<li>${esc(fmtDate(t.dueAt))} · ${esc(t.title.length > 60 ? t.title.slice(0, 57) + '…' : t.title)}</li>`).join('');
    const body = `<p>Encontré <b>${all.length}</b> tareas del <b>${esc(fmtDate(dates[0]))}</b> al <b>${esc(fmtDate(dates[dates.length - 1]))}</b>${res.skipped ? ` (${res.skipped} filas sin fecha o título se omiten)` : ''}.</p>
      <ul style="margin:6px 0 10px 18px;font-size:13px">${sample}</ul>
      <div class="field"><label for="impTime">Hora de estudio</label><input type="time" class="input" id="impTime" value="19:00"></div>
      <div class="field"><label for="impRange">Qué importar</label><select class="input" id="impRange"><option value="all">Todo el plan</option><option value="30">Solo los próximos 30 días</option></select></div>
      <div class="field"><label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="impPast" checked> Omitir las que ya pasaron</label></div>
      <div class="p-sub">Si ya importaste antes, las tareas repetidas no se duplican ni pisan tus cambios.</div>`;
    let pick = null;
    const go = await modal('Importar tareas', body, [{ label: 'Cancelar', value: false }, { label: 'Importar', value: true, primary: true, check: async m => { pick = { time: m.querySelector('#impTime').value || '19:00', range: m.querySelector('#impRange').value, past: m.querySelector('#impPast').checked }; return true; } }]);
    if (!go || !pick) return;
    const redo = parseImport(text, pick.time).tasks, now = Date.now(), t0 = startOfDay(now);
    let list = redo;
    if (pick.past) list = list.filter(t => t.dueAt >= t0);
    if (pick.range === '30') list = list.filter(t => t.dueAt < t0 + 30 * DAY);
    let added = 0;
    commit(() => { for (const t of list) if (!getTask(t.id)) { S.state.tasks.push(normalizeTask({ ...t, createdAt: now, updatedAt: now })); added++; } });
    UI.toast(added ? `${added} tareas importadas` : 'No había tareas nuevas para importar');
  }

  ACT.importar = () => {
    if (IS_ANDROID) { pending = true; try { Native.openBackup(); } catch { pending = false; } return; }
    const i = document.createElement('input'); i.type = 'file'; i.accept = '.csv,.json,.txt,text/csv,application/json,text/plain';
    i.onchange = async () => { const f = i.files[0]; if (f) runImport(await f.text()); };
    i.click();
  };
  const prevRestore = ACT.restore;
  ACT.restore = (...a) => { pending = false; return prevRestore(...a); };
  const prevBackup = nativeHandlers.backup;
  nativeHandlers.backup = text => { if (pending) { pending = false; if (text) runImport(text); else UI.toast('No se pudo leer el archivo'); } else prevBackup && prevBackup(text); };
  window.__gsImport = { parseCSV, parseImport, rowsToTasks };
})();
