import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'global'

    const entries = await db.leaderboardEntry.findMany({
      where: { type },
      include: {
        user: {
          select: { id: true, username: true, avatar: true, level: true },
        },
        club: {
          select: { id: true, name: true, logo: true, title: true, wins: true, draws: true, goalsFor: true, reputation: true },
        },
      },
      orderBy: { score: 'desc' },
      take: 50,
    })

    // Recalculate ranks based on order
    const rankedEntries = entries.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }))

    return NextResponse.json({
      success: true,
      data: rankedEntries,
    })
  } catch (error) {
    console.error('Get leaderboard error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب لوحة المتصدرين' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { type = 'global', seasonId } = body

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

    const club = user.club
    // Calculate score = club.wins * 3 + club.draws + club.goalsFor + club.reputation
    const score = club.wins * 3 + club.draws + club.goalsFor + club.reputation

    // Upsert leaderboard entry
    const existingEntry = await db.leaderboardEntry.findFirst({
      where: { userId, clubId: club.id, type, seasonId: seasonId || null },
    })

    if (existingEntry) {
      await db.leaderboardEntry.update({
        where: { id: existingEntry.id },
        data: { score },
      })
    } else {
      await db.leaderboardEntry.create({
        data: {
          userId,
          clubId: club.id,
          seasonId: seasonId || null,
          type,
          score,
        },
      })
    }

    // Recalculate ranks for all entries of this type
    const allEntries = await db.leaderboardEntry.findMany({
      where: { type },
      orderBy: { score: 'desc' },
    })

    for (let i = 0; i < allEntries.length; i++) {
      await db.leaderboardEntry.update({
        where: { id: allEntries[i].id },
        data: { rank: i + 1 },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        score,
        rank: allEntries.findIndex(e => e.userId === userId && e.clubId === club.id) + 1,
        type,
      },
    })
  } catch (error) {
    console.error('Update leaderboard error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في تحديث لوحة المتصدرين' },
      { status: 500 }
    )
  }
}
