'use client';

import { useState } from 'react';
import {
  ImageIcon,
  Video,
  Plus,
  Download,
  Trash2,
  Search,
  Grid3X3,
  List,
  Filter,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const mockImages = [
  { id: '1', name: '蓝牙耳机白底图', type: '展示图', product: '蓝牙耳机 TWS', size: '1024x1024', time: '2 小时前', color: 'from-blue-100 to-blue-200' },
  { id: '2', name: '手机壳场景图', type: '场景图', product: '手机壳 iPhone 15', size: '1024x1024', time: '3 小时前', color: 'from-pink-100 to-pink-200' },
  { id: '3', name: 'LED灯信息图', type: '信息图', product: 'LED 氛围灯', size: '1024x1536', time: '5 小时前', color: 'from-amber-100 to-amber-200' },
  { id: '4', name: '充电宝展示图', type: '展示图', product: '便携式充电宝', size: '1024x1024', time: '昨天', color: 'from-green-100 to-green-200' },
  { id: '5', name: '瑜伽垫场景图', type: '场景图', product: '瑜伽垫 TPE', size: '1536x1024', time: '昨天', color: 'from-purple-100 to-purple-200' },
  { id: '6', name: '迷你风扇展示图', type: '展示图', product: '迷你风扇', size: '1024x1024', time: '2 天前', color: 'from-cyan-100 to-cyan-200' },
  { id: '7', name: '耳机生活场景图', type: '场景图', product: '蓝牙耳机 TWS', size: '1024x1024', time: '2 天前', color: 'from-orange-100 to-orange-200' },
  { id: '8', name: '手机壳信息图', type: '信息图', product: '手机壳 iPhone 15', size: '1024x1536', time: '3 天前', color: 'from-rose-100 to-rose-200' },
];

const mockVideos = [
  { id: 'v1', name: '蓝牙耳机产品展示', product: '蓝牙耳机 TWS', duration: '15s', size: '1080x1920', time: '昨天', color: 'from-indigo-100 to-indigo-200' },
  { id: 'v2', name: 'LED灯氛围展示', product: 'LED 氛围灯', duration: '30s', size: '1080x1920', time: '2 天前', color: 'from-yellow-100 to-yellow-200' },
  { id: 'v3', name: '充电宝功能介绍', product: '便携式充电宝', duration: '20s', size: '1920x1080', time: '3 天前', color: 'from-emerald-100 to-emerald-200' },
];

export default function AssetsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">素材中心</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            管理 AI 生成的商品图片、视频等素材
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            AI 生成素材
          </Button>
          <Button size="sm" className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700">
            <Plus className="h-3.5 w-3.5" />
            上传素材
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: '图片素材', value: '45 张', sub: '本月生成 20 张' },
          { label: '视频素材', value: '12 条', sub: '本月生成 5 条' },
          { label: '存储空间', value: '1.2 GB', sub: '总容量 5 GB' },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="p-4">
              <div className="text-lg font-bold text-foreground">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-foreground">
                {stat.label}
              </div>
              <div className="text-xs text-muted-foreground">{stat.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="images">
        <div className="mb-4 flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="images" className="gap-1.5">
              <ImageIcon className="h-3.5 w-3.5" />
              图片
              <Badge variant="secondary" className="ml-1 h-5 text-[10px]">
                {mockImages.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="videos" className="gap-1.5">
              <Video className="h-3.5 w-3.5" />
              视频
              <Badge variant="secondary" className="ml-1 h-5 text-[10px]">
                {mockVideos.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索素材..."
                className="w-56 pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-28">
                <SelectValue placeholder="类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="show">展示图</SelectItem>
                <SelectItem value="scene">场景图</SelectItem>
                <SelectItem value="info">信息图</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="images">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {mockImages.map((img) => (
              <Card
                key={img.id}
                className="group overflow-hidden border-border/50 hover-lift"
              >
                <div
                  className={`aspect-square bg-gradient-to-br ${img.color} flex items-center justify-center`}
                >
                  <ImageIcon className="h-12 w-12 text-white/60" />
                </div>
                <CardContent className="p-3">
                  <div className="text-sm font-medium text-foreground truncate">
                    {img.name}
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <Badge variant="secondary" className="text-[10px]">
                      {img.type}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {img.size}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">
                      {img.time}
                    </span>
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="videos">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {mockVideos.map((vid) => (
              <Card
                key={vid.id}
                className="group overflow-hidden border-border/50 hover-lift"
              >
                <div
                  className={`aspect-video bg-gradient-to-br ${vid.color} relative flex items-center justify-center`}
                >
                  <Video className="h-10 w-10 text-white/60" />
                  <Badge className="absolute bottom-2 right-2 bg-black/60 text-[10px] text-white">
                    {vid.duration}
                  </Badge>
                </div>
                <CardContent className="p-3">
                  <div className="text-sm font-medium text-foreground truncate">
                    {vid.name}
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">
                      {vid.product}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {vid.size}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">
                      {vid.time}
                    </span>
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
