import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const body = await request.json()
    const { playerId, price } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      )
    }

    if (!playerId || !price || price <= 0) {
      return NextResponse.json(
        { success: false, error: 'معرف اللاعب والسعر مطلوبان' },
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

    const userClub = await db.club.findUnique({
      where: { userId },
    })

    if (!userClub || player.clubId !== userClub.id) {
      return NextResponse.json(
        { success: false, error: 'هذا اللاعب ليس في ناديك' },
        { status: 403 }
      )
    }

    // Check if player is already listed
    const existingListing = await db.transferListing.findFirst({
      where: { playerId, status: 'active' },
    })

    if (existingListing) {
      return NextResponse.json(
        { success: false, error: 'اللاعب مدرج بالفعل في سوق الانتقالات' },
        { status: 409 }
      )
    }

    // Check minimum squad size (need at least 11 players)
    const squadCount = await db.player.count({
      where: { clubId: userClub.id },
    })

    if (squadCount <= 11) {
      return NextResponse.json(
        { success: false, error: 'لا يمكنك بيع اللاعب، تحتاج 11 لاعب على الأقل في الفريق' },
        { status: 400 }
      )
    }

    const listing = await db.transferListing.create({
      data: {
        playerId,
        sellerClubId: userClub.id,
        price,
      },
      include: {
        player: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: listing,
    })
  } catch (error) {
    console.error('Sell player error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في عرض اللاعب للبيع' },
      { status: 500 }
    )
  }
}
