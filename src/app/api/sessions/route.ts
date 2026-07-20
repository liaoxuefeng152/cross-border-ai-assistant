import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

const USER_ID = '00000000-0000-0000-0000-000000000001';

// 获取会话列表
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { data: sessions, error } = await client
      .from('chat_sessions')
      .select('*')
      .eq('user_id', USER_ID)
      .order('updated_at', { ascending: false })
      .limit(50);

    if (error) throw new Error(`获取会话列表失败：${error.message}`);

    return NextResponse.json({
      success: true,
      data: sessions || [],
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

// 创建新会话
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const title = body.title || '新对话';
    const mode = body.mode || 'general';

    const client = getSupabaseClient();
    const { data: session, error } = await client
      .from('chat_sessions')
      .insert({
        user_id: USER_ID,
        title: title.slice(0, 100),
        mode,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(`创建会话失败：${error.message}`);

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('Create session error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
