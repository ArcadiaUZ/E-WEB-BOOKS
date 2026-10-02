import { CONFIG } from '../config.js';

export function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
  }
}

export function getSession() {
  return readJson(CONFIG.auth.storageKey, null);
}

export function setSession(session) {
  if (session) writeJson(CONFIG.auth.storageKey, session);
  else localStorage.removeItem(CONFIG.auth.storageKey);
}

export function getReaderPrefs() {
  return readJson(CONFIG.reader.storageKey, { font: 20, theme: 'dark' });
}

export function setReaderPrefs(prefs) {
  writeJson(CONFIG.reader.storageKey, prefs);
}

export function getProgress() {
  return readJson(CONFIG.reader.progressKey, {});
}

export function setProgress(bookId, data) {
  const all = getProgress();
  all[bookId] = data;
  writeJson(CONFIG.reader.progressKey, all);
}

export function getProgressFor(bookId) {
  return getProgress()[bookId] || null;
}
