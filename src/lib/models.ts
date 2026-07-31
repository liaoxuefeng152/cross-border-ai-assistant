/* 模型配置
 *   统一从后端 /api/public/models 拉取（由平台管理「模型配置」中心管控）。
 *   拉取失败时使用最小内置回退（仅「自动」模式），不硬编码具体模型。 */

/** 排除非文本聊天模型（图像/视频/音频/语音/嵌入等） */
function isChatModel(modelId: string): boolean {
  const nonChatPatterns = [
    'seedream', 'seedance', 'tts', 'asr', 'audio', 'music',
    '3d', 'podcast', 'embedding', 'voice', 'character',
  ];
  const lower = modelId.toLowerCase();
  return !nonChatPatterns.some(p => lower.includes(p));
}

export interface ModelInfo {
  id: string;
  name: string;
  description?: string;
  provider: string;
  icon?: string;
  color?: string;
  tags?: { text: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }[];
  costMultiplier: number;
  recommended?: boolean;
  vision?: boolean;
  coding?: boolean;
  canAutoRoute?: boolean;
  autoRouteKeywords?: string[];
}

export interface RemoteModelRow {
  id: string;
  name: string;
  provider: string;
  model_id: string;
  description: string | null;
  cost_multiplier: number;
  tags: string[] | null;
  color: string | null;
  icon: string | null;
  sort_order: number;
  is_default: boolean;
  can_auto_route: boolean;
  auto_route_keywords: string | null;
}

// ── 最小内置回退（仅「自动」模式）──

export const MODEL_AUTO: ModelInfo = {
  id: 'auto',
  name: '自动',
  description: '根据任务自动匹配模型',
  provider: 'system',
  icon: 'Sparkles',
  costMultiplier: 0,
};

const BUILTIN_MODELS: ModelInfo[] = [MODEL_AUTO];

// ── 动态模型加载 ──

let _cachedModels: ModelInfo[] | null = null;
let _cacheTime = 0;
const CACHE_TTL = 60_000; // 1 分钟

function getApiBase(): string {
  if (typeof window !== 'undefined') {
    return (window as unknown as Record<string, string>).__API_BASE__
      || process.env.NEXT_PUBLIC_API_URL
      || '';
  }
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || '';
}

function mapRemoteModel(r: RemoteModelRow): ModelInfo {
  const tags: ModelInfo['tags'] = [];
  if (r.is_default) tags.push({ text: '默认', variant: 'default' });
  if (r.tags?.length) {
    for (const t of r.tags) {
      if (!tags.find(x => x.text === t)) {
        tags.push({ text: t, variant: tags.length > 0 ? 'outline' : 'secondary' });
      }
    }
  }
  return {
    id: r.model_id,
    name: r.name,
    description: r.description || undefined,
    provider: r.provider,
    icon: r.icon || undefined,
    color: r.color || undefined,
    tags: tags.length > 0 ? tags : undefined,
    costMultiplier: Number(r.cost_multiplier) || 1,
    canAutoRoute: r.can_auto_route,
    autoRouteKeywords: r.auto_route_keywords
      ? r.auto_route_keywords.split(',').map(s => s.trim()).filter(Boolean)
      : undefined,
  };
}

async function fetchRemoteModels(): Promise<ModelInfo[]> {
  const base = getApiBase();
  if (!base) return [];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${base.replace(/\/$/, '')}/api/public/models`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const json = await res.json();
    if (!json.data?.length) return [];

    const models: ModelInfo[] = [MODEL_AUTO];
    for (const r of json.data as RemoteModelRow[]) {
      const m = mapRemoteModel(r);
      if (isChatModel(m.id)) {
        models.push(m);
      }
    }
    return models;
  } catch {
    return [];
  }
}

export async function getAvailableModels(): Promise<ModelInfo[]> {
  const now = Date.now();
  if (_cachedModels && now - _cacheTime < CACHE_TTL) return _cachedModels;

  const remote = await fetchRemoteModels();
  if (remote.length > 0) {
    _cachedModels = remote;
    _cacheTime = now;
    return remote;
  }

  // fallback
  _cachedModels = BUILTIN_MODELS;
  _cacheTime = now;
  return BUILTIN_MODELS;
}

/** 同步获取（首次返回内置列表，异步刷新后可用） */
export function getAvailableModelsSync(): ModelInfo[] {
  return _cachedModels || BUILTIN_MODELS;
}

export let AVAILABLE_MODELS: ModelInfo[] = [...BUILTIN_MODELS];

/** 初始化：从远程拉取模型列表，失败则用内置 */
export async function initModels(): Promise<void> {
  AVAILABLE_MODELS = await getAvailableModels();
}

// ── 自动路由 ──

export const DEFAULT_MODEL_ID =
  process.env.NEXT_PUBLIC_DEFAULT_MODEL ||
  process.env.LLM_MODEL ||
  'doubao-seed-2-0-lite-260215';

export function findModelById(id: string | undefined): ModelInfo | undefined {
  if (!id) return undefined;
  const list = getAvailableModelsSync();
  return list.find((m) => m.id === id);
}

/** 自动路由：根据用户消息匹配可自动路由的模型 */
export function resolveAutoModel(message: string): string {
  const lower = message.toLowerCase();
  const models = getAvailableModelsSync();

  for (const m of models) {
    if (m.id === 'auto' || !m.canAutoRoute || !m.autoRouteKeywords?.length) continue;
    if (m.autoRouteKeywords.some(k => lower.includes(k))) {
      return m.id;
    }
  }

  // 回退：优先选推荐模型，再选默认模型
  const recommended = models.find(m => m.recommended);
  if (recommended) return recommended.id;
  return DEFAULT_MODEL_ID;
}

export function resolveModel(message: string, selectedModelId?: string | null): string {
  if (!selectedModelId || selectedModelId === 'auto') {
    return resolveAutoModel(message);
  }
  return selectedModelId;
}
