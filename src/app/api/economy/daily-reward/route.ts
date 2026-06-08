import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getDailyReward, canClaimDailyReward, encodeDailyClaim } from '@/lib/daily-rewards'

export async function GET(request: NextRequest) {
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

    const { canClaim, currentStreak, nextDay } = canClaimDailyReward(user.xp)
    const nextReward = getDailyReward(nextDay)

    return NextResponse.json({
      success: true,
      data: {
        canClaim,
        currentStreak,
        nextDay,
        nextReward,
      },
    })
  } catch (error) {
    console.error('Daily reward error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب المكافأة اليومية' },
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

    const user = await db.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    const { canClaim, nextDay } = canClaimDailyReward(user.xp)

    if (!canClaim) {
      return NextResponse.json(
        { success: false, error: 'لا يمكنك استلام المكافأة الآن. عد لاحقاً!' },
        { status: 400 }
      )
    }

    const reward = getDailyReward(nextDay)

    // Update user with reward and new streak
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        coins: { increment: reward.coins },
        gems: { increment: reward.gems },
        xp: encodeDailyClaim(nextDay),
      },
    })

    const { password: _, ...userWithoutPassword } = updatedUser

    return NextResponse.json({
      success: true,
      data: {
        reward,
        user: userWithoutPassword,
        streakDay: nextDay,
      },
    })
  } catch (error) {
    console.error('Claim daily reward error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في استلام المكافأة اليومية' },
      { status: 500 }
    )
  }
}
