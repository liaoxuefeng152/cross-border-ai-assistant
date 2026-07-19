import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱和密码不能为空' },
        { status: 400 }
      )
    }

    const client = getSupabaseClient()

    // Debug
    console.log('Login attempt:', { email })
    console.log('Supabase URL:', process.env.COZE_SUPABASE_URL)
    console.log('Supabase Key Type:', process.env.COZE_SUPABASE_SERVICE_ROLE_KEY ? 'service_role_key' : 'anon_key')

    // Debug: Try to query all users
    const { data: allUsers, error: allError } = await client.from('users').select('email').limit(5)
    console.log('Debug all users:', { count: allUsers?.length, error: allError?.message })

    // 查找用户
    const { data: users, error } = await client
      .from('users')
      .select('*')
      .eq('email', email)
      .limit(1)

    console.log('Login query result:', { usersFound: users?.length, error: error?.message })

    if (error) throw new Error(`查询失败: ${error.message}`)

    const user = users?.[0]

    if (!user) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      )
    }

    // 验证密码（实际项目应该使用 bcrypt 等加密）
    if (user.password !== password) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
