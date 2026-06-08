// Player generation logic for football manager game

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

// Position-based stat weights (how important each stat is for that position)
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

function generateStatsForPosition(position: string, baseOverall: number): {
  pace: number; shooting: number; passing: number; dribbling: number; defending: number; physical: number
} {
  const weights = positionStatWeights[position] || positionStatWeights['CM']
  
  // Generate stats weighted by position importance, then normalize to approximate the base overall
  const rawStats = {
    pace: randomInt(45, 85),
    shooting: randomInt(45, 85),
    passing: randomInt(45, 85),
    dribbling: randomInt(45, 85),
    defending: randomInt(45, 85),
    physical: randomInt(45, 85),
  }
  
  // Apply position weights - boost important stats, reduce less important ones
  const adjusted: Record<string, number> = {}
  for (const [stat, rawValue] of Object.entries(rawStats)) {
    const weight = weights[stat as keyof typeof weights] || 0.5
    // Weighted adjustment: if weight > 0.5, boost toward baseOverall; if < 0.5, reduce
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

export function generatePlayersForClub(): GeneratedPlayer[] {
  const players: GeneratedPlayer[] = []
  let shirtIdx = 0
  const usedShirtNumbers = new Set<number>()

  for (const { position, count } of positionDistribution) {
    const availableNumbers = positionShirtNumbers[position] || []
    
    for (let i = 0; i < count; i++) {
      const overall = randomInt(55, 85)
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
