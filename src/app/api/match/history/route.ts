import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      )
    }

    const userClub = await db.club.findUnique({
      where: { userId },
    })

    if (!userClub) {
      return NextResponse.json(
        { success: false, error: 'لم يتم العثور على النادي' },
        { status: 404 }
      )
    }

    const matches = await db.match.findMany({
      where: {
        OR: [
          { homeClubId: userClub.id },
          { awayClubId: userClub.id },
        ],
        status: 'completed',
      },
      include: {
        homeClub: {
          select: { id: true, name: true, logo: true },
        },
        awayClub: {
          select: { id: true, name: true, logo: true },
        },
      },
      orderBy: { playedAt: 'desc' },
      take: 50,
    })

    const matchHistory = matches.map(match => ({
      ...match,
      events: JSON.parse(match.events),
      isHome: match.homeClubId === userClub.id,
      result: match.homeClubId === userClub.id
        ? match.homeGoals > match.awayGoals ? 'win' : match.homeGoals < match.awayGoals ? 'loss' : 'draw'
        : match.awayGoals > match.homeGoals ? 'win' : match.awayGoals < match.homeGoals ? 'loss' : 'draw',
    }))

    return NextResponse.json({
      success: true,
      data: matchHistory,
    })
  } catch (error) {
    console.error('Match history error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب سجل المباريات' },
      { status: 500 }
    )
  }
}
