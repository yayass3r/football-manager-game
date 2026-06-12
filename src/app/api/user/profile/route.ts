import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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
      include: {
        club: true,
        achievements: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    // Get club with players separately since nested include isn't fully supported
    let clubWithPlayers = null
    if (user.club) {
      const club = Array.isArray(user.club) ? user.club[0] : user.club
      if (club) {
        const players = await db.player.findMany({
          where: { clubId: club.id },
        })
        // Sort: starters first
        players.sort((a: any, b: any) => (b.isStarter ? 1 : 0) - (a.isStarter ? 1 : 0))
        clubWithPlayers = { ...club, players }
      }
    }

    const { password: _, ...userWithoutPassword } = user

    const responseData = {
      ...userWithoutPassword,
      club: clubWithPlayers,
    }

    return NextResponse.json({
      success: true,
      data: responseData,
    })
  } catch (error) {
    console.error('Profile error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب الملف الشخصي' },
      { status: 500 }
    )
  }
}
