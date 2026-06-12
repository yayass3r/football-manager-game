// Player generation logic for football manager game

export type StarterPackTier = 'bronze' | 'silver' | 'gold' | 'legendary'

export const tierConfig: Record<StarterPackTier, { minOverall: number; maxOverall: number; label: string; emoji: string; color: string; chance: number }> = {
  bronze: { minOverall: 45, maxOverall: 65, label: 'برونزي', emoji: '🥉', color: '#cd7f32', chance: 0.35 },
  silver: { minOverall: 55, maxOverall: 75, label: 'فضي', emoji: '🥈', color: '#c0c0c0', chance: 0.35 },
  gold: { minOverall: 65, maxOverall: 85, label: 'ذهبي', emoji: '🥇', color: '#ffd700', chance: 0.22 },
  legendary: { minOverall: 78, maxOverall: 92, label: 'أسطوري', emoji: '💎', color: '#9b59b6', chance: 0.08 },
}

export function getRandomStarterTier(): StarterPackTier {
  const rand = Math.random()
  let cumulative = 0
  for (const [tier, config] of Object.entries(tierConfig)) {
    cumulative += config.chance
    if (rand <= cumulative) return tier as StarterPackTier
  }
  return 'bronze'
}

interface GeneratedPlayer {
  name: string
  position: string
  nationality: string
  age: number
  overall: number
  pace: number
  shooting: number
  passing: number
  dribbling: number
  defending: number
  physical: number
  freeKick: number
  penalties: number
  heading: number
  longShots: number
  positioning: number
  vision: number
  crossing: number
  tackling: number
  stamina: number
  agility: number
  potential: number
  value: number
  salary: number
  isStarter: boolean
  shirtNumber: number | null
}

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

// Position distribution for 22 players
const positionDistribution: { position: string; count: number }[] = [
  { position: 'GK', count: 2 },
  { position: 'CB', count: 5 },
  { position: 'LB', count: 2 },
  { position: 'RB', count: 2 },
  { position: 'CM', count: 3 },
  { position: 'LM', count: 2 },
  { position: 'RM', count: 2 },
  { position: 'ST', count: 2 },
  { position: 'CF', count: 2 },
]

const positionShirtNumbers: Record<string, number[]> = {
  GK: [1, 13],
  CB: [2, 3, 4, 5, 6],
  LB: [3, 12],
  RB: [2, 12],
  CM: [6, 8, 10, 14, 16],
  LM: [7, 11, 17],
  RM: [7, 11, 18],
  ST: [9, 19, 20],
  CF: [9, 10, 21],
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

function generateNationality(): string {
  return nationalities[randomInt(0, nationalities.length - 1)]
}

// Position-based stat weights for core stats
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

// Position-based weights for new skills
const positionNewSkillWeights: Record<string, { freeKick: number; penalties: number; heading: number; longShots: number; positioning: number; vision: number; crossing: number; tackling: number; stamina: number; agility: number }> = {
  GK: { freeKick: 0.1, penalties: 0.1, heading: 0.4, longShots: 0.05, positioning: 0.9, vision: 0.3, crossing: 0.05, tackling: 0.1, stamina: 0.6, agility: 0.7 },
  CB: { freeKick: 0.2, penalties: 0.1, heading: 0.9, longShots: 0.1, positioning: 0.8, vision: 0.3, crossing: 0.2, tackling: 0.9, stamina: 0.7, agility: 0.4 },
  LB: { freeKick: 0.3, penalties: 0.15, heading: 0.4, longShots: 0.2, positioning: 0.6, vision: 0.5, crossing: 0.8, tackling: 0.7, stamina: 0.8, agility: 0.7 },
  RB: { freeKick: 0.3, penalties: 0.15, heading: 0.4, longShots: 0.2, positioning: 0.6, vision: 0.5, crossing: 0.8, tackling: 0.7, stamina: 0.8, agility: 0.7 },
  CM: { freeKick: 0.5, penalties: 0.4, heading: 0.3, longShots: 0.5, positioning: 0.7, vision: 0.9, crossing: 0.4, tackling: 0.5, stamina: 0.8, agility: 0.6 },
  LM: { freeKick: 0.6, penalties: 0.4, heading: 0.2, longShots: 0.5, positioning: 0.5, vision: 0.6, crossing: 0.7, tackling: 0.2, stamina: 0.7, agility: 0.8 },
  RM: { freeKick: 0.6, penalties: 0.4, heading: 0.2, longShots: 0.5, positioning: 0.5, vision: 0.6, crossing: 0.7, tackling: 0.2, stamina: 0.7, agility: 0.8 },
  ST: { freeKick: 0.5, penalties: 0.8, heading: 0.7, longShots: 0.8, positioning: 0.7, vision: 0.3, crossing: 0.1, tackling: 0.05, stamina: 0.7, agility: 0.6 },
  CF: { freeKick: 0.6, penalties: 0.7, heading: 0.5, longShots: 0.7, positioning: 0.6, vision: 0.6, crossing: 0.2, tackling: 0.05, stamina: 0.6, agility: 0.7 },
}

function generateStatsForPosition(position: string, baseOverall: number): {
  pace: number; shooting: number; passing: number; dribbling: number; defending: number; physical: number
  freeKick: number; penalties: number; heading: number; longShots: number; positioning: number
  vision: number; crossing: number; tackling: number; stamina: number; agility: number
} {
  const weights = positionStatWeights[position] || positionStatWeights['CM']
  const newWeights = positionNewSkillWeights[position] || positionNewSkillWeights['CM']

  // Generate core stats
  const rawStats: Record<string, number> = {
    pace: randomInt(45, 85),
    shooting: randomInt(45, 85),
    passing: randomInt(45, 85),
    dribbling: randomInt(45, 85),
    defending: randomInt(45, 85),
    physical: randomInt(45, 85),
  }

  // Apply position weights for core stats
  const adjusted: Record<string, number> = {}
  for (const [stat, rawValue] of Object.entries(rawStats)) {
    const weight = weights[stat as keyof typeof weights] || 0.5
    const adjustment = (baseOverall - rawValue) * weight * 0.6
    adjusted[stat] = Math.min(99, Math.max(35, Math.round(rawValue + adjustment)))
  }

  // Generate new skills with position-based weighting
  const newSkillDefaults: Record<string, number> = {
    freeKick: 50,
    penalties: 50,
    heading: 50,
    longShots: 50,
    positioning: 50,
    vision: 50,
    crossing: 50,
    tackling: 50,
    stamina: 75,
    agility: 75,
  }

  const newStats: Record<string, number> = {}
  for (const [stat, defaultVal] of Object.entries(newSkillDefaults)) {
    const weight = newWeights[stat as keyof typeof newWeights] || 0.5
    const rawValue = randomInt(defaultVal - 20, defaultVal + 20)
    const adjustment = (baseOverall - rawValue) * weight * 0.5
    newStats[stat] = Math.min(99, Math.max(25, Math.round(rawValue + adjustment)))
  }

  return {
    pace: adjusted.pace,
    shooting: adjusted.shooting,
    passing: adjusted.passing,
    dribbling: adjusted.dribbling,
    defending: adjusted.defending,
    physical: adjusted.physical,
    freeKick: newStats.freeKick,
    penalties: newStats.penalties,
    heading: newStats.heading,
    longShots: newStats.longShots,
    positioning: newStats.positioning,
    vision: newStats.vision,
    crossing: newStats.crossing,
    tackling: newStats.tackling,
    stamina: newStats.stamina,
    agility: newStats.agility,
  }
}

export function generatePlayersForClub(tier?: StarterPackTier): GeneratedPlayer[] {
  const players: GeneratedPlayer[] = []
  let shirtIdx = 0
  const usedShirtNumbers = new Set<number>()

  // Determine overall range based on tier
  const minOverall = tier ? tierConfig[tier].minOverall : 55
  const maxOverall = tier ? tierConfig[tier].maxOverall : 85

  for (const { position, count } of positionDistribution) {
    const availableNumbers = positionShirtNumbers[position] || []

    for (let i = 0; i < count; i++) {
      // Starters (first 11) get higher overall, bench gets lower
      const isStarterSlot = shirtIdx < 11
      const overallMin = isStarterSlot ? Math.round(minOverall + (maxOverall - minOverall) * 0.4) : minOverall
      const overallMax = isStarterSlot ? maxOverall : Math.round(minOverall + (maxOverall - minOverall) * 0.7)
      const overall = randomInt(overallMin, overallMax)
      const stats = generateStatsForPosition(position, overall)
      const potential = Math.min(99, overall + randomInt(3, 15))
      const age = randomInt(18, 34)
      const value = overall * 10000
      const salary = Math.round(overall * 500 + randomInt(0, 5000))

      // Assign shirt number
      let shirtNumber: number | null = null
      for (const num of availableNumbers) {
        if (!usedShirtNumbers.has(num)) {
          shirtNumber = num
          usedShirtNumbers.add(num)
          break
        }
      }
      if (shirtNumber === null) {
        shirtNumber = shirtIdx + 1
        while (usedShirtNumbers.has(shirtNumber)) shirtNumber++
        usedShirtNumbers.add(shirtNumber)
      }

      players.push({
        name: generatePlayerName(),
        position,
        nationality: generateNationality(),
        age,
        overall,
        ...stats,
        potential,
        value,
        salary,
        isStarter: shirtIdx < 11, // First 11 are starters
        shirtNumber,
      })

      shirtIdx++
    }
  }

  return players
}
