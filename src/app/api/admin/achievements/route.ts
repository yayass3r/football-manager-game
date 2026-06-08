import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/prisma-rest'

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
      orderBy: { category: 'asc' },
    })

    // Get unlock counts
    const achievementIds = achievements.map((a: any) => a.achievementId)
    const unlockCounts: Record<string, number> = {}
    
    if (achievementIds.length > 0) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (supabaseUrl && supabaseKey) {
        const url = `${supabaseUrl}/rest/v1/user_achievements?select=achievement_id&achievement_id=in.(${achievementIds.join(',')})&unlocked=eq.true`
        const res = await fetch(url, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
        })
        if (res.ok) {
          const data = await res.json()
          for (const row of data) {
            unlockCounts[row.achievement_id] = (unlockCounts[row.achievement_id] || 0) + 1
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: achievements.map((a: any) => ({
        id: a.id,
        achievementId: a.achievementId,
        name: a.name,
        description: a.description,
        icon: a.icon,
        category: a.category,
        requirement: a.requirement,
        rewardCoins: a.rewardCoins,
        rewardGems: a.rewardGems,
        rewardTitle: a.rewardTitle,
        unlockedCount: unlockCounts[a.achievementId] || 0,
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
        description: body.description,
        icon: body.icon || '🏆',
        category: body.category,
        requirement: body.requirement || 1,
        rewardCoins: body.rewardCoins || 0,
        rewardGems: body.rewardGems || 0,
        rewardTitle: body.rewardTitle,
      },
    })

    return NextResponse.json({ success: true, data: achievement })
  } catch (error) {
    console.error('Admin achievement create error:', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}
