import type { SkillExecuteParams, SkillResult } from './types';

// 消息分类
type MessageCategory = 'shipping' | 'return' | 'product' | 'complaint' | 'other';

interface CustomerMessage {
  id: string;
  content: string;
  category: MessageCategory;
  language: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  needsReview: boolean;
}

interface AutoCSResult {
  messages: Array<{
    id: string;
    original: string;
    category: MessageCategory;
    language: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    needsReview: boolean;
    reply: string;
  }>;
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

const CATEGORY_LABELS: Record<MessageCategory, string> = {
  shipping: '物流查询',
  return: '退换货',
  product: '产品咨询',
  complaint: '投诉/差评',
  other: '其他',
};

const CATEGORY_ICONS: Record<MessageCategory, string> = {
  shipping: '🚚',
  return: '🔄',
  product: '💬',
  complaint: '🔴',
  other: '⚪',
};

const REPLY_TEMPLATES: Record<MessageCategory, string> = {
  shipping: `Dear Customer,

Thank you for reaching out. I sincerely apologize for any inconvenience.

I've checked your order and it is currently being processed. The estimated delivery date is within the next few business days. You will receive a tracking notification as soon as your package ships.

If you have any further questions or concerns, please don't hesitate to contact us. We're here to help!

Best regards,
Customer Service Team`,

  return: `Dear Customer,

Thank you for contacting us. I'm sorry to hear that you'd like to return your item.

We offer a hassle-free return process. Here's what you need to do:
1. Go to Your Orders on Amazon
2. Select the item you'd like to return
3. Choose your return reason and follow the instructions

Once we receive the returned item, we'll process your refund within 3-5 business days.

If you need any assistance with the return process, please let us know. We're happy to help!

Best regards,
Customer Service Team`,

  product: `Dear Customer,

Thank you for your interest in our product!

I'd be happy to help answer your questions. [AI will fill in specific product details based on the question.]

If you have any other questions or need further information, please feel free to ask. We're here to help you make the best decision!

Best regards,
Customer Service Team`,

  complaint: `Dear Customer,

I sincerely apologize for the negative experience you've had. Your satisfaction is extremely important to us, and I take your feedback very seriously.

I would like to make this right for you. Could you please share more details about the issue so I can find the best solution? We can offer:
- A full refund
- A free replacement
- A partial refund if you'd like to keep the item

Please let me know which option works best for you, and I'll take care of it immediately.

Again, I'm truly sorry for the inconvenience. We're committed to making this right.

Best regards,
Customer Service Team`,

  other: `Dear Customer,

Thank you for contacting us!

I'd be happy to assist you with your inquiry. [AI will provide a specific response based on the message content.]

If you need any further assistance, please don't hesitate to reach out. We're always here to help!

Best regards,
Customer Service Team`,
};

// 检测语言
function detectLanguage(text: string): string {
  const lower = text.toLowerCase();
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return 'ja';
  if (/[\u4e00-\u9fa5]/.test(text)) return 'zh';
  if (/\b(hallo|danke|bitte|ihnen)\b/.test(lower)) return 'de';
  if (/\b(bonjour|merci|vous|cordialement)\b/.test(lower)) return 'fr';
  if (/\b(hola|gracias|usted|saludos)\b/.test(lower)) return 'es';
  if (/\b(ciao|grazie|cordiali\s+saluti)\b/.test(lower)) return 'it';
  return 'en';
}

// 检测情感
function detectSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const lower = text.toLowerCase();
  const negativeWords = ['angry', 'terrible', 'awful', 'worst', 'hate', 'disappointed', 'broken', 'defective', 'scam', 'fraud', 'refund', 'complaint', 'unacceptable', 'horrible'];
  const positiveWords = ['great', 'excellent', 'love', 'amazing', 'perfect', 'wonderful', 'thank', 'appreciate', 'good'];

  const negCount = negativeWords.filter(w => lower.includes(w)).length;
  const posCount = positiveWords.filter(w => lower.includes(w)).length;

  if (negCount > posCount) return 'negative';
  if (posCount > negCount) return 'positive';
  return 'neutral';
}

// 分类消息
function categorizeMessage(text: string): MessageCategory {
  const lower = text.toLowerCase();

  if (/\b(ship|track|deliver|arrived|when.*receive|where.*my|package|tracking)\b/.test(lower)) return 'shipping';
  if (/\b(return|refund|exchange|money back|send back)\b/.test(lower)) return 'return';
  if (/\b(angry|terrible|awful|worst|hate|disappointed|broken|defective|scam|complaint|review|star)\b/.test(lower)) return 'complaint';
  if (/\b(size|color|weight|material|compatible|how.*use|specification|feature)\b/.test(lower)) return 'product';

  return 'other';
}

// 解析批量消息
function parseMessages(rawText: string): string[] {
  // 尝试按常见分隔符分割
  const separators = ['---', '===', 'Message:', 'Buyer:', '买家:', '顾客:'];
  let messages: string[] = [];

  // 先尝试按分隔符分割
  for (const sep of separators) {
    if (rawText.includes(sep)) {
      messages = rawText.split(sep).map(m => m.trim()).filter(m => m.length > 10);
      if (messages.length > 1) return messages;
    }
  }

  // 尝试按空行分割
  const blocks = rawText.split(/\n\s*\n/).map(m => m.trim()).filter(m => m.length > 10);
  if (blocks.length > 1) return blocks;

  // 单条消息
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

  for (let i = 0; i < messages.length; i++) {
    const content = messages[i];
    const category = categorizeMessage(content);
    const language = detectLanguage(content);
    const sentiment = detectSentiment(content);
    const needsReview = category === 'complaint' || sentiment === 'negative';

    // 生成回复
    let reply = REPLY_TEMPLATES[category];

    // 如果是产品咨询，尝试从消息中提取具体问题
    if (category === 'product') {
      reply = reply.replace(
        '[AI will fill in specific product details based on the question.]',
        `Regarding your question about "${content.substring(0, 80)}${content.length > 80 ? '...' : ''}", I'd be happy to provide more details. Please feel free to ask any specific questions about the product.`
      );
    }

    if (category === 'other') {
      reply = reply.replace(
        '[AI will provide a specific response based on the message content.]',
        `Based on your message, I understand you're asking about: "${content.substring(0, 80)}${content.length > 80 ? '...' : ''}". Let me address this for you.`
      );
    }

    results.push({
      id: `msg-${i + 1}`,
      original: content,
      category,
      language,
      sentiment,
      needsReview,
      reply,
    });

    summary[category]++;
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
