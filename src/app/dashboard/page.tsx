'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Link2,
  Calculator,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  TrendingUp,
  Package,
  DollarSign,
  Flame,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
  BarChart3,
  ChevronRight,
  Target,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

// ROI 数据
const roiStats = [
  {
    label: 'AI 选品命中率',
    value: '68%',
    desc: '推荐商品中实际出单比例',
    trend: 'up',
    change: '+12%',
    icon: Target,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    label: '本月 AI 利润贡献',
    value: '¥18,420',
    desc: '通过 AI 选品上架带来的利润',
    trend: 'up',
    change: '+32%',
    icon: DollarSign,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    label: '效率提升',
    value: '4.2x',
    desc: '相比手动操作的速度倍数',
    trend: 'up',
    change: '+0.8x',
    icon: Zap,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    label: '本月节省时间',
    value: '86h',
    desc: 'AI 自动化节省的人工时间',
    trend: 'up',
    change: '+23h',
    icon: Clock,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
];

// AI 推荐选品
const recommendedProducts = [
  {
    id: 1,
    name: '便携式迷你风扇 USB 充电',
    category: '3C 配件',
    trendScore: 92,
    competition: '低',
    profitMargin: '42%',
    sourcePrice: '¥8.5',
    suggestedPrice: '$6.99',
    trendChange: '+186%',
    sellers: 23,
    hot: true,
  },
  {
    id: 2,
    name: '硅胶折叠水杯 户外便携',
    category: '户外运动',
    trendScore: 87,
    competition: '低',
    profitMargin: '38%',
    sourcePrice: '¥12',
    suggestedPrice: '$9.99',
    trendChange: '+124%',
    sellers: 41,
    hot: true,
  },
  {
    id: 3,
    name: 'LED 化妆镜 带灯三色调光',
    category: '美妆工具',
    trendScore: 81,
    competition: '中',
    profitMargin: '35%',
    sourcePrice: '¥18',
    suggestedPrice: '$14.99',
    trendChange: '+89%',
    sellers: 67,
    hot: false,
  },
  {
    id: 4,
    name: '宠物自动饮水器 2L 静音',
    category: '宠物用品',
    trendScore: 78,
    competition: '低',
    profitMargin: '45%',
    sourcePrice: '¥25',
    suggestedPrice: '$19.99',
    trendChange: '+156%',
    sellers: 18,
    hot: true,
  },
];

// 最近工作流
const recentWorkflows = [
  {
    id: 1,
    type: 'listing',
    status: 'completed',
    title: '1688 链接批量上架',
    detail: '5 件商品 → TikTok Shop US',
    time: '30 分钟前',
    result: '5/5 成功',
  },
  {
    id: 2,
    type: 'selection',
    status: 'completed',
    title: '家居品类 AI 选品',
    detail: '分析 150+ 商品，推荐 8 款',
    time: '2 小时前',
    result: '已加入采集',
  },
  {
    id: 3,
    type: 'pricing',
    status: 'completed',
    title: '蓝牙耳机定价优化',
    detail: '3 个 SKU 利润重新计算',
    time: '昨天',
    result: '利润率 +5%',
  },
];

export default function DashboardConsole() {
  const [linkInput, setLinkInput] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    if (hour < 6) setCurrentTime('夜深了');
    else if (hour < 12) setCurrentTime('上午好');
    else if (hour < 14) setCurrentTime('中午好');
    else if (hour < 18) setCurrentTime('下午好');
    else setCurrentTime('晚上好');
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* 顶部欢迎 + 快捷入口 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          {currentTime}，卖家
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          今天想做什么？选品、上架、还是看看数据？
        </p>
      </div>

      {/* 三大核心操作入口 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-8">
        {/* AI 选品 */}
        <Link href="/dashboard/selection">
          <Card className="group cursor-pointer border-emerald-200 bg-gradient-to-br from-emerald-50 to-white hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 h-full">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                  <Search className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">AI 智能选品</h3>
                  <p className="text-xs text-muted-foreground">找到下一个爆款</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI 分析市场趋势、竞争度和利润空间，直接推荐高潜力商品，附带数据支撑和行动建议。
              </p>
              <div className="mt-4 flex items-center gap-2 text-emerald-600 text-sm font-medium group-hover:gap-3 transition-all">
                <span>开始选品</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* 一键上架 */}
        <Link href="/dashboard/listing">
          <Card className="group cursor-pointer border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 h-full">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                  <Link2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">一键上架</h3>
                  <p className="text-xs text-muted-foreground">从采集到发布全自动</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Input
                    placeholder="粘贴 1688 / 淘宝 / 拼多多链接..."
                    className="h-8 text-xs flex-1"
                    value={linkInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLinkInput(e.target.value)}
                    onClick={(e: React.MouseEvent) => e.preventDefault()}
                  />
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  <span>支持批量导入，自动采集、翻译、生图、定价、发布</span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-blue-600 text-sm font-medium group-hover:gap-3 transition-all">
                <span>进入工作台</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* 利润计算 */}
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white hover:shadow-md transition-all duration-200 h-full">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
                <Calculator className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">利润计算器</h3>
                <p className="text-xs text-muted-foreground">算清楚每一分钱</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">采购成本</span>
                <Input className="h-7 w-24 text-xs text-right" placeholder="¥0.00" />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">售价 (USD)</span>
                <Input className="h-7 w-24 text-xs text-right" placeholder="$0.00" />
              </div>
              <div className="flex justify-between text-sm font-medium pt-2 border-t border-amber-100">
                <span className="text-foreground">预估利润率</span>
                <span className="text-amber-600">--</span>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-amber-600 text-sm font-medium">
              <span>含物流/佣金/汇率自动计算</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROI 数据展示 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-600" />
            AI 价值看板
          </h2>
          <Badge variant="secondary" className="text-xs">
            本月数据
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {roiStats.map((stat) => (
            <Card key={stat.label} className="hover-lift border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.bg}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <div className={`flex items-center gap-0.5 text-xs font-medium ${stat.trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {stat.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {stat.change}
                  </div>
                </div>
                <div className="text-xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                <div className="text-[10px] text-muted-foreground/70 mt-1">{stat.desc}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 下半区：AI 推荐选品 + 最近工作流 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* AI 推荐选品 */}
        <Card className="lg:col-span-3 border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Flame className="h-4 w-4 text-orange-500" />
                AI 今日推荐
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px]">
                  实时
                </Badge>
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs" asChild>
                <Link href="/dashboard/selection">
                  查看全部 <ChevronRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendedProducts.slice(0, 4).map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 rounded-xl border border-border/30 p-3 hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">
                        {product.name}
                      </span>
                      {product.hot && (
                        <Flame className="h-3 w-3 text-orange-500 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge variant="secondary" className="text-[10px]">
                        {product.category}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        竞争: {product.competition}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        在售卖家: {product.sellers}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-semibold text-emerald-600">
                      利润率 {product.profitMargin}
                    </div>
                    <div className="flex items-center gap-1 justify-end mt-0.5">
                      <TrendingUp className="h-3 w-3 text-emerald-500" />
                      <span className="text-[10px] text-emerald-600">
                        {product.trendChange}
                      </span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="shrink-0 text-xs h-8">
                    采集
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 最近工作流 */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-blue-500" />
                最近任务
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentWorkflows.map((wf) => (
                <div
                  key={wf.id}
                  className="flex items-start gap-3 rounded-lg border border-border/30 p-3"
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      wf.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-600'
                        : wf.status === 'running'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-amber-100 text-amber-600'
                    }`}
                  >
                    {wf.status === 'completed' ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : wf.status === 'running' ? (
                      <Zap className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {wf.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {wf.detail}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-emerald-600 font-medium">
                        {wf.result}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {wf.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full text-xs"
              asChild
            >
              <Link href="/dashboard/chat">
                <Sparkles className="mr-1 h-3 w-3" />
                让 AI 帮你做更多
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
