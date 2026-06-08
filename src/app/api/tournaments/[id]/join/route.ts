import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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

    // Get user's club
    const userClub = await db.club.findUnique({
      where: { userId },
    })

    if (!userClub) {
      return NextResponse.json(
        { success: false, error: 'ليس لديك نادي' },
        { status: 404 }
      )
    }

    // Get tournament
    const tournament = await db.tournament.findUnique({
      where: { id: tournamentId },
    })

    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'البطولة غير موجودة' },
        { status: 404 }
      )
    }

    // Check if registration is still open
    if (tournament.status !== 'registration') {
      return NextResponse.json(
        { success: false, error: 'التسجيل مغلق في هذه البطولة' },
        { status: 400 }
      )
    }

    // Get participant count
    const participantCount = await db.tournamentParticipant.count({
      where: { tournamentId },
    })

    // Check if tournament is full
    if (participantCount >= tournament.maxTeams) {
      return NextResponse.json(
        { success: false, error: 'البطولة ممتلئة' },
        { status: 400 }
      )
    }

    // Check if already joined - use findFirst with compound where
    const existingParticipation = await db.tournamentParticipant.findFirst({
      where: {
        tournamentId,
        clubId: userClub.id,
      },
    })

    if (existingParticipation) {
      return NextResponse.json(
        { success: false, error: 'أنت مشترك بالفعل في هذه البطولة' },
        { status: 409 }
      )
    }

    // Check tier requirement (reputation must be high enough)
    const tierReputationRequired = tournament.tier * 20
    if (userClub.reputation < tierReputationRequired) {
      return NextResponse.json(
        { success: false, error: `سمعة ناديك غير كافية. مطلوب: ${tierReputationRequired}` },
        { status: 400 }
      )
    }

    // Join tournament
    const participant = await db.tournamentParticipant.create({
      data: {
        tournamentId,
        clubId: userClub.id,
        groupNumber: 1,
      },
    })

    // Check if tournament is now full and update status
    const totalParticipants = participantCount + 1
    if (totalParticipants >= tournament.maxTeams) {
      await db.tournament.update({
        where: { id: tournamentId },
        data: { status: 'active' },
      })
    }

    return NextResponse.json({
      success: true,
      data: participant,
    })
  } catch (error) {
    console.error('Join tournament error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في الانضمام للبطولة' },
      { status: 500 }
    )
  }
}
