'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Target, TrendingUp, DollarSign, Shield, Truck,
  AlertTriangle, CheckCircle2, Info, FileText, ShoppingCart,
  ExternalLink, Download, Sparkles, BarChart4, Package,
  Ship, Warehouse, Percent, Users, Star, Calendar, Building2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// 从选品 API 返回的产品数据结构
interface ProductData {
  productName: string;
  category: string;
  market: string;
  trendScore: number;
  competitionLevel: string;
  profitMargin: string;
  sourcePrice: string;
  suggestedPrice: string;
  monthlySales: string;
  seasonalWindow: string;
  tiktokHeat: string;
  riskLevel: string;
  aiAnalysis: string;
  actionAdvice: string;
  supplierInfo: {
    name: string;
    rating: string;
    minOrder: string;
    shipDays: string;
  };
  logisticsAdvice: string;
  sourceUrl: string;
}

// 报告页展示的数据结构（从产品数据计算得出）
interface ReportData {
  productName: string;
  category: string;
  market: string;
  overallScore: number;
  scoreBreakdown: {
    trend: number;
    competition: number;
    profit: number;
    supply: number;
    content: number;
  };
  recommendation: string;
  reasons: string[];
  risks: { type: string; level: string; description: string }[];
  profitAnalysis: {
    costBreakdown: { item: string; amount: string }[];
    estimatedProfitPerUnit: string;
    profitMargin: string;
    fbaFeeTier: string;
    roi: string;
  };
  actionPlan: string[];
  suggestedPrice: string;
  suggestedAdBudget: string;
  suggestedStock: string;
  shippingAdvice: string;
  variationStrategy: string;
  brandingAdvice: string;
  sourceUrl: string;
  supplierInfo: ProductData['supplierInfo'];
  monthlySales: string;
  seasonalWindow: string;
  tiktokHeat: string;
  aiAnalysis: string;
}

const RECOMMENDATION_COLORS: Record<string, string> = {
  '强烈推荐': 'text-emerald-600 bg-emerald-50 border-emerald-200',
  '推荐': 'text-blue-600 bg-blue-50 border-blue-200',
  '谨慎推荐': 'text-amber-600 bg-amber-50 border-amber-200',
  '不推荐': 'text-red-600 bg-red-50 border-red-200',
};

const RISK_LEVEL_COLORS: Record<string, string> = {
  '低': 'bg-emerald-50 text-emerald-700',
  '中': 'bg-amber-50 text-amber-700',
  '高': 'bg-red-50 text-red-700',
};

function ScoreGauge({ label, score, color }: { label: string; score: number; color: string }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="70" height="70" viewBox="0 0 70 70">
        <circle cx="35" cy="35" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="6" />
        <circle
          cx="35" cy="35" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 35 35)"
          className="transition-all duration-700"
        />
        <text x="35" y="35" textAnchor="middle" dominantBaseline="central" className="text-sm font-bold" fill={color}>
          {score}
        </text>
      </svg>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}

// 从产品数据计算报告数据
function generateReportFromProduct(product: ProductData): ReportData {
  // 计算五维评分
  const trendScore = product.trendScore || 75;
  const competitionScore = product.competitionLevel === '低' ? 85 : product.competitionLevel === '中' ? 65 : 45;
  const profitScore = parseInt(product.profitMargin) || 70;
  const supplyScore = parseInt(product.supplierInfo?.rating) || 75;
  const contentScore = product.tiktokHeat?.includes('高') ? 85 : product.tiktokHeat?.includes('中') ? 70 : 55;

  const overallScore = Math.round((trendScore + competitionScore + profitScore + supplyScore + contentScore) / 5);

  // 推荐等级
  let recommendation = '推荐';
  if (overallScore >= 85) recommendation = '强烈推荐';
  else if (overallScore >= 70) recommendation = '推荐';
  else if (overallScore >= 55) recommendation = '谨慎推荐';
  else recommendation = '不推荐';

  // 推荐理由
  const reasons = [
    `趋势分 ${trendScore}/100，${trendScore >= 80 ? '市场热度持续上升' : '市场表现稳定'}`,
    `竞争度${product.competitionLevel}，${product.competitionLevel === '低' ? '新品有机会快速突围' : '需要差异化策略'}`,
    `预估利润率 ${product.profitMargin}，${parseInt(product.profitMargin) >= 30 ? '利润空间充足' : '需要优化成本'}`,
    `月销量预估 ${product.monthlySales}，市场需求明确`,
    product.seasonalWindow ? `季节窗口：${product.seasonalWindow}` : '全年可售',
  ];

  // 风险评估
  const risks = [
    {
      type: '供应链风险',
      level: product.supplierInfo?.rating && parseInt(product.supplierInfo.rating) >= 90 ? '低' : '中',
      description: product.supplierInfo?.name ? `供应商：${product.supplierInfo.name}，评分 ${product.supplierInfo.rating}%` : '建议寻找多个供应商备选',
    },
    {
      type: '竞争风险',
      level: product.competitionLevel === '低' ? '低' : product.competitionLevel === '中' ? '中' : '高',
      description: product.competitionLevel === '低' ? '竞争不激烈，新品有机会' : '需要差异化定位',
    },
    {
      type: '利润风险',
      level: parseInt(product.profitMargin) >= 30 ? '低' : '中',
      description: `毛利率 ${product.profitMargin}，${parseInt(product.profitMargin) >= 30 ? '利润健康' : '注意控制成本'}`,
    },
  ];

  // 利润分析
  const sourcePriceNum = parseFloat(product.sourcePrice?.replace(/[¥$]/g, '')) || 20;
  const suggestedPriceNum = parseFloat(product.suggestedPrice?.replace(/[¥$]/g, '')) || 15;
  const profitPerUnit = suggestedPriceNum - sourcePriceNum * 0.14 - 3.5 - suggestedPriceNum * 0.15; // 粗略计算
  const profitMarginNum = (profitPerUnit / suggestedPriceNum * 100) || 35;

  const costBreakdown = [
    { item: '产品成本（1688 采购）', amount: `¥${sourcePriceNum.toFixed(2)}` },
    { item: '头程物流（海运/空运）', amount: '¥2.80' },
    { item: 'FBA 配送费', amount: '$3.96' },
    { item: '平台佣金（15%）', amount: `$${(suggestedPriceNum * 0.15).toFixed(2)}` },
    { item: '广告成本（ACoS 25%）', amount: `$${(suggestedPriceNum * 0.25 * 0.3).toFixed(2)}` },
    { item: '退货损耗（5%）', amount: `$${(suggestedPriceNum * 0.05).toFixed(2)}` },
  ];

  // 行动建议
  const actionPlan = product.actionAdvice
    ? product.actionAdvice.split('\n').filter(a => a.trim()).map(a => a.replace(/^\d+\.\s*/, '').replace(/^[-•]\s*/, ''))
    : [
        '联系 1688 供应商确认起订量和发货时间',
        '小批量试单（50-100 件），空运测试市场',
        '优化标题关键词，覆盖核心搜索词',
        '准备 3-5 组主图，突出产品卖点',
        '定价建议：$' + suggestedPriceNum.toFixed(2) + '，略低于均价快速切入',
      ];

  return {
    productName: product.productName,
    category: product.category,
    market: product.market,
    overallScore,
    scoreBreakdown: {
      trend: trendScore,
      competition: competitionScore,
      profit: profitScore,
      supply: supplyScore,
      content: contentScore,
    },
    recommendation,
    reasons,
    risks,
    profitAnalysis: {
      costBreakdown,
      estimatedProfitPerUnit: `$${profitPerUnit.toFixed(2)}`,
      profitMargin: `${profitMarginNum.toFixed(1)}%`,
      fbaFeeTier: '标准尺寸（≤1lb）',
      roi: `${((profitPerUnit / (sourcePriceNum * 0.14 + 3.5)) * 100).toFixed(0)}%`,
    },
    actionPlan,
    suggestedPrice: product.suggestedPrice,
    suggestedAdBudget: `$${(suggestedPriceNum * 0.25 * 30).toFixed(0)}/月`,
    suggestedStock: '100-200 件（首单试水）',
    shippingAdvice: product.logisticsAdvice || '建议空运试单，稳定后转海运',
    variationStrategy: '建议 3-5 个颜色变体，覆盖主流偏好',
    brandingAdvice: '建议注册品牌，长期可建品牌壁垒',
    sourceUrl: product.sourceUrl,
    supplierInfo: product.supplierInfo,
    monthlySales: product.monthlySales,
    seasonalWindow: product.seasonalWindow,
    tiktokHeat: product.tiktokHeat,
    aiAnalysis: product.aiAnalysis,
  };
}

export default function SelectionReportPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 从 sessionStorage 读取选品数据
    const productDataStr = sessionStorage.getItem('selectedProduct');
    if (productDataStr) {
      try {
        const productData: ProductData = JSON.parse(productDataStr);
        const reportData = generateReportFromProduct(productData);
        setReport(reportData);
      } catch {
        // 解析失败，使用 URL 参数生成简单报告
        const fallbackProduct: ProductData = {
          productName: searchParams.get('name') || '未知商品',
          category: searchParams.get('category') || '',
          market: searchParams.get('market') || 'us',
          trendScore: 75,
          competitionLevel: '中',
          profitMargin: '35%',
          sourcePrice: searchParams.get('sourcePrice') || '¥20',
          suggestedPrice: searchParams.get('suggestedPrice') || '$15',
          monthlySales: '300+',
          seasonalWindow: '全年可售',
          tiktokHeat: '中等',
          riskLevel: '低',
          aiAnalysis: '市场表现稳定，建议小批量试单',
          actionAdvice: '1. 联系供应商确认起订量\n2. 小批量试单测试市场\n3. 优化标题和主图',
          supplierInfo: {
            name: '1688 供应商',
            rating: '85',
            minOrder: '50 件',
            shipDays: '3 天',
          },
          logisticsAdvice: '建议空运试单',
          sourceUrl: searchParams.get('sourceUrl') || '',
        };
        setReport(generateReportFromProduct(fallbackProduct));
      }
    } else {
      // 没有 sessionStorage 数据，使用 URL 参数
      const fallbackProduct: ProductData = {
        productName: searchParams.get('name') || '未知商品',
        category: searchParams.get('category') || '',
        market: searchParams.get('market') || 'us',
        trendScore: 75,
        competitionLevel: '中',
        profitMargin: '35%',
        sourcePrice: searchParams.get('sourcePrice') || '¥20',
        suggestedPrice: searchParams.get('suggestedPrice') || '$15',
        monthlySales: '300+',
        seasonalWindow: '全年可售',
        tiktokHeat: '中等',
        riskLevel: '低',
        aiAnalysis: '市场表现稳定，建议小批量试单',
        actionAdvice: '1. 联系供应商确认起订量\n2. 小批量试单测试市场\n3. 优化标题和主图',
        supplierInfo: {
          name: '1688 供应商',
          rating: '85',
          minOrder: '50 件',
          shipDays: '3 天',
        },
        logisticsAdvice: '建议空运试单',
        sourceUrl: searchParams.get('sourceUrl') || '',
      };
      setReport(generateReportFromProduct(fallbackProduct));
    }
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex min-h-[600px] flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-emerald-50" />
          <Sparkles className="absolute inset-0 m-auto h-8 w-8 animate-pulse text-emerald-600" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-900">正在加载报告...</h3>
          <p className="mt-2 text-sm text-slate-500">
            基于选品数据生成分析报告
          </p>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const scoreColor = report.overallScore >= 80 ? '#059669' : report.overallScore >= 60 ? '#d97706' : '#dc2626';

  // 推荐背景色
  const recInfo = RECOMMENDATION_COLORS[report.recommendation] || 'text-slate-600 bg-slate-50 border-slate-200';

  return (
    <div className="mx-auto max-w-4xl">
      {/* Back link */}
      <Link href="/dashboard/selection" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" />
        返回选品列表
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <Badge className={cn('text-sm px-3 py-1', ...recInfo.split(' '))}>
                {report.recommendation}
              </Badge>
              <Badge variant="outline" className="text-xs">
                综合评分 {report.overallScore}/100
              </Badge>
            </div>
            <h1 className="text-xl font-bold text-slate-900">{report.productName}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {report.category} · {report.market === 'us' ? '美国' : report.market === 'uk' ? '英国' : report.market === 'sea' ? '东南亚' : report.market === 'jp' ? '日本' : '欧洲'}
            </p>
          </div>
          <div className="flex gap-2">
            {report.sourceUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={report.sourceUrl} target="_blank" rel="noopener noreferrer" className="gap-1">
                  <ExternalLink className="h-3.5 w-3.5" />
                  1688 货源
                </a>
              </Button>
            )}
            <Button
              size="sm"
              className="gap-1 bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                const params = new URLSearchParams();
                params.set('name', String(report.productName));
                params.set('category', String(report.category));
                params.set('market', String(report.market));
                params.set('sourcePrice', String(report.profitAnalysis.costBreakdown[0]?.amount || ''));
                params.set('suggestedPrice', String(report.suggestedPrice));
                if (report.sourceUrl) params.set('sourceUrl', String(report.sourceUrl));
                router.push(`/dashboard/listing?${params.toString()}`);
              }}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              一键上架
            </Button>
          </div>
        </div>
      </div>

      {/* Score Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart4 className="h-5 w-5 text-emerald-600" />
            五维评分
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-around gap-4">
            <ScoreGauge label="趋势" score={report.scoreBreakdown.trend} color="#059669" />
            <ScoreGauge label="竞争" score={report.scoreBreakdown.competition} color="#3b82f6" />
            <ScoreGauge label="利润" score={report.scoreBreakdown.profit} color="#d97706" />
            <ScoreGauge label="供应链" score={report.scoreBreakdown.supply} color="#8b5cf6" />
            <ScoreGauge label="内容" score={report.scoreBreakdown.content} color="#ec4899" />
          </div>
        </CardContent>
      </Card>

      {/* Recommendation */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-5 w-5 text-emerald-600" />
            AI 推荐理由
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {report.reasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Market Analysis */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            市场分析
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-xs text-slate-500">月销量预估</div>
              <div className="mt-1 text-lg font-semibold text-slate-900">{report.monthlySales}</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-xs text-slate-500">TikTok 热度</div>
              <div className="mt-1 text-lg font-semibold text-slate-900">{report.tiktokHeat}</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-xs text-slate-500">季节窗口</div>
              <div className="mt-1 text-lg font-semibold text-slate-900">{report.seasonalWindow}</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-xs text-slate-500">建议售价</div>
              <div className="mt-1 text-lg font-semibold text-emerald-600">{report.suggestedPrice}</div>
            </div>
          </div>
          {report.aiAnalysis && (
            <div className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
              <div className="mb-1 font-medium">AI 分析</div>
              <p>{report.aiAnalysis}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profit Analysis */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-5 w-5 text-amber-600" />
            利润测算
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid gap-3 sm:grid-cols-4">
            <div className="rounded-lg bg-emerald-50 p-3 text-center">
              <div className="text-xs text-emerald-700">净利润/件</div>
              <div className="mt-1 text-lg font-bold text-emerald-600">{report.profitAnalysis.estimatedProfitPerUnit}</div>
            </div>
            <div className="rounded-lg bg-blue-50 p-3 text-center">
              <div className="text-xs text-blue-700">利润率</div>
              <div className="mt-1 text-lg font-bold text-blue-600">{report.profitAnalysis.profitMargin}</div>
            </div>
            <div className="rounded-lg bg-amber-50 p-3 text-center">
              <div className="text-xs text-amber-700">FBA 档位</div>
              <div className="mt-1 text-sm font-bold text-amber-600">{report.profitAnalysis.fbaFeeTier}</div>
            </div>
            <div className="rounded-lg bg-purple-50 p-3 text-center">
              <div className="text-xs text-purple-700">ROI</div>
              <div className="mt-1 text-lg font-bold text-purple-600">{report.profitAnalysis.roi}</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-700">成本拆解</div>
            {report.profitAnalysis.costBreakdown.map((item, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span className="text-slate-600">{item.item}</span>
                <span className="font-medium text-slate-900">{item.amount}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-5 w-5 text-red-600" />
            风险评估
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {report.risks.map((risk, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
                <Badge className={cn('shrink-0', RISK_LEVEL_COLORS[risk.level])}>
                  {risk.level}风险
                </Badge>
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-900">{risk.type}</div>
                  <div className="mt-1 text-xs text-slate-600">{risk.description}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Plan */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5 text-emerald-600" />
            行动建议
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {report.actionPlan.map((action, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-medium text-emerald-700">
                  {i + 1}
                </span>
                <span>{action}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Supplier Info */}
      {report.supplierInfo && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-5 w-5 text-purple-600" />
              推荐供应商
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-medium text-slate-900">{report.supplierInfo.name}</div>
                <Badge variant="outline" className="text-xs">
                  {report.supplierInfo.rating}
                </Badge>
              </div>
              <div className="grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                <div> 起订量：{report.supplierInfo.minOrder}</div>
                <div>🚚 发货：{report.supplierInfo.shipDays}天</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strategy Advice */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Ship className="h-4 w-4 text-blue-600" />
              物流策略
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-600">{report.shippingAdvice}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4 text-purple-600" />
              变体策略
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-600">{report.variationStrategy}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 text-amber-600" />
              品牌建议
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-600">{report.brandingAdvice}</p>
          </CardContent>
        </Card>
      </div>

      {/* Footer Actions */}
      <div className="mt-6 flex justify-center gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/selection">
            ← 返回选品
          </Link>
        </Button>
        {report.sourceUrl && (
          <Button variant="outline" size="sm" asChild>
            <a href={report.sourceUrl} target="_blank" rel="noopener noreferrer" className="gap-1">
              <ExternalLink className="h-3.5 w-3.5" />
              访问 1688 货源
            </a>
          </Button>
        )}
        <Button
          size="sm"
          className="gap-1 bg-emerald-600 hover:bg-emerald-700"
          onClick={() => {
            const params = new URLSearchParams();
            params.set('name', String(report.productName));
            params.set('category', String(report.category));
            params.set('market', String(report.market));
            params.set('sourcePrice', String(report.profitAnalysis.costBreakdown[0]?.amount || ''));
            params.set('suggestedPrice', String(report.suggestedPrice));
            if (report.sourceUrl) params.set('sourceUrl', String(report.sourceUrl));
            router.push(`/dashboard/listing?${params.toString()}`);
          }}
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          一键上架
        </Button>
      </div>
    </div>
  );
}
