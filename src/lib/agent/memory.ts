/**
 * 对话记忆服务
 * 负责存储和检索对话历史，支持短期记忆（当前会话）和长期记忆（用户偏好）
 */

import { getSupabaseClient } from '@/storage/database/supabase-client';

const USER_ID = '00000000-0000-0000-0000-000000000001';

export interface ChatMemory {
  id: string;
  session_id: string | null;
  role: 'user' | 'assistant' | 'system';
  content: string;
  skill_type: string | null;
  skill_result: Record<string, unknown> | null;
  created_at: string;
}

export interface UserProfile {
  preferred_platforms: string[];
  product_categories: string[];
  target_markets: string[];
  business_type: string | null;
  notes: string | null;
}

/**
 * 保存对话消息到记忆
 */
export async function saveMessage(params: {
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  skillType?: string;
  skillResult?: Record<string, unknown>;
}): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    await supabase.from('chat_memories').insert({
      user_id: USER_ID,
      session_id: params.sessionId,
      role: params.role,
      content: params.content,
      skill_type: params.skillType || null,
      skill_result: params.skillResult ? JSON.stringify(params.skillResult) : null,
    });
  } catch (error) {
    console.error('[Memory] Failed to save message:', error);
  }
}

/**
 * 获取最近 N 条对话历史（短期记忆）
 */
export async function getRecentMemories(
  sessionId: string,
  limit: number = 20
): Promise<ChatMemory[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('chat_memories')
      .select('*')
      .eq('user_id', USER_ID)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[Memory] Failed to get recent memories:', error);
      return [];
    }

    return (data || []).reverse() as ChatMemory[];
  } catch (error) {
    console.error('[Memory] Failed to get recent memories:', error);
    return [];
  }
}

/**
 * 构建对话上下文（用于注入 LLM）
 */
export async function buildConversationContext(
  sessionId: string,
  maxMessages: number = 10
): Promise<Array<{ role: 'system' | 'user' | 'assistant'; content: string }>> {
  const memories = await getRecentMemories(sessionId, maxMessages);

  return memories.map((m) => {
    let content = m.content;

    // 如果是包含技能结果的消息，附加结果摘要
    if (m.skill_type && m.skill_result) {
      const result = m.skill_result as Record<string, unknown>;
      if (result.success) {
        const data = result.data as Record<string, unknown> | undefined;
        if (data) {
          if (data.images) {
            content += `\n[已生成 ${(data.images as unknown[]).length} 张图片]`;
          } else if (data.videoUrl) {
            content += `\n[已生成视频: ${data.duration}s]`;
          } else if (data.recommendations) {
            content += `\n[已推荐 ${(data.recommendations as unknown[]).length} 个产品]`;
          } else if (data.optimization) {
            content += `\n[已生成 Listing 优化方案]`;
          }
        }
      }
    }

    return { role: m.role, content };
  });
}

/**
 * 获取用户长期画像
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', USER_ID)
      .single();

    if (error || !data) return null;

    return {
      preferred_platforms: data.preferred_platforms || [],
      product_categories: data.product_categories || [],
      target_markets: data.target_markets || [],
      business_type: data.business_type,
      notes: data.notes,
    };
  } catch {
    return null;
  }
}

/**
 * 更新用户画像（从对话中提取信息）
 */
export async function updateUserProfile(
  updates: Partial<UserProfile>
): Promise<void> {
  try {
    const supabase = getSupabaseClient();

    // Check if profile exists
    const { data: existing } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', USER_ID)
      .single();

    if (existing) {
      await supabase
        .from('user_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', USER_ID);
    } else {
      await supabase.from('user_profiles').insert({
        user_id: USER_ID,
        ...updates,
      });
    }
  } catch (error) {
    console.error('[Memory] Failed to update user profile:', error);
  }
}

/**
 * 构建用户画像上下文（注入 system prompt）
 */
export async function buildUserProfileContext(): Promise<string> {
  const profile = await getUserProfile();
  if (!profile) return '';

  const parts: string[] = [];
  if (profile.preferred_platforms.length > 0) {
    parts.push(`常用平台: ${profile.preferred_platforms.join(', ')}`);
  }
  if (profile.product_categories.length > 0) {
    parts.push(`经营品类: ${profile.product_categories.join(', ')}`);
  }
  if (profile.target_markets.length > 0) {
    parts.push(`目标市场: ${profile.target_markets.join(', ')}`);
  }
  if (profile.business_type) {
    parts.push(`业务类型: ${profile.business_type}`);
  }
  if (profile.notes) {
    parts.push(`备注: ${profile.notes}`);
  }

  if (parts.length === 0) return '';
  return `\n\n## 用户画像\n${parts.join('\n')}`;
}
