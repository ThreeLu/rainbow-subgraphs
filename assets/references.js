// Filter the reference list.
(() => {
  const q = document.getElementById('q');
  q.addEventListener('input', () => {
    const words = q.value.toLowerCase().split(/\s+/).filter(Boolean);
    document.querySelectorAll('.refgroup').forEach(g => {
      let any = false;
      g.querySelectorAll('.ref').forEach(r => {
        const hit = words.every(w => r.textContent.toLowerCase().includes(w));
        r.style.display = hit ? '' : 'none'; any = any || hit;
      });
      g.style.display = any ? '' : 'none';
    });
  });
})();
