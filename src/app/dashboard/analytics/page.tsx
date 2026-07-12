'use client';

import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Package,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const salesData = [
  { date: '06/01', sales: 4200, orders: 12 },
  { date: '06/05', sales: 5800, orders: 18 },
  { date: '06/10', sales: 3900, orders: 10 },
  { date: '06/15', sales: 7200, orders: 24 },
  { date: '06/20', sales: 6100, orders: 20 },
  { date: '06/25', sales: 8500, orders: 28 },
  { date: '06/30', sales: 9200, orders: 32 },
  { date: '07/05', sales: 7800, orders: 26 },
  { date: '07/10', sales: 10500, orders: 35 },
  { date: '07/12', sales: 12580, orders: 42 },
];

const profitData = [
  { name: '3C 配件', value: 4500, color: '#059669' },
  { name: '家居用品', value: 3200, color: '#0D9488' },
  { name: '美妆护肤', value: 2800, color: '#F59E0B' },
  { name: '服装鞋帽', value: 2080, color: '#8B5CF6' },
];

const topProducts = [
  { name: '蓝牙耳机 TWS', sales: 156, revenue: '$3,118', profit: '42%', trend: 'up' },
  { name: '手机壳 iPhone 15', sales: 234, revenue: '$1,401', profit: '55%', trend: 'up' },
  { name: 'LED 氛围灯', sales: 89, revenue: '$1,156', profit: '38%', trend: 'down' },
  { name: '便携式充电宝', sales: 67, revenue: '$1,673', profit: '32%', trend: 'up' },
  { name: '瑜伽垫 TPE', sales: 45, revenue: '$719', profit: '40%', trend: 'down' },
];

export default function AnalyticsPage() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">数据分析</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            全平台运营数据一览，实时掌握经营状况
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="7d">
            <SelectTrigger className="w-32">
              <Calendar className="mr-2 h-3.5 w-3.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">近 7 天</SelectItem>
              <SelectItem value="30d">近 30 天</SelectItem>
              <SelectItem value="90d">近 90 天</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            导出报表
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: '总销售额',
            value: '$75,780',
            change: '+12.5%',
            trend: 'up',
            icon: DollarSign,
            color: 'bg-emerald-50 text-emerald-600',
          },
          {
            label: '总订单数',
            value: '247',
            change: '+8.3%',
            trend: 'up',
            icon: ShoppingBag,
            color: 'bg-blue-50 text-blue-600',
          },
          {
            label: '商品数量',
            value: '28',
            change: '+3',
            trend: 'up',
            icon: Package,
            color: 'bg-amber-50 text-amber-600',
          },
          {
            label: '平均利润率',
            value: '42%',
            change: '-2.1%',
            trend: 'down',
            icon: BarChart3,
            color: 'bg-violet-50 text-violet-600',
          },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/50 hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.color}`}
                >
                  <stat.icon className="h-4 w-4" />
                </div>
                <div
                  className={`flex items-center gap-0.5 text-xs font-medium ${
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
                <div className="text-xl font-bold text-foreground">
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

      {/* Charts */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sales trend */}
        <Card className="border-border/50 lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">销售趋势</CardTitle>
              <Badge variant="secondary" className="text-xs">
                近 30 天
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Bar
                  dataKey="sales"
                  fill="#059669"
                  radius={[4, 4, 0, 0]}
                  name="销售额 ($)"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Profit distribution */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">品类利润分布</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={profitData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {profitData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-2">
              {profitData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-foreground">{item.name}</span>
                  </div>
                  <span className="font-medium text-foreground">
                    ${item.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">热销商品排行</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs">
              查看全部
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topProducts.map((product, i) => (
              <div
                key={product.name}
                className="flex items-center gap-4 rounded-lg border border-border/30 p-3 transition-colors hover:bg-slate-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {product.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    销量 {product.sales} 件
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">
                    {product.revenue}
                  </div>
                  <div className="flex items-center justify-end gap-1 text-xs">
                    <span className="text-emerald-600 font-medium">
                      利润率 {product.profit}
                    </span>
                    {product.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
