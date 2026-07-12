'use client';

import Link from 'next/link';
import {
  MessageSquare,
  Package,
  ImageIcon,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  BarChart3,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const statCards = [
  {
    label: '今日 AI 对话',
    value: '12',
    change: '+3',
    trend: 'up',
    icon: MessageSquare,
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    label: '本月新增商品',
    value: '28',
    change: '+12',
    trend: 'up',
    icon: Package,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    label: '素材生成数',
    value: '45',
    change: '+18',
    trend: 'up',
    icon: ImageIcon,
    color: 'bg-amber-50 text-amber-600',
  },
  {
    label: '预估月利润',
    value: '¥12,580',
    change: '+8.2%',
    trend: 'up',
    icon: TrendingUp,
    color: 'bg-violet-50 text-violet-600',
  },
];

const recentActivities = [
  {
    type: 'chat',
    text: 'AI 分析了 3C 配件品类市场趋势',
    time: '10 分钟前',
  },
  {
    type: 'product',
    text: '采集了 5 条 1688 商品信息',
    time: '1 小时前',
  },
  {
    type: 'image',
    text: '生成了 3 张商品展示图',
    time: '2 小时前',
  },
  {
    type: 'publish',
    text: '发布 2 件商品到 TikTok Shop',
    time: '3 小时前',
  },
  {
    type: 'chat',
    text: 'AI 计算了手机壳定价方案',
    time: '昨天',
  },
];

const quickActions = [
  {
    icon: MessageSquare,
    label: '开始 AI 对话',
    desc: '选品分析、定价建议',
    href: '/dashboard/chat',
    color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
  },
  {
    icon: Package,
    label: '采集商品',
    desc: '从供货平台采集',
    href: '/dashboard/products',
    color: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
  },
  {
    icon: ImageIcon,
    label: '生成素材',
    desc: 'AI 商品图/视频',
    href: '/dashboard/assets',
    color: 'bg-amber-50 text-amber-600 hover:bg-amber-100',
  },
  {
    icon: BarChart3,
    label: '查看数据',
    desc: '运营数据看板',
    href: '/dashboard/analytics',
    color: 'bg-violet-50 text-violet-600 hover:bg-violet-100',
  },
];

export default function DashboardOverview() {
  return (
    <div className="p-6">
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          你好，欢迎回来 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          今天是个好日子，来看看你的运营数据吧
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="hover-lift border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.color}`}
                >
                  <stat.icon className="h-4 w-4" />
                </div>
                <div
                  className={`flex items-center gap-1 text-xs font-medium ${
                    stat.trend === 'up' ? 'text-emerald-600' : 'text-red-500'
                  }`}
                >
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          快捷操作
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href}>
              <div
                className={`flex items-center gap-3 rounded-xl p-4 transition-colors ${action.color}`}
              >
                <action.icon className="h-5 w-5" />
                <div>
                  <div className="text-sm font-medium">{action.label}</div>
                  <div className="text-xs opacity-70">{action.desc}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Main content grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">最近活动</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs">
                查看全部
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      activity.type === 'chat'
                        ? 'bg-emerald-100 text-emerald-600'
                        : activity.type === 'product'
                          ? 'bg-blue-100 text-blue-600'
                          : activity.type === 'image'
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-violet-100 text-violet-600'
                    }`}
                  >
                    {activity.type === 'chat' ? (
                      <MessageSquare className="h-3.5 w-3.5" />
                    ) : activity.type === 'product' ? (
                      <Package className="h-3.5 w-3.5" />
                    ) : activity.type === 'image' ? (
                      <ImageIcon className="h-3.5 w-3.5" />
                    ) : (
                      <ShoppingBag className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm text-foreground">
                      {activity.text}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Tips */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              AI 运营建议
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: '关注手机壳品类',
                  desc: '近 7 天搜索量上涨 23%，竞争度低，建议上架',
                  tag: '选品',
                },
                {
                  title: '优化 Listing 标题',
                  desc: '你店铺有 3 件商品标题关键词覆盖不足',
                  tag: '优化',
                },
                {
                  title: '调整定价策略',
                  desc: '蓝牙耳机品类竞品降价，建议调整利润预期',
                  tag: '定价',
                },
              ].map((tip) => (
                <div
                  key={tip.title}
                  className="rounded-lg border border-border/50 p-3"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {tip.tag}
                    </Badge>
                    <span className="text-sm font-medium text-foreground">
                      {tip.title}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {tip.desc}
                  </p>
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
                <Zap className="mr-1 h-3 w-3" />
                让 AI 详细分析
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
