import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const AD_REWARD_COINS = 200
const AD_REWARD_GEMS = 5
const COOLDOWN_MINUTES = 30

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

    // Simple cooldown check using level field as a timestamp hack
    // In a real app, you'd have a separate field or table
    // We use the updatedAt as a rough proxy - users can watch ad every 30 minutes
    const now = new Date()
    const lastUpdate = user.updatedAt
    const minutesSinceLastUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60)

    if (minutesSinceLastUpdate < COOLDOWN_MINUTES) {
      const remainingMinutes = Math.ceil(COOLDOWN_MINUTES - minutesSinceLastUpdate)
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
