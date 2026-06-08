import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const tournaments = await db.tournament.findMany({
      include: {
        _count: {
          select: { participants: true },
        },
      },
      orderBy: { tier: 'asc' },
    })

    const tournamentsWithCount = tournaments.map(t => ({
      ...t,
      currentTeams: t._count.participants,
    }))

    return NextResponse.json({
      success: true,
      data: tournamentsWithCount,
    })
  } catch (error) {
    console.error('Get tournaments error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب البطولات' },
      { status: 500 }
    )
  }
}
