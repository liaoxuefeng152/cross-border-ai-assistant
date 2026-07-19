import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001'
    const client = getSupabaseClient()
    const { id } = await params

    const { error } = await client
      .from('assets')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw new Error(`删除素材失败: ${error.message}`)

    return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error('Delete asset error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
