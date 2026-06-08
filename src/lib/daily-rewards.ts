// Daily reward logic for football manager game

export interface DailyReward {
  coins: number
  gems: number
  day: number
  special?: string
}

const dailyRewards: DailyReward[] = [
  { coins: 500, gems: 0, day: 1 },
  { coins: 750, gems: 0, day: 2 },
  { coins: 1000, gems: 0, day: 3 },
  { coins: 1250, gems: 5, day: 4 },
  { coins: 1500, gems: 10, day: 5 },
  { coins: 2000, gems: 15, day: 6 },
  { coins: 3000, gems: 25, day: 7, special: 'حزمة لاعب خاص' },
]

export function getDailyReward(streakDay: number): DailyReward {
  const day = ((streakDay - 1) % 7) + 1
  return dailyRewards[day - 1]
}

// Reference date: Jan 1, 2024
const REFERENCE_DATE = new Date('2024-01-01T00:00:00Z').getTime()

export function canClaimDailyReward(lastClaimXp: number): { canClaim: boolean; currentStreak: number; nextDay: number } {
  // xp field stores: (daysSince2024 * 100) + streakDay
  // This gives us day-level precision with the streak in the last 2 digits
  if (lastClaimXp === 0) {
    return { canClaim: true, currentStreak: 0, nextDay: 1 }
  }
  
  const streakDay = lastClaimXp % 100
  const daysSinceRef = Math.floor(lastClaimXp / 100)
  const lastClaimDate = new Date(REFERENCE_DATE + daysSinceRef * 24 * 60 * 60 * 1000)
  
  const now = new Date()
  const hoursSinceLastClaim = (now.getTime() - lastClaimDate.getTime()) / (1000 * 60 * 60)
  
  if (hoursSinceLastClaim < 20) {
    return { canClaim: false, currentStreak: streakDay, nextDay: streakDay }
  }
  
  // If more than 48 hours, reset streak
  if (hoursSinceLastClaim > 48) {
    return { canClaim: true, currentStreak: 0, nextDay: 1 }
  }
  
  // Between 20-48 hours, can claim and continue streak
  return { canClaim: true, currentStreak: streakDay, nextDay: streakDay + 1 }
}

export function encodeDailyClaim(streakDay: number): number {
  const now = new Date()
  const daysSinceRef = Math.floor((now.getTime() - REFERENCE_DATE) / (24 * 60 * 60 * 1000))
  return daysSinceRef * 100 + streakDay
}
