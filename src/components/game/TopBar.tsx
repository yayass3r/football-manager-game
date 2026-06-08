'use client'

import { useGameStore } from '@/lib/game-store'
import { LogOut, Volume2, VolumeX } from 'lucide-react'

export default function TopBar() {
  const { user, club, logout, toggleSound } = useGameStore()

  if (!user || !club) return null

  const soundEnabled = user.soundEnabled !== false

  return (
    <div className="sticky top-0 z-40 bg-[#0d1f35]/95 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-[480px] mx-auto flex items-center justify-between px-4 py-3">
        {/* Club Info */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-lg shadow-lg"
            style={{
              backgroundColor: club.primaryColor,
              color: club.secondaryColor,
              border: `2px solid ${club.secondaryColor}40`,
            }}
          >
            {club.logo}
          </div>
          <div>
            <h2 className="text-white font-bold text-sm leading-tight">{club.name}</h2>
            <p className="text-white/40 text-[10px]">
              المستوى {user.level} • XP {user.xp}
            </p>
          </div>
        </div>

        {/* Currency & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-yellow-500/10 px-2.5 py-1 rounded-full">
            <span className="text-xs">🪙</span>
            <span className="text-yellow-400 text-xs font-bold">{user.coins.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 bg-purple-500/10 px-2.5 py-1 rounded-full">
            <span className="text-xs">💎</span>
            <span className="text-purple-400 text-xs font-bold">{user.gems}</span>
          </div>
          <button
            onClick={toggleSound}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            title={soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-white/40" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-white/20" />
            )}
          </button>
          <button
            onClick={logout}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 text-white/40" />
          </button>
        </div>
      </div>
    </div>
  )
}
