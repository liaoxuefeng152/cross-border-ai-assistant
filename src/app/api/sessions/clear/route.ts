import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

const USER_ID = '00000000-0000-0000-0000-000000000001';

// 清空所有会话和消息
export async function POST() {
  try {
    const client = getSupabaseClient();

    // 删除所有消息
    const { error: messagesError } = await client
      .from('chat_memories')
      .delete()
      .eq('user_id', USER_ID);

    if (messagesError) {
      throw new Error(`删除消息失败：${messagesError.message}`);
    }

    // 删除所有会话
    const { error: sessionsError } = await client
      .from('chat_sessions')
      .delete()
      .eq('user_id', USER_ID);

    if (sessionsError) {
      throw new Error(`删除会话失败：${sessionsError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: '已清空所有对话记录',
    });
  } catch (error) {
    console.error('Clear sessions error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
