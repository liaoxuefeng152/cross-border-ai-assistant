'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Video, Upload, Download, RefreshCw, Play, Loader2,
  Trash2, X, ChevronDown, Copy, Check, Film, Clock,
  Package, Image as ImageIcon, FileText, Megaphone, Home, Box,
} from 'lucide-react';

interface ScenePreset {
  id: string;
  label: string;
  icon: string;
}

interface RatioPreset {
  id: string;
  label: string;
  ratio: string;
  platform: string;
}

interface GeneratedVideo {
  id: string;
  url: string;
  prompt: string;
  scene: string;
  ratio: string;
  duration: number;
  platform: string;
  createdAt: Date;
}

const sceneIcons: Record<string, React.ElementType> = {
  Package,
  Image: ImageIcon,
  FileText,
  Megaphone,
  Home,
  Box,
};

export default function VideoStudioPage() {
  const [prompt, setPrompt] = useState('');
  const [selectedScene, setSelectedScene] = useState('text-to-video');
  const [selectedRatio, setSelectedRatio] = useState('tiktok');
  const [duration, setDuration] = useState(5);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referenceFileName, setReferenceFileName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [scenes, setScenes] = useState<ScenePreset[]>([]);
  const [ratios, setRatios] = useState<RatioPreset[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load presets on mount
  React.useEffect(() => {
    fetch('/api/video/generate')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setScenes(data.data.scenes);
          setRatios(data.data.ratios);
        }
      })
      .catch(() => {
        // Fallback presets
        setScenes([
          { id: 'product-showcase', label: '商品展示', icon: 'Package' },
          { id: 'image-to-video', label: '图生视频', icon: 'Image' },
          { id: 'text-to-video', label: '文生视频', icon: 'FileText' },
          { id: 'ad-creative', label: '广告素材', icon: 'Megaphone' },
          { id: 'lifestyle', label: '生活场景', icon: 'Home' },
          { id: 'unboxing', label: '开箱演示', icon: 'Box' },
        ]);
        setRatios([
          { id: 'tiktok', label: 'TikTok 竖版', ratio: '9:16', platform: 'TikTok' },
          { id: 'youtube', label: 'YouTube 横版', ratio: '16:9', platform: 'YouTube' },
          { id: 'instagram-reel', label: 'Instagram Reel', ratio: '9:16', platform: 'Instagram' },
          { id: 'instagram-post', label: 'Instagram 帖子', ratio: '1:1', platform: 'Instagram' },
          { id: 'amazon', label: 'Amazon 视频', ratio: '16:9', platform: 'Amazon' },
          { id: 'facebook', label: 'Facebook 广告', ratio: '16:9', platform: 'Facebook' },
          { id: 'square', label: '正方形', ratio: '1:1', platform: '通用' },
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
      const response = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          scene: selectedScene,
          ratioPreset: selectedRatio,
          duration,
          referenceImage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const newVideo: GeneratedVideo = {
          id: crypto.randomUUID(),
          url: data.data.videoUrl,
          prompt: data.data.prompt,
          scene: data.data.scene,
          ratio: data.data.ratio,
          duration: data.data.duration,
          platform: data.data.platform,
          createdAt: new Date(),
        };
        setGeneratedVideos((prev) => [newVideo, ...prev]);
        setPreviewVideo(data.data.videoUrl);
      } else {
        alert(data.error || '视频生成失败');
      }
    } catch {
      alert('视频生成服务异常，请稍后重试');
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

  const handleRemoveVideo = (id: string) => {
    setGeneratedVideos((prev) => prev.filter((v) => v.id !== id));
    if (previewVideo) {
      const removed = generatedVideos.find((v) => v.id === id);
      if (removed && removed.url === previewVideo) {
        setPreviewVideo(null);
      }
    }
  };

  const quickPrompts = [
    '便携式蓝牙音箱在桌面上360度旋转展示',
    '瑜伽垫在阳光下的生活场景展示',
    '不锈钢保温杯从包装中取出的开箱视频',
    'LED台灯在办公桌上的使用演示',
    '宠物自动喂食器的工作过程展示',
    '智能手表佩戴在手腕上的特写展示',
  ];

  const needsReferenceImage = selectedScene === 'image-to-video' || selectedScene === 'product-showcase';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">AI 视频工作台</h1>
        <p className="text-slate-500 mt-1">
          AI 驱动的商品视频生成，支持图生视频、文生视频、商品展示等多种跨境电商场景
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Controls */}
        <div className="lg:col-span-1 space-y-4">
          {/* Prompt Input */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              视频描述
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="描述您要生成的视频内容，例如：便携式蓝牙音箱在桌面上缓慢旋转，展示产品细节"
              className="w-full h-28 px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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
                    {qp.length > 16 ? qp.slice(0, 16) + '...' : qp}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scene Selection */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              视频场景
            </label>
            <div className="grid grid-cols-2 gap-2">
              {scenes.map((scene) => {
                const IconComponent = sceneIcons[scene.icon] || Film;
                return (
                  <button
                    key={scene.id}
                    onClick={() => setSelectedScene(scene.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg border transition-all ${
                      selectedScene === scene.id
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-medium'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{scene.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Platform Ratio */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              平台比例
            </label>
            <div className="relative">
              <select
                value={selectedRatio}
                onChange={(e) => setSelectedRatio(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {ratios.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label} ({r.ratio}) - {r.platform}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Duration */}
            <div className="mt-3">
              <label className="block text-xs text-slate-500 mb-1.5">
                视频时长：{duration}秒
              </label>
              <input
                type="range"
                min={4}
                max={12}
                step={1}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>4秒</span>
                <span>12秒</span>
              </div>
            </div>
          </div>

          {/* Reference Image Upload */}
          {(needsReferenceImage || referenceImage) && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                参考图片 {needsReferenceImage && <span className="text-red-500">*</span>}
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
                  <span className="text-sm text-slate-400">上传商品图片作为首帧</span>
                </button>
              )}
              {needsReferenceImage && !referenceImage && (
                <p className="text-xs text-amber-600 mt-2">
                  当前场景需要上传参考图片
                </p>
              )}
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={generating || !prompt.trim() || (needsReferenceImage && !referenceImage)}
            className="w-full py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>视频生成中（约1-3分钟）...</span>
              </>
            ) : (
              <>
                <Video className="w-4 h-4" />
                <span>生成视频</span>
              </>
            )}
          </button>
        </div>

        {/* Middle Panel - History */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full">
            <div className="p-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Film className="w-4 h-4" />
                生成记录
                {generatedVideos.length > 0 && (
                  <span className="text-xs text-slate-400">({generatedVideos.length})</span>
                )}
              </h2>
            </div>
            <div className="p-3 space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
              {generatedVideos.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Film className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">暂无生成记录</p>
                  <p className="text-xs mt-1">描述您的视频需求，开始创作</p>
                </div>
              ) : (
                generatedVideos.map((video) => (
                  <div
                    key={video.id}
                    className={`group relative rounded-lg border transition-all cursor-pointer ${
                      previewVideo === video.url
                        ? 'border-emerald-300 bg-emerald-50/50'
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                    onClick={() => setPreviewVideo(video.url)}
                  >
                    <div className="p-3">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {video.prompt}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] bg-slate-100 text-slate-500 rounded">
                              {video.scene}
                            </span>
                            <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] bg-slate-100 text-slate-500 rounded">
                              {video.ratio}
                            </span>
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-400">
                              <Clock className="w-3 h-3" />
                              {video.duration}s
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* Action buttons */}
                      <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(video.url, `video-${video.id}.mp4`);
                          }}
                          className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                          title="下载"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyUrl(video.url, video.id);
                          }}
                          className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                          title="复制链接"
                        >
                          {copiedId === video.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveVideo(video.id);
                          }}
                          className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full">
            <div className="p-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Play className="w-4 h-4" />
                视频预览
              </h2>
            </div>
            <div className="p-4">
              {previewVideo ? (
                <div className="space-y-3">
                  <div className="relative bg-slate-900 rounded-lg overflow-hidden aspect-video">
                    <video
                      src={previewVideo}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(previewVideo, 'video.mp4')}
                      className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      下载视频
                    </button>
                    <button
                      onClick={() => handleCopyUrl(previewVideo, 'preview')}
                      className="py-2 px-3 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      {copiedId === 'preview' ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {/* Video info */}
                  {generatedVideos.length > 0 && previewVideo === generatedVideos[0]?.url && (
                    <div className="bg-slate-50 rounded-lg p-3 space-y-1.5">
                      <p className="text-xs text-slate-500">
                        <span className="font-medium text-slate-700">场景：</span>
                        {generatedVideos[0].scene}
                      </p>
                      <p className="text-xs text-slate-500">
                        <span className="font-medium text-slate-700">比例：</span>
                        {generatedVideos[0].ratio}
                      </p>
                      <p className="text-xs text-slate-500">
                        <span className="font-medium text-slate-700">时长：</span>
                        {generatedVideos[0].duration}秒
                      </p>
                      <p className="text-xs text-slate-500">
                        <span className="font-medium text-slate-700">平台：</span>
                        {generatedVideos[0].platform}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <Film className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm">选择视频进行预览</p>
                  <p className="text-xs mt-1">生成的视频将在这里播放</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
