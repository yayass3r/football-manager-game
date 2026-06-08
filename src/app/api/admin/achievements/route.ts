import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAdmin(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return null
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || !user.isAdmin) return null
  return user
}

export async function GET(req: NextRequest) {
  try {
    const admin = await checkAdmin(req)
    if (!admin) {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })
    }

    const achievements = await prisma.achievement.findMany({
      include: {
        _count: { select: { userAchievements: true } },
      },
      orderBy: { category: 'asc' },
    })

    return NextResponse.json({
      success: true,
      data: achievements.map(a => ({
        ...a,
        unlockedCount: a._count.userAchievements,
      })),
    })
  } catch (error) {
    console.error('Admin achievements list error:', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await checkAdmin(req)
    if (!admin) {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })
    }

    const body = await req.json()

    const achievement = await prisma.achievement.create({
      data: {
        achievementId: body.achievementId,
        name: body.name,
        description: body.description || '',
        icon: body.icon || '🏅',
        category: body.category || 'special',
        requirement: body.requirement || 1,
        rewardCoins: body.rewardCoins || 0,
        rewardGems: body.rewardGems || 0,
        rewardTitle: body.rewardTitle || null,
      },
    })

    return NextResponse.json({ success: true, data: achievement })
  } catch (error) {
    console.error('Admin achievement create error:', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}
