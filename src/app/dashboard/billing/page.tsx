'use client';

import {
  Check,
  CreditCard,
  Zap,
  Crown,
  Building2,
  ArrowRight,
  Receipt,
  Download,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const plans = [
  {
    name: '基础版',
    price: '¥99',
    period: '/月',
    desc: '适合个人卖家起步',
    icon: Zap,
    color: 'border-slate-200',
    iconBg: 'bg-slate-100 text-slate-600',
    features: [
      '每日 30 次 AI 对话',
      '每日 10 次选品分析',
      '每日 5 次素材生成',
      '1 个店铺连接',
      '基础数据看板',
      '社区支持',
    ],
    current: false,
  },
  {
    name: '专业版',
    price: '¥299',
    period: '/月',
    desc: '适合成长期卖家',
    icon: Crown,
    color: 'border-emerald-300 ring-2 ring-emerald-100',
    iconBg: 'bg-emerald-100 text-emerald-700',
    badge: '当前套餐',
    features: [
      '每日 100 次 AI 对话',
      '每日 50 次选品分析',
      '每日 20 次素材生成',
      '3 个店铺连接',
      '高级数据看板',
      '批量操作',
      '优先客服支持',
    ],
    current: true,
  },
  {
    name: '企业版',
    price: '¥999',
    period: '/月',
    desc: '适合团队和企业',
    icon: Building2,
    color: 'border-slate-200',
    iconBg: 'bg-violet-100 text-violet-600',
    features: [
      '无限 AI 对话',
      '无限选品分析',
      '无限素材生成',
      '10 个店铺连接',
      '全功能数据看板',
      '团队协作 (5人)',
      'API 开放',
      '专属客户经理',
    ],
    current: false,
  },
];

const billingHistory = [
  { date: '2024-06-01', amount: '¥299', plan: '专业版', status: '已支付' },
  { date: '2024-05-01', amount: '¥299', plan: '专业版', status: '已支付' },
  { date: '2024-04-01', amount: '¥99', plan: '基础版', status: '已支付' },
];

export default function BillingPage() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">订阅与账单</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          管理您的订阅套餐和查看账单记录
        </p>
      </div>

      {/* Current plan summary */}
      <Card className="mb-6 border-emerald-200 bg-gradient-to-r from-emerald-50 to-white">
        <CardContent className="flex items-center justify-between p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <Crown className="h-6 w-6 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-foreground">
                  专业版
                </span>
                <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">
                  当前套餐
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                到期时间：2024-07-01 · 剩余 18 天
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">¥299</div>
            <div className="text-xs text-muted-foreground">/月</div>
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          套餐方案
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.name} className={`relative ${plan.color} border`}>
              {plan.badge && (
                <Badge className="absolute -top-2.5 right-4 bg-emerald-600 text-white text-[10px]">
                  {plan.badge}
                </Badge>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${plan.iconBg}`}
                  >
                    <plan.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{plan.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {plan.desc}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-foreground"
                    >
                      <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`mt-5 w-full ${
                    plan.current
                      ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                  disabled={plan.current}
                >
                  {plan.current ? '当前套餐' : '升级套餐'}
                  {!plan.current && (
                    <ArrowRight className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Billing history */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              账单记录
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {billingHistory.map((bill, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-border/30 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                    <CreditCard className="h-4 w-4 text-slate-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {bill.plan}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {bill.date}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">
                    {bill.amount}
                  </span>
                  <Badge variant="secondary" className="text-[10px]">
                    {bill.status}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
