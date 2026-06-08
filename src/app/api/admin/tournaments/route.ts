import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

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

    const tournaments = await prisma.tournament.findMany({
      include: {
        _count: { select: { participants: true, matches: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: tournaments.map(t => ({
        id: t.id,
        name: t.name,
        type: t.type,
        tier: t.tier,
        maxTeams: t.maxTeams,
        prize: t.prize,
        prizeGems: t.prizeGems,
        season: t.season,
        status: t.status,
        participantCount: t._count.participants,
        matchCount: t._count.matches,
        createdAt: t.createdAt,
      })),
    })
  } catch (error) {
    console.error('Admin tournaments list error:', error)
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

    const tournament = await prisma.tournament.create({
      data: {
        name: body.name,
        type: body.type || 'league',
        tier: body.tier || 1,
        maxTeams: body.maxTeams || 16,
        prize: body.prize || 5000,
        prizeGems: body.prizeGems || 0,
        season: body.season || 1,
        status: body.status || 'registration',
      },
    })

    return NextResponse.json({ success: true, data: tournament })
  } catch (error) {
    console.error('Admin tournament create error:', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}
