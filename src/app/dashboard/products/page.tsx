'use client';

import { useState, useEffect } from 'react';
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
  Trash2,
  Edit,
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

interface Product {
  id: string;
  name: string;
  category: string;
  market: string;
  source_url: string | null;
  source_price: string | null;
  suggested_price: string | null;
  status: string;
  platform: string | null;
  platform_product_id: string | null;
  data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

const statusColors: Record<string, string> = {
  'published': 'bg-emerald-50 text-emerald-700',
  'pending': 'bg-amber-50 text-amber-700',
  'draft': 'bg-slate-100 text-slate-600',
  'removed': 'bg-red-50 text-red-700',
};

const statusLabels: Record<string, string> = {
  'published': '已上架',
  'pending': '待发布',
  'draft': '草稿',
  'removed': '已下架',
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch products from API
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个商品吗？')) return;
    try {
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        setProducts(products.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPlatform = platformFilter === 'all' || p.platform === platformFilter;
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchPlatform && matchStatus;
  });

  // Calculate stats
  const stats = {
    total: products.length,
    published: products.filter(p => p.status === 'published').length,
    pending: products.filter(p => p.status === 'pending').length,
    avgProfit: products.length > 0
      ? Math.round(products.reduce((acc, p) => {
          const source = parseFloat(p.source_price?.replace(/[^0-9.]/g, '') || '0');
          const suggested = parseFloat(p.suggested_price?.replace(/[^0-9.]/g, '') || '0');
          if (source > 0 && suggested > 0) {
            return acc + ((suggested - source) / suggested) * 100;
          }
          return acc;
        }, 0) / products.length)
      : 0,
  };

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
          { label: '全部商品', value: stats.total.toString(), icon: Package },
          { label: '已上架', value: stats.published.toString(), icon: ExternalLink },
          { label: '待发布', value: stats.pending.toString(), icon: Upload },
          { label: '平均利润率', value: `${stats.avgProfit}%`, icon: TrendingUp },
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
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10 text-slate-400">
                  加载中...
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10 text-slate-400">
                  暂无商品数据
                </TableCell>
              </TableRow>
            ) : filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <span className="text-2xl">📦</span>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-foreground">
                      {product.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {product.id.slice(0, 8)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {product.platform || '-'}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{product.suggested_price || '-'}</TableCell>
                <TableCell className="text-muted-foreground">
                  {product.source_price || '-'}
                </TableCell>
                <TableCell>
                  <span className="font-medium text-emerald-600">
                    {product.source_price && product.suggested_price
                      ? `${Math.round(((parseFloat(product.suggested_price.replace(/[^0-9.]/g, '')) - parseFloat(product.source_price.replace(/[^0-9.]/g, ''))) / parseFloat(product.suggested_price.replace(/[^0-9.]/g, ''))) * 100)}%`
                      : '-'}
                  </span>
                </TableCell>
                <TableCell>-</TableCell>
                <TableCell>
                  <Badge
                    className={`text-xs ${statusColors[product.status] || 'bg-slate-100 text-slate-600'}`}
                  >
                    {statusLabels[product.status] || product.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => handleDelete(product.id)}>
                    <Trash2 className="h-4 w-4" />
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
