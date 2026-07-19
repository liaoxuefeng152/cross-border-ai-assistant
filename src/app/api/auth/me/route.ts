import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    const client = getSupabaseClient()

    const { data: user, error } = await client
      .from('users')
      .select('id, email, name, avatar, role, created_at')
      .eq('id', userId)
      .maybeSingle()

    if (error) throw new Error(`查询失败: ${error.message}`)

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    const client = getSupabaseClient()
    const body = await request.json()
    const { name, avatar } = body

    const { data: user, error } = await client
      .from('users')
      .update({
        name,
        avatar,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw new Error(`更新失败: ${error.message}`)

    return NextResponse.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
