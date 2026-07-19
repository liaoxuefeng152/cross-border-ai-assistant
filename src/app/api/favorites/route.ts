import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 获取收藏列表
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001'
    const client = getSupabaseClient()

    const { data: favorites, error } = await client
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`获取收藏列表失败: ${error.message}`)

    return NextResponse.json({
      success: true,
      data: favorites || []
    })
  } catch (error) {
    console.error('Get favorites error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 添加收藏
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001'
    const client = getSupabaseClient()
    const body = await request.json()

    const { data: favorite, error } = await client
      .from('favorites')
      .insert({
        user_id: userId,
        product_name: body.productName,
        category: body.category,
        market: body.market,
        trend_score: body.trendScore,
        competition: body.competition,
        profit_margin: body.profitMargin,
        source_price: body.sourcePrice,
        suggested_price: body.suggestedPrice,
        monthly_sales: body.monthlySales,
        source_url: body.sourceUrl,
        source_keyword: body.sourceKeyword,
        ai_analysis: body.aiAnalysis,
        action_advice: body.actionAdvice,
        supplier_info: body.supplierInfo,
        logistics_advice: body.logisticsAdvice,
      })
      .select()
      .single()

    if (error) throw new Error(`添加收藏失败: ${error.message}`)

    return NextResponse.json({
      success: true,
      data: favorite
    })
  } catch (error) {
    console.error('Add favorite error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
