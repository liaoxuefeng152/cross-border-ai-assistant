import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 获取账单列表
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001'
    const client = getSupabaseClient()

    const { data: bills, error } = await client
      .from('bills')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`获取账单列表失败: ${error.message}`)

    return NextResponse.json({
      success: true,
      data: bills || []
    })
  } catch (error) {
    console.error('Get bills error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 创建账单
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001'
    const client = getSupabaseClient()
    const body = await request.json()

    const { subscriptionId, amount, description } = body

    const { data: bill, error } = await client
      .from('bills')
      .insert({
        user_id: userId,
        subscription_id: subscriptionId,
        amount,
        description,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw new Error(`创建账单失败: ${error.message}`)

    return NextResponse.json({
      success: true,
      data: bill
    })
  } catch (error) {
    console.error('Create bill error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
