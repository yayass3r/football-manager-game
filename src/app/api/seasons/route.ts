import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get current active season, or create one if none exists
    let currentSeason = await db.season.findFirst({
      where: { status: 'active' },
      orderBy: { number: 'desc' },
    })

    if (!currentSeason) {
      // Create the first season
      const now = new Date()
      const endDate = new Date(now)
      endDate.setDate(endDate.getDate() + 30) // 30 day season

      currentSeason = await db.season.create({
        data: {
          number: 1,
          name: 'الموسم الأول',
          startDate: now,
          endDate: endDate,
          status: 'active',
        },
      })
    }

    // Check if season has ended
    const now = new Date()
    if (now > currentSeason.endDate && currentSeason.status === 'active') {
      await db.season.update({
        where: { id: currentSeason.id },
        data: { status: 'ended' },
      })
      currentSeason = { ...currentSeason, status: 'ended' }
    }

    // Get season stats
    const totalClubs = await db.club.count()
    const seasonPoints = await db.club.findMany({
      select: { id: true, name: true, logo: true, seasonPoints: true, seasonNumber: true, title: true },
      orderBy: { seasonPoints: 'desc' },
      take: 10,
    })

    return NextResponse.json({
      success: true,
      data: {
        season: currentSeason,
        totalClubs,
        topClubs: seasonPoints,
        daysRemaining: currentSeason.status === 'active'
          ? Math.max(0, Math.ceil((currentSeason.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
          : 0,
      },
    })
  } catch (error) {
    console.error('Get seasons error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب بيانات الموسم' },
      { status: 500 }
    )
  }
}
