import { clamp } from '../core/env.js';

export function createSequencePlayer(canvas, loader, options = {}) {
  const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
  const maxDpr = options.maxDpr ?? 1.6;
  let dpr = 1;
  let width = 0;
  let height = 0;
  let current = -1;
  let painted = null;
  let transform = 1;
  let offset = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    width = canvas.clientWidth || window.innerWidth;
    height = canvas.clientHeight || window.innerHeight;
    const w = Math.round(width * dpr);
    const h = Math.round(height * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    if (painted) draw(painted, current);
  }

  function geometry(frameW, frameH) {
    const scale = Math.max(width / frameW, height / frameH) * transform;
    const drawW = frameW * scale;
    const drawH = frameH * scale;
    return { drawW, drawH, x: (width - drawW) / 2, y: (height - drawH) / 2 - offset };
  }

  function draw(frame, index) {
    if (!frame) return;
    const fw = frame.width;
    const fh = frame.height;
    const { drawW, drawH, x, y } = geometry(fw, fh);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = '#05070b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(frame, 0, 0, fw, fh, x * dpr, y * dpr, drawW * dpr, drawH * dpr);
    painted = frame;
    current = index;
  }

  return {
    resize,

    /** Progress (0..1) → indeks. Frame tayyor bo'lmasa oldingi ko'rinish saqlanadi. */
    render(progress, opts = {}) {
      const count = loader.count;
      const index = Math.round(clamp(progress) * (count - 1));
      const frame = loader.get(index) || loader.get(nearestLoaded(index));
      const nextTransform = opts.transform ?? 1.06;
      const nextOffset = opts.offset ?? 0;
      const moved =
        Math.abs(nextTransform - transform) > 0.0004 || Math.abs(nextOffset - offset) > 0.25;
      transform = nextTransform;
      offset = nextOffset;
      if (!frame) return index;
      if (frame !== painted || moved) draw(frame, index);
      return index;
    },

    get paintedIndex() {
      return current;
    },

    get hasImage() {
      return Boolean(painted);
    },

    destroy() {
      painted = null;
      current = -1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
  };

  function nearestLoaded(index) {
    for (let d = 1; d <= 12; d++) {
      if (loader.has(index - d)) return index - d;
      if (loader.has(index + d)) return index + d;
    }
    return index;
  }
}
