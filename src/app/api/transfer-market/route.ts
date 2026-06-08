import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const listings = await db.transferListing.findMany({
      where: { status: 'active' },
      include: {
        player: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: listings,
    })
  } catch (error) {
    console.error('Get transfer market error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب سوق الانتقالات' },
      { status: 500 }
    )
  }
}
