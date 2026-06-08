'use client'

import { useEffect, useState } from 'react'
import { useGameStore, type AchievementData } from '@/lib/game-store'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Award, Lock, Check, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const CATEGORIES = [
  { id: 'all', label: 'الكل' },
  { id: 'matches', label: 'المباريات' },
  { id: 'tournaments', label: 'البطولات' },
  { id: 'transfers', label: 'الانتقالات' },
  { id: 'training', label: 'التدريب' },
  { id: 'special', label: 'خاصة' },
]

export default function AchievementsTab() {
  const { achievements, fetchAchievements, claimAchievement, checkAchievements, isLoading } = useGameStore()
  const [activeCategory, setActiveCategory] = useState('all')
  const [claimingId, setClaimingId] = useState<string | null>(null)
  const [showReward, setShowReward] = useState<{ id: string; coins: number; gems: number } | null>(null)

  useEffect(() => {
    fetchAchievements()
  }, [fetchAchievements])

  useEffect(() => {
    checkAchievements()
  }, [checkAchievements])

  const filteredAchievements = activeCategory === 'all'
    ? achievements
    : achievements.filter((a) => a.category === activeCategory)

  const unlockedCount = achievements.filter((a) => a.unlocked).length
  const totalRewards = achievements
    .filter((a) => a.unlocked && !a.claimed)
    .reduce((sum, a) => sum + a.rewardCoins + a.rewardGems, 0)

  const handleClaim = async (achievement: AchievementData) => {
    setClaimingId(achievement.id)
    try {
      await claimAchievement(achievement.achievementId)
      setShowReward({ id: achievement.id, coins: achievement.rewardCoins, gems: achievement.rewardGems })
      setTimeout(() => setShowReward(null), 2000)
    } catch {
      // error handled in store
    }
    setClaimingId(null)
  }

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-white font-bold text-xl">الإنجازات</h2>
        <p className="text-white/40 text-xs mt-1">أكمل التحديات واحصل على مكافآت</p>
      </motion.div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-l from-emerald-500/10 to-yellow-500/10 backdrop-blur rounded-xl p-4 border border-emerald-500/20"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            <span className="text-white text-sm font-bold">
              {unlockedCount}/{achievements.length} إنجاز
            </span>
          </div>
          {totalRewards > 0 && (
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[10px]">
              🪙 {totalRewards} مكافأة متاحة
            </Badge>
          )}
        </div>
        <Progress
          value={achievements.length > 0 ? (unlockedCount / achievements.length) * 100 : 0}
          className="h-2 bg-white/10 mt-3"
        />
      </motion.div>

      {/* Category Filter */}
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-1.5 pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'bg-white/5 text-white/40 hover:text-white/60 border border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </ScrollArea>

      {/* Achievement Grid */}
      <div className="grid grid-cols-2 gap-3">
        <AnimatePresence>
          {filteredAchievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className={`relative bg-white/5 backdrop-blur rounded-xl p-3 border ${
                achievement.unlocked
                  ? achievement.claimed
                    ? 'border-emerald-500/20'
                    : 'border-yellow-500/40 shadow-lg shadow-yellow-500/10'
                  : 'border-white/5'
              } ${achievement.unlocked && !achievement.claimed ? 'ring-1 ring-yellow-400/20' : ''}`}
            >
              {/* Glow for newly unlocked */}
              {achievement.unlocked && !achievement.claimed && (
                <motion.div
                  animate={{ opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-xl bg-yellow-500/5"
                />
              )}

              <div className="relative z-10">
                {/* Icon */}
                <div className="text-center mb-2">
                  <span className={`text-3xl ${!achievement.unlocked ? 'grayscale opacity-40' : ''}`}>
                    {achievement.icon || '🏅'}
                  </span>
                </div>

                {/* Name & Description */}
                <h4 className={`text-xs font-bold text-center mb-1 ${achievement.unlocked ? 'text-white' : 'text-white/40'}`}>
                  {achievement.name}
                </h4>
                <p className="text-white/30 text-[10px] text-center line-clamp-2 mb-2">
                  {achievement.description}
                </p>

                {/* Progress */}
                <div className="mb-2">
                  <div className="flex justify-between text-[9px] mb-0.5">
                    <span className="text-white/30">التقدم</span>
                    <span className={`font-bold ${achievement.unlocked ? 'text-emerald-400' : 'text-white/40'}`}>
                      {achievement.progress}%
                    </span>
                  </div>
                  <Progress
                    value={achievement.progress}
                    className="h-1.5 bg-white/10"
                  />
                </div>

                {/* Reward Info */}
                <div className="flex items-center justify-center gap-2 mb-2 text-[9px]">
                  {achievement.rewardCoins > 0 && (
                    <span className="text-yellow-400">🪙 {achievement.rewardCoins}</span>
                  )}
                  {achievement.rewardGems > 0 && (
                    <span className="text-purple-400">💎 {achievement.rewardGems}</span>
                  )}
                  {achievement.rewardTitle && (
                    <span className="text-emerald-400">👑 {achievement.rewardTitle}</span>
                  )}
                </div>

                {/* Status */}
                {achievement.unlocked ? (
                  achievement.claimed ? (
                    <div className="flex items-center justify-center gap-1 text-emerald-400 text-[10px]">
                      <Check className="w-3 h-3" />
                      <span>تم الاستلام</span>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/30 h-7 text-[10px] font-bold"
                      disabled={isLoading && claimingId === achievement.id}
                      onClick={() => handleClaim(achievement)}
                    >
                      {isLoading && claimingId === achievement.id ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <Sparkles className="w-3 h-3" />
                        </motion.div>
                      ) : (
                        'استلام 🎁'
                      )}
                    </Button>
                  )
                ) : (
                  <div className="flex items-center justify-center gap-1 text-white/20 text-[10px]">
                    <Lock className="w-3 h-3" />
                    <span>مقفل</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredAchievements.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Award className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/30 text-sm">لا توجد إنجازات في هذا القسم</p>
        </motion.div>
      )}

      {/* Reward Animation Overlay */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              className="bg-[#0d1f35] border border-yellow-500/30 rounded-2xl p-6 text-center"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.6, repeat: 2 }}
                className="text-5xl mb-3"
              >
                🎉
              </motion.div>
              <h3 className="text-white font-bold text-lg mb-2">مكافأة!</h3>
              <div className="flex items-center justify-center gap-3 mb-3">
                {showReward.coins > 0 && (
                  <motion.span
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.5, repeat: 3 }}
                    className="text-yellow-400 font-bold"
                  >
                    🪙 {showReward.coins}
                  </motion.span>
                )}
                {showReward.gems > 0 && (
                  <motion.span
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.5, repeat: 3, delay: 0.2 }}
                    className="text-purple-400 font-bold"
                  >
                    💎 {showReward.gems}
                  </motion.span>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
