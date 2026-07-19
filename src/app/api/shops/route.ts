import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 获取店铺列表
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001'
    const client = getSupabaseClient()
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')

    let query = client
      .from('shops')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (platform) {
      query = query.eq('platform', platform)
    }

    const { data: shops, error } = await query

    if (error) throw new Error(`获取店铺列表失败: ${error.message}`)

    return NextResponse.json({
      success: true,
      data: shops || []
    })
  } catch (error) {
    console.error('Get shops error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 添加店铺
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001'
    const client = getSupabaseClient()
    const body = await request.json()

    const { platform, shopName, shopId } = body

    if (!platform || !shopName) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    const { data: shop, error } = await client
      .from('shops')
      .insert({
        user_id: userId,
        platform,
        shop_name: shopName,
        shop_id: shopId,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw new Error(`添加店铺失败: ${error.message}`)

    return NextResponse.json({
      success: true,
      data: shop
    })
  } catch (error) {
    console.error('Add shop error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
