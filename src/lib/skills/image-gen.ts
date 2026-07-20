import { SkillExecuteParams, SkillResult, ImageGenResult } from './types';
import { ImageGenerationClient, Config } from 'coze-coding-dev-sdk';

// 开发环境禁用 SSL 证书验证（仅用于解决 localhost 证书不匹配问题）
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

export async function executeImageGen(params: SkillExecuteParams): Promise<SkillResult> {
  const { userMessage, extractedParams, headers } = params;

  // Extract prompt from user message
  const prompt = extractedParams.prompt || userMessage;

  // Determine scene from keywords
  let scene = 'white-bg';
  let sceneLabel = '白底图';
  if (userMessage.includes('场景') || userMessage.includes('lifestyle')) {
    scene = 'lifestyle';
    sceneLabel = '生活场景';
  } else if (userMessage.includes('模特')) {
    scene = 'model';
    sceneLabel = '模特展示';
  } else if (userMessage.includes('广告') || userMessage.includes('ad')) {
    scene = 'tiktok';
    sceneLabel = 'TikTok 素材';
  } else if (userMessage.includes('Amazon') || userMessage.includes('亚马逊') || userMessage.includes('主图')) {
    scene = 'amazon';
    sceneLabel = 'Amazon 主图';
  }

  const scenePrompts: Record<string, string> = {
    'white-bg': 'on a pure white background, professional product photography, studio lighting, high resolution, clean and minimal',
    'lifestyle': 'in a modern lifestyle setting, natural lighting, cozy home environment, professional product photography',
    'model': 'being held by a professional model, lifestyle photography, natural pose, warm lighting, fashion e-commerce style',
    'tiktok': 'vibrant and eye-catching, social media style, trendy aesthetic, bold colors, Instagram-worthy composition',
    'amazon': 'on pure white background, Amazon product listing style, centered composition, professional e-commerce photography, high detail, sharp focus',
  };

  const fullPrompt = `${prompt}, ${scenePrompts[scene]}`;

  try {
    const config = new Config({
      apiKey: process.env.COZE_LOOP_API_TOKEN || '',
    });
    const client = new ImageGenerationClient(config, headers);

    const response = await client.generate({
      prompt: fullPrompt,
      size: '2K',
      watermark: false,
    } as Parameters<typeof client.generate>[0]);

    const helper = client.getResponseHelper(response);

    if (helper.success && helper.imageUrls.length > 0) {
      const data: ImageGenResult = {
        imageUrls: helper.imageUrls,
        prompt: fullPrompt,
        scene: sceneLabel,
      };
      return {
        type: 'image-gen',
        status: 'success',
        data,
        summary: `已生成 ${helper.imageUrls.length} 张${sceneLabel}，商品：${prompt.slice(0, 30)}`,
      };
    } else {
      return {
        type: 'image-gen',
        status: 'error',
        data: null,
        summary: `图片生成失败：${helper.errorMessages.join(', ')}`,
      };
    }
  } catch (error) {
    return {
      type: 'image-gen',
      status: 'error',
      data: null,
      summary: `图片生成服务异常：${error instanceof Error ? error.message : '未知错误'}`,
    };
  }
}
