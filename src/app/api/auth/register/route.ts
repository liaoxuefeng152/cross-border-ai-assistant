import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱和密码不能为空' },
        { status: 400 }
      )
    }

    const client = getSupabaseClient()

    // 检查邮箱是否已注册
    const { data: existingUser, error: checkError } = await client
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (checkError) throw new Error(`查询失败: ${checkError.message}`)

    if (existingUser) {
      return NextResponse.json(
        { error: '该邮箱已注册' },
        { status: 400 }
      )
    }

    // 创建用户（实际项目应该加密密码）
    const { data: user, error } = await client
      .from('users')
      .insert({
        email,
        password, // TODO: 实际项目需要加密
        name: name || email.split('@')[0],
      })
      .select()
      .single()

    if (error) throw new Error(`注册失败: ${error.message}`)

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      }
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
