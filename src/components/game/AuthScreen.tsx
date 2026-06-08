'use client'

import { useState } from 'react'
import { useGameStore } from '@/lib/game-store'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AuthScreen() {
  const { authMode, setAuthMode, login, register, isLoading } = useGameStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (authMode === 'login') {
      await login(username, password)
    } else {
      await register(username, password)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1a3a5c 50%, #0d2137 100%)' }}>

      {/* Animated background patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 text-6xl opacity-10 animate-pulse">⚽</div>
        <div className="absolute top-32 left-8 text-4xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }}>🏆</div>
        <div className="absolute bottom-32 right-16 text-5xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}>🏟️</div>
        <div className="absolute bottom-16 left-12 text-4xl opacity-10 animate-pulse" style={{ animationDelay: '0.5s' }}>⭐</div>
        <div className="absolute top-1/2 right-4 text-3xl opacity-10 animate-pulse" style={{ animationDelay: '1.5s' }}>🦅</div>
        <div className="absolute top-20 left-1/3 text-3xl opacity-10 animate-pulse" style={{ animationDelay: '2.5s' }}>🔥</div>
        {/* Field lines decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150px] h-[150px] rounded-full border border-white/5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-white/5" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="text-7xl mb-4"
          >
            ⚽
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">نادي الاسطورة</h1>
          <p className="text-blue-200/70 text-sm">أنشئ ناديك وقده نحو المجد</p>
        </div>

        {/* Auth Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl"
        >
          {/* Tab Switcher */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-6">
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                authMode === 'login'
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                authMode === 'register'
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              حساب جديد
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-white/80 text-sm mb-1.5 block">اسم المستخدم</label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم"
                className="bg-white/10 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-400 focus:ring-emerald-400/20 h-12 rounded-xl"
                required
                minLength={3}
              />
            </div>
            <div>
              <label className="text-white/80 text-sm mb-1.5 block">كلمة المرور</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                className="bg-white/10 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-400 focus:ring-emerald-400/20 h-12 rounded-xl"
                required
                minLength={6}
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-l from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري التحميل...
                </div>
              ) : authMode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب'}
            </Button>
          </form>
        </motion.div>

        <p className="text-center text-white/30 text-xs mt-6">
          🏆 ابنِ فريقك. اربح البطولات. كن الأسطورة. ⚽
        </p>
      </motion.div>
    </div>
  )
}
