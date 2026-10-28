// Shared behaviour: KaTeX rendering and hover previews for references to statements, figures and citations.
const KATEX_MACROS = { '\\Knn': 'K_{n,n}', '\\eps': '\\varepsilon', '\\e': '\\varepsilon', '\\N': '\\mathbb{N}', '\\Z': '\\mathbb{Z}',
  '\\R': '\\mathbb{R}', '\\E': '\\mathbb{E}', '\\P': '\\mathbb{P}', '\\cF': '\\mathcal{F}', '\\cH': '\\mathcal{H}' };

function renderMath(el) {
  el.querySelectorAll('span.tex:not([data-done])').forEach(span => {
    let src = span.textContent, display = false;
    if (src.startsWith('\\[')) { src = src.slice(2, -2); display = true; }
    else if (src.startsWith('$')) { src = src.slice(1, -1); }
    try { katex.render(src, span, { displayMode: display, throwOnError: false, macros: KATEX_MACROS }); }
    catch (e) { console.warn(e); }
    span.dataset.done = '1';
  });
}

const cache = {};
async function loadJSON(name) {
  if (!cache[name]) cache[name] = fetch(`data/${name}.json`).then(r => r.json());
  return cache[name];
}

function escapeHTML(s) { return s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }

function setupTips() {
  const tip = document.getElementById('tip');
  let timer = null;
  const show = async (a) => {
    let html = '';
    if (a.classList.contains('cite')) {
      const refs = await loadJSON('refs'); const r = refs[a.dataset.key];
      if (r) html = `<span class="k">[${r.num}]</span> ${r.html}`;
    } else {
      const labels = await loadJSON('labels'); const l = labels[a.dataset.label];
      if (l && l.body) {
        html = `<span class="k">${l.kind} ${l.num}${l.heading ? ' (' + l.heading + ')' : ''}.</span> ` +
          (l.svg ? `<img src="figures/${l.svg}" alt="">` : '') + l.body;
      }
    }
    if (!html) return;
    tip.innerHTML = html; renderMath(tip);
    const r = a.getBoundingClientRect();
    tip.style.display = 'block';
    const w = tip.offsetWidth;
    let left = window.scrollX + r.left; if (left + w > window.scrollX + document.documentElement.clientWidth - 12) left = window.scrollX + document.documentElement.clientWidth - w - 12;
    tip.style.left = Math.max(8, left) + 'px';
    tip.style.top = (window.scrollY + r.bottom + 6) + 'px';
  };
  document.addEventListener('mouseover', e => {
    const a = e.target.closest('a.xref, a.cite');
    if (!a) return;
    clearTimeout(timer); timer = setTimeout(() => show(a), 180);
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('a.xref, a.cite')) { clearTimeout(timer); timer = setTimeout(() => { tip.style.display = 'none'; }, 150); }
  });
  tip.addEventListener('mouseover', () => clearTimeout(timer));
  tip.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
}

window.addEventListener('DOMContentLoaded', () => {
  // On small screens the chapter contents start collapsed.
  if (window.innerWidth <= 900) document.querySelectorAll('details.toc').forEach(d => d.removeAttribute('open'));
  renderMath(document.body);
  setupTips();
});
