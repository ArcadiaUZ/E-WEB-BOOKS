import { CONFIG } from '../config.js';

const hasBitmap = typeof createImageBitmap === 'function';

async function decode(blob) {
  if (hasBitmap) {
    try {
      return await createImageBitmap(blob);
    } catch {
      /* quyida Image orqali */
    }
  }
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await (img.decode ? img.decode() : new Promise((res, rej) => {
      img.onload = res;
      img.onerror = () => rej(new Error('decode failed'));
    }));
    return img;
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
}

const release = (frame) => {
  if (frame && typeof frame.close === 'function') frame.close();
};

export function createFrameLoader(source, options = {}) {
  const concurrency = options.concurrency ?? CONFIG.frames.concurrency;
  const keep = options.keep ?? CONFIG.frames.keep;
  const radius = options.radius ?? 26;

  const cache = new Map();
  const pending = new Map();
  let queue = [];
  let active = 0;
  let focus = 0;
  let destroyed = false;
  let tier = source.tier;

  const listeners = new Set();
  const emit = (type, detail) => listeners.forEach((fn) => fn(type, detail));

  function schedule() {
    if (destroyed) return;
    queue.sort((a, b) => Math.abs(a - focus) - Math.abs(b - focus));
    while (active < concurrency && queue.length) {
      const index = queue.shift();
      if (cache.has(index)) continue;
      if (pending.has(index)) continue;
      start(index);
    }
    pruneQueue();
  }

  function pruneQueue() {
    if (queue.length < 24) return;
    queue = queue.filter((index) => Math.abs(index - focus) <= radius);
  }

  function start(index) {
    active += 1;
    const controller = new AbortController();
    const entry = { controller };
    pending.set(index, entry);

    fetch(source.url(index), { signal: controller.signal, cache: 'force-cache' })
      .then((res) => (res.ok ? res.blob() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then(decode)
      .then((frame) => {
        if (destroyed) {
          release(frame);
          return;
        }
        cache.set(index, { frame, used: performance.now() });
        active = Math.max(0, active - 1);
        pending.delete(index);
        schedule();
        evict();
        emit('load', { index, size: cache.size });
      })
      .catch(() => {
        active = Math.max(0, active - 1);
        pending.delete(index);
      });
  }

  function evict() {
    if (cache.size <= keep) return;
    const entries = [...cache.entries()].sort(
      (a, b) => Math.abs(b[0] - focus) - Math.abs(a[0] - focus),
    );
    let excess = cache.size - keep;
    for (const [index, entry] of entries) {
      if (excess <= 0) break;
      if (index === focus) continue;
      release(entry.frame);
      cache.delete(index);
      excess -= 1;
    }
  }

  return {
    get count() {
      return source.count;
    },
    get loaded() {
      return cache.size;
    },
    on(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    get(index) {
      const entry = cache.get(index);
      if (entry) entry.used = performance.now();
      return entry ? entry.frame : null;
    },

    has(index) {
      return cache.has(index);
    },

    request(index, priority = false) {
      if (destroyed || index < 0 || index >= source.count) return;
      if (cache.has(index) || pending.has(index)) return;
      if (!priority && Math.abs(index - focus) > radius && queue.length > 8) return;
      queue.push(index);
      schedule();
    },

    setFocus(index) {
      const next = Math.max(0, Math.min(source.count - 1, index));
      if (next === focus) return;
      focus = next;
      schedule();
    },

    get focus() {
      return focus;
    },

    resetTier(nextTier) {
      if (nextTier === tier) return;
      tier = nextTier;
      source.setTier(nextTier);
      cache.forEach((entry) => release(entry.frame));
      cache.clear();
      pending.forEach((entry) => entry.controller.abort());
      pending.clear();
      queue = [];
      active = 0;
      emit('reset', { tier });
    },

    destroy() {
      destroyed = true;
      pending.forEach((entry) => entry.controller.abort());
      pending.clear();
      cache.forEach((entry) => release(entry.frame));
      cache.clear();
      queue = [];
      listeners.clear();
    },
  };
}
