import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

const USER_ID = '00000000-0000-0000-0000-000000000001';

// 获取会话的消息历史
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = getSupabaseClient();
    const { data: messages, error } = await client
      .from('chat_memories')
      .select('*')
      .eq('user_id', USER_ID)
      .eq('session_id', id)
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) throw new Error(`获取消息历史失败：${error.message}`);

    return NextResponse.json({
      success: true,
      data: messages || [],
    });
  } catch (error) {
    console.error('Get session messages error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
