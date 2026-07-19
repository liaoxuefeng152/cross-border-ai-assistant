/**
 * RAG 知识库服务
 * 基于 Supabase 的全文检索实现知识检索
 */

import { getSupabaseClient } from '@/storage/database/supabase-client';

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  source: string | null;
}

/**
 * 根据关键词检索知识库
 * 使用 PostgreSQL 全文检索 + 标签匹配
 */
export async function searchKnowledge(
  query: string,
  options?: {
    category?: string;
    limit?: number;
  }
): Promise<KnowledgeItem[]> {
  try {
    const supabase = getSupabaseClient();
    const limit = options?.limit || 5;

    // 提取查询关键词（中文分词：按空格和标点分割）
    const keywords = query
      .replace(/[，。？！、；：""''（）\[\]{}]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 2)
      .slice(0, 5);

    if (keywords.length === 0) return [];

    // 构建查询：标题和内容包含任一关键词
    let qb = supabase
      .from('knowledge_base')
      .select('*')
      .limit(limit);

    // 使用 OR 条件搜索标题和内容
    const titleConditions = keywords.map((k) => `title.ilike.%${k}%`);
    const contentConditions = keywords.map((k) => `content.ilike.%${k}%`);
    const tagConditions = keywords.map((k) => `tags.cs.{${k}}`);

    const allConditions = [
      ...titleConditions,
      ...contentConditions,
      ...tagConditions,
    ];

    qb = qb.or(allConditions.join(','));

    if (options?.category) {
      qb = qb.eq('category', options.category);
    }

    const { data, error } = await qb;

    if (error) {
      console.error('[Knowledge] Search failed:', error);
      return [];
    }

    // 按相关度排序（标题命中 > 标签命中 > 内容命中）
    const scored = (data || []).map((item) => {
      let score = 0;
      for (const kw of keywords) {
        if (item.title.toLowerCase().includes(kw.toLowerCase())) score += 3;
        if (item.tags.some((t: string) => t.toLowerCase().includes(kw.toLowerCase()))) score += 2;
        if (item.content.toLowerCase().includes(kw.toLowerCase())) score += 1;
      }
      return { ...item, score };
    });

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      category: item.category,
      tags: item.tags,
      source: item.source,
    }));
  } catch (error) {
    console.error('[Knowledge] Search failed:', error);
    return [];
  }
}

/**
 * 构建知识库上下文（注入 system prompt）
 */
export async function buildKnowledgeContext(
  userMessage: string
): Promise<string> {
  const results = await searchKnowledge(userMessage, { limit: 3 });

  if (results.length === 0) return '';

  const sections = results.map(
    (r) => `### ${r.title}\n${r.content}`
  );

  return `\n\n## 相关知识库\n以下是从知识库中检索到的相关信息，请参考回答用户问题：\n\n${sections.join('\n\n')}`;
}

/**
 * 获取指定分类的所有知识
 */
export async function getKnowledgeByCategory(
  category: string
): Promise<KnowledgeItem[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('category', category)
      .order('title');

    if (error) {
      console.error('[Knowledge] Failed to get by category:', error);
      return [];
    }

    return (data || []).map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      category: item.category,
      tags: item.tags,
      source: item.source,
    }));
  } catch (error) {
    console.error('[Knowledge] Failed to get by category:', error);
    return [];
  }
}
