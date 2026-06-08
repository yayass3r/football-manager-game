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
    const position = searchParams.get('position') || ''
    const minOverall = parseInt(searchParams.get('minOverall') || '0')
    const clubId = searchParams.get('clubId') || ''

    const where: any = {}
    if (search) {
      where.name = { contains: search }
    }
    if (position) {
      where.position = position
    }
    if (minOverall > 0) {
      where.overall = { gte: minOverall }
    }
    if (clubId) {
      where.clubId = clubId
    }

    const [players, total] = await Promise.all([
      prisma.player.findMany({
        where,
        include: {
          club: { select: { id: true, name: true, logo: true, primaryColor: true } },
        },
        orderBy: { overall: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.player.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: players,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Admin players list error:', error)
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

    const player = await prisma.player.create({
      data: {
        name: body.name,
        position: body.position,
        nationality: body.nationality || 'عالمي',
        age: body.age || 22,
        overall: body.overall || 70,
        pace: body.pace || 70,
        shooting: body.shooting || 70,
        passing: body.passing || 70,
        dribbling: body.dribbling || 70,
        defending: body.defending || 70,
        physical: body.physical || 70,
        potential: body.potential || body.overall || 70,
        value: body.value || (body.overall || 70) * 1000,
        salary: body.salary || (body.overall || 70) * 100,
        morale: body.morale || 75,
        fitness: body.fitness || 100,
        form: body.form || 75,
        isStarter: body.isStarter || false,
        shirtNumber: body.shirtNumber || null,
        clubId: body.clubId,
      },
    })

    return NextResponse.json({ success: true, data: player })
  } catch (error) {
    console.error('Admin player create error:', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}
