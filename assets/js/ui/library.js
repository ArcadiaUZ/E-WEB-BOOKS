import { CATALOG, CATEGORIES } from '../data/catalog.js';
import { $, el } from '../core/dom.js';
import { debounce } from '../core/env.js';

const normalize = (value) =>
  String(value)
    .toLowerCase()
    .replace(/[‘’']/g, "'")
    .replace(/[^a-z0-9'а-яёўқғҳ']/gi, ' ');

function score(book, query) {
  if (!query) return 1;
  const q = normalize(query);
  const terms = q.split(/\s+/).filter(Boolean);
  const title = normalize(book.title);
  const author = normalize(book.author);
  const tags = normalize(book.tags.join(' '));
  const blurb = normalize(book.blurb);
  const category = normalize(book.category);

  let total = 0;
  for (const term of terms) {
    if (title.includes(term)) total += title.startsWith(term) ? 12 : 8;
    else if (author.includes(term)) total += 6;
    else if (tags.includes(term)) total += 4;
    else if (category.includes(term)) total += 3;
    else if (blurb.includes(term)) total += 1;
    else return 0;
  }
  return total + Math.min(3, book.rating);
}

const comparators = {
  relevance: (a, b) => b.score - a.score || b.rating - a.rating,
  title: (a, b) => a.title.localeCompare(b.title, 'uz'),
  author: (a, b) => a.author.localeCompare(b.author, 'uz'),
  year: (a, b) => b.year - a.year,
  rating: (a, b) => b.rating - a.rating,
};

export function initLibrary({ onOpen }) {
  const grid = $('#grid');
  const empty = $('#empty');
  const catsWrap = $('#cats');
  const search = $('#search');
  const searchClear = $('#search-clear');
  const hint = $('#search-hint');
  const sort = $('#sort');

  let query = '';
  let category = 'all';
  let sortKey = 'relevance';

  CATEGORIES.forEach((cat) => {
    const btn = el('button', {
      class: 'cat',
      type: 'button',
      role: 'tab',
      'aria-selected': cat.id === category ? 'true' : 'false',
      text: cat.label,
      dataset: { id: cat.id },
      onclick: () => {
        category = cat.id;
        catsWrap.querySelectorAll('.cat').forEach((n) =>
          n.setAttribute('aria-selected', String(n.dataset.id === category)),
        );
        render();
      },
    });
    catsWrap.append(btn);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '120px 0px' },
  );

  function card(book) {
    const node = el('button', {
      class: 'card',
      type: 'button',
      'aria-label': `${book.title} — ${book.author}. O'qish uchun ochish`,
      onclick: () => onOpen(book),
    });
    const cover = el('span', { class: 'card-cover' }, [
      el('img', {
        src: `assets/covers/${book.id}.svg`,
        alt: `${book.title} muqovasi`,
        loading: 'lazy',
        decoding: 'async',
        width: 600,
        height: 900,
      }),
      el('span', { class: 'card-badge', text: book.reader.kind === 'pdf' ? 'PDF' : 'O\'qish' }),
    ]);
    node.append(
      cover,
      el('span', {}, [
        el('span', { class: 'card-title', text: book.title }),
        el('span', { class: 'card-author', text: `${book.author} · ${book.year}` }),
      ]),
    );
    return node;
  }

  function render() {
    const ranked = CATALOG.map((book) => ({ ...book, score: score(book, query) }))
      .filter((book) => book.score > 0)
      .filter((book) => category === 'all' || book.category === category)
      .sort(comparators[sortKey] || comparators.relevance);

    grid.textContent = '';
    observer.disconnect();
    ranked.forEach((book, i) => {
      const node = card(book);
      node.style.transitionDelay = `${Math.min(i, 10) * 45}ms`;
      grid.append(node);
      observer.observe(node);
    });

    empty.hidden = ranked.length > 0;
    hint.textContent = query
      ? `${ranked.length} ta natija${category === 'all' ? '' : ' · ' + CATEGORIES.find((c) => c.id === category).label}`
      : `${CATALOG.length} ta kitob`;
    searchClear.hidden = !query;
  }

  search.addEventListener(
    'input',
    debounce(() => {
      query = search.value.trim();
      sortKey = query ? 'relevance' : sortKey;
      sort.value = sortKey;
      render();
    }, 130),
  );
  search.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      search.value = '';
      query = '';
      render();
    }
  });
  searchClear.addEventListener('click', () => {
    search.value = '';
    query = '';
    search.focus();
    render();
  });
  sort.addEventListener('change', () => {
    sortKey = sort.value;
    render();
  });

  document.addEventListener('keydown', (e) => {
    if ((e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) && !document.getElementById('reader').hidden) return;
    if (e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) {
      e.preventDefault();
      search.scrollIntoView({ behavior: 'smooth', block: 'center' });
      search.focus();
      search.select();
    }
  });

  document.querySelector('[data-action="open-search"]')?.addEventListener('click', () => {
    search.scrollIntoView({ behavior: 'smooth', block: 'center' });
    search.focus();
    search.select();
  });

  render();
  return { render, focusSearch: () => search.focus() };
}
