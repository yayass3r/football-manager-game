import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      )
    }

    // Get user's club
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { club: true },
    })

    if (!user || !user.club) {
      return NextResponse.json(
        { success: false, error: 'لم يتم العثور على المستخدم أو النادي' },
        { status: 404 }
      )
    }

    // End current season
    const currentSeason = await db.season.findFirst({
      where: { status: 'active' },
      orderBy: { number: 'desc' },
    })

    if (currentSeason) {
      await db.season.update({
        where: { id: currentSeason.id },
        data: { status: 'ended' },
      })
    }

    // Create new season
    const nextNumber = currentSeason ? currentSeason.number + 1 : 1
    const now = new Date()
    const endDate = new Date(now)
    endDate.setDate(endDate.getDate() + 30)

    const newSeason = await db.season.create({
      data: {
        number: nextNumber,
        name: `الموسم ${nextNumber}`,
        startDate: now,
        endDate: endDate,
        status: 'active',
      },
    })

    // Reset season points for the user's club and increment season number
    await db.club.update({
      where: { id: user.club.id },
      data: {
        seasonPoints: 0,
        seasonNumber: nextNumber,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        previousSeason: currentSeason,
        newSeason,
        message: `تم الانتقال إلى الموسم ${nextNumber}`,
      },
    })
  } catch (error) {
    console.error('Advance season error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في الانتقال للموسم التالي' },
      { status: 500 }
    )
  }
}
