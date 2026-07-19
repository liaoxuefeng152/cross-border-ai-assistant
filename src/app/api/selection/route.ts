import { NextRequest, NextResponse } from "next/server";
import { LLMClient, Config, HeaderUtils } from "coze-coding-dev-sdk";

const SELECTION_SYSTEM_PROMPT = `你是一位资深的跨境电商选品专家，尤其擅长 Amazon 和 TikTok Shop 平台。你熟悉 FBA、BSR排名、CPC广告、利润率等关键指标。

你的任务：根据用户指定的选品模式、目标市场、品类、价格区间、竞争门槛和供应链要求，推荐高潜力的跨境电商选品。

输出要求：
- 必须返回纯 JSON 数组（不要包含 markdown 代码块标记、不要包含任何解释文字）
- 每次推荐 6 个商品
- 数据要真实合理，基于你对当前跨境电商市场的专业判断
- 趋势分、利润率等数据要符合行业常识
- 优先推荐亚马逊平台可售商品

每个商品对象的格式如下：
{
  "name": "商品名称（中文，含关键特性，如"便携式USB充电迷你风扇"）",
  "category": "品类",
  "trendScore": 数字(60-99),
  "competition": "低" | "中" | "高",
  "profitMargin": "xx%",
  "sourcePrice": "¥xx",
  "suggestedPrice": "$xx.xx",
  "trendChange": "+xx%",
  "searchVolume": "周搜索量如 12K/周",
  "sellers": 在售卖家数,
  "monthlySales": "月销量如 1,200+",
  "bsrRank": "BSR排名如 #8,500 in Home & Kitchen",
  "avgRating": "4.3",
  "reviewCount": 评论数,
  "season": "旺季月份范围，如 5-9月",
  "tiktokHot": true | false,
  "riskLevel": "低" | "中" | "高",
  "reason": "AI 推荐理由（2-3句话，包含趋势、竞争、利润、供应链等维度的具体分析）",
  "actionAdvice": "行动建议（1-2句话，如建议定价、备货量、广告策略等）",
  "supplierInfo": "1688 供应商数量及起订量信息",
  "logistics": "物流建议（如适合空运/海运，体积重估算）",
  "sourceUrl": "1688货源搜索链接，格式为 https://s.1688.com/selloffer/offer_search.htm?keywords=关键词 ，关键词用商品的中文名称URL编码",
  "sourceKeyword": "1688搜索关键词（中文，用于在1688搜索该商品的准确关键词，如"USB充电迷你风扇 便携"）"
}

只返回 JSON 数组，不要有任何其他内容。`;

export async function POST(request: NextRequest) {
  try {
    const {
      mode,            // 选品模式: trend/blueocean/profit/festival
      market,          // 市场: us/uk/de/jp/fr
      category,        // 品类
      keyword,         // 关键词
      // 第2层：价格区间
      minSourcePrice,  // 最低采购价 ¥
      maxSourcePrice,  // 最高采购价 ¥
      minSellingPrice, // 最低售价 $
      maxSellingPrice, // 最高售价 $
      targetProfit,    // 目标利润率 %
      // 第3层：竞争门槛
      maxSellers,      // 卖家数量上限
      maxReviews,      // 评论数上限
      minBsr,          // BSR下限
      maxBsr,          // BSR上限
      maxCpc,          // CPC上限
      minNewProducts,  // 近半年新品数
      // 第4层：供应链
      minSuppliers,    // 最低供应商数量
      maxMoq,          // 最大起订量
      needDropShip,    // 是否需要一件代发
      maxShipDays,     // 最长发货天数
      minRating,       // 供应商最低好评率
    } = await request.json();

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 选品模式映射
    const modeMap: Record<string, string> = {
      trend: "趋势选品",
      blueocean: "蓝海选品",
      profit: "利润选品",
      festival: "节日选品",
    };

    // 市场映射
    const marketMap: Record<string, string> = {
      us: "Amazon美国站",
      uk: "Amazon英国站",
      de: "Amazon德国站",
      jp: "Amazon日本站",
      fr: "Amazon法国站",
    };

    // 品类映射
    const categoryMap: Record<string, string> = {
      all: "全品类",
      home: "家居生活",
      electronics: "3C电子配件",
      beauty: "美妆个护",
      outdoor: "户外运动",
      pet: "宠物用品",
      kitchen: "厨房用品",
      fashion: "服饰配饰",
      toys: "玩具文创",
      garden: "花园园艺",
      office: "办公用品",
      auto: "汽车配件",
      baby: "母婴用品",
      grocery: "食品杂货",
      tools: "工具五金",
    };

    const modeLabel = modeMap[mode as string] || "趋势选品";
    const marketLabel = marketMap[market as string] || "Amazon美国站";
    const categoryLabel = categoryMap[category as string] || "全品类";

    // 构建完整提示词
    let userPrompt = `## 选品配置\n\n`;
    userPrompt += `选品模式：${modeLabel}\n`;
    userPrompt += `目标市场：${marketLabel}\n`;
    userPrompt += `品类方向：${categoryLabel}\n\n`;

    userPrompt += `## 第2层：价格区间\n`;
    userPrompt += `采购价范围：¥${minSourcePrice || "不限"} - ¥${maxSourcePrice || "不限"}\n`;
    userPrompt += `售价范围：$${minSellingPrice || "不限"} - $${maxSellingPrice || "不限"}\n`;
    userPrompt += `目标利润率：≥${targetProfit || "30"}%\n\n`;

    userPrompt += `## 第3层：竞争门槛\n`;
    if (maxSellers) userPrompt += `在售卖家数上限：${maxSellers}家\n`;
    if (maxReviews) userPrompt += `评论数上限：${maxReviews}条\n`;
    if (minBsr || maxBsr) userPrompt += `BSR排名范围：#${minBsr || "不限"} - #${maxBsr || "不限"}\n`;
    if (maxCpc) userPrompt += `CPC上限：$${maxCpc}\n`;
    if (minNewProducts) userPrompt += `近半年新品数：≥${minNewProducts}个\n\n`;

    userPrompt += `## 第4层：供应链要求\n`;
    if (minSuppliers) userPrompt += `1688供应商数量：≥${minSuppliers}家\n`;
    if (maxMoq) userPrompt += `起订量上限：≤${maxMoq}件\n`;
    if (needDropShip) userPrompt += `需支持一件代发：是\n`;
    if (maxShipDays) userPrompt += `供应商发货天数：≤${maxShipDays}天\n`;
    if (minRating) userPrompt += `供应商好评率：≥${minRating}%\n\n`;

    if (keyword) {
      userPrompt += `## 用户关注\n关键词：${keyword}\n\n`;
    }

    userPrompt += `请推荐 6 个符合以上所有条件的高潜力跨境电商选品。`;

    const messages: Array<{ role: "system" | "user"; content: string }> = [
      { role: "system", content: SELECTION_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ];

    const response = await client.invoke(messages, {
      model: "doubao-seed-2-0-lite-260215",
      temperature: 0.8,
    });

    let content = response.content.trim();
    if (content.startsWith("```")) {
      content = content.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    }

    const products = JSON.parse(content);

    return NextResponse.json({ products });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}