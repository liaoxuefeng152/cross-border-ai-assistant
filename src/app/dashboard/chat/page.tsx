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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

const presetScenes = [
  { icon: TrendingUp, label: '智能选品', prompt: '帮我分析当前热门的 3C 配件品类，推荐 3 个潜力产品，包括市场搜索量、竞争度和预估利润率' },
  { icon: Calculator, label: '利润计算', prompt: '帮我计算一个商品的利润，进货价 25 元人民币，售价 15.99 美元，国际运费 3 美元，请列出详细的成本明细和利润率' },
  { icon: FileText, label: 'Listing 优化', prompt: '我在 TikTok Shop 卖蓝牙耳机，帮我写一个吸引人的商品标题和五点描述，要包含核心关键词' },
  { icon: ImageIcon, label: '运营策略', prompt: '我的店铺刚开业一个月，日均订单只有 3-5 单，帮我制定一个提升销量的运营策略' },
];

const initialMessages: Message[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content:
      '你好！我是龙掌柜 AI 运营助手。我可以帮你进行选品分析、利润计算、Listing 优化、运营策略制定等。\n\n你可以直接输入问题，或者选择下方的快捷场景开始。',
    timestamp: new Date(),
  },
];

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
              const parsed = JSON.parse(data) as { content?: string; error?: string };
              if (parsed.error) {
                accumulated += `\n\n[错误: ${parsed.error}]`;
              } else if (parsed.content) {
                accumulated += parsed.content;
              }
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId ? { ...m, content: accumulated } : m
                )
              );
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // User cancelled
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
                支持选品、定价、素材生成等全链路运营
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1">
            <span className={cn(
              'h-1.5 w-1.5 rounded-full',
              isStreaming ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
            )} />
            {isStreaming ? '思考中' : '在线'}
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
                      'max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                      msg.role === 'assistant'
                        ? 'rounded-tl-sm bg-white border shadow-sm text-foreground'
                        : 'rounded-tr-sm bg-emerald-600 text-white'
                    )}
                  >
                    <div className="whitespace-pre-wrap">
                      {msg.content || (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '0ms' }} />
                          <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '150ms' }} />
                          <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '300ms' }} />
                        </span>
                      )}
                    </div>
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
                  选择快捷场景开始
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
                placeholder="输入你的问题... (Enter 发送, Shift+Enter 换行)"
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
              AI 生成内容仅供参考，请结合实际判断
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
