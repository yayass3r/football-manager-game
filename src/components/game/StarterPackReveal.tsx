'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

interface StarterPackData {
  tier: 'bronze' | 'silver' | 'gold' | 'legendary'
  label: string
  emoji: string
  color: string
  avgOverall: number
  bestPlayer: { name: string; overall: number; position: string } | null
  playerCount: number
}

interface StarterPackRevealProps {
  pack: StarterPackData
  onContinue: () => void
}

const tierGradients: Record<string, string> = {
  bronze: 'linear-gradient(135deg, #8B4513 0%, #cd7f32 50%, #DAA520 100%)',
  silver: 'linear-gradient(135deg, #808080 0%, #c0c0c0 50%, #e8e8e8 100%)',
  gold: 'linear-gradient(135deg, #B8860B 0%, #ffd700 50%, #FFD700 100%)',
  legendary: 'linear-gradient(135deg, #6a0dad 0%, #9b59b6 50%, #e8b4f8 100%)',
}

const tierParticles: Record<string, string[]> = {
  bronze: ['🥉', '⚽', '✨', '⭐'],
  silver: ['🥈', '⚽', '✨', '💫'],
  gold: ['🥇', '⚽', '🔥', '💎'],
  legendary: ['💎', '🏆', '🔥', '⚡', '👑', '🌟'],
}

export default function StarterPackReveal({ pack, onContinue }: StarterPackRevealProps) {
  const [phase, setPhase] = useState<'opening' | 'revealed' | 'details'>('opening')

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase('revealed'), 2000)
    const timer2 = setTimeout(() => setPhase('details'), 3500)
    return () => { clearTimeout(timer1); clearTimeout(timer2) }
  }, [])

  const particles = tierParticles[pack.tier] || tierParticles.bronze

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.9)' }}>
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((emoji, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl"
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400),
              y: typeof window !== 'undefined' ? window.innerHeight + 50 : 800,
              opacity: 0,
              scale: 0.5
            }}
            animate={{ 
              y: -100,
              opacity: [0, 1, 1, 0],
              scale: [0.5, 1, 1, 0.5],
              rotate: Math.random() * 360
            }}
            transition={{ 
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'easeOut'
            }}
          >
            {emoji}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 text-center px-6 max-w-sm mx-auto">
        <AnimatePresence mode="wait">
          {phase === 'opening' && (
            <motion.div
              key="opening"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="text-8xl mb-6"
              >
                📦
              </motion.div>
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-white text-xl font-bold"
              >
                جاري فتح الحزمة...
              </motion.p>
            </motion.div>
          )}

          {phase === 'revealed' && (
            <motion.div
              key="revealed"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 0.6, repeat: 3 }}
                className="text-8xl mb-4"
              >
                {pack.emoji}
              </motion.div>
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-black mb-2"
                style={{ color: pack.color }}
              >
                حزمة {pack.label}!
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-white/60 text-lg"
              >
                فريق كامل من {pack.playerCount} لاعب
              </motion.p>
            </motion.div>
          )}

          {phase === 'details' && (
            <motion.div
              key="details"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex flex-col items-center"
            >
              {/* Pack Card */}
              <div className="w-full rounded-2xl p-6 mb-6 relative overflow-hidden"
                style={{ background: tierGradients[pack.tier] }}>
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative z-10">
                  <div className="text-6xl mb-3">{pack.emoji}</div>
                  <h2 className="text-2xl font-black text-white mb-1">
                    حزمة {pack.label}
                  </h2>
                  <p className="text-white/80 text-sm mb-4">
                    {pack.tier === 'legendary' ? 'نادي أسطوري بكامل نجومه!' :
                     pack.tier === 'gold' ? 'نادي قوي بلاعبين مميزين!' :
                     pack.tier === 'silver' ? 'نادي واعد بلاعبين جيدين!' :
                     'نادي شاب بلاعبين واعدين!'}
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black/30 backdrop-blur rounded-xl p-3">
                      <p className="text-white/60 text-xs mb-1">متوسط التقييم</p>
                      <p className="text-white font-black text-2xl">{pack.avgOverall}</p>
                    </div>
                    <div className="bg-black/30 backdrop-blur rounded-xl p-3">
                      <p className="text-white/60 text-xs mb-1">عدد اللاعبين</p>
                      <p className="text-white font-black text-2xl">{pack.playerCount}</p>
                    </div>
                  </div>

                  {pack.bestPlayer && (
                    <div className="mt-3 bg-black/30 backdrop-blur rounded-xl p-3">
                      <p className="text-white/60 text-xs mb-1">أفضل لاعب</p>
                      <div className="flex items-center justify-between">
                        <span className="text-white font-bold">{pack.bestPlayer.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white/60 text-xs">{pack.bestPlayer.position}</span>
                          <span className="text-white font-black text-lg">{pack.bestPlayer.overall}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Continue Button */}
              <Button
                onClick={onContinue}
                className="w-full h-14 text-lg font-bold rounded-xl shadow-lg transition-all active:scale-[0.98]"
                style={{ 
                  background: `linear-gradient(135deg, ${pack.color}, ${pack.color}dd)`,
                  color: pack.tier === 'silver' ? '#000' : '#fff'
                }}
              >
                لنبدأ المغامرة! ⚽
              </Button>

              <p className="text-white/40 text-xs mt-3">
                يمكنك تعديل اسم وألوان النادي من الإعدادات
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
