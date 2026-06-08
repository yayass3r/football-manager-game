import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generatePlayersForClub } from '@/lib/player-generator'

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const body = await request.json()
    const { name, logo, primaryColor, secondaryColor, formation } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      )
    }

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'اسم النادي يجب أن يكون حرفين على الأقل' },
        { status: 400 }
      )
    }

    // Check if user already has a club
    const existingClub = await db.club.findUnique({
      where: { userId },
    })

    if (existingClub) {
      return NextResponse.json(
        { success: false, error: 'لديك نادي بالفعل' },
        { status: 409 }
      )
    }

    // Create the club first (without nested players)
    const club = await db.club.create({
      data: {
        name: name.trim(),
        logo: logo || '🏟️',
        primaryColor: primaryColor || '#1a8f3f',
        secondaryColor: secondaryColor || '#ffffff',
        formation: formation || '4-3-3',
        userId,
      },
    })

    // Generate and create players separately
    const generatedPlayers = generatePlayersForClub()
    const createdPlayers = []
    
    for (const player of generatedPlayers) {
      try {
        const created = await db.player.create({
          data: {
            name: player.name,
            position: player.position,
            nationality: player.nationality,
            age: player.age,
            overall: player.overall,
            pace: player.pace,
            shooting: player.shooting,
            passing: player.passing,
            dribbling: player.dribbling,
            defending: player.defending,
            physical: player.physical,
            potential: player.potential,
            value: player.value,
            salary: player.salary,
            isStarter: player.isStarter,
            shirtNumber: player.shirtNumber,
            clubId: club.id,
          },
        })
        createdPlayers.push(created)
      } catch (e) {
        console.error('Failed to create player:', e)
      }
    }

    // Sort players by isStarter
    createdPlayers.sort((a: any, b: any) => (b.isStarter ? 1 : 0) - (a.isStarter ? 1 : 0))

    return NextResponse.json({
      success: true,
      data: { ...club, players: createdPlayers },
    })
  } catch (error) {
    console.error('Create club error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في إنشاء النادي' },
      { status: 500 }
    )
  }
}
