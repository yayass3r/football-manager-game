import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get all active events
    const now = new Date()
    const events = await db.gameEvent.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { endDate: 'asc' },
    })

    return NextResponse.json({
      success: true,
      data: events,
    })
  } catch (error) {
    console.error('Get events error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب الأحداث' },
      { status: 500 }
    )
  }
}
