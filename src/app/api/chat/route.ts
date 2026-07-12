import { NextRequest } from "next/server";
import { LLMClient, Config, HeaderUtils } from "coze-coding-dev-sdk";

const SYSTEM_PROMPT = `你是「龙掌柜 AI」，一位经验丰富的跨境电商运营专家。你精通以下领域：

1. **选品分析**：分析市场趋势、竞争格局、利润空间，给出选品建议
2. **商品采集**：从 1688、速卖通、拼多多等平台采集商品信息
3. **商品发布**：将商品发布到 TikTok Shop、Shopee 等平台
4. **利润计算**：计算采购成本、运费、平台佣金、广告费等，得出利润率
5. **素材生成**：生成商品主图、详情图、营销文案
6. **数据分析**：分析销售数据、广告效果、库存周转
7. **运营策略**：提供广告投放、促销活动、定价策略等建议

你的回答应该：
- 专业且实用，给出具体可执行的建议
- 用数据说话，尽量给出具体的数字和案例
- 关注利润和效率，帮助卖家降本增效
- 主动提醒风险和注意事项
- 回答简洁明了，避免冗长的废话

如果用户的问题涉及你不了解的领域，请诚实说明，不要编造信息。`;

export async function POST(request: NextRequest) {
  const { messages: userMessages, mode } = await request.json();
  const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

  const config = new Config();
  const client = new LLMClient(config, customHeaders);

  // Build messages array with system prompt
  const modeContexts: Record<string, string> = {
    general: "",
    product: "当前场景：选品分析。请重点从市场趋势、竞争分析、利润空间等角度回答。",
    publish: "当前场景：商品发布。请重点从平台规则、Listing优化、关键词策略等角度回答。",
    profit: "当前场景：利润计算。请重点关注成本构成、定价策略、利润率优化等。",
    image: "当前场景：素材生成。请重点从视觉营销、图片优化、A+内容等角度回答。",
    data: "当前场景：数据分析。请重点从数据解读、趋势分析、决策建议等角度回答。",
  };

  const modeContext = modeContexts[mode as string] || "";
  const systemContent = modeContext
    ? `${SYSTEM_PROMPT}\n\n${modeContext}`
    : SYSTEM_PROMPT;

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system" as const, content: systemContent },
    ...(userMessages as Array<{ role: "user" | "assistant"; content: string }>),
  ];

  // Create a ReadableStream for SSE
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const llmStream = client.stream(messages, {
          model: "doubao-seed-2-0-lite-260215",
          temperature: 0.7,
        });

        for await (const chunk of llmStream) {
          if (chunk.content) {
            const data = `data: ${JSON.stringify({ content: chunk.content.toString()})}\n\n`;
            controller.enqueue(encoder.encode(data));
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : "Unknown error";
        const data = `data: ${JSON.stringify({ error: errMsg })}\n\n`;
        controller.enqueue(encoder.encode(data));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
