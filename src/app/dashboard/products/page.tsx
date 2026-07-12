'use client';

import { useState } from 'react';
import {
  Search,
  Plus,
  Filter,
  Download,
  Upload,
  MoreHorizontal,
  ExternalLink,
  TrendingUp,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const mockProducts = [
  {
    id: 'P001',
    name: '蓝牙耳机 TWS 无线入耳式',
    platform: 'TikTok Shop',
    price: '$19.99',
    cost: '¥25.00',
    profit: '42%',
    status: '已上架',
    stock: 156,
    image: '🎧',
  },
  {
    id: 'P002',
    name: '手机壳 iPhone 15 硅胶防摔',
    platform: 'Shopee',
    price: '$5.99',
    cost: '¥3.50',
    profit: '55%',
    status: '已上架',
    stock: 520,
    image: '📱',
  },
  {
    id: 'P003',
    name: 'LED 氛围灯 USB 充电星空投影',
    platform: 'Lazada',
    price: '$12.99',
    cost: '¥18.00',
    profit: '38%',
    status: '待发布',
    stock: 89,
    image: '💡',
  },
  {
    id: 'P004',
    name: '便携式充电宝 10000mAh 超薄',
    platform: 'Amazon',
    price: '$24.99',
    cost: '¥45.00',
    profit: '32%',
    status: '已上架',
    stock: 234,
    image: '🔋',
  },
  {
    id: 'P005',
    name: '迷你风扇 USB 充电桌面静音',
    platform: 'TikTok Shop',
    price: '$8.99',
    cost: '¥12.00',
    profit: '45%',
    status: '草稿',
    stock: 0,
    image: '🌀',
  },
  {
    id: 'P006',
    name: '瑜伽垫 TPE 防滑加厚 6mm',
    platform: 'Shopee',
    price: '$15.99',
    cost: '¥22.00',
    profit: '40%',
    status: '已上架',
    stock: 178,
    image: '🧘',
  },
];

const statusColors: Record<string, string> = {
  '已上架': 'bg-emerald-50 text-emerald-700',
  '待发布': 'bg-amber-50 text-amber-700',
  '草稿': 'bg-slate-100 text-slate-600',
  '已下架': 'bg-red-50 text-red-700',
};

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = mockProducts.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">商品管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            管理所有平台的商品，支持批量采集和发布
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-3.5 w-3.5" />
            采集商品
          </Button>
          <Button size="sm" className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700">
            <Plus className="h-3.5 w-3.5" />
            新建商品
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        {[
          { label: '全部商品', value: '28', icon: Package },
          { label: '已上架', value: '18', icon: ExternalLink },
          { label: '待发布', value: '6', icon: Upload },
          { label: '平均利润率', value: '42%', icon: TrendingUp },
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

      {/* Filters */}
      <Card className="mb-4 border-border/50">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索商品名称..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-32">
              <SelectValue placeholder="平台" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部平台</SelectItem>
              <SelectItem value="tiktok">TikTok Shop</SelectItem>
              <SelectItem value="shopee">Shopee</SelectItem>
              <SelectItem value="lazada">Lazada</SelectItem>
              <SelectItem value="amazon">Amazon</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-32">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="published">已上架</SelectItem>
              <SelectItem value="pending">待发布</SelectItem>
              <SelectItem value="draft">草稿</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-1">
            <Filter className="h-3.5 w-3.5" />
            更多筛选
          </Button>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12" />
              <TableHead>商品名称</TableHead>
              <TableHead>平台</TableHead>
              <TableHead>售价</TableHead>
              <TableHead>成本</TableHead>
              <TableHead>利润率</TableHead>
              <TableHead>库存</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <span className="text-2xl">{product.image}</span>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-foreground">
                      {product.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {product.id}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {product.platform}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{product.price}</TableCell>
                <TableCell className="text-muted-foreground">
                  {product.cost}
                </TableCell>
                <TableCell>
                  <span className="font-medium text-emerald-600">
                    {product.profit}
                  </span>
                </TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <Badge
                    className={`text-xs ${statusColors[product.status] || ''}`}
                  >
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
