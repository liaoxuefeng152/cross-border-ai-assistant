'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ImageIcon,
  Video,
  Download,
  Trash2,
  Search,
  Sparkles,
  Upload,
  Loader2,
  Copy,
  Check,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface Asset {
  id: string;
  user_id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  size?: number;
  product_id?: string;
  created_at: string;
}

function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return '未知';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 30) return `${days} 天前`;
  return date.toLocaleDateString('zh-CN');
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('images');
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/assets');
      const json = await res.json();
      if (json.success) {
        setAssets(json.data || []);
      }
    } catch (e) {
      console.error('Failed to fetch assets:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/assets', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        fetchAssets();
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个素材吗？')) return;
    try {
      const res = await fetch(`/api/assets/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setAssets((prev) => prev.filter((a) => a.id !== id));
        if (previewAsset?.id === id) setPreviewAsset(null);
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleDownload = async (asset: Asset) => {
    try {
      const res = await fetch(asset.url);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = asset.name;
      link.click();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleCopyUrl = async (asset: Asset) => {
    try {
      await navigator.clipboard.writeText(asset.url);
      setCopiedId(asset.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const filteredAssets = assets.filter((a) => {
    const matchesTab =
      activeTab === 'images' ? a.type === 'image' : a.type === 'video';
    const matchesSearch =
      !searchQuery ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const imageCount = assets.filter((a) => a.type === 'image').length;
  const videoCount = assets.filter((a) => a.type === 'video').length;
  const totalSize = assets.reduce((sum, a) => sum + (a.size || 0), 0);

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
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => (window.location.href = '/dashboard/image-studio')}
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI 生成素材
          </Button>
          <label className="cursor-pointer">
            <Button
              size="sm"
              className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
              disabled={uploading}
              asChild
            >
              <span>
                {uploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                {uploading ? '上传中...' : '上传素材'}
              </span>
            </Button>
            <input
              type="file"
              className="hidden"
              accept="image/*,video/*"
              onChange={handleUpload}
            />
          </label>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: '图片素材', value: `${imageCount} 张`, sub: 'AI 生成 + 手动上传' },
          { label: '视频素材', value: `${videoCount} 条`, sub: 'AI 生成 + 手动上传' },
          {
            label: '存储空间',
            value: formatFileSize(totalSize),
            sub: '已使用 / 5 GB',
          },
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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="mb-4 flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="images" className="gap-1.5">
              <ImageIcon className="h-3.5 w-3.5" />
              图片
              <Badge variant="secondary" className="ml-1 h-5 text-[10px]">
                {imageCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="videos" className="gap-1.5">
              <Video className="h-3.5 w-3.5" />
              视频
              <Badge variant="secondary" className="ml-1 h-5 text-[10px]">
                {videoCount}
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
          </div>
        </div>

        <TabsContent value="images">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <ImageIcon className="mb-4 h-16 w-16 opacity-30" />
              <p className="text-lg font-medium">暂无图片素材</p>
              <p className="mt-1 text-sm">
                通过 AI 作图或上传来添加素材
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {filteredAssets.map((asset) => (
                <Card
                  key={asset.id}
                  className="group overflow-hidden border-border/50 hover-lift cursor-pointer"
                  onClick={() => setPreviewAsset(asset)}
                >
                  <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <CardContent className="p-3">
                    <div className="text-sm font-medium text-foreground truncate">
                      {asset.name}
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <Badge variant="secondary" className="text-[10px]">
                        {asset.type === 'image' ? '图片' : '视频'}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {formatFileSize(asset.size)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">
                        {timeAgo(asset.created_at)}
                      </span>
                      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(asset);
                          }}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(asset.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="videos">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Video className="mb-4 h-16 w-16 opacity-30" />
              <p className="text-lg font-medium">暂无视频素材</p>
              <p className="mt-1 text-sm">
                通过 AI 视频生成或上传来添加素材
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {filteredAssets.map((asset) => (
                <Card
                  key={asset.id}
                  className="group overflow-hidden border-border/50 hover-lift cursor-pointer"
                  onClick={() => setPreviewAsset(asset)}
                >
                  <div className="aspect-video bg-muted relative flex items-center justify-center overflow-hidden">
                    {asset.type === 'video' ? (
                      <video
                        src={asset.url}
                        className="h-full w-full object-cover"
                        muted
                        preload="metadata"
                      />
                    ) : (
                      <img
                        src={asset.url}
                        alt={asset.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    )}
                    {asset.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="rounded-full bg-white/90 p-3">
                          <Video className="h-5 w-5 text-foreground" />
                        </div>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <div className="text-sm font-medium text-foreground truncate">
                      {asset.name}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">
                        {timeAgo(asset.created_at)}
                      </span>
                      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(asset);
                          }}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(asset.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog
        open={!!previewAsset}
        onOpenChange={(open) => !open && setPreviewAsset(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewAsset?.name}</DialogTitle>
            <DialogDescription>
              {previewAsset
                ? `${previewAsset.type === 'image' ? '图片' : '视频'} · ${formatFileSize(previewAsset.size)} · ${timeAgo(previewAsset.created_at)}`
                : ''}
            </DialogDescription>
          </DialogHeader>
          {previewAsset && (
            <div className="space-y-4">
              <div className="flex items-center justify-center rounded-lg bg-muted overflow-hidden max-h-[60vh]">
                {previewAsset.type === 'video' ? (
                  <video
                    src={previewAsset.url}
                    controls
                    className="max-h-[60vh] w-full"
                  />
                ) : (
                  <img
                    src={previewAsset.url}
                    alt={previewAsset.name}
                    className="max-h-[60vh] w-auto object-contain"
                  />
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => handleCopyUrl(previewAsset)}
                >
                  {copiedId === previewAsset.id ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copiedId === previewAsset.id ? '已复制' : '复制链接'}
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={() => handleDownload(previewAsset)}
                >
                  <Download className="h-3.5 w-3.5" />
                  下载
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
