import { SkillExecuteParams, SkillResult, VideoGenResult } from './types';
import { VideoGenerationClient, Config } from 'coze-coding-dev-sdk';

// 开发环境禁用 SSL 证书验证（仅用于解决 localhost 证书不匹配问题）
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

export async function executeVideoGen(params: SkillExecuteParams): Promise<SkillResult> {
  const { userMessage, extractedParams, headers } = params;

  const prompt = extractedParams.prompt || userMessage;

  // Determine scene
  let sceneLabel = '商品展示';
  let promptSuffix = 'professional product showcase video, smooth camera movement, clean background, studio lighting, e-commerce style';
  if (userMessage.includes('开箱') || userMessage.includes('unbox')) {
    sceneLabel = '开箱演示';
    promptSuffix = 'product unboxing video, first-person perspective, hands opening package, satisfying reveal moment';
  } else if (userMessage.includes('广告') || userMessage.includes('ad')) {
    sceneLabel = '广告素材';
    promptSuffix = 'eye-catching advertisement video, dynamic camera movement, vibrant colors, social media ad style';
  } else if (userMessage.includes('生活') || userMessage.includes('lifestyle')) {
    sceneLabel = '生活场景';
    promptSuffix = 'lifestyle product video, natural home environment, warm lighting, authentic usage scenario';
  }

  // Determine ratio
  let ratio: '16:9' | '9:16' | '1:1' = '9:16';
  if (userMessage.includes('横版') || userMessage.includes('YouTube') || userMessage.includes('Amazon')) {
    ratio = '16:9';
  } else if (userMessage.includes('正方形') || userMessage.includes('Instagram 帖子')) {
    ratio = '1:1';
  }

  const fullPrompt = `${prompt}, ${promptSuffix}`;

  try {
    const config = new Config({
      apiKey: process.env.COZE_LOOP_API_TOKEN || '',
    });
    const client = new VideoGenerationClient(config, headers);

    const contentItems = [
      { type: 'text' as const, text: fullPrompt },
    ];

    const response = await client.videoGeneration(contentItems, {
      model: 'doubao-seedance-1-5-pro-251215',
      duration: 5,
      ratio,
      resolution: '720p',
      generateAudio: true,
      watermark: false,
    });

    if (response.videoUrl) {
      const data: VideoGenResult = {
        videoUrl: response.videoUrl,
        prompt: fullPrompt,
        scene: sceneLabel,
        ratio,
        duration: 5,
      };
      return {
        type: 'video-gen',
        status: 'success',
        data,
        summary: `已生成${sceneLabel}视频（${ratio}，5秒），商品：${prompt.slice(0, 30)}`,
      };
    } else {
      return {
        type: 'video-gen',
        status: 'error',
        data: null,
        summary: `视频生成失败：${response.response?.error_message || '未知错误'}`,
      };
    }
  } catch (error) {
    return {
      type: 'video-gen',
      status: 'error',
      data: null,
      summary: `视频生成服务异常：${error instanceof Error ? error.message : '未知错误'}`,
    };
  }
}
