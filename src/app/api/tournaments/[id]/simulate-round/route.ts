import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { simulateMatch } from '@/lib/match-simulation'

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id')
    const { id: tournamentId } = await params

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      )
    }

    // Get tournament
    const tournament = await db.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        participants: {
          include: {
            club: {
              include: { players: true },
            },
          },
        },
        matches: {
          where: { status: 'scheduled' },
          orderBy: { matchDay: 'asc' },
        },
      },
    })

    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'البطولة غير موجودة' },
        { status: 404 }
      )
    }

    if (tournament.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'البطولة غير نشطة' },
        { status: 400 }
      )
    }

    // Verify user is a participant
    const userClub = await db.club.findUnique({ where: { userId } })
    if (!userClub) {
      return NextResponse.json(
        { success: false, error: 'ليس لديك نادي' },
        { status: 404 }
      )
    }

    const isParticipant = tournament.participants.some(p => p.clubId === userClub.id)
    if (!isParticipant) {
      return NextResponse.json(
        { success: false, error: 'أنت لست مشاركاً في هذه البطولة' },
        { status: 403 }
      )
    }

    // Get the current match day (find the lowest match day with scheduled matches)
    const existingMatches = await db.match.findMany({
      where: { tournamentId, status: 'completed' },
      orderBy: { matchDay: 'desc' },
      take: 1,
    })

    const currentMatchDay = existingMatches.length > 0 ? existingMatches[0].matchDay + 1 : 1

    // Generate matches for this round
    // Simple round-robin: pair participants
    const participants = tournament.participants
    if (participants.length < 2) {
      return NextResponse.json(
        { success: false, error: 'لا يوجد مشاركون كافيون' },
        { status: 400 }
      )
    }

    // Create pairings for this round
    const matchResults = []
    const shuffled = [...participants].sort(() => Math.random() - 0.5)
    
    // Pair adjacent participants
    for (let i = 0; i < shuffled.length - 1; i += 2) {
      const homeParticipant = shuffled[i]
      const awayParticipant = shuffled[i + 1]

      const homeClubData = homeParticipant.club
      const awayClubData = awayParticipant.club

      // Simulate the match
      const matchResult = simulateMatch(
        {
          formation: homeClubData.formation,
          morale: homeClubData.morale,
          players: homeClubData.players.map(p => ({
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
          formation: awayClubData.formation,
          morale: awayClubData.morale,
          players: awayClubData.players.map(p => ({
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
          tournamentId,
          homeClubId: homeClubData.id,
          awayClubId: awayClubData.id,
          homeGoals: matchResult.homeGoals,
          awayGoals: matchResult.awayGoals,
          status: 'completed',
          matchDay: currentMatchDay,
          events: JSON.stringify(matchResult.events),
          playedAt: new Date(),
        },
      })

      // Update tournament participant stats
      const homePoints = matchResult.homeGoals > matchResult.awayGoals ? 3 : matchResult.homeGoals === matchResult.awayGoals ? 1 : 0
      const awayPoints = matchResult.awayGoals > matchResult.homeGoals ? 3 : matchResult.homeGoals === matchResult.awayGoals ? 1 : 0

      await db.$transaction([
        // Update home participant
        db.tournamentParticipant.update({
          where: { id: homeParticipant.id },
          data: {
            played: { increment: 1 },
            won: matchResult.homeGoals > matchResult.awayGoals ? { increment: 1 } : undefined,
            drawn: matchResult.homeGoals === matchResult.awayGoals ? { increment: 1 } : undefined,
            lost: matchResult.homeGoals < matchResult.awayGoals ? { increment: 1 } : undefined,
            gf: { increment: matchResult.homeGoals },
            ga: { increment: matchResult.awayGoals },
            points: { increment: homePoints },
          },
        }),
        // Update away participant
        db.tournamentParticipant.update({
          where: { id: awayParticipant.id },
          data: {
            played: { increment: 1 },
            won: matchResult.awayGoals > matchResult.homeGoals ? { increment: 1 } : undefined,
            drawn: matchResult.homeGoals === matchResult.awayGoals ? { increment: 1 } : undefined,
            lost: matchResult.awayGoals < matchResult.homeGoals ? { increment: 1 } : undefined,
            gf: { increment: matchResult.awayGoals },
            ga: { increment: matchResult.homeGoals },
            points: { increment: awayPoints },
          },
        }),
        // Update club records
        db.club.update({
          where: { id: homeClubData.id },
          data: {
            wins: matchResult.homeGoals > matchResult.awayGoals ? { increment: 1 } : undefined,
            draws: matchResult.homeGoals === matchResult.awayGoals ? { increment: 1 } : undefined,
            losses: matchResult.homeGoals < matchResult.awayGoals ? { increment: 1 } : undefined,
            goalsFor: { increment: matchResult.homeGoals },
            goalsAgainst: { increment: matchResult.awayGoals },
          },
        }),
        db.club.update({
          where: { id: awayClubData.id },
          data: {
            wins: matchResult.awayGoals > matchResult.homeGoals ? { increment: 1 } : undefined,
            draws: matchResult.homeGoals === matchResult.awayGoals ? { increment: 1 } : undefined,
            losses: matchResult.awayGoals < matchResult.homeGoals ? { increment: 1 } : undefined,
            goalsFor: { increment: matchResult.awayGoals },
            goalsAgainst: { increment: matchResult.homeGoals },
          },
        }),
      ])

      // Update player fitness for both clubs
      for (const player of homeClubData.players.filter(p => p.isStarter)) {
        await db.player.update({
          where: { id: player.id },
          data: {
            fitness: Math.max(10, player.fitness - randomInt(5, 15)),
            form: Math.min(99, Math.max(20, player.form + randomInt(-5, 10))),
          },
        })
      }
      for (const player of awayClubData.players.filter(p => p.isStarter)) {
        await db.player.update({
          where: { id: player.id },
          data: {
            fitness: Math.max(10, player.fitness - randomInt(5, 15)),
            form: Math.min(99, Math.max(20, player.form + randomInt(-5, 10))),
          },
        })
      }

      matchResults.push({
        matchId: match.id,
        home: homeClubData.name,
        away: awayClubData.name,
        homeGoals: matchResult.homeGoals,
        awayGoals: matchResult.awayGoals,
        events: matchResult.events,
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        round: currentMatchDay,
        matches: matchResults,
      },
    })
  } catch (error) {
    console.error('Simulate round error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في محاكاة الجولة' },
      { status: 500 }
    )
  }
}
