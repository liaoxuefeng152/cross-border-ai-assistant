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
  BarChart3,
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
  Headphones,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { QuestionnaireForm } from '@/components/questionnaire-form';

// ---- Types ----
interface SkillData {
  type: 'image-gen' | 'video-gen' | 'product-selection' | 'listing-optimize' | 'ad-optimize' | 'auto-cs';
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
  { icon: ImageIcon, label: 'AI 作图', prompt: '帮我生成一张便携式蓝牙音箱的白底主图', skill: 'image-gen' as const },
  { icon: Video, label: 'AI 视频', prompt: '帮我生成一个瑜伽垫的商品展示视频', skill: 'video-gen' as const },
  { icon: TrendingUp, label: '智能选品', prompt: '推荐几个适合在 TikTok Shop 东南亚市场卖的 3C 电子产品', skill: 'product-selection' as const },
  { icon: FileText, label: 'Listing 优化', prompt: '帮我优化一个不锈钢保温杯的 Amazon Listing 标题和五点描述', skill: 'listing-optimize' as const },
];

const quickActions = [
  { label: '生成白底图', prompt: '帮我生成一张产品的白底主图，要求简洁专业' },
  { label: '生成场景图', prompt: '帮我生成一张产品在生活场景中使用的图片' },
  { label: '生成展示视频', prompt: '帮我生成一个15秒的商品展示视频' },
  { label: '分析市场趋势', prompt: '分析一下当前跨境电商的市场趋势和热门品类' },
  { label: '优化产品标题', prompt: '帮我优化产品标题，让它更有吸引力且符合SEO' },
  { label: '生成五点描述', prompt: '帮我生成专业的产品五点描述' },
];

const initialMessages: Message[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content:
      '你好！我是龙掌柜 AI 运营助手。我可以直接帮你执行以下技能：\n\n- **AI 作图** — 生成商品白底图、场景图、模特图\n- **AI 视频** — 生成商品展示视频、开箱视频\n- **智能选品** — 分析市场趋势，推荐潜力产品\n- **Listing 优化** — 生成标题、五点描述、关键词\n\n直接告诉我你的需求，我会自动调用对应的技能来帮你完成！\n\n你也可以去「技能中心」安装更多技能，比如竞品监控、自动客服、利润计算器等。',
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

function AdOptimizeCard({ data }: { data: Record<string, unknown> }) {
  const analysisType = data.analysisType as string;
  const metrics = data.metrics as Record<string, unknown> | undefined;
  const searchTerms = data.searchTerms as Array<Record<string, unknown>> | undefined;
  const recommendations = data.recommendations as Array<Record<string, unknown>> | undefined;
  const strategy = data.strategy as string | undefined;
  const message = data.message as string | undefined;

  if (message) {
    return (
      <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-4 w-4 text-emerald-600" />
          <span className="text-xs font-semibold text-emerald-700">广告优化</span>
        </div>
        <p className="text-xs text-slate-600 whitespace-pre-line">{message}</p>
      </div>
    );
  }

  if (strategy) {
    return (
      <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-4 w-4 text-emerald-600" />
          <span className="text-xs font-semibold text-emerald-700">新品广告策略</span>
        </div>
        <div className="prose prose-sm max-w-none text-xs text-slate-700 whitespace-pre-line leading-relaxed">
          {strategy}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
      <div className="mb-2 flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-emerald-600" />
        <span className="text-xs font-semibold text-emerald-700">广告诊断报告</span>
      </div>

      {metrics && (
        <div className="mb-3 grid grid-cols-4 gap-2">
          <div className="rounded-lg bg-white p-2 border border-slate-200 text-center">
            <p className="text-[10px] text-slate-500">ACoS</p>
            <p className={`text-sm font-bold ${(metrics.acos as number) > 30 ? 'text-red-500' : 'text-emerald-600'}`}>
              {metrics.acos as number}%
            </p>
          </div>
          <div className="rounded-lg bg-white p-2 border border-slate-200 text-center">
            <p className="text-[10px] text-slate-500">ROAS</p>
            <p className="text-sm font-bold text-emerald-600">{metrics.roas as number}</p>
          </div>
          <div className="rounded-lg bg-white p-2 border border-slate-200 text-center">
            <p className="text-[10px] text-slate-500">花费</p>
            <p className="text-sm font-bold text-slate-700">${metrics.spend as number}</p>
          </div>
          <div className="rounded-lg bg-white p-2 border border-slate-200 text-center">
            <p className="text-[10px] text-slate-500">订单</p>
            <p className="text-sm font-bold text-slate-700">{metrics.orders as number}</p>
          </div>
        </div>
      )}

      {recommendations && recommendations.length > 0 && (
        <div className="mb-3 space-y-2">
          <p className="text-[10px] font-medium text-slate-500">优化建议</p>
          {recommendations.map((rec, i) => (
            <div key={i} className="rounded-lg bg-white p-2 border border-slate-200">
              <div className="flex items-start gap-2">
                <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                  rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                  rec.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-800">{rec.title as string}</p>
                  <p className="mt-0.5 text-[11px] text-slate-600 whitespace-pre-line">{rec.description as string}</p>
                  <p className="mt-1 text-[10px] text-emerald-600">💡 {rec.impact as string}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {searchTerms && searchTerms.length > 0 && (
        <div>
          <p className="text-[10px] font-medium text-slate-500 mb-1">搜索词分析 (Top {Math.min(searchTerms.length, 10)})</p>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {searchTerms.slice(0, 10).map((term, i) => (
              <div key={i} className="flex items-center justify-between rounded bg-white px-2 py-1.5 border border-slate-200 text-[11px]">
                <span className="font-medium text-slate-700 truncate flex-1">{term.term as string}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-slate-500">点击:{term.clicks as number}</span>
                  <span className="text-slate-500">ACoS:{term.acos as number}%</span>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] ${
                    term.recommendation === 'negative' ? 'bg-red-100 text-red-700' :
                    term.recommendation === 'boost' ? 'bg-emerald-100 text-emerald-700' :
                    term.recommendation === 'exact' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {term.recommendation === 'negative' ? '否定' :
                     term.recommendation === 'boost' ? '加价' :
                     term.recommendation === 'exact' ? '精准' : '观察'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AutoCSCard({ data }: { data: Record<string, unknown> }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const messages = data.messages as Array<Record<string, unknown>> | undefined;
  const summary = data.summary as Record<string, unknown> | undefined;

  const categoryLabels: Record<string, string> = {
    shipping: ' 物流查询',
    return: '🔄 退换货',
    product: '❓ 产品咨询',
    complaint: '🔴 投诉',
    other: '💬 其他',
  };

  const sentimentColors: Record<string, string> = {
    positive: 'text-emerald-600',
    neutral: 'text-slate-500',
    negative: 'text-amber-600',
    angry: 'text-red-600',
  };

  if (!messages || messages.length === 0) {
    return (
      <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
        <div className="flex items-center gap-2">
          <Headphones className="h-4 w-4 text-emerald-600" />
          <span className="text-xs font-semibold text-emerald-700">自动客服</span>
        </div>
        <p className="text-xs text-slate-500 mt-2">请粘贴买家消息内容</p>
      </div>
    );
  }

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = async () => {
    const allText = messages.map((m, i) => `--- 回复 ${i + 1} ---\n${m.reply as string}`).join('\n\n');
    await navigator.clipboard.writeText(allText);
    setCopiedIndex(-1);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const total = (summary?.total as number) || messages.length;
  const needsReviewCount = (summary?.needsReview as number) || messages.filter(m => m.needsReview).length;

  return (
    <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Headphones className="h-4 w-4 text-emerald-600" />
          <span className="text-xs font-semibold text-emerald-700">自动客服 - 批量回复</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-[10px] text-emerald-600 hover:text-emerald-700"
          onClick={handleCopyAll}
        >
          {copiedIndex === -1 ? <><Check className="h-3 w-3 mr-1" />已复制全部</> : <><Copy className="h-3 w-3 mr-1" />复制全部</>}
        </Button>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        <Badge variant="secondary" className="text-[10px]">共 {total} 条</Badge>
        {Object.entries(categoryLabels).map(([key, label]) => {
          const count = summary?.[key] as number || 0;
          if (count === 0) return null;
          return <Badge key={key} variant="secondary" className="text-[10px]">{label} × {count}</Badge>;
        })}
        {needsReviewCount > 0 && <Badge variant="destructive" className="text-[10px]">⚠️ {needsReviewCount} 条需复核</Badge>}
      </div>

      <div className="space-y-2">
        {messages.map((msg, i) => {
          const cat = msg.category as string;
          const sentiment = msg.sentiment as string;
          const needsReview = msg.needsReview as boolean;
          const reply = msg.reply as string;
          const original = msg.original as string;

          return (
            <div key={(msg.id as string) || i} className="rounded-lg border border-slate-200 bg-white overflow-hidden">
              <button
                onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] text-slate-400 shrink-0">#{i + 1}</span>
                  <span className="text-xs text-slate-500 truncate">{categoryLabels[cat] || cat}</span>
                  {needsReview && <Badge variant="destructive" className="text-[9px] h-4 px-1">需复核</Badge>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 text-[10px] text-slate-400 hover:text-emerald-600"
                    onClick={(e) => { e.stopPropagation(); handleCopy(reply, i); }}
                  >
                    {copiedIndex === i ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                  {expandedIndex === i ? <ChevronUp className="h-3 w-3 text-slate-400" /> : <ChevronDown className="h-3 w-3 text-slate-400" />}
                </div>
              </button>
              {expandedIndex === i && (
                <div className="border-t border-slate-100 p-3 space-y-2">
                  <div>
                    <div className="text-[10px] text-slate-400 mb-1">买家消息</div>
                    <p className="text-xs text-slate-600 bg-slate-50 rounded-lg p-2">{original}</p>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 mb-1">AI 回复</div>
                    <p className="text-xs text-slate-700 bg-emerald-50 rounded-lg p-2 whitespace-pre-line">{reply}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] ${sentimentColors[sentiment] || 'text-slate-400'}`}>
                      情绪: {sentiment || 'neutral'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
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
    'ad-optimize': BarChart3,
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
    case 'ad-optimize':
      return <AdOptimizeCard data={skill.data} />;
    case 'auto-cs':
      return <AutoCSCard data={skill.data} />;
    default:
      return null;
  }
}

// ---- Main Component ----

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [pendingQuestions, setPendingQuestions] = useState<{
    skillId: string;
    questions: Array<{
      id: string;
      question: string;
      type: 'single_choice' | 'multi_choice' | 'text' | 'number';
      options?: Array<{ label: string; value: string }>;
      placeholder?: string;
      required?: boolean;
    }>;
  } | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const idCounter = useRef(0);

  // 加载会话列表
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const res = await fetch('/api/sessions');
        const json = await res.json();
        if (json.success) {
          const convs: Conversation[] = json.data.map((s: { id: string; title: string; updated_at: string }) => ({
            id: s.id,
            title: s.title,
            lastMessage: '',
            timestamp: new Date(s.updated_at),
          }));
          setConversations(convs);
        }
      } catch (e) {
        console.error('Failed to load sessions:', e);
      }
    };
    loadSessions();
  }, []);

  // 加载会话消息
  const loadSessionMessages = useCallback(async (sessionId: string) => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/messages`);
      const json = await res.json();
      if (json.success) {
        const loadedMessages: Message[] = json.data.map((m: { id: string; role: string; content: string; created_at: string; skill_type: string; skill_result: string }) => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          content: m.content,
          timestamp: new Date(m.created_at),
          skill: m.skill_type ? {
            type: m.skill_type as Message['skill'] extends infer S ? S extends { type: infer T } ? T : never : never,
            status: 'success',
            data: m.skill_result ? JSON.parse(m.skill_result) : null,
            summary: '',
          } : undefined,
        }));
        setMessages(loadedMessages.length > 0 ? loadedMessages : initialMessages);
      }
    } catch (e) {
      console.error('Failed to load session messages:', e);
    }
  }, []);

  // 切换会话
  const handleSwitchSession = useCallback((sessionId: string) => {
    setActiveConvId(sessionId);
    setCurrentSessionId(sessionId);
    loadSessionMessages(sessionId);
  }, [loadSessionMessages]);

  // 创建新会话
  const handleNewChat = useCallback(async () => {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '新任务' }),
      });
      const json = await res.json();
      if (json.success) {
        const newConv: Conversation = {
          id: json.data.id,
          title: json.data.title,
          lastMessage: '',
          timestamp: new Date(),
        };
        setConversations((prev) => [newConv, ...prev]);
        setActiveConvId(json.data.id);
        setCurrentSessionId(json.data.id);
        setMessages(initialMessages);
      }
    } catch (e) {
      console.error('Failed to create session:', e);
    }
  }, []);

  // 清空所有任务记录
  const handleClearAll = useCallback(async () => {
    if (!confirm('确定要清空所有任务记录吗？此操作不可恢复。')) return;

    try {
      const res = await fetch('/api/sessions/clear', {
        method: 'POST',
      });
      const json = await res.json();
      if (json.success) {
        setConversations([]);
        setActiveConvId(null);
        setCurrentSessionId(null);
        setMessages(initialMessages);
      }
    } catch (e) {
      console.error('Failed to clear sessions:', e);
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isStreaming) return;

    // 如果没有当前会话，先创建一个
    let sessionId = currentSessionId;
    if (!sessionId) {
      try {
        const res = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: messageText.slice(0, 30) }),
        });
        const json = await res.json();
        if (json.success) {
          sessionId = json.data.id;
          setCurrentSessionId(sessionId);
          const newConv: Conversation = {
            id: json.data.id,
            title: json.data.title,
            lastMessage: messageText,
            timestamp: new Date(),
          };
          setConversations((prev) => [newConv, ...prev]);
          setActiveConvId(sessionId);
        }
      } catch (e) {
        console.error('Failed to create session:', e);
      }
    } else {
      // 如果当前会话标题是"新任务"，用第一条消息更新标题
      const currentConv = conversations.find((c) => c.id === sessionId);
      if (currentConv && currentConv.title === '新任务') {
        try {
          await fetch(`/api/sessions/${sessionId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: messageText.slice(0, 30) }),
          });
          setConversations((prev) =>
            prev.map((c) =>
              c.id === sessionId ? { ...c, title: messageText.slice(0, 30) } : c
            )
          );
        } catch (e) {
          console.error('Failed to update session title:', e);
        }
      }
    }

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
        body: JSON.stringify({ messages: apiMessages, sessionId }),
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
              } else if (parsed.type === 'collect-requirements') {
                // 需求收集：显示问题卡片
                setPendingQuestions({
                  skillId: parsed.skill as string,
                  questions: parsed.questions as Array<{
                    id: string;
                    question: string;
                    type: 'single_choice' | 'multi_choice' | 'text' | 'number';
                    options?: Array<{ label: string; value: string }>;
                    placeholder?: string;
                    required?: boolean;
                  }>,
                });
                // 更新助手消息，显示"等待用户回答"
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId
                      ? { ...m, content: '请回答以下问题，我会根据你的需求来执行任务：' }
                      : m
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

  const handleSubmitAnswers = async (answers: Record<string, string | string[]>) => {
    console.log('[Chat] handleSubmitAnswers called with:', answers);
    if (!pendingQuestions || !currentSessionId) {
      console.log('[Chat] Missing pendingQuestions or currentSessionId');
      return;
    }

    setPendingQuestions(null);
    setIsExecuting(true);

    // 添加用户答案到消息列表
    const answerText = Object.entries(answers)
      .map(([key, value]) => {
        const question = pendingQuestions.questions.find((q) => q.id === key);
        const answer = Array.isArray(value) ? value.join('、') : value;
        return `${question?.question || key}: ${answer}`;
      })
      .join('\n');

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: answerText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // 添加加载状态消息
    const loadingMsg: Message = {
      id: 'msg-loading',
      role: 'assistant',
      content: '正在执行任务，请稍候...',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, loadingMsg]);

    // 调用执行技能 API
    try {
      const response = await fetch('/api/skills/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillId: pendingQuestions.skillId,
          sessionId: currentSessionId,
          answers,
        }),
      });

      const result = await response.json();
      console.log('[Chat] Skill execute result:', result);

      // 移除加载状态消息
      setMessages((prev) => prev.filter((m) => m.id !== 'msg-loading'));

      if (result.success) {
        // 添加技能结果到消息列表
        const assistantMsg: Message = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: result.summary || '任务执行完成',
          timestamp: new Date(),
          skill: {
            type: pendingQuestions.skillId as Message['skill'] extends infer S ? S extends { type: infer T } ? T : never : never,
            status: 'success',
            data: result.data,
            summary: result.summary,
          },
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const assistantMsg: Message = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: `执行失败：${result.error}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (error) {
      console.error('[Chat] Skill execute error:', error);
      // 移除加载状态消息
      setMessages((prev) => prev.filter((m) => m.id !== 'msg-loading'));
      const assistantMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: '抱歉，执行失败，请稍后重试。',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSkipQuestions = () => {
    setPendingQuestions(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
            新建任务
          </Button>
        </div>
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1">
            {conversations.length === 0 && (
              <p className="px-3 py-8 text-center text-xs text-muted-foreground">
                暂无历史任务
              </p>
            )}
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleSwitchSession(conv.id)}
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
            onClick={handleClearAll}
          >
            <Trash2 className="h-3.5 w-3.5" />
            清空任务记录
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
                  点击技能卡片，一键开始
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
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5">
                        技能
                      </span>
                    </button>
                  ))}
                </div>

                {/* Quick actions */}
                <div className="mt-6">
                  <p className="mb-2 text-center text-xs text-muted-foreground">
                    快捷指令
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {quickActions.map((action) => (
                      <button
                        key={action.label}
                        onClick={() => handleSend(action.prompt)}
                        className="rounded-full border border-border/50 bg-white px-3 py-1.5 text-xs text-muted-foreground transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Requirements Collection Card */}
        {pendingQuestions && (
          <div className="border-t bg-slate-50 px-4 py-4">
            <div className="mx-auto max-w-3xl">
              <div className="rounded-xl border bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold text-foreground">
                  请回答以下问题，我会根据你的需求来执行任务：
                </h3>
                <QuestionnaireForm
                  questions={pendingQuestions.questions}
                  onSubmit={handleSubmitAnswers}
                  onSkip={handleSkipQuestions}
                />
              </div>
            </div>
          </div>
        )}

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
