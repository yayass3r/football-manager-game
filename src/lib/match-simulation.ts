// Match simulation logic for football manager game

export interface MatchEvent {
  minute: number
  type: 'goal' | 'yellow_card' | 'red_card' | 'injury' | 'substitution'
  team: 'home' | 'away'
  playerName?: string
  assistBy?: string
  description: string
}

export interface TeamStrength {
  overall: number
  attackStrength: number
  midfieldStrength: number
  defenseStrength: number
  gkStrength: number
  morale: number
  fitness: number
}

export interface MatchResult {
  homeGoals: number
  awayGoals: number
  events: MatchEvent[]
  homeStrength: number
  awayStrength: number
}

interface PlayerData {
  name: string
  position: string
  overall: number
  shooting: number
  passing: number
  dribbling: number
  defending: number
  pace: number
  physical: number
  morale: number
  fitness: number
  form: number
  isStarter: boolean
}

interface ClubData {
  formation: string
  morale: number
  players: PlayerData[]
}

// Formation bonuses for different aspects
const formationBonuses: Record<string, { attack: number; midfield: number; defense: number }> = {
  '4-3-3': { attack: 1.1, midfield: 1.0, defense: 0.95 },
  '4-4-2': { attack: 1.0, midfield: 1.05, defense: 1.0 },
  '3-5-2': { attack: 1.0, midfield: 1.15, defense: 0.9 },
  '4-2-3-1': { attack: 1.05, midfield: 1.1, defense: 0.95 },
  '5-3-2': { attack: 0.9, midfield: 1.0, defense: 1.15 },
  '4-5-1': { attack: 0.85, midfield: 1.15, defense: 1.05 },
  '3-4-3': { attack: 1.15, midfield: 1.0, defense: 0.85 },
  '4-1-4-1': { attack: 0.9, midfield: 1.1, defense: 1.05 },
}

function getFormationBonus(formation: string): { attack: number; midfield: number; defense: number } {
  return formationBonuses[formation] || { attack: 1.0, midfield: 1.0, defense: 1.0 }
}

function calculateTeamStrength(club: ClubData): TeamStrength {
  const starters = club.players.filter(p => p.isStarter)
  
  if (starters.length === 0) {
    return { overall: 40, attackStrength: 40, midfieldStrength: 40, defenseStrength: 40, gkStrength: 40, morale: 50, fitness: 50 }
  }
  
  const formationBonus = getFormationBonus(club.formation)
  const moraleFactor = club.morale / 100
  
  // Calculate position-based strengths
  const attackers = starters.filter(p => ['ST', 'CF', 'LM', 'RM'].includes(p.position))
  const midfielders = starters.filter(p => ['CM', 'LM', 'RM'].includes(p.position))
  const defenders = starters.filter(p => ['CB', 'LB', 'RB'].includes(p.position))
  const goalkeepers = starters.filter(p => p.position === 'GK')
  
  const avgAttack = attackers.length > 0 ? attackers.reduce((s, p) => s + (p.shooting + p.dribbling + p.pace) / 3, 0) / attackers.length : 50
  const avgMidfield = midfielders.length > 0 ? midfielders.reduce((s, p) => s + (p.passing + p.dribbling + p.physical) / 3, 0) / midfielders.length : 50
  const avgDefense = defenders.length > 0 ? defenders.reduce((s, p) => s + (p.defending + p.physical + p.pace) / 3, 0) / defenders.length : 50
  const avgGK = goalkeepers.length > 0 ? goalkeepers.reduce((s, p) => s + (p.defending + p.physical + p.passing) / 3, 0) / goalkeepers.length : 50
  
  // Average fitness and form of starters
  const avgFitness = starters.reduce((s, p) => s + p.fitness, 0) / starters.length
  const avgForm = starters.reduce((s, p) => s + p.form, 0) / starters.length
  const fitnessFactor = avgFitness / 100
  const formFactor = avgForm / 100
  
  const attackStrength = avgAttack * formationBonus.attack * moraleFactor * formFactor
  const midfieldStrength = avgMidfield * formationBonus.midfield * moraleFactor * formFactor
  const defenseStrength = avgDefense * formationBonus.defense * moraleFactor * fitnessFactor
  const gkStrength = avgGK * moraleFactor * formFactor
  
  const overall = (attackStrength + midfieldStrength + defenseStrength + gkStrength) / 4
  
  return {
    overall: Math.round(overall),
    attackStrength: Math.round(attackStrength),
    midfieldStrength: Math.round(midfieldStrength),
    defenseStrength: Math.round(defenseStrength),
    gkStrength: Math.round(gkStrength),
    morale: club.morale,
    fitness: Math.round(avgFitness),
  }
}

function weightedRandom(items: { name: string; weight: number }[]): string {
  const totalWeight = items.reduce((s, i) => s + i.weight, 0)
  let random = Math.random() * totalWeight
  for (const item of items) {
    random -= item.weight
    if (random <= 0) return item.name
  }
  return items[items.length - 1].name
}

export function simulateMatch(homeClub: ClubData, awayClub: ClubData): MatchResult {
  const homeStrength = calculateTeamStrength(homeClub)
  const awayStrength = calculateTeamStrength(awayClub)
  
  const events: MatchEvent[] = []
  let homeGoals = 0
  let awayGoals = 0
  
  const homeStarters = homeClub.players.filter(p => p.isStarter)
  const awayStarters = awayClub.players.filter(p => p.isStarter)
  const homeSubstitutes = homeClub.players.filter(p => !p.isStarter)
  const awaySubstitutes = awayClub.players.filter(p => !p.isStarter)
  
  // Base goal probability per minute (scaled so avg match has 2-3 goals)
  const baseGoalProb = 0.025
  
  // Strength ratio affects goal probability
  const homeAttackVsDefense = homeStrength.attackStrength / Math.max(awayStrength.defenseStrength, 30)
  const awayAttackVsDefense = awayStrength.attackStrength / Math.max(homeStrength.defenseStrength, 30)
  
  const homeGoalProb = baseGoalProb * homeAttackVsDefense * (homeStrength.midfieldStrength / Math.max(awayStrength.midfieldStrength, 30)) * 0.7
  const awayGoalProb = baseGoalProb * awayAttackVsDefense * (awayStrength.midfieldStrength / Math.max(homeStrength.midfieldStrength, 30)) * 0.7
  
  // Simulate each minute
  for (let minute = 1; minute <= 90; minute++) {
    // Home team goal chance
    if (Math.random() < homeGoalProb) {
      homeGoals++
      const scorers = homeStarters.filter(p => ['ST', 'CF', 'LM', 'RM', 'CM'].includes(p.position))
      const scorer = scorers.length > 0
        ? weightedRandom(scorers.map(p => ({ name: p.name, weight: p.shooting })))
        : homeStarters[Math.floor(Math.random() * homeStarters.length)].name
      const assisters = homeStarters.filter(p => p.name !== scorer && ['CM', 'LM', 'RM', 'LB', 'RB'].includes(p.position))
      const assister = assisters.length > 0 && Math.random() > 0.4
        ? weightedRandom(assisters.map(p => ({ name: p.name, weight: p.passing })))
        : undefined
      
      events.push({
        minute,
        type: 'goal',
        team: 'home',
        playerName: scorer,
        assistBy: assister,
        description: assister 
          ? `⚽ هدف! ${scorer} يسجل في الدقيقة ${minute} (صناعة: ${assister})`
          : `⚽ هدف! ${scorer} يسجل في الدقيقة ${minute}`,
      })
    }
    
    // Away team goal chance
    if (Math.random() < awayGoalProb) {
      awayGoals++
      const scorers = awayStarters.filter(p => ['ST', 'CF', 'LM', 'RM', 'CM'].includes(p.position))
      const scorer = scorers.length > 0
        ? weightedRandom(scorers.map(p => ({ name: p.name, weight: p.shooting })))
        : awayStarters[Math.floor(Math.random() * awayStarters.length)].name
      const assisters = awayStarters.filter(p => p.name !== scorer && ['CM', 'LM', 'RM', 'LB', 'RB'].includes(p.position))
      const assister = assisters.length > 0 && Math.random() > 0.4
        ? weightedRandom(assisters.map(p => ({ name: p.name, weight: p.passing })))
        : undefined
      
      events.push({
        minute,
        type: 'goal',
        team: 'away',
        playerName: scorer,
        assistBy: assister,
        description: assister 
          ? `⚽ هدف! ${scorer} يسجل في الدقيقة ${minute} (صناعة: ${assister})`
          : `⚽ هدف! ${scorer} يسجل في الدقيقة ${minute}`,
      })
    }
    
    // Yellow card chance (~3-4 per match)
    if (Math.random() < 0.004) {
      const isHome = Math.random() > 0.5
      const team = isHome ? 'home' : 'away'
      const teamPlayers = isHome ? homeStarters : awayStarters
      const defenders = teamPlayers.filter(p => ['CB', 'LB', 'RB', 'CM'].includes(p.position))
      const player = defenders.length > 0
        ? defenders[Math.floor(Math.random() * defenders.length)].name
        : teamPlayers[Math.floor(Math.random() * teamPlayers.length)].name
      
      events.push({
        minute,
        type: 'yellow_card',
        team,
        playerName: player,
        description: `🟨 بطاقة صفراء لـ ${player} في الدقيقة ${minute}`,
      })
    }
    
    // Red card chance (~0.1 per match)
    if (Math.random() < 0.0015) {
      const isHome = Math.random() > 0.5
      const team = isHome ? 'home' : 'away'
      const teamPlayers = isHome ? homeStarters : awayStarters
      const player = teamPlayers[Math.floor(Math.random() * teamPlayers.length)].name
      
      events.push({
        minute,
        type: 'red_card',
        team,
        playerName: player,
        description: `🟥 بطاقة حمراء لـ ${player} في الدقيقة ${minute}`,
      })
    }
    
    // Injury chance (~0.5 per match)
    if (Math.random() < 0.006) {
      const isHome = Math.random() > 0.5
      const team = isHome ? 'home' : 'away'
      const teamPlayers = isHome ? homeStarters : awayStarters
      const player = teamPlayers[Math.floor(Math.random() * teamPlayers.length)].name
      
      events.push({
        minute,
        type: 'injury',
        team,
        playerName: player,
        description: `🏥 إصابة لـ ${player} في الدقيقة ${minute}`,
      })
    }
    
    // Substitution chance (60th minute onwards)
    if (minute >= 55 && minute % 10 === 0 && Math.random() < 0.6) {
      const isHome = Math.random() > 0.5
      const team = isHome ? 'home' : 'away'
      const subs = isHome ? homeSubstitutes : awaySubstitutes
      const starters = isHome ? homeStarters : awayStarters
      
      if (subs.length > 0 && starters.length > 0) {
        const subOut = starters[Math.floor(Math.random() * starters.length)].name
        const subIn = subs[Math.floor(Math.random() * subs.length)].name
        
        events.push({
          minute,
          type: 'substitution',
          team,
          playerName: subIn,
          description: `🔄 تبديل في الدقيقة ${minute}: خروج ${subOut} ودخول ${subIn}`,
        })
      }
    }
  }
  
  // Sort events by minute
  events.sort((a, b) => a.minute - b.minute)
  
  // Cap events to a reasonable number (3-8 meaningful events)
  // Keep all goals and red cards, randomly drop some yellow cards if too many
  const goals = events.filter(e => e.type === 'goal')
  const redCards = events.filter(e => e.type === 'red_card')
  const injuries = events.filter(e => e.type === 'injury')
  const substitutions = events.filter(e => e.type === 'substitution')
  let yellowCards = events.filter(e => e.type === 'yellow_card')
  
  // Limit yellow cards to max 3
  if (yellowCards.length > 3) {
    yellowCards = yellowCards.slice(0, 3)
  }
  
  // Limit substitutions to max 3
  const limitedSubs = substitutions.slice(0, 3)
  
  const finalEvents = [
    ...goals,
    ...redCards,
    ...injuries,
    ...limitedSubs,
    ...yellowCards,
  ].sort((a, b) => a.minute - b.minute)
  
  return {
    homeGoals,
    awayGoals,
    events: finalEvents,
    homeStrength: homeStrength.overall,
    awayStrength: awayStrength.overall,
  }
}

export function calculatePlayerFitnessUpdate(players: PlayerData[], played: boolean): { playerId: string; fitnessDelta: number; formDelta: number }[] {
  return players
    .filter(p => p.isStarter)
    .map(player => {
      const fitnessLoss = played ? randomInt(5, 15) : 0
      const formChange = played ? randomInt(-5, 10) : randomInt(0, 5)
      return {
        playerId: player.name, // We'll use name as identifier in context
        fitnessDelta: -fitnessLoss,
        formDelta: formChange,
      }
    })
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
