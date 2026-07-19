import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 获取上架记录列表
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001'
    const client = getSupabaseClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const platform = searchParams.get('platform')

    let query = client
      .from('listings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }
    if (platform) {
      query = query.eq('platform', platform)
    }

    const { data: listings, error } = await query

    if (error) throw new Error(`获取上架记录失败: ${error.message}`)

    return NextResponse.json({
      success: true,
      data: listings || []
    })
  } catch (error) {
    console.error('Get listings error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 创建上架任务
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001'
    const client = getSupabaseClient()
    const body = await request.json()

    const { sourceUrl, platform, shopId, productId } = body

    if (!sourceUrl || !platform) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 创建上架记录
    const { data: listing, error } = await client
      .from('listings')
      .insert({
        user_id: userId,
        product_id: productId,
        source_url: sourceUrl,
        platform,
        shop_id: shopId,
        status: 'processing',
      })
      .select()
      .single()

    if (error) throw new Error(`创建上架任务失败: ${error.message}`)

    // TODO: 实际项目中这里应该调用平台 API 进行上架
    // 模拟上架过程
    setTimeout(async () => {
      await client
        .from('listings')
        .update({
          status: 'success',
          result: {
            listingId: `LIST-${Date.now()}`,
            platformUrl: `https://www.${platform}.com/product/demo`,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', listing.id)
    }, 3000)

    return NextResponse.json({
      success: true,
      data: listing
    })
  } catch (error) {
    console.error('Create listing error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
