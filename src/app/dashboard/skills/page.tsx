'use client';

import { useState } from 'react';
import {
  Image,
  Video,
  Target,
  Send,
  BarChart3,
  Shield,
  MessageCircle,
  Calculator,
  Truck,
  Globe,
  Puzzle,
  Headphones,
  Plus,
  Check,
  Settings,
  Search,
  Sparkles,
  Zap,
  Star,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// --- Types ---
interface Skill {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: 'content' | 'selection' | 'operation' | 'data' | 'third-party' | 'marketing';
  installed: boolean;
  enabled: boolean;
  isBuiltIn: boolean;
  usageCount?: number;
  rating?: number;
  author?: string;
  triggerHint: string;
}

// --- Data ---
const builtInSkills: Skill[] = [
  {
    id: 'image-gen',
    name: 'AI 作图',
    description: '生成商品白底图、场景图、模特图、广告素材，支持 6 大跨境电商场景',
    icon: Image,
    category: 'content',
    installed: true,
    enabled: true,
    isBuiltIn: true,
    usageCount: 128,
    triggerHint: '对话中说"帮我生成一张白底图"',
  },
  {
    id: 'video-gen',
    name: 'AI 视频',
    description: '生成商品展示视频、开箱视频、广告素材视频，支持多平台比例',
    icon: Video,
    category: 'content',
    installed: true,
    enabled: true,
    isBuiltIn: true,
    usageCount: 56,
    triggerHint: '对话中说"帮我生成一个商品展示视频"',
  },
  {
    id: 'product-selection',
    name: '智能选品',
    description: '基于市场数据推荐潜力产品，分析趋势、竞争度、利润空间',
    icon: Target,
    category: 'selection',
    installed: true,
    enabled: true,
    isBuiltIn: true,
    usageCount: 89,
    triggerHint: '对话中说"推荐几个东南亚市场的好产品"',
  },
  {
    id: 'listing-optimize',
    name: 'Listing 优化',
    description: '生成优化标题、五点描述、搜索关键词，支持多语言翻译',
    icon: Send,
    category: 'operation',
    installed: true,
    enabled: true,
    isBuiltIn: true,
    usageCount: 203,
    triggerHint: '对话中说"帮我优化这个产品的标题"',
  },
  {
    id: 'ad-optimize',
    name: '广告优化',
    description: '分析亚马逊广告报告，提供 ACoS 优化、搜索词分析、广告架构建议',
    icon: BarChart3,
    category: 'marketing',
    installed: true,
    enabled: true,
    isBuiltIn: true,
    usageCount: 45,
    triggerHint: '对话中说"帮我分析下广告报告"或粘贴搜索词数据',
  },
  {
    id: 'auto-cs',
    name: '自动客服',
    description: '智能回复买家消息，支持多语言、批量处理、自动分类，7×24 小时自动响应',
    icon: Headphones,
    category: 'marketing',
    installed: true,
    enabled: true,
    isBuiltIn: true,
    usageCount: 0,
    triggerHint: '对话中说"帮我回复买家消息"或粘贴买家消息',
  },
  {
    id: 'data-insight',
    name: '数据洞察',
    description: '分析销售数据、流量来源、转化率，给出运营建议',
    icon: BarChart3,
    category: 'data',
    installed: true,
    enabled: false,
    isBuiltIn: true,
    usageCount: 0,
    triggerHint: '对话中说"分析一下上个月的销售数据"',
  },
];

const marketplaceSkills: Skill[] = [
  {
    id: 'competitor-monitor',
    name: '竞品监控',
    description: '追踪竞品价格、销量、评论变化，及时发现市场机会',
    icon: Shield,
    category: 'data',
    installed: false,
    enabled: false,
    isBuiltIn: false,
    usageCount: 1520,
    rating: 4.8,
    author: '官方',
    triggerHint: '',
  },
  {
    id: 'auto-reply',
    name: '自动客服',
    description: 'AI 自动回复买家消息，支持多语言，提高响应速度',
    icon: MessageCircle,
    category: 'operation',
    installed: false,
    enabled: false,
    isBuiltIn: false,
    usageCount: 3200,
    rating: 4.6,
    author: '官方',
    triggerHint: '',
  },
  {
    id: 'profit-calculator',
    name: '利润计算器',
    description: '实时计算多币种利润，包含物流、关税、平台佣金等成本',
    icon: Calculator,
    category: 'data',
    installed: false,
    enabled: false,
    isBuiltIn: false,
    usageCount: 2800,
    rating: 4.9,
    author: '官方',
    triggerHint: '',
  },
  {
    id: 'ip-check',
    name: '侵权检测',
    description: '检测产品是否涉及品牌商标、专利、版权风险',
    icon: Shield,
    category: 'selection',
    installed: false,
    enabled: false,
    isBuiltIn: false,
    usageCount: 980,
    rating: 4.7,
    author: '官方',
    triggerHint: '',
  },
  {
    id: 'logistics-compare',
    name: '物流比价',
    description: '对比各物流渠道价格、时效、清关能力，推荐最优方案',
    icon: Truck,
    category: 'operation',
    installed: false,
    enabled: false,
    isBuiltIn: false,
    usageCount: 1750,
    rating: 4.5,
    author: '官方',
    triggerHint: '',
  },
  {
    id: 'ad-optimizer',
    name: '广告优化',
    description: '分析广告 ROI，自动调整出价和关键词，优化投放效果',
    icon: Zap,
    category: 'operation',
    installed: false,
    enabled: false,
    isBuiltIn: false,
    usageCount: 640,
    rating: 4.4,
    author: '社区',
    triggerHint: '',
  },
  {
    id: 'multi-lang',
    name: '多语言翻译',
    description: '专业跨境电商翻译，支持 20+ 语言，本地化表达优化',
    icon: Globe,
    category: 'content',
    installed: false,
    enabled: false,
    isBuiltIn: false,
    usageCount: 4100,
    rating: 4.8,
    author: '官方',
    triggerHint: '',
  },
  {
    id: 'auto-cs',
    name: '自动客服',
    description: '7×24 智能回复买家消息，支持多语言，自动分类物流/退换货/投诉',
    icon: Headphones,
    category: 'operation',
    installed: false,
    enabled: false,
    isBuiltIn: false,
    usageCount: 2800,
    rating: 4.7,
    author: '官方',
    triggerHint: '',
  },
];

const categories = [
  { id: 'all', label: '全部' },
  { id: 'content', label: '内容创作' },
  { id: 'selection', label: '选品分析' },
  { id: 'operation', label: '运营工具' },
  { id: 'marketing', label: '营销推广' },
  { id: 'data', label: '数据分析' },
];

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([...builtInSkills]);
  const [marketSkills] = useState<Skill[]>(marketplaceSkills);
  const [activeTab, setActiveTab] = useState<'installed' | 'marketplace'>('installed');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSkill = (id: string) => {
    setSkills((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const installSkill = (id: string) => {
    const skill = marketSkills.find((s) => s.id === id);
    if (skill) {
      setSkills((prev) => [...prev, { ...skill, installed: true, enabled: true }]);
    }
  };

  const uninstallSkill = (id: string) => {
    setSkills((prev) => prev.filter((s) => s.id !== id));
  };

  const filteredInstalled = skills.filter((s) => {
    if (activeCategory !== 'all' && s.category !== activeCategory) return false;
    if (searchQuery && !s.name.includes(searchQuery) && !s.description.includes(searchQuery)) return false;
    return true;
  });

  const filteredMarketplace = marketSkills.filter((s) => {
    if (activeCategory !== 'all' && s.category !== activeCategory) return false;
    if (searchQuery && !s.name.includes(searchQuery) && !s.description.includes(searchQuery)) return false;
    return true;
  });

  const installedCount = skills.filter((s) => s.enabled).length;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
            <Puzzle className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">技能中心</h1>
            <p className="text-sm text-muted-foreground">
              管理 AI 助手的能力，安装新技能让助手更强大
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <span className="text-sm text-muted-foreground">已启用技能</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{installedCount}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center gap-2 mb-1">
            <Puzzle className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-muted-foreground">可安装技能</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{marketSkills.filter((s) => !skills.find((i) => i.id === s.id)).length}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-4 w-4 text-amber-600" />
            <span className="text-sm text-muted-foreground">今日调用次数</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{skills.reduce((sum, s) => sum + (s.usageCount || 0), 0)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => setActiveTab('installed')}
          className={cn(
            'text-sm font-medium pb-2 border-b-2 transition-colors',
            activeTab === 'installed'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          已安装 ({skills.length})
        </button>
        <button
          onClick={() => setActiveTab('marketplace')}
          className={cn(
            'text-sm font-medium pb-2 border-b-2 transition-colors',
            activeTab === 'marketplace'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          技能市场
        </button>
        <div className="flex-1" />
        <div className="relative w-56">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索技能..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-full rounded-lg border bg-white pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2 mb-5">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              activeCategory === cat.id
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-muted-foreground hover:bg-slate-200'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Installed skills */}
      {activeTab === 'installed' && (
        <div className="space-y-3">
          {filteredInstalled.length === 0 ? (
            <div className="rounded-xl border bg-white p-12 text-center">
              <Puzzle className="mx-auto h-10 w-10 text-slate-300 mb-3" />
              <p className="text-sm text-muted-foreground">没有找到匹配的技能</p>
            </div>
          ) : (
            filteredInstalled.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                onToggle={() => toggleSkill(skill.id)}
                onUninstall={() => uninstallSkill(skill.id)}
              />
            ))
          )}
        </div>
      )}

      {/* Marketplace */}
      {activeTab === 'marketplace' && (
        <div className="space-y-3">
          {filteredMarketplace.length === 0 ? (
            <div className="rounded-xl border bg-white p-12 text-center">
              <Puzzle className="mx-auto h-10 w-10 text-slate-300 mb-3" />
              <p className="text-sm text-muted-foreground">没有找到匹配的技能</p>
            </div>
          ) : (
            filteredMarketplace.map((skill) => {
              const isInstalled = skills.find((s) => s.id === skill.id);
              return (
                <MarketplaceSkillCard
                  key={skill.id}
                  skill={skill}
                  isInstalled={!!isInstalled}
                  onInstall={() => installSkill(skill.id)}
                />
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// --- Skill Card (Installed) ---
function SkillCard({
  skill,
  onToggle,
  onUninstall,
}: {
  skill: Skill;
  onToggle: () => void;
  onUninstall: () => void;
}) {
  const [showConfig, setShowConfig] = useState(false);
  const Icon = skill.icon;

  return (
    <div className="rounded-xl border bg-white p-4 transition-shadow hover:shadow-sm">
      <div className="flex items-start gap-4">
        <div className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
          skill.enabled ? 'bg-emerald-100' : 'bg-slate-100'
        )}>
          <Icon className={cn('h-5 w-5', skill.enabled ? 'text-emerald-600' : 'text-slate-400')} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-foreground">{skill.name}</h3>
            {skill.isBuiltIn && (
              <Badge variant="secondary" className="h-4 rounded-full bg-blue-100 px-1.5 text-[10px] text-blue-700">
                内置
              </Badge>
            )}
            {skill.enabled ? (
              <Badge variant="secondary" className="h-4 rounded-full bg-emerald-100 px-1.5 text-[10px] text-emerald-700">
                已启用
              </Badge>
            ) : (
              <Badge variant="secondary" className="h-4 rounded-full bg-slate-100 px-1.5 text-[10px] text-slate-500">
                已停用
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-2">{skill.description}</p>
          {skill.triggerHint && (
            <p className="text-xs text-emerald-600 bg-emerald-50 rounded-md px-2 py-1 inline-block">
              {skill.triggerHint}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {skill.usageCount !== undefined && skill.usageCount > 0 && (
            <span className="text-xs text-muted-foreground">
              已用 {skill.usageCount} 次
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground"
            onClick={() => setShowConfig(!showConfig)}
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>
          <button
            onClick={onToggle}
            className={cn(
              'relative h-5 w-9 rounded-full transition-colors',
              skill.enabled ? 'bg-emerald-600' : 'bg-slate-200'
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
                skill.enabled ? 'left-[18px]' : 'left-0.5'
              )}
            />
          </button>
          {!skill.isBuiltIn && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={onUninstall}
            >
              卸载
            </Button>
          )}
        </div>
      </div>
      {showConfig && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-muted-foreground mb-2">技能配置</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">默认输出格式：</span>
            <select className="h-7 rounded-md border bg-white px-2 text-xs">
              <option>自动</option>
              <option>高清</option>
              <option>标准</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Marketplace Skill Card ---
function MarketplaceSkillCard({
  skill,
  isInstalled,
  onInstall,
}: {
  skill: Skill;
  isInstalled: boolean;
  onInstall: () => void;
}) {
  const Icon = skill.icon;

  return (
    <div className="rounded-xl border bg-white p-4 transition-shadow hover:shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
          <Icon className="h-5 w-5 text-slate-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-foreground">{skill.name}</h3>
            {skill.author && (
              <span className="text-[10px] text-muted-foreground">{skill.author}</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-2">{skill.description}</p>
          <div className="flex items-center gap-3">
            {skill.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="text-xs text-foreground">{skill.rating}</span>
              </div>
            )}
            {skill.usageCount && (
              <span className="text-xs text-muted-foreground">
                {(skill.usageCount / 1000).toFixed(1)}k 次使用
              </span>
            )}
          </div>
        </div>
        <div className="shrink-0">
          {isInstalled ? (
            <Badge variant="secondary" className="h-7 rounded-lg bg-emerald-100 px-3 text-xs text-emerald-700">
              <Check className="mr-1 h-3 w-3" />
              已安装
            </Badge>
          ) : (
            <Button
              size="sm"
              className="h-7 text-xs bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={onInstall}
            >
              <Plus className="mr-1 h-3 w-3" />
              安装
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
