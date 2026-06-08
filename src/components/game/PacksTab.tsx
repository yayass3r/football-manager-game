'use client'

import { useEffect, useState } from 'react'
import { useGameStore, type PlayerPack } from '@/lib/game-store'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Package, Sparkles, Zap } from 'lucide-react'

const PACK_GRADIENTS: Record<string, { from: string; to: string; glow: string; border: string }> = {
  bronze: { from: 'from-amber-800/40', to: 'to-orange-900/30', glow: 'shadow-orange-500/20', border: 'border-amber-700/40' },
  silver: { from: 'from-gray-400/30', to: 'to-gray-600/20', glow: 'shadow-gray-400/20', border: 'border-gray-400/40' },
  gold: { from: 'from-yellow-500/40', to: 'to-amber-600/30', glow: 'shadow-yellow-500/30', border: 'border-yellow-500/50' },
  legendary: { from: 'from-purple-600/40', to: 'to-pink-600/30', glow: 'shadow-purple-500/40', border: 'border-purple-500/50' },
}

const PACK_EMOJIS: Record<string, string> = {
  bronze: '🟤',
  silver: '⚪',
  gold: '🟡',
  legendary: '💜',
}

export default function PacksTab() {
  const { playerPacks, fetchPacks, openPack, user, isLoading } = useGameStore()
  const [confirmPack, setConfirmPack] = useState<PlayerPack | null>(null)
  const [paymentType, setPaymentType] = useState<'coins' | 'gems'>('coins')

  useEffect(() => {
    fetchPacks()
  }, [fetchPacks])

  const handleOpenPack = async (pack: PlayerPack) => {
    try {
      await openPack(pack.id)
      setConfirmPack(null)
    } catch {
      // error handled in store
    }
  }

  const canAfford = (pack: PlayerPack, type: 'coins' | 'gems') => {
    if (!user) return false
    return type === 'coins' ? user.coins >= pack.price : user.gems >= pack.gemPrice
  }

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-white font-bold text-xl">متجر الحزم</h2>
        <p className="text-white/40 text-xs mt-1">افتح حزم للحصول على لاعبين جدد!</p>
      </motion.div>

      {/* Pack Cards */}
      <div className="grid grid-cols-2 gap-3">
        {playerPacks.filter(p => p.isActive).map((pack, index) => {
          const gradient = PACK_GRADIENTS[pack.type] || PACK_GRADIENTS.bronze
          const emoji = PACK_EMOJIS[pack.type] || '📦'
          const isLegendary = pack.type === 'legendary'

          return (
            <motion.div
              key={pack.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-gradient-to-b ${gradient.from} ${gradient.to} rounded-2xl p-4 border ${gradient.border} shadow-lg ${gradient.glow} ${isLegendary ? 'ring-1 ring-purple-400/30' : ''}`}
            >
              {isLegendary && (
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <motion.div
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-pink-500/10 to-yellow-500/10"
                  />
                </div>
              )}

              <div className="relative z-10">
                {/* Pack Icon */}
                <div className="text-center mb-3">
                  <motion.div
                    animate={isLegendary ? { rotate: [0, 5, -5, 0] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-4xl mb-2"
                  >
                    {emoji}
                  </motion.div>
                  <h3 className="text-white font-bold text-sm">{pack.name}</h3>
                  <p className="text-white/40 text-[10px] mt-0.5 line-clamp-2">{pack.description}</p>
                </div>

                {/* Pack Info */}
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-white/50">عدد اللاعبين</span>
                    <span className="text-white font-bold">{pack.playerCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-white/50">التقييم</span>
                    <span className="text-white font-bold">{pack.minOverall}-{pack.maxOverall}</span>
                  </div>
                </div>

                {/* Price */}
                <div className="space-y-1.5">
                  <Button
                    size="sm"
                    disabled={isLoading || !canAfford(pack, 'coins')}
                    onClick={() => { setConfirmPack(pack); setPaymentType('coins') }}
                    className="w-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30 h-8 text-[10px] font-bold"
                  >
                    🪙 {pack.price.toLocaleString()}
                  </Button>
                  {pack.gemPrice > 0 && (
                    <Button
                      size="sm"
                      disabled={isLoading || !canAfford(pack, 'gems')}
                      onClick={() => { setConfirmPack(pack); setPaymentType('gems') }}
                      className="w-full bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30 h-8 text-[10px] font-bold"
                    >
                      💎 {pack.gemPrice}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Empty State */}
      {playerPacks.filter(p => p.isActive).length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Package className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/30 text-sm">لا توجد حزم متاحة حالياً</p>
        </motion.div>
      )}

      {/* Quick Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10"
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <h4 className="text-white/80 text-sm font-bold">نصائح</h4>
        </div>
        <ul className="space-y-1 text-white/40 text-xs">
          <li>• الحزم الذهبية والأسطورية تمنح لاعبين بتقييم أعلى</li>
          <li>• استخدم الجواهر للحصول على حزم حصرية</li>
          <li>• اللاعبون المميزون يحسنون فريقك بشكل كبير</li>
        </ul>
      </motion.div>

      {/* Confirmation Dialog */}
      {confirmPack && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          onClick={() => setConfirmPack(null)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0d1f35] border border-white/10 rounded-2xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <div className="text-5xl mb-3">{PACK_EMOJIS[confirmPack.type]}</div>
              <h3 className="text-white font-bold text-lg">{confirmPack.name}</h3>
              <p className="text-white/40 text-xs mt-1">{confirmPack.description}</p>
            </div>

            <div className="bg-white/5 rounded-xl p-3 mb-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-white/50">عدد اللاعبين</span>
                <span className="text-white font-bold">{confirmPack.playerCount}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/50">نطاق التقييم</span>
                <span className="text-white font-bold">{confirmPack.minOverall} - {confirmPack.maxOverall}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/50">التكلفة</span>
                <span className="text-white font-bold">
                  {paymentType === 'coins' ? `🪙 ${confirmPack.price.toLocaleString()}` : `💎 ${confirmPack.gemPrice}`}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                className="flex-1 text-white/50 hover:text-white hover:bg-white/5"
                onClick={() => setConfirmPack(null)}
              >
                إلغاء
              </Button>
              <Button
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
                disabled={isLoading}
                onClick={() => handleOpenPack(confirmPack)}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Zap className="w-4 h-4" />
                  </motion.div>
                ) : (
                  'فتح الحزمة! 🎰'
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
