// Open problems page: all conjectures and problems with status, history and related main-line rows.
(async () => {
  const [stmts, meta, app] = await Promise.all([loadJSON('statements'), loadJSON('meta'), loadJSON('appendix')]);
  const items = stmts.filter(s => s.kind !== 'theorem');
  const hist = {}; app.history.forEach(h => h.labels.forEach(l => { hist[l] = h; }));
  const names = { open: 'Open', large: 'Proved for large n', proved: 'Proved', partial: 'Asymptotic form proved', disproved: 'Disproved' };
  const on = new Set(Object.keys(names));
  const box = document.getElementById('statuses');
  Object.entries(names).forEach(([k, v]) => {
    const n = items.filter(s => s.statusClass === k).length;
    if (!n) { on.delete(k); return; }
    box.insertAdjacentHTML('beforeend', `<button class="chip ${k}" data-k="${k}">${v} (${n})</button>`);
  });
  box.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    on.has(b.dataset.k) ? on.delete(b.dataset.k) : on.add(b.dataset.k); b.classList.toggle('off'); draw();
  });
  const sel = document.getElementById('chapter');
  meta.chapters.filter(c => items.some(s => s.chapter === c.num))
    .forEach(c => sel.insertAdjacentHTML('beforeend', `<option value="${c.num}">${c.num}. ${c.title}</option>`));
  const draw = () => {
    const words = document.getElementById('q').value.toLowerCase().split(/\s+/).filter(Boolean), ch = sel.value;
    const shown = items.filter(s => on.has(s.statusClass) && (!ch || s.chapter === +ch) && words.every(w => s.text.toLowerCase().includes(w)));
    document.getElementById('count').textContent = `${shown.length} of ${items.length} conjectures and problems`;
    document.getElementById('list').innerHTML = shown.map(s => {
      const h = hist[s.id];
      const stones = h ? `<details><summary>History (posed ${h.posedLabel})</summary><ul class="stones">${h.milestones.map(m =>
        `<li>${m.label ? '<b>' + m.label + '</b>: ' : ''}${m.text}</li>`).join('')}</ul></details>` : '';
      return `<div class="item"><div class="meta"><span class="chip ${s.statusClass}">${s.status}</span><span>${s.sectionTitle}</span>
        <a href="${s.page}#${s.id}">in the text →</a></div>
        <div><span class="title">${s.kind === 'problem' ? 'Problem' : 'Conjecture'} ${s.num}${s.heading ? ' (' + s.heading + ')' : ''}.</span>
        <div class="body">${s.body}</div></div>${stones}</div>`;
    }).join('');
    renderMath(document.getElementById('list'));
  };
  document.getElementById('q').addEventListener('input', draw); sel.addEventListener('input', draw);
  draw();
})();
