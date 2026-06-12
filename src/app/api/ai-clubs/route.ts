import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { generatePlayersForClub } from '@/lib/player-generator'

const AI_COLORS = [
  '#e74c3c', '#3498db', '#9b59b6', '#e67e22', '#1abc9c',
  '#c0392b', '#2c3e50', '#d35400', '#8e44ad', '#27ae60',
]

const FORMATIONS = ['4-3-3', '4-4-2', '3-5-2', '4-2-3-1', '3-4-3', '5-3-2']

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function generateAINameWithSDK(): Promise<{ clubName: string; playerName: string }> {
  try {
    // Dynamic import of the SDK
    const sdk = await import('z-ai-web-dev-sdk')
    const chatFn = sdk.chat || sdk.default?.chat
    if (!chatFn) throw new Error('SDK chat function not found')
    
    const response = await chatFn({
      messages: [
        {
          role: 'system',
          content: 'أنت مولّد أسماء عربية إبداعية لأندية كرة القدم ولاعبيها. أجب فقط بالأسماء المطلوبة بدون أي شرح إضافي.'
        },
        {
          role: 'user',
          content: 'أنشئ اسم نادي كرة قدم عربي فريد وإبداعي (3-4 كلمات) واسم لاعب عربي فريد (اسم أول + لقب عائلة). أجب بصيغة JSON فقط: {"clubName": "...", "playerName": "..."}'
        }
      ],
      temperature: 0.9,
      maxTokens: 100,
    })
    
    const text = response.choices?.[0]?.message?.content || response.text || response.content || ''
    const jsonMatch = text.match(/\{[^}]+\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        clubName: parsed.clubName || 'النسور الذهبية',
        playerName: parsed.playerName || 'أحمد الحربي',
      }
    }
  } catch (error) {
    console.error('AI name generation failed, using fallback:', error)
  }

  // Fallback names
  const fallbackClubNames = [
    'النسور الذهبية', 'الأسود الملكية', 'الذئاب الشرسة', 'الفرسان الحمر',
    'الصقور السريعة', 'الأبطال المتحدون', 'النجوم الساطعة', 'الرعد القوي',
    'البرق الخاطف', 'الأعاصير', 'الشهب المضيئة', 'النسور البيضاء',
    'الوحوش', 'الفرسان', 'الأمل', 'القمة',
  ]
  const fallbackPlayerNames = [
    'أحمد الحربي', 'محمد العتيبي', 'علي الشمري', 'حسن الدوسري',
    'خالد القحطاني', 'عمر المالكي', 'يوسف الغامدي', 'إبراهيم الزهراني',
  ]
  
  return {
    clubName: fallbackClubNames[randomInt(0, fallbackClubNames.length - 1)],
    playerName: fallbackPlayerNames[randomInt(0, fallbackPlayerNames.length - 1)],
  }
}

// GET: Return all AI clubs
export async function GET() {
  try {
    // Find AI clubs by their user pattern (username starts with 'ai_')
    const aiUsers = await db.user.findMany({
      where: {
        username: { contains: 'ai_' },
      },
      include: {
        club: {
          include: {
            players: true,
          },
        },
      },
    })

    const aiClubs = aiUsers
      .filter((u: any) => u.club)
      .map((u: any) => {
        const club = u.club
        const starters = club.players?.filter((p: any) => p.isStarter) || []
        const avgOverall = starters.length > 0
          ? Math.round(starters.reduce((s: number, p: any) => s + p.overall, 0) / starters.length)
          : 50
        return {
          id: club.id,
          name: club.name,
          logo: club.logo,
          primaryColor: club.primaryColor,
          formation: club.formation,
          avgOverall,
          playersCount: club.players?.length || 0,
          wins: club.wins,
          draws: club.draws,
          losses: club.losses,
        }
      })

    return NextResponse.json({
      success: true,
      data: aiClubs,
    })
  } catch (error) {
    console.error('Get AI clubs error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب الأندية الذكية' },
      { status: 500 }
    )
  }
}

// POST: Generate a new AI club using AI
export async function POST() {
  try {
    // Generate AI name using the SDK
    const { clubName, playerName } = await generateAINameWithSDK()

    // Create a unique AI user
    const suffix = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
    const username = `ai_${suffix}`
    const email = `ai_${suffix}@aiclubs.game`
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

    const colorIdx = randomInt(0, AI_COLORS.length - 1)
    const logos = ['🦅', '🦁', '🐺', '⚔️', '🦸', '⭐', '⚡', '🌪️', '💫', '🌟', '🕊️', '🐲', '🐎', '🌅', '🏔️', '🔥']

    const generatedPlayers = generatePlayersForClub()
    // Replace the first player's name with the AI-generated one
    if (generatedPlayers.length > 0) {
      generatedPlayers[0].name = playerName
    }

    // Create the club first
    const club = await db.club.create({
      data: {
        name: clubName,
        logo: logos[randomInt(0, logos.length - 1)],
        primaryColor: AI_COLORS[colorIdx],
        secondaryColor: '#ffffff',
        formation: FORMATIONS[randomInt(0, FORMATIONS.length - 1)],
        userId: user.id,
      },
    })

    // Create players separately
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

    // Calculate average overall of starters for display
    const starters = createdPlayers.filter((p: any) => p.isStarter)
    const avgOverall = starters.length > 0
      ? Math.round(starters.reduce((s: number, p: any) => s + p.overall, 0) / starters.length)
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
        playersCount: createdPlayers.length,
        generatedName: clubName,
        featuredPlayer: playerName,
      },
    })
  } catch (error) {
    console.error('Create AI club error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في إنشاء النادي الذكي' },
      { status: 500 }
    )
  }
}
