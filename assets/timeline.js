// Timeline: one row per major conjecture on a piecewise-linear year axis.
(async () => {
  const app = await loadJSON('appendix');
  const rows = app.history.slice().sort((a, b) => a.posed - b.posed);
  const colour = s => /disproved/.test(s) ? '#D0021B' : /^proved for large|asymptotic/.test(s) ? '#F5A623' : /^proved/.test(s) ? '#2E9E3E' : '#4A90E2';
  const plainStatus = h => h.status.replace(/<[^>]*>/g, '');
  document.getElementById('legend').innerHTML = [['#4A90E2', 'open'], ['#F5A623', 'proved for large n or asymptotically'], ['#2E9E3E', 'proved'], ['#D0021B', 'disproved']]
    .map(([c, t]) => `<span style="--dot:${c}">${t}</span>`).join('');
  const L = 275, W = 980, R = 20, top = 28, rowH = 26, Y0 = 1700, Y1 = 1950, Y2 = 2027;
  const x = y => y <= Y1 ? L + (W - L - R) * 0.18 * (y - Y0) / (Y1 - Y0) : L + (W - L - R) * (0.18 + 0.82 * (y - Y1) / (Y2 - Y1));
  const H = top + rows.length * rowH + 10;
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:${W}px">`;
  [1800, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020].forEach(y => {
    s += `<line x1="${x(y)}" x2="${x(y)}" y1="${top - 8}" y2="${H - 6}" stroke="#e6e8ec"/><text x="${x(y)}" y="${top - 12}" font-size="11" text-anchor="middle" fill="#5d6470">${y}</text>`;
  });
  rows.forEach((h, i) => {
    const y = top + i * rowH + rowH / 2, c = colour(plainStatus(h));
    const years = h.milestones.map(m => m.year).filter(Boolean);
    const last = Math.max(h.posed, ...years);
    s += `<g class="row" data-i="${i}" style="cursor:pointer"><rect x="0" y="${y - rowH / 2}" width="${W}" height="${rowH}" fill="transparent"/>`;
    s += `<text x="${L - 10}" y="${y + 4}" font-size="12.5" text-anchor="end" fill="#1d1f24">${h.name.replace(/<[^>]*>/g, '').replace(/\$/g, '')}</text>`;
    s += `<line x1="${x(h.posed)}" x2="${x(last)}" y1="${y}" y2="${y}" stroke="${c}" stroke-width="2" opacity=".55"/>`;
    s += `<path d="M${x(h.posed)} ${y - 6} l6 6 l-6 6 l-6 -6 z" fill="${c}"/>`;
    years.forEach(yr => { s += `<circle cx="${x(yr)}" cy="${y}" r="4.2" fill="#fff" stroke="${c}" stroke-width="2"/>`; });
    s += '</g>';
  });
  s += '</svg>';
  const chart = document.getElementById('chart'); chart.innerHTML = s;
  const detail = document.getElementById('detail');
  const pick = i => {
    const h = rows[i];
    chart.querySelectorAll('.row rect').forEach((r, j) => r.setAttribute('fill', j === i ? '#f1f4fa' : 'transparent'));
    detail.innerHTML = `<h3 style="margin-top:0">${h.name} <span class="hint">posed ${h.posedLabel}</span></h3><p>${h.statement}</p>
      <ul class="stones">${h.milestones.map(m => `<li>${m.label ? '<b>' + m.label + '</b>: ' : ''}${m.text}</li>`).join('')}</ul>
      <p><span class="chip">${h.status}</span> &nbsp; In the text: ${h.where}</p>`;
    renderMath(detail);
  };
  chart.addEventListener('click', e => { const g = e.target.closest('.row'); if (g) pick(+g.dataset.i); });
  const want = new URLSearchParams(location.search).get('c');
  if (want) { const i = rows.findIndex(h => h.labels.includes(want)); if (i >= 0) pick(i); }
})();
