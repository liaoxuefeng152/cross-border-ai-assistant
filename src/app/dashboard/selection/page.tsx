'use client';

import { useState } from 'react';
import {
  Target, TrendingUp, Flame, DollarSign, Users, Sparkles, ShoppingCart,
  Search, ChevronRight, AlertTriangle, CheckCircle2, Ship, Calendar,
  Loader2, FileText, ArrowRight, Globe, Tag, Sliders, Shield,
  Truck, Star, Package, BarChart3, SearchCheck, Filter, Link2, Rocket,
  ExternalLink, Heart,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface SelectionProduct {
  name: string;
  category: string;
  trendScore: number;
  competition: string;
  profitMargin: string;
  sourcePrice: string;
  suggestedPrice: string;
  trendChange: string;
  searchVolume: string;
  sellers: number;
  monthlySales: string;
  bsrRank: string;
  avgRating: string;
  reviewCount: number;
  season: string;
  tiktokHot: boolean;
  riskLevel: string;
  sourceUrl: string;
  reason: string;
  actionAdvice: string;
  supplierInfo: string;
  logistics: string;
}

// 选品模式
const modes = [
  { id: 'trend', name: '趋势选品', icon: TrendingUp, desc: '追热点、抢红利，适合有经验的卖家', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { id: 'blueocean', name: '蓝海选品', icon: SearchCheck, desc: '低竞争、高潜力，适合新手卖家切入', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { id: 'profit', name: '利润选品', icon: DollarSign, desc: '高毛利、可批量，适合铺货卖家', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  { id: 'festival', name: '节日选品', icon: Calendar, desc: 'Prime Day/黑五/圣诞，季节红利', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
];

// 市场
const markets = [
  { id: 'us', name: '美国', flag: '🇺🇸', desc: 'Amazon US 最大市场' },
  { id: 'uk', name: '英国', flag: '🇬🇧', desc: 'Amazon UK 高客单价' },
  { id: 'de', name: '德国', flag: '🇩🇪', desc: 'Amazon DE 欧洲最大' },
  { id: 'jp', name: '日本', flag: '🇯🇵', desc: 'Amazon JP 品质要求高' },
  { id: 'fr', name: '法国', flag: '🇫🇷', desc: 'Amazon FR 合规要求严' },
];

// 品类
const categories = [
  { id: 'all', name: '全品类', icon: Target },
  { id: 'home', name: '家居生活', icon: Package },
  { id: 'electronics', name: '3C电子', icon: TrendingUp },
  { id: 'beauty', name: '美妆个护', icon: Sparkles },
  { id: 'outdoor', name: '户外运动', icon: Ship },
  { id: 'pet', name: '宠物用品', icon: Flame },
  { id: 'kitchen', name: '厨房用品', icon: BarChart3 },
  { id: 'toys', name: '玩具文创', icon: Star },
  { id: 'garden', name: '花园园艺', icon: Filter },
  { id: 'office', name: '办公用品', icon: FileText },
  { id: 'baby', name: '母婴用品', icon: Tag },
  { id: 'tools', name: '工具五金', icon: Sliders },
];

// 步骤配置
const steps = [
  { id: 'mode', label: '选品模式', icon: Target },
  { id: 'market', label: '市场品类', icon: Globe },
  { id: 'price', label: '价格区间', icon: DollarSign },
  { id: 'competition', label: '竞争门槛', icon: Shield },
  { id: 'supply', label: '供应链', icon: Truck },
  { id: 'generate', label: '生成', icon: Sparkles },
];

export default function SelectionPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [step, setStep] = useState<'config' | 'loading' | 'results'>('config');
  const [products, setProducts] = useState<SelectionProduct[]>([]);
  const [error, setError] = useState('');
  const [filterCompetition, setFilterCompetition] = useState<string>('all');
  const [favorites, setFavorites] = useState<SelectionProduct[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);

  // 第1层：选品模式
  const [selectedMode, setSelectedMode] = useState('trend');
  // 第2层：市场 + 品类
  const [selectedMarket, setSelectedMarket] = useState('us');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [keyword, setKeyword] = useState('');
  // 第3层：价格区间
  const [minSourcePrice, setMinSourcePrice] = useState('5');
  const [maxSourcePrice, setMaxSourcePrice] = useState('100');
  const [minSellingPrice, setMinSellingPrice] = useState('15');
  const [maxSellingPrice, setMaxSellingPrice] = useState('50');
  const [targetProfit, setTargetProfit] = useState('30');
  // 第4层：竞争门槛
  const [maxSellers, setMaxSellers] = useState('20');
  const [maxReviews, setMaxReviews] = useState('500');
  const [minBsr, setMinBsr] = useState('5000');
  const [maxBsr, setMaxBsr] = useState('50000');
  const [maxCpc, setMaxCpc] = useState('1.5');
  const [minNewProducts, setMinNewProducts] = useState('5');
  // 第5层：供应链
  const [minSuppliers, setMinSuppliers] = useState('3');
  const [maxMoq, setMaxMoq] = useState('100');
  const [needDropShip, setNeedDropShip] = useState(false);
  const [maxShipDays, setMaxShipDays] = useState('3');
  const [minRating, setMinRating] = useState('90');

  const canNext = () => {
    switch (currentStep) {
      case 0: return true; // 模式已选默认
      case 1: return true; // 市场品类已选默认
      case 2: return true; // 价格区间有默认值
      case 3: return true; // 竞争门槛有默认值
      case 4: return true; // 供应链有默认值
      default: return false;
    }
  };

  const handleGenerate = async () => {
    setStep('loading');
    setError('');
    try {
      const res = await fetch('/api/selection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: selectedMode,
          market: selectedMarket,
          category: selectedCategory,
          keyword: keyword || undefined,
          minSourcePrice, maxSourcePrice,
          minSellingPrice, maxSellingPrice,
          targetProfit,
          maxSellers, maxReviews, minBsr, maxBsr, maxCpc, minNewProducts,
          minSuppliers, maxMoq, needDropShip, maxShipDays, minRating,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setStep('config');
        return;
      }
      setProducts(data.products || []);
      setStep('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : '请求失败');
      setStep('config');
    }
  };

  const competitionColor = (level: string) => {
    if (level === '低') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (level === '中') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };

  const riskColor = (level: string) => {
    if (level === '低') return 'text-emerald-600';
    if (level === '中') return 'text-amber-600';
    return 'text-red-600';
  };

  const toggleFavorite = (product: SelectionProduct) => {
    setFavorites((prev) => {
      const exists = prev.find((p) => p.name === product.name);
      if (exists) return prev.filter((p) => p.name !== product.name);
      return [...prev, product];
    });
  };

  const isFavorite = (product: SelectionProduct) => {
    return favorites.some((p) => p.name === product.name);
  };

  const filteredProducts = (() => {
    let result = products;
    if (filterCompetition !== 'all') {
      result = result.filter((p) => p.competition === filterCompetition);
    }
    if (showFavorites) {
      result = result.filter((p) => isFavorite(p));
    }
    return result;
  })();

  // ====== Loading ======
  if (step === 'loading') {
    return (
      <div className="flex min-h-[600px] flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-emerald-50" />
          <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin text-emerald-600" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-900">AI 正在分析市场数据...</h3>
          <p className="mt-2 text-sm text-slate-500">
            正在穿透 4 层选品漏斗：模式匹配、价格验证、竞争评估、供应链筛查
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
            <Sparkles className="h-3 w-3 animate-pulse" />
            <span>预计需要 10-15 秒</span>
          </div>
        </div>
      </div>
    );
  }

  // ====== Results ======
  if (step === 'results') {
    return (
      <div>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">AI 选品推荐</h1>
            <p className="mt-1 text-sm text-slate-500">
              共 {products.length} 个推荐 · {modes.find((m) => m.id === selectedMode)?.name} ·
              {markets.find((m) => m.id === selectedMarket)?.flag}{markets.find((m) => m.id === selectedMarket)?.name} ·
              {categories.find((c) => c.id === selectedCategory)?.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border bg-white p-1">
              {['all', '低', '中', '高'].map((level) => (
                <button
                  key={level}
                  onClick={() => setFilterCompetition(level)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                    filterCompetition === level
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-500 hover:bg-slate-100'
                  )}
                >
                  {level === 'all' ? '全部' : level}
                </button>
              ))}
            </div>
            <Button
              variant={showFavorites ? 'default' : 'outline'}
              size="sm"
              className={showFavorites ? 'bg-amber-500 hover:bg-amber-600' : ''}
              onClick={() => setShowFavorites(!showFavorites)}
            >
              <Heart className={cn('h-3.5 w-3.5', showFavorites ? 'fill-current' : '')} />
              收藏夹 ({favorites.length})
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setStep('config'); setCurrentStep(0); }}>
              重新选品
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {filteredProducts.map((product, idx) => (
            <Card
              key={idx}
              className="group overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <CardContent className="p-5">
                {/* Header */}
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1.5 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{product.category}</Badge>
                      {product.tiktokHot && (
                        <Badge className="bg-red-50 text-red-600 border-red-200 text-xs">TikTok🔥</Badge>
                      )}
                      {product.avgRating && (
                        <span className="text-xs text-amber-500">⭐ {product.avgRating}</span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 leading-snug">{product.name}</h3>
                  </div>
                  {/* Trend Score */}
                  <div className="ml-3 flex flex-col items-center">
                    <div className="text-xl font-bold tabular-nums text-emerald-600">{product.trendScore}</div>
                    <div className="text-xs text-slate-400">趋势分</div>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="mb-3 grid grid-cols-4 gap-2 rounded-lg bg-slate-50 p-3">
                  <div className="text-center">
                    <div className="text-xs text-slate-400">利润率</div>
                    <div className="text-sm font-semibold text-emerald-600">{product.profitMargin}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-slate-400">采购价</div>
                    <div className="text-sm font-semibold text-slate-700">{product.sourcePrice}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-slate-400">售价</div>
                    <div className="text-sm font-semibold text-slate-700">{product.suggestedPrice}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-slate-400">月销</div>
                    <div className="text-sm font-semibold text-slate-700">{product.monthlySales}</div>
                  </div>
                </div>

                {/* Extra metrics */}
                <div className="mb-3 flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline" className={cn('border', competitionColor(product.competition))}>
                    <Users className="mr-1 h-3 w-3" />
                    竞争度 {product.competition}
                  </Badge>
                  {product.bsrRank && (
                    <Badge variant="outline" className="border-slate-200 text-slate-600">
                      BSR #{product.bsrRank.split('#')[1]?.split(' ')[0] || product.bsrRank}
                    </Badge>
                  )}
                  {product.reviewCount !== undefined && (
                    <Badge variant="outline" className="border-slate-200 text-slate-600">
                      {product.reviewCount} 评论
                    </Badge>
                  )}
                  <Badge variant="outline" className={cn('border', riskColor(product.riskLevel))}>
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    风险 {product.riskLevel}
                  </Badge>
                </div>

                {/* AI Reason */}
                <p className="mb-3 text-xs leading-relaxed text-slate-500 line-clamp-2">
                  {product.reason}
                </p>

                {/* 货源信息 */}
                {product.sourceUrl && (
                  <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                    <Package className="h-4 w-4 flex-shrink-0 text-amber-600" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-slate-500">1688 货源链接</div>
                      <a
                        href={product.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate text-xs font-medium text-amber-700 hover:underline"
                      >
                        {product.sourceUrl}
                      </a>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-amber-600" />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="flex-1 gap-1 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => {
                      // 将完整产品数据存入 sessionStorage，报告页直接读取
                      const productData = {
                        productName: product.name,
                        category: product.category,
                        market: selectedMarket,
                        trendScore: product.trendScore || 75,
                        competitionLevel: product.competition || '中',
                        profitMargin: product.profitMargin || '35%',
                        sourcePrice: product.sourcePrice,
                        suggestedPrice: product.suggestedPrice,
                        monthlySales: product.monthlySales || '300+',
                        seasonalWindow: product.season || '全年可售',
                        tiktokHeat: product.tiktokHot || false,
                        riskLevel: product.riskLevel || '低',
                        aiAnalysis: product.reason || '',
                        actionAdvice: product.actionAdvice || '',
                        supplierInfo: product.supplierInfo || { name: '1688 供应商', rating: '85', minOrder: '50 件', shipDays: '3 天' },
                        logisticsAdvice: product.logistics || '建议空运试单',
                        sourceUrl: product.sourceUrl || '',
                      };
                      sessionStorage.setItem('selectedProduct', JSON.stringify(productData));
                      router.push(`/dashboard/selection/report?name=${encodeURIComponent(product.name)}&category=${encodeURIComponent(product.category)}&market=${selectedMarket}`);
                    }}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    查看完整报告
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="gap-1 bg-amber-500 hover:bg-amber-600"
                    onClick={() => {
                      const params = new URLSearchParams();
                      params.set('links', product.sourceUrl || '');
                      params.set('productName', product.name || '');
                      params.set('category', product.category || '');
                      params.set('market', selectedMarket || '');
                      params.set('sourcePrice', product.sourcePrice || '');
                      params.set('suggestedPrice', product.suggestedPrice || '');
                      router.push(`/dashboard/listing?${params.toString()}`);
                    }}
                  >
                    <Rocket className="h-3.5 w-3.5" />
                    一键上架
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={isFavorite(product) ? 'border-amber-500 bg-amber-50 text-amber-600' : ''}
                    onClick={() => toggleFavorite(product)}
                  >
                    <Heart className={`h-3.5 w-3.5 ${isFavorite(product) ? 'fill-amber-500' : ''}`} />
                    {isFavorite(product) ? '已收藏' : '收藏'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ====== Config Steps ======
  const renderStep = () => {
    switch (currentStep) {
      // ===== Step 1: 选品模式 =====
      case 0:
        return (
          <div>
            <div className="mb-6 text-center">
              <h2 className="text-lg font-bold text-slate-900">选择你的选品策略</h2>
              <p className="mt-1 text-sm text-slate-500">不同策略对应不同的筛选逻辑，AI 会根据你的选择调整推荐方向</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {modes.map((mode) => {
                const Icon = mode.icon;
                const isSelected = selectedMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={cn(
                      'flex flex-col items-start gap-3 rounded-xl border-2 p-5 text-left transition-all',
                      isSelected
                        ? `${mode.border} ${mode.bg} shadow-sm`
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    )}
                  >
                    <div className={cn('rounded-lg p-2.5', isSelected ? mode.bg : 'bg-slate-100')}>
                      <Icon className={cn('h-5 w-5', mode.color)} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">{mode.name}</span>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{mode.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      // ===== Step 2: 市场 + 品类 =====
      case 1:
        return (
          <div>
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">目标市场</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {markets.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMarket(m.id)}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-xl border-2 p-4 transition-all',
                      selectedMarket === m.id
                        ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    )}
                  >
                    <span className="text-2xl">{m.flag}</span>
                    <span className="text-sm font-medium text-slate-900">{m.name}</span>
                    <span className="text-xs text-slate-500">{m.desc}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">品类方向</h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {categories.map((c) => {
                  const Icon = c.icon;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategory(c.id)}
                      className={cn(
                        'flex items-center gap-2 rounded-xl border-2 p-2.5 transition-all',
                        selectedCategory === c.id
                          ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      )}
                    >
                      <Icon className={cn('h-4 w-4', selectedCategory === c.id ? 'text-emerald-600' : 'text-slate-400')} />
                      <span className="text-sm font-medium text-slate-700">{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-700">关键词 <span className="text-slate-400 font-normal">（可选）</span></h3>
              <Input
                placeholder="输入关键词，如：便携式、LED、硅胶、无线..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="max-w-md"
              />
              <p className="mt-1 text-xs text-slate-400">不填则由 AI 根据市场趋势自主推荐</p>
            </div>
          </div>
        );

      // ===== Step 3: 价格区间（第2层漏斗） =====
      case 2:
        return (
          <div>
            <div className="mb-6 text-center">
              <h2 className="text-lg font-bold text-slate-900">💰 价格区间</h2>
              <p className="mt-1 text-sm text-slate-500">价格决定 FBA 费用档位、利润空间和转化率。$15-35 是亚马逊甜蜜区间</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {/* 采购价 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-slate-400" />
                    1688 采购价（¥）
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Input type="number" value={minSourcePrice} onChange={(e) => setMinSourcePrice(e.target.value)} placeholder="最低" />
                    <span className="text-slate-400">—</span>
                    <Input type="number" value={maxSourcePrice} onChange={(e) => setMaxSourcePrice(e.target.value)} placeholder="最高" />
                  </div>
                  <p className="mt-2 text-xs text-slate-400">新手建议 ¥5-30，进阶卖家 ¥30-100</p>
                </CardContent>
              </Card>

              {/* 售价 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-slate-400" />
                    亚马逊售价（$）
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Input type="number" value={minSellingPrice} onChange={(e) => setMinSellingPrice(e.target.value)} placeholder="最低" />
                    <span className="text-slate-400">—</span>
                    <Input type="number" value={maxSellingPrice} onChange={(e) => setMaxSellingPrice(e.target.value)} placeholder="最高" />
                  </div>
                  <p className="mt-2 text-xs text-slate-400">甜蜜区间 $15-35，FBA 费用占比合理</p>
                </CardContent>
              </Card>

              {/* 目标利润率 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <BarChart3 className="h-4 w-4 text-slate-400" />
                    目标利润率
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Input type="number" value={targetProfit} onChange={(e) => setTargetProfit(e.target.value)} className="max-w-[120px]" />
                    <span className="text-sm font-medium text-slate-600">%</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">考虑 FBA 费用后，建议 ≥30% 利润率</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      // ===== Step 4: 竞争门槛（第3层漏斗） =====
      case 3:
        return (
          <div>
            <div className="mb-6 text-center">
              <h2 className="text-lg font-bold text-slate-900">🛡️ 竞争门槛</h2>
              <p className="mt-1 text-sm text-slate-500">设置竞争筛选条件，AI 只推荐符合门槛的蓝海品类</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">在售卖家数上限</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input type="number" value={maxSellers} onChange={(e) => setMaxSellers(e.target.value)} />
                  <p className="mt-1 text-xs text-slate-400">建议 ≤20，越少竞争越小</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">评论数上限</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input type="number" value={maxReviews} onChange={(e) => setMaxReviews(e.target.value)} />
                  <p className="mt-1 text-xs text-slate-400">建议 ≤500，新品才有机会</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">BSR 排名范围</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Input type="number" value={minBsr} onChange={(e) => setMinBsr(e.target.value)} placeholder="最低" />
                    <span className="text-slate-400">—</span>
                    <Input type="number" value={maxBsr} onChange={(e) => setMaxBsr(e.target.value)} placeholder="最高" />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">建议 5,000-50,000（有需求但不卷）</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">CPC 上限（$）</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input type="number" step="0.1" value={maxCpc} onChange={(e) => setMaxCpc(e.target.value)} />
                  <p className="mt-1 text-xs text-slate-400">建议 ≤$1.5，广告成本可控</p>
                </CardContent>
              </Card>
              <Card className="flex items-center">
                <CardHeader>
                  <CardTitle className="text-sm">近半年新品数 ≥</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input type="number" value={minNewProducts} onChange={(e) => setMinNewProducts(e.target.value)} />
                  <p className="mt-1 text-xs text-slate-400">≥5 说明有趋势，新品能入场</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      // ===== Step 5: 供应链（第4层漏斗） =====
      case 4:
        return (
          <div>
            <div className="mb-6 text-center">
              <h2 className="text-lg font-bold text-slate-900">🚚 供应链要求</h2>
              <p className="mt-1 text-sm text-slate-500">确保推荐的商品有稳定可靠的供应链支撑</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">1688 供应商 ≥</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input type="number" value={minSuppliers} onChange={(e) => setMinSuppliers(e.target.value)} />
                  <p className="mt-1 text-xs text-slate-400">建议 ≥3 家，有备选方案</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">起订量 ≤</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Input type="number" value={maxMoq} onChange={(e) => setMaxMoq(e.target.value)} />
                    <span className="text-sm text-slate-500">件</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">建议 ≤100，降低试单风险</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">发货天数 ≤</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Input type="number" value={maxShipDays} onChange={(e) => setMaxShipDays(e.target.value)} />
                    <span className="text-sm text-slate-500">天</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">建议 ≤3天，越快越好</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">好评率 ≥</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Input type="number" value={minRating} onChange={(e) => setMinRating(e.target.value)} className="max-w-[100px]" />
                    <span className="text-sm text-slate-500">%</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">建议 ≥90%</p>
                </CardContent>
              </Card>
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-sm">其他要求</CardTitle>
                </CardHeader>
                <CardContent>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={needDropShip}
                      onChange={(e) => setNeedDropShip(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-slate-700">需要支持一件代发（降低试单门槛）</span>
                  </label>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
          <Target className="h-4 w-4" />
          AI 智能选品 · 4 层漏斗
        </div>
        <h1 className="text-2xl font-bold text-slate-900">让 AI 帮你找到下一个爆款</h1>
        <p className="mt-2 text-sm text-slate-500">
          从选品模式、价格区间、竞争门槛到供应链要求，AI 逐层穿透，精准推荐
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Step Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;
            return (
              <button
                key={s.id}
                onClick={() => idx < currentStep && setCurrentStep(idx)}
                className={cn(
                  'flex flex-col items-center gap-1',
                  idx < currentStep ? 'cursor-pointer' : 'cursor-default'
                )}
              >
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all',
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md'
                      : isCompleted
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-slate-100 text-slate-400'
                  )}
                >
                  {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className={cn(
                  'text-xs',
                  isActive ? 'font-medium text-emerald-700' : isCompleted ? 'text-emerald-600' : 'text-slate-400'
                )}>
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
        {/* Progress Bar */}
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <Card className="mb-6">
        <CardContent className="p-6">
          {renderStep()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          ← 上一步
        </Button>

        {currentStep < 4 ? (
          <Button
            onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
            disabled={!canNext()}
            className="gap-1 bg-emerald-600 hover:bg-emerald-700"
          >
            下一步
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleGenerate}
            size="lg"
            className="gap-2 bg-emerald-600 px-8 hover:bg-emerald-700"
          >
            <Sparkles className="h-4 w-4" />
            开始 AI 选品
          </Button>
        )}
      </div>
    </div>
  );
}