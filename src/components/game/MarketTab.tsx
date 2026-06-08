'use client'

import { useState, useEffect } from 'react'
import { useGameStore, type Player } from '@/lib/game-store'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Search, ShoppingBag, Tag, X, Coins } from 'lucide-react'

const POSITION_LABELS: Record<string, string> = {
  GK: 'حارس', CB: 'قلب دفاع', LB: 'ظهير أيسر', RB: 'ظهير أيمن',
  CM: 'وسط', LM: 'جناح أيسر', RM: 'جناح أيمن', ST: 'مهاجم', CF: 'مهاجم ثاني',
}

function getOverallColor(overall: number): string {
  if (overall >= 85) return 'from-yellow-400 to-yellow-600'
  if (overall >= 75) return 'from-gray-300 to-gray-400'
  if (overall >= 65) return 'from-orange-400 to-orange-600'
  return 'from-gray-500 to-gray-600'
}

function MarketPlayerCard({ player, price, onBuy }: { player: Player; price: number; onBuy: () => void }) {
  const { user } = useGameStore()
  const canAfford = (user?.coins || 0) >= price

  return (
    <div className="bg-white/5 rounded-xl p-3 border border-white/5 hover:bg-white/8 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-full bg-gradient-to-b ${getOverallColor(player.overall)} flex items-center justify-center text-sm font-bold text-white shadow-lg shrink-0`}>
          {player.overall}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-bold text-sm truncate">{player.name}</h4>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] bg-white/10 text-white/60 px-1.5 py-0.5 rounded">
              {POSITION_LABELS[player.position] || player.position}
            </span>
            <span className="text-white/30 text-[10px]">العمر {player.age}</span>
          </div>
        </div>
        <div className="text-left shrink-0">
          <div className="text-yellow-400 font-bold text-sm flex items-center gap-1">
            <Coins className="w-3 h-3" />
            {price.toLocaleString()}
          </div>
          <Button
            size="sm"
            onClick={onBuy}
            disabled={!canAfford}
            className="mt-1 h-7 text-[10px] bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 rounded-lg w-full"
          >
            {canAfford ? 'شراء' : 'رصيد غير كاف'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function MarketTab() {
  const { transferMarket, fetchMarket, buyPlayer, players, sellPlayer, user } = useGameStore()
  const [filterPos, setFilterPos] = useState<string>('all')
  const [maxPrice, setMaxPrice] = useState(100000)
  const [minOverall, setMinOverall] = useState(0)
  const [search, setSearch] = useState('')
  const [showSellDialog, setShowSellDialog] = useState(false)
  const [sellPlayerData, setSellPlayerData] = useState<Player | null>(null)
  const [sellPrice, setSellPrice] = useState(0)
  const [activeSection, setActiveSection] = useState<'buy' | 'sell'>('buy')

  useEffect(() => {
    fetchMarket()
  }, [fetchMarket])

  const filteredMarket = transferMarket.filter((listing) => {
    if (filterPos !== 'all' && listing.player.position !== filterPos) return false
    if (listing.price > maxPrice) return false
    if (listing.player.overall < minOverall) return false
    if (search && !listing.player.name.includes(search)) return false
    return true
  })

  const handleBuy = async (listingId: string) => {
    await buyPlayer(listingId)
  }

  const handleSell = async () => {
    if (!sellPlayerData) return
    await sellPlayer(sellPlayerData.id, sellPrice)
    setShowSellDialog(false)
    setSellPlayerData(null)
  }

  const myPlayersOnMarket = transferMarket.filter(l => l.sellerClubId === user?.club?.id)

  return (
    <div className="space-y-4 pb-4">
      {/* Section Toggle */}
      <div className="flex bg-white/5 rounded-xl p-1">
        <button
          onClick={() => setActiveSection('buy')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeSection === 'buy'
              ? 'bg-emerald-500 text-white shadow-lg'
              : 'text-white/40 hover:text-white/60'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          شراء لاعبين
        </button>
        <button
          onClick={() => setActiveSection('sell')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeSection === 'sell'
              ? 'bg-yellow-500 text-white shadow-lg'
              : 'text-white/40 hover:text-white/60'
          }`}
        >
          <Tag className="w-4 h-4" />
          بيع لاعبين
        </button>
      </div>

      {activeSection === 'buy' && (
        <>
          {/* Filters */}
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث عن لاعب..."
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-10 pr-9 rounded-xl text-sm"
              />
            </div>

            {/* Position filter */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {['all', 'GK', 'CB', 'LB', 'RB', 'CM', 'LM', 'RM', 'ST', 'CF'].map((pos) => (
                <button
                  key={pos}
                  onClick={() => setFilterPos(pos)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    filterPos === pos
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white/5 text-white/40 hover:bg-white/10'
                  }`}
                >
                  {pos === 'all' ? 'الكل' : POSITION_LABELS[pos] || pos}
                </button>
              ))}
            </div>

            {/* Price & Overall filters */}
            <div className="bg-white/5 rounded-xl p-3 border border-white/5 space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/40">الحد الأقصى للسعر</span>
                  <span className="text-yellow-400">{maxPrice.toLocaleString()} 🪙</span>
                </div>
                <Slider
                  value={[maxPrice]}
                  onValueChange={([v]) => setMaxPrice(v)}
                  max={200000}
                  min={1000}
                  step={1000}
                  className="mt-1"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/40">الحد الأدنى للتقييم</span>
                  <span className="text-emerald-400">{minOverall}+</span>
                </div>
                <Slider
                  value={[minOverall]}
                  onValueChange={([v]) => setMinOverall(v)}
                  max={99}
                  min={0}
                  step={5}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Market Listings */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white/40 text-xs">اللاعبون المتاحون ({filteredMarket.length})</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchMarket()}
                className="text-emerald-400 text-xs h-7 hover:bg-emerald-500/10"
              >
                تحديث 🔄
              </Button>
            </div>

            <ScrollArea className="max-h-[50vh]">
              <div className="space-y-2">
                {filteredMarket.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-4xl mb-2 block">🏪</span>
                    <p className="text-white/30 text-sm">لا يوجد لاعبون في السوق حالياً</p>
                  </div>
                ) : (
                  filteredMarket.map((listing) => (
                    <MarketPlayerCard
                      key={listing.id}
                      player={listing.player}
                      price={listing.price}
                      onBuy={() => handleBuy(listing.id)}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </>
      )}

      {activeSection === 'sell' && (
        <>
          {/* My listings */}
          {myPlayersOnMarket.length > 0 && (
            <div className="bg-yellow-500/5 rounded-xl p-3 border border-yellow-500/20">
              <h4 className="text-yellow-400 text-xs font-bold mb-2">📋 لاعبون معروضون للبيع</h4>
              <div className="space-y-2">
                {myPlayersOnMarket.map((listing) => (
                  <div key={listing.id} className="flex items-center justify-between bg-white/5 rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-xs">{listing.player.name}</span>
                      <span className="text-yellow-400 text-xs font-bold">{listing.price.toLocaleString()} 🪙</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        const { cancelListing } = useGameStore.getState()
                        await cancelListing(listing.id)
                      }}
                      className="text-red-400 text-xs h-6 hover:bg-red-500/10"
                    >
                      إلغاء
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* My players to sell */}
          <div>
            <h4 className="text-white/60 text-xs font-bold mb-2">👥 لاعبوك - اختر لاعباً للبيع</h4>
            <ScrollArea className="max-h-[55vh]">
              <div className="space-y-2">
                {players.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => {
                      setSellPlayerData(player)
                      setSellPrice(Math.round(player.value * 0.8))
                      setShowSellDialog(true)
                    }}
                    className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/8 rounded-xl p-3 border border-white/5 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-b ${getOverallColor(player.overall)} flex items-center justify-center text-xs font-bold text-white shadow-lg shrink-0`}>
                      {player.overall}
                    </div>
                    <div className="flex-1 min-w-0 text-right">
                      <h5 className="text-white font-bold text-sm truncate">{player.name}</h5>
                      <span className="text-white/30 text-[10px]">{POSITION_LABELS[player.position] || player.position}</span>
                    </div>
                    <div className="text-left">
                      <div className="text-white/30 text-[10px]">القيمة</div>
                      <div className="text-yellow-400 text-xs font-bold">{(player.value / 1000).toFixed(0)}K</div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </>
      )}

      {/* Sell Dialog */}
      <Dialog open={showSellDialog} onOpenChange={setShowSellDialog}>
        <DialogContent className="bg-[#0d1f35] border-white/10 text-white max-w-[340px] p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold">بيع اللاعب</h3>
            <button onClick={() => setShowSellDialog(false)} className="text-white/40 hover:text-white/60">
              <X className="w-5 h-5" />
            </button>
          </div>

          {sellPlayerData && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-b ${getOverallColor(sellPlayerData.overall)} flex items-center justify-center text-sm font-bold text-white shadow-lg`}>
                  {sellPlayerData.overall}
                </div>
                <div>
                  <h4 className="text-white font-bold">{sellPlayerData.name}</h4>
                  <span className="text-white/40 text-xs">{POSITION_LABELS[sellPlayerData.position]}</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-white/50">سعر البيع</span>
                  <span className="text-yellow-400 font-bold">{sellPrice.toLocaleString()} 🪙</span>
                </div>
                <Slider
                  value={[sellPrice]}
                  onValueChange={([v]) => setSellPrice(v)}
                  max={sellPlayerData.value * 2}
                  min={Math.round(sellPlayerData.value * 0.3)}
                  step={1000}
                />
                <div className="flex justify-between text-[10px] text-white/30 mt-1">
                  <span>30% من القيمة</span>
                  <span>200% من القيمة</span>
                </div>
              </div>

              <p className="text-white/40 text-xs">
                💡 سيتم خصم 10% عمولة عند بيع اللاعب
              </p>

              <Button
                onClick={handleSell}
                className="w-full h-11 bg-gradient-to-l from-yellow-500 to-yellow-600 text-white font-bold rounded-xl"
              >
                تأكيد البيع 🏷️
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
