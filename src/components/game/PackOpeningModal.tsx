'use client'

import { useEffect, useState } from 'react'
import { useGameStore } from '@/lib/game-store'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Sparkles, Volume2 } from 'lucide-react'

function ConfettiParticle({ delay, x }: { delay: number; x: number }) {
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full"
      style={{ left: `${x}%`, top: '-5%' }}
      initial={{ opacity: 1, y: 0 }}
      animate={{
        y: ['0vh', '100vh'],
        x: [0, (Math.random() - 0.5) * 200],
        rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
        opacity: [1, 1, 0],
      }}
      transition={{
        duration: 2 + Math.random() * 2,
        delay,
        ease: 'easeIn',
      }}
      exit={{ opacity: 0 }}
    >
      {['🟡', '🟢', '🔴', '🟣', '🟠', '✨', '⭐'][Math.floor(Math.random() * 7)]}
    </motion.div>
  )
}

function PlayerCardReveal({ player, index }: { player: { id: string; name: string; position: string; overall: number; nationality: string; pace: number; shooting: number; passing: number; dribbling: number; defending: number; physical: number }; index: number }) {
  const [flipped, setFlipped] = useState(false)
  const isHighRated = player.overall >= 80
  const isMidRated = player.overall >= 70

  useEffect(() => {
    const timer = setTimeout(() => setFlipped(true), 800 + index * 400)
    return () => clearTimeout(timer)
  }, [index])

  const glowColor = isHighRated
    ? 'shadow-yellow-500/50 ring-yellow-400/40'
    : isMidRated
    ? 'shadow-gray-300/30 ring-gray-300/30'
    : 'shadow-orange-500/20 ring-orange-500/20'

  const overallColor = isHighRated
    ? 'text-yellow-400'
    : isMidRated
    ? 'text-gray-300'
    : 'text-orange-400'

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.5 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.5 + index * 0.3, type: 'spring', stiffness: 200 }}
      className="relative"
    >
      <motion.div
        animate={flipped ? {} : { rotateY: [0, 10, -10, 0] }}
        transition={{ duration: 0.5, repeat: flipped ? 0 : 2 }}
        onClick={() => setFlipped(true)}
        className="cursor-pointer"
        style={{ perspective: 600 }}
      >
        <motion.div
          animate={{ rotateY: flipped ? 0 : 180 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{ backfaceVisibility: 'hidden', transformStyle: 'preserve-3d' }}
          className={`relative bg-gradient-to-b ${isHighRated ? 'from-yellow-600/30 to-amber-900/20' : isMidRated ? 'from-gray-500/20 to-gray-700/20' : 'from-amber-800/20 to-orange-900/20'} rounded-xl p-3 border ${isHighRated ? 'border-yellow-500/50' : isMidRated ? 'border-gray-400/30' : 'border-amber-700/30'} shadow-xl ${glowColor} ring-1 min-w-[120px]`}
        >
          {/* Overall Rating */}
          <div className="text-center mb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={flipped ? { scale: 1 } : { scale: 0 }}
              transition={{ delay: flipped ? 0.3 : 0, type: 'spring', stiffness: 300 }}
              className={`text-3xl font-black ${overallColor}`}
            >
              {player.overall}
            </motion.div>
            <div className="text-white/40 text-[10px]">{player.position}</div>
          </div>

          {/* Player Name */}
          <div className="text-center mb-2">
            <h4 className="text-white font-bold text-xs">{player.name}</h4>
            <p className="text-white/30 text-[10px]">{player.nationality}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-1 text-center">
            {[
              { label: 'سرعة', value: player.pace },
              { label: 'تسديد', value: player.shooting },
              { label: 'تمرير', value: player.passing },
              { label: 'مراوغة', value: player.dribbling },
              { label: 'دفاع', value: player.defending },
              { label: 'بدني', value: player.physical },
            ].map((stat) => (
              <div key={stat.label} className="bg-black/20 rounded p-0.5">
                <div className={`text-[9px] font-bold ${stat.value >= 80 ? 'text-emerald-400' : stat.value >= 60 ? 'text-white/70' : 'text-white/40'}`}>
                  {stat.value}
                </div>
                <div className="text-white/30 text-[7px]">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* New Badge */}
          <AnimatePresence>
            {flipped && (
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                className="absolute -top-2 -left-2 bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-lg"
              >
                جديد!
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default function PackOpeningModal() {
  const { showPackOpening, packOpeningResult, user } = useGameStore()
  const [phase, setPhase] = useState<'shaking' | 'opening' | 'revealed'>('shaking')
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (showPackOpening) {
      setPhase('shaking')
      setShowConfetti(false)
      const t1 = setTimeout(() => setPhase('opening'), 1500)
      const t2 = setTimeout(() => {
        setPhase('revealed')
        // Show confetti for gold/legendary packs
        if (packOpeningResult?.players.some(p => p.overall >= 80)) {
          setShowConfetti(true)
        }
      }, 2500)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
  }, [showPackOpening, packOpeningResult])

  const handleClose = () => {
    useGameStore.setState({ showPackOpening: false, packOpeningResult: null })
  }

  if (!showPackOpening || !packOpeningResult) return null

  const packTypeEmojis: Record<string, string> = {
    bronze: '🟤',
    silver: '⚪',
    gold: '🟡',
    legendary: '💜',
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
    >
      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => (
            <ConfettiParticle key={i} delay={i * 0.1} x={Math.random() * 100} />
          ))}
        </div>
      )}

      {/* Sound indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5"
      >
        <Volume2 className="w-3.5 h-3.5 text-white/50" />
        <span className="text-white/50 text-[10px]">
          {phase === 'shaking' ? '🔊 اهتزاز...' : phase === 'opening' ? '💥 انفجار!' : '🎵 كشف!'}
        </span>
      </motion.div>

      <div className="w-full max-w-sm mx-4">
        {/* Phase 1: Shaking Pack */}
        <AnimatePresence>
          {phase === 'shaking' && (
            <motion.div
              exit={{ scale: 2, opacity: 0 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{
                  rotate: [0, -5, 5, -5, 5, 0],
                  scale: [1, 1.05, 1, 1.05, 1],
                }}
                transition={{ duration: 0.5, repeat: 3, ease: 'easeInOut' }}
                className="text-8xl mb-4"
              >
                {packTypeEmojis[packOpeningResult.packType] || '📦'}
              </motion.div>
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-white/60 text-sm font-bold"
              >
                جاري الفتح...
              </motion.div>
              {/* Glow effect */}
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute w-32 h-32 rounded-full bg-purple-500/20 blur-3xl"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase 2 & 3: Opening / Revealed */}
        {(phase === 'opening' || phase === 'revealed') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Header */}
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <h2 className="text-white font-bold text-lg">لاعبون جدد!</h2>
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </motion.div>
              <p className="text-white/40 text-xs mt-1">
                حزمة {packTypeEmojis[packOpeningResult.packType] || ''} - {packOpeningResult.players.length} لاعبين
              </p>
            </div>

            {/* Player Cards */}
            <div className="flex flex-wrap justify-center gap-3 max-h-[60vh] overflow-y-auto px-2 py-2">
              {packOpeningResult.players.map((player, index) => (
                <PlayerCardReveal key={player.id} player={player} index={index} />
              ))}
            </div>

            {/* Continue Button */}
            {phase === 'revealed' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center pt-2"
              >
                <Button
                  onClick={handleClose}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 rounded-xl"
                >
                  متابعة ✨
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
