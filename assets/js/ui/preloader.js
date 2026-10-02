export function createPreloader() {
  const root = document.getElementById('preloader');
  const fill = document.getElementById('preloader-fill');
  const pct = document.getElementById('preloader-pct');
  const label = document.getElementById('preloader-label');
  let value = 0;
  let shown = 0;
  let raf = 0;
  let done = false;

  function tick() {
    shown += (value - shown) * 0.14;
    const shownPct = Math.min(99, Math.round(shown * 100));
    if (fill) fill.style.width = `${(shownPct / 100) * 100}%`;
    if (pct) pct.textContent = `${shownPct}%`;
    if (value >= 1 && !done) {
      done = true;
      complete();
      return;
    }
    raf = requestAnimationFrame(tick);
  }

  function complete() {
    if (fill) fill.style.width = '100%';
    if (pct) pct.textContent = '100%';
    document.body.classList.remove('is-loading');
    setTimeout(() => {
      root.classList.add('is-done');
      root.hidden = true;
    }, 260);
  }

  raf = requestAnimationFrame(tick);

  return {
    set(next, text) {
      value = Math.max(value, Math.min(1, next));
      if (text && label) label.textContent = text;
    },
    finish() {
      value = 1;
    },
    destroy() {
      cancelAnimationFrame(raf);
    },
  };
}
