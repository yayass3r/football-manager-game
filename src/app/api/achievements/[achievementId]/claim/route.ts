import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ achievementId: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      )
    }

    const { achievementId } = await params

    // Get the user achievement record
    const userAchievement = await db.userAchievement.findFirst({
      where: { userId, achievementId },
      include: { achievement: true },
    })

    if (!userAchievement) {
      return NextResponse.json(
        { success: false, error: 'الإنجاز غير موجود' },
        { status: 404 }
      )
    }

    if (!userAchievement.unlocked) {
      return NextResponse.json(
        { success: false, error: 'لم يتم فتح هذا الإنجاز بعد' },
        { status: 400 }
      )
    }

    if (userAchievement.claimed) {
      return NextResponse.json(
        { success: false, error: 'تم استلام مكافأة هذا الإنجاز مسبقاً' },
        { status: 400 }
      )
    }

    const achievement = userAchievement.achievement

    // Claim rewards
    const updateData: { coins?: { increment: number }; gems?: { increment: number } } = {}
    if (achievement.rewardCoins > 0) updateData.coins = { increment: achievement.rewardCoins }
    if (achievement.rewardGems > 0) updateData.gems = { increment: achievement.rewardGems }

    // Update user with rewards
    if (Object.keys(updateData).length > 0) {
      await db.user.update({
        where: { id: userId },
        data: updateData,
      })
    }

    // If achievement grants a title, update the club
    if (achievement.rewardTitle) {
      const user = await db.user.findUnique({
        where: { id: userId },
        include: { club: true },
      })
      if (user?.club) {
        await db.club.update({
          where: { id: user.club.id },
          data: { title: achievement.rewardTitle },
        })
      }
    }

    // Mark as claimed
    await db.userAchievement.update({
      where: { id: userAchievement.id },
      data: { claimed: true },
    })

    return NextResponse.json({
      success: true,
      data: {
        achievement,
        rewardCoins: achievement.rewardCoins,
        rewardGems: achievement.rewardGems,
        rewardTitle: achievement.rewardTitle,
      },
    })
  } catch (error) {
    console.error('Claim achievement error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في استلام مكافأة الإنجاز' },
      { status: 500 }
    )
  }
}
