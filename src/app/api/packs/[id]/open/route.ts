import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Player generation logic for packs
const arabicFirstNames = [
  'أحمد', 'محمد', 'علي', 'حسن', 'خالد', 'عمر', 'يوسف', 'إبراهيم',
  'سعيد', 'فهد', 'ماجد', 'ناصر', 'طارق', 'وليد', 'راشد', 'سمير',
  'كريم', 'ياسر', 'بدر', 'فيصل', 'عبدالله', 'سلطان', 'منصور', 'هشام',
]

const internationalFirstNames = [
  'Lionel', 'Cristiano', 'Kevin', 'Kylian', 'Erling', 'Mohamed', 'Robert',
  'Luka', 'Vinicius', 'Jude', 'Phil', 'Bruno', 'Bernardo', 'Rafael',
  'Marco', 'Leon', 'Joshua', 'Antonio', 'Federico', 'Paulo',
]

const arabicLastNames = [
  'الحربي', 'العتيبي', 'الشمري', 'الدوسري', 'القحطاني', 'المالكي',
  'الغامدي', 'الزهراني', 'السبيعي', 'الرشيدي', 'المطيري', 'البلوي',
  'العنزي', 'الشهري', 'الأحمدي', 'العمري',
]

const internationalLastNames = [
  'Silva', 'Santos', 'Martinez', 'Lopez', 'Muller', 'Schmidt', 'Rossi',
  'Fernandez', 'Torres', 'Costa', 'Pereira', 'Johansson', 'Andersen',
  'Dubois', 'Moreau', 'Weber', 'Hoffmann', 'Novak', 'Kowalski', 'Ivanov',
]

const nationalities = [
  'السعودية', 'مصر', 'المغرب', 'تونس', 'الجزائر', 'الأردن', 'العراق',
  'Brazil', 'Argentina', 'France', 'Germany', 'Spain', 'Portugal', 'England',
  'Italy', 'Netherlands', 'Croatia', 'Serbia', 'Nigeria', 'Senegal',
]

const positions = ['GK', 'CB', 'LB', 'RB', 'CM', 'LM', 'RM', 'ST', 'CF']

const positionStatWeights: Record<string, { pace: number; shooting: number; passing: number; dribbling: number; defending: number; physical: number }> = {
  GK: { pace: 0.2, shooting: 0.05, passing: 0.3, dribbling: 0.1, defending: 0.2, physical: 0.8 },
  CB: { pace: 0.4, shooting: 0.15, passing: 0.4, dribbling: 0.2, defending: 0.9, physical: 0.8 },
  LB: { pace: 0.8, shooting: 0.2, passing: 0.5, dribbling: 0.4, defending: 0.6, physical: 0.6 },
  RB: { pace: 0.8, shooting: 0.2, passing: 0.5, dribbling: 0.4, defending: 0.6, physical: 0.6 },
  CM: { pace: 0.5, shooting: 0.4, passing: 0.8, dribbling: 0.6, defending: 0.5, physical: 0.6 },
  LM: { pace: 0.8, shooting: 0.5, passing: 0.6, dribbling: 0.8, defending: 0.2, physical: 0.5 },
  RM: { pace: 0.8, shooting: 0.5, passing: 0.6, dribbling: 0.8, defending: 0.2, physical: 0.5 },
  ST: { pace: 0.7, shooting: 0.9, passing: 0.3, dribbling: 0.6, defending: 0.1, physical: 0.7 },
  CF: { pace: 0.5, shooting: 0.8, passing: 0.5, dribbling: 0.7, defending: 0.1, physical: 0.6 },
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generatePlayerName(): string {
  const useArabic = Math.random() > 0.4
  if (useArabic) {
    const first = arabicFirstNames[randomInt(0, arabicFirstNames.length - 1)]
    const last = arabicLastNames[randomInt(0, arabicLastNames.length - 1)]
    return `${first} ${last}`
  }
  const first = internationalFirstNames[randomInt(0, internationalFirstNames.length - 1)]
  const last = internationalLastNames[randomInt(0, internationalLastNames.length - 1)]
  return `${first} ${last}`
}

function generateStatsForPosition(position: string, baseOverall: number) {
  const weights = positionStatWeights[position] || positionStatWeights['CM']
  const rawStats = {
    pace: randomInt(45, 85),
    shooting: randomInt(45, 85),
    passing: randomInt(45, 85),
    dribbling: randomInt(45, 85),
    defending: randomInt(45, 85),
    physical: randomInt(45, 85),
  }

  const adjusted: Record<string, number> = {}
  for (const [stat, rawValue] of Object.entries(rawStats)) {
    const weight = weights[stat as keyof typeof weights] || 0.5
    const adjustment = (baseOverall - rawValue) * weight * 0.6
    adjusted[stat] = Math.min(99, Math.max(35, Math.round(rawValue + adjustment)))
  }

  return {
    pace: adjusted.pace,
    shooting: adjusted.shooting,
    passing: adjusted.passing,
    dribbling: adjusted.dribbling,
    defending: adjusted.defending,
    physical: adjusted.physical,
  }
}

function generatePlayerForPack(minOverall: number, maxOverall: number) {
  const overall = randomInt(minOverall, maxOverall)
  const position = positions[randomInt(0, positions.length - 1)]
  const stats = generateStatsForPosition(position, overall)
  const potential = Math.min(99, overall + randomInt(3, 15))
  const age = randomInt(18, 34)
  const value = overall * 10000
  const salary = Math.round(overall * 500 + randomInt(0, 5000))
  const nationality = nationalities[randomInt(0, nationalities.length - 1)]

  // Determine rarity tier for dramatic reveal
  let rarity = 'common'
  if (overall >= 85) rarity = 'legendary'
  else if (overall >= 78) rarity = 'epic'
  else if (overall >= 70) rarity = 'rare'

  return {
    name: generatePlayerName(),
    position,
    nationality,
    age,
    overall,
    ...stats,
    potential,
    value,
    salary,
    morale: 75,
    fitness: 100,
    form: 75,
    isStarter: false,
    shirtNumber: null,
    rarity,
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      )
    }

    const { id: packId } = await params

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

    // Get the pack
    const pack = await db.playerPack.findUnique({
      where: { id: packId },
    })

    if (!pack || !pack.isActive) {
      return NextResponse.json(
        { success: false, error: 'الحزمة غير موجودة أو غير متاحة' },
        { status: 404 }
      )
    }

    // Check if user can afford the pack
    if (pack.price > 0 && user.coins < pack.price) {
      return NextResponse.json(
        { success: false, error: 'لا تملك ما يكفي من العملات' },
        { status: 400 }
      )
    }

    if (pack.gemPrice > 0 && user.gems < pack.gemPrice) {
      return NextResponse.json(
        { success: false, error: 'لا تملك ما يكفي من الجواهر' },
        { status: 400 }
      )
    }

    // Generate players
    const generatedPlayers = []
    for (let i = 0; i < pack.playerCount; i++) {
      generatedPlayers.push(generatePlayerForPack(pack.minOverall, pack.maxOverall))
    }

    // Deduct currency
    const updateData: { coins?: { decrement: number }; gems?: { decrement: number } } = {}
    if (pack.price > 0) updateData.coins = { decrement: pack.price }
    if (pack.gemPrice > 0) updateData.gems = { decrement: pack.gemPrice }

    await db.user.update({
      where: { id: userId },
      data: updateData,
    })

    // Add players to club
    const createdPlayers = []
    for (const playerData of generatedPlayers) {
      const player = await db.player.create({
        data: {
          ...playerData,
          shirtNumber: playerData.shirtNumber,
          clubId: user.club.id,
        },
      })
      createdPlayers.push(player)
    }

    // Save pack opening record
    await db.packOpening.create({
      data: {
        userId,
        packId,
        playersData: JSON.stringify(createdPlayers),
      },
    })

    // Calculate dramatic reveal data
    const bestOverall = Math.max(...generatedPlayers.map(p => p.overall))
    const bestPlayer = generatedPlayers.find(p => p.overall === bestOverall)

    return NextResponse.json({
      success: true,
      data: {
        pack,
        players: createdPlayers,
        reveal: {
          bestPlayer: bestPlayer ? { name: bestPlayer.name, overall: bestPlayer.overall, rarity: bestPlayer.rarity, position: bestPlayer.position } : null,
          totalPlayers: createdPlayers.length,
          packType: pack.type,
        },
      },
    })
  } catch (error) {
    console.error('Open pack error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في فتح الحزمة' },
      { status: 500 }
    )
  }
}
