'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MessageSquare,
  Package,
  ImageIcon,
  Store,
  CreditCard,
  Settings,
  Bot,
  Bell,
  Search,
  ChevronDown,
  Sparkles,
  Puzzle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const sidebarItems = [
  { href: '/dashboard/chat', icon: MessageSquare, label: 'AI 助手', badge: 'AI' },
  { href: '/dashboard/skills', icon: Puzzle, label: '技能中心' },
  { href: '/dashboard/products', icon: Package, label: '商品管理' },
  { href: '/dashboard/assets', icon: ImageIcon, label: '素材中心' },
  { href: '/dashboard/shops', icon: Store, label: '店铺管理' },
];

const bottomItems = [
  { href: '/dashboard/billing', icon: CreditCard, label: '套餐 & 账单' },
  { href: '/dashboard/settings', icon: Settings, label: '设置' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside className="flex w-60 flex-col border-r bg-white">
        {/* Logo */}
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Bot className="h-5 w-5" />
          </div>
          <span className="text-base font-bold text-foreground">
            龙掌柜 AI
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive(item.href)
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-muted-foreground hover:bg-slate-50 hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <Badge
                  variant="secondary"
                  className="h-5 rounded-full bg-emerald-100 px-1.5 text-[10px] font-medium text-emerald-700"
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          ))}
        </nav>

        {/* Bottom items */}
        <div className="border-t p-3 space-y-1">
          {bottomItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive(item.href)
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-muted-foreground hover:bg-slate-50 hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Quota card */}
        <div className="border-t p-3">
          <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 p-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-800">
                免费版
              </span>
            </div>
            <p className="mt-1.5 text-xs text-emerald-700">
              今日剩余 3/5 次对话
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-emerald-200">
              <div
                className="h-full rounded-full bg-emerald-600"
                style={{ width: '60%' }}
              />
            </div>
            <Button
              size="sm"
              className="mt-2.5 h-7 w-full text-xs bg-emerald-600 text-white hover:bg-emerald-700"
              asChild
            >
              <Link href="/dashboard/billing">升级套餐</Link>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 items-center justify-between border-b bg-white px-6">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索功能、商品、对话..."
              className="h-9 w-full rounded-lg border bg-slate-50 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-emerald-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-medium text-emerald-700">
                U
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-foreground">
                  用户
                </div>
              </div>
              <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
