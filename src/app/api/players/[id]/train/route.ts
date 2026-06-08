import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const TRAINING_COST = 500 // coins per training session
const MAX_STAT_VALUE = 99
const STAT_INCREASE_MIN = 1
const STAT_INCREASE_MAX = 3

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id')
    const { id: playerId } = await params

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      )
    }

    // Find the player and verify ownership
    const player = await db.player.findUnique({
      where: { id: playerId },
      include: { club: true },
    })

    if (!player) {
      return NextResponse.json(
        { success: false, error: 'اللاعب غير موجود' },
        { status: 404 }
      )
    }

    const userClub = await db.club.findUnique({
      where: { userId },
    })

    if (!userClub || player.clubId !== userClub.id) {
      return NextResponse.json(
        { success: false, error: 'هذا اللاعب ليس في ناديك' },
        { status: 403 }
      )
    }

    // Check if player has enough fitness to train
    if (player.fitness < 20) {
      return NextResponse.json(
        { success: false, error: 'لياقة اللاعب منخفضة جداً للتدريب' },
        { status: 400 }
      )
    }

    // Check user has enough coins
    const user = await db.user.findUnique({
      where: { id: userId },
    })

    if (!user || user.coins < TRAINING_COST) {
      return NextResponse.json(
        { success: false, error: `تحتاج ${TRAINING_COST} عملة للتدريب` },
        { status: 400 }
      )
    }

    // Determine which stats to improve based on position
    const statImprovements: Record<string, number> = {}
    const position = player.position

    // Each training session improves 2-3 stats
    const numStats = randomInt(2, 3)
    
    let possibleStats: string[]
    switch (position) {
      case 'GK':
        possibleStats = ['defending', 'physical', 'passing', 'pace']
        break
      case 'CB':
      case 'LB':
      case 'RB':
        possibleStats = ['defending', 'physical', 'pace', 'passing']
        break
      case 'CM':
        possibleStats = ['passing', 'dribbling', 'shooting', 'physical']
        break
      case 'LM':
      case 'RM':
        possibleStats = ['pace', 'dribbling', 'passing', 'shooting']
        break
      case 'ST':
      case 'CF':
        possibleStats = ['shooting', 'dribbling', 'pace', 'physical']
        break
      default:
        possibleStats = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical']
    }

    // Shuffle and pick stats to improve
    const shuffled = possibleStats.sort(() => Math.random() - 0.5)
    const selectedStats = shuffled.slice(0, numStats)

    let totalIncrease = 0
    for (const stat of selectedStats) {
      const increase = randomInt(STAT_INCREASE_MIN, STAT_INCREASE_MAX)
      const currentValue = (player as Record<string, unknown>)[stat] as number
      const newValue = Math.min(MAX_STAT_VALUE, currentValue + increase)
      const actualIncrease = newValue - currentValue
      statImprovements[stat] = actualIncrease
      totalIncrease += actualIncrease
    }

    // Calculate new overall (weighted average of all stats)
    const statWeights: Record<string, number> = {
      pace: 0.15, shooting: 0.2, passing: 0.2, dribbling: 0.15, defending: 0.15, physical: 0.15,
    }
    
    const updatedStats: Record<string, number> = {
      pace: player.pace,
      shooting: player.shooting,
      passing: player.passing,
      dribbling: player.dribbling,
      defending: player.defending,
      physical: player.physical,
    }
    
    for (const [stat, increase] of Object.entries(statImprovements)) {
      updatedStats[stat] = (updatedStats[stat] || 0) + increase
    }

    const newOverall = Math.round(
      Object.entries(updatedStats).reduce((sum, [stat, value]) => {
        return sum + value * (statWeights[stat] || 0.15)
      }, 0)
    )

    // Update player and deduct coins in transaction
    const [updatedPlayer] = await db.$transaction([
      db.player.update({
        where: { id: playerId },
        data: {
          ...statImprovements,
          overall: newOverall,
          value: newOverall * 10000,
          fitness: Math.max(0, player.fitness - randomInt(5, 10)),
          form: Math.min(99, player.form + randomInt(1, 5)),
        },
      }),
      db.user.update({
        where: { id: userId },
        data: { coins: { decrement: TRAINING_COST } },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        player: updatedPlayer,
        improvements: statImprovements,
        totalIncrease,
        cost: TRAINING_COST,
      },
    })
  } catch (error) {
    console.error('Train player error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في تدريب اللاعب' },
      { status: 500 }
    )
  }
}
