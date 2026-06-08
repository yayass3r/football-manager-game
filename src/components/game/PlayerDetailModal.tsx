'use client'

import { useGameStore, type Player } from '@/lib/game-store'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { X, Dumbbell, DollarSign, ArrowLeftRight } from 'lucide-react'

const POSITION_LABELS: Record<string, string> = {
  GK: 'حارس مرمى',
  CB: 'قلب دفاع',
  LB: 'ظهير أيسر',
  RB: 'ظهير أيمن',
  CM: 'وسط',
  LM: 'جناح أيسر',
  RM: 'جناح أيمن',
  ST: 'مهاجم',
  CF: 'مهاجم ثاني',
}

const STAT_LABELS: Record<string, string> = {
  pace: '⚡ السرعة',
  shooting: '🎯 التسديد',
  passing: '🔁 التمرير',
  dribbling: '🎭 المراوغة',
  defending: '🛡️ الدفاع',
  physical: '💪 البدنية',
}

function getOverallBg(overall: number): string {
  if (overall >= 85) return 'from-yellow-500 via-yellow-400 to-yellow-600'
  if (overall >= 75) return 'from-gray-300 via-gray-200 to-gray-400'
  if (overall >= 65) return 'from-orange-500 via-orange-400 to-orange-600'
  return 'from-gray-500 via-gray-400 to-gray-600'
}

function getOverallLabel(overall: number): string {
  if (overall >= 85) return 'ذهبي'
  if (overall >= 75) return 'فضي'
  if (overall >= 65) return 'برونزي'
  return 'عادي'
}

function StatBar({ label, value }: { label: string; value: number }) {
  const getColor = (v: number) => {
    if (v >= 85) return 'bg-emerald-400'
    if (v >= 70) return 'bg-yellow-400'
    if (v >= 55) return 'bg-orange-400'
    return 'bg-red-400'
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-white/60 text-[11px] w-24 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`h-full rounded-full ${getColor(value)}`}
        />
      </div>
      <span className="text-white/80 text-xs font-bold w-8 text-left">{value}</span>
    </div>
  )
}

export default function PlayerDetailModal() {
  const { selectedPlayer, showPlayerDetail, setShowPlayerDetail, trainPlayer, toggleStarter, sellPlayer, user } = useGameStore()

  if (!selectedPlayer) return null

  const player = selectedPlayer

  const handleTrain = async () => {
    await trainPlayer(player.id)
  }

  const handleToggleStarter = async () => {
    await toggleStarter(player.id)
    setShowPlayerDetail(false)
  }

  const handleSell = async () => {
    const price = Math.round(player.value * 0.8)
    await sellPlayer(player.id, price)
    setShowPlayerDetail(false)
  }

  return (
    <Dialog open={showPlayerDetail} onOpenChange={setShowPlayerDetail}>
      <DialogContent className="bg-[#0d1f35] border-white/10 text-white max-w-[360px] p-0 overflow-hidden rounded-2xl">
        {/* Header with gradient */}
        <div className="relative pt-6 pb-4 px-5"
          style={{
            background: `linear-gradient(135deg, ${getOverallBg(player.overall).includes('yellow') ? '#4a3500' : getOverallBg(player.overall).includes('gray-3') ? '#2a2a2a' : getOverallBg(player.overall).includes('orange') ? '#3a2000' : '#1a1a1a'}, #0d1f35)`,
          }}>
          
          {/* Close button */}
          <button
            onClick={() => setShowPlayerDetail(false)}
            className="absolute top-3 left-3 w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-white/60" />
          </button>

          <div className="flex items-center gap-4">
            {/* Overall Badge */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className={`w-16 h-16 rounded-full bg-gradient-to-b ${getOverallBg(player.overall)} flex items-center justify-center shadow-xl`}
            >
              <span className="text-2xl font-black text-white">{player.overall}</span>
            </motion.div>

            <div>
              <h3 className="text-white font-bold text-lg">{player.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-white/10 px-2 py-0.5 rounded">
                  {POSITION_LABELS[player.position] || player.position}
                </span>
                <span className="text-white/40 text-xs">العمر {player.age}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-white/40">{player.nationality}</span>
                <span className="text-xs text-emerald-400">#{player.shirtNumber || ''}</span>
              </div>
            </div>
          </div>

          {/* Potential & Quality */}
          <div className="flex items-center gap-3 mt-3">
            <div className="bg-white/10 rounded-lg px-3 py-1.5 flex-1 text-center">
              <div className="text-white/40 text-[10px]">الإمكانات</div>
              <div className="text-emerald-400 font-bold text-sm">{player.potential}</div>
            </div>
            <div className="bg-white/10 rounded-lg px-3 py-1.5 flex-1 text-center">
              <div className="text-white/40 text-[10px]">الجودة</div>
              <div className="text-yellow-400 font-bold text-sm">{getOverallLabel(player.overall)}</div>
            </div>
            <div className="bg-white/10 rounded-lg px-3 py-1.5 flex-1 text-center">
              <div className="text-white/40 text-[10px]">{player.isStarter ? 'أساسي' : 'احتياط'}</div>
              <div className={`font-bold text-sm ${player.isStarter ? 'text-emerald-400' : 'text-orange-400'}`}>
                {player.isStarter ? '✓' : '○'}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="px-5 py-4 space-y-2.5">
          <h4 className="text-white/60 text-xs font-bold mb-2">الإحصائيات</h4>
          {Object.entries(STAT_LABELS).map(([key, label]) => (
            <StatBar key={key} label={label} value={player[key as keyof Player] as number} />
          ))}
        </div>

        {/* Morale & Fitness */}
        <div className="px-5 pb-3 space-y-2">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-white/50">المعنويات</span>
              <span className="text-emerald-400">{player.morale}%</span>
            </div>
            <Progress value={player.morale} className="h-1.5 bg-white/10" />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-white/50">اللياقة</span>
              <span className="text-blue-400">{player.fitness}%</span>
            </div>
            <Progress value={player.fitness} className="h-1.5 bg-white/10" />
          </div>
        </div>

        {/* Value & Salary */}
        <div className="px-5 pb-3 flex items-center justify-between bg-white/5 mx-5 rounded-lg p-3">
          <div>
            <div className="text-white/40 text-[10px]">القيمة</div>
            <div className="text-yellow-400 font-bold text-sm">🪙 {player.value.toLocaleString()}</div>
          </div>
          <div className="text-left">
            <div className="text-white/40 text-[10px]">الراتب</div>
            <div className="text-white/60 font-bold text-sm">🪙 {player.salary.toLocaleString()}/أسبوع</div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex gap-2">
          <Button
            onClick={handleTrain}
            disabled={(user?.coins || 0) < 500}
            className="flex-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 h-11 rounded-xl text-xs font-bold"
          >
            <Dumbbell className="w-3.5 h-3.5 ml-1" />
            تدريب (500🪙)
          </Button>
          <Button
            onClick={handleToggleStarter}
            className="flex-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 h-11 rounded-xl text-xs font-bold"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 ml-1" />
            {player.isStarter ? 'احتياطي' : 'أساسي'}
          </Button>
          <Button
            onClick={handleSell}
            className="flex-1 bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 h-11 rounded-xl text-xs font-bold"
          >
            <DollarSign className="w-3.5 h-3.5 ml-1" />
            بيع
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
