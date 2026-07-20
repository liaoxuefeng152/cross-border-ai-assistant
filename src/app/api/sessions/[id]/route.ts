import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

const USER_ID = '00000000-0000-0000-0000-000000000001';

// 更新会话标题
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const title = body.title;

    if (!title) {
      return NextResponse.json(
        { error: '标题不能为空' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();
    const { data: session, error } = await client
      .from('chat_sessions')
      .update({
        title: title.slice(0, 100),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', USER_ID)
      .select()
      .single();

    if (error) throw new Error(`更新会话失败：${error.message}`);

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('Update session error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

// 删除会话
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = getSupabaseClient();

    // 删除会话的消息
    await client
      .from('chat_memories')
      .delete()
      .eq('session_id', id)
      .eq('user_id', USER_ID);

    // 删除会话
    const { error } = await client
      .from('chat_sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', USER_ID);

    if (error) throw new Error(`删除会话失败：${error.message}`);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Delete session error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
