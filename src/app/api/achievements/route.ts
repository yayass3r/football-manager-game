import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const defaultAchievements = [
  { achievementId: 'first_win', name: 'أول فوز', description: 'افز مباراة واحدة', icon: '🏆', category: 'matches', requirement: 1, rewardCoins: 500, rewardGems: 0, rewardTitle: null },
  { achievementId: '10_wins', name: 'عشر انتصارات', description: 'افز 10 مباريات', icon: '🥇', category: 'matches', requirement: 10, rewardCoins: 2000, rewardGems: 0, rewardTitle: null },
  { achievementId: '50_wins', name: 'خمسون انتصاراً', description: 'افز 50 مباراة', icon: '👑', category: 'matches', requirement: 50, rewardCoins: 10000, rewardGems: 50, rewardTitle: null },
  { achievementId: 'league_champion', name: 'بطل الدوري', description: 'افز بطولة دوري', icon: '🏅', category: 'tournaments', requirement: 1, rewardCoins: 5000, rewardGems: 0, rewardTitle: 'بطل الدوري' },
  { achievementId: 'champions_winner', name: 'بطل الأبطال', description: 'افز دوري أبطال', icon: '⭐', category: 'tournaments', requirement: 1, rewardCoins: 15000, rewardGems: 100, rewardTitle: 'بطل الأبطال' },
  { achievementId: 'scout', name: 'صائد المواهب', description: 'اشترِ 5 لاعبين من السوق', icon: '🔍', category: 'transfers', requirement: 5, rewardCoins: 1000, rewardGems: 0, rewardTitle: null },
  { achievementId: 'negotiator', name: 'المفاوض', description: 'بع 5 لاعبين', icon: '🤝', category: 'transfers', requirement: 5, rewardCoins: 1000, rewardGems: 0, rewardTitle: null },
  { achievementId: 'skilled_trainer', name: 'مدرب ماهر', description: 'درب اللاعبين 20 مرة', icon: '📋', category: 'training', requirement: 20, rewardCoins: 2000, rewardGems: 0, rewardTitle: null },
  { achievementId: 'legend_trainer', name: 'أسطورة التدريب', description: 'درب اللاعبين 100 مرة', icon: '🏋️', category: 'training', requirement: 100, rewardCoins: 5000, rewardGems: 0, rewardTitle: 'مدرب أسطوري' },
  { achievementId: 'top_scorer', name: 'هداف', description: 'سجل 50 هدفاً', icon: '⚽', category: 'matches', requirement: 50, rewardCoins: 3000, rewardGems: 0, rewardTitle: null },
  { achievementId: 'iron_defense', name: 'دفاع حديدي', description: 'لا تستقبل أهدافاً في 5 مباريات', icon: '🛡️', category: 'matches', requirement: 5, rewardCoins: 2000, rewardGems: 0, rewardTitle: null },
  { achievementId: 'draw_master', name: 'سيد التعادلات', description: 'تعادل في 10 مباريات', icon: '⚖️', category: 'matches', requirement: 10, rewardCoins: 500, rewardGems: 0, rewardTitle: null },
  { achievementId: 'rich', name: 'ثري', description: 'امتلك أكثر من 50000 عملة', icon: '💰', category: 'special', requirement: 50000, rewardCoins: 1000, rewardGems: 0, rewardTitle: null },
  { achievementId: 'gem_collector', name: 'جامع الجواهر', description: 'امتلك أكثر من 200 جوهرة', icon: '💎', category: 'special', requirement: 200, rewardCoins: 0, rewardGems: 50, rewardTitle: null },
  { achievementId: 'stadium_owner', name: 'صاحب الملعب', description: 'قم بتطوير الملعب إلى المستوى 5', icon: '🏟️', category: 'special', requirement: 5, rewardCoins: 10000, rewardGems: 0, rewardTitle: 'صاحب الملعب' },
  { achievementId: 'perfect_season', name: 'موسم مثالي', description: 'افز جميع مباريات الموسم', icon: '🌟', category: 'special', requirement: 1, rewardCoins: 20000, rewardGems: 200, rewardTitle: 'الموسم المثالي' },
]

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      )
    }

    // Ensure default achievements exist
    let achievements = await db.achievement.findMany()
    if (achievements.length === 0) {
      await db.achievement.createMany({
        data: defaultAchievements,
      })
      achievements = await db.achievement.findMany()
    }

    // Get user's achievement unlocks
    const userAchievements = await db.userAchievement.findMany({
      where: { userId },
    })

    const userAchievementMap = new Map(
      userAchievements.map(ua => [ua.achievementId, ua])
    )

    // Combine achievements with user status
    const achievementsWithStatus = achievements.map(achievement => {
      const userAch = userAchievementMap.get(achievement.achievementId)
      return {
        ...achievement,
        unlocked: userAch?.unlocked || false,
        claimed: userAch?.claimed || false,
        unlockedAt: userAch?.unlockedAt || null,
      }
    })

    return NextResponse.json({
      success: true,
      data: achievementsWithStatus,
    })
  } catch (error) {
    console.error('Get achievements error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب الإنجازات' },
      { status: 500 }
    )
  }
}
