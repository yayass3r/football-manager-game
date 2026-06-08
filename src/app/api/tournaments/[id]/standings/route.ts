import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tournamentId } = await params

    const tournament = await db.tournament.findUnique({
      where: { id: tournamentId },
    })

    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'البطولة غير موجودة' },
        { status: 404 }
      )
    }

    const standings = await db.tournamentParticipant.findMany({
      where: { tournamentId },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
      orderBy: [
        { points: 'desc' },
        { gf: 'desc' },
        { ga: 'asc' },
        { won: 'desc' },
      ],
    })

    // Calculate goal difference
    const standingsWithGD = standings.map((s, index) => ({
      ...s,
      gd: s.gf - s.ga,
      position: index + 1,
    }))

    return NextResponse.json({
      success: true,
      data: {
        tournament,
        standings: standingsWithGD,
      },
    })
  } catch (error) {
    console.error('Get standings error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب الترتيب' },
      { status: 500 }
    )
  }
}
