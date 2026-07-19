import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 获取会话消息
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const client = getSupabaseClient()
    const { sessionId } = await params

    const { data: messages, error } = await client
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    if (error) throw new Error(`获取消息失败: ${error.message}`)

    return NextResponse.json({
      success: true,
      data: messages || []
    })
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 发送消息
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const client = getSupabaseClient()
    const { sessionId } = await params
    const body = await request.json()

    const { role, content } = body

    if (!role || !content) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    const { data: message, error } = await client
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        role,
        content,
      })
      .select()
      .single()

    if (error) throw new Error(`保存消息失败: ${error.message}`)

    // 更新会话的更新时间
    await client
      .from('chat_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', sessionId)

    return NextResponse.json({
      success: true,
      data: message
    })
  } catch (error) {
    console.error('Save message error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
