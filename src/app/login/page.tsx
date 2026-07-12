'use client';

import Link from 'next/link';
import { Bot, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left side - branding */}
      <div className="hidden w-1/2 bg-emerald-600 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white">
              <Bot className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-white">龙掌柜 AI</span>
          </div>
        </div>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white">
            欢迎回来，
            <br />
            继续你的智能运营之旅
          </h2>
          <p className="text-lg text-emerald-100">
            AI 驱动的跨境电商运营平台，让效率提升 10 倍
          </p>
          <div className="space-y-3">
            {[
              '智能选品分析',
              'AI 素材生成',
              '多平台一键上架',
              '实时数据看板',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
                <span className="text-sm text-emerald-100">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-sm text-emerald-200">
          &copy; 2025 龙掌柜 AI. All rights reserved.
        </p>
      </div>

      {/* Right side - form */}
      <div className="flex w-full items-center justify-center px-4 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Bot className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold">龙掌柜 AI</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-foreground">登录</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            还没有账号？{' '}
            <Link
              href="/register"
              className="font-medium text-emerald-600 hover:text-emerald-700"
            >
              免费注册
            </Link>
          </p>

          <form className="mt-8 space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="email">邮箱地址</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">密码</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-emerald-600 hover:text-emerald-700"
                >
                  忘记密码？
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="输入密码"
                  className="pl-10"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
            >
              登录
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-muted-foreground">
                或通过以下方式登录
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="w-full">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
            <Button variant="outline" className="w-full">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="#07C160">
                <path d="M8.69 13.81c-.36 0-.69-.21-.84-.55l-.13-.31-.52-1.22c-.05-.1-.15-.15-.26-.1-.05.02-.08.06-.1.11l-.19.56c-.08.23-.29.39-.53.39H5.5c-.31 0-.56-.25-.56-.56 0-.08.02-.16.05-.23l1.76-3.79c.08-.17.25-.28.44-.28h.74c.31 0 .56.25.56.56 0 .08-.02.16-.05.23l-.88 1.9 1.2 2.79c.13.29.01.62-.27.76-.07.03-.13.05-.2.05zm4.76-4.59c1.73 0 3.13 1.4 3.13 3.13s-1.4 3.13-3.13 3.13-3.13-1.4-3.13-3.13 1.4-3.13 3.13-3.13zm0 5.26c1.18 0 2.13-.96 2.13-2.13s-.96-2.13-2.13-2.13-2.13.96-2.13 2.13.95 2.13 2.13 2.13z" />
              </svg>
              微信
            </Button>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            登录即表示同意{' '}
            <Link href="#" className="text-emerald-600 hover:underline">
              服务条款
            </Link>{' '}
            和{' '}
            <Link href="#" className="text-emerald-600 hover:underline">
              隐私政策
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
