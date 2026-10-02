import { requireAuth } from './auth.js';
import { getReaderPrefs, setReaderPrefs, getProgressFor, setProgress } from '../core/storage.js';
import { toast } from '../core/dom.js';

const FONT_STEPS = [18, 20, 23, 26];

export function initReader() {
  const root = document.getElementById('reader');
  const body = document.getElementById('reader-body');
  const titleEl = document.getElementById('reader-title');
  const authorEl = document.getElementById('reader-author');
  const countEl = document.getElementById('reader-count');
  const fillEl = document.getElementById('reader-fill');
  const prevBtn = document.getElementById('reader-prev');
  const nextBtn = document.getElementById('reader-next');
  const typeBtn = document.getElementById('reader-type');
  const themeBtn = document.getElementById('reader-theme');
  const closeBtn = document.getElementById('reader-close');

  let prefs = getReaderPrefs();
  let session = null;
  let closeSession = null;
  let text = null;
  let pdf = null;

  function applyPrefs() {
    root.classList.toggle('is-sepia', prefs.theme === 'sepia');
    root.classList.toggle('is-light', prefs.theme === 'light');
    body.style.setProperty('--reader-font', `${prefs.font}px`);
  }

  function close() {
    if (session) session();
    session = null;
    root.hidden = true;
    document.body.classList.remove('no-scroll');
    if (text) {
      const p = Math.min(1, body.scrollTop / Math.max(1, body.scrollHeight - body.clientHeight));
      setProgress(text.book.id, { kind: 'text', scroll: p });
      text = null;
    }
    if (pdf) {
      pdf.destroy();
      pdf = null;
    }
    body.textContent = '';
  }

  function openRaw(book) {
    close();
    root.hidden = false;
    document.body.classList.add('no-scroll');
    titleEl.textContent = book.title;
    authorEl.textContent = `${book.author} · ${book.year}`;
    applyPrefs();
    requestAnimationFrame(() => body.focus());
    if (book.reader.kind === 'pdf') mountPdf(book);
    else mountText(book);
  }

  function open(book) {
    if (!requireAuth('O\'qish uchun kitobni tanlash shart')) return;
    openRaw(book);
  }

  /* ---------------- text ---------------- */
  function mountText(book) {
    const saved = getProgressFor(book.id);
    const wrap = document.createElement('div');
    wrap.className = 'reader-text';
    wrap.append(
      Object.assign(document.createElement('p'), {
        className: 'reader-blurb',
        textContent: book.blurb,
      }),
    );

    book.reader.chapters.forEach((chapter, i) => {
      if (i > 0) {
        const rule = document.createElement('div');
        rule.className = 'chapter-rule';
        wrap.append(rule);
      }
      const heading = document.createElement('h3');
      heading.textContent = `${String(i + 1).padStart(2, '0')} — ${chapter.title}`;
      heading.dataset.chapter = String(i);
      wrap.append(heading);
      chapter.body.split('\n\n').forEach((para) => {
        const p = document.createElement('p');
        p.textContent = para;
        wrap.append(p);
      });
    });

    const end = document.createElement('p');
    end.className = 'reader-end';
    end.textContent = 'Kitob tugadi';
    wrap.append(end);

    body.textContent = '';
    body.append(wrap);

    const headings = Array.from(wrap.querySelectorAll('h3'));
    countEl.textContent = `${book.reader.chapters.length} bob`;

    const update = () => {
      const mid = body.scrollTop + body.clientHeight * 0.25;
      let index = 0;
      headings.forEach((h, i) => {
        if (h.offsetTop <= mid) index = i;
      });
      countEl.textContent = `${index + 1} / ${book.reader.chapters.length} bob`;
      const max = Math.max(1, body.scrollHeight - body.clientHeight);
      fillEl.style.width = `${Math.min(100, (body.scrollTop / max) * 100).toFixed(1)}%`;
    };

    session = listenScroll(body, update, { isSeeking: () => root.classList.contains('is-seek') });
    update();

    requestAnimationFrame(() => {
      root.classList.add('is-seek');
      if (saved && saved.kind === 'text') body.scrollTop = saved.scroll * (body.scrollHeight - body.clientHeight);
      else body.scrollTop = 0;
      requestAnimationFrame(() => {
        root.classList.remove('is-seek');
        update();
      });
    });

    text = {
      book,
      jump(dir) {
        let index = 0;
        const mid = body.scrollTop + body.clientHeight * 0.25;
        headings.forEach((h, i) => {
          if (h.offsetTop <= mid) index = i;
        });
        const next = Math.min(headings.length - 1, Math.max(0, index + dir));
        body.scrollTo({ top: headings[next].offsetTop - 24, behavior: 'smooth' });
      },
    };
  }

  /* ---------------- pdf ---------------- */
  async function mountPdf(book) {
    body.textContent = '';
    const wrap = document.createElement('div');
    wrap.className = 'reader-pdf';
    const loading = document.createElement('p');
    loading.className = 'pdf-loading';
    loading.textContent = 'Kitob yuklanmoqda…';
    wrap.append(loading);
    body.append(wrap);
    countEl.textContent = '';
    fillEl.style.width = '0%';

    try {
      const pdfjs = await import('../../../vendor/pdfjs/pdf.min.mjs');
      pdfjs.GlobalWorkerOptions.workerSrc = new URL('../../../vendor/pdfjs/pdf.worker.min.mjs', import.meta.url).href;
      const task = pdfjs.getDocument({ url: book.reader.src, enableAutoFetch: true });
      const doc = await task.promise;
      loading.remove();
      pdf = createPdfView({ doc, wrap, book, pdfjs, body, countEl, fillEl });
    } catch (err) {
      console.error(err);
      wrap.textContent = '';
      wrap.append(
        Object.assign(document.createElement('p'), {
          className: 'pdf-error',
          textContent: 'PDFni ochib bo\'lmadi. Faylni server orqali ochish kerak (ES modul va fetch HTTP protokoli talab qiladi).',
        }),
      );
      countEl.textContent = '';
    }
  }

  function createPdfView({ doc, wrap, book, body, countEl, fillEl }) {
    const saved = getProgressFor(book.id);
    const WINDOW = 5;
    let scale = 1;
    let current = Math.min(Math.max((saved?.page ?? 1) - 1, 0), doc.numPages - 1);
    const pages = new Map();
    let destroyResize;

    async function renderWindow() {
      const start = Math.max(0, Math.min(doc.numPages - WINDOW, current - 2));
      const end = Math.min(doc.numPages - 1, start + WINDOW - 1);
      const entries = [];
      for (let i = start; i <= end; i += 1) entries.push(i);

      for (const [index, node] of pages) {
        if (!entries.includes(index)) {
          node.remove();
          pages.delete(index);
        }
      }

      await Promise.all(
        entries.map(async (i) => {
          let node = pages.get(i);
          if (!node) {
            node = document.createElement('div');
            node.className = 'pdf-page is-loading';
            node.dataset.page = String(i + 1);
            wrap.append(node);
            pages.set(i, node);
          }
          if (node.dataset.ready === '1') return;
          const page = await doc.getPage(i + 1);
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          const cssWidth = Math.min(Math.min(body.clientWidth - 2, 980) * scale, 900);
          const base = page.getViewport({ scale: 1 }).width;
          const viewport = page.getViewport({ scale: (cssWidth / base) * dpr });
          const canvas = document.createElement('canvas');
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          canvas.style.width = `${Math.floor(viewport.width / dpr)}px`;
          canvas.style.height = `${Math.floor(viewport.height / dpr)}px`;
          const ctx = canvas.getContext('2d');
          await page.render({ canvasContext: ctx, viewport }).promise;
          node.textContent = '';
          node.style.width = `${Math.floor(viewport.width / dpr)}px`;
          node.append(canvas);
          node.classList.remove('is-loading');
          node.dataset.ready = '1';
        }),
      );
      wrap.querySelectorAll('.pdf-page').forEach((n) => {
        n.querySelector('canvas')?.setAttribute('aria-label', `${book.title} — ${n.dataset.page}-sahifa`);
      });
    }

    function updateLabel() {
      countEl.textContent = `${current + 1} / ${doc.numPages}`;
      fillEl.style.width = `${((current + 1) / doc.numPages) * 100}%`;
    }

    async function goTo(index, scroll = true) {
      current = Math.max(0, Math.min(doc.numPages - 1, index));
      updateLabel();
      setProgress(book.id, { kind: 'pdf', page: current + 1 });
      await renderWindow();
      if (scroll) {
        root.classList.add('is-seek');
        const node = wrap.querySelector(`[data-page="${current + 1}"]`);
        if (node) body.scrollTo({ top: Math.max(0, node.offsetTop - 24) });
        setTimeout(() => root.classList.remove('is-seek'), 60);
      }
    }

    const onScroll = () => {
      const nodes = Array.from(wrap.children);
      let best = current;
      let bestDist = Infinity;
      nodes.forEach((node) => {
        const page = Number(node.dataset.page);
        const dist = Math.abs(node.offsetTop - body.scrollTop - 40);
        if (dist < bestDist) {
          bestDist = dist;
          best = page - 1;
        }
      });
      if (best !== current) {
        current = best;
        updateLabel();
        setProgress(book.id, { kind: 'pdf', page: current + 1 });
        renderWindow();
      }
    };

    const onResize = () => {
      pages.forEach((node) => {
        node.remove();
      });
      pages.clear();
      renderWindow();
    };

    destroyResize = listenResize(onResize);
    const scrollSession = listenScroll(body, onScroll, { isSeeking: () => root.classList.contains('is-seek') });

    goTo(current, false);

    return {
      jump(dir) {
        goTo(current + dir);
      },
      destroy() {
        scrollSession();
        destroyResize();
        pages.forEach((node) => node.remove());
        pages.clear();
      },
    };
  }

  /* ---------------- controls ---------------- */
  prevBtn.addEventListener('click', () => (text ? text.jump(-1) : pdf?.jump(-1)));
  nextBtn.addEventListener('click', () => (text ? text.jump(1) : pdf?.jump(1)));
  closeBtn.addEventListener('click', close);
  typeBtn.addEventListener('click', () => {
    const i = FONT_STEPS.indexOf(prefs.font);
    prefs = { ...prefs, font: FONT_STEPS[(i + 1) % FONT_STEPS.length] };
    setReaderPrefs(prefs);
    applyPrefs();
    toast(`Shrift: ${prefs.font}px`);
  });
  themeBtn.addEventListener('click', () => {
    const order = ['dark', 'sepia', 'light'];
    prefs = { ...prefs, theme: order[(order.indexOf(prefs.theme) + 1) % order.length] };
    setReaderPrefs(prefs);
    applyPrefs();
  });
  document.addEventListener('keydown', (e) => {
    if (root.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      e.preventDefault();
      text ? text.jump(1) : pdf?.jump(1);
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      text ? text.jump(-1) : pdf?.jump(-1);
    }
  });

  applyPrefs();
  return { open, close };
}

function listenScroll(node, handler, opts = {}) {
  let queued = false;
  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      if (opts.isSeeking && opts.isSeeking()) return;
      handler();
    });
  };
  node.addEventListener('scroll', onScroll, { passive: true });
  return () => node.removeEventListener('scroll', onScroll);
}

function listenResize(handler) {
  let id;
  const onResize = () => {
    clearTimeout(id);
    id = setTimeout(handler, 220);
  };
  window.addEventListener('resize', onResize, { passive: true });
  return () => {
    clearTimeout(id);
    window.removeEventListener('resize', onResize);
  };
}
