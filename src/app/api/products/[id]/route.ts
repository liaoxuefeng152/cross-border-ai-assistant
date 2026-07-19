import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 获取商品详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001'
    const client = getSupabaseClient()
    const { id } = await params

    const { data: product, error } = await client
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle()

    if (error) throw new Error(`查询失败: ${error.message}`)

    if (!product) {
      return NextResponse.json(
        { error: '商品不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: product
    })
  } catch (error) {
    console.error('Get product error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 更新商品
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001'
    const client = getSupabaseClient()
    const { id } = await params
    const body = await request.json()

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (body.name !== undefined) updateData.name = body.name
    if (body.category !== undefined) updateData.category = body.category
    if (body.market !== undefined) updateData.market = body.market
    if (body.sourceUrl !== undefined) updateData.source_url = body.sourceUrl
    if (body.sourcePrice !== undefined) updateData.source_price = body.sourcePrice
    if (body.suggestedPrice !== undefined) updateData.suggested_price = body.suggestedPrice
    if (body.platform !== undefined) updateData.platform = body.platform
    if (body.status !== undefined) updateData.status = body.status
    if (body.data !== undefined) updateData.data = body.data

    const { data: product, error } = await client
      .from('products')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw new Error(`更新商品失败: ${error.message}`)

    return NextResponse.json({
      success: true,
      data: product
    })
  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 删除商品
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001'
    const client = getSupabaseClient()
    const { id } = await params

    const { error } = await client
      .from('products')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw new Error(`删除商品失败: ${error.message}`)

    return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
