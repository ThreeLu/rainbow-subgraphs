// Results page: all numbered statements, searchable and filterable.
(async () => {
  const [stmts, meta] = await Promise.all([loadJSON('statements'), loadJSON('meta')]);
  const sel = document.getElementById('chapter');
  meta.chapters.filter(c => stmts.some(s => s.chapter === c.num))
    .forEach(c => sel.insertAdjacentHTML('beforeend', `<option value="${c.num}">${c.num}. ${c.title}</option>`));
  const kinds = { theorem: 'Theorem', conjecture: 'Conjecture', problem: 'Problem' };
  const params = new URLSearchParams(location.search);
  ['q', 'kind', 'chapter'].forEach(k => { if (params.get(k)) document.getElementById(k).value = params.get(k); });
  const draw = () => {
    const q = document.getElementById('q').value.toLowerCase().trim();
    const kind = document.getElementById('kind').value, ch = document.getElementById('chapter').value;
    const words = q.split(/\s+/).filter(Boolean);
    const shown = stmts.filter(s => (!kind || s.kind === kind) && (!ch || s.chapter === +ch) &&
      words.every(w => s.text.toLowerCase().includes(w)));
    document.getElementById('count').textContent = `${shown.length} of ${stmts.length} statements`;
    document.getElementById('list').innerHTML = shown.map(s => `
      <div class="item"><div class="meta"><span>${s.sectionTitle}</span>${s.status ? `<span class="chip ${s.statusClass}">${s.status}</span>` : ''}
      <a href="${s.page}#${s.id}">in the text →</a></div>
      <div><span class="title">${kinds[s.kind]} ${s.num}${s.heading ? ' (' + s.heading + ')' : ''}.</span>
      <div class="body">${s.body}</div></div></div>`).join('');
    renderMath(document.getElementById('list'));
  };
  ['q', 'kind', 'chapter'].forEach(id => document.getElementById(id).addEventListener('input', draw));
  draw();
})();
