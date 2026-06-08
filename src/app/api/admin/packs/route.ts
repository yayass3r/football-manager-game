import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/prisma-rest'

const prisma = new PrismaClient()

async function checkAdmin(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return null
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || !user.isAdmin) return null
  return user
}

export async function GET(req: NextRequest) {
  try {
    const admin = await checkAdmin(req)
    if (!admin) {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })
    }

    const packs = await prisma.playerPack.findMany({
      orderBy: { price: 'asc' },
    })

    // Get opening counts
    const packIds = packs.map((p: any) => p.id)
    const openingCounts: Record<string, number> = {}
    
    if (packIds.length > 0) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (supabaseUrl && supabaseKey) {
        const url = `${supabaseUrl}/rest/v1/pack_openings?select=pack_id&pack_id=in.(${packIds.join(',')})`
        const res = await fetch(url, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
        })
        if (res.ok) {
          const data = await res.json()
          for (const row of data) {
            openingCounts[row.pack_id] = (openingCounts[row.pack_id] || 0) + 1
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: packs.map((p: any) => ({
        ...p,
        openingCount: openingCounts[p.id] || 0,
      })),
    })
  } catch (error) {
    console.error('Admin packs list error:', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await checkAdmin(req)
    if (!admin) {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })
    }

    const body = await req.json()

    const pack = await prisma.playerPack.create({
      data: {
        name: body.name,
        type: body.type,
        price: body.price,
        gemPrice: body.gemPrice || 0,
        description: body.description,
        minOverall: body.minOverall,
        maxOverall: body.maxOverall,
        playerCount: body.playerCount || 1,
        isActive: body.isActive !== undefined ? body.isActive : true,
      },
    })

    return NextResponse.json({ success: true, data: pack })
  } catch (error) {
    console.error('Admin pack create error:', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}
