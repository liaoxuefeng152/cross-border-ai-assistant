import { NextRequest, NextResponse } from 'next/server';
import { ImageGenerationClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// Scene presets for cross-border e-commerce
const SCENE_PRESETS: Record<string, { label: string; promptSuffix: string }> = {
  'white-bg': {
    label: '白底图',
    promptSuffix: 'on a pure white background, professional product photography, studio lighting, high resolution, clean and minimal',
  },
  'lifestyle': {
    label: '生活场景',
    promptSuffix: 'in a modern lifestyle setting, natural lighting, cozy home environment, professional product photography',
  },
  'kitchen': {
    label: '厨房场景',
    promptSuffix: 'in a modern bright kitchen, marble countertop, natural sunlight from window, professional food photography style',
  },
  'outdoor': {
    label: '户外场景',
    promptSuffix: 'outdoor setting, natural scenery, golden hour lighting, lifestyle product photography',
  },
  'office': {
    label: '办公场景',
    promptSuffix: 'on a modern office desk, minimalist workspace, soft natural lighting, professional product photography',
  },
  'amazon': {
    label: 'Amazon 主图',
    promptSuffix: 'on pure white background, Amazon product listing style, centered composition, professional e-commerce photography, high detail, sharp focus',
  },
  'tiktok': {
    label: 'TikTok 素材',
    promptSuffix: 'vibrant and eye-catching, social media style, trendy aesthetic, bold colors, Instagram-worthy composition',
  },
  'model': {
    label: '模特展示',
    promptSuffix: 'being held by a professional model, lifestyle photography, natural pose, warm lighting, fashion e-commerce style',
  },
};

// Size presets for different platforms
const SIZE_PRESETS: Record<string, { label: string; size: string; aspect: string }> = {
  'amazon-main': { label: 'Amazon 主图', size: '2K', aspect: '1:1' },
  'amazon-a-plus': { label: 'Amazon A+', size: '2K', aspect: '16:9' },
  'tiktok-shop': { label: 'TikTok Shop', size: '2K', aspect: '1:1' },
  'tiktok-ad': { label: 'TikTok 广告', size: '2K', aspect: '9:16' },
  'facebook-ad': { label: 'Facebook 广告', size: '2K', aspect: '16:9' },
  'instagram': { label: 'Instagram', size: '2K', aspect: '1:1' },
  'independent-site': { label: '独立站 Banner', size: '2K', aspect: '16:9' },
  'custom': { label: '自定义', size: '2K', aspect: 'custom' },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prompt,
      scene = 'white-bg',
      sizePreset = 'amazon-main',
      referenceImage,
      style = '',
      market = '',
    } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: '请描述您要生成的图片内容' },
        { status: 400 }
      );
    }

    // Build the full prompt
    const scenePreset = SCENE_PRESETS[scene] || SCENE_PRESETS['white-bg'];
    const sizePresetConfig = SIZE_PRESETS[sizePreset] || SIZE_PRESETS['amazon-main'];

    let fullPrompt = prompt;

    // Add market-specific styling
    if (market === 'US' || market === 'EU') {
      fullPrompt += ', Western aesthetic, clean and modern style';
    } else if (market === 'JP') {
      fullPrompt += ', Japanese aesthetic, minimalist and精致 style, soft pastel colors';
    } else if (market === 'SEA') {
      fullPrompt += ', Southeast Asian aesthetic, vibrant and colorful style';
    }

    // Add custom style
    if (style) {
      fullPrompt += `, ${style}`;
    }

    // Add scene preset
    fullPrompt += `, ${scenePreset.promptSuffix}`;

    // Extract forward headers for SDK
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new ImageGenerationClient(config, customHeaders);

    // Build generation request
    const generateRequest: Record<string, unknown> = {
      prompt: fullPrompt,
      size: sizePresetConfig.size,
      watermark: false,
    };

    // Add reference image if provided
    if (referenceImage) {
      generateRequest.image = referenceImage;
    }

    const response = await client.generate(generateRequest as unknown as Parameters<typeof client.generate>[0]);
    const helper = client.getResponseHelper(response);

    if (helper.success) {
      return NextResponse.json({
        success: true,
        data: {
          imageUrls: helper.imageUrls,
          prompt: fullPrompt,
          scene: scenePreset.label,
          sizePreset: sizePresetConfig.label,
        },
      });
    } else {
      return NextResponse.json(
        { error: `图片生成失败: ${helper.errorMessages.join(', ')}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: '图片生成服务异常，请稍后重试' },
      { status: 500 }
    );
  }
}

// GET available presets
export async function GET() {
  const scenes = Object.entries(SCENE_PRESETS).map(([key, value]) => ({
    id: key,
    label: value.label,
  }));

  const sizes = Object.entries(SIZE_PRESETS).map(([key, value]) => ({
    id: key,
    label: value.label,
    aspect: value.aspect,
  }));

  return NextResponse.json({
    success: true,
    data: { scenes, sizes },
  });
}
