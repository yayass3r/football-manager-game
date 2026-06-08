import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const defaultPacks = [
  {
    name: 'حزمة البرونزية',
    type: 'bronze',
    price: 1000,
    gemPrice: 0,
    description: 'حزمة تحتوي على لاعب بمستوى برونزي (55-69)',
    minOverall: 55,
    maxOverall: 69,
    playerCount: 1,
  },
  {
    name: 'حزمة الفضية',
    type: 'silver',
    price: 3000,
    gemPrice: 0,
    description: 'حزمة تحتوي على لاعب بمستوى فضي (68-79)',
    minOverall: 68,
    maxOverall: 79,
    playerCount: 1,
  },
  {
    name: 'حزمة الذهبية',
    type: 'gold',
    price: 7500,
    gemPrice: 0,
    description: 'حزمة تحتوي على لاعبين بمستوى ذهبي (75-85)',
    minOverall: 75,
    maxOverall: 85,
    playerCount: 2,
  },
  {
    name: 'حزمة الأسطورية',
    type: 'legendary',
    price: 0,
    gemPrice: 50,
    description: 'حزمة تحتوي على لاعب أسطوري (82-94)',
    minOverall: 82,
    maxOverall: 94,
    playerCount: 1,
  },
]

export async function GET(request: NextRequest) {
  try {
    let packs = await db.playerPack.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    })

    // Seed default packs if none exist
    if (packs.length === 0) {
      packs = await db.playerPack.createMany({
        data: defaultPacks,
      })
      packs = await db.playerPack.findMany({
        where: { isActive: true },
        orderBy: { price: 'asc' },
      })
    }

    return NextResponse.json({
      success: true,
      data: packs,
    })
  } catch (error) {
    console.error('Get packs error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب الحزم' },
      { status: 500 }
    )
  }
}
