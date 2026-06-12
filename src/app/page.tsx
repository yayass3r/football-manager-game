'use client'

import { useEffect } from 'react'
import { useGameStore } from '@/lib/game-store'
import { motion, AnimatePresence } from 'framer-motion'
import AuthScreen from '@/components/game/AuthScreen'
import ClubCreationScreen from '@/components/game/ClubCreationScreen'
import StarterPackReveal from '@/components/game/StarterPackReveal'
import TopBar from '@/components/game/TopBar'
import BottomNav from '@/components/game/BottomNav'
import HomeTab from '@/components/game/HomeTab'
import SquadTab from '@/components/game/SquadTab'
import MatchTab from '@/components/game/MatchTab'
import MarketTab from '@/components/game/MarketTab'
import TournamentsTab from '@/components/game/TournamentsTab'
import PacksTab from '@/components/game/PacksTab'
import LeaderboardTab from '@/components/game/LeaderboardTab'
import AchievementsTab from '@/components/game/AchievementsTab'
import PlayerDetailModal from '@/components/game/PlayerDetailModal'
import PackOpeningModal from '@/components/game/PackOpeningModal'
import KitCustomizer from '@/components/game/KitCustomizer'
import AdminTab from '@/components/game/AdminTab'
import NotificationToast from '@/components/game/NotificationToast'

function TabContent() {
  const { currentTab } = useGameStore()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className="px-4 pt-4 pb-24"
      >
        {currentTab === 'home' && <HomeTab />}
        {currentTab === 'squad' && <SquadTab />}
        {currentTab === 'match' && <MatchTab />}
        {currentTab === 'market' && <MarketTab />}
        {currentTab === 'tournaments' && <TournamentsTab />}
        {currentTab === 'packs' && <PacksTab />}
        {currentTab === 'leaderboard' && <LeaderboardTab />}
        {currentTab === 'achievements' && <AchievementsTab />}
        {currentTab === 'admin' && <AdminTab />}
      </motion.div>
    </AnimatePresence>
  )
}

function MainGameScreen() {
  const { fetchClub, fetchTournaments, seedTournaments } = useGameStore()

  useEffect(() => {
    const init = async () => {
      await fetchClub()
      const result = await fetchTournaments()
      // Only seed if no tournaments exist - check after fetch completes
      const tournaments = useGameStore.getState().tournaments
      if (tournaments.length === 0) {
        await seedTournaments()
      }
    }
    init()
  }, [])

  return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col max-w-[480px] mx-auto relative">
      <TopBar />
      <main className="flex-1 overflow-y-auto">
        <TabContent />
      </main>
      <BottomNav />
      <PlayerDetailModal />
      <PackOpeningModal />
      <KitCustomizer />
    </div>
  )
}

export default function Home() {
  const { currentScreen, user, starterPack, dismissStarterReveal } = useGameStore()

  // Auto-login check on mount
  useEffect(() => {
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null
    if (userId && !user) {
      // Try to fetch profile
      const fetchProfile = async () => {
        try {
          const res = await fetch('/api/user/profile', {
            headers: { 'x-user-id': userId, 'Content-Type': 'application/json' },
          })
          const data = await res.json()
          if (data.success && data.data) {
            const u = data.data
            // Check if user is banned
            if (u.isBanned) {
              localStorage.removeItem('userId')
              return
            }
            useGameStore.setState({
              user: u,
              club: u.club || null,
              players: u.club?.players || [],
              currentScreen: u.club ? 'main' : 'club-creation',
            })
          } else {
            localStorage.removeItem('userId')
          }
        } catch {
          // Network error - don't remove userId, user might just be offline
          // Just show auth screen for now
          useGameStore.setState({ currentScreen: 'auth' })
        }
      }
      fetchProfile()
    }
  }, [])

  return (
    <div dir="rtl">
      <NotificationToast />
      <AnimatePresence mode="wait">
        {currentScreen === 'auth' && (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AuthScreen />
          </motion.div>
        )}

        {currentScreen === 'club-creation' && (
          <motion.div
            key="club-creation"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <ClubCreationScreen />
          </motion.div>
        )}

        {currentScreen === 'starter-reveal' && starterPack && (
          <motion.div
            key="starter-reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StarterPackReveal
              pack={starterPack}
              onContinue={dismissStarterReveal}
            />
          </motion.div>
        )}

        {currentScreen === 'main' && (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <MainGameScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
