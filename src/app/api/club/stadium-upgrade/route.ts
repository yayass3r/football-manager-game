import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const STADIUM_UPGRADE_COSTS: Record<number, { coins: number; gems: number }> = {
  1: { coins: 5000, gems: 10 },
  2: { coins: 15000, gems: 25 },
  3: { coins: 40000, gems: 50 },
  4: { coins: 100000, gems: 100 },
  5: { coins: 250000, gems: 200 },
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

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ success: false, error: 'المستخدم غير موجود' }, { status: 404 })
    }

    const club = await db.club.findUnique({ where: { userId } })
    if (!club) {
      return NextResponse.json({ success: false, error: 'ليس لديك نادي' }, { status: 404 })
    }

    if (club.stadiumLevel >= 5) {
      return NextResponse.json({ success: false, error: 'الملعب في أعلى مستوى بالفعل!' }, { status: 400 })
    }

    const cost = STADIUM_UPGRADE_COSTS[club.stadiumLevel]
    if (!cost) {
      return NextResponse.json({ success: false, error: 'لا يمكن ترقية الملعب' }, { status: 400 })
    }

    if (user.coins < cost.coins || user.gems < cost.gems) {
      return NextResponse.json(
        { success: false, error: `تحتاج ${cost.coins.toLocaleString()} عملة و ${cost.gems} جوهرة للترقية` },
        { status: 400 }
      )
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { coins: { decrement: cost.coins }, gems: { decrement: cost.gems } },
    })

    const updatedClub = await db.club.update({
      where: { id: club.id },
      data: { stadiumLevel: club.stadiumLevel + 1, reputation: Math.min(100, club.reputation + 5) },
    })

    const { password: _, ...userWithoutPassword } = updatedUser

    return NextResponse.json({
      success: true,
      data: { club: updatedClub, user: userWithoutPassword, newLevel: updatedClub.stadiumLevel, cost },
    })
  } catch (error) {
    console.error('Stadium upgrade error:', error)
    return NextResponse.json({ success: false, error: 'حدث خطأ في ترقية الملعب' }, { status: 500 })
  }
}
