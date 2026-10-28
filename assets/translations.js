// Translations: bipartite relation map between areas and rainbow structures.
(async () => {
  const [app, labels] = await Promise.all([loadJSON('appendix'), loadJSON('labels')]);
  const T = app.translations, F = Object.keys(T.fields), G = Object.keys(T.targets);
  const W = 940, top = 20, gap = 46, H = top + Math.max(F.length, G.length) * gap;
  const yF = k => top + F.indexOf(k) * gap + gap / 2, yG = k => top + (G.indexOf(k) + (F.length - G.length) / 2) * gap + gap / 2;
  const xL = 270, xR = W - 290;
  const pairs = {};
  T.items.forEach(it => { const k = it.field + '|' + it.target; pairs[k] = (pairs[k] || 0) + 1; });
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:${W}px">`;
  Object.entries(pairs).forEach(([k, n]) => {
    const [f, t] = k.split('|');
    s += `<path class="edge" data-f="${f}" data-t="${t}" d="M${xL} ${yF(f)} C ${(xL + xR) / 2} ${yF(f)}, ${(xL + xR) / 2} ${yG(t)}, ${xR} ${yG(t)}" fill="none" stroke="#9aa6b8" stroke-width="${1 + 1.6 * n}" opacity=".55"/>`;
  });
  F.forEach(f => { s += `<g class="node" data-f="${f}" style="cursor:pointer"><circle cx="${xL}" cy="${yF(f)}" r="7" fill="#4A90E2"/><text x="${xL - 14}" y="${yF(f) + 4}" text-anchor="end" font-size="14">${T.fields[f]}</text></g>`; });
  G.forEach(t => { s += `<g class="node" data-t="${t}" style="cursor:pointer"><circle cx="${xR}" cy="${yG(t)}" r="7" fill="#9013FE"/><text x="${xR + 14}" y="${yG(t) + 4}" font-size="14">${T.targets[t]}</text></g>`; });
  s += '</svg>';
  const graph = document.getElementById('graph'); graph.innerHTML = s;
  const list = document.getElementById('items');
  const show = (f, t) => {
    graph.querySelectorAll('.edge').forEach(e => {
      const hit = (f && e.dataset.f === f) || (t && e.dataset.t === t);
      e.setAttribute('stroke', hit ? '#2b5fae' : '#9aa6b8'); e.setAttribute('opacity', hit || (!f && !t) ? '.85' : '.2');
    });
    const its = T.items.filter(it => (!f && !t) || it.field === f || it.target === t);
    list.innerHTML = `<p class="count">${its.length} translation${its.length === 1 ? '' : 's'}${f ? ' from ' + T.fields[f] : t ? ' to ' + T.targets[t].toLowerCase() : ''}</p>` +
      its.map(it => {
        const fig = labels[it.figure];
        return `<div class="tr-item"><div><b>${it.problem}</b><div class="arrow">↓</div><div>${it.rainbow}</div>
          <p class="hint"><a href="${it.where}">Section ${it.whereNum}</a>${fig ? ` · <a class="xref" data-label="${it.figure}" href="${fig.href}">Figure ${fig.num}</a>` : ''}</p></div>
          ${fig && fig.svg ? `<a href="${fig.href}"><img src="figures/${fig.svg}" alt="Figure ${fig.num}" loading="lazy"></a>` : '<span></span>'}</div>`;
      }).join('');
    renderMath(list);
  };
  graph.addEventListener('click', e => { const n = e.target.closest('.node'); if (n) show(n.dataset.f, n.dataset.t); });
  show();
})();
