import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      )
    }

    // Get user with club
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { club: true },
    })

    if (!user || !user.club) {
      return NextResponse.json(
        { success: false, error: 'لم يتم العثور على المستخدم أو النادي' },
        { status: 404 }
      )
    }

    const club = user.club

    // Ensure achievements exist
    let achievements = await db.achievement.findMany()
    if (achievements.length === 0) {
      return NextResponse.json(
        { success: false, error: 'لم يتم تهيئة الإنجازات بعد' },
        { status: 400 }
      )
    }

    // Get user's existing achievement records
    const userAchievements = await db.userAchievement.findMany({
      where: { userId },
    })
    const userAchievementMap = new Map(
      userAchievements.map(ua => [ua.achievementId, ua])
    )

    // Calculate stats for achievement checking
    const stats: Record<string, number> = {
      wins: club.wins,
      draws: club.draws,
      goalsFor: club.goalsFor,
      goalsAgainst: club.goalsAgainst,
      coins: user.coins,
      gems: user.gems,
      stadiumLevel: club.stadiumLevel,
      totalWins: user.totalWins,
      totalTrophies: user.totalTrophies,
    }

    // Count transfers (sell from transfer market)
    const soldCount = await db.transferListing.count({
      where: { sellerClubId: club.id, status: 'sold' },
    })
    stats.sells = soldCount

    // Count buys (transfer listings that are sold and player is now in this club)
    const clubPlayers = await db.player.count({
      where: { clubId: club.id },
    })
    stats.buys = Math.max(0, clubPlayers - 22) // estimate: 22 are original, rest bought

    // Training count - estimate from player forms
    const trainedPlayers = await db.player.count({
      where: { clubId: club.id, form: { gt: 75 } },
    })
    stats.training = trainedPlayers * 5 // Estimate training sessions

    // Tournament wins
    const tournamentWins = await db.tournamentParticipant.count({
      where: { clubId: club.id, won: { gt: 0 } },
    })
    stats.tournamentWins = tournamentWins

    // Define achievement requirement mapping
    const requirementMap: Record<string, (stats: Record<string, number>) => number> = {
      first_win: (s) => s.wins,
      '10_wins': (s) => s.wins,
      '50_wins': (s) => s.totalWins || s.wins,
      league_champion: (s) => s.tournamentWins,
      champions_winner: (s) => s.totalTrophies || 0,
      scout: (s) => s.buys || 0,
      negotiator: (s) => s.sells || 0,
      skilled_trainer: (s) => s.training || 0,
      legend_trainer: (s) => s.training || 0,
      top_scorer: (s) => s.goalsFor,
      iron_defense: (s) => Math.max(0, club.wins > 0 ? 1 : 0), // simplified
      draw_master: (s) => s.draws,
      rich: (s) => s.coins,
      gem_collector: (s) => s.gems,
      stadium_owner: (s) => s.stadiumLevel,
      perfect_season: (s) => s.totalTrophies || 0,
    }

    const newlyUnlocked: string[] = []

    for (const achievement of achievements) {
      const getValue = requirementMap[achievement.achievementId]
      if (!getValue) continue

      const currentValue = getValue(stats)
      const isMet = currentValue >= achievement.requirement

      const existing = userAchievementMap.get(achievement.achievementId)

      if (isMet && !existing) {
        // Unlock new achievement
        await db.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.achievementId,
            unlocked: true,
            unlockedAt: new Date(),
          },
        })
        newlyUnlocked.push(achievement.achievementId)
      } else if (isMet && existing && !existing.unlocked) {
        // Update existing to unlocked
        await db.userAchievement.update({
          where: { id: existing.id },
          data: {
            unlocked: true,
            unlockedAt: new Date(),
          },
        })
        newlyUnlocked.push(achievement.achievementId)
      } else if (!existing) {
        // Create record as not unlocked
        await db.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.achievementId,
            unlocked: false,
          },
        })
      }
    }

    // Get updated achievements with status
    const updatedUserAchievements = await db.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
    })

    return NextResponse.json({
      success: true,
      data: {
        newlyUnlocked,
        achievements: updatedUserAchievements,
      },
    })
  } catch (error) {
    console.error('Check achievements error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في التحقق من الإنجازات' },
      { status: 500 }
    )
  }
}
