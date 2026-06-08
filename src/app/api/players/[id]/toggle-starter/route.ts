import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id')
    const { id: playerId } = await params

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      )
    }

    // Find the player and verify ownership
    const player = await db.player.findUnique({
      where: { id: playerId },
      include: { club: true },
    })

    if (!player) {
      return NextResponse.json(
        { success: false, error: 'اللاعب غير موجود' },
        { status: 404 }
      )
    }

    // Verify the player belongs to the user's club
    const userClub = await db.club.findUnique({
      where: { userId },
    })

    if (!userClub || player.clubId !== userClub.id) {
      return NextResponse.json(
        { success: false, error: 'هذا اللاعب ليس في ناديك' },
        { status: 403 }
      )
    }

    // Toggle starter status
    const updatedPlayer = await db.player.update({
      where: { id: playerId },
      data: { isStarter: !player.isStarter },
    })

    // Count current starters to ensure max 11
    if (updatedPlayer.isStarter) {
      const starterCount = await db.player.count({
        where: { clubId: userClub.id, isStarter: true },
      })

      if (starterCount > 11) {
        // Revert if more than 11 starters
        await db.player.update({
          where: { id: playerId },
          data: { isStarter: false },
        })
        return NextResponse.json(
          { success: false, error: 'لا يمكن أن يكون هناك أكثر من 11 لاعب أساسي' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedPlayer,
    })
  } catch (error) {
    console.error('Toggle starter error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في تحديث حالة اللاعب' },
      { status: 500 }
    )
  }
}
