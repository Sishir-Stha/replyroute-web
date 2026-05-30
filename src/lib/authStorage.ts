import type { DemoUser } from '@/types';

const TOKEN_KEY = 'replyroute.authToken';
const USER_KEY = 'replyroute.currentUser';

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

export function getStoredToken() {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function getStoredUser() {
  if (!canUseStorage()) return null;
  const stored = window.localStorage.getItem(USER_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as DemoUser;
  } catch {
    window.localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function setStoredUser(user: DemoUser) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}
