'use client'

import { useGameStore, type TabType } from '@/lib/game-store'
import { motion } from 'framer-motion'

const TABS: { id: TabType; icon: string; label: string }[] = [
  { id: 'home', icon: '🏠', label: 'الرئيسية' },
  { id: 'squad', icon: '👥', label: 'الفريق' },
  { id: 'match', icon: '⚽', label: 'المباراة' },
  { id: 'market', icon: '🏪', label: 'السوق' },
  { id: 'tournaments', icon: '🏆', label: 'البطولات' },
  { id: 'packs', icon: '🎰', label: 'الحزم' },
  { id: 'leaderboard', icon: '📊', label: 'الترتيب' },
  { id: 'achievements', icon: '🏅', label: 'الإنجازات' },
]

export default function BottomNav() {
  const { currentTab, setTab } = useGameStore()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0d1f35]/95 backdrop-blur-xl border-t border-white/10">
      <div className="max-w-[480px] mx-auto">
        <div className="flex items-center overflow-x-auto scrollbar-hide px-1 py-1 gap-0.5" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className="relative flex flex-col items-center justify-center py-2 px-2.5 min-w-[52px] flex-shrink-0 transition-all"
            >
              {currentTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-1 w-8 h-1 rounded-full bg-emerald-400"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <span className={`text-lg transition-all ${currentTab === tab.id ? 'scale-110' : ''}`}>
                {tab.icon}
              </span>
              <span className={`text-[9px] mt-0.5 font-medium transition-colors whitespace-nowrap ${
                currentTab === tab.id ? 'text-emerald-400' : 'text-white/40'
              }`}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>
      {/* Safe area spacer for mobile */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  )
}
