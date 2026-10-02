import { CATALOG, CATEGORIES } from './data/catalog.js';
import { CONFIG } from './config.js';
import { refreshEnv, watchEnv, clamp, smoothstep } from './core/env.js';
import { $, el, toast, whenIdle } from './core/dom.js';
import { add as addTask } from './core/ticker.js';
import { createFrameSource } from './cinematic/frameSource.js';
import { createFrameLoader } from './cinematic/frameLoader.js';
import { createSequencePlayer } from './cinematic/sequencePlayer.js';
import { createScrollController } from './cinematic/scrollController.js';
import { createChoreography } from './cinematic/choreography.js';
import { createDust } from './cinematic/particles.js';
import { createPreloader } from './ui/preloader.js';
import { initAuth } from './ui/auth.js';
import { initLibrary } from './ui/library.js';
import { initReader } from './ui/reader.js';

const cinematicSection = $('#cinematic');
const sticky = document.querySelector('.cinematic-sticky');
const stage = $('#stage');
const canvas = $('#stage-canvas');
const dustCanvas = $('#stage-dust');
const nav = $('#nav');
const hero = $('#hero');
const bridge = $('#bridge');

const preloader = createPreloader();
const env = refreshEnv();
const count = Number(cinematicSection.dataset.count) || 119;
const source = createFrameSource(count);
const loader = createFrameLoader(source, {
  concurrency: env.tier === 'mobile' ? 4 : CONFIG.frames.concurrency,
  keep: env.tier === 'mobile' ? 26 : CONFIG.frames.keep,
  radius: env.tier === 'mobile' ? 16 : 26,
});

const dust = createDust(dustCanvas, { count: env.tier === 'mobile' ? 34 : 70 });
const choreo = createChoreography($('#choreo'));
const reader = initReader();
const library = initLibrary({ onOpen: (book) => reader.open(book) });

initAuth();

const reduced = env.reducedMotion;
const player = reduced
  ? null
  : createSequencePlayer(canvas, loader, { maxDpr: env.tier === 'mobile' ? 1.4 : 1.6 });
const scroll = createScrollController(cinematicSection, {
  damping: reduced ? 40 : 9,
  sticky,
});

let heroDisabled = false;
let bridgeTop = null;

/* ---------------- cinematic ---------------- */
function preload() {
  const total = env.tier === 'mobile' ? 6 : CONFIG.frames.preloadCount;
  loader.request(0, true);
  for (let i = 1; i < total; i += 1) loader.request(i, true);

  let firstFrameTimer = 0;
  return new Promise((resolve) => {
    const off = loader.on((type) => {
      if (type !== 'load') return;
      preloader.set(Math.min(0.94, (loader.loaded / total) * 0.94));
      if (loader.loaded >= total) {
        off();
        resolve();
      } else if (loader.has(0)) {
        clearTimeout(firstFrameTimer);
        firstFrameTimer = setTimeout(() => {
          off();
          resolve();
        }, 1200);
      }
    });
    setTimeout(() => {
      clearTimeout(firstFrameTimer);
      off();
      resolve();
    }, 7000);
  });
}

function renderFrame(progress, velocity) {
  const index = Math.round(progress * (count - 1));
  loader.setFocus(index);

  player.render(progress, {
    transform: 1.035 + progress * 0.1,
    offset: (progress - 0.5) * 46,
  });

  choreo.update(progress, index, count - 1);
  dust.setProgress(progress);

  const heroFade = 1 - smoothstep(0, 0.13, progress);
  if (heroFade < 0.04 && !heroDisabled) {
    heroDisabled = true;
    hero.inert = true;
  } else if (heroFade > 0.2 && heroDisabled) {
    heroDisabled = false;
    hero.inert = false;
  }
  hero.style.opacity = heroFade.toFixed(3);
  hero.style.transform = `translate3d(0, ${(-progress * 46).toFixed(1)}px, 0)`;

  const entering = smoothstep(0, 0.12, progress);
  const scrollTop = window.scrollY || window.pageYOffset || 0;
  const leaving = bridgeTop === null ? 0 : smoothstep(bridgeTop - window.innerHeight * 0.9, bridgeTop, scrollTop);
  const opacity = (0.5 + 0.5 * entering) * (1 - leaving);
  stage.style.opacity = opacity > 0.004 ? opacity.toFixed(3) : '0';
  void velocity;
}

function cinematicTick(dt) {
  scroll.ensureFresh();
  if (bridgeTop === null) {
    bridgeTop = bridge.getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0);
  }

  const progress = scroll.update(dt);
  if (player) renderFrame(progress, scroll.velocity);
  else choreo.update(progress, Math.round(progress * (count - 1)), count - 1);

  const cinematicBottom = scroll.start + scroll.span + window.innerHeight;
  const scrollTop = window.scrollY || window.pageYOffset || 0;
  const inView = scrollTop > scroll.start - window.innerHeight * 1.2 && scrollTop < cinematicBottom + 200;
  if (inView && player && player.paintedIndex === -1) loader.request(0, true);
  dust.update(dt, inView ? scroll.velocity : 0);
}

/* ---------------- hero reveal ---------------- */
function revealHero() {
  hero.querySelectorAll('.hero-title .line').forEach((line, i) => {
    const span = el('span', { text: line.textContent });
    line.textContent = '';
    line.append(span);
    span.style.transform = 'translateY(108%)';
    span.style.transition = `transform 1.15s cubic-bezier(0.16,1,0.3,1) ${0.12 + i * 0.13}s`;
    requestAnimationFrame(() => {
      span.style.transform = 'translateY(0)';
    });
  });
  hero
    .querySelectorAll('.hero-kicker, .hero-sub, .hero-actions, .hero-meta, .hero-hint')
    .forEach((node, i) => {
      const delay = 0.22 + i * 0.09;
      node.style.opacity = '0';
      node.style.transform = 'translateY(16px)';
      node.style.transition = `opacity 0.9s ease ${delay}s, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}s`;
      requestAnimationFrame(() => {
        node.style.opacity = '1';
        node.style.transform = 'none';
      });
    });
}

/* ---------------- nav ---------------- */
let navStuck = null;
function navTick() {
  const stuck = (window.scrollY || window.pageYOffset || 0) > window.innerHeight * 0.5;
  if (stuck !== navStuck) {
    navStuck = stuck;
    nav.classList.toggle('is-stuck', stuck);
  }
}

/* ---------------- stats ---------------- */
function fillStats() {
  const pages = CATALOG.reduce((sum, book) => sum + (book.pages || 0), 0);
  const set = (id, value) => {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  };
  set('stat-books', CATALOG.length);
  set('stat-pages', pages.toLocaleString('uz-UZ'));
  set('stat-cats', CATEGORIES.length - 1);
}

/* ---------------- reduced motion ---------------- */
function setupReducedMotion() {
  cinematicSection.style.height = 'auto';
  sticky.style.position = 'relative';
  sticky.style.height = '72svh';
  sticky.prepend(
    el('img', {
      src: source.posterUrl(),
      alt: 'Elektron kutubxonaning ichki koridori',
      style: {
        position: 'absolute',
        inset: '0',
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        opacity: '0.5',
      },
    }),
  );
  choreo.update(0.22, Math.round(0.22 * (count - 1)), count - 1);
}

/* ---------------- boot ---------------- */
async function boot() {
  fillStats();
  revealHero();
  dust.resize();
  scroll.measure();
  if (player) player.resize();
  navTick();

  if (reduced) {
    setupReducedMotion();
    stage.classList.add('is-live');
    stage.style.opacity = '0.4';
    preloader.finish();
    return;
  }

  addTask(cinematicTick);
  addTask(navTick);

  await preload();

  stage.classList.add('is-live');
  preloader.finish();

  window.addEventListener(
    'resize',
    () => {
      if (player) player.resize();
      dust.resize();
      scroll.measure();
      bridgeTop = 0;
    },
    { passive: true },
  );

  watchEnv((next) => {
    if (next.tier === loader.tier) return;
    loader.resetTier(next.tier);
    if (player) player.resize();
    scroll.measure();
    toast(next.tier === 'mobile' ? 'Yengil kadrlarga o‘tildi' : 'Yorug‘ kadrlarga o‘tildi');
  });

  whenIdle(() => {
    for (let i = 0; i < count; i += 6) loader.request(i);
  });
}

boot();

window.addEventListener('beforeunload', () => loader.destroy());
