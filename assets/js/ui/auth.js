import { CONFIG } from '../config.js';
import { el, toast } from '../core/dom.js';
import { getSession, setSession } from '../core/storage.js';

const listeners = new Set();

export const auth = {
  get user() {
    return getSession();
  },
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  _emit() {
    listeners.forEach((fn) => fn(auth.user));
  },
};

function emitSession(session) {
  setSession(session);
  auth._emit();
}

export function initAuth() {
  const modal = document.getElementById('auth-modal');
  renderSlot();
  auth.subscribe(() => {
    renderSlot();
    modal.hidden = !document.body.classList.contains('needs-auth');
  });

  const demoBtn = document.getElementById('demo-login');
  demoBtn.addEventListener('click', () => {
    const name = 'O\'quvchi';
    emitSession({
      provider: 'demo',
      name,
      email: 'reader@lumen.local',
      avatar: null,
      at: Date.now(),
    });
    modal.hidden = true;
    document.body.classList.remove('needs-auth');
    toast('Demo rejimida kirdingiz');
  });

  const note = document.getElementById('auth-note');
  if (!CONFIG.googleClientId) {
    note.textContent =
      'Google kirish uchun assets/js/config.js faylidagi googleClientId maydonini o\'zgartiring (Google Cloud Console → OAuth 2.0 Client ID). Hozir demo rejim ishlayapti.';
  } else {
    note.textContent = 'Kirish Google orqali amalga oshadi.';
  }

  window.onGoogleLibraryLoad = () => {
    try {
      window.google.accounts.id.initialize({
        client_id: CONFIG.googleClientId,
        callback: onCredential,
        ux_mode: 'popup',
      });
      window.google.accounts.id.renderButton(document.getElementById('g_id_onload'), {});
    } catch (err) {
      console.warn('Google Identity Services initialize failed', err);
    }
  };

  modal.querySelectorAll('[data-close]').forEach((node) =>
    node.addEventListener('click', () => {
      modal.hidden = true;
      document.body.classList.remove('needs-auth');
    }),
  );
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) {
      modal.hidden = true;
      document.body.classList.remove('needs-auth');
    }
  });
}

function onCredential(response) {
  try {
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    emitSession({
      provider: 'google',
      name: payload.name || payload.email || 'O\'quvchi',
      email: payload.email || '',
      avatar: payload.picture || null,
      at: Date.now(),
    });
    document.getElementById('auth-modal').hidden = true;
    document.body.classList.remove('needs-auth');
    toast(`Xush kelibsiz, ${payload.name || payload.email}`);
  } catch (err) {
    console.warn('credential parse failed', err);
  }
}

function renderSlot() {
  const slot = document.getElementById('auth-slot');
  if (!slot) return;
  const user = auth.user;
  slot.textContent = '';

  if (!user) {
    slot.append(
      el('button', {
        class: 'btn btn-line',
        type: 'button',
        text: 'Kirish',
        onclick: () => openAuthModal(),
      }),
    );
    return;
  }

  const chip = el('div', { class: 'user-chip' }, [
    user.avatar
      ? el('img', { src: user.avatar, alt: '', referrerpolicy: 'no-referrer' })
      : el('span', { class: 'nav-mark', 'aria-hidden': 'true' }),
    el('span', { class: 'user-chip-name', text: user.name || 'O\'quvchi' }),
    el('button', {
      class: 'user-chip-out',
      type: 'button',
      text: '×',
      title: 'Chiqish',
      'aria-label': 'Chiqish',
      onclick: () => {
        emitSession(null);
        toast('Chiqdingiz');
      },
    }),
  ]);
  slot.append(chip);
}

export function openAuthModal(reason) {
  const modal = document.getElementById('auth-modal');
  if (!modal) return;
  modal.hidden = false;
  document.body.classList.add('needs-auth');
  if (reason) {
    const note = document.getElementById('auth-note');
    if (note) note.textContent = `${reason} — buning uchun Google orqali kiring.`;
  }
  const focusTarget = modal.querySelector('#demo-login');
  if (focusTarget) focusTarget.focus();
}

export function requireAuth(reason) {
  if (auth.user) return true;
  openAuthModal(reason);
  return false;
}
