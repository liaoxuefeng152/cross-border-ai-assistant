'use client';

import { User, Bell, Shield, Palette, Globe, Key } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">设置</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          管理账户信息和偏好设置
        </p>
      </div>

      {/* Profile */}
      <Card className="mb-6 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            个人信息
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-xl font-bold text-white">
              龙
            </div>
            <div>
              <Button variant="outline" size="sm">
                更换头像
              </Button>
              <p className="mt-1 text-xs text-muted-foreground">
                支持 JPG、PNG 格式，最大 2MB
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">昵称</Label>
              <Input defaultValue="跨境卖家小王" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">邮箱</Label>
              <Input defaultValue="seller@example.com" type="email" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">手机号</Label>
              <Input defaultValue="+86 138****8888" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">主营品类</Label>
              <Input defaultValue="3C 配件、家居用品" />
            </div>
          </div>
          <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700">
            保存修改
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="mb-6 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" />
            通知设置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: '订单通知', desc: '新订单、退款、发货状态变更', default: true },
            { label: 'AI 任务完成', desc: '选品分析、素材生成等任务完成通知', default: true },
            { label: '额度提醒', desc: '当日用量接近上限时提醒', default: true },
            { label: '产品更新', desc: '新功能发布和产品更新通知', default: false },
            { label: '营销邮件', desc: '优惠活动、使用技巧等推送', default: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-foreground">
                  {item.label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.desc}
                </div>
              </div>
              <Switch defaultChecked={item.default} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="mb-6 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            安全设置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">登录密码</div>
              <div className="text-xs text-muted-foreground">
                上次修改：30 天前
              </div>
            </div>
            <Button variant="outline" size="sm">
              修改密码
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">两步验证</div>
              <div className="text-xs text-muted-foreground">
                登录时需要额外验证码
              </div>
            </div>
            <Button variant="outline" size="sm">
              开启
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                API 密钥
                <Badge variant="secondary" className="text-[10px]">
                  企业版
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                用于接入 API 接口
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Key className="h-3.5 w-3.5" />
              生成密钥
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="h-4 w-4" />
            偏好设置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">语言</div>
              <div className="text-xs text-muted-foreground">
                界面显示语言
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <Globe className="h-4 w-4 text-muted-foreground" />
              简体中文
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">目标市场</div>
              <div className="text-xs text-muted-foreground">
                AI 推荐和分析的目标市场
              </div>
            </div>
            <div className="flex gap-1">
              {['东南亚', '美国', '英国'].map((m) => (
                <Badge key={m} variant="secondary" className="text-[10px]">
                  {m}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
