'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Paperclip,
  Sparkles,
  Plus,
  MessageSquare,
  Trash2,
  TrendingUp,
  Calculator,
  FileText,
  ImageIcon,
  Bot,
  User,
  StopCircle,
  Video,
  Download,
  Play,
  Loader2,
  Package,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// ---- Types ----
interface SkillData {
  type: 'image-gen' | 'video-gen' | 'product-selection' | 'listing-optimize';
  status: 'running' | 'success' | 'error';
  data: Record<string, unknown> | null;
  summary: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  skill?: SkillData;
  skillRunning?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

// ---- Preset scenes ----
const presetScenes = [
  { icon: ImageIcon, label: 'AI 作图', prompt: '帮我生成一张便携式蓝牙音箱的白底主图' },
  { icon: Video, label: 'AI 视频', prompt: '帮我生成一个瑜伽垫的商品展示视频' },
  { icon: TrendingUp, label: '智能选品', prompt: '推荐几个适合在 TikTok Shop 东南亚市场卖的 3C 电子产品' },
  { icon: FileText, label: 'Listing 优化', prompt: '帮我优化一个不锈钢保温杯的 Amazon Listing 标题和五点描述' },
];

const initialMessages: Message[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content:
      '你好！我是龙掌柜 AI 运营助手。我可以直接帮你执行以下技能：\n\n- **AI 作图** — 生成商品白底图、场景图、模特图\n- **AI 视频** — 生成商品展示视频、开箱视频\n- **智能选品** — 分析市场趋势，推荐潜力产品\n- **Listing 优化** — 生成标题、五点描述、关键词\n\n直接告诉我你的需求，我会自动调用对应的技能来帮你完成！',
    timestamp: new Date(),
  },
];

// ---- Skill Result Renderers ----

function ImageGenCard({ data }: { data: Record<string, unknown> }) {
  const imageUrls = data.imageUrls as string[];
  const scene = data.scene as string;
  const [copied, setCopied] = useState(false);

  const handleDownload = async (url: string, idx: number) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `product-${scene}-${idx + 1}.png`;
      link.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    }
  };

  const handleCopyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
      <div className="mb-2 flex items-center gap-2">
        <ImageIcon className="h-4 w-4 text-emerald-600" />
        <span className="text-xs font-semibold text-emerald-700">AI 作图 - {scene}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {imageUrls?.map((url: string, i: number) => (
          <div key={i} className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white">
            <img src={url} alt={`Generated ${i + 1}`} className="h-32 w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => handleDownload(url, i)}
                className="rounded-full bg-white/90 p-1.5 hover:bg-white"
              >
                <Download className="h-3.5 w-3.5 text-slate-700" />
              </button>
              <button
                onClick={() => handleCopyUrl(url)}
                className="rounded-full bg-white/90 p-1.5 hover:bg-white"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-slate-700" />}
              </button>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-emerald-600">
        已生成 {imageUrls?.length || 0} 张图片，悬浮可下载或复制链接
      </p>
    </div>
  );
}

function VideoGenCard({ data }: { data: Record<string, unknown> }) {
  const videoUrl = data.videoUrl as string;
  const scene = data.scene as string;
  const ratio = data.ratio as string;
  const duration = data.duration as number;

  const handleDownload = async () => {
    try {
      const res = await fetch(videoUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `product-${scene}.mp4`;
      link.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(videoUrl, '_blank');
    }
  };

  return (
    <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
      <div className="mb-2 flex items-center gap-2">
        <Video className="h-4 w-4 text-emerald-600" />
        <span className="text-xs font-semibold text-emerald-700">AI 视频 - {scene}</span>
        <span className="text-[10px] text-emerald-500">{ratio} | {duration}s</span>
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-900">
        <video src={videoUrl} controls className="aspect-video w-full object-contain" style={{ maxHeight: '240px' }} />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <button
          onClick={handleDownload}
          className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs text-white hover:bg-emerald-700"
        >
          <Download className="h-3 w-3" /> 下载视频
        </button>
        <span className="text-[10px] text-emerald-600">视频已生成，可直接播放</span>
      </div>
    </div>
  );
}

function ProductSelectionCard({ data }: { data: Record<string, unknown> }) {
  const products = data.products as Array<Record<string, unknown>>;
  const market = data.market as string;
  const category = data.category as string;

  return (
    <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
      <div className="mb-2 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-emerald-600" />
        <span className="text-xs font-semibold text-emerald-700">智能选品 - {market} {category}</span>
      </div>
      <div className="space-y-2">
        {products?.map((p, i) => (
          <div key={i} className="rounded-lg border border-slate-200 bg-white p-2.5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">{p.name as string}</p>
                <p className="mt-0.5 text-[10px] text-slate-500">{p.category as string}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-emerald-600">{p.suggestedPrice as string}</p>
                <p className="text-[10px] text-slate-400">成本 {p.sourcePrice as string}</p>
              </div>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-700">
                趋势 {p.trendScore as number}
              </span>
              <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-700">
                竞争: {p.competition as string}
              </span>
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-700">
                利润 {p.profitMargin as string}
              </span>
              <span className="rounded bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-600">
                月销 {p.monthlySales as string}
              </span>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-600 leading-relaxed">{p.reason as string}</p>
            <p className="mt-1 text-[10px] text-emerald-600">💡 {p.actionAdvice as string}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ListingOptimizeCard({ data }: { data: Record<string, unknown> }) {
  const title = data.title as string;
  const bulletPoints = data.bulletPoints as string[];
  const keywords = data.keywords as string[];
  const platform = data.platform as string;
  const [copied, setCopied] = useState(false);

  const handleCopyAll = () => {
    const text = `Title: ${title}\n\nBullet Points:\n${bulletPoints?.map((b, i) => `${i + 1}. ${b}`).join('\n')}\n\nKeywords: ${keywords?.join(', ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-emerald-600" />
          <span className="text-xs font-semibold text-emerald-700">Listing 优化 - {platform}</span>
        </div>
        <button
          onClick={handleCopyAll}
          className="flex items-center gap-1 rounded-md border border-emerald-200 px-2 py-1 text-[10px] text-emerald-700 hover:bg-emerald-100"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? '已复制' : '复制全部'}
        </button>
      </div>

      <div className="space-y-2">
        <div className="rounded-lg bg-white p-2.5 border border-slate-200">
          <p className="text-[10px] font-medium text-slate-500 mb-1">优化标题</p>
          <p className="text-sm text-slate-800 font-medium leading-snug">{title}</p>
        </div>

        <div className="rounded-lg bg-white p-2.5 border border-slate-200">
          <p className="text-[10px] font-medium text-slate-500 mb-1">五点描述</p>
          <ul className="space-y-1">
            {bulletPoints?.map((bp, i) => (
              <li key={i} className="flex gap-1.5 text-xs text-slate-700">
                <span className="shrink-0 text-emerald-500">•</span>
                <span className="leading-relaxed">{bp}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg bg-white p-2.5 border border-slate-200">
          <p className="text-[10px] font-medium text-slate-500 mb-1">关键词</p>
          <div className="flex flex-wrap gap-1">
            {keywords?.map((kw, i) => (
              <span key={i} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                {kw}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SkillRunningCard({ type, label }: { type: string; label: string }) {
  const icons: Record<string, React.ElementType> = {
    'image-gen': ImageIcon,
    'video-gen': Video,
    'product-selection': TrendingUp,
    'listing-optimize': FileText,
  };
  const Icon = icons[type] || Sparkles;

  return (
    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/50 p-3">
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
        <Icon className="h-4 w-4 text-amber-600" />
        <span className="text-xs font-medium text-amber-700">
          正在调用「{label}」技能...
        </span>
      </div>
      <p className="mt-1 text-[10px] text-amber-500">
        {type === 'video-gen' ? '视频生成通常需要 1-3 分钟，请耐心等待' : 'AI 正在处理中，请稍候...'}
      </p>
    </div>
  );
}

function SkillResultRenderer({ skill }: { skill: SkillData }) {
  if (skill.status === 'running' || !skill.data) {
    return <SkillRunningCard type={skill.type} label={skill.summary || '技能执行中'} />;
  }

  if (skill.status === 'error') {
    return (
      <div className="mt-3 rounded-xl border border-red-200 bg-red-50/50 p-3">
        <p className="text-xs text-red-600">❌ {skill.summary}</p>
      </div>
    );
  }

  switch (skill.type) {
    case 'image-gen':
      return <ImageGenCard data={skill.data} />;
    case 'video-gen':
      return <VideoGenCard data={skill.data} />;
    case 'product-selection':
      return <ProductSelectionCard data={skill.data} />;
    case 'listing-optimize':
      return <ListingOptimizeCard data={skill.data} />;
    default:
      return null;
  }
}

// ---- Main Component ----

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const idCounter = useRef(0);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isStreaming) return;

    idCounter.current += 1;
    const userMessage: Message = {
      id: `msg-${idCounter.current}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);

    // Create assistant message placeholder
    idCounter.current += 1;
    const assistantMsgId = `msg-${idCounter.current}`;
    const assistantMessage: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);

    // Build messages array for API
    const apiMessages = [...messages, userMessage]
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role, content: m.content }));

    // Start streaming
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data) as Record<string, unknown>;

              if (parsed.type === 'error') {
                accumulated += `\n\n[错误: ${parsed.error as string}]`;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId ? { ...m, content: accumulated } : m
                  )
                );
              } else if (parsed.type === 'skill-start') {
                // Show skill running indicator
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          skillRunning: true,
                          skill: {
                            type: parsed.skill as string as Message['skill'] extends infer S ? S extends { type: infer T } ? T : never : never,
                            status: 'running',
                            data: null,
                            summary: parsed.label as string,
                          },
                        }
                      : m
                  )
                );
              } else if (parsed.type === 'skill-result') {
                // Update with skill result
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          skillRunning: false,
                          skill: {
                            type: parsed.skill as Message['skill'] extends infer S ? S extends { type: infer T } ? T : never : never,
                            status: parsed.status as 'success' | 'error',
                            data: parsed.data as Record<string, unknown> | null,
                            summary: parsed.summary as string,
                          },
                        }
                      : m
                  )
                );
              } else if (parsed.type === 'commentary-start') {
                // LLM commentary begins, reset accumulated for text
                accumulated = '';
              } else if (parsed.type === 'text' && parsed.content) {
                accumulated += parsed.content as string;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId ? { ...m, content: accumulated } : m
                  )
                );
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId && !m.content
              ? { ...m, content: '[已停止生成]' }
              : m
          )
        );
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: '抱歉，请求失败，请稍后重试。' }
              : m
          )
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setMessages(initialMessages);
    setActiveConvId(null);
  };

  return (
    <div className="flex h-full">
      {/* Conversation sidebar */}
      <div className="hidden w-64 flex-col border-r bg-white lg:flex">
        <div className="p-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 text-xs"
            onClick={handleNewChat}
          >
            <Plus className="h-3.5 w-3.5" />
            新建对话
          </Button>
        </div>
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1">
            {conversations.length === 0 && (
              <p className="px-3 py-8 text-center text-xs text-muted-foreground">
                暂无历史对话
              </p>
            )}
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={cn(
                  'w-full rounded-lg px-3 py-2.5 text-left transition-colors',
                  activeConvId === conv.id
                    ? 'bg-emerald-50'
                    : 'hover:bg-slate-50'
                )}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="truncate text-sm font-medium text-foreground">
                    {conv.title}
                  </span>
                </div>
                <p className="mt-1 truncate pl-5 text-xs text-muted-foreground">
                  {conv.lastMessage}
                </p>
              </button>
            ))}
          </div>
        </ScrollArea>
        <div className="border-t p-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-xs text-muted-foreground"
            onClick={handleNewChat}
          >
            <Trash2 className="h-3.5 w-3.5" />
            清空对话记录
          </Button>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex flex-1 flex-col">
        {/* Chat header */}
        <div className="flex items-center justify-between border-b bg-white px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
              <Bot className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                AI 运营助手
              </h2>
              <p className="text-xs text-muted-foreground">
                支持作图、视频、选品、Listing 优化等技能
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1">
            <span className={cn(
              'h-1.5 w-1.5 rounded-full',
              isStreaming ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
            )} />
            {isStreaming ? '执行中' : '在线'}
          </Badge>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1">
          <div className="mx-auto max-w-3xl px-4 py-6">
            <div className="space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex gap-3',
                    msg.role === 'user' ? 'flex-row-reverse' : ''
                  )}
                >
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                      msg.role === 'assistant'
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-slate-200 text-slate-600'
                    )}
                  >
                    {msg.role === 'assistant' ? (
                      <Bot className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                      msg.role === 'assistant'
                        ? 'rounded-tl-sm bg-white border shadow-sm text-foreground'
                        : 'rounded-tr-sm bg-emerald-600 text-white'
                    )}
                  >
                    <div className="whitespace-pre-wrap">
                      {msg.content || msg.skill?.status === 'running' ? (
                        msg.content || ''
                      ) : msg.content === '' && !msg.skill ? (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '0ms' }} />
                          <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '150ms' }} />
                          <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '300ms' }} />
                        </span>
                      ) : (
                        msg.content
                      )}
                    </div>

                    {/* Render skill result card */}
                    {msg.skill && (
                      <SkillResultRenderer skill={msg.skill} />
                    )}

                    <div
                      className={cn(
                        'mt-2 text-[10px]',
                        msg.role === 'assistant'
                          ? 'text-muted-foreground'
                          : 'text-emerald-200'
                      )}
                    >
                      {msg.timestamp.toLocaleTimeString('zh-CN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Preset scenes (show when only initial message) */}
            {messages.length <= 1 && (
              <div className="mt-8">
                <p className="mb-3 text-center text-xs text-muted-foreground">
                  试试这些技能
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {presetScenes.map((scene) => (
                    <button
                      key={scene.label}
                      onClick={() => handleSend(scene.prompt)}
                      className="group flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-white p-4 transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-sm"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 transition-colors group-hover:bg-emerald-100">
                        <scene.icon className="h-5 w-5 text-muted-foreground group-hover:text-emerald-600" />
                      </div>
                      <span className="text-xs font-medium text-foreground">
                        {scene.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input area */}
        <div className="border-t bg-white px-4 py-4">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-end gap-3 rounded-xl border bg-white p-3 shadow-sm focus-within:border-emerald-300 focus-within:ring-2 focus-within:ring-emerald-100">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入需求，如：帮我生成一张商品图 / 推荐几个热卖产品 / 优化 Listing..."
                className="max-h-32 min-h-[36px] flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                rows={1}
                disabled={isStreaming}
              />
              {isStreaming ? (
                <Button
                  size="icon"
                  className="h-8 w-8 shrink-0 bg-red-500 text-white hover:bg-red-600"
                  onClick={handleStop}
                >
                  <StopCircle className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  size="icon"
                  className="h-8 w-8 shrink-0 bg-emerald-600 text-white hover:bg-emerald-700"
                  disabled={!input.trim()}
                  onClick={() => handleSend()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              <Sparkles className="mr-1 inline h-3 w-3" />
              AI 会自动识别并调用对应技能（作图/视频/选品/Listing）
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
