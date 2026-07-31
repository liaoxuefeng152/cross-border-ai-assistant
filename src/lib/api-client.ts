/**
 * 统一 API 客户端 —— 所有前端请求通过此客户端代理到 lakeli-app-xc 后端
 */

const API_BASE = typeof window !== 'undefined'
  ? (window as unknown as Record<string, string>).__API_BASE__ || ''
  : '';

function getBaseUrl(): string {
  if (API_BASE) return API_BASE;
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
}

export async function apiFetch<T = unknown>(
  path: string,
  options?: RequestInit & { timeout?: number }
): Promise<T> {
  const { timeout = 30000, ...fetchOptions } = options || {};
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const url = `${getBaseUrl()}${path}`;
    const res = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      credentials: 'include',
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error((body as { error?: string }).error || `API ${res.status}`);
    }

    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function apiFetchSSE(
  path: string,
  body: unknown,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const url = `${getBaseUrl()}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`SSE stream failed with status ${res.status}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') return;
        onChunk(data);
      }
    }
  }
}

// ---- Typed API helpers ----

export interface ChatRequest {
  message: string;
  sessionId?: string;
  modelId?: string;
  attachments?: { name: string; url: string; type: string }[];
}

export async function chatStream(
  body: ChatRequest,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal
) {
  return apiFetchSSE('/api/chat', body, onChunk, signal);
}

export async function uploadAsset(formData: FormData): Promise<{ url: string; id: string }> {
  return apiFetch('/api/resources/assets', { method: 'POST', body: formData });
}

export async function getSessions() {
  return apiFetch<{ sessions: { id: string; title: string }[] }>('/api/chat/sessions');
}

export async function createSession(title: string) {
  return apiFetch<{ session: { id: string; title: string } }>('/api/chat/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
}

export async function getSessionMessages(sessionId: string) {
  return apiFetch(`/api/chat/sessions/${sessionId}/messages`);
}

export async function updateSessionTitle(sessionId: string, title: string) {
  return apiFetch(`/api/chat/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
}

export async function clearSessions() {
  return apiFetch('/api/chat/sessions/clear', { method: 'POST' });
}

export async function deleteSession(sessionId: string) {
  return apiFetch(`/api/chat/sessions/${sessionId}`, { method: 'DELETE' });
}

export async function executeSkill(skillType: string, params: Record<string, unknown>) {
  return apiFetch('/api/skills/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ skillType, ...params }),
  });
}

// Models (from admin API)
export async function getPublicModels() {
  return apiFetch<{ data: unknown[] }>('/api/public/models');
}

export async function generateImage(params: { prompt: string; size?: string; style?: string }) {
  return apiFetch('/api/image/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
}

export async function generateVideo(params: { prompt: string; duration?: number }) {
  return apiFetch('/api/video/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
}

export async function submitSelection(params: Record<string, unknown>) {
  return apiFetch('/api/selection', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
}

export async function getProducts() {
  return apiFetch<{ data: unknown[] }>('/api/resources/products');
}

export async function deleteProduct(id: string) {
  return apiFetch(`/api/resources/products/${id}`, { method: 'DELETE' });
}

export async function getAssets() {
  return apiFetch<{ data: unknown[] }>('/api/resources/assets');
}

export async function deleteAsset(id: string) {
  return apiFetch(`/api/resources/assets/${id}`, { method: 'DELETE' });
}

export async function launchBrowser() {
  return apiFetch('/api/browser/launch', { method: 'POST' });
}

export async function browserAction(params: { action?: string; instruction?: string; url?: string }) {
  return apiFetch('/api/browser/action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
}

export async function closeBrowser() {
  return apiFetch('/api/browser/close', { method: 'POST', timeout: 5000 });
}
