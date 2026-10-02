import { clamp } from '../core/env.js';

export function createScrollController(section, options = {}) {
  const damping = options.damping ?? 9;
  const stickyEl = options.sticky || null;
  let target = 0;
  let progress = 0;
  let velocity = 0;
  let start = 0;
  let span = 1;
  let measureQueued = true;
  const handlers = new Set();

  function measure() {
    const rect = section.getBoundingClientRect();
    const scrollTop = window.scrollY || window.pageYOffset || 0;
    start = rect.top + scrollTop;
    const stickyHeight = stickyEl ? stickyEl.offsetHeight : window.innerHeight;
    span = Math.max(1, section.offsetHeight - stickyHeight);
    measureQueued = false;
    target = computeTarget();
  }

  function computeTarget() {
    const scrollTop = window.scrollY || window.pageYOffset || 0;
    return clamp((scrollTop - start) / span);
  }

  function onScroll() {
    target = computeTarget();
    if (target <= 0 || target >= 1) target = clamp(target);
  }

  function onResize() {
    measureQueued = true;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('orientationchange', onResize, { passive: true });

  return {
    measure,
    ensureFresh() {
      if (measureQueued) measure();
    },
    /** dt asosida kameraviy silliq interpolatsiya */
    update(dt) {
      this.ensureFresh();
      const prev = progress;
      const k = 1 - Math.exp(-damping * dt);
      progress += (target - progress) * k;
      if (Math.abs(target - progress) < 0.00015) progress = target;
      velocity = progress - prev;
      return progress;
    },
    onFrame(fn) {
      handlers.add(fn);
      return () => handlers.delete(fn);
    },
    emit(dt) {
      const p = this.update(dt);
      handlers.forEach((fn) => fn(p, velocity, dt));
      return p;
    },
    get progress() {
      return progress;
    },
    get target() {
      return target;
    },
    get velocity() {
      return velocity;
    },
    get start() {
      return start;
    },
    get span() {
      return span;
    },
    destroy() {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      handlers.clear();
    },
  };
}
