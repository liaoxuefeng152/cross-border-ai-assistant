import { SkillExecuteParams, SkillResult, ListingOptimizeResult } from './types';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

const LISTING_PROMPT = `你是一位资深的跨境电商 Listing 优化专家，精通 Amazon、TikTok Shop、Shopee 等平台的 SEO 规则和文案技巧。

根据用户提供的商品信息，生成优化后的 Listing 内容。

输出要求：必须返回纯 JSON（不要包含 markdown 代码块标记），格式如下：
{
  "title": "优化后的英文标题（80-150字符，包含核心关键词）",
  "bulletPoints": ["卖点1（英文）", "卖点2", "卖点3", "卖点4", "卖点5"],
  "description": "商品描述（英文，150-300词，SEO友好）",
  "keywords": ["核心关键词1", "关键词2", "关键词3", "关键词4", "关键词5"]
}

只返回 JSON 对象。`;

export async function executeListingOptimize(params: SkillExecuteParams): Promise<SkillResult> {
  const { userMessage, headers } = params;

  // Detect target platform
  let platform = 'Amazon';
  if (userMessage.includes('TikTok') || userMessage.includes('tiktok')) platform = 'TikTok Shop';
  else if (userMessage.includes('Shopee') || userMessage.includes('shopee')) platform = 'Shopee';
  else if (userMessage.includes('速卖通') || userMessage.includes('AliExpress')) platform = 'AliExpress';

  try {
    const config = new Config();
    const client = new LLMClient(config, headers);

    const messages = [
      { role: 'system' as const, content: LISTING_PROMPT },
      { role: 'user' as const, content: `目标平台：${platform}\n商品信息：${userMessage}\n\n请生成优化后的 Listing 内容。` },
    ];

    const response = await client.invoke(messages, {
      model: 'doubao-seed-2-0-lite-260215',
      temperature: 0.7,
    });

    let content = response.content.trim();
    if (content.startsWith('```')) {
      content = content.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
    }

    const listing = JSON.parse(content) as ListingOptimizeResult;
    listing.platform = platform;

    return {
      type: 'listing-optimize',
      status: 'success',
      data: listing,
      summary: `已为${platform}平台生成优化 Listing：${listing.title.slice(0, 40)}...`,
    };
  } catch (error) {
    return {
      type: 'listing-optimize',
      status: 'error',
      data: null,
      summary: `Listing 优化失败：${error instanceof Error ? error.message : '未知错误'}`,
    };
  }
}
