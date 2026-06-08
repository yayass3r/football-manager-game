'use client'

import { useState, useEffect } from 'react'
import { useGameStore, type Tournament, type TournamentStanding } from '@/lib/game-store'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Trophy, Star, Users, ChevronDown, ChevronUp, Play } from 'lucide-react'

const TYPE_LABELS: Record<string, string> = {
  league: 'دوري',
  cup: 'كأس',
  champions: 'أبطال',
  super: 'سوبر',
}

const TYPE_COLORS: Record<string, string> = {
  league: 'bg-emerald-500/20 text-emerald-400',
  cup: 'bg-blue-500/20 text-blue-400',
  champions: 'bg-purple-500/20 text-purple-400',
  super: 'bg-yellow-500/20 text-yellow-400',
}

function TournamentCard({
  tournament,
  onJoin,
  onViewStandings,
  clubId,
}: {
  tournament: Tournament
  onJoin: () => void
  onViewStandings: () => void
  clubId?: string
}) {
  const isJoined = false // We'll check from standings
  const isFull = tournament.currentTeams >= tournament.maxTeams
  const isRegistration = tournament.status === 'registration'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 rounded-xl border border-white/5 overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg ${
              tournament.type === 'champions' ? 'bg-purple-500/20' :
              tournament.type === 'super' ? 'bg-yellow-500/20' :
              tournament.type === 'cup' ? 'bg-blue-500/20' : 'bg-emerald-500/20'
            }`}>
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">{tournament.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${TYPE_COLORS[tournament.type] || 'bg-white/10 text-white/40'}`}>
                  {TYPE_LABELS[tournament.type] || tournament.type}
                </span>
                <span className="text-yellow-400 text-[10px]">
                  {'⭐'.repeat(tournament.tier)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="bg-white/5 rounded-lg p-2 text-center">
            <Users className="w-3 h-3 text-white/40 mx-auto mb-0.5" />
            <div className="text-white text-xs font-bold">{tournament.currentTeams}/{tournament.maxTeams}</div>
            <div className="text-white/30 text-[9px]">فرق</div>
          </div>
          <div className="bg-white/5 rounded-lg p-2 text-center">
            <div className="text-yellow-400 text-xs">🪙</div>
            <div className="text-white text-xs font-bold">{(tournament.prize / 1000).toFixed(0)}K</div>
            <div className="text-white/30 text-[9px]">جائزة</div>
          </div>
          <div className="bg-white/5 rounded-lg p-2 text-center">
            <div className="text-purple-400 text-xs">💎</div>
            <div className="text-white text-xs font-bold">{tournament.prizeGems}</div>
            <div className="text-white/30 text-[9px]">جواهر</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          {isRegistration && !isFull && (
            <Button
              onClick={onJoin}
              className="flex-1 h-9 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 text-xs font-bold rounded-lg"
            >
              انضمام ✋
            </Button>
          )}
          <Button
            onClick={onViewStandings}
            variant="ghost"
            className="flex-1 h-9 text-white/40 hover:text-white/60 hover:bg-white/5 text-xs"
          >
            الترتيب 📊
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

function StandingsView({ tournamentId, onBack }: { tournamentId: string; onBack: () => void }) {
  const { tournamentStandings, fetchStandings, simulateRound, club } = useGameStore()
  const [isLoading, setIsLoading] = useState(false)

  const standings = tournamentStandings[tournamentId] || []

  useEffect(() => {
    fetchStandings(tournamentId)
  }, [tournamentId, fetchStandings])

  const handleSimulate = async () => {
    setIsLoading(true)
    await simulateRound(tournamentId)
    setIsLoading(false)
  }

  const userClubId = club?.id

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-white/60 hover:text-white">
          → رجوع
        </Button>
        <Button
          onClick={handleSimulate}
          disabled={isLoading}
          className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 text-xs h-8 rounded-lg"
        >
          <Play className="w-3 h-3 ml-1" />
          محاكاة الجولة
        </Button>
      </div>

      {standings.length === 0 ? (
        <div className="text-center py-8">
          <span className="text-4xl mb-2 block">📊</span>
          <p className="text-white/30 text-sm">لا يوجد ترتيب بعد</p>
        </div>
      ) : (
        <div className="bg-white/5 rounded-xl overflow-hidden border border-white/5">
          {/* Header */}
          <div className="grid grid-cols-[30px_1fr_40px_40px_40px_40px_40px] gap-1 px-3 py-2 bg-white/5 text-white/40 text-[10px] font-bold">
            <span>#</span>
            <span>الفريق</span>
            <span>لعب</span>
            <span>فوز</span>
            <span>تعادل</span>
            <span>خسارة</span>
            <span>نقاط</span>
          </div>
          <ScrollArea className="max-h-72">
            {standings.map((team) => (
              <div
                key={team.id}
                className={`grid grid-cols-[30px_1fr_40px_40px_40px_40px_40px] gap-1 px-3 py-2 text-xs border-b border-white/5 ${
                  team.clubId === userClubId ? 'bg-emerald-500/10' : ''
                }`}
              >
                <span className="text-white/40 font-bold">{team.position}</span>
                <span className={`font-medium truncate ${team.clubId === userClubId ? 'text-emerald-400' : 'text-white/70'}`}>
                  {team.club.logo} {team.club.name}
                </span>
                <span className="text-white/40">{team.played}</span>
                <span className="text-emerald-400">{team.won}</span>
                <span className="text-yellow-400">{team.drawn}</span>
                <span className="text-red-400">{team.lost}</span>
                <span className="text-white font-bold">{team.points}</span>
              </div>
            ))}
          </ScrollArea>
        </div>
      )}
    </div>
  )
}

export default function TournamentsTab() {
  const { tournaments, fetchTournaments, joinTournament, seedTournaments, club } = useGameStore()
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      await fetchTournaments()
      // If no tournaments, seed them
      if (tournaments.length === 0) {
        await seedTournaments()
      }
    }
    load()
  }, [fetchTournaments, seedTournaments, tournaments.length])

  const handleJoin = async (tournamentId: string) => {
    await joinTournament(tournamentId)
  }

  // If viewing standings
  if (selectedTournamentId) {
    return (
      <div className="pb-4">
        <StandingsView
          tournamentId={selectedTournamentId}
          onBack={() => setSelectedTournamentId(null)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold text-lg">🏆 البطولات</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fetchTournaments()}
          className="text-emerald-400 text-xs h-7 hover:bg-emerald-500/10"
        >
          تحديث 🔄
        </Button>
      </div>

      {tournaments.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-5xl mb-3 block">🏆</span>
          <p className="text-white/30 text-sm mb-3">لا توجد بطولات متاحة</p>
          <Button
            onClick={() => seedTournaments()}
            className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30"
          >
            إنشاء البطولات
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {tournaments.map((tournament) => (
            <TournamentCard
              key={tournament.id}
              tournament={tournament}
              clubId={club?.id}
              onJoin={() => handleJoin(tournament.id)}
              onViewStandings={() => setSelectedTournamentId(tournament.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
