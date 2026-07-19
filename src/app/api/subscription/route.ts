import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 获取当前订阅
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001'
    const client = getSupabaseClient()

    const { data: subscription, error } = await client
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) throw new Error(`获取订阅信息失败: ${error.message}`)

    return NextResponse.json({
      success: true,
      data: subscription || null
    })
  } catch (error) {
    console.error('Get subscription error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 创建/更新订阅
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001'
    const client = getSupabaseClient()
    const body = await request.json()

    const { plan, amount } = body

    if (!plan) {
      return NextResponse.json(
        { error: '缺少套餐类型' },
        { status: 400 }
      )
    }

    const startDate = new Date().toISOString()
    const endDate = new Date()
    endDate.setFullYear(endDate.getFullYear() + 1)

    // 使用 upsert 创建或更新订阅
    const { data: subscription, error } = await client
      .from('subscriptions')
      .upsert({
        user_id: userId,
        plan,
        status: 'active',
        start_date: startDate,
        end_date: endDate.toISOString(),
        amount,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) throw new Error(`创建订阅失败: ${error.message}`)

    return NextResponse.json({
      success: true,
      data: subscription
    })
  } catch (error) {
    console.error('Create subscription error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 取消订阅
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001'
    const client = getSupabaseClient()

    const { error } = await client
      .from('subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    if (error) throw new Error(`取消订阅失败: ${error.message}`)

    return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
