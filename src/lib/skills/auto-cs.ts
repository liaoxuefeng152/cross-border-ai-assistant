/**
 * 自动客服技能（RAG 增强版）
 * 基于知识库检索 + LLM 生成回复
 */

import { searchKnowledge } from '@/lib/agent/knowledge';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import type { SkillExecuteParams, SkillResult } from './types';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AutoCSResult {
  messages: {
    id: string;
    original: string;
    category: string;
    language: string;
    sentiment: string;
    needsReview: boolean;
    reply: string;
    knowledgeUsed: string[]; // 引用的知识条目
  }[];
  summary: {
    total: number;
    shipping: number;
    return: number;
    product: number;
    complaint: number;
    other: number;
    needsReview: number;
  };
}

// 分类提示词
const CATEGORY_PROMPT = `请分析以下买家消息，返回 JSON 格式：
{
  "category": "shipping|return|product|complaint|other",
  "sentiment": "positive|neutral|negative",
  "language": "en|zh|ja|de|fr|es|it"
}

分类规则：
- shipping: 物流、配送、跟踪、收货相关
- return: 退货、退款、换货相关
- product: 产品咨询、尺寸、颜色、功能相关
- complaint: 投诉、差评、质量问题相关
- other: 其他

情感规则：
- positive: 满意、感谢、好评
- neutral: 中性询问
- negative: 愤怒、失望、抱怨

语言规则：根据消息内容判断语言`;

// 生成回复的 prompt
function buildReplyPrompt(
  originalMessage: string,
  category: string,
  sentiment: string,
  language: string,
  knowledgeContext: string
): Message[] {
  const languageNames: Record<string, string> = {
    en: 'English',
    zh: 'Chinese',
    ja: 'Japanese',
    de: 'German',
    fr: 'French',
    es: 'Spanish',
    it: 'Italian',
  };

  const toneInstruction =
    sentiment === 'negative'
      ? 'The customer is upset. Be empathetic, apologize sincerely, and offer concrete solutions.'
      : sentiment === 'positive'
        ? 'The customer is happy. Be warm and appreciative.'
        : 'Be professional and helpful.';

  return [
    {
      role: 'system',
      content: `You are a professional cross-border e-commerce customer service representative.

${knowledgeContext ? `## Knowledge Base Reference\n${knowledgeContext}\n` : ''}

## Guidelines
- Language: Reply in ${languageNames[language] || 'English'}
- Tone: ${toneInstruction}
- Style: Professional, concise, friendly
- Format: Use proper email format with greeting and closing
- If you don't know the answer, say so honestly and suggest contacting human support
- Do not make up product details or policies not in the knowledge base`,
    },
    {
      role: 'user',
      content: `Buyer message (category: ${category}, sentiment: ${sentiment}):

${originalMessage}

Please write a professional reply.`,
    },
  ];
}

// 检测语言（备用方案）
function detectLanguage(text: string): string {
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return 'ja';
  if (/[\u4e00-\u9fa5]/.test(text)) return 'zh';
  if (/\b(hallo|danke|bitte|ihnen)\b/.test(text.toLowerCase())) return 'de';
  if (/\b(bonjour|merci|vous|cordialement)\b/.test(text.toLowerCase())) return 'fr';
  if (/\b(hola|gracias|usted|saludos)\b/.test(text.toLowerCase())) return 'es';
  if (/\b(ciao|grazie|cordiali\s+saluti)\b/.test(text.toLowerCase())) return 'it';
  return 'en';
}

// 分类消息（备用方案）
function categorizeMessage(text: string): string {
  const lower = text.toLowerCase();
  if (/\b(ship|track|deliver|arrived|when.*receive|where.*my|package|tracking)\b/.test(lower)) return 'shipping';
  if (/\b(return|refund|exchange|money back|send back)\b/.test(lower)) return 'return';
  if (/\b(angry|terrible|awful|worst|hate|disappointed|broken|defective|scam|complaint|review|star)\b/.test(lower)) return 'complaint';
  if (/\b(size|color|weight|material|compatible|how.*use|specification|feature)\b/.test(lower)) return 'product';
  return 'other';
}

// 检测情感（备用方案）
function detectSentiment(text: string): string {
  const lower = text.toLowerCase();
  const negativeWords = ['angry', 'terrible', 'awful', 'worst', 'hate', 'disappointed', 'broken', 'defective', 'scam', 'fraud', 'refund', 'complaint', 'unacceptable', 'horrible'];
  const positiveWords = ['great', 'excellent', 'love', 'amazing', 'perfect', 'wonderful', 'thank', 'appreciate', 'good'];

  const negCount = negativeWords.filter((w) => lower.includes(w)).length;
  const posCount = positiveWords.filter((w) => lower.includes(w)).length;

  if (negCount > posCount) return 'negative';
  if (posCount > negCount) return 'positive';
  return 'neutral';
}

// 解析批量消息
function parseMessages(rawText: string): string[] {
  const separators = ['---', '===', 'Message:', 'Buyer:', '买家:', '顾客:'];
  let messages: string[] = [];

  for (const sep of separators) {
    if (rawText.includes(sep)) {
      messages = rawText.split(sep).map((m) => m.trim()).filter((m) => m.length > 10);
      if (messages.length > 1) return messages;
    }
  }

  const blocks = rawText.split(/\n\s*\n/).map((m) => m.trim()).filter((m) => m.length > 10);
  if (blocks.length > 1) return blocks;

  return [rawText];
}

export async function executeAutoCS(params: SkillExecuteParams): Promise<SkillResult> {
  const userMessage = params.userMessage || '';
  const extractedParams = params.extractedParams || {};
  const rawText = extractedParams.adData || extractedParams.messages || extractedParams.text || userMessage;

  const messages = parseMessages(rawText);
  const results: AutoCSResult['messages'] = [];
  const summary: AutoCSResult['summary'] = {
    total: messages.length,
    shipping: 0,
    return: 0,
    product: 0,
    complaint: 0,
    other: 0,
    needsReview: 0,
  };

  // 初始化 LLM 客户端
  const config = new Config();
  const headers = HeaderUtils.extractForwardHeaders(params.headers || {});
  const llm = new LLMClient(config, headers);

  for (let i = 0; i < messages.length; i++) {
    const content = messages[i];

    // 1. 使用 LLM 分类（带降级）
    let category = 'other';
    let sentiment = 'neutral';
    let language = 'en';

    try {
      const classifyMessages: Message[] = [
        { role: 'system', content: CATEGORY_PROMPT },
        { role: 'user', content },
      ];

      const classifyResponse = await llm.invoke(classifyMessages, {
        model: 'doubao-seed-2-0-lite-260215',
        temperature: 0.3,
      });
      const jsonMatch = classifyResponse.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        category = parsed.category || categorizeMessage(content);
        sentiment = parsed.sentiment || detectSentiment(content);
        language = parsed.language || detectLanguage(content);
      }
    } catch (error) {
      // 降级到规则匹配
      category = categorizeMessage(content);
      sentiment = detectSentiment(content);
      language = detectLanguage(content);
      console.warn('[AutoCS] LLM classification failed, using rule-based fallback');
    }

    // 2. RAG 知识检索
    const knowledgeItems = await searchKnowledge(content, { limit: 3 });
    const knowledgeContext = knowledgeItems.length > 0
      ? knowledgeItems
          .map((item, idx) => `[${idx + 1}] ${item.title}\n${item.content}`)
          .join('\n\n')
      : '';

    // 3. LLM 生成回复
    let reply = '';
    try {
      const replyMessages = buildReplyPrompt(content, category, sentiment, language, knowledgeContext);
      const replyResponse = await llm.invoke(replyMessages, {
        model: 'doubao-seed-2-0-lite-260215',
        temperature: 0.7,
      });
      reply = replyResponse.content;
    } catch (error) {
      reply = `Dear Customer,\n\nThank you for contacting us. We have received your message and will respond shortly.\n\nBest regards,\nCustomer Service Team`;
      console.error('[AutoCS] LLM reply generation failed:', error);
    }

    const needsReview = category === 'complaint' || sentiment === 'negative';

    results.push({
      id: `msg-${i + 1}`,
      original: content,
      category,
      language,
      sentiment,
      needsReview,
      reply,
      knowledgeUsed: knowledgeItems.map((item) => item.title),
    });

    summary[category as keyof typeof summary]++;
    if (needsReview) summary.needsReview++;
  }

  return {
    type: 'auto-cs',
    status: 'success',
    data: {
      messages: results,
      summary,
    } as AutoCSResult,
    summary: `已处理 ${messages.length} 条买家消息，${summary.needsReview > 0 ? `${summary.needsReview} 条建议人工复核` : '全部可自动回复'}`,
  };
}
