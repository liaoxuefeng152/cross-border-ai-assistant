import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 获取商品列表
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001'
    const client = getSupabaseClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const platform = searchParams.get('platform')

    let query = client
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }
    if (platform) {
      query = query.eq('platform', platform)
    }

    const { data: products, error } = await query

    if (error) throw new Error(`获取商品列表失败: ${error.message}`)

    return NextResponse.json({
      success: true,
      data: products || []
    })
  } catch (error) {
    console.error('Get products error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 创建商品
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001'
    const client = getSupabaseClient()
    const body = await request.json()

    const { data: product, error } = await client
      .from('products')
      .insert({
        user_id: userId,
        name: body.name,
        category: body.category,
        market: body.market,
        source_url: body.sourceUrl,
        source_price: body.sourcePrice,
        suggested_price: body.suggestedPrice,
        platform: body.platform,
        status: body.status || 'draft',
        data: body.data,
      })
      .select()
      .single()

    if (error) throw new Error(`创建商品失败: ${error.message}`)

    return NextResponse.json({
      success: true,
      data: product
    })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
