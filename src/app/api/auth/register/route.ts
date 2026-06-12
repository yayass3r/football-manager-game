import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { generatePlayersForClub, getRandomStarterTier, tierConfig, StarterPackTier } from '@/lib/player-generator'

const CLUB_NAMES = [
  'الأسود', 'النسور', 'الفرسان', 'الصقور', 'الأبطال', 'الشباب', 'الوحدة',
  'النصر', 'الأمل', 'الفخر', 'العز', 'المجد', 'القوة', 'البرق',
  'الزعامة', 'السيطرة', 'الروعة', 'التحدي', 'الريادة', 'الصمود',
]

const CLUB_LOGOS = ['⚽', '🦁', '🐲', '🦅', '⚡', '🔥', '👑', '🌟', '💎', '⭐', '🎯', '🏆', '🦊', '🐺', '🦅', '🦈']

const CLUB_COLORS = [
  '#1a8f3f', '#e74c3c', '#3498db', '#f39c12', '#9b59b6',
  '#1abc9c', '#e67e22', '#2c3e50', '#c0392b', '#27ae60',
  '#8e44ad', '#d35400', '#16a085', '#2c3e50',
]

const FORMATIONS = ['4-3-3', '4-4-2', '3-5-2', '4-2-3-1', '3-4-3', '5-3-2']

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, username } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'صيغة البريد الإلكتروني غير صحيحة' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني مسجل بالفعل' },
        { status: 409 }
      )
    }

    // Auto-generate username from email if not provided
    const finalUsername = username || email.split('@')[0]

    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await db.user.create({
      data: {
        username: finalUsername,
        email,
        password: hashedPassword,
        coins: 5000,
        gems: 50,
      },
    })

    // === AUTO-CREATE CLUB WITH RANDOM STARTER PACK ===
    const starterTier: StarterPackTier = getRandomStarterTier()
    const tierInfo = tierConfig[starterTier]

    // Random club properties
    const clubName = randomItem(CLUB_NAMES)
    const clubLogo = randomItem(CLUB_LOGOS)
    const primaryColor = randomItem(CLUB_COLORS)
    const secondaryColor = randomItem(['#ffffff', '#000000', ...CLUB_COLORS.filter(c => c !== primaryColor)])
    const formation = randomItem(FORMATIONS)

    // Create the club
    const club = await db.club.create({
      data: {
        name: clubName,
        logo: clubLogo,
        primaryColor,
        secondaryColor,
        formation,
        userId: user.id,
      },
    })

    // Generate players based on starter tier
    const generatedPlayers = generatePlayersForClub(starterTier)
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
            clubId: club.id,
          },
        })
        createdPlayers.push(created)
      } catch (e) {
        console.error('Failed to create player:', e)
      }
    }

    // Sort players: starters first
    createdPlayers.sort((a: any, b: any) => (b.isStarter ? 1 : 0) - (a.isStarter ? 1 : 0))

    // Calculate team stats
    const avgOverall = createdPlayers.length > 0
      ? Math.round(createdPlayers.reduce((sum: number, p: any) => sum + p.overall, 0) / createdPlayers.length)
      : 0
    const bestPlayer = createdPlayers.length > 0
      ? createdPlayers.reduce((best: any, p: any) => p.overall > best.overall ? p : best, createdPlayers[0])
      : null

    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      data: {
        ...userWithoutPassword,
        club: { ...club, players: createdPlayers },
      },
      starterPack: {
        tier: starterTier,
        label: tierInfo.label,
        emoji: tierInfo.emoji,
        color: tierInfo.color,
        avgOverall,
        bestPlayer: bestPlayer ? { name: bestPlayer.name, overall: bestPlayer.overall, position: bestPlayer.position } : null,
        playerCount: createdPlayers.length,
      },
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في التسجيل' },
      { status: 500 }
    )
  }
}
