'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Link2,
  Upload,
  Wand2,
  Image as ImageIcon,
  DollarSign,
  Send,
  CheckCircle2,
  Circle,
  Loader2,
  ArrowRight,
  Package,
  Trash2,
  Plus,
  AlertCircle,
  Sparkles,
  Globe,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ListingItem {
  id: number;
  sourceUrl: string;
  status: 'pending' | 'scraping' | 'scraped' | 'generating' | 'generated' | 'publishing' | 'published' | 'error';
  title: string;
  category: string;
  sourcePrice: string;
  suggestedPrice: string;
  images: number;
  progress: number;
}

const steps = [
  { key: 'import', label: '导入链接', icon: Link2, desc: '粘贴供货平台链接' },
  { key: 'scrape', label: 'AI 采集', icon: Upload, desc: '自动提取商品信息' },
  { key: 'optimize', label: 'AI 优化', icon: Wand2, desc: '翻译/标题/描述生成' },
  { key: 'images', label: '素材生成', icon: ImageIcon, desc: 'AI 商品主图' },
  { key: 'pricing', label: '智能定价', icon: DollarSign, desc: '利润最优定价' },
  { key: 'publish', label: '一键发布', icon: Send, desc: '发布到目标店铺' },
];

const mockItems: ListingItem[] = [
  {
    id: 1,
    sourceUrl: 'https://detail.1688.com/offer/6823456712.html',
    status: 'published',
    title: 'Portable Mini Fan USB Rechargeable 3-Speed',
    category: '3C Accessories',
    sourcePrice: '¥8.5',
    suggestedPrice: '$6.99',
    images: 5,
    progress: 100,
  },
  {
    id: 2,
    sourceUrl: 'https://detail.1688.com/offer/7412389561.html',
    status: 'generated',
    title: 'Silicone Folding Cup Outdoor Portable Large',
    category: 'Outdoor Sports',
    sourcePrice: '¥12',
    suggestedPrice: '$9.99',
    images: 4,
    progress: 80,
  },
  {
    id: 3,
    sourceUrl: 'https://detail.1688.com/offer/5987234156.html',
    status: 'scraped',
    title: 'LED Makeup Mirror 3-Color Light USB',
    category: 'Beauty Tools',
    sourcePrice: '¥18',
    suggestedPrice: '$14.99',
    images: 0,
    progress: 50,
  },
];

const targetPlatforms = [
  { id: 'tiktok-us', name: 'TikTok Shop US', icon: '🇺🇸' },
  { id: 'tiktok-uk', name: 'TikTok Shop UK', icon: '🇬🇧' },
  { id: 'tiktok-sea', name: 'TikTok Shop SEA', icon: '🌏' },
  { id: 'shopee', name: 'Shopee', icon: '🛒' },
];

export default function ListingPage() {
  const searchParams = useSearchParams();
  const [links, setLinks] = useState('');
  const [items, setItems] = useState<ListingItem[]>(mockItems);
  const [currentStep, setCurrentStep] = useState('import');
  const [targetPlatform, setTargetPlatform] = useState('tiktok-us');
  const [isProcessing, setIsProcessing] = useState(false);
  const [prefillName, setPrefillName] = useState('');

  // 从选品报告页跳转过来时，自动预填货源链接
  useEffect(() => {
    const sourceUrl = searchParams.get('sourceUrl');
    const name = searchParams.get('name');
    if (sourceUrl) {
      // 有货源链接，直接填入链接框
      setLinks(sourceUrl);
      setPrefillName(name || '');
    } else if (name) {
      // 没有链接只有名称，填入名称
      setPrefillName(name);
      setLinks(name);
    }
  }, [searchParams]);

  const handleAddLinks = () => {
    if (!links.trim()) return;
    setIsProcessing(true);
    setTimeout(() => {
      const newItems: ListingItem[] = links.split('\n').filter(Boolean).map((url, i) => ({
        id: Date.now() + i,
        sourceUrl: url.trim(),
        status: 'pending' as const,
        title: '',
        category: '',
        sourcePrice: '',
        suggestedPrice: '',
        images: 0,
        progress: 0,
      }));
      setItems((prev) => [...newItems, ...prev]);
      setLinks('');
      setIsProcessing(false);
    }, 1000);
  };

  const handleStartWorkflow = () => {
    setIsProcessing(true);
    // Simulate workflow progression
    const stepOrder = ['scraping', 'generated', 'published'];
    let stepIndex = 0;

    const interval = setInterval(() => {
      if (stepIndex >= stepOrder.length) {
        clearInterval(interval);
        setIsProcessing(false);
        return;
      }
      setItems((prev) =>
        prev.map((item) => {
          if (item.status === 'pending' || item.status === 'scraping' || item.status === 'scraped' || item.status === 'generated') {
            const nextStatus = stepOrder[stepIndex];
            return {
              ...item,
              status: nextStatus as ListingItem['status'],
              progress: Math.min(100, item.progress + 30),
              title: item.title || 'AI Generated Product Title',
            };
          }
          return item;
        })
      );
      stepIndex++;
    }, 1500);
  };

  const getStatusIcon = (status: ListingItem['status']) => {
    switch (status) {
      case 'pending':
        return <Circle className="h-4 w-4 text-slate-400" />;
      case 'scraping':
      case 'generating':
      case 'publishing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'scraped':
      case 'generated':
        return <CheckCircle2 className="h-4 w-4 text-amber-500" />;
      case 'published':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusLabel = (status: ListingItem['status']) => {
    switch (status) {
      case 'pending': return '等待处理';
      case 'scraping': return '采集中...';
      case 'scraped': return '已采集';
      case 'generating': return '生成中...';
      case 'generated': return '已生成';
      case 'publishing': return '发布中...';
      case 'published': return '已发布';
      case 'error': return '失败';
    }
  };

  const getStatusColor = (status: ListingItem['status']) => {
    switch (status) {
      case 'pending': return 'text-slate-500 bg-slate-50';
      case 'scraping':
      case 'generating':
      case 'publishing': return 'text-blue-600 bg-blue-50';
      case 'scraped':
      case 'generated': return 'text-amber-600 bg-amber-50';
      case 'published': return 'text-emerald-600 bg-emerald-50';
      case 'error': return 'text-red-600 bg-red-50';
    }
  };

  const pendingCount = items.filter((i) => i.status === 'pending').length;
  const publishedCount = items.filter((i) => i.status === 'published').length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Send className="h-6 w-6 text-blue-600" />
          一键上架工作台
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          粘贴供货链接，AI 自动完成采集、翻译、生图、定价、发布全流程
        </p>
      </div>

      {/* 工作流步骤条 */}
      <Card className="mb-6 border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between overflow-x-auto">
            {steps.map((step, index) => {
              const stepIndex = steps.findIndex((s) => s.key === currentStep);
              const isActive = index <= stepIndex;
              return (
                <div key={step.key} className="flex items-center">
                  <div className="flex flex-col items-center gap-1.5 min-w-[80px]">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                        isActive
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <step.icon className="h-4 w-4" />
                    </div>
                    <span className={`text-xs font-medium text-center ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground text-center hidden sm:block">
                      {step.desc}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className={`h-4 w-4 mx-2 shrink-0 ${isActive ? 'text-emerald-600' : 'text-slate-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 左侧：链接导入 */}
        <Card className="lg:col-span-1 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Link2 className="h-4 w-4 text-blue-500" />
              导入商品链接
            </CardTitle>
          </CardHeader>
          <CardContent>
            {prefillName && (
              <div className="mb-3 flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2">
                <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="text-xs text-emerald-700">
                  已从选品报告带入货源链接{prefillName ? `（${prefillName}）` : ''}，点击「添加到列表」开始自动采集上架
                </span>
              </div>
            )}
            <Textarea
              placeholder={"粘贴 1688 / 淘宝 / 拼多多链接，每行一个\n\nhttps://detail.1688.com/offer/...\nhttps://detail.1688.com/offer/..."}
              className="min-h-[160px] text-sm resize-none"
              value={links}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setLinks(e.target.value)}
            />
            <Button
              className="mt-3 w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleAddLinks}
              disabled={isProcessing || !links.trim()}
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              添加到列表
            </Button>

            {/* 目标平台 */}
            <div className="mt-4 pt-4 border-t border-border/50">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                发布到
              </label>
              <Select value={targetPlatform} onValueChange={setTargetPlatform}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {targetPlatforms.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="flex items-center gap-2">
                        <span>{p.icon}</span>
                        {p.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 统计 */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="text-center p-2 rounded-lg bg-slate-50">
                <div className="text-lg font-bold text-foreground">{items.length}</div>
                <div className="text-[10px] text-muted-foreground">总计</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-amber-50">
                <div className="text-lg font-bold text-amber-600">{pendingCount}</div>
                <div className="text-[10px] text-muted-foreground">待处理</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-emerald-50">
                <div className="text-lg font-bold text-emerald-600">{publishedCount}</div>
                <div className="text-[10px] text-muted-foreground">已发布</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 右侧：商品列表 */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4 text-emerald-500" />
                商品列表
              </CardTitle>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={handleStartWorkflow}
                disabled={isProcessing || pendingCount === 0}
              >
                {isProcessing ? (
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-3 w-3" />
                )}
                {isProcessing ? '处理中...' : 'AI 一键处理全部'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl border border-border/30 p-3 hover:bg-muted/20 transition-colors"
                >
                  {/* 状态图标 */}
                  <div className="shrink-0">
                    {getStatusIcon(item.status)}
                  </div>

                  {/* 商品信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">
                        {item.title || '等待采集...'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                        {item.sourceUrl}
                      </span>
                    </div>
                    {/* 进度条 */}
                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* 价格和状态 */}
                  <div className="flex items-center gap-3 shrink-0">
                    {item.sourcePrice && (
                      <div className="text-right hidden sm:block">
                        <div className="text-[10px] text-muted-foreground">采购 → 售价</div>
                        <div className="text-xs font-medium">
                          {item.sourcePrice} → {item.suggestedPrice}
                        </div>
                      </div>
                    )}
                    <Badge className={`text-[10px] ${getStatusColor(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </Badge>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {items.length === 0 && (
              <div className="py-12 text-center">
                <Link2 className="mx-auto h-12 w-12 text-muted-foreground/30" />
                <p className="mt-4 text-sm text-muted-foreground">
                  粘贴商品链接开始上架流程
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
