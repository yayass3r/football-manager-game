'use client'

import { useEffect } from 'react'
import { useGameStore } from '@/lib/game-store'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Gift, Tv, Dumbbell, Package, Trophy, Calendar, Award, TrendingUp } from 'lucide-react'

export default function HomeTab() {
  const {
    user, club, matchHistory, fetchHistory, claimDailyReward, watchAd, isLoading,
    gameEvents, fetchGameEvents, achievements, fetchAchievements,
    currentSeason, fetchSeason, leaderboard, fetchLeaderboard,
  } = useGameStore()

  useEffect(() => {
    fetchHistory()
    fetchGameEvents()
    fetchAchievements()
    fetchSeason()
    fetchLeaderboard('global')
  }, [fetchHistory, fetchGameEvents, fetchAchievements, fetchSeason, fetchLeaderboard])

  if (!user || !club) return null

  const totalMatches = club.wins + club.draws + club.losses
  const winRate = totalMatches > 0 ? Math.round((club.wins / totalMatches) * 100) : 0
  const recentMatches = matchHistory.slice(0, 3)
  const unlockedAchievements = achievements.filter((a) => a.unlocked).length
  const userRank = leaderboard.find((e) => e.userId === user.id)

  return (
    <div className="space-y-4 pb-4">
      {/* News Ticker */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 text-xs font-bold whitespace-nowrap">📰 أخبار</span>
          <div className="overflow-hidden flex-1">
            <motion.div
              animate={{ x: [200, -400] }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              className="whitespace-nowrap text-white/60 text-xs"
            >
              {currentSeason
                ? `الموسم ${currentSeason.number} - ${currentSeason.name} 🌟 أثبت مهاراتك وقود فريقك نحو المجد! ⚽`
                : 'مرحباً بك في مدير كرة القدم! 🏆 أثبت مهاراتك وقود فريقك نحو المجد! ⚽'
              }
            </motion.div>
          </div>
        </div>
      </div>

      {/* Active Events Banner */}
      {gameEvents.filter((e) => e.isActive).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          {gameEvents.filter((e) => e.isActive).slice(0, 2).map((event) => (
            <div
              key={event.id}
              className={`rounded-xl px-4 py-3 border ${
                event.type === 'special'
                  ? 'bg-gradient-to-l from-purple-500/20 to-pink-500/10 border-purple-500/30'
                  : event.type === 'tournament'
                  ? 'bg-gradient-to-l from-yellow-500/20 to-orange-500/10 border-yellow-500/30'
                  : 'bg-gradient-to-l from-emerald-500/20 to-teal-500/10 border-emerald-500/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-white/50" />
                <div className="flex-1">
                  <h4 className="text-white text-xs font-bold">{event.title}</h4>
                  <p className="text-white/40 text-[10px] line-clamp-1">{event.description}</p>
                </div>
                <span className="text-[8px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded">
                  فعال
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Season & Leaderboard Info */}
      <div className="grid grid-cols-2 gap-2">
        {/* Season Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-white/50 text-[10px]">الموسم</span>
          </div>
          {currentSeason ? (
            <>
              <p className="text-white font-bold text-sm">{currentSeason.name}</p>
              <p className="text-white/30 text-[10px]">الموسم {currentSeason.number}</p>
            </>
          ) : (
            <p className="text-white/30 text-xs">جاري التحميل...</p>
          )}
        </motion.div>

        {/* Leaderboard Rank */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10"
          onClick={() => useGameStore.getState().setTab('leaderboard')}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-white/50 text-[10px]">ترتيبي</span>
          </div>
          {userRank ? (
            <>
              <p className="text-white font-bold text-sm">#{userRank.rank}</p>
              <p className="text-emerald-400 text-[10px]">{userRank.score} نقطة</p>
            </>
          ) : (
            <p className="text-white/30 text-xs">العب للظهور</p>
          )}
        </motion.div>
      </div>

      {/* Club Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-gradient-to-bl from-white/10 to-white/5 backdrop-blur rounded-2xl p-4 border border-white/10"
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg"
            style={{
              backgroundColor: club.primaryColor,
              border: `3px solid ${club.secondaryColor}60`,
            }}
          >
            {club.logo}
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-lg">{club.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-emerald-400 text-xs font-medium">
                {club.wins}ف - {club.draws}ت - {club.losses}خ
              </span>
              <span className="text-white/20">|</span>
              <span className="text-yellow-400 text-xs">نسبة الفوز {winRate}%</span>
            </div>
          </div>
        </div>

        {/* Reputation Bar */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-white/50">السمعة</span>
            <span className="text-emerald-400 font-bold">{club.reputation}/100</span>
          </div>
          <Progress value={club.reputation} className="h-2 bg-white/10" />
        </div>

        {/* Morale */}
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-white/50">المعنويات</span>
            <span className={`font-bold ${club.morale > 60 ? 'text-emerald-400' : club.morale > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
              {club.morale}/100
            </span>
          </div>
          <Progress value={club.morale} className="h-2 bg-white/10" />
        </div>
      </motion.div>

      {/* Achievement Progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10"
        onClick={() => useGameStore.getState().setTab('achievements')}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-400" />
            <span className="text-white/80 text-sm font-bold">الإنجازات</span>
          </div>
          <span className="text-emerald-400 text-xs font-bold">
            {unlockedAchievements}/{achievements.length}
          </span>
        </div>
        <Progress
          value={achievements.length > 0 ? (unlockedAchievements / achievements.length) * 100 : 0}
          className="h-1.5 bg-white/10 mt-2"
        />
      </motion.div>

      {/* Stadium Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🏟️</span>
            <div>
              <h4 className="text-white font-bold text-sm">{club.stadiumName}</h4>
              <p className="text-white/40 text-xs">المستوى {club.stadiumLevel}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-emerald-400 text-xs h-8 hover:bg-emerald-500/10">
            ترقية ⬆️
          </Button>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-4 gap-2"
      >
        <Button
          onClick={claimDailyReward}
          disabled={isLoading}
          className="bg-gradient-to-b from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 text-yellow-400 hover:from-yellow-500/30 hover:to-yellow-600/20 h-auto py-3 flex-col gap-1 rounded-xl"
        >
          <Gift className="w-4 h-4" />
          <span className="text-[9px] font-bold">المكافأة</span>
        </Button>
        <Button
          onClick={watchAd}
          disabled={isLoading}
          className="bg-gradient-to-b from-purple-500/20 to-purple-600/10 border border-purple-500/30 text-purple-400 hover:from-purple-500/30 hover:to-purple-600/20 h-auto py-3 flex-col gap-1 rounded-xl"
        >
          <Tv className="w-4 h-4" />
          <span className="text-[9px] font-bold">إعلان</span>
        </Button>
        <Button
          className="bg-gradient-to-b from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 text-emerald-400 hover:from-emerald-500/30 hover:to-emerald-600/20 h-auto py-3 flex-col gap-1 rounded-xl"
          onClick={() => useGameStore.getState().setTab('squad')}
        >
          <Dumbbell className="w-4 h-4" />
          <span className="text-[9px] font-bold">تدريب</span>
        </Button>
        <Button
          className="bg-gradient-to-b from-pink-500/20 to-pink-600/10 border border-pink-500/30 text-pink-400 hover:from-pink-500/30 hover:to-pink-600/20 h-auto py-3 flex-col gap-1 rounded-xl"
          onClick={() => useGameStore.getState().setTab('packs')}
        >
          <Package className="w-4 h-4" />
          <span className="text-[9px] font-bold">حزم</span>
        </Button>
      </motion.div>

      {/* Season Progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10"
      >
        <h4 className="text-white/80 text-sm font-bold mb-3">📊 تقدم الموسم</h4>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-emerald-500/10 rounded-lg py-2">
            <div className="text-emerald-400 font-bold text-lg">{club.wins}</div>
            <div className="text-white/40 text-[10px]">انتصارات</div>
          </div>
          <div className="bg-yellow-500/10 rounded-lg py-2">
            <div className="text-yellow-400 font-bold text-lg">{club.draws}</div>
            <div className="text-white/40 text-[10px]">تعادلات</div>
          </div>
          <div className="bg-red-500/10 rounded-lg py-2">
            <div className="text-red-400 font-bold text-lg">{club.losses}</div>
            <div className="text-white/40 text-[10px]">خسائر</div>
          </div>
          <div className="bg-blue-500/10 rounded-lg py-2">
            <div className="text-blue-400 font-bold text-lg">{club.goalsFor}</div>
            <div className="text-white/40 text-[10px]">أهداف</div>
          </div>
        </div>
      </motion.div>

      {/* Recent Matches */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10"
      >
        <h4 className="text-white/80 text-sm font-bold mb-3">⏱️ آخر المباريات</h4>
        {recentMatches.length === 0 ? (
          <p className="text-white/30 text-xs text-center py-4">لا توجد مباريات بعد. العب مباراتك الأولى!</p>
        ) : (
          <div className="space-y-2">
            {recentMatches.map((match) => (
              <div key={match.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                <div className="flex items-center gap-2 flex-1">
                  <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${
                    match.result === 'win' ? 'bg-emerald-500/20 text-emerald-400' :
                    match.result === 'draw' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {match.result === 'win' ? 'فوز' : match.result === 'draw' ? 'تعادل' : 'خسارة'}
                  </span>
                  <div className="text-center flex-1">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-white text-xs">{match.homeClub.name}</span>
                      <span className="text-white font-bold text-sm">{match.homeGoals} - {match.awayGoals}</span>
                      <span className="text-white text-xs">{match.awayClub.name}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
