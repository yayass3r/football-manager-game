import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const AD_REWARD_COINS = 200
const AD_REWARD_GEMS = 5
const COOLDOWN_MS = 30 * 60 * 1000 // 30 minutes

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    // Cooldown check: use a separate localStorage key on client
    // For server-side, we check last update time as a rough proxy
    // A more robust solution would use a dedicated `lastAdWatch` field
    const now = new Date()
    const lastUpdate = user.updatedAt ? new Date(user.updatedAt) : new Date(0)
    const msSinceLastUpdate = now.getTime() - lastUpdate.getTime()

    if (msSinceLastUpdate < COOLDOWN_MS) {
      const remainingMinutes = Math.ceil((COOLDOWN_MS - msSinceLastUpdate) / 60000)
      return NextResponse.json(
        { success: false, error: `انتظر ${remainingMinutes} دقيقة قبل مشاهدة إعلان آخر` },
        { status: 400 }
      )
    }

    // Grant ad reward
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        coins: { increment: AD_REWARD_COINS },
        gems: { increment: AD_REWARD_GEMS },
      },
    })

    const { password: _, ...userWithoutPassword } = updatedUser

    return NextResponse.json({
      success: true,
      data: {
        coins: AD_REWARD_COINS,
        gems: AD_REWARD_GEMS,
        user: userWithoutPassword,
      },
    })
  } catch (error) {
    console.error('Watch ad error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في مشاهدة الإعلان' },
      { status: 500 }
    )
  }
}
