'use client'

import { useState, useEffect } from 'react'
import { useGameStore, type MatchEvent } from '@/lib/game-store'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Play } from 'lucide-react'

interface AiOpponent {
  id: string
  name: string
  logo: string
  primaryColor: string
  formation: string
  avgOverall: number
}

function EventIcon({ type }: { type: string }) {
  switch (type) {
    case 'goal': return '⚽'
    case 'yellow_card': return '🟨'
    case 'red_card': return '🟥'
    case 'injury': return '🏥'
    case 'substitution': return '🔄'
    default: return '📌'
  }
}

function getDifficultyColor(overall: number): string {
  if (overall >= 78) return 'text-red-400 bg-red-500/10 border-red-500/20'
  if (overall >= 68) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
  return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
}

function getDifficultyLabel(overall: number): string {
  if (overall >= 78) return 'صعب'
  if (overall >= 68) return 'متوسط'
  return 'سهل'
}

export default function MatchTab() {
  const { club, matchResult, matchHistory, simulateMatch, fetchHistory, createAiOpponent, isLoading, players } = useGameStore()
  const [opponents, setOpponents] = useState<AiOpponent[]>([])
  const [selectedOpponent, setSelectedOpponent] = useState<AiOpponent | null>(null)
  const [matchPhase, setMatchPhase] = useState<'select' | 'live' | 'result'>('select')
  const [liveEvents, setLiveEvents] = useState<MatchEvent[]>([])
  const [liveMinute, setLiveMinute] = useState(0)
  const [liveScore, setLiveScore] = useState({ home: 0, away: 0 })
  const [loadingOpponents, setLoadingOpponents] = useState(false)

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  // Generate opponents when entering tab
  const loadOpponents = async () => {
    if (!club) return
    setLoadingOpponents(true)
    try {
      const newOpponents: AiOpponent[] = []
      for (let i = 0; i < 5; i++) {
        const opp = await createAiOpponent()
        newOpponents.push(opp)
      }
      setOpponents(newOpponents)
    } catch {
      // fallback
    }
    setLoadingOpponents(false)
  }

  useEffect(() => {
    if (matchPhase === 'select' && club) {
      loadOpponents()
    }
  }, [matchPhase, club?.id])

  const handleStartMatch = async () => {
    if (!selectedOpponent || !club) return

    setMatchPhase('live')
    setLiveEvents([])
    setLiveMinute(0)
    setLiveScore({ home: 0, away: 0 })

    await simulateMatch(club.id, selectedOpponent.id)
  }

  // Animate match events after simulation
  useEffect(() => {
    if (matchPhase === 'live' && matchResult) {
      const events = matchResult.events
      let idx = 0

      const showNext = () => {
        if (idx < events.length) {
          const event = events[idx]
          setLiveEvents(prev => [...prev, event])
          setLiveMinute(event.minute)

          if (event.type === 'goal') {
            if (event.team === 'home') {
              setLiveScore(prev => ({ ...prev, home: prev.home + 1 }))
            } else {
              setLiveScore(prev => ({ ...prev, away: prev.away + 1 }))
            }
          }

          idx++
          setTimeout(showNext, 800)
        } else {
          setLiveMinute(90)
          setTimeout(() => setMatchPhase('result'), 1500)
        }
      }

      setTimeout(showNext, 500)
    }
  }, [matchPhase, matchResult])

  const handleNewMatch = () => {
    setMatchPhase('select')
    setSelectedOpponent(null)
    setLiveEvents([])
    setLiveScore({ home: 0, away: 0 })
  }

  if (!club) return null

  const avgOverall = players.filter(p => p.isStarter).length > 0
    ? Math.round(players.filter(p => p.isStarter).reduce((s, p) => s + p.overall, 0) / players.filter(p => p.isStarter).length)
    : 0

  return (
    <div className="space-y-4 pb-4">
      <AnimatePresence mode="wait">
        {/* Opponent Selection */}
        {matchPhase === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center">
              <h3 className="text-white font-bold text-lg">⚽ اختر الخصم</h3>
              <p className="text-white/40 text-xs mt-1">قوة فريقك: {avgOverall} Overall</p>
            </div>

            {/* My Team Card */}
            <div className="bg-gradient-to-l from-emerald-500/10 to-emerald-600/5 rounded-xl p-4 border border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-b from-emerald-500 to-emerald-600 flex items-center justify-center text-xl shadow-lg">
                  {club.logo}
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-bold">{club.name}</h4>
                  <p className="text-emerald-400 text-xs">التشكيلة: {club.formation} • القوة: {avgOverall}</p>
                </div>
              </div>
            </div>

            {/* Opponent List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-white/60 text-xs font-bold">الخصوم المتاحون</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadOpponents}
                  disabled={loadingOpponents}
                  className="text-emerald-400 text-xs h-6 hover:bg-emerald-500/10"
                >
                  تحديث 🔄
                </Button>
              </div>
              {loadingOpponents ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin mx-auto" />
                  <p className="text-white/30 text-xs mt-2">جاري تحميل الخصوم...</p>
                </div>
              ) : (
                opponents.map((opp) => (
                  <motion.button
                    key={opp.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedOpponent(opp)}
                    className={`w-full flex items-center gap-3 rounded-xl p-3 border transition-all ${
                      selectedOpponent?.id === opp.id
                        ? 'bg-yellow-500/10 border-yellow-500/30'
                        : 'bg-white/5 border-white/5 hover:bg-white/8'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-lg"
                      style={{ backgroundColor: opp.primaryColor + '40', border: `2px solid ${opp.primaryColor}` }}>
                      {opp.logo}
                    </div>
                    <div className="flex-1 text-right">
                      <h5 className="text-white font-bold text-sm">{opp.name}</h5>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getDifficultyColor(opp.avgOverall)}`}>
                          {getDifficultyLabel(opp.avgOverall)} • {opp.avgOverall} OVR
                        </span>
                        <span className="text-white/20 text-[10px]">{opp.formation}</span>
                      </div>
                    </div>
                    {selectedOpponent?.id === opp.id && (
                      <span className="text-yellow-400 text-sm">✓</span>
                    )}
                  </motion.button>
                ))
              )}
            </div>

            {/* Play Button */}
            <Button
              onClick={handleStartMatch}
              disabled={!selectedOpponent || isLoading}
              className="w-full h-14 bg-gradient-to-l from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-emerald-500/25"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري التحميل...
                </div>
              ) : (
                <>
                  <Play className="w-5 h-5 ml-2" />
                  ابدأ المباراة
                </>
              )}
            </Button>

            {/* Match History */}
            {matchHistory.length > 0 && (
              <div className="mt-4">
                <h4 className="text-white/60 text-xs font-bold mb-2">📋 سجل المباريات</h4>
                <ScrollArea className="max-h-64">
                  <div className="space-y-2">
                    {matchHistory.map((match) => (
                      <div key={match.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          match.result === 'win' ? 'bg-emerald-500/20 text-emerald-400' :
                          match.result === 'draw' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {match.result === 'win' ? 'فوز' : match.result === 'draw' ? 'تعادل' : 'خسارة'}
                        </span>
                        <div className="flex-1 text-center">
                          <span className="text-white text-xs">
                            {match.homeClub.name} {match.homeGoals} - {match.awayGoals} {match.awayClub.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </motion.div>
        )}

        {/* Live Match */}
        {matchPhase === 'live' && (
          <motion.div
            key="live"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Scoreboard */}
            <div className="bg-gradient-to-b from-[#0a1628] to-[#1a3a5c] rounded-2xl p-5 border border-white/10 shadow-2xl">
              <div className="text-center mb-4">
                <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-3 py-1 rounded-full">
                  ⏱️ الدقيقة {liveMinute}&apos;
                </span>
              </div>

              <div className="flex items-center justify-center gap-4">
                <div className="text-center flex-1">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-xl mx-auto mb-1">
                    {club.logo}
                  </div>
                  <span className="text-white text-xs font-bold">{club.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <motion.span
                    key={liveScore.home}
                    initial={{ scale: 1.5 }}
                    animate={{ scale: 1 }}
                    className="text-white text-3xl font-black"
                  >
                    {liveScore.home}
                  </motion.span>
                  <span className="text-white/30 text-xl">-</span>
                  <motion.span
                    key={liveScore.away}
                    initial={{ scale: 1.5 }}
                    animate={{ scale: 1 }}
                    className="text-white text-3xl font-black"
                  >
                    {liveScore.away}
                  </motion.span>
                </div>

                <div className="text-center flex-1">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl mx-auto mb-1">
                    {selectedOpponent?.logo || '🏟️'}
                  </div>
                  <span className="text-white text-xs font-bold">{selectedOpponent?.name || 'الخصم'}</span>
                </div>
              </div>
            </div>

            {/* Live Events */}
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              <div className="px-4 py-2 bg-white/5 border-b border-white/5">
                <span className="text-white/60 text-xs font-bold">📺 أحداث المباراة</span>
              </div>
              <ScrollArea className="max-h-72">
                <div className="p-3 space-y-2">
                  {liveEvents.length === 0 && (
                    <p className="text-white/20 text-xs text-center py-4">بداية المباراة...</p>
                  )}
                  {liveEvents.map((event, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: event.team === 'home' ? 30 : -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-center gap-2 p-2 rounded-lg ${
                        event.type === 'goal' ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-white/5'
                      }`}
                    >
                      <span className="text-sm">{EventIcon(event.type)}</span>
                      <span className="text-white/70 text-xs flex-1">{event.description}</span>
                      <span className="text-white/30 text-[10px]">{event.minute}&apos;</span>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        )}

        {/* Match Result */}
        {matchPhase === 'result' && matchResult && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            {/* Result Card */}
            <div className="bg-gradient-to-b from-[#0a1628] to-[#1a3a5c] rounded-2xl p-5 border border-white/10 text-center">
              {matchResult.homeGoals > matchResult.awayGoals ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <span className="text-5xl mb-3 block">🎉</span>
                  <h3 className="text-emerald-400 font-bold text-xl">فوز رائع!</h3>
                </motion.div>
              ) : matchResult.homeGoals < matchResult.awayGoals ? (
                <div>
                  <span className="text-5xl mb-3 block">😔</span>
                  <h3 className="text-red-400 font-bold text-xl">خسارة</h3>
                </div>
              ) : (
                <div>
                  <span className="text-5xl mb-3 block">🤝</span>
                  <h3 className="text-yellow-400 font-bold text-xl">تعادل</h3>
                </div>
              )}

              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-xl mx-auto mb-1">
                    {club.logo}
                  </div>
                  <span className="text-white text-xs">{club.name}</span>
                </div>
                <div className="text-white text-4xl font-black">
                  {matchResult.homeGoals} - {matchResult.awayGoals}
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl mx-auto mb-1">
                    {selectedOpponent?.logo || '🏟️'}
                  </div>
                  <span className="text-white text-xs">{selectedOpponent?.name || 'الخصم'}</span>
                </div>
              </div>
            </div>

            {/* Match Stats */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h4 className="text-white/60 text-xs font-bold mb-3">📊 إحصائيات المباراة</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-white/40 text-[10px]">قوة الفريق</div>
                  <div className="text-emerald-400 font-bold">{matchResult.homeStrength}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-white/40 text-[10px]">قوة الخصم</div>
                  <div className="text-red-400 font-bold">{matchResult.awayStrength}</div>
                </div>
              </div>
            </div>

            {/* All Events */}
            {matchResult.events.length > 0 && (
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h4 className="text-white/60 text-xs font-bold mb-2">📋 أحداث المباراة</h4>
                <div className="space-y-1.5">
                  {matchResult.events.map((event, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <span>{EventIcon(event.type)}</span>
                      <span className="text-white/60 flex-1">{event.description}</span>
                      <span className="text-white/30">{event.minute}&apos;</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rewards */}
            <div className="bg-yellow-500/5 rounded-xl p-4 border border-yellow-500/20">
              <h4 className="text-yellow-400 text-xs font-bold mb-2">🎁 المكافآت</h4>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <span>🪙</span>
                  <span className="text-yellow-400 font-bold">
                    {matchResult.homeGoals > matchResult.awayGoals ? '1,500' :
                     matchResult.homeGoals === matchResult.awayGoals ? '500' : '200'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span>⭐</span>
                  <span className="text-white/60 font-bold">
                    +{matchResult.homeGoals > matchResult.awayGoals ? '50' : '10'} XP
                  </span>
                </div>
              </div>
            </div>

            {/* Play Again */}
            <Button
              onClick={handleNewMatch}
              className="w-full h-12 bg-gradient-to-l from-emerald-500 to-emerald-600 text-white font-bold rounded-xl"
            >
              🔄 لعب مباراة جديدة
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
