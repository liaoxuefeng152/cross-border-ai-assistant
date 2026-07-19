import { NextRequest, NextResponse } from 'next/server';
import { VideoGenerationClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// Video scene presets for cross-border e-commerce
const VIDEO_SCENES: Record<string, { label: string; promptSuffix: string; icon: string }> = {
  'product-showcase': {
    label: '商品展示',
    icon: 'Package',
    promptSuffix: 'professional product showcase video, smooth 360-degree rotation, clean background, studio lighting, e-commerce style, high quality',
  },
  'image-to-video': {
    label: '图生视频',
    icon: 'Image',
    promptSuffix: 'smooth cinematic animation, natural camera movement, professional quality, seamless transition from static to dynamic',
  },
  'text-to-video': {
    label: '文生视频',
    icon: 'FileText',
    promptSuffix: 'cinematic quality, professional color grading, smooth camera movement, commercial video style',
  },
  'ad-creative': {
    label: '广告素材',
    icon: 'Megaphone',
    promptSuffix: 'eye-catching advertisement video, dynamic camera movement, vibrant colors, social media ad style, engaging and trendy',
  },
  'lifestyle': {
    label: '生活场景',
    icon: 'Home',
    promptSuffix: 'lifestyle product video, natural home environment, warm lighting, authentic usage scenario, cozy atmosphere',
  },
  'unboxing': {
    label: '开箱演示',
    icon: 'Box',
    promptSuffix: 'product unboxing video, first-person perspective, hands opening package, revealing product, satisfying reveal moment, clean background',
  },
};

// Aspect ratio presets for different platforms
const RATIO_PRESETS: Record<string, { label: string; ratio: string; platform: string }> = {
  'tiktok': { label: 'TikTok 竖版', ratio: '9:16', platform: 'TikTok' },
  'youtube': { label: 'YouTube 横版', ratio: '16:9', platform: 'YouTube' },
  'instagram-reel': { label: 'Instagram Reel', ratio: '9:16', platform: 'Instagram' },
  'instagram-post': { label: 'Instagram 帖子', ratio: '1:1', platform: 'Instagram' },
  'amazon': { label: 'Amazon 视频', ratio: '16:9', platform: 'Amazon' },
  'facebook': { label: 'Facebook 广告', ratio: '16:9', platform: 'Facebook' },
  'square': { label: '正方形', ratio: '1:1', platform: '通用' },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prompt,
      scene = 'text-to-video',
      ratioPreset = 'tiktok',
      duration = 5,
      referenceImage,
      style = '',
    } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: '请描述您要生成的视频内容' },
        { status: 400 }
      );
    }

    // Build the full prompt
    const scenePreset = VIDEO_SCENES[scene] || VIDEO_SCENES['text-to-video'];
    const ratioConfig = RATIO_PRESETS[ratioPreset] || RATIO_PRESETS['tiktok'];

    let fullPrompt = prompt;

    // Add custom style
    if (style) {
      fullPrompt += `, ${style}`;
    }

    // Add scene preset suffix
    fullPrompt += `, ${scenePreset.promptSuffix}`;

    // Extract forward headers for SDK
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new VideoGenerationClient(config, customHeaders);

    // Build content items
    const contentItems: Array<
      | { type: 'text'; text: string }
      | { type: 'image_url'; image_url: { url: string }; role: 'first_frame' | 'last_frame' | 'reference_image' }
    > = [];

    // If reference image is provided and scene is image-to-video, use first_frame mode
    if (referenceImage && (scene === 'image-to-video' || scene === 'product-showcase')) {
      contentItems.push({
        type: 'image_url' as const,
        image_url: { url: referenceImage },
        role: 'first_frame' as const,
      });
    }

    // Always add text prompt
    contentItems.push({
      type: 'text' as const,
      text: fullPrompt,
    });

    // Generate video
    const response = await client.videoGeneration(contentItems, {
      model: 'doubao-seedance-1-5-pro-251215',
      duration: Math.min(Math.max(duration, 4), 12),
      ratio: ratioConfig.ratio as '16:9' | '9:16' | '1:1',
      resolution: '720p',
      generateAudio: true,
      watermark: false,
    });

    if (response.videoUrl) {
      return NextResponse.json({
        success: true,
        data: {
          videoUrl: response.videoUrl,
          prompt: fullPrompt,
          scene: scenePreset.label,
          ratio: ratioConfig.ratio,
          duration: duration,
          platform: ratioConfig.platform,
        },
      });
    } else {
      return NextResponse.json(
        { error: `视频生成失败: ${response.response?.error_message || '未知错误'}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Video generation error:', error);
    return NextResponse.json(
      { error: '视频生成服务异常，请稍后重试' },
      { status: 500 }
    );
  }
}

// GET available presets
export async function GET() {
  const scenes = Object.entries(VIDEO_SCENES).map(([key, value]) => ({
    id: key,
    label: value.label,
    icon: value.icon,
  }));

  const ratios = Object.entries(RATIO_PRESETS).map(([key, value]) => ({
    id: key,
    label: value.label,
    ratio: value.ratio,
    platform: value.platform,
  }));

  return NextResponse.json({
    success: true,
    data: { scenes, ratios },
  });
}
