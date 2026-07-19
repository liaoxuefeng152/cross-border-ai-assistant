import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 获取素材列表
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001'
    const client = getSupabaseClient()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    let query = client
      .from('assets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (type) {
      query = query.eq('type', type)
    }

    const { data: assets, error } = await query

    if (error) throw new Error(`获取素材列表失败: ${error.message}`)

    return NextResponse.json({
      success: true,
      data: assets || []
    })
  } catch (error) {
    console.error('Get assets error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 上传素材
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001'
    const client = getSupabaseClient()
    const body = await request.json()

    const { name, type, url, thumbnail, size, productId } = body

    if (!name || !type || !url) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    const { data: asset, error } = await client
      .from('assets')
      .insert({
        user_id: userId,
        name,
        type,
        url,
        thumbnail,
        size,
        product_id: productId,
      })
      .select()
      .single()

    if (error) throw new Error(`上传素材失败: ${error.message}`)

    return NextResponse.json({
      success: true,
      data: asset
    })
  } catch (error) {
    console.error('Upload asset error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
