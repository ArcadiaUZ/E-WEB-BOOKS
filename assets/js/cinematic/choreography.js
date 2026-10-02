import { clamp, smoothstep } from '../core/env.js';

export function createChoreography(root) {
  const beats = Array.from(root.querySelectorAll('.beat')).map((node) => ({
    node,
    from: parseFloat(node.dataset.from),
    to: parseFloat(node.dataset.to),
    alpha: -1,
    label: node.querySelector('.beat-index')?.textContent?.trim() || '',
  }));

  const hud = document.getElementById('cinema-hud');
  const hudFill = document.getElementById('hud-fill');
  const hudChapter = document.getElementById('hud-chapter');
  const hudFrame = document.getElementById('hud-frame');
  const rail = document.getElementById('scroll-rail-fill');
  const railWrap = document.querySelector('.scroll-rail');

  let lastFrameLabel = '';

  function applyBeat(beat, p) {
    const local = clamp((p - beat.from) / (beat.to - beat.from));
    const alpha =
      smoothstep(0, 0.24, local) * (1 - smoothstep(0.7, 1, local)) * (beat.to > 1 ? 1 : 1);
    if (Math.abs(alpha - beat.alpha) < 0.004) return beat.alpha;
    beat.alpha = alpha;
    const shift = (1 - alpha) * 46;
    const scale = 1 + (1 - alpha) * 0.035;
    const blur = (1 - alpha) * 7;
    beat.node.style.setProperty('--a', alpha.toFixed(3));
    beat.node.style.setProperty('--y', `${shift.toFixed(1)}px`);
    beat.node.style.setProperty('--s', scale.toFixed(4));
    beat.node.style.setProperty('--b', `${blur.toFixed(2)}px`);
    return alpha;
  }

  return {
    update(p, index, total) {
      let strongest = null;
      let strongestAlpha = 0;
      beats.forEach((beat) => {
        const alpha = applyBeat(beat, p);
        if (alpha > strongestAlpha) {
          strongestAlpha = alpha;
          strongest = beat;
        }
      });

      const pct = clamp(p) * 100;
      if (hudFill) hudFill.style.width = `${pct.toFixed(2)}%`;
      if (rail) rail.style.height = `${pct.toFixed(2)}%`;
      if (railWrap) railWrap.classList.toggle('is-on', strongestAlpha > 0.02);
      if (hud) hud.classList.toggle('is-on', strongestAlpha > 0.02);

      const chapter = strongest && strongestAlpha > 0.05 ? strongest.label : '';
      if (hudChapter && hudChapter.textContent !== chapter) hudChapter.textContent = chapter;

      const label = `${String(index).padStart(3, '0')} / ${String(total).padStart(3, '0')}`;
      if (hudFrame && label !== lastFrameLabel) {
        hudFrame.textContent = label;
        lastFrameLabel = label;
      }
    },
  };
}
