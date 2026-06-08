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

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''

    const where: any = {}
    if (search) {
      where.name = { contains: search }
    }

    const [clubs, total] = await Promise.all([
      prisma.club.findMany({
        where,
        include: {
          user: { select: { id: true, username: true, isBanned: true } },
        },
        orderBy: { reputation: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.club.count({ where }),
    ])

    // Get player counts for each club
    const clubIds = clubs.map((c: any) => c.id)
    const playerCounts: Record<string, number> = {}
    if (clubIds.length > 0) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (supabaseUrl && supabaseKey) {
        const url = `${supabaseUrl}/rest/v1/players?select=club_id&club_id=in.(${clubIds.join(',')})`
        const res = await fetch(url, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
        })
        if (res.ok) {
          const data = await res.json()
          for (const row of data) {
            playerCounts[row.club_id] = (playerCounts[row.club_id] || 0) + 1
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: clubs.map((c: any) => ({
        id: c.id,
        name: c.name,
        logo: c.logo,
        primaryColor: c.primaryColor,
        secondaryColor: c.secondaryColor,
        formation: c.formation,
        morale: c.morale,
        reputation: c.reputation,
        wins: c.wins,
        draws: c.draws,
        losses: c.losses,
        goalsFor: c.goalsFor,
        goalsAgainst: c.goalsAgainst,
        stadiumName: c.stadiumName,
        stadiumLevel: c.stadiumLevel,
        kitStyle: c.kitStyle,
        kitPattern: c.kitPattern,
        seasonPoints: c.seasonPoints,
        playerCount: playerCounts[c.id] || 0,
        owner: c.user,
        createdAt: c.createdAt,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Admin clubs list error:', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}
