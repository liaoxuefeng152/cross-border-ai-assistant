import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001'
    const client = getSupabaseClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: '缺少收藏 ID' },
        { status: 400 }
      )
    }

    const { error } = await client
      .from('favorites')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw new Error(`取消收藏失败: ${error.message}`)

    return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error('Delete favorite error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
