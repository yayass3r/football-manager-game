'use client'

import { useState, useMemo } from 'react'
import { useGameStore, type Player } from '@/lib/game-store'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react'

const POSITION_GROUPS = {
  'حراس المرمى': ['GK'],
  'الدفاع': ['CB', 'LB', 'RB'],
  'الوسط': ['CM', 'LM', 'RM'],
  'الهجوم': ['ST', 'CF'],
}

const POSITION_LABELS: Record<string, string> = {
  GK: 'حارس',
  CB: 'قلب دفاع',
  LB: 'ظهير أيسر',
  RB: 'ظهير أيمن',
  CM: 'وسط',
  LM: 'جناح أيسر',
  RM: 'جناح أيمن',
  ST: 'مهاجم',
  CF: 'مهاجم ثاني',
}

const POSITION_COLORS: Record<string, string> = {
  GK: 'bg-yellow-500/20 text-yellow-400',
  CB: 'bg-blue-500/20 text-blue-400',
  LB: 'bg-blue-500/20 text-blue-400',
  RB: 'bg-blue-500/20 text-blue-400',
  CM: 'bg-emerald-500/20 text-emerald-400',
  LM: 'bg-emerald-500/20 text-emerald-400',
  RM: 'bg-emerald-500/20 text-emerald-400',
  ST: 'bg-red-500/20 text-red-400',
  CF: 'bg-red-500/20 text-red-400',
}

function getOverallColor(overall: number): string {
  if (overall >= 85) return 'from-yellow-400 to-yellow-600'
  if (overall >= 75) return 'from-gray-300 to-gray-400'
  if (overall >= 65) return 'from-orange-400 to-orange-600'
  return 'from-gray-500 to-gray-600'
}

function getOverallTextColor(overall: number): string {
  if (overall >= 85) return 'text-yellow-400'
  if (overall >= 75) return 'text-gray-300'
  if (overall >= 65) return 'text-orange-400'
  return 'text-gray-400'
}

// Formation positions mapping for visual display
const FORMATION_POSITIONS: Record<string, { x: number; y: number; pos: string }[]> = {
  '4-3-3': [
    { x: 50, y: 90, pos: 'GK' },
    { x: 20, y: 72, pos: 'LB' }, { x: 40, y: 72, pos: 'CB' }, { x: 60, y: 72, pos: 'CB' }, { x: 80, y: 72, pos: 'RB' },
    { x: 25, y: 50, pos: 'LM' }, { x: 50, y: 50, pos: 'CM' }, { x: 75, y: 50, pos: 'RM' },
    { x: 20, y: 28, pos: 'ST' }, { x: 50, y: 25, pos: 'CF' }, { x: 80, y: 28, pos: 'ST' },
  ],
  '4-4-2': [
    { x: 50, y: 90, pos: 'GK' },
    { x: 20, y: 72, pos: 'LB' }, { x: 40, y: 72, pos: 'CB' }, { x: 60, y: 72, pos: 'CB' }, { x: 80, y: 72, pos: 'RB' },
    { x: 20, y: 48, pos: 'LM' }, { x: 40, y: 48, pos: 'CM' }, { x: 60, y: 48, pos: 'CM' }, { x: 80, y: 48, pos: 'RM' },
    { x: 35, y: 25, pos: 'ST' }, { x: 65, y: 25, pos: 'CF' },
  ],
  '3-5-2': [
    { x: 50, y: 90, pos: 'GK' },
    { x: 30, y: 72, pos: 'CB' }, { x: 50, y: 72, pos: 'CB' }, { x: 70, y: 72, pos: 'CB' },
    { x: 15, y: 48, pos: 'LM' }, { x: 35, y: 48, pos: 'CM' }, { x: 50, y: 42, pos: 'CM' }, { x: 65, y: 48, pos: 'CM' }, { x: 85, y: 48, pos: 'RM' },
    { x: 35, y: 25, pos: 'ST' }, { x: 65, y: 25, pos: 'CF' },
  ],
  '4-2-3-1': [
    { x: 50, y: 90, pos: 'GK' },
    { x: 20, y: 72, pos: 'LB' }, { x: 40, y: 72, pos: 'CB' }, { x: 60, y: 72, pos: 'CB' }, { x: 80, y: 72, pos: 'RB' },
    { x: 35, y: 55, pos: 'CM' }, { x: 65, y: 55, pos: 'CM' },
    { x: 20, y: 38, pos: 'LM' }, { x: 50, y: 35, pos: 'CF' }, { x: 80, y: 38, pos: 'RM' },
    { x: 50, y: 20, pos: 'ST' },
  ],
  '3-4-3': [
    { x: 50, y: 90, pos: 'GK' },
    { x: 30, y: 72, pos: 'CB' }, { x: 50, y: 72, pos: 'CB' }, { x: 70, y: 72, pos: 'CB' },
    { x: 20, y: 48, pos: 'LM' }, { x: 40, y: 48, pos: 'CM' }, { x: 60, y: 48, pos: 'CM' }, { x: 80, y: 48, pos: 'RM' },
    { x: 20, y: 25, pos: 'ST' }, { x: 50, y: 22, pos: 'CF' }, { x: 80, y: 25, pos: 'ST' },
  ],
  '5-3-2': [
    { x: 50, y: 90, pos: 'GK' },
    { x: 15, y: 70, pos: 'LB' }, { x: 35, y: 72, pos: 'CB' }, { x: 50, y: 74, pos: 'CB' }, { x: 65, y: 72, pos: 'CB' }, { x: 85, y: 70, pos: 'RB' },
    { x: 25, y: 48, pos: 'CM' }, { x: 50, y: 48, pos: 'CM' }, { x: 75, y: 48, pos: 'CM' },
    { x: 35, y: 25, pos: 'ST' }, { x: 65, y: 25, pos: 'CF' },
  ],
  '4-1-4-1': [
    { x: 50, y: 90, pos: 'GK' },
    { x: 20, y: 72, pos: 'LB' }, { x: 40, y: 72, pos: 'CB' }, { x: 60, y: 72, pos: 'CB' }, { x: 80, y: 72, pos: 'RB' },
    { x: 50, y: 57, pos: 'CM' },
    { x: 20, y: 40, pos: 'LM' }, { x: 40, y: 40, pos: 'CM' }, { x: 60, y: 40, pos: 'CM' }, { x: 80, y: 40, pos: 'RM' },
    { x: 50, y: 22, pos: 'ST' },
  ],
  '4-5-1': [
    { x: 50, y: 90, pos: 'GK' },
    { x: 20, y: 72, pos: 'LB' }, { x: 40, y: 72, pos: 'CB' }, { x: 60, y: 72, pos: 'CB' }, { x: 80, y: 72, pos: 'RB' },
    { x: 15, y: 48, pos: 'LM' }, { x: 35, y: 48, pos: 'CM' }, { x: 50, y: 42, pos: 'CM' }, { x: 65, y: 48, pos: 'CM' }, { x: 85, y: 48, pos: 'RM' },
    { x: 50, y: 22, pos: 'ST' },
  ],
}

function FormationView() {
  const { club, players, setSelectedPlayer, setShowPlayerDetail } = useGameStore()
  if (!club) return null

  const positions = FORMATION_POSITIONS[club.formation] || FORMATION_POSITIONS['4-3-3']
  const starters = players.filter(p => p.isStarter)

  const getPlayerForPos = (pos: string) => {
    const matching = starters.filter(p => p.position === pos)
    if (matching.length > 0) return matching[0]
    return null
  }

  // Track which positions have been used to avoid duplicates
  const usedPlayers = new Map<string, Player>()
  const getPositionPlayer = (pos: string) => {
    const matching = starters.filter(p => p.position === pos && !usedPlayers.has(p.id))
    if (matching.length > 0) {
      usedPlayers.set(matching[0].id, matching[0])
      return matching[0]
    }
    // Fallback to any unused starter
    const anyUnused = starters.filter(p => !usedPlayers.has(p.id))
    if (anyUnused.length > 0) {
      usedPlayers.set(anyUnused[0].id, anyUnused[0])
      return anyUnused[0]
    }
    return null
  }

  return (
    <div className="relative w-full aspect-[3/4] bg-gradient-to-b from-emerald-900/40 to-emerald-800/20 rounded-xl overflow-hidden border border-emerald-500/20">
      {/* Field markings */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-white/10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 border-b border-l border-r border-white/10 rounded-b-lg" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-16 border-t border-l border-r border-white/10 rounded-t-lg" />
      </div>

      {/* Players */}
      {positions.map((pos, idx) => {
        const player = idx === 0 ? getPlayerForPos(pos.pos) : getPositionPlayer(pos.pos)
        return (
          <motion.button
            key={idx}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => {
              if (player) {
                setSelectedPlayer(player)
                setShowPlayerDetail(true)
              }
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shadow-lg ${
              player
                ? `bg-gradient-to-b ${getOverallColor(player.overall)} text-white`
                : 'bg-white/10 text-white/30'
            }`}>
              {player ? player.overall : '?'}
            </div>
            <span className="text-[8px] text-white/80 mt-0.5 max-w-[60px] truncate text-center">
              {player ? player.name.split(' ')[0] : pos.pos}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}

function PlayerCard({ player, onTap }: { player: Player; onTap: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onTap}
      className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/8 rounded-xl p-3 border border-white/5 transition-colors"
    >
      {/* Overall Badge */}
      <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold bg-gradient-to-b ${getOverallColor(player.overall)} text-white shadow-lg shrink-0`}>
        {player.overall}
      </div>

      <div className="flex-1 text-right min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-white font-bold text-sm truncate">{player.name}</h4>
          {!player.isStarter && (
            <span className="text-[9px] bg-white/10 text-white/40 px-1.5 py-0.5 rounded">احتياط</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${POSITION_COLORS[player.position] || 'bg-white/10 text-white/40'}`}>
            {POSITION_LABELS[player.position] || player.position}
          </span>
          <span className="text-white/30 text-[10px]">العمر {player.age}</span>
        </div>
      </div>

      <div className="text-left shrink-0">
        <div className="text-white/30 text-[10px]">القيمة</div>
        <div className="text-yellow-400 text-xs font-bold">{(player.value / 1000).toFixed(0)}K</div>
      </div>
    </motion.button>
  )
}

export default function SquadTab() {
  const { players, club, setSelectedPlayer, setShowPlayerDetail, updateFormation } = useGameStore()
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'overall' | 'position' | 'age'>('overall')
  const [sortAsc, setSortAsc] = useState(false)
  const [showFormation, setShowFormation] = useState(true)
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)

  const filteredPlayers = useMemo(() => {
    let result = [...players]

    // Search
    if (search) {
      result = result.filter(p =>
        p.name.includes(search) || p.position.includes(search.toUpperCase())
      )
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0
      switch (sortBy) {
        case 'overall': cmp = a.overall - b.overall; break
        case 'age': cmp = a.age - b.age; break
        case 'position': cmp = a.position.localeCompare(b.position); break
      }
      return sortAsc ? cmp : -cmp
    })

    return result
  }, [players, search, sortBy, sortAsc])

  const groupedPlayers = useMemo(() => {
    const groups: Record<string, Player[]> = {}
    for (const [label, positions] of Object.entries(POSITION_GROUPS)) {
      const groupPlayers = filteredPlayers.filter(p => positions.includes(p.position))
      if (groupPlayers.length > 0) {
        groups[label] = groupPlayers
      }
    }
    return groups
  }, [filteredPlayers])

  const FORMATIONS = ['4-3-3', '4-4-2', '3-5-2', '4-2-3-1', '3-4-3', '5-3-2', '4-1-4-1', '4-5-1']

  const handlePlayerTap = (player: Player) => {
    setSelectedPlayer(player)
    setShowPlayerDetail(true)
  }

  return (
    <div className="space-y-4 pb-4">
      {/* Formation View Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFormation(!showFormation)}
          className="text-emerald-400 hover:bg-emerald-500/10 text-xs"
        >
          {showFormation ? '📋 عرض القائمة' : '⚽ عرض التشكيلة'}
        </Button>
        <div className="text-white/40 text-xs">
          اللاعبون: {players.length} | الأساسيون: {players.filter(p => p.isStarter).length}
        </div>
      </div>

      {/* Formation Selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {FORMATIONS.map((f) => (
          <button
            key={f}
            onClick={() => updateFormation(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              club?.formation === f
                ? 'bg-emerald-500 text-white'
                : 'bg-white/5 text-white/50 hover:bg-white/10'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {showFormation && <FormationView />}

      {/* Search & Sort */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن لاعب..."
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-10 pr-9 rounded-xl text-sm"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (sortBy === 'overall') setSortBy('position')
            else if (sortBy === 'position') setSortBy('age')
            else setSortBy('overall')
            setSortAsc(!sortAsc)
          }}
          className="bg-white/5 border border-white/10 h-10 w-10 rounded-xl text-white/50 hover:bg-white/10"
        >
          <ArrowUpDown className="w-4 h-4" />
        </Button>
      </div>

      {/* Player Groups */}
      <div className="space-y-3">
        {Object.entries(groupedPlayers).map(([groupLabel, groupPlayers]) => (
          <div key={groupLabel}>
            <button
              onClick={() => setExpandedGroup(expandedGroup === groupLabel ? null : groupLabel)}
              className="flex items-center justify-between w-full mb-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-sm font-bold">{groupLabel}</span>
                <span className="text-white/20 text-xs">({groupPlayers.length})</span>
              </div>
              {expandedGroup === groupLabel ? (
                <ChevronUp className="w-4 h-4 text-white/30" />
              ) : (
                <ChevronDown className="w-4 h-4 text-white/30" />
              )}
            </button>
            <div className={`space-y-2 ${expandedGroup === groupLabel ? '' : 'max-h-96 overflow-hidden'}`}>
              {groupPlayers.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  onTap={() => handlePlayerTap(player)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
