import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    // Check if tournaments already exist
    const existingCount = await db.tournament.count()

    if (existingCount > 0) {
      return NextResponse.json({
        success: true,
        data: { message: 'البطولات موجودة بالفعل', count: existingCount },
      })
    }

    // Create default tournaments
    const tournaments = await db.$transaction([
      db.tournament.create({
        data: {
          name: 'الدوري المحلي',
          type: 'league',
          tier: 1,
          maxTeams: 16,
          prize: 10000,
          prizeGems: 0,
          season: 1,
          status: 'registration',
        },
      }),
      db.tournament.create({
        data: {
          name: 'كأس الاتحاد',
          type: 'cup',
          tier: 2,
          maxTeams: 32,
          prize: 25000,
          prizeGems: 0,
          season: 1,
          status: 'registration',
        },
      }),
      db.tournament.create({
        data: {
          name: 'دوري الأبطال',
          type: 'champions',
          tier: 3,
          maxTeams: 16,
          prize: 50000,
          prizeGems: 100,
          season: 1,
          status: 'registration',
        },
      }),
      db.tournament.create({
        data: {
          name: 'كأس السوبر',
          type: 'super',
          tier: 4,
          maxTeams: 8,
          prize: 100000,
          prizeGems: 200,
          season: 1,
          status: 'registration',
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: tournaments,
    })
  } catch (error) {
    console.error('Seed tournaments error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في إنشاء البطولات' },
      { status: 500 }
    )
  }
}
