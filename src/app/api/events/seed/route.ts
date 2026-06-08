import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    const now = new Date()

    // Delete old events before seeding new ones
    await db.gameEvent.deleteMany({})

    const events = [
      {
        type: 'transfer_window',
        title: 'نافذة انتقالات مزدوجة',
        description: 'مكافآت انتقالات مضاعفة لمدة 24 ساعة! احصل على ضعف المبلغ عند بيع اللاعبين',
        startDate: now,
        endDate: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24h
        isActive: true,
      },
      {
        type: 'special_tournament',
        title: 'بطولة نهاية الأسبوع',
        description: 'بطولة خاصة بنهاية الأسبوع بجوائز مضاعفة! سجل الآن',
        startDate: new Date(now.getTime() + 12 * 60 * 60 * 1000), // starts in 12h
        endDate: new Date(now.getTime() + 60 * 60 * 60 * 1000), // ends in ~2.5 days
        isActive: true,
      },
      {
        type: 'double_rewards',
        title: 'مكافآت مضاعفة',
        description: 'مكافآت المباريات مضاعفة لمدة 6 ساعات! العب الآن واحصل على ضعف المكافآت',
        startDate: now,
        endDate: new Date(now.getTime() + 6 * 60 * 60 * 1000), // 6h
        isActive: true,
      },
    ]

    await db.gameEvent.createMany({
      data: events,
    })

    const createdEvents = await db.gameEvent.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: createdEvents,
    })
  } catch (error) {
    console.error('Seed events error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في إنشاء الأحداث' },
      { status: 500 }
    )
  }
}
