'use client';

import Link from 'next/link';
import {
  TrendingUp,
  Package,
  ImageIcon,
  Video,
  BarChart3,
  Globe,
  Zap,
  Shield,
  ChevronDown,
  ChevronRight,
  Star,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Bot,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const features = [
  {
    icon: TrendingUp,
    title: '智能选品',
    desc: 'AI 分析百万商品数据，精准推荐潜力爆款，选品命中率高达 78%',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: Package,
    title: '一键采集',
    desc: '支持 1688、淘宝、京东、拼多多等主流供货平台，商品信息一键提取',
    color: 'bg-teal-50 text-teal-600',
  },
  {
    icon: ImageIcon,
    title: 'AI 素材工坊',
    desc: '30 秒生成专业商品图、场景图、信息图，省去 90% 设计成本',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Video,
    title: 'AI 视频生成',
    desc: '自动生成商品展示视频和介绍短视频，适配各平台规格要求',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    icon: BarChart3,
    title: '智能定价',
    desc: '自动计算成本、运费、佣金，给出最优定价建议和利润预估',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Globe,
    title: '多平台上架',
    desc: 'Shopee、Lazada、TikTok Shop、Amazon 一键铺货，自动适配格式',
    color: 'bg-violet-50 text-violet-600',
  },
];

const stats = [
  { value: '78%', label: '选品命中率' },
  { value: '45%', label: 'Listing 转化提升' },
  { value: '90%', label: '素材成本降低' },
  { value: '10x', label: '运营效率提升' },
];

const testimonials = [
  {
    name: '陈**',
    role: 'Shopee 卖家 · 月销 30 万',
    content:
      '以前选品全靠经验猜，用了龙掌柜 AI 之后，推荐的品确实靠谱，上个月 3 个推荐品都成了小爆款。',
    avatar: 'C',
  },
  {
    name: '林**',
    role: 'TikTok Shop 卖家 · 3 人团队',
    content:
      'AI 生成的商品图质量很好，省了我们请设计师的钱。而且一键发布到 TikTok Shop 真的太方便了。',
    avatar: 'L',
  },
  {
    name: '王**',
    role: 'Amazon 卖家 · 月销百万',
    content:
      '多平台管理终于不用来回切后台了，一个工作台看所有店铺数据，利润分析特别清晰。',
    avatar: 'W',
  },
];

const pricingPlans = [
  {
    name: '免费版',
    price: '0',
    period: '永久免费',
    desc: '适合新手体验',
    features: [
      '每日 5 次 AI 对话',
      '基础选品分析',
      '1 个平台接入',
      '社区支持',
    ],
    cta: '免费开始',
    popular: false,
  },
  {
    name: '专业版',
    price: '299',
    period: '/月',
    desc: '适合专业卖家',
    features: [
      '无限 AI 对话',
      '全平台选品分析',
      '商品采集 500 条/月',
      'AI 图片 200 张/月',
      'AI 视频 10 条/月',
      '3 个店铺管理',
      '优先客服支持',
    ],
    cta: '立即订阅',
    popular: true,
  },
  {
    name: '企业版',
    price: '999',
    period: '/月',
    desc: '适合团队和企业',
    features: [
      '专业版全部功能',
      '无限店铺管理',
      'API 接入',
      '自定义 AI Agent',
      '团队协作',
      '专属客户经理',
      'SLA 保障',
    ],
    cta: '联系销售',
    popular: false,
  },
];

const faqs = [
  {
    q: '龙掌柜 AI 支持哪些电商平台？',
    a: '目前支持 Shopee、Lazada、TikTok Shop 和 Amazon 四大主流跨境电商平台，覆盖东南亚、全球主要市场。后续将持续接入更多平台。',
  },
  {
    q: 'AI 生成的图片和视频可以直接用于商品上架吗？',
    a: '可以。AI 生成的图片分辨率达到 1024x1024 以上，符合各平台主图要求。视频支持 16:9 和 9:16 两种比例，适配商品详情和短视频推广。',
  },
  {
    q: '商品采集支持哪些供货平台？',
    a: '支持从 1688、淘宝、天猫、京东、拼多多等国内主流供货平台采集商品信息，包括标题、价格、图片、描述等完整数据。',
  },
  {
    q: '我的店铺数据安全吗？',
    a: '我们采用银行级数据加密，所有 API 通信均使用 HTTPS 加密传输。店铺授权采用官方 OAuth 流程，不会存储您的平台密码。',
  },
  {
    q: '可以免费试用付费功能吗？',
    a: '注册即送 5 次/天的免费 AI 对话额度，您可以充分体验核心功能。付费套餐支持 7 天无理由退款。',
  },
  {
    q: '团队协作功能怎么使用？',
    a: '企业版支持多成员协作，管理员可邀请团队成员加入，设置不同权限角色（运营、采购、管理等），共享商品库和数据。',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Bot className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-foreground">
              龙掌柜 AI
            </span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              功能
            </a>
            <a
              href="#pricing"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              定价
            </a>
            <a
              href="#faq"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              常见问题
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              asChild
            >
              <Link href="/login">登录</Link>
            </Button>
            <Button size="sm" asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Link href="/register">免费开始</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-hero pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="secondary"
              className="mb-6 gap-1 rounded-full px-4 py-1.5 text-xs font-medium"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              AI 驱动的跨境电商运营平台
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              让跨境电商运营
              <br />
              <span className="text-gradient">效率提升 10 倍</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">
              从选品到上架，从素材到分析，一个 AI 助手搞定全部。
              <br className="hidden sm:block" />
              支持 Shopee、Lazada、TikTok Shop、Amazon 多平台。
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                asChild
                className="h-12 rounded-xl bg-emerald-600 px-8 text-base font-medium shadow-lg shadow-emerald-600/25 hover:bg-emerald-700 text-white"
              >
                <Link href="/register">
                  免费开始使用
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 rounded-xl px-8 text-base"
              >
                观看演示
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              无需信用卡 · 免费版永久可用 · 30 秒注册
            </p>
          </div>

          {/* Hero Dashboard Preview */}
          <div className="mt-16 sm:mt-20">
            <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-border/50 bg-white shadow-2xl shadow-emerald-900/10">
              <div className="flex items-center gap-2 border-b bg-slate-50 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs text-muted-foreground">
                  龙掌柜 AI - 工作台
                </span>
              </div>
              <div className="grid grid-cols-12 gap-0">
                {/* Sidebar mock */}
                <div className="col-span-2 hidden border-r bg-slate-50/50 p-3 sm:block">
                  {['概览', 'AI 对话', '商品管理', '素材中心', '数据分析', '店铺管理'].map(
                    (item, i) => (
                      <div
                        key={item}
                        className={`mb-1 rounded-lg px-3 py-2 text-xs ${
                          i === 1
                            ? 'bg-emerald-50 font-medium text-emerald-700'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {item}
                      </div>
                    )
                  )}
                </div>
                {/* Main content mock */}
                <div className="col-span-12 p-4 sm:col-span-10 sm:p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="text-sm font-semibold text-foreground">
                      AI 运营助手
                    </div>
                    <div className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                      在线
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs text-white">
                        AI
                      </div>
                      <div className="rounded-xl rounded-tl-sm bg-slate-100 px-4 py-2.5 text-sm text-foreground max-w-md">
                        你好！我是龙掌柜 AI 助手。根据你店铺最近的数据分析，我建议关注 3C
                        配件品类，目前市场竞争度低、利润率高。需要我详细分析吗？
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-300 text-xs text-white ml-auto">
                        你
                      </div>
                      <div className="rounded-xl rounded-tr-sm bg-emerald-600 px-4 py-2.5 text-sm text-white max-w-md ml-auto">
                        好的，帮我分析一下 3C 配件的市场趋势和利润空间
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs text-white">
                        AI
                      </div>
                      <div className="rounded-xl rounded-tl-sm bg-slate-100 px-4 py-2.5 text-sm text-foreground max-w-lg">
                        <p className="mb-2">已完成 3C 配件品类分析，核心发现：</p>
                        <div className="space-y-1.5 rounded-lg bg-white p-3 border">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              手机壳 - 竞争度
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              低
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              预估利润率
                            </span>
                            <span className="font-medium text-emerald-600">
                              42%
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              月搜索量
                            </span>
                            <span className="font-medium">128,000+</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="border-b bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              跨境电商运营，还在被这些问题困扰？
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              龙掌柜 AI 一站式解决运营全链路难题
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: TrendingUp,
                pain: '选品靠猜',
                solution: 'AI 分析百万商品数据，精准推荐潜力爆款',
              },
              {
                icon: ImageIcon,
                pain: '作图太贵',
                solution: 'AI 30 秒生成专业商品图，省 90% 设计成本',
              },
              {
                icon: Globe,
                pain: '多平台混乱',
                solution: '一个后台管所有店铺，数据实时同步',
              },
              {
                icon: BarChart3,
                pain: '利润算不清',
                solution: '自动计算成本、运费、佣金，给出最优定价',
              },
            ].map((item) => (
              <Card
                key={item.pain}
                className="hover-lift border border-border/50 bg-white"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
                    <item.icon className="h-5 w-5 text-red-500" />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-foreground">
                    {item.pain}？
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.solution}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-section-alt py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">
              核心功能
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              六大核心能力，覆盖运营全链路
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              从选品到上架，AI 帮你完成每一步
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="hover-lift border border-border/50 bg-white"
              >
                <CardContent className="p-6">
                  <div
                    className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${feature.color}`}
                  >
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b bg-emerald-600 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-white sm:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-emerald-100">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">
              使用流程
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              三步开启智能运营
            </h2>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                step: '01',
                title: '连接店铺',
                desc: '授权接入你的 Shopee / TikTok Shop / Amazon 店铺，30 秒完成',
              },
              {
                step: '02',
                title: 'AI 分析选品',
                desc: '告诉 AI 你的品类偏好和预算，自动分析市场并推荐潜力商品',
              },
              {
                step: '03',
                title: '一键上架',
                desc: 'AI 生成素材、优化 Listing、计算定价，一键发布到多个平台',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-xl font-bold text-emerald-600">
                  {item.step}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-section-alt py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">
              用户评价
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              卖家们怎么说
            </h2>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3">
            {testimonials.map((t) => (
              <Card
                key={t.name}
                className="hover-lift border border-border/50 bg-white"
              >
                <CardContent className="p-6">
                  <div className="mb-3 flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="mb-4 text-sm leading-relaxed text-foreground">
                    &ldquo;{t.content}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-medium text-emerald-700">
                      {t.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {t.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t.role}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">
              定价方案
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              选择适合你的方案
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              从免费开始，按需升级。年付享 8 折优惠。
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative hover-lift ${
                  plan.popular
                    ? 'border-2 border-emerald-600 shadow-lg shadow-emerald-600/10'
                    : 'border border-border/50'
                } bg-white`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="rounded-full bg-emerald-600 px-3 py-0.5 text-xs text-white">
                      最受欢迎
                    </Badge>
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    {plan.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {plan.desc}
                  </p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-sm text-muted-foreground">¥</span>
                    <span className="text-4xl font-bold text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {plan.period}
                    </span>
                  </div>
                  <Button
                    className={`mt-6 w-full ${
                      plan.popular
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : ''
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                    asChild
                  >
                    <Link
                      href={plan.price === '0' ? '/register' : '/pricing'}
                    >
                      {plan.cta}
                    </Link>
                  </Button>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="bg-section-alt py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">
              常见问题
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              你可能想问
            </h2>
          </div>
          <div className="mx-auto mt-12 max-w-3xl">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq) => (
                <AccordionItem key={faq.q} value={faq.q}>
                  <AccordionTrigger className="text-left text-sm font-medium sm:text-base">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-emerald-600 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              准备好开启智能运营了吗？
            </h2>
            <p className="mt-4 text-lg text-emerald-100">
              加入 10,000+ 跨境卖家，用 AI 提升你的运营效率
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                asChild
                className="h-12 rounded-xl bg-white px-8 text-base font-medium text-emerald-700 shadow-lg hover:bg-emerald-50"
              >
                <Link href="/register">
                  免费注册
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                  <Bot className="h-5 w-5" />
                </div>
                <span className="text-lg font-bold text-foreground">
                  龙掌柜 AI
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                AI 驱动的跨境电商智能运营平台
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-foreground">
                产品
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#features" className="hover:text-foreground">
                    功能介绍
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-foreground">
                    定价方案
                  </a>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-foreground">
                    工作台
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-foreground">
                支持
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#faq" className="hover:text-foreground">
                    常见问题
                  </a>
                </li>
                <li>
                  <span className="cursor-pointer hover:text-foreground">
                    帮助中心
                  </span>
                </li>
                <li>
                  <span className="cursor-pointer hover:text-foreground">
                    联系我们
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-foreground">
                法律
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <span className="cursor-pointer hover:text-foreground">
                    隐私政策
                  </span>
                </li>
                <li>
                  <span className="cursor-pointer hover:text-foreground">
                    服务条款
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} 龙掌柜 AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
