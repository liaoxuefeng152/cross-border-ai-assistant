import { SkillExecuteParams, SkillResult, ProductSelectionResult } from './types';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

const SELECTION_PROMPT = `你是一位资深的跨境电商选品专家。根据用户的描述，推荐高潜力的跨境电商选品。

输出要求：
- 必须返回纯 JSON 数组（不要包含 markdown 代码块标记）
- 推荐 4 个商品
- 数据要真实合理

每个商品格式：
{
  "name": "商品名称",
  "category": "品类",
  "trendScore": 数字(60-99),
  "competition": "低/中/高",
  "profitMargin": "xx%",
  "sourcePrice": "¥xx",
  "suggestedPrice": "$xx.xx",
  "reason": "推荐理由（2句话）",
  "actionAdvice": "行动建议（1句话）",
  "searchVolume": "周搜索量",
  "monthlySales": "月销量"
}

只返回 JSON 数组。`;

export async function executeProductSelection(params: SkillExecuteParams): Promise<SkillResult> {
  const { userMessage, headers } = params;

  // Extract market and category from message
  let market = '美国站';
  let category = '全品类';

  if (userMessage.includes('日本') || userMessage.includes('JP')) market = '日本站';
  else if (userMessage.includes('英国') || userMessage.includes('UK')) market = '英国站';
  else if (userMessage.includes('德国') || userMessage.includes('DE')) market = '德国站';
  else if (userMessage.includes('东南亚') || userMessage.includes('TikTok')) market = '东南亚/TikTok';

  if (userMessage.includes('3C') || userMessage.includes('电子')) category = '3C电子';
  else if (userMessage.includes('家居') || userMessage.includes('home')) category = '家居生活';
  else if (userMessage.includes('美妆') || userMessage.includes('beauty')) category = '美妆个护';
  else if (userMessage.includes('户外') || userMessage.includes('outdoor')) category = '户外运动';
  else if (userMessage.includes('宠物') || userMessage.includes('pet')) category = '宠物用品';
  else if (userMessage.includes('厨房') || userMessage.includes('kitchen')) category = '厨房用品';

  try {
    const config = new Config();
    const client = new LLMClient(config, headers);

    const messages = [
      { role: 'system' as const, content: SELECTION_PROMPT },
      { role: 'user' as const, content: `目标市场：${market}\n品类方向：${category}\n用户需求：${userMessage}\n\n请推荐 4 个高潜力选品。` },
    ];

    const response = await client.invoke(messages, {
      model: 'doubao-seed-2-0-lite-260215',
      temperature: 0.8,
    });

    let content = response.content.trim();
    if (content.startsWith('```')) {
      content = content.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
    }

    const products = JSON.parse(content);

    const data: ProductSelectionResult = {
      products,
      market,
      category,
    };

    return {
      type: 'product-selection',
      status: 'success',
      data,
      summary: `已为${market}${category}市场筛选出 ${products.length} 个潜力选品`,
    };
  } catch (error) {
    return {
      type: 'product-selection',
      status: 'error',
      data: null,
      summary: `选品分析失败：${error instanceof Error ? error.message : '未知错误'}`,
    };
  }
}
