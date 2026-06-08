import { create } from 'zustand'

// Types
export interface User {
  id: string
  username: string
  coins: number
  gems: number
  level: number
  xp: number
  avatar: string
  createdAt: string
  updatedAt: string
  club?: Club | null
}

export interface Club {
  id: string
  name: string
  logo: string
  primaryColor: string
  secondaryColor: string
  formation: string
  morale: number
  reputation: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  stadiumName: string
  stadiumLevel: number
  userId: string
  players: Player[]
  createdAt: string
  updatedAt: string
}

export interface Player {
  id: string
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
  morale: number
  fitness: number
  form: number
  isStarter: boolean
  shirtNumber: number | null
  clubId: string
}

export interface MatchEvent {
  minute: number
  type: 'goal' | 'yellow_card' | 'red_card' | 'injury' | 'substitution'
  team: 'home' | 'away'
  playerName?: string
  assistBy?: string
  description: string
}

export interface MatchResult {
  id?: string
  homeGoals: number
  awayGoals: number
  homeStrength: number
  awayStrength: number
  events: MatchEvent[]
}

export interface MatchHistoryItem {
  id: string
  homeClubId: string
  awayClubId: string
  homeGoals: number
  awayGoals: number
  status: string
  events: MatchEvent[]
  playedAt: string
  homeClub: { id: string; name: string; logo: string }
  awayClub: { id: string; name: string; logo: string }
  isHome: boolean
  result: 'win' | 'loss' | 'draw'
}

export interface TransferListing {
  id: string
  playerId: string
  sellerClubId: string
  price: number
  status: string
  createdAt: string
  player: Player
}

export interface Tournament {
  id: string
  name: string
  type: string
  tier: number
  maxTeams: number
  prize: number
  prizeGems: number
  season: number
  status: string
  currentTeams: number
  createdAt: string
}

export interface TournamentStanding {
  id: string
  tournamentId: string
  clubId: string
  groupNumber: number
  points: number
  played: number
  won: number
  drawn: number
  lost: number
  gf: number
  ga: number
  gd: number
  position: number
  club: { id: string; name: string; logo: string }
}

export type TabType = 'home' | 'squad' | 'match' | 'market' | 'tournaments'

export type GameScreen = 'auth' | 'club-creation' | 'main'

export interface Notification {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

// Helper for API calls
async function apiCall(url: string, options: RequestInit = {}) {
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }
  if (userId) {
    headers['x-user-id'] = userId
  }
  const res = await fetch(url, { ...options, headers })
  const data = await res.json()
  if (!data.success) {
    throw new Error(data.error || 'حدث خطأ')
  }
  return data
}

interface GameStore {
  // State
  user: User | null
  club: Club | null
  players: Player[]
  currentTab: TabType
  currentScreen: GameScreen
  matchResult: MatchResult | null
  matchHistory: MatchHistoryItem[]
  transferMarket: TransferListing[]
  tournaments: Tournament[]
  tournamentStandings: Record<string, TournamentStanding[]>
  notifications: Notification[]
  isLoading: boolean
  authMode: 'login' | 'register'
  selectedPlayer: Player | null
  showPlayerDetail: boolean

  // Auth
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string) => Promise<void>
  logout: () => void
  setAuthMode: (mode: 'login' | 'register') => void

  // Navigation
  setTab: (tab: TabType) => void
  setScreen: (screen: GameScreen) => void

  // Club
  createClub: (data: { name: string; logo: string; primaryColor: string; secondaryColor: string; formation: string }) => Promise<void>
  fetchClub: () => Promise<void>
  updateFormation: (formation: string) => Promise<void>

  // Players
  fetchPlayers: () => Promise<void>
  toggleStarter: (playerId: string) => Promise<void>
  trainPlayer: (playerId: string) => Promise<void>
  setSelectedPlayer: (player: Player | null) => void
  setShowPlayerDetail: (show: boolean) => void

  // Transfer Market
  fetchMarket: () => Promise<void>
  sellPlayer: (playerId: string, price: number) => Promise<void>
  buyPlayer: (listingId: string) => Promise<void>
  cancelListing: (listingId: string) => Promise<void>

  // Match
  simulateMatch: (homeClubId: string, awayClubId: string) => Promise<void>
  fetchHistory: () => Promise<void>
  createAiOpponent: () => Promise<{ id: string; name: string; logo: string; primaryColor: string; formation: string; avgOverall: number }>

  // Tournament
  fetchTournaments: () => Promise<void>
  joinTournament: (tournamentId: string) => Promise<void>
  simulateRound: (tournamentId: string) => Promise<void>
  fetchStandings: (tournamentId: string) => Promise<void>
  seedTournaments: () => Promise<void>

  // Economy
  claimDailyReward: () => Promise<void>
  watchAd: () => Promise<void>

  // Notifications
  addNotification: (message: string, type?: 'success' | 'error' | 'info') => void
  removeNotification: (id: string) => void

  // Profile
  fetchProfile: () => Promise<void>
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  user: null,
  club: null,
  players: [],
  currentTab: 'home',
  currentScreen: 'auth',
  matchResult: null,
  matchHistory: [],
  transferMarket: [],
  tournaments: [],
  tournamentStandings: {},
  notifications: [],
  isLoading: false,
  authMode: 'login',
  selectedPlayer: null,
  showPlayerDetail: false,

  // Auth
  login: async (username: string, password: string) => {
    set({ isLoading: true })
    try {
      const data = await apiCall('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      })
      const user = data.data as User
      localStorage.setItem('userId', user.id)
      set({
        user,
        club: user.club || null,
        players: user.club?.players || [],
        currentScreen: user.club ? 'main' : 'club-creation',
        isLoading: false,
      })
      get().addNotification('مرحباً بك! تم تسجيل الدخول بنجاح', 'success')
    } catch (error) {
      set({ isLoading: false })
      get().addNotification((error as Error).message, 'error')
    }
  },

  register: async (username: string, password: string) => {
    set({ isLoading: true })
    try {
      const data = await apiCall('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      })
      const user = data.data as User
      localStorage.setItem('userId', user.id)
      set({
        user,
        club: null,
        players: [],
        currentScreen: 'club-creation',
        isLoading: false,
      })
      get().addNotification('تم إنشاء الحساب بنجاح!', 'success')
    } catch (error) {
      set({ isLoading: false })
      get().addNotification((error as Error).message, 'error')
    }
  },

  logout: () => {
    localStorage.removeItem('userId')
    set({
      user: null,
      club: null,
      players: [],
      currentScreen: 'auth',
      currentTab: 'home',
      matchResult: null,
      matchHistory: [],
      transferMarket: [],
      tournaments: [],
      tournamentStandings: {},
    })
  },

  setAuthMode: (mode) => set({ authMode: mode }),

  // Navigation
  setTab: (tab) => set({ currentTab: tab }),
  setScreen: (screen) => set({ currentScreen: screen }),

  // Club
  createClub: async (data) => {
    set({ isLoading: true })
    try {
      const result = await apiCall('/api/club/create', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      const club = result.data as Club
      set({
        club,
        players: club.players || [],
        currentScreen: 'main',
        isLoading: false,
      })
      get().addNotification('تم إنشاء النادي بنجاح! ⚽', 'success')
      // Seed tournaments after club creation
      get().seedTournaments()
    } catch (error) {
      set({ isLoading: false })
      get().addNotification((error as Error).message, 'error')
    }
  },

  fetchClub: async () => {
    try {
      const data = await apiCall('/api/club')
      const club = data.data as Club
      set({ club, players: club.players || [] })
    } catch {
      // Club not found - might need to create one
    }
  },

  updateFormation: async (formation) => {
    try {
      await apiCall('/api/club/formation', {
        method: 'PUT',
        body: JSON.stringify({ formation }),
      })
      const club = get().club
      if (club) {
        set({ club: { ...club, formation } })
      }
      get().addNotification('تم تحديث التشكيلة', 'success')
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  // Players
  fetchPlayers: async () => {
    try {
      const data = await apiCall('/api/players')
      set({ players: data.data })
    } catch {
      // silent
    }
  },

  toggleStarter: async (playerId) => {
    try {
      await apiCall(`/api/players/${playerId}/toggle-starter`, { method: 'PUT' })
      await get().fetchPlayers()
      get().addNotification('تم تغيير حالة اللاعب', 'success')
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  trainPlayer: async (playerId) => {
    try {
      await apiCall(`/api/players/${playerId}/train`, { method: 'POST' })
      await get().fetchPlayers()
      await get().fetchProfile()
      get().addNotification('تم تدريب اللاعب بنجاح! 💪', 'success')
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  setSelectedPlayer: (player) => set({ selectedPlayer: player }),
  setShowPlayerDetail: (show) => set({ showPlayerDetail: show }),

  // Transfer Market
  fetchMarket: async () => {
    try {
      const data = await apiCall('/api/transfer-market')
      set({ transferMarket: data.data })
    } catch {
      // silent
    }
  },

  sellPlayer: async (playerId, price) => {
    try {
      await apiCall('/api/transfer-market/sell', {
        method: 'POST',
        body: JSON.stringify({ playerId, price }),
      })
      await get().fetchPlayers()
      await get().fetchMarket()
      get().addNotification('تم وضع اللاعب في السوق', 'success')
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  buyPlayer: async (listingId) => {
    try {
      await apiCall('/api/transfer-market/buy', {
        method: 'POST',
        body: JSON.stringify({ listingId }),
      })
      await get().fetchPlayers()
      await get().fetchMarket()
      await get().fetchProfile()
      get().addNotification('تم شراء اللاعب بنجاح! 🎉', 'success')
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  cancelListing: async (listingId) => {
    try {
      await apiCall(`/api/transfer-market/${listingId}`, { method: 'DELETE' })
      await get().fetchMarket()
      await get().fetchPlayers()
      get().addNotification('تم إلغاء البيع', 'success')
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  // Match
  simulateMatch: async (homeClubId, awayClubId) => {
    set({ isLoading: true })
    try {
      const data = await apiCall('/api/match/simulate', {
        method: 'POST',
        body: JSON.stringify({ homeClubId, awayClubId }),
      })
      set({ matchResult: data.data.match, isLoading: false })
      await get().fetchProfile()
      await get().fetchHistory()
    } catch (error) {
      set({ isLoading: false })
      get().addNotification((error as Error).message, 'error')
    }
  },

  fetchHistory: async () => {
    try {
      const data = await apiCall('/api/match/history')
      set({ matchHistory: data.data })
    } catch {
      // silent
    }
  },

  createAiOpponent: async () => {
    const data = await apiCall('/api/ai-opponent', { method: 'POST' })
    return data.data as { id: string; name: string; logo: string; primaryColor: string; formation: string; avgOverall: number }
  },

  // Tournament
  fetchTournaments: async () => {
    try {
      const data = await apiCall('/api/tournaments')
      set({ tournaments: data.data })
    } catch {
      // silent
    }
  },

  joinTournament: async (tournamentId) => {
    try {
      await apiCall(`/api/tournaments/${tournamentId}/join`, { method: 'POST' })
      await get().fetchTournaments()
      get().addNotification('تم الانضمام للبطولة! 🏆', 'success')
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  simulateRound: async (tournamentId) => {
    try {
      await apiCall(`/api/tournaments/${tournamentId}/simulate-round`, { method: 'POST' })
      await get().fetchStandings(tournamentId)
      get().addNotification('تم محاكاة الجولة', 'success')
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  fetchStandings: async (tournamentId) => {
    try {
      const data = await apiCall(`/api/tournaments/${tournamentId}/standings`)
      set({ tournamentStandings: { ...get().tournamentStandings, [tournamentId]: data.data.standings } })
    } catch {
      // silent
    }
  },

  seedTournaments: async () => {
    try {
      await apiCall('/api/tournaments/seed', { method: 'POST' })
      await get().fetchTournaments()
    } catch {
      // silent - tournaments may already exist
    }
  },

  // Economy
  claimDailyReward: async () => {
    try {
      const data = await apiCall('/api/economy/daily-reward', { method: 'POST' })
      const updatedUser = data.data.user as User
      set({ user: updatedUser })
      get().addNotification(`تم استلام المكافأة! 🎁 ${data.data.reward.coins} عملة`, 'success')
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  watchAd: async () => {
    try {
      const data = await apiCall('/api/economy/watch-ad', { method: 'POST' })
      const updatedUser = data.data.user as User
      set({ user: updatedUser })
      get().addNotification(`حصلت على ${data.data.coins} عملة و ${data.data.gems} جوهرة! 📺`, 'success')
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  // Notifications
  addNotification: (message, type = 'info') => {
    const id = Date.now().toString()
    set({ notifications: [...get().notifications, { id, message, type }] })
    setTimeout(() => get().removeNotification(id), 3000)
  },

  removeNotification: (id) => {
    set({ notifications: get().notifications.filter(n => n.id !== id) })
  },

  // Profile
  fetchProfile: async () => {
    try {
      const data = await apiCall('/api/user/profile')
      const user = data.data as User
      set({
        user,
        club: user.club || null,
        players: user.club?.players || [],
      })
    } catch {
      // silent
    }
  },
}))
