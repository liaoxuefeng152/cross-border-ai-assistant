import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'
import { uploadFile, uploadFromUrl, getSignedUrl } from '@/lib/storage'

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

    // Generate signed URLs for assets that have keys (not full URLs)
    const assetsWithUrls = await Promise.all(
      (assets || []).map(async (asset) => {
        // If URL is already a full URL (http), return as-is
        if (asset.url && asset.url.startsWith('http')) {
          return asset;
        }
        // Otherwise, generate signed URL from key
        const signedUrl = await getSignedUrl(asset.url);
        return {
          ...asset,
          url: signedUrl,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: assetsWithUrls
    })
  } catch (error) {
    console.error('Get assets error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 上传素材（支持文件上传和 URL 两种方式）
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001'
    const client = getSupabaseClient()
    const contentType = request.headers.get('content-type') || ''

    let name: string, type: string, url: string, thumbnail: string | undefined, size: number | undefined, productId: string | undefined

    if (contentType.includes('multipart/form-data')) {
      // 文件上传模式
      const formData = await request.formData()
      const file = formData.get('file') as File
      name = formData.get('name') as string || file.name
      type = formData.get('type') as string || (file.type.startsWith('video/') ? 'video' : 'image')
      productId = formData.get('productId') as string || undefined

      if (!file) {
        return NextResponse.json({ error: '请选择文件' }, { status: 400 })
      }

      // 上传到对象存储
      const buffer = Buffer.from(await file.arrayBuffer())
      const ext = file.name.split('.').pop() || 'bin'
      const key = `assets/${userId}/${Date.now()}.${ext}`

      await uploadFile(buffer, key, file.type)

      // 生成签名 URL
      url = await getSignedUrl(key)
      size = file.size
    } else {
      // JSON 模式（AI 生成的内容，已有 URL）
      const body = await request.json()
      name = body.name
      type = body.type
      url = body.url

      // If URL is from AI service, download and re-upload to object storage
      if (url && !url.includes('coze.site') && !url.includes('supabase.co')) {
        try {
          const key = await uploadFromUrl(url)
          url = await getSignedUrl(key)
        } catch (e) {
          console.warn('Failed to re-upload AI URL, using original:', e)
          // Keep original URL if re-upload fails
        }
      }

      thumbnail = body.thumbnail
      size = body.size
      productId = body.productId
    }

    if (!name || !type || !url) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    const truncatedName = name.length > 100 ? name.substring(0, 100) : name
    const truncatedUrl = url.length > 500 ? url.substring(0, 500) : url
    const truncatedThumbnail = thumbnail && thumbnail.length > 500 ? thumbnail.substring(0, 500) : thumbnail

    const { data: asset, error } = await client
      .from('assets')
      .insert({
        user_id: userId,
        name: truncatedName,
        type,
        url: truncatedUrl,
        thumbnail: truncatedThumbnail,
        size,
        product_id: productId,
        created_at: new Date().toISOString(),
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
