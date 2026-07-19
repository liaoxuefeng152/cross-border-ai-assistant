import { NextRequest, NextResponse } from "next/server";
import { LLMClient, Config, HeaderUtils } from "coze-coding-dev-sdk";

const REPORT_SYSTEM_PROMPT = `你是一位资深的跨境电商选品分析师，尤其擅长 Amazon 平台的产品深度分析。你精通 FBA 费用计算、BSR 排名分析、CPC 广告策略、合规风险评估。

你的任务：根据用户提供的商品信息，生成一份完整的选品决策报告，包含 FBA 费用拆解和亚马逊专属分析。

输出要求：
- 必须返回纯 JSON 对象（不要包含 markdown 代码块标记）
- 数据要真实合理，基于行业常识和亚马逊平台实际费率
- 报告要包含可执行的行动建议
- FBA 费用计算要符合亚马逊 2024 费率标准

JSON 对象格式如下：
{
  "productName": "商品名称",
  "overallScore": 数字(60-99),
  "scoreBreakdown": {
    "trend": 数字(60-99),
    "competition": 数字(60-99),
    "profit": 数字(60-99),
    "supply": 数字(60-99),
    "content": 数字(60-99)
  },
  "recommendation": "强烈推荐" | "推荐" | "谨慎推荐" | "不推荐",
  "reasons": [
    "推荐理由1（具体、数据化）",
    "推荐理由2",
    "推荐理由3",
    "推荐理由4"
  ],
  "risks": [
    {
      "type": "知识产权" | "物流" | "供应链" | "合规" | "市场" | "FBA",
      "level": "低" | "中" | "高",
      "description": "风险描述（具体、可操作）"
    }
  ],
  "marketAnalysis": {
    "searchTrend": "搜索趋势描述（含谷歌趋势和亚马逊搜索数据）",
    "competitionStatus": "竞争格局描述（含BSR数据、评论数分布、上架时间）",
    "priceRange": "价格区间分析（亚马逊前台价格分布）",
    "targetAudience": "目标用户画像（年龄、性别、消费习惯）",
    "seasonality": "季节性分析（旺季月份、淡季销量对比）"
  },
  "profitAnalysis": {
    "costBreakdown": [
      { "item": "采购成本", "amount": "¥xx" },
      { "item": "头程运费（海运/空运）", "amount": "¥xx" },
      { "item": "FBA配送费", "amount": "$xx.xx" },
      { "item": "FBA仓储费", "amount": "$xx/月" },
      { "item": "平台佣金（15%）", "amount": "$xx.xx" },
      { "item": "广告成本（ACoS xx%）", "amount": "$xx.xx" },
      { "item": "退货损耗（xx%）", "amount": "$xx.xx" },
      { "item": "关税/增值税", "amount": "xx%" }
    ],
    "estimatedProfitPerUnit": "$xx.xx",
    "profitMargin": "xx%",
    "fbaFeeTier": "FBA费用档位（如标准尺寸小号，1lb）",
    "roi": "ROI xx%"
  },
  "actionPlan": [
    "行动步骤1（具体、可执行，含数字）",
    "行动步骤2",
    "行动步骤3",
    "行动步骤4",
    "行动步骤5"
  ],
  "suggestedPrice": "$xx.xx",
  "suggestedAdBudget": "日预算$xx",
  "suggestedStock": "首批备货xx件",
  "shippingAdvice": "物流建议（海运/空运比例、头程成本优化）",
  "variationStrategy": "变体策略建议（颜色/尺寸/套装）",
  "brandingAdvice": "品牌化建议（A+内容、品牌备案、包装）"
}

只返回 JSON 对象，不要有任何其他内容。`;

export async function POST(request: NextRequest) {
  try {
    const {
      productName, category, market, sourcePrice, suggestedPrice,
      minSourcePrice, maxSourcePrice, minSellingPrice, maxSellingPrice,
      targetProfit, maxSellers, maxReviews, minBsr, maxBsr, maxCpc,
      minSuppliers, maxMoq, needDropShip,
    } = await request.json();

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const marketMap: Record<string, string> = {
      us: "Amazon美国站",
      uk: "Amazon英国站",
      de: "Amazon德国站",
      jp: "Amazon日本站",
      fr: "Amazon法国站",
    };

    const marketLabel = marketMap[market as string] || "Amazon美国站";

    let userPrompt = `请为以下商品生成选品决策报告：\n\n`;
    userPrompt += `商品名称：${productName}\n`;
    userPrompt += `品类：${category || "未指定"}\n`;
    userPrompt += `目标市场：${marketLabel}\n`;
    userPrompt += `1688 采购价：${sourcePrice || minSourcePrice ? `¥${sourcePrice || minSourcePrice + "-" + maxSourcePrice}` : "未知"}\n`;
    userPrompt += `建议售价：${suggestedPrice || minSellingPrice ? `$${suggestedPrice || minSellingPrice + "-" + maxSellingPrice}` : "未知"}\n\n`;

    userPrompt += `## 筛选条件参考\n`;
    if (targetProfit) userPrompt += `目标利润率：≥${targetProfit}%\n`;
    if (maxSellers) userPrompt += `在售卖家数上限：${maxSellers}家\n`;
    if (maxReviews) userPrompt += `评论数上限：${maxReviews}条\n`;
    if (minBsr || maxBsr) userPrompt += `BSR排名范围：#${minBsr || "不限"} - #${maxBsr || "不限"}\n`;
    if (maxCpc) userPrompt += `CPC上限：$${maxCpc}\n`;
    if (minSuppliers) userPrompt += `1688供应商数量：≥${minSuppliers}家\n`;
    if (maxMoq) userPrompt += `起订量上限：≤${maxMoq}件\n\n`;

    userPrompt += `请从趋势、竞争、利润（含FBA费用拆解）、供应链、内容传播等多维度进行深度分析，给出综合评分和可执行的行动建议。`;

    const messages: Array<{ role: "system" | "user"; content: string }> = [
      { role: "system", content: REPORT_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ];

    const response = await client.invoke(messages, {
      model: "doubao-seed-2-0-lite-260215",
      temperature: 0.7,
    });

    let content = response.content.trim();
    if (content.startsWith("```")) {
      content = content.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    }

    const report = JSON.parse(content);

    return NextResponse.json({ report });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}