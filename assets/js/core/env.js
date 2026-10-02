const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const mqCoarse = window.matchMedia('(pointer: coarse)');
const mqNarrow = window.matchMedia('(max-width: 900px)');

export const state = {
  reducedMotion: mqMotion.matches,
  coarse: mqCoarse.matches,
  narrow: mqNarrow.matches,
  saveData: false,
  cores: 4,
  memory: 4,
  tier: 'desktop',
};

export function refreshEnv() {
  state.reducedMotion = mqMotion.matches;
  state.coarse = mqCoarse.matches;
  state.narrow = mqNarrow.matches;
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  state.saveData = Boolean(conn && (conn.saveData || /2g/.test(conn.effectiveType || '')));
  state.cores = navigator.hardwareConcurrency || 4;
  state.memory = navigator.deviceMemory || 4;
  state.tier = pickTier();
  return state;
}

function pickTier() {
  if (state.narrow || state.coarse || state.saveData || state.cores <= 4 || state.memory <= 4) return 'mobile';
  return 'desktop';
}

export function watchEnv(onChange) {
  ['change'].forEach((evt) => {
    mqMotion.addEventListener(evt, () => onChange(refreshEnv()));
    mqCoarse.addEventListener(evt, () => onChange(refreshEnv()));
    mqNarrow.addEventListener(evt, () => onChange(refreshEnv()));
  });
  window.addEventListener('resize', debounce(() => onChange(refreshEnv()), 220), { passive: true });
}

export function clamp(v, min = 0, max = 1) {
  return v < min ? min : v > max ? max : v;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export function debounce(fn, wait = 150) {
  let id;
  return (...args) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...args), wait);
  };
}

export function frameName(index, pad = 4) {
  return `frame_${String(index + 1).padStart(pad, '0')}`;
}

export function prefersReducedMotion() {
  return state.reducedMotion;
}
