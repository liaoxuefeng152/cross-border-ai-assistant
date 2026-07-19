import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 获取会话列表
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001'
    const client = getSupabaseClient()
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('mode')

    let query = client
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (mode) {
      query = query.eq('mode', mode)
    }

    const { data: sessions, error } = await query

    if (error) throw new Error(`获取会话列表失败: ${error.message}`)

    return NextResponse.json({
      success: true,
      data: sessions || []
    })
  } catch (error) {
    console.error('Get sessions error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 创建会话
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001'
    const client = getSupabaseClient()
    const body = await request.json()

    const { title, mode } = body

    const { data: session, error } = await client
      .from('chat_sessions')
      .insert({
        user_id: userId,
        title: title || '新对话',
        mode: mode || 'general',
      })
      .select()
      .single()

    if (error) throw new Error(`创建会话失败: ${error.message}`)

    return NextResponse.json({
      success: true,
      data: session
    })
  } catch (error) {
    console.error('Create session error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
