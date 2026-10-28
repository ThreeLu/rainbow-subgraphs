// Threshold strips with hover read-outs.
(async () => {
  const app = await loadJSON('appendix');
  const fill = { holds: '#9fd4a8', fails: '#ef9aa3', open: '#e3e5e8' };
  const word = { holds: 'proved', fails: 'ruled out', open: 'open' };
  const fmt = v => (Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : (+v.toFixed(3)).toString());
  const box = document.getElementById('strips');
  box.innerHTML = app.strips.map((s, i) => `<div class="strip"><h3>${String.fromCharCode(97 + i)}) ${s.title}</h3>
    <div class="chart" id="strip${i}"></div><p class="readout hint" id="ro${i}">Hover over the bar.</p>
    <p class="src">Axis: ${s.axis}.${s.note ? ' ' + s.note[0].toUpperCase() + s.note.slice(1) + '.' : ''} In the text: ${s.where}.</p></div>`).join('');
  renderMath(box);
  app.strips.forEach((s, i) => {
    const W = 760, L = 10, R = 10, H = 64, y = 22, h = 22, [lo, hi] = s.range;
    const X = v => L + (W - L - R) * (v - lo) / (hi - lo);
    let g = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`;
    s.regions.forEach(([a, b, k], j) => { g += `<rect class="reg" data-j="${j}" x="${X(a)}" y="${y}" width="${X(b) - X(a)}" height="${h}" fill="${fill[k]}"/>`; });
    g += `<rect x="${X(lo)}" y="${y}" width="${X(hi) - X(lo)}" height="${h}" fill="none" stroke="#888"/>`;
    s.ticks.forEach(([v]) => { g += `<line x1="${X(v)}" x2="${X(v)}" y1="${y + h}" y2="${y + h + 5}" stroke="#333"/>`; });
    if (s.conjectured != null) { const c = X(s.conjectured); g += `<path d="M${c - 6} ${y - 11} h12 l-6 9 z" fill="#1d1f24"/>`; }
    g += '</svg>';
    const el = document.getElementById('strip' + i);
    el.style.position = 'relative'; el.innerHTML = g;
    s.ticks.forEach(([v, lab]) => {
      el.insertAdjacentHTML('beforeend', `<span style="position:absolute;left:${X(v)}px;top:${y + h + 6}px;transform:translateX(-50%);font-size:13px">${lab}</span>`);
    });
    el.style.height = (H + 14) + 'px';
    renderMath(el);
    const ro = document.getElementById('ro' + i);
    el.querySelectorAll('.reg').forEach(r => r.addEventListener('mouseenter', () => {
      const [a, b, k] = s.regions[+r.dataset.j];
      ro.innerHTML = `<b>${word[k]}</b> for ${fmt(a)} ≤ ${s.axis.replace(/<[^>]*>/g, '')} ≤ ${fmt(b)} (endpoints as stated in the text)`;
      ro.classList.remove('hint');
    }));
  });
})();
