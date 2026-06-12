'use client'

import { useState } from 'react'
import { useGameStore } from '@/lib/game-store'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AuthScreen() {
  const { authMode, setAuthMode, login, register, isLoading } = useGameStore()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState('')

  const validateForm = (): boolean => {
    setLocalError('')

    if (!email.trim()) {
      setLocalError('البريد الإلكتروني مطلوب')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim().toLowerCase())) {
      setLocalError('صيغة البريد الإلكتروني غير صحيحة')
      return false
    }

    if (!password) {
      setLocalError('كلمة المرور مطلوبة')
      return false
    }

    if (password.length < 6) {
      setLocalError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return false
    }

    if (authMode === 'register' && username && username.trim().length > 0 && username.trim().length < 3) {
      setLocalError('اسم المستخدم يجب أن يكون 3 أحرف على الأقل')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      if (authMode === 'login') {
        await login(email.trim(), password)
      } else {
        await register(email.trim(), password, username.trim() || undefined)
      }
    } catch {
      // Error is handled by the store
    }
  }

  const switchMode = (mode: 'login' | 'register') => {
    setAuthMode(mode)
    setLocalError('')
    setEmail('')
    setPassword('')
    setUsername('')
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
              onClick={() => switchMode('login')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                authMode === 'login'
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => switchMode('register')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                authMode === 'register'
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              حساب جديد
            </button>
          </div>

          {/* Error Display */}
          {localError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 mb-4"
            >
              <p className="text-red-300 text-xs text-center">{localError}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-white/80 text-sm mb-1.5 block">البريد الإلكتروني</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setLocalError('') }}
                placeholder="أدخل البريد الإلكتروني"
                className="bg-white/10 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-400 focus:ring-emerald-400/20 h-12 rounded-xl"
                required
                autoComplete="email"
              />
            </div>
            {authMode === 'register' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="text-white/80 text-sm mb-1.5 block">اسم المستخدم (اختياري)</label>
                <Input
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setLocalError('') }}
                  placeholder="سيتم إنشاؤه من البريد إن لم تدخله"
                  className="bg-white/10 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-400 focus:ring-emerald-400/20 h-12 rounded-xl"
                  minLength={3}
                  maxLength={20}
                  autoComplete="username"
                />
              </motion.div>
            )}
            <div>
              <label className="text-white/80 text-sm mb-1.5 block">كلمة المرور</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setLocalError('') }}
                  placeholder="أدخل كلمة المرور"
                  className="bg-white/10 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-400 focus:ring-emerald-400/20 h-12 rounded-xl pl-12"
                  required
                  minLength={6}
                  autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors text-sm"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-l from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري التحميل...
                </div>
              ) : authMode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب'}
            </Button>
          </form>

          {/* Switch mode link */}
          <div className="mt-4 text-center">
            <button
              onClick={() => switchMode(authMode === 'login' ? 'register' : 'login')}
              className="text-emerald-400/70 text-xs hover:text-emerald-400 transition-colors"
            >
              {authMode === 'login'
                ? 'ليس لديك حساب؟ أنشئ واحد الآن'
                : 'لديك حساب بالفعل؟ سجل دخولك'}
            </button>
          </div>
        </motion.div>

        <p className="text-center text-white/30 text-xs mt-6">
          🏆 ابنِ فريقك. اربح البطولات. كن الأسطورة. ⚽
        </p>
      </motion.div>
    </div>
  )
}
