import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const body = await request.json()
    const { listingId } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      )
    }

    if (!listingId) {
      return NextResponse.json(
        { success: false, error: 'معرف القائمة مطلوب' },
        { status: 400 }
      )
    }

    // Find the listing
    const listing = await db.transferListing.findUnique({
      where: { id: listingId },
      include: { player: true },
    })

    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'القائمة غير موجودة' },
        { status: 404 }
      )
    }

    if (listing.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'هذه القائمة لم تعد متاحة' },
        { status: 400 }
      )
    }

    // Get buyer's club
    const buyerClub = await db.club.findUnique({
      where: { userId },
    })

    if (!buyerClub) {
      return NextResponse.json(
        { success: false, error: 'ليس لديك نادي' },
        { status: 404 }
      )
    }

    // Can't buy from yourself
    if (listing.sellerClubId === buyerClub.id) {
      return NextResponse.json(
        { success: false, error: 'لا يمكنك شراء لاعب من ناديك' },
        { status: 400 }
      )
    }

    // Check buyer has enough coins
    const buyer = await db.user.findUnique({
      where: { id: userId },
    })

    if (!buyer || buyer.coins < listing.price) {
      return NextResponse.json(
        { success: false, error: 'لا تملك عملات كافية' },
        { status: 400 }
      )
    }

    // Get seller's user
    const sellerClub = await db.club.findUnique({
      where: { id: listing.sellerClubId },
    })

    if (!sellerClub) {
      return NextResponse.json(
        { success: false, error: 'نادي البائع غير موجود' },
        { status: 404 }
      )
    }

    // Execute transfer in transaction
    await db.$transaction([
      // Update listing status
      db.transferListing.update({
        where: { id: listingId },
        data: { status: 'sold' },
      }),
      // Deduct coins from buyer
      db.user.update({
        where: { id: userId },
        data: { coins: { decrement: listing.price } },
      }),
      // Add coins to seller
      db.user.update({
        where: { id: sellerClub.userId },
        data: { coins: { increment: Math.floor(listing.price * 0.9) } }, // 10% commission
      }),
      // Transfer player to new club
      db.player.update({
        where: { id: listing.playerId },
        data: {
          clubId: buyerClub.id,
          isStarter: false,
          fitness: 100,
          morale: 75,
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        message: 'تم شراء اللاعب بنجاح',
        price: listing.price,
        commission: Math.floor(listing.price * 0.1),
        player: listing.player.name,
      },
    })
  } catch (error) {
    console.error('Buy player error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في شراء اللاعب' },
      { status: 500 }
    )
  }
}
