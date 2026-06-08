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
    const filter = searchParams.get('filter') || 'all' // all, banned, admin

    const where: any = {}
    if (search) {
      where.username = { contains: search }
    }
    if (filter === 'banned') where.isBanned = true
    if (filter === 'admin') where.isAdmin = true

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          club: {
            select: { id: true, name: true, logo: true, primaryColor: true, reputation: true, wins: true, losses: true, draws: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: users.map(u => ({
        id: u.id,
        username: u.username,
        coins: u.coins,
        gems: u.gems,
        level: u.level,
        xp: u.xp,
        avatar: u.avatar,
        isBanned: u.isBanned,
        banReason: u.banReason,
        isAdmin: u.isAdmin,
        totalWins: u.totalWins,
        totalTrophies: u.totalTrophies,
        createdAt: u.createdAt,
        club: u.club,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Admin users list error:', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}
