import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { generatePlayersForClub } from '@/lib/player-generator'

const AI_NAMES = [
  'النسور الذهبية', 'الأسود الملكية', 'الذئاب الشرسة', 'الفرسان الحمر',
  'الصقور السريعة', 'الأبطال المتحدون', 'النجوم الساطعة', 'الرعد القوي',
  'البرق الخاطف', 'الأعاصير', 'الشهب المضيئة', 'النسور البيضاء',
  'الوحوش', 'الفرسان', 'الأمل', 'القمة',
]

const AI_LOGOS = ['🦅', '🦁', '🐺', '⚔️', '🦅', '🦸', '⭐', '⚡', '🌪️', '💫', '🌟', '🕊️', '🐲', '🐎', '🌅', '🏔️']

const AI_COLORS = [
  '#e74c3c', '#3498db', '#9b59b6', '#e67e22', '#1abc9c',
  '#c0392b', '#2c3e50', '#d35400', '#8e44ad', '#27ae60',
]

const FORMATIONS = ['4-3-3', '4-4-2', '3-5-2', '4-2-3-1', '3-4-3', '5-3-2']

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export async function POST() {
  try {
    // Create a unique AI user
    const suffix = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
    const username = `ai_${suffix}`
    const email = `ai_${suffix}@opponent.game`
    const password = `ai_${suffix}_pass`

    const hashedPassword = await hashPassword(password)

    const user = await db.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        coins: 0,
        gems: 0,
      },
    })

    const nameIdx = randomInt(0, AI_NAMES.length - 1)
    const colorIdx = randomInt(0, AI_COLORS.length - 1)

    const generatedPlayers = generatePlayersForClub()

    const club = await db.club.create({
      data: {
        name: AI_NAMES[nameIdx],
        logo: AI_LOGOS[nameIdx % AI_LOGOS.length],
        primaryColor: AI_COLORS[colorIdx],
        secondaryColor: '#ffffff',
        formation: FORMATIONS[randomInt(0, FORMATIONS.length - 1)],
        userId: user.id,
        players: {
          create: generatedPlayers.map(player => ({
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
            freeKick: player.freeKick,
            penalties: player.penalties,
            heading: player.heading,
            longShots: player.longShots,
            positioning: player.positioning,
            vision: player.vision,
            crossing: player.crossing,
            tackling: player.tackling,
            stamina: player.stamina,
            agility: player.agility,
            potential: player.potential,
            value: player.value,
            salary: player.salary,
            isStarter: player.isStarter,
            shirtNumber: player.shirtNumber,
          })),
        },
      },
      include: {
        players: true,
      },
    })

    // Calculate average overall of starters for display
    const starters = club.players.filter(p => p.isStarter)
    const avgOverall = starters.length > 0
      ? Math.round(starters.reduce((s, p) => s + p.overall, 0) / starters.length)
      : 50

    return NextResponse.json({
      success: true,
      data: {
        id: club.id,
        name: club.name,
        logo: club.logo,
        primaryColor: club.primaryColor,
        formation: club.formation,
        avgOverall,
      },
    })
  } catch (error) {
    console.error('Create AI opponent error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في إنشاء الخصم' },
      { status: 500 }
    )
  }
}
