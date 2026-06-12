'use client'

import { useGameStore } from '@/lib/game-store'
import { motion, AnimatePresence } from 'framer-motion'

export default function NotificationToast() {
  const { notifications, removeNotification } = useGameStore()

  return (
    <div className="fixed top-4 left-4 right-4 z-[100] flex flex-col items-center gap-2 pointer-events-none max-w-[480px] mx-auto">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={() => removeNotification(notification.id)}
            className={`pointer-events-auto px-4 py-3 rounded-xl shadow-2xl backdrop-blur-xl border text-sm font-medium max-w-[90vw] ${
              notification.type === 'success'
                ? 'bg-emerald-500/90 border-emerald-400/30 text-white'
                : notification.type === 'error'
                ? 'bg-red-500/90 border-red-400/30 text-white'
                : 'bg-blue-500/90 border-blue-400/30 text-white'
            }`}
          >
            {notification.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
