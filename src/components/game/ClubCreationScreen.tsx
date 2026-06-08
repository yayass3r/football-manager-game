'use client'

import { useState } from 'react'
import { useGameStore } from '@/lib/game-store'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const LOGOS = ['⚽', '🏀', '🏟️', '🦁', '🐲', '🦅', '⚡', '🔥', '👑', '🌟', '💎', '⭐', '🎯', '🏆', '🏴', '🦊']

const COLORS = [
  '#1a8f3f', '#e74c3c', '#3498db', '#f39c12', '#9b59b6',
  '#1abc9c', '#e67e22', '#2c3e50', '#c0392b', '#27ae60',
  '#8e44ad', '#d35400',
]

const FORMATIONS = ['4-3-3', '4-4-2', '3-5-2', '4-2-3-1', '3-4-3', '5-3-2', '4-1-4-1', '4-5-1']

export default function ClubCreationScreen() {
  const { createClub, isLoading, user } = useGameStore()
  const [name, setName] = useState('')
  const [logo, setLogo] = useState('⚽')
  const [primaryColor, setPrimaryColor] = useState('#1a8f3f')
  const [secondaryColor, setSecondaryColor] = useState('#ffffff')
  const [formation, setFormation] = useState('4-3-3')

  const handleCreate = async () => {
    if (!name.trim() || name.trim().length < 2) return
    await createClub({
      name: name.trim(),
      logo,
      primaryColor,
      secondaryColor,
      formation,
    })
  }

  return (
    <div className="min-h-screen flex flex-col px-5 py-8 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1a3a5c 50%, #0d2137 100%)' }}>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 text-5xl opacity-10 animate-pulse">🏟️</div>
        <div className="absolute bottom-40 left-8 text-4xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }}>🏆</div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-md mx-auto w-full"
      >
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="text-5xl mb-3"
          >
            {logo}
          </motion.div>
          <h2 className="text-2xl font-bold text-white">أنشئ ناديك</h2>
          <p className="text-blue-200/60 text-sm mt-1">مرحباً {user?.username}! اختر تفاصيل ناديك</p>
        </div>

        <div className="space-y-5">
          {/* Club Name */}
          <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
            <label className="text-white/80 text-sm mb-2 block font-medium">اسم النادي</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: النصر الأبيض"
              className="bg-white/10 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl text-lg"
              maxLength={30}
            />
          </div>

          {/* Logo Picker */}
          <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
            <label className="text-white/80 text-sm mb-3 block font-medium">شعار النادي</label>
            <div className="grid grid-cols-8 gap-2">
              {LOGOS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLogo(l)}
                  className={`text-2xl p-1.5 rounded-lg transition-all ${
                    logo === l
                      ? 'bg-emerald-500/30 border-2 border-emerald-400 scale-110'
                      : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
            <label className="text-white/80 text-sm mb-3 block font-medium">ألوان النادي</label>
            <div className="space-y-3">
              <div>
                <p className="text-white/50 text-xs mb-2">اللون الأساسي</p>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setPrimaryColor(c)}
                      className={`w-8 h-8 rounded-full transition-all ${
                        primaryColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a1628] scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-white/50 text-xs mb-2">اللون الثانوي</p>
                <div className="flex gap-2 flex-wrap">
                  {['#ffffff', '#000000', ...COLORS].map((c) => (
                    <button
                      key={c}
                      onClick={() => setSecondaryColor(c)}
                      className={`w-8 h-8 rounded-full transition-all border ${
                        secondaryColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a1628] scale-110' : 'hover:scale-105'
                      } ${c === '#ffffff' ? 'border-white/30' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
            {/* Preview */}
            <div className="flex items-center gap-3 mt-4 p-3 bg-white/5 rounded-lg">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                style={{ backgroundColor: primaryColor, color: secondaryColor, border: `2px solid ${secondaryColor}` }}>
                {logo}
              </div>
              <span className="text-white font-bold">{name || 'اسم النادي'}</span>
            </div>
          </div>

          {/* Formation */}
          <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
            <label className="text-white/80 text-sm mb-3 block font-medium">التشكيلة</label>
            <div className="grid grid-cols-2 gap-2">
              {FORMATIONS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFormation(f)}
                  className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                    formation === f
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Create Button */}
          <Button
            onClick={handleCreate}
            disabled={isLoading || !name.trim() || name.trim().length < 2}
            className="w-full h-14 bg-gradient-to-l from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.98]"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                جاري الإنشاء...
              </div>
            ) : (
              '⚽ إنشاء النادي'
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
