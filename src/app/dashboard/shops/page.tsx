'use client';

import {
  Store,
  Plus,
  ExternalLink,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  DollarSign,
  Package,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const shops = [
  {
    id: '1',
    name: 'DragonStore Official',
    platform: 'TikTok Shop',
    region: '东南亚',
    status: '已连接',
    products: 12,
    orders: 89,
    revenue: '$12,580',
    icon: '🎵',
    color: 'bg-slate-900 text-white',
  },
  {
    id: '2',
    name: 'Dragon Shopee MY',
    platform: 'Shopee',
    region: '马来西亚',
    status: '已连接',
    products: 8,
    orders: 156,
    revenue: '$8,320',
    icon: '🛒',
    color: 'bg-orange-500 text-white',
  },
  {
    id: '3',
    name: 'Dragon Lazada SG',
    platform: 'Lazada',
    region: '新加坡',
    status: '已连接',
    products: 5,
    orders: 42,
    revenue: '$3,200',
    icon: '🛍️',
    color: 'bg-blue-600 text-white',
  },
  {
    id: '4',
    name: 'Dragon Amazon US',
    platform: 'Amazon',
    region: '美国',
    status: '待授权',
    products: 0,
    orders: 0,
    revenue: '$0',
    icon: '📦',
    color: 'bg-amber-500 text-white',
  },
];

export default function ShopsPage() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">店铺管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            管理已连接的电商平台店铺，查看经营数据
          </p>
        </div>
        <Button size="sm" className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700">
          <Plus className="h-3.5 w-3.5" />
          添加店铺
        </Button>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: '已连接店铺', value: '3', icon: Store },
          { label: '总商品数', value: '25', icon: Package },
          { label: '总销售额', value: '$24,100', icon: DollarSign },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                <stat.icon className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-foreground">
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

      {/* Shop cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {shops.map((shop) => (
          <Card
            key={shop.id}
            className="border-border/50 hover-lift overflow-hidden"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${shop.color}`}
                  >
                    {shop.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground">
                        {shop.name}
                      </h3>
                      {shop.status === '已连接' ? (
                        <Badge className="bg-emerald-50 text-emerald-700 text-[10px] gap-1">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          已连接
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-50 text-amber-700 text-[10px] gap-1">
                          <AlertCircle className="h-2.5 w-2.5" />
                          待授权
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {shop.platform} · {shop.region}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              {shop.status === '已连接' ? (
                <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg bg-slate-50 p-3">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Package className="h-3 w-3" />
                      商品
                    </div>
                    <div className="mt-1 text-sm font-bold text-foreground">
                      {shop.products}
                    </div>
                  </div>
                  <div className="text-center border-x border-border/50">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <ShoppingBag className="h-3 w-3" />
                      订单
                    </div>
                    <div className="mt-1 text-sm font-bold text-foreground">
                      {shop.orders}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <DollarSign className="h-3 w-3" />
                      销售额
                    </div>
                    <div className="mt-1 text-sm font-bold text-emerald-600">
                      {shop.revenue}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    授权连接
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
