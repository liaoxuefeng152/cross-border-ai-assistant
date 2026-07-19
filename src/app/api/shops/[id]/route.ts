import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 获取店铺详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001'
    const client = getSupabaseClient()
    const { id } = await params

    const { data: shop, error } = await client
      .from('shops')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle()

    if (error) throw new Error(`查询失败: ${error.message}`)

    if (!shop) {
      return NextResponse.json(
        { error: '店铺不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: shop
    })
  } catch (error) {
    console.error('Get shop error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 更新店铺
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

    if (body.shopName !== undefined) updateData.shop_name = body.shopName
    if (body.status !== undefined) updateData.status = body.status
    if (body.token !== undefined) updateData.token = body.token
    if (body.data !== undefined) updateData.data = body.data

    const { data: shop, error } = await client
      .from('shops')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw new Error(`更新店铺失败: ${error.message}`)

    return NextResponse.json({
      success: true,
      data: shop
    })
  } catch (error) {
    console.error('Update shop error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 删除店铺
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001'
    const client = getSupabaseClient()
    const { id } = await params

    const { error } = await client
      .from('shops')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw new Error(`删除店铺失败: ${error.message}`)

    return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error('Delete shop error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
