'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Sparkles, Upload, Download, RefreshCw, Image as ImageIcon,
  Loader2, Trash2, ZoomIn, X, ChevronDown, Copy, Check,
} from 'lucide-react';

interface ScenePreset {
  id: string;
  label: string;
}

interface SizePreset {
  id: string;
  label: string;
  aspect: string;
}

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  scene: string;
  sizePreset: string;
  createdAt: Date;
}

export default function ImageStudioPage() {
  const [prompt, setPrompt] = useState('');
  const [selectedScene, setSelectedScene] = useState('white-bg');
  const [selectedSize, setSelectedSize] = useState('amazon-main');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referenceFileName, setReferenceFileName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [scenes, setScenes] = useState<ScenePreset[]>([]);
  const [sizes, setSizes] = useState<SizePreset[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load presets on mount
  React.useEffect(() => {
    fetch('/api/image/generate')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setScenes(data.data.scenes);
          setSizes(data.data.sizes);
        }
      })
      .catch(() => {
        // Fallback presets
        setScenes([
          { id: 'white-bg', label: '白底图' },
          { id: 'lifestyle', label: '生活场景' },
          { id: 'kitchen', label: '厨房场景' },
          { id: 'outdoor', label: '户外场景' },
          { id: 'office', label: '办公场景' },
          { id: 'amazon', label: 'Amazon 主图' },
          { id: 'tiktok', label: 'TikTok 素材' },
          { id: 'model', label: '模特展示' },
        ]);
        setSizes([
          { id: 'amazon-main', label: 'Amazon 主图', aspect: '1:1' },
          { id: 'amazon-a-plus', label: 'Amazon A+', aspect: '16:9' },
          { id: 'tiktok-shop', label: 'TikTok Shop', aspect: '1:1' },
          { id: 'tiktok-ad', label: 'TikTok 广告', aspect: '9:16' },
          { id: 'facebook-ad', label: 'Facebook 广告', aspect: '16:9' },
          { id: 'instagram', label: 'Instagram', aspect: '1:1' },
          { id: 'independent-site', label: '独立站 Banner', aspect: '16:9' },
        ]);
      });
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReferenceFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setReferenceImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setGenerating(true);
    try {
      const response = await fetch('/api/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          scene: selectedScene,
          sizePreset: selectedSize,
          referenceImage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const newImages: GeneratedImage[] = data.data.imageUrls.map((url: string) => ({
          id: crypto.randomUUID(),
          url,
          prompt: data.data.prompt,
          scene: data.data.scene,
          sizePreset: data.data.sizePreset,
          createdAt: new Date(),
        }));
        setGeneratedImages((prev) => [...newImages, ...prev]);
      } else {
        alert(data.error || '图片生成失败');
      }
    } catch {
      alert('图片生成服务异常，请稍后重试');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    }
  };

  const handleCopyUrl = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleRemoveImage = (id: string) => {
    setGeneratedImages((prev) => prev.filter((img) => img.id !== id));
  };

  const quickPrompts = [
    '便携式蓝牙音箱，金属外壳，黑色',
    '瑜伽垫，紫色，加厚防滑',
    '不锈钢保温杯，500ml，简约设计',
    'LED台灯，可折叠，USB充电',
    '宠物自动喂食器，白色，智能定时',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">AI 素材工作台</h1>
        <p className="text-slate-500 mt-1">
          AI 驱动的商品图片生成，支持场景图、模特图、广告素材等多种场景
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Controls */}
        <div className="lg:col-span-1 space-y-4">
          {/* Prompt Input */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              图片描述
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="描述您要生成的商品图片，例如：便携式蓝牙音箱，金属外壳，黑色，简约设计"
              className="w-full h-24 px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />

            {/* Quick Prompts */}
            <div className="mt-2">
              <p className="text-xs text-slate-400 mb-1.5">快速填入：</p>
              <div className="flex flex-wrap gap-1.5">
                {quickPrompts.map((qp, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(qp)}
                    className="px-2 py-1 text-xs bg-slate-50 text-slate-600 rounded-md hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                  >
                    {qp.length > 12 ? qp.slice(0, 12) + '...' : qp}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scene Selection */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              场景风格
            </label>
            <div className="grid grid-cols-2 gap-2">
              {scenes.map((scene) => (
                <button
                  key={scene.id}
                  onClick={() => setSelectedScene(scene.id)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                    selectedScene === scene.id
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-medium'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {scene.label}
                </button>
              ))}
            </div>
          </div>

          {/* Size Preset */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              平台尺寸
            </label>
            <div className="relative">
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {sizes.map((size) => (
                  <option key={size.id} value={size.id}>
                    {size.label} ({size.aspect})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Reference Image Upload */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              参考图片（可选）
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            {referenceImage ? (
              <div className="relative">
                <img
                  src={referenceImage}
                  alt="Reference"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => {
                    setReferenceImage(null);
                    setReferenceFileName('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute top-2 right-2 p-1 bg-white/80 rounded-full hover:bg-white"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
                <p className="text-xs text-slate-400 mt-1 truncate">{referenceFileName}</p>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors"
              >
                <Upload className="w-6 h-6 text-slate-400" />
                <span className="text-sm text-slate-400">上传商品白底图</span>
              </button>
            )}
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || generating}
            className="w-full py-3 bg-emerald-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                生成图片
              </>
            )}
          </button>
        </div>

        {/* Right Panel - Results */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-medium text-slate-900">生成结果</h2>
              <span className="text-sm text-slate-400">
                共 {generatedImages.length} 张
              </span>
            </div>

            {generatedImages.length === 0 ? (
              <div className="p-12 text-center">
                <ImageIcon className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">
                  {generating ? '正在生成图片，请稍候...' : '描述您的商品，AI 将为您生成专业图片'}
                </p>
                {generating && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-emerald-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    预计需要 10-30 秒
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {generatedImages.map((img) => (
                  <div
                    key={img.id}
                    className="group relative border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <img
                      src={img.url}
                      alt={img.prompt}
                      className="w-full aspect-square object-cover"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => setPreviewImage(img.url)}
                        className="p-2 bg-white rounded-full hover:bg-slate-100"
                      >
                        <ZoomIn className="w-4 h-4 text-slate-700" />
                      </button>
                      <button
                        onClick={() => handleDownload(img.url, `${img.scene}-${img.id}.png`)}
                        className="p-2 bg-white rounded-full hover:bg-slate-100"
                      >
                        <Download className="w-4 h-4 text-slate-700" />
                      </button>
                      <button
                        onClick={() => handleCopyUrl(img.url, img.id)}
                        className="p-2 bg-white rounded-full hover:bg-slate-100"
                      >
                        {copiedId === img.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-slate-700" />
                        )}
                      </button>
                      <button
                        onClick={() => handleRemoveImage(img.id)}
                        className="p-2 bg-white rounded-full hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                    {/* Info */}
                    <div className="p-2 bg-slate-50">
                      <p className="text-xs text-slate-500 truncate">{img.prompt}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded">
                          {img.scene}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded">
                          {img.sizePreset}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-3 -right-3 p-2 bg-white rounded-full shadow-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5 text-slate-700" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(previewImage, 'generated-image.png');
                }}
                className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2 shadow-lg"
              >
                <Download className="w-4 h-4" />
                下载
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
