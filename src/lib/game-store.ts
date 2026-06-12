import { create } from 'zustand'

// Types
export interface User {
  id: string
  username: string | null
  email: string
  coins: number
  gems: number
  level: number
  xp: number
  avatar: string
  createdAt: string
  updatedAt: string
  club?: Club | null
  soundEnabled?: boolean
  isAdmin?: boolean
  isBanned?: boolean
  banReason?: string
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
  kitStyle?: string
  kitPattern?: string
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

export interface PlayerPack {
  id: string
  name: string
  type: string // "bronze", "silver", "gold", "legendary"
  price: number
  gemPrice: number
  description: string
  minOverall: number
  maxOverall: number
  playerCount: number
  isActive: boolean
}

export interface PackOpeningResult {
  players: Player[]
  packType: string
}

export interface AchievementData {
  id: string
  achievementId: string
  name: string
  description: string
  icon: string
  category: string
  requirement: number
  rewardCoins: number
  rewardGems: number
  rewardTitle: string | null
  unlocked: boolean
  unlockedAt: string | null
  claimed: boolean
  progress: number // 0-100 percentage
}

export interface LeaderboardEntry {
  id: string
  userId: string
  clubId: string
  score: number
  rank: number
  type: string
  user: { username: string; avatar: string }
  club: { name: string; logo: string; primaryColor: string; wins: number; draws: number; losses: number }
}

export interface GameEventData {
  id: string
  type: string
  title: string
  description: string
  startDate: string
  endDate: string
  isActive: boolean
}

export interface SeasonData {
  id: string
  number: number
  name: string
  startDate: string
  endDate: string
  status: string
}

export type TabType = 'home' | 'squad' | 'match' | 'market' | 'tournaments' | 'packs' | 'leaderboard' | 'achievements' | 'admin'

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

  // New state
  playerPacks: PlayerPack[]
  packOpeningResult: PackOpeningResult | null
  achievements: AchievementData[]
  leaderboard: LeaderboardEntry[]
  gameEvents: GameEventData[]
  currentSeason: SeasonData | null
  showPackOpening: boolean

  // Auth
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, username?: string) => Promise<void>
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

  // Packs
  fetchPacks: () => Promise<void>
  openPack: (packId: string) => Promise<void>

  // Achievements
  fetchAchievements: () => Promise<void>
  claimAchievement: (achievementId: string) => Promise<void>
  checkAchievements: () => Promise<void>

  // Leaderboard
  fetchLeaderboard: (type?: string) => Promise<void>
  updateLeaderboard: () => Promise<void>

  // Events & Season
  fetchGameEvents: () => Promise<void>
  fetchSeason: () => Promise<void>
  advanceSeason: () => Promise<void>

  // Settings
  toggleSound: () => Promise<void>
  updateKit: (kitStyle: string, kitPattern: string) => Promise<void>

  // Admin
  adminTab: string
  setAdminTab: (tab: string) => void
  adminDashboard: any | null
  adminUsers: any[]
  adminClubs: any[]
  adminPlayers: any[]
  adminTournaments: any[]
  adminPacks: any[]
  adminEvents: any[]
  adminAchievements: any[]
  adminPagination: any
  fetchAdminDashboard: () => Promise<void>
  fetchAdminUsers: (page?: number, search?: string, filter?: string) => Promise<void>
  updateAdminUser: (userId: string, data: any) => Promise<void>
  deleteAdminUser: (userId: string) => Promise<void>
  fetchAdminClubs: (page?: number, search?: string) => Promise<void>
  updateAdminClub: (clubId: string, data: any) => Promise<void>
  deleteAdminClub: (clubId: string) => Promise<void>
  fetchAdminPlayers: (page?: number, search?: string, position?: string, minOverall?: number) => Promise<void>
  createAdminPlayer: (data: any) => Promise<void>
  updateAdminPlayer: (playerId: string, data: any) => Promise<void>
  deleteAdminPlayer: (playerId: string) => Promise<void>
  fetchAdminTournaments: () => Promise<void>
  createAdminTournament: (data: any) => Promise<void>
  updateAdminTournament: (tournamentId: string, data: any) => Promise<void>
  deleteAdminTournament: (tournamentId: string) => Promise<void>
  fetchAdminPacks: () => Promise<void>
  createAdminPack: (data: any) => Promise<void>
  updateAdminPack: (packId: string, data: any) => Promise<void>
  deleteAdminPack: (packId: string) => Promise<void>
  fetchAdminEvents: () => Promise<void>
  createAdminEvent: (data: any) => Promise<void>
  updateAdminEvent: (eventId: string, data: any) => Promise<void>
  deleteAdminEvent: (eventId: string) => Promise<void>
  fetchAdminAchievements: () => Promise<void>
  createAdminAchievement: (data: any) => Promise<void>
  updateAdminAchievement: (achievementId: string, data: any) => Promise<void>
  deleteAdminAchievement: (achievementId: string) => Promise<void>
  sendAnnouncement: (title: string, message: string, type?: string) => Promise<void>
  adminEconomyAction: (action: string, userId: string, amount: number) => Promise<void>
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

  // New state
  playerPacks: [],
  packOpeningResult: null,
  achievements: [],
  leaderboard: [],
  gameEvents: [],
  currentSeason: null,
  showPackOpening: false,

  // Admin state
  adminTab: 'dashboard',
  adminDashboard: null,
  adminUsers: [],
  adminClubs: [],
  adminPlayers: [],
  adminTournaments: [],
  adminPacks: [],
  adminEvents: [],
  adminAchievements: [],
  adminPagination: { page: 1, limit: 20, total: 0, pages: 0 },

  // Auth
  login: async (email: string, password: string) => {
    set({ isLoading: true })
    try {
      const data = await apiCall('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
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

  register: async (email: string, password: string, username?: string) => {
    set({ isLoading: true })
    try {
      const data = await apiCall('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, username }),
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
      playerPacks: [],
      packOpeningResult: null,
      achievements: [],
      leaderboard: [],
      gameEvents: [],
      currentSeason: null,
      showPackOpening: false,
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

  // Packs
  fetchPacks: async () => {
    try {
      const data = await apiCall('/api/packs')
      set({ playerPacks: data.data })
    } catch {
      // silent
    }
  },

  openPack: async (packId: string) => {
    set({ isLoading: true })
    try {
      const data = await apiCall(`/api/packs/${packId}/open`, { method: 'POST' })
      const result = data.data as PackOpeningResult
      set({
        packOpeningResult: result,
        showPackOpening: true,
        isLoading: false,
      })
      await get().fetchProfile()
      await get().fetchPlayers()
    } catch (error) {
      set({ isLoading: false })
      get().addNotification((error as Error).message, 'error')
    }
  },

  // Achievements
  fetchAchievements: async () => {
    try {
      const data = await apiCall('/api/achievements')
      set({ achievements: data.data })
    } catch {
      // silent
    }
  },

  claimAchievement: async (achievementId: string) => {
    try {
      await apiCall(`/api/achievements/${achievementId}/claim`, { method: 'POST' })
      await get().fetchAchievements()
      await get().fetchProfile()
      get().addNotification('تم استلام مكافأة الإنجاز! 🎉', 'success')
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  checkAchievements: async () => {
    try {
      await apiCall('/api/achievements/check', { method: 'POST' })
      await get().fetchAchievements()
    } catch {
      // silent
    }
  },

  // Leaderboard
  fetchLeaderboard: async (type?: string) => {
    try {
      const query = type ? `?type=${type}` : '?type=global'
      const data = await apiCall(`/api/leaderboard${query}`)
      set({ leaderboard: data.data })
    } catch {
      // silent
    }
  },

  updateLeaderboard: async () => {
    try {
      await apiCall('/api/leaderboard/update', { method: 'POST' })
      await get().fetchLeaderboard()
      get().addNotification('تم تحديث ترتيبك!', 'success')
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  // Events & Season
  fetchGameEvents: async () => {
    try {
      const data = await apiCall('/api/events')
      set({ gameEvents: data.data })
    } catch {
      // silent
    }
  },

  fetchSeason: async () => {
    try {
      const data = await apiCall('/api/seasons')
      set({ currentSeason: data.data })
    } catch {
      // silent
    }
  },

  advanceSeason: async () => {
    try {
      await apiCall('/api/seasons/advance', { method: 'POST' })
      await get().fetchSeason()
      get().addNotification('بدأ موسم جديد! 🌟', 'success')
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  // Settings
  toggleSound: async () => {
    try {
      const data = await apiCall('/api/user/sound-toggle', { method: 'POST' })
      const updatedUser = data.data as User
      set({ user: updatedUser })
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  updateKit: async (kitStyle: string, kitPattern: string) => {
    try {
      await apiCall('/api/club/kit', {
        method: 'PUT',
        body: JSON.stringify({ kitStyle, kitPattern }),
      })
      const club = get().club
      if (club) {
        set({ club: { ...club, kitStyle, kitPattern } })
      }
      get().addNotification('تم تحديث طقم الفريق! 👕', 'success')
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  // Admin actions
  setAdminTab: (tab) => set({ adminTab: tab }),

  fetchAdminDashboard: async () => {
    try {
      const data = await apiCall('/api/admin/dashboard')
      set({ adminDashboard: data.data })
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  fetchAdminUsers: async (page = 1, search = '', filter = 'all') => {
    try {
      const params = new URLSearchParams({ page: String(page), search, filter })
      const data = await apiCall(`/api/admin/users?${params}`)
      set({ adminUsers: data.data, adminPagination: data.pagination })
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  updateAdminUser: async (userId, updateData) => {
    try {
      await apiCall(`/api/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      })
      await get().fetchAdminUsers()
      get().addNotification('تم تحديث المستخدم بنجاح', 'success')
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  deleteAdminUser: async (userId) => {
    try {
      await apiCall(`/api/admin/users/${userId}`, { method: 'DELETE' })
      await get().fetchAdminUsers()
      get().addNotification('تم حذف المستخدم بنجاح', 'success')
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  fetchAdminClubs: async (page = 1, search = '') => {
    try {
      const params = new URLSearchParams({ page: String(page), search })
      const data = await apiCall(`/api/admin/clubs?${params}`)
      set({ adminClubs: data.data, adminPagination: data.pagination })
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  updateAdminClub: async (clubId, updateData) => {
    try {
      await apiCall(`/api/admin/clubs/${clubId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      })
      await get().fetchAdminClubs()
      get().addNotification('تم تحديث النادي بنجاح', 'success')
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  deleteAdminClub: async (clubId) => {
    try {
      await apiCall(`/api/admin/clubs/${clubId}`, { method: 'DELETE' })
      await get().fetchAdminClubs()
      get().addNotification('تم حذف النادي بنجاح', 'success')
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  fetchAdminPlayers: async (page = 1, search = '', position = '', minOverall = 0) => {
    try {
      const params = new URLSearchParams({ page: String(page), search, position, minOverall: String(minOverall) })
      const data = await apiCall(`/api/admin/players?${params}`)
      set({ adminPlayers: data.data, adminPagination: data.pagination })
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  createAdminPlayer: async (data) => {
    try {
      await apiCall('/api/admin/players', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      await get().fetchAdminPlayers()
      get().addNotification('تم إنشاء اللاعب بنجاح', 'success')
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  updateAdminPlayer: async (playerId, updateData) => {
    try {
      await apiCall(`/api/admin/players/${playerId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      })
      await get().fetchAdminPlayers()
      get().addNotification('تم تحديث اللاعب بنجاح', 'success')
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  deleteAdminPlayer: async (playerId) => {
    try {
      await apiCall(`/api/admin/players/${playerId}`, { method: 'DELETE' })
      await get().fetchAdminPlayers()
      get().addNotification('تم حذف اللاعب بنجاح', 'success')
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  fetchAdminTournaments: async () => {
    try {
      const data = await apiCall('/api/admin/tournaments')
      set({ adminTournaments: data.data })
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  createAdminTournament: async (data) => {
    try {
      await apiCall('/api/admin/tournaments', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      await get().fetchAdminTournaments()
      get().addNotification('تم إنشاء البطولة بنجاح', 'success')
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  updateAdminTournament: async (tournamentId, updateData) => {
    try {
      await apiCall(`/api/admin/tournaments/${tournamentId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      })
      await get().fetchAdminTournaments()
      get().addNotification('تم تحديث البطولة بنجاح', 'success')
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  deleteAdminTournament: async (tournamentId) => {
    try {
      await apiCall(`/api/admin/tournaments/${tournamentId}`, { method: 'DELETE' })
      await get().fetchAdminTournaments()
      get().addNotification('تم حذف البطولة بنجاح', 'success')
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  fetchAdminPacks: async () => {
    try {
      const data = await apiCall('/api/admin/packs')
      set({ adminPacks: data.data })
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  createAdminPack: async (data) => {
    try {
      await apiCall('/api/admin/packs', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      await get().fetchAdminPacks()
      get().addNotification('تم إنشاء الحزمة بنجاح', 'success')
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  updateAdminPack: async (packId, updateData) => {
    try {
      await apiCall(`/api/admin/packs/${packId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      })
      await get().fetchAdminPacks()
      get().addNotification('تم تحديث الحزمة بنجاح', 'success')
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  deleteAdminPack: async (packId) => {
    try {
      await apiCall(`/api/admin/packs/${packId}`, { method: 'DELETE' })
      await get().fetchAdminPacks()
      get().addNotification('تم حذف الحزمة بنجاح', 'success')
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  fetchAdminEvents: async () => {
    try {
      const data = await apiCall('/api/admin/events')
      set({ adminEvents: data.data })
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  createAdminEvent: async (data) => {
    try {
      await apiCall('/api/admin/events', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      await get().fetchAdminEvents()
      get().addNotification('تم إنشاء الحدث بنجاح', 'success')
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  updateAdminEvent: async (eventId, updateData) => {
    try {
      await apiCall(`/api/admin/events/${eventId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      })
      await get().fetchAdminEvents()
      get().addNotification('تم تحديث الحدث بنجاح', 'success')
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  deleteAdminEvent: async (eventId) => {
    try {
      await apiCall(`/api/admin/events/${eventId}`, { method: 'DELETE' })
      await get().fetchAdminEvents()
      get().addNotification('تم حذف الحدث بنجاح', 'success')
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  fetchAdminAchievements: async () => {
    try {
      const data = await apiCall('/api/admin/achievements')
      set({ adminAchievements: data.data })
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  createAdminAchievement: async (data) => {
    try {
      await apiCall('/api/admin/achievements', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      await get().fetchAdminAchievements()
      get().addNotification('تم إنشاء الإنجاز بنجاح', 'success')
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  updateAdminAchievement: async (achievementId, updateData) => {
    try {
      await apiCall(`/api/admin/achievements/${achievementId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      })
      await get().fetchAdminAchievements()
      get().addNotification('تم تحديث الإنجاز بنجاح', 'success')
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  deleteAdminAchievement: async (achievementId) => {
    try {
      await apiCall(`/api/admin/achievements/${achievementId}`, { method: 'DELETE' })
      await get().fetchAdminAchievements()
      get().addNotification('تم حذف الإنجاز بنجاح', 'success')
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  sendAnnouncement: async (title, message, type = 'announcement') => {
    try {
      await apiCall('/api/admin/announcements', {
        method: 'POST',
        body: JSON.stringify({ title, message, type }),
      })
      get().addNotification('تم إرسال الإعلان بنجاح', 'success')
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },

  adminEconomyAction: async (action, userId, amount) => {
    try {
      await apiCall('/api/admin/economy', {
        method: 'POST',
        body: JSON.stringify({ action, userId, amount }),
      })
      await get().fetchAdminUsers()
      await get().fetchAdminDashboard()
      get().addNotification('تم تنفيذ الإجراء الاقتصادي بنجاح', 'success')
    } catch (error) {
      get().addNotification((error as Error).message, 'error')
    }
  },
}))
