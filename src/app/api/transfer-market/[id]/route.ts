import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id')
    const { id: listingId } = await params

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      )
    }

    const listing = await db.transferListing.findUnique({
      where: { id: listingId },
    })

    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'القائمة غير موجودة' },
        { status: 404 }
      )
    }

    if (listing.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'لا يمكن إلغاء هذه القائمة' },
        { status: 400 }
      )
    }

    // Verify ownership
    const userClub = await db.club.findUnique({
      where: { userId },
    })

    if (!userClub || listing.sellerClubId !== userClub.id) {
      return NextResponse.json(
        { success: false, error: 'لا يمكنك إلغاء قائمة لا تخصك' },
        { status: 403 }
      )
    }

    await db.transferListing.update({
      where: { id: listingId },
      data: { status: 'cancelled' },
    })

    return NextResponse.json({
      success: true,
      data: { message: 'تم إلغاء القائمة بنجاح' },
    })
  } catch (error) {
    console.error('Cancel listing error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في إلغاء القائمة' },
      { status: 500 }
    )
  }
}
