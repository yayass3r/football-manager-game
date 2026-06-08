'use client'

import { useEffect, useState } from 'react'
import { useGameStore } from '@/lib/game-store'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { RefreshCw, Crown, Medal, Trophy } from 'lucide-react'

const LEADERBOARD_TYPES = [
  { id: 'global', label: 'عالمي' },
  { id: 'season', label: 'موسمي' },
  { id: 'weekly', label: 'أسبوعي' },
]

export default function LeaderboardTab() {
  const { leaderboard, fetchLeaderboard, updateLeaderboard, user, isLoading } = useGameStore()
  const [activeType, setActiveType] = useState('global')

  useEffect(() => {
    fetchLeaderboard(activeType)
  }, [activeType, fetchLeaderboard])

  const top3 = leaderboard.slice(0, 3)
  const rest = leaderboard.slice(3)
  const currentUserId = user?.id

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />
    return <span className="text-white/40 text-sm font-bold">{rank}</span>
  }

  const getPodiumHeight = (rank: number) => {
    if (rank === 1) return 'h-24'
    if (rank === 2) return 'h-20'
    return 'h-16'
  }

  const getPodiumOrder = (rank: number) => {
    // In RTL, #2 is on the right, #1 center, #3 left
    if (rank === 2) return 0
    if (rank === 1) return 1
    return 2
  }

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-white font-bold text-xl">لوحة المتصدرين</h2>
        <p className="text-white/40 text-xs mt-1">تنافس مع لاعبين من حول العالم</p>
      </motion.div>

      {/* Type Tabs */}
      <div className="flex bg-white/5 rounded-xl p-1 gap-1">
        {LEADERBOARD_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => setActiveType(type.id)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              activeType === type.id
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      {top3.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-end justify-center gap-3 px-4 pt-4"
        >
          {top3.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (3 - entry.rank) * 0.15 }}
              className="flex flex-col items-center"
              style={{ order: getPodiumOrder(entry.rank) }}
            >
              {/* Avatar */}
              <div className="relative mb-2">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-lg shadow-lg border-2"
                  style={{
                    backgroundColor: entry.club.primaryColor + '30',
                    borderColor: entry.rank === 1 ? '#eab308' : entry.rank === 2 ? '#9ca3af' : '#b45309',
                  }}
                >
                  {entry.user.avatar || '⚽'}
                </div>
                <div className="absolute -top-2 -right-1">
                  {getRankIcon(entry.rank)}
                </div>
              </div>

              {/* Name */}
              <p className="text-white text-xs font-bold text-center max-w-[80px] truncate">
                {entry.user.username}
              </p>
              <p className="text-white/30 text-[10px] text-center max-w-[80px] truncate">
                {entry.club.name}
              </p>

              {/* Score */}
              <div className={`bg-gradient-to-t ${entry.rank === 1 ? 'from-yellow-500/30 to-yellow-600/10 border-yellow-500/30' : entry.rank === 2 ? 'from-gray-400/20 to-gray-500/10 border-gray-400/30' : 'from-amber-700/20 to-amber-800/10 border-amber-700/30'} border rounded-t-lg w-20 flex flex-col items-center justify-end ${getPodiumHeight(entry.rank)}`}>
                <span className="text-white font-black text-lg">{entry.score}</span>
                <span className="text-white/40 text-[8px] mb-1">نقطة</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Update & Refresh */}
      <div className="flex gap-2">
        <Button
          onClick={() => fetchLeaderboard(activeType)}
          disabled={isLoading}
          variant="ghost"
          size="sm"
          className="text-white/40 hover:text-white hover:bg-white/5 text-xs h-8"
        >
          <RefreshCw className={`w-3.5 h-3.5 ml-1 ${isLoading ? 'animate-spin' : ''}`} />
          تحديث
        </Button>
        <Button
          onClick={updateLeaderboard}
          disabled={isLoading}
          size="sm"
          className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 text-xs h-8"
        >
          تحديث ترتيبي
        </Button>
      </div>

      {/* Rest of Leaderboard */}
      <ScrollArea className="max-h-96">
        <div className="space-y-1.5">
          {rest.map((entry, index) => {
            const isCurrentUser = entry.userId === currentUserId

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  isCurrentUser
                    ? 'bg-emerald-500/10 border border-emerald-500/30'
                    : 'bg-white/5 border border-white/5'
                }`}
              >
                {/* Rank */}
                <div className="w-8 text-center">
                  {getRankIcon(entry.rank)}
                </div>

                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm"
                  style={{ backgroundColor: entry.club.primaryColor + '30' }}
                >
                  {entry.user.avatar || '⚽'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-xs font-bold truncate">{entry.user.username}</p>
                    {isCurrentUser && (
                      <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">أنت</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-white/30 text-[10px] truncate">{entry.club.name}</span>
                    <span className="text-white/20 text-[10px]">
                      {entry.club.wins}ف {entry.club.draws}ت {entry.club.losses}خ
                    </span>
                  </div>
                </div>

                {/* Score */}
                <div className="text-left">
                  <div className="text-white font-bold text-sm">{entry.score}</div>
                  <div className="text-white/30 text-[8px]">نقطة</div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </ScrollArea>

      {/* Empty State */}
      {leaderboard.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Trophy className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/30 text-sm">لا توجد بيانات بعد</p>
          <p className="text-white/20 text-xs mt-1">العب مباريات لتظهر في الترتيب!</p>
        </motion.div>
      )}
    </div>
  )
}
