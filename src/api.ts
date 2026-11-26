import type { AdminLogsResponse, FlowerCatalogItem, Letter, Pot, User, Wish, AiAdvice } from './types';

const TOKEN_KEY = 'dilek_sogudu_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Bir hata oluştu.');
  }
  return data as T;
}

export const api = {
  login: (username: string, password: string) =>
    request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  me: () => request<{ user: User }>('/api/auth/me'),

  heartbeat: () =>
    request<{ ok: boolean; durationSeconds: number }>('/api/auth/heartbeat', {
      method: 'POST',
    }),

  logout: () =>
    request<{ ok: boolean }>('/api/auth/logout', {
      method: 'POST',
    }),

  logoutBeacon: () => {
    const token = getStoredToken();
    if (!token) return;
    try {
      navigator.sendBeacon('/api/auth/logout', JSON.stringify({ token }));
    } catch {
      // ignore unload errors
    }
  },

  getWishes: () => request<{ wishes: Wish[] }>('/api/wishes'),

  createWish: (content: string) =>
    request<{ wish: Wish }>('/api/wishes', {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  fulfillWish: (id: number) =>
    request<{ wish: Wish }>(`/api/wishes/${id}/fulfill`, {
      method: 'PATCH',
    }),

  getLetters: () => request<{ letters: Letter[]; unreadCount: number }>('/api/letters'),

  sendLetter: (payload: { title: string; content: string; mood: string }) =>
    request<{ letter: Letter }>('/api/letters', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  markLetterRead: (id: number) =>
    request<{ ok: boolean }>(`/api/letters/${id}/read`, {
      method: 'PATCH',
    }),

  getCatalog: () => request<{ flowers: FlowerCatalogItem[] }>('/api/catalog'),

  getPots: () => request<{ pots: Pot[] }>('/api/pots'),

  plantPot: (flowerId: string, nickname?: string) =>
    request<{ pot: Pot }>('/api/pots', {
      method: 'POST',
      body: JSON.stringify({ flowerId, nickname }),
    }),

  waterPot: (id: number) =>
    request<{ pot: Pot; justBloomed: boolean }>(`/api/pots/${id}/water`, {
      method: 'POST',
    }),

  updatePotSun: (id: number, sunExposure: string) =>
    request<{ pot: Pot }>(`/api/pots/${id}/sun`, {
      method: 'PATCH',
      body: JSON.stringify({ sunExposure }),
    }),

  addPotNote: (id: number, content: string) =>
    request<{ pot: Pot }>(`/api/pots/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  deletePotNote: (potId: number, noteId: number) =>
    request<{ pot: Pot }>(`/api/pots/${potId}/notes/${noteId}`, {
      method: 'DELETE',
    }),

  getPotAdvice: (id: number) => request<{ advice: AiAdvice }>(`/api/pots/${id}/advice`),

  getAdminLogs: () => request<AdminLogsResponse>('/api/admin/logs'),
};
