/**
 * Agent 引擎
 * 核心能力：
 * 1. LLM 驱动的意图识别（替代关键词匹配）
 * 2. Agent Loop（多步任务编排）
 * 3. 技能调度与执行
 */

import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { detectSkill, executeSkill } from '@/lib/skills/registry';
import type { SkillResult } from '@/lib/skills/types';
import { buildConversationContext, saveMessage, buildUserProfileContext } from './memory';
import { buildKnowledgeContext } from './knowledge';

const USER_ID = '00000000-0000-0000-0000-000000000001';

/**
 * 技能定义（供 LLM 理解）
 */
const SKILL_DEFINITIONS = [
  {
    id: 'image-gen',
    name: 'AI 作图',
    description: '生成跨境电商商品图片，包括白底主图、场景图、模特上身图、广告素材、多语言本地化图片、社交媒体图片',
    parameters: {
      prompt: '图片描述（必填）',
      scene: '场景类型: white-background(白底图), lifestyle(场景图), model(模特图), ad-creative(广告素材), localized(本地化), social-media(社交媒体)',
      aspectRatio: '比例: 1:1, 16:9, 9:16, 4:3, 3:4',
    },
    triggerExamples: [
      '帮我生成一张蓝牙音箱的白底图',
      '做一个这个产品的场景图',
      '生成 TikTok 广告素材',
      '帮我做一张 Instagram 帖子图片',
    ],
  },
  {
    id: 'video-gen',
    name: 'AI 视频',
    description: '生成跨境电商商品视频，包括商品展示视频、图生视频、文生视频、开箱视频、广告视频',
    parameters: {
      prompt: '视频描述（必填）',
      scene: '场景类型: product-showcase(商品展示), image-to-video(图生视频), text-to-video(文生视频), ad-creative(广告素材), lifestyle(生活场景), unboxing(开箱演示)',
      duration: '时长(秒): 4-12',
    },
    triggerExamples: [
      '帮我生成一个商品展示视频',
      '用这张图生成一个 TikTok 视频',
      '做一个 15 秒的开箱视频',
      '生成一个广告素材视频',
    ],
  },
  {
    id: 'product-selection',
    name: '智能选品',
    description: '分析市场趋势，推荐适合跨境电商的产品，包括竞品分析、利润测算、市场容量评估',
    parameters: {
      category: '产品类目（可选）',
      market: '目标市场（可选）',
      priceRange: '价格区间（可选）',
    },
    triggerExamples: [
      '最近东南亚市场有什么好做的产品',
      '帮我分析一下小家电市场',
      '推荐几个适合 Amazon 美国站的 3C 产品',
      '什么品类利润高竞争小',
    ],
  },
  {
    id: 'listing-optimize',
    name: 'Listing 优化',
    description: '优化电商产品标题、五点描述、关键词、A+ 页面内容，支持多语言翻译和本地化',
    parameters: {
      productName: '产品名称（必填）',
      features: '产品特点（可选）',
      targetPlatform: '目标平台（可选）',
      targetMarket: '目标市场（可选）',
    },
    triggerExamples: [
      '帮我优化这个产品的标题',
      '写一下五点描述',
      '生成这个产品的关键词',
      '帮我做一下 Listing 优化',
    ],
  },
];

/**
 * Agent 事件类型（通过 SSE 发送给前端）
 */
export type AgentEvent =
  | { type: 'thinking'; content: string }
  | { type: 'plan'; steps: string[] }
  | { type: 'skill-start'; skill: string; label: string }
  | { type: 'skill-result'; skill: string; status: string; data: Record<string, unknown> | null; summary: string }
  | { type: 'step-complete'; step: number; total: number }
  | { type: 'text'; content: string }
  | { type: 'error'; message: string }
  | { type: 'done' };

/**
 * LLM 意图识别结果
 */
interface IntentResult {
  shouldUseSkill: boolean;
  skillId: string | null;
  confidence: number;
  extractedParams: Record<string, string>;
  reasoning: string;
}

/**
 * 使用 LLM 进行意图识别
 * 让 LLM 自己判断用户消息是否应该触发某个技能
 */
async function detectIntent(
  userMessage: string,
  conversationContext: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
): Promise<IntentResult> {
  const client = new LLMClient(new Config());

  // 构建技能描述
  const skillDescriptions = SKILL_DEFINITIONS.map((s) =>
    `### ${s.name} (id: ${s.id})\n${s.description}\n参数: ${JSON.stringify(s.parameters)}\n触发示例: ${s.triggerExamples.join('; ')}`
  ).join('\n\n');

  const systemPrompt = `你是龙掌柜 AI 的意图识别模块。你的任务是分析用户消息，判断是否需要调用某个技能。

## 可用技能
${skillDescriptions}

## 判断规则
1. 如果用户消息明确要求生成图片、视频、选品分析、Listing 优化，则 shouldUseSkill = true
2. 如果用户消息是闲聊、提问、咨询，不涉及具体操作，则 shouldUseSkill = false
3. 如果用户消息模糊不清，倾向于 shouldUseSkill = false
4. 从用户消息中提取技能所需的参数

## 输出格式（严格 JSON）
{
  "shouldUseSkill": true/false,
  "skillId": "技能id或null",
  "confidence": 0.0-1.0,
  "extractedParams": { "参数名": "参数值" },
  "reasoning": "判断理由"
}`;

  // 构建消息（包含对话上下文）
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
  ];

  // 添加最近 3 条对话上下文
  const recentContext = conversationContext.slice(-6);
  messages.push(...recentContext);

  // 添加当前用户消息
  messages.push({
    role: 'user',
    content: `请分析以下用户消息的意图：\n\n${userMessage}`,
  });

  try {
    const response = await client.invoke(messages, {
      model: 'doubao-seed-2-0-lite-260215',
      temperature: 0.1,
    });

    // 解析 JSON 响应
    const content = response.content.trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as IntentResult;
      return parsed;
    }
  } catch (error) {
    console.error('[Agent] Intent detection failed:', error);
  }

  // Fallback: 使用关键词匹配
  const keywordResult = detectSkill(userMessage);
  if (keywordResult) {
    return {
      shouldUseSkill: true,
      skillId: keywordResult.type,
      confidence: 0.6,
      extractedParams: { userMessage },
      reasoning: '关键词匹配 fallback',
    };
  }

  return {
    shouldUseSkill: false,
    skillId: null,
    confidence: 0,
    extractedParams: {},
    reasoning: '未匹配到技能',
  };
}

/**
 * Agent Loop：多步任务编排
 * 分析用户需求，拆解为多个步骤，逐步执行
 */
async function planAndExecute(
  userMessage: string,
  sessionId: string,
  onEvent: (event: AgentEvent) => void,
  headers: Record<string, string> = {}
): Promise<string> {
  const client = new LLMClient(new Config());

  // 构建规划 prompt
  const skillList = SKILL_DEFINITIONS.map((s) => `- ${s.name} (${s.id}): ${s.description}`).join('\n');

  const planPrompt = `你是龙掌柜 AI 的任务规划器。用户提出了一个需求，你需要判断是否需要拆解为多个步骤来完成。

## 可用技能
${skillList}

## 规则
1. 如果需求只涉及一个技能，直接返回单步计划
2. 如果需求涉及多个技能（如"做一个完整的上架方案"需要选品+作图+写Listing），拆解为多步
3. 每一步必须是可执行的技能调用
4. 返回 JSON 格式

## 输出格式（严格 JSON）
{
  "needsMultiStep": true/false,
  "steps": [
    { "skillId": "技能id", "description": "步骤描述", "params": {} }
  ],
  "summary": "整体方案概述"
}

如果不需要多步执行，steps 数组只包含一个元素。`;

  try {
    const response = await client.invoke(
      [
        { role: 'system', content: planPrompt },
        { role: 'user', content: userMessage },
      ],
      {
        model: 'doubao-seed-2-0-lite-260215',
        temperature: 0.2,
      }
    );

    const content = response.content.trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const plan = JSON.parse(jsonMatch[0]) as {
        needsMultiStep: boolean;
        steps: Array<{ skillId: string; description: string; params: Record<string, string> }>;
        summary: string;
      };

      if (plan.needsMultiStep && plan.steps.length > 1) {
        // 发送计划
        onEvent({
          type: 'plan',
          steps: plan.steps.map((s) => s.description),
        });

        // 逐步执行
        const results: Array<{ skill: string; result: SkillResult }> = [];
        for (let i = 0; i < plan.steps.length; i++) {
          const step = plan.steps[i];
          const skillDef = SKILL_DEFINITIONS.find((s) => s.id === step.skillId);

          onEvent({
            type: 'skill-start',
            skill: step.skillId,
            label: skillDef?.name || step.skillId,
          });

          const result = await executeSkill(step.skillId as import('@/lib/skills/types').SkillType, {
            userMessage: step.description,
            extractedParams: step.params,
            headers,
          });

          onEvent({
            type: 'skill-result',
            skill: step.skillId,
            status: result.status,
            data: result.data as Record<string, unknown> | null,
            summary: result.summary,
          });

          onEvent({
            type: 'step-complete',
            step: i + 1,
            total: plan.steps.length,
          });

          results.push({ skill: step.skillId, result });
        }

        return plan.summary;
      }
    }
  } catch (error) {
    console.error('[Agent] Planning failed:', error);
  }

  // 单步执行（默认路径）
  return '';
}

/**
 * 主入口：处理用户消息
 * 流程：
 * 1. 构建上下文（对话记忆 + 用户画像 + 知识库）
 * 2. LLM 意图识别
 * 3. 如果匹配技能 → 执行技能 → LLM 解读结果
 * 4. 如果不匹配 → 直接 LLM 对话（带上下文和知识库）
 */
export async function processMessage(
  userMessage: string,
  sessionId: string,
  onEvent: (event: AgentEvent) => void,
  headers: Record<string, string> = {}
): Promise<void> {
  // 1. 保存用户消息
  await saveMessage({
    sessionId,
    role: 'user',
    content: userMessage,
  });

  // 2. 构建上下文
  const [conversationContext, userProfileContext, knowledgeContext] =
    await Promise.all([
      buildConversationContext(sessionId, 10),
      buildUserProfileContext(),
      buildKnowledgeContext(userMessage),
    ]);

  // 3. LLM 意图识别
  onEvent({ type: 'thinking', content: '正在分析您的意图...' });
  const intent = await detectIntent(userMessage, conversationContext);

  if (intent.shouldUseSkill && intent.skillId) {
    // 4a. 匹配到技能 → 检查是否需要多步编排
    const planSummary = await planAndExecute(userMessage, sessionId, onEvent, headers);

    // 如果 planAndExecute 没有处理（单步），走原来的单步路径
    // 检查是否已经发送了 skill-result 事件
    // 如果没有，执行单步技能

    // 单步执行（如果 planAndExecute 没有多步执行）
    if (!planSummary) {
      const skillDef = SKILL_DEFINITIONS.find((s) => s.id === intent.skillId);

      onEvent({
        type: 'skill-start',
        skill: intent.skillId!,
        label: skillDef?.name || intent.skillId!,
      });

      const result = await executeSkill(
        intent.skillId as import('@/lib/skills/types').SkillType,
        {
          userMessage: userMessage,
          extractedParams: intent.extractedParams,
          headers,
        }
      );

      onEvent({
        type: 'skill-result',
        skill: intent.skillId!,
        status: result.status,
        data: result.data as Record<string, unknown> | null,
        summary: result.summary,
      });

      // 保存技能执行结果
      await saveMessage({
        sessionId,
        role: 'assistant',
        content: `[${skillDef?.name}] 技能执行完成`,
        skillType: intent.skillId!,
        skillResult: result as unknown as Record<string, unknown>,
      });
    }

    // 5. LLM 解读技能结果
    onEvent({ type: 'text', content: '' });
    return;
  }

  // 4b. 未匹配技能 → 直接 LLM 对话（带增强上下文）
  const client = new LLMClient(new Config());

  const systemPrompt = `你是龙掌柜 AI，一位经验丰富的跨境电商运营专家助手。

## 你的能力
- 熟悉 Amazon、Shopee、TikTok Shop、Lazada、eBay 等主流跨境电商平台
- 精通选品分析、Listing 优化、广告投放、物流方案
- 可以生成商品图片、视频
- 可以提供市场趋势分析和竞品分析

## 回答原则
1. 回答要具体、可操作，不要泛泛而谈
2. 涉及数据时给出具体数字和来源
3. 如果不确定，诚实说明
4. 适当使用表格和列表让信息更清晰
5. 如果用户的问题涉及作图、视频、选品、Listing 优化等操作，提醒用户可以直接让你执行${userProfileContext}${knowledgeContext}`;

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
  ];

  // 添加对话上下文
  messages.push(...conversationContext);

  // 添加当前消息
  messages.push({ role: 'user', content: userMessage });

  // 流式输出
  try {
    const stream = client.stream(messages, {
      model: 'doubao-seed-2-0-lite-260215',
      temperature: 0.7,
    });

    let fullResponse = '';
    for await (const chunk of stream) {
      if (chunk.content) {
        const text = chunk.content.toString();
        fullResponse += text;
        onEvent({ type: 'text', content: text });
      }
    }

    // 保存助手回复
    await saveMessage({
      sessionId,
      role: 'assistant',
      content: fullResponse,
    });
  } catch (error) {
    console.error('[Agent] LLM stream failed:', error);
    onEvent({
      type: 'error',
      message: '抱歉，处理您的请求时遇到了问题，请稍后重试。',
    });
  }

  onEvent({ type: 'done' });
}
