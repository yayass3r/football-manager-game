import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { simulateMatch } from '@/lib/match-simulation'

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const body = await request.json()
    const { homeClubId, awayClubId } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      )
    }

    if (!homeClubId || !awayClubId) {
      return NextResponse.json(
        { success: false, error: 'معرف النادي المضيف والضيف مطلوبان' },
        { status: 400 }
      )
    }

    // Get both clubs with players
    const homeClub = await db.club.findUnique({
      where: { id: homeClubId },
      include: { players: true },
    })

    const awayClub = await db.club.findUnique({
      where: { id: awayClubId },
      include: { players: true },
    })

    if (!homeClub) {
      return NextResponse.json(
        { success: false, error: 'النادي المضيف غير موجود' },
        { status: 404 }
      )
    }

    if (!awayClub) {
      return NextResponse.json(
        { success: false, error: 'النادي الضيف غير موجود' },
        { status: 404 }
      )
    }

    // Verify user owns at least one of the clubs
    const userClub = await db.club.findUnique({
      where: { userId },
    })

    if (!userClub || (userClub.id !== homeClubId && userClub.id !== awayClubId)) {
      return NextResponse.json(
        { success: false, error: 'يجب أن تمتلك أحد الناديين' },
        { status: 403 }
      )
    }

    // Simulate the match
    const matchData = simulateMatch(
      {
        formation: homeClub.formation,
        morale: homeClub.morale,
        players: homeClub.players.map(p => ({
          name: p.name,
          position: p.position,
          overall: p.overall,
          shooting: p.shooting,
          passing: p.passing,
          dribbling: p.dribbling,
          defending: p.defending,
          pace: p.pace,
          physical: p.physical,
          morale: p.morale,
          fitness: p.fitness,
          form: p.form,
          isStarter: p.isStarter,
        })),
      },
      {
        formation: awayClub.formation,
        morale: awayClub.morale,
        players: awayClub.players.map(p => ({
          name: p.name,
          position: p.position,
          overall: p.overall,
          shooting: p.shooting,
          passing: p.passing,
          dribbling: p.dribbling,
          defending: p.defending,
          pace: p.pace,
          physical: p.physical,
          morale: p.morale,
          fitness: p.fitness,
          form: p.form,
          isStarter: p.isStarter,
        })),
      }
    )

    // Create match record
    const match = await db.match.create({
      data: {
        homeClubId,
        awayClubId,
        homeGoals: matchData.homeGoals,
        awayGoals: matchData.awayGoals,
        status: 'completed',
        events: JSON.stringify(matchData.events),
        playedAt: new Date(),
      },
    })

    // Update club records
    const homeUpdates: Record<string, number> = {}
    const awayUpdates: Record<string, number> = {}

    if (matchData.homeGoals > matchData.awayGoals) {
      homeUpdates.wins = 1
      awayUpdates.losses = 1
    } else if (matchData.homeGoals < matchData.awayGoals) {
      homeUpdates.losses = 1
      awayUpdates.wins = 1
    } else {
      homeUpdates.draws = 1
      awayUpdates.draws = 1
    }
    homeUpdates.goalsFor = matchData.homeGoals
    homeUpdates.goalsAgainst = matchData.awayGoals
    awayUpdates.goalsFor = matchData.awayGoals
    awayUpdates.goalsAgainst = matchData.homeGoals

    await db.$transaction([
      db.club.update({
        where: { id: homeClubId },
        data: homeUpdates,
      }),
      db.club.update({
        where: { id: awayClubId },
        data: awayUpdates,
      }),
    ])

    // Update player fitness and form for starters
    const homeStarters = homeClub.players.filter(p => p.isStarter)
    const awayStarters = awayClub.players.filter(p => p.isStarter)

    const playerUpdates = []

    for (const player of homeStarters) {
      const fitnessLoss = randomInt(5, 15)
      const formChange = randomInt(-5, 10)
      playerUpdates.push(
        db.player.update({
          where: { id: player.id },
          data: {
            fitness: Math.max(10, player.fitness - fitnessLoss),
            form: Math.min(99, Math.max(20, player.form + formChange)),
          },
        })
      )
    }

    for (const player of awayStarters) {
      const fitnessLoss = randomInt(5, 15)
      const formChange = randomInt(-5, 10)
      playerUpdates.push(
        db.player.update({
          where: { id: player.id },
          data: {
            fitness: Math.max(10, player.fitness - fitnessLoss),
            form: Math.min(99, Math.max(20, player.form + formChange)),
          },
        })
      )
    }

    // Non-starters recover some fitness
    const homeBench = homeClub.players.filter(p => !p.isStarter)
    const awayBench = awayClub.players.filter(p => !p.isStarter)

    for (const player of [...homeBench, ...awayBench]) {
      playerUpdates.push(
        db.player.update({
          where: { id: player.id },
          data: {
            fitness: Math.min(100, player.fitness + randomInt(5, 15)),
          },
        })
      )
    }

    // Update morale based on result
    if (matchData.homeGoals > matchData.awayGoals) {
      playerUpdates.push(
        db.club.update({
          where: { id: homeClubId },
          data: { morale: Math.min(100, homeClub.morale + randomInt(2, 5)) },
        }),
        db.club.update({
          where: { id: awayClubId },
          data: { morale: Math.max(20, awayClub.morale - randomInt(2, 5)) },
        })
      )
    } else if (matchData.homeGoals < matchData.awayGoals) {
      playerUpdates.push(
        db.club.update({
          where: { id: awayClubId },
          data: { morale: Math.min(100, awayClub.morale + randomInt(2, 5)) },
        }),
        db.club.update({
          where: { id: homeClubId },
          data: { morale: Math.max(20, homeClub.morale - randomInt(2, 5)) },
        })
      )
    }

    await db.$transaction(playerUpdates)

    return NextResponse.json({
      success: true,
      data: {
        match: {
          id: match.id,
          homeGoals: matchData.homeGoals,
          awayGoals: matchData.awayGoals,
          homeStrength: matchData.homeStrength,
          awayStrength: matchData.awayStrength,
          events: matchData.events,
        },
      },
    })
  } catch (error) {
    console.error('Simulate match error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في محاكاة المباراة' },
      { status: 500 }
    )
  }
}
