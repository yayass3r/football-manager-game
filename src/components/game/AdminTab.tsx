'use client'

import { useEffect, useState } from 'react'
import { useGameStore } from '@/lib/game-store'
import { motion, AnimatePresence } from 'framer-motion'

const ADMIN_TABS = [
  { id: 'dashboard', icon: '📊', label: 'لوحة المعلومات' },
  { id: 'users', icon: '👥', label: 'المستخدمين' },
  { id: 'clubs', icon: '🏟️', label: 'الأندية' },
  { id: 'players', icon: '⚽', label: 'اللاعبين' },
  { id: 'tournaments', icon: '🏆', label: 'البطولات' },
  { id: 'packs', icon: '🎰', label: 'الحزم' },
  { id: 'events', icon: '📰', label: 'الأحداث' },
  { id: 'achievements', icon: '🏅', label: 'الإنجازات' },
  { id: 'economy', icon: '💰', label: 'الاقتصاد' },
  { id: 'announcements', icon: '📢', label: 'الإعلانات' },
]

export default function AdminTab() {
  const {
    user, adminTab, setAdminTab,
    adminDashboard, fetchAdminDashboard,
    adminUsers, fetchAdminUsers, updateAdminUser, deleteAdminUser,
    adminClubs, fetchAdminClubs, updateAdminClub, deleteAdminClub,
    adminPlayers, fetchAdminPlayers, createAdminPlayer, updateAdminPlayer, deleteAdminPlayer,
    adminTournaments, fetchAdminTournaments, createAdminTournament, updateAdminTournament, deleteAdminTournament,
    adminPacks, fetchAdminPacks, createAdminPack, updateAdminPack, deleteAdminPack,
    adminEvents, fetchAdminEvents, createAdminEvent, updateAdminEvent, deleteAdminEvent,
    adminAchievements, fetchAdminAchievements, createAdminAchievement, updateAdminAchievement, deleteAdminAchievement,
    sendAnnouncement, adminEconomyAction,
  } = useGameStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [editingItem, setEditingItem] = useState<any>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState<any>({})

  // Economy form state (moved from renderEconomy to fix hooks violation)
  const [econAction, setEconAction] = useState('addAllCoins')
  const [econAmount, setEconAmount] = useState(1000)
  const [econUserId, setEconUserId] = useState('')

  // Announcement form state (moved from renderAnnouncements to fix hooks violation)
  const [annTitle, setAnnTitle] = useState('')
  const [annMessage, setAnnMessage] = useState('')
  const [annType, setAnnType] = useState('announcement')

  // Pagination state
  const { adminPagination } = useGameStore()

  useEffect(() => {
    if (user?.isAdmin) {
      fetchAdminDashboard()
    }
  }, [user])

  useEffect(() => {
    if (!user?.isAdmin) return
    switch (adminTab) {
      case 'users': fetchAdminUsers(1, searchTerm); break
      case 'clubs': fetchAdminClubs(1, searchTerm); break
      case 'players': fetchAdminPlayers(1, searchTerm); break
      case 'tournaments': fetchAdminTournaments(); break
      case 'packs': fetchAdminPacks(); break
      case 'events': fetchAdminEvents(); break
      case 'achievements': fetchAdminAchievements(); break
    }
  }, [adminTab])

  if (!user?.isAdmin) {
    return (
      <div className="text-center py-20">
        <span className="text-6xl block mb-4">🔒</span>
        <h2 className="text-white text-xl font-bold mb-2">غير مصرح</h2>
        <p className="text-white/50 text-sm">هذه الصفحة متاحة للمسؤولين فقط</p>
      </div>
    )
  }

  const handleSearch = () => {
    switch (adminTab) {
      case 'users': fetchAdminUsers(1, searchTerm); break
      case 'clubs': fetchAdminClubs(1, searchTerm); break
      case 'players': fetchAdminPlayers(1, searchTerm); break
    }
  }

  // ==================== DASHBOARD ====================
  const renderDashboard = () => {
    if (!adminDashboard) return <div className="text-white/50 text-center py-10">جاري التحميل...</div>
    const { stats, economy, recentUsers, topClubs, currentSeason } = adminDashboard

    return (
      <div className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'المستخدمين', value: stats.totalUsers, icon: '👥', color: 'from-blue-500/20 to-blue-600/10' },
            { label: 'الأندية', value: stats.totalClubs, icon: '🏟️', color: 'from-emerald-500/20 to-emerald-600/10' },
            { label: 'اللاعبين', value: stats.totalPlayers, icon: '⚽', color: 'from-yellow-500/20 to-yellow-600/10' },
            { label: 'المباريات', value: stats.totalMatches, icon: '🏟️', color: 'from-purple-500/20 to-purple-600/10' },
            { label: 'البطولات', value: stats.totalTournaments, icon: '🏆', color: 'from-amber-500/20 to-amber-600/10' },
            { label: 'مباريات اليوم', value: stats.matchesToday, icon: '📅', color: 'from-cyan-500/20 to-cyan-600/10' },
            { label: 'مستخدمون جدد اليوم', value: stats.newUsersToday, icon: '🆕', color: 'from-pink-500/20 to-pink-600/10' },
            { label: 'مستخدمون محظورون', value: stats.bannedUsers, icon: '🚫', color: 'from-red-500/20 to-red-600/10' },
            { label: 'أحداث نشطة', value: stats.activeEvents, icon: '📰', color: 'from-teal-500/20 to-teal-600/10' },
            { label: 'صفقات نشطة', value: stats.activeTransferListings, icon: '🏪', color: 'from-orange-500/20 to-orange-600/10' },
            { label: 'المسؤولون', value: stats.adminUsers, icon: '👑', color: 'from-yellow-500/20 to-amber-600/10' },
            { label: 'فتح الحزم', value: stats.totalPackOpenings, icon: '🎰', color: 'from-violet-500/20 to-violet-600/10' },
          ].map((stat) => (
            <div key={stat.label} className={`bg-gradient-to-br ${stat.color} rounded-xl p-3 border border-white/5`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{stat.icon}</span>
                <span className="text-white/60 text-[10px]">{stat.label}</span>
              </div>
              <p className="text-white font-bold text-lg">{stat.value.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Economy */}
        <div className="bg-gradient-to-br from-yellow-500/10 to-amber-500/5 rounded-xl p-4 border border-yellow-500/10">
          <h3 className="text-yellow-400 font-bold text-sm mb-3">💰 الاقتصاد</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-white/40 text-[10px]">إجمالي العملات</p>
              <p className="text-yellow-400 font-bold">🪙 {economy.totalCoins.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-white/40 text-[10px]">إجمالي الجواهر</p>
              <p className="text-purple-400 font-bold">💎 {economy.totalGems.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-white/40 text-[10px]">متوسط العملات/مستخدم</p>
              <p className="text-white font-bold text-sm">{economy.avgCoins.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-white/40 text-[10px]">متوسط الجواهر/مستخدم</p>
              <p className="text-white font-bold text-sm">{economy.avgGems}</p>
            </div>
          </div>
        </div>

        {/* Current Season */}
        {currentSeason && (
          <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/5 rounded-xl p-4 border border-emerald-500/10">
            <h3 className="text-emerald-400 font-bold text-sm mb-2">🌟 الموسم الحالي</h3>
            <p className="text-white font-bold">{currentSeason.name} (موسم {currentSeason.number})</p>
            <p className="text-white/50 text-xs">الحالة: {currentSeason.status === 'active' ? 'نشط' : 'منتهي'}</p>
          </div>
        )}

        {/* Recent Users */}
        <div className="bg-[#132740] rounded-xl p-4 border border-white/5">
          <h3 className="text-white font-bold text-sm mb-3">🕐 أحدث المستخدمين</h3>
          <div className="space-y-2">
            {recentUsers.map((u: any) => (
              <div key={u.id} className="flex items-center justify-between bg-white/5 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{u.avatar}</span>
                  <div>
                    <p className="text-white text-xs font-bold">{u.username}</p>
                    <p className="text-white/40 text-[10px]">
                      {u.club?.name || 'بدون نادي'} {u.isBanned ? '🚫' : ''} {u.isAdmin ? '👑' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-yellow-400 text-[10px]">🪙 {u.coins.toLocaleString()}</p>
                  <p className="text-purple-400 text-[10px]">💎 {u.gems}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Clubs */}
        <div className="bg-[#132740] rounded-xl p-4 border border-white/5">
          <h3 className="text-white font-bold text-sm mb-3">🏆 أفضل الأندية</h3>
          <div className="space-y-2">
            {topClubs.map((c: any, i: number) => (
              <div key={c.id} className="flex items-center justify-between bg-white/5 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <span className="text-white/30 text-xs font-bold w-4">{i + 1}</span>
                  <span className="text-lg">{c.logo}</span>
                  <div>
                    <p className="text-white text-xs font-bold">{c.name}</p>
                    <p className="text-white/40 text-[10px]">سمعة: {c.reputation}</p>
                  </div>
                </div>
                <div className="text-left">
                  <span className="text-emerald-400 text-[10px]">ف{c.wins}</span>
                  <span className="text-white/30 text-[10px] mx-1">ت{c.draws}</span>
                  <span className="text-red-400 text-[10px]">خ{c.losses}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ==================== USERS ====================
  const renderUsers = () => (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="بحث عن مستخدم..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs placeholder-white/30 focus:border-emerald-400 focus:outline-none"
        />
        <button onClick={handleSearch} className="bg-emerald-500/20 text-emerald-400 px-3 py-2 rounded-lg text-xs">بحث</button>
      </div>

      <div className="flex gap-1 text-[10px]">
        {['all', 'banned', 'admin'].map(f => (
          <button
            key={f}
            onClick={() => fetchAdminUsers(1, searchTerm, f)}
            className="bg-white/5 text-white/50 px-2 py-1 rounded hover:bg-white/10"
          >
            {f === 'all' ? 'الكل' : f === 'banned' ? 'محظورون' : 'مسؤولون'}
          </button>
        ))}
      </div>

      {adminUsers.map((u: any) => (
        <div key={u.id} className="bg-[#132740] rounded-xl p-3 border border-white/5">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{u.avatar}</span>
              <div>
                <p className="text-white text-sm font-bold">
                  {u.username}
                  {u.isAdmin && <span className="text-yellow-400 text-[10px] mr-1">👑 مسؤول</span>}
                  {u.isBanned && <span className="text-red-400 text-[10px] mr-1">🚫 محظور</span>}
                </p>
                <p className="text-white/40 text-[10px]">المستوى {u.level} • XP {u.xp}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1 mb-2 text-[10px]">
            <div className="bg-yellow-500/10 rounded p-1 text-center">
              <p className="text-yellow-400 font-bold">{u.coins.toLocaleString()}</p>
              <p className="text-white/30">عملات</p>
            </div>
            <div className="bg-purple-500/10 rounded p-1 text-center">
              <p className="text-purple-400 font-bold">{u.gems}</p>
              <p className="text-white/30">جواهر</p>
            </div>
            <div className="bg-emerald-500/10 rounded p-1 text-center">
              <p className="text-emerald-400 font-bold">{u.totalWins}</p>
              <p className="text-white/30">انتصارات</p>
            </div>
            <div className="bg-amber-500/10 rounded p-1 text-center">
              <p className="text-amber-400 font-bold">{u.totalTrophies}</p>
              <p className="text-white/30">كؤوس</p>
            </div>
          </div>

          {u.club && (
            <div className="bg-white/5 rounded-lg p-2 mb-2 text-[10px]">
              <span className="text-white/60">النادي: </span>
              <span className="text-white font-bold">{u.club.name}</span>
            </div>
          )}

          {u.isBanned && u.banReason && (
            <div className="bg-red-500/10 rounded-lg p-2 mb-2 text-[10px]">
              <span className="text-red-400">سبب الحظر: </span>
              <span className="text-white/70">{u.banReason}</span>
            </div>
          )}

          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => {
                setEditingItem(u)
                setFormData({ coins: u.coins, gems: u.gems, level: u.level, xp: u.xp })
              }}
              className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-[10px] hover:bg-blue-500/30"
            >
              ✏️ تعديل
            </button>
            <button
              onClick={() => updateAdminUser(u.id, { isBanned: !u.isBanned, banReason: u.isBanned ? '' : 'مخالفة القوانين' })}
              className={`px-2 py-1 rounded text-[10px] ${u.isBanned ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}
            >
              {u.isBanned ? '✅ فك الحظر' : '🚫 حظر'}
            </button>
            <button
              onClick={() => updateAdminUser(u.id, { isAdmin: !u.isAdmin })}
              className={`px-2 py-1 rounded text-[10px] ${u.isAdmin ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}
            >
              {u.isAdmin ? '⬇️ إزالة مسؤول' : '⬆️ تعيين مسؤول'}
            </button>
            <button
              onClick={() => adminEconomyAction('addCoins', u.id, 1000)}
              className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-[10px] hover:bg-yellow-500/30"
            >
              +1000 🪙
            </button>
            <button
              onClick={() => adminEconomyAction('addGems', u.id, 50)}
              className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-[10px] hover:bg-purple-500/30"
            >
              +50 💎
            </button>
            <button
              onClick={() => {
                if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) deleteAdminUser(u.id)
              }}
              className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-[10px] hover:bg-red-500/30"
            >
              🗑️ حذف
            </button>
          </div>
        </div>
      ))}

      {adminUsers.length === 0 && (
        <p className="text-white/30 text-center text-sm py-10">لا يوجد مستخدمون</p>
      )}

      {/* Pagination */}
      {adminPagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-3">
          <button
            onClick={() => fetchAdminUsers(Math.max(1, adminPagination.page - 1), searchTerm)}
            disabled={adminPagination.page <= 1}
            className="bg-white/5 text-white/50 px-3 py-1.5 rounded-lg text-xs disabled:opacity-30 hover:bg-white/10"
          >
            السابق
          </button>
          <span className="text-white/40 text-xs">
            {adminPagination.page} / {adminPagination.pages}
          </span>
          <button
            onClick={() => fetchAdminUsers(Math.min(adminPagination.pages, adminPagination.page + 1), searchTerm)}
            disabled={adminPagination.page >= adminPagination.pages}
            className="bg-white/5 text-white/50 px-3 py-1.5 rounded-lg text-xs disabled:opacity-30 hover:bg-white/10"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  )

  // ==================== CLUBS ====================
  const renderClubs = () => (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="بحث عن نادي..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs placeholder-white/30 focus:border-emerald-400 focus:outline-none"
        />
        <button onClick={handleSearch} className="bg-emerald-500/20 text-emerald-400 px-3 py-2 rounded-lg text-xs">بحث</button>
      </div>

      {adminClubs.map((c: any) => (
        <div key={c.id} className="bg-[#132740] rounded-xl p-3 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: c.primaryColor }}>
                <span className="text-sm">{c.logo}</span>
              </div>
              <div>
                <p className="text-white text-sm font-bold">{c.name}</p>
                <p className="text-white/40 text-[10px]">التشكيلة: {c.formation} • اللاعبين: {c.playerCount}</p>
              </div>
            </div>
            <div className="text-left text-[10px]">
              <span className="text-emerald-400">ف{c.wins}</span>
              <span className="text-white/30 mx-1">ت{c.draws}</span>
              <span className="text-red-400">خ{c.losses}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1 mb-2 text-[10px]">
            <div className="bg-white/5 rounded p-1 text-center">
              <p className="text-white font-bold">{c.reputation}</p>
              <p className="text-white/30">سمعة</p>
            </div>
            <div className="bg-white/5 rounded p-1 text-center">
              <p className="text-white font-bold">{c.morale}</p>
              <p className="text-white/30">معنويات</p>
            </div>
            <div className="bg-white/5 rounded p-1 text-center">
              <p className="text-white font-bold">{c.stadiumLevel}</p>
              <p className="text-white/30">ملعب</p>
            </div>
          </div>

          {c.owner && (
            <div className="bg-white/5 rounded-lg p-2 mb-2 text-[10px]">
              <span className="text-white/60">المالك: </span>
              <span className="text-white">{c.owner.username}</span>
              {c.owner.isBanned && <span className="text-red-400 mr-1">🚫</span>}
            </div>
          )}

          <div className="flex gap-1">
            <button
              onClick={() => {
                setEditingItem(c)
                setFormData({ name: c.name, morale: c.morale, reputation: c.reputation, stadiumLevel: c.stadiumLevel, wins: c.wins, draws: c.draws, losses: c.losses })
              }}
              className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-[10px]"
            >
              ✏️ تعديل
            </button>
            <button
              onClick={() => { if (confirm('حذف النادي؟')) deleteAdminClub(c.id) }}
              className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-[10px]"
            >
              🗑️ حذف
            </button>
          </div>
        </div>
      ))}
    </div>
  )

  // ==================== PLAYERS ====================
  const renderPlayers = () => (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="بحث عن لاعب..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs placeholder-white/30 focus:border-emerald-400 focus:outline-none"
        />
        <button onClick={() => { setShowCreateForm(true); setFormData({ name: '', position: 'ST', nationality: 'عالمي', age: 22, overall: 70, pace: 70, shooting: 70, passing: 70, dribbling: 70, defending: 70, physical: 70 }) }} className="bg-emerald-500/20 text-emerald-400 px-3 py-2 rounded-lg text-xs">+ لاعب</button>
      </div>

      {adminPlayers.map((p: any) => (
        <div key={p.id} className="bg-[#132740] rounded-xl p-3 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${p.overall >= 85 ? 'text-yellow-400' : p.overall >= 75 ? 'text-emerald-400' : 'text-white/70'}`}>
                  {p.overall}
                </span>
                <div>
                  <p className="text-white text-sm font-bold">{p.name}</p>
                  <p className="text-white/40 text-[10px]">{p.position} • {p.nationality} • {p.age} سنة</p>
                </div>
              </div>
            </div>
            {p.club && (
              <div className="text-left text-[10px]">
                <p className="text-white/50">{p.club.name}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-6 gap-1 mb-2 text-[10px]">
            {[
              { label: 'سرعة', value: p.pace },
              { label: 'تسديد', value: p.shooting },
              { label: 'تمرير', value: p.passing },
              { label: 'مراوغة', value: p.dribbling },
              { label: 'دفاع', value: p.defending },
              { label: 'بدني', value: p.physical },
            ].map(s => (
              <div key={s.label} className="bg-white/5 rounded p-1 text-center">
                <p className={`font-bold ${s.value >= 85 ? 'text-yellow-400' : s.value >= 75 ? 'text-emerald-400' : 'text-white/60'}`}>{s.value}</p>
                <p className="text-white/30 text-[8px]">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-[10px]">
              <span className="text-yellow-400/60">🪙 {(p.value || 0).toLocaleString()}</span>
              <span className="text-white/20 mx-1">|</span>
              <span className="text-white/40">💰 {(p.salary || 0).toLocaleString()}</span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => {
                  setEditingItem(p)
                  setFormData({ name: p.name, position: p.position, overall: p.overall, pace: p.pace, shooting: p.shooting, passing: p.passing, dribbling: p.dribbling, defending: p.defending, physical: p.physical, value: p.value, salary: p.salary })
                }}
                className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-[10px]"
              >
                ✏️
              </button>
              <button
                onClick={() => { if (confirm('حذف اللاعب؟')) deleteAdminPlayer(p.id) }}
                className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-[10px]"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  // ==================== TOURNAMENTS ====================
  const renderTournaments = () => (
    <div className="space-y-3">
      <button
        onClick={() => {
          setShowCreateForm(true)
          setFormData({ name: '', type: 'league', tier: 1, maxTeams: 16, prize: 5000, prizeGems: 10, season: 1, status: 'registration' })
        }}
        className="w-full bg-emerald-500/20 text-emerald-400 py-2 rounded-lg text-xs font-bold"
      >
        + إنشاء بطولة جديدة
      </button>

      {adminTournaments.map((t: any) => (
        <div key={t.id} className="bg-[#132740] rounded-xl p-3 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-white text-sm font-bold">{t.name}</p>
              <p className="text-white/40 text-[10px]">
                {t.type === 'league' ? 'دوري' : t.type === 'cup' ? 'كأس' : t.type === 'champions' ? 'أبطال' : 'سوبر'}
                {' • '}المستوى {t.tier} • {t.maxTeams} فريق
              </p>
            </div>
            <span className={`text-[10px] px-2 py-1 rounded-full ${
              t.status === 'registration' ? 'bg-blue-500/20 text-blue-400' :
              t.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {t.status === 'registration' ? 'تسجيل' : t.status === 'active' ? 'نشط' : 'مكتمل'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1 mb-2 text-[10px]">
            <div className="bg-yellow-500/10 rounded p-1 text-center">
              <p className="text-yellow-400 font-bold">🪙 {t.prize.toLocaleString()}</p>
              <p className="text-white/30">جائزة</p>
            </div>
            <div className="bg-purple-500/10 rounded p-1 text-center">
              <p className="text-purple-400 font-bold">💎 {t.prizeGems}</p>
              <p className="text-white/30">جواهر</p>
            </div>
            <div className="bg-white/5 rounded p-1 text-center">
              <p className="text-white font-bold">{t.participantCount}/{t.maxTeams}</p>
              <p className="text-white/30">فرق</p>
            </div>
          </div>

          <div className="flex gap-1">
            <button onClick={() => { setEditingItem(t); setFormData({ name: t.name, type: t.type, tier: t.tier, maxTeams: t.maxTeams, prize: t.prize, prizeGems: t.prizeGems, status: t.status }) }} className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-[10px]">✏️</button>
            {t.status === 'registration' && (
              <button onClick={() => updateAdminTournament(t.id, { status: 'active' })} className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-[10px]">▶️ بدء</button>
            )}
            {t.status === 'active' && (
              <button onClick={() => updateAdminTournament(t.id, { status: 'completed' })} className="bg-amber-500/20 text-amber-400 px-2 py-1 rounded text-[10px]">🏁 إنهاء</button>
            )}
            <button onClick={() => { if (confirm('حذف البطولة؟')) deleteAdminTournament(t.id) }} className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-[10px]">🗑️</button>
          </div>
        </div>
      ))}
    </div>
  )

  // ==================== PACKS ====================
  const renderPacks = () => (
    <div className="space-y-3">
      <button
        onClick={() => {
          setShowCreateForm(true)
          setFormData({ name: '', type: 'bronze', price: 1000, gemPrice: 0, description: '', minOverall: 55, maxOverall: 70, playerCount: 1, isActive: true })
        }}
        className="w-full bg-emerald-500/20 text-emerald-400 py-2 rounded-lg text-xs font-bold"
      >
        + إنشاء حزمة جديدة
      </button>

      {adminPacks.map((p: any) => (
        <div key={p.id} className="bg-[#132740] rounded-xl p-3 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-white text-sm font-bold">{p.name}</p>
              <p className="text-white/40 text-[10px]">
                {p.type === 'bronze' ? 'برونزية' : p.type === 'silver' ? 'فضية' : p.type === 'gold' ? 'ذهبية' : 'أسطورية'}
                {' • '}{p.playerCount} لاعب • OVR {p.minOverall}-{p.maxOverall}
              </p>
            </div>
            <span className={`text-[10px] px-2 py-1 rounded-full ${p.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
              {p.isActive ? 'نشط' : 'معطل'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1 mb-2 text-[10px]">
            <div className="bg-yellow-500/10 rounded p-1 text-center">
              <p className="text-yellow-400 font-bold">🪙 {p.price.toLocaleString()}</p>
              <p className="text-white/30">عملات</p>
            </div>
            <div className="bg-purple-500/10 rounded p-1 text-center">
              <p className="text-purple-400 font-bold">💎 {p.gemPrice}</p>
              <p className="text-white/30">جواهر</p>
            </div>
            <div className="bg-white/5 rounded p-1 text-center">
              <p className="text-white font-bold">{p.openingCount || 0}</p>
              <p className="text-white/30">فتح</p>
            </div>
          </div>

          <div className="flex gap-1">
            <button onClick={() => { setEditingItem(p); setFormData({ name: p.name, type: p.type, price: p.price, gemPrice: p.gemPrice, description: p.description, minOverall: p.minOverall, maxOverall: p.maxOverall, playerCount: p.playerCount, isActive: p.isActive }) }} className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-[10px]">✏️</button>
            <button onClick={() => updateAdminPack(p.id, { isActive: !p.isActive })} className={`px-2 py-1 rounded text-[10px] ${p.isActive ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{p.isActive ? '⏸️ تعطيل' : '▶️ تفعيل'}</button>
            <button onClick={() => { if (confirm('حذف الحزمة؟')) deleteAdminPack(p.id) }} className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-[10px]">🗑️</button>
          </div>
        </div>
      ))}
    </div>
  )

  // ==================== EVENTS ====================
  const renderEvents = () => (
    <div className="space-y-3">
      <button
        onClick={() => {
          setShowCreateForm(true)
          setFormData({ title: '', description: '', type: 'special_tournament', startDate: new Date().toISOString().slice(0, 16), endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), isActive: true })
        }}
        className="w-full bg-emerald-500/20 text-emerald-400 py-2 rounded-lg text-xs font-bold"
      >
        + إنشاء حدث جديد
      </button>

      {adminEvents.map((e: any) => (
        <div key={e.id} className="bg-[#132740] rounded-xl p-3 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-white text-sm font-bold">{e.title}</p>
              <p className="text-white/40 text-[10px]">
                {e.type === 'transfer_window' ? 'نافذة انتقالات' : e.type === 'double_rewards' ? 'مكافآت مضاعفة' : e.type === 'special_tournament' ? 'بطولة خاصة' : e.type === 'announcement' ? 'إعلان' : 'حدث خاص'}
              </p>
            </div>
            <span className={`text-[10px] px-2 py-1 rounded-full ${e.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
              {e.isActive ? 'نشط' : 'منتهي'}
            </span>
          </div>

          <p className="text-white/50 text-[10px] mb-2">{e.description}</p>

          <div className="text-[10px] text-white/30 mb-2">
            من {new Date(e.startDate).toLocaleDateString('ar')} إلى {new Date(e.endDate).toLocaleDateString('ar')}
          </div>

          <div className="flex gap-1">
            <button onClick={() => { setEditingItem(e); setFormData({ title: e.title, description: e.description, type: e.type, startDate: new Date(e.startDate).toISOString().slice(0, 16), endDate: new Date(e.endDate).toISOString().slice(0, 16), isActive: e.isActive }) }} className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-[10px]">✏️</button>
            <button onClick={() => updateAdminEvent(e.id, { isActive: !e.isActive })} className={`px-2 py-1 rounded text-[10px] ${e.isActive ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{e.isActive ? '⏸️ إنهاء' : '▶️ تفعيل'}</button>
            <button onClick={() => { if (confirm('حذف الحدث؟')) deleteAdminEvent(e.id) }} className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-[10px]">🗑️</button>
          </div>
        </div>
      ))}
    </div>
  )

  // ==================== ACHIEVEMENTS ====================
  const renderAchievements = () => (
    <div className="space-y-3">
      <button
        onClick={() => {
          setShowCreateForm(true)
          setFormData({ achievementId: '', name: '', description: '', icon: '🏅', category: 'special', requirement: 1, rewardCoins: 500, rewardGems: 5, rewardTitle: '' })
        }}
        className="w-full bg-emerald-500/20 text-emerald-400 py-2 rounded-lg text-xs font-bold"
      >
        + إنشاء إنجاز جديد
      </button>

      {adminAchievements.map((a: any) => (
        <div key={a.id} className="bg-[#132740] rounded-xl p-3 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{a.icon}</span>
              <div>
                <p className="text-white text-sm font-bold">{a.name}</p>
                <p className="text-white/40 text-[10px]">
                  {a.category === 'matches' ? 'مباريات' : a.category === 'tournaments' ? 'بطولات' : a.category === 'transfers' ? 'انتقالات' : a.category === 'training' ? 'تدريب' : 'خاص'}
                  {' • '}المتطلب: {a.requirement}
                </p>
              </div>
            </div>
            <span className="text-[10px] text-white/30">{a.unlockedCount} فتح</span>
          </div>

          <p className="text-white/50 text-[10px] mb-2">{a.description}</p>

          <div className="grid grid-cols-3 gap-1 mb-2 text-[10px]">
            <div className="bg-yellow-500/10 rounded p-1 text-center">
              <p className="text-yellow-400 font-bold">{a.rewardCoins}</p>
              <p className="text-white/30">عملات</p>
            </div>
            <div className="bg-purple-500/10 rounded p-1 text-center">
              <p className="text-purple-400 font-bold">{a.rewardGems}</p>
              <p className="text-white/30">جواهر</p>
            </div>
            <div className="bg-white/5 rounded p-1 text-center">
              <p className="text-white font-bold text-[8px]">{a.rewardTitle || '-'}</p>
              <p className="text-white/30">لقب</p>
            </div>
          </div>

          <div className="flex gap-1">
            <button onClick={() => { setEditingItem(a); setFormData({ achievementId: a.achievementId, name: a.name, description: a.description, icon: a.icon, category: a.category, requirement: a.requirement, rewardCoins: a.rewardCoins, rewardGems: a.rewardGems, rewardTitle: a.rewardTitle || '' }) }} className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-[10px]">✏️</button>
            <button onClick={() => { if (confirm('حذف الإنجاز؟')) deleteAdminAchievement(a.id) }} className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-[10px]">🗑️</button>
          </div>
        </div>
      ))}
    </div>
  )

  // ==================== ECONOMY ====================
  const renderEconomy = () => (
    <div className="space-y-4">
        <div className="bg-gradient-to-br from-yellow-500/10 to-amber-500/5 rounded-xl p-4 border border-yellow-500/10">
          <h3 className="text-yellow-400 font-bold text-sm mb-3">💰 إدارة الاقتصاد</h3>

          <div className="space-y-3">
            <div>
              <label className="text-white/60 text-[10px] block mb-1">الإجراء</label>
              <select
                value={econAction}
                onChange={(e) => setEconAction(e.target.value)}
                className="w-full bg-[#1a2a40] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-emerald-400 focus:outline-none"
              >
                <option value="addAllCoins">إضافة عملات لجميع المستخدمين</option>
                <option value="addAllGems">إضافة جواهر لجميع المستخدمين</option>
                <option value="addCoins">إضافة عملات لمستخدم محدد</option>
                <option value="removeCoins">خصم عملات من مستخدم</option>
                <option value="addGems">إضافة جواهر لمستخدم محدد</option>
                <option value="removeGems">خصم جواهر من مستخدم</option>
              </select>
            </div>

            {!econAction.includes('All') && (
              <div>
                <label className="text-white/60 text-[10px] block mb-1">معرف المستخدم</label>
                <input
                  type="text"
                  value={econUserId}
                  onChange={(e) => setEconUserId(e.target.value)}
                  placeholder="أدخل معرف المستخدم"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs placeholder-white/30 focus:border-emerald-400 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="text-white/60 text-[10px] block mb-1">الكمية</label>
              <input
                type="number"
                value={econAmount}
                onChange={(e) => setEconAmount(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <button
              onClick={() => {
                if (!econAction.includes('All') && !econUserId.trim()) {
                  return
                }
                adminEconomyAction(econAction, econUserId || 'all', econAmount)
              }}
              className="w-full bg-yellow-500/20 text-yellow-400 py-2 rounded-lg text-xs font-bold hover:bg-yellow-500/30"
            >
              تنفيذ الإجراء
            </button>
          </div>
        </div>

        {adminDashboard && (
          <div className="bg-[#132740] rounded-xl p-4 border border-white/5">
            <h3 className="text-white font-bold text-sm mb-3">📊 ملخص الاقتصاد</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-yellow-500/10 rounded-lg p-3 text-center">
                <p className="text-yellow-400 text-xl font-bold">{adminDashboard.economy?.totalCoins?.toLocaleString() || 0}</p>
                <p className="text-white/40 text-[10px]">إجمالي العملات</p>
              </div>
              <div className="bg-purple-500/10 rounded-lg p-3 text-center">
                <p className="text-purple-400 text-xl font-bold">{adminDashboard.economy?.totalGems?.toLocaleString() || 0}</p>
                <p className="text-white/40 text-[10px]">إجمالي الجواهر</p>
              </div>
            </div>
          </div>
        )}
      </div>
  )

  // ==================== ANNOUNCEMENTS ====================
  const renderAnnouncements = () => (
    <div className="space-y-4">
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 rounded-xl p-4 border border-blue-500/10">
          <h3 className="text-blue-400 font-bold text-sm mb-3">📢 إرسال إعلان</h3>

          <div className="space-y-3">
            <div>
              <label className="text-white/60 text-[10px] block mb-1">نوع الإعلان</label>
              <select
                value={annType}
                onChange={(e) => setAnnType(e.target.value)}
                className="w-full bg-[#1a2a40] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-emerald-400 focus:outline-none"
              >
                <option value="announcement">إعلان عام</option>
                <option value="transfer_window">نافذة انتقالات</option>
                <option value="double_rewards">مكافآت مضاعفة</option>
                <option value="special_tournament">بطولة خاصة</option>
              </select>
            </div>

            <div>
              <label className="text-white/60 text-[10px] block mb-1">العنوان</label>
              <input
                type="text"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                placeholder="عنوان الإعلان"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs placeholder-white/30 focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-white/60 text-[10px] block mb-1">الرسالة</label>
              <textarea
                value={annMessage}
                onChange={(e) => setAnnMessage(e.target.value)}
                placeholder="نص الإعلان..."
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs placeholder-white/30 focus:border-emerald-400 focus:outline-none resize-none"
              />
            </div>

            <button
              onClick={() => {
                if (annTitle && annMessage) {
                  sendAnnouncement(annTitle, annMessage, annType)
                  setAnnTitle('')
                  setAnnMessage('')
                }
              }}
              disabled={!annTitle || !annMessage}
              className="w-full bg-blue-500/20 text-blue-400 py-2 rounded-lg text-xs font-bold hover:bg-blue-500/30 disabled:opacity-30"
            >
              📢 إرسال الإعلان لجميع المستخدمين
            </button>
          </div>
        </div>
      </div>
  )

  // ==================== EDIT MODAL ====================
  const renderEditModal = () => {
    if (!editingItem) return null

    const getFields = () => {
      if (editingItem.username) { // User
        return [
          { key: 'coins', label: 'العملات', type: 'number' },
          { key: 'gems', label: 'الجواهر', type: 'number' },
          { key: 'level', label: 'المستوى', type: 'number' },
          { key: 'xp', label: 'XP', type: 'number' },
          { key: 'totalWins', label: 'الانتصارات', type: 'number' },
          { key: 'totalTrophies', label: 'الكؤوس', type: 'number' },
        ]
      }
      if (editingItem.formation) { // Club
        return [
          { key: 'name', label: 'الاسم', type: 'text' },
          { key: 'morale', label: 'المعنويات', type: 'number' },
          { key: 'reputation', label: 'السمعة', type: 'number' },
          { key: 'stadiumLevel', label: 'مستوى الملعب', type: 'number' },
          { key: 'wins', label: 'الانتصارات', type: 'number' },
          { key: 'draws', label: 'التعادلات', type: 'number' },
          { key: 'losses', label: 'الخسائر', type: 'number' },
        ]
      }
      if (editingItem.position) { // Player
        return [
          { key: 'name', label: 'الاسم', type: 'text' },
          { key: 'position', label: 'المركز', type: 'text' },
          { key: 'overall', label: 'التقييم', type: 'number' },
          { key: 'pace', label: 'السرعة', type: 'number' },
          { key: 'shooting', label: 'التسديد', type: 'number' },
          { key: 'passing', label: 'التمرير', type: 'number' },
          { key: 'dribbling', label: 'المراوغة', type: 'number' },
          { key: 'defending', label: 'الدفاع', type: 'number' },
          { key: 'physical', label: 'البدني', type: 'number' },
          { key: 'value', label: 'القيمة', type: 'number' },
          { key: 'salary', label: 'الراتب', type: 'number' },
        ]
      }
      if (editingItem.participantCount !== undefined) { // Tournament
        return [
          { key: 'name', label: 'الاسم', type: 'text' },
          { key: 'type', label: 'النوع', type: 'select', options: [{ value: 'league', label: 'دوري' }, { value: 'cup', label: 'كأس' }, { value: 'champions', label: 'أبطال' }, { value: 'super', label: 'سوبر' }] },
          { key: 'tier', label: 'المستوى', type: 'number' },
          { key: 'maxTeams', label: 'الحد الأقصى للفرق', type: 'number' },
          { key: 'prize', label: 'الجائزة (عملات)', type: 'number' },
          { key: 'prizeGems', label: 'الجائزة (جواهر)', type: 'number' },
          { key: 'status', label: 'الحالة', type: 'select', options: [{ value: 'registration', label: 'تسجيل' }, { value: 'active', label: 'نشط' }, { value: 'completed', label: 'مكتمل' }] },
        ]
      }
      if (editingItem.openingCount !== undefined) { // Pack
        return [
          { key: 'name', label: 'الاسم', type: 'text' },
          { key: 'type', label: 'النوع', type: 'select', options: [{ value: 'bronze', label: 'برونزية' }, { value: 'silver', label: 'فضية' }, { value: 'gold', label: 'ذهبية' }, { value: 'legendary', label: 'أسطورية' }] },
          { key: 'price', label: 'السعر (عملات)', type: 'number' },
          { key: 'gemPrice', label: 'السعر (جواهر)', type: 'number' },
          { key: 'description', label: 'الوصف', type: 'text' },
          { key: 'minOverall', label: 'أقل تقييم', type: 'number' },
          { key: 'maxOverall', label: 'أعلى تقييم', type: 'number' },
          { key: 'playerCount', label: 'عدد اللاعبين', type: 'number' },
        ]
      }
      if (editingItem.startDate) { // Event
        return [
          { key: 'title', label: 'العنوان', type: 'text' },
          { key: 'description', label: 'الوصف', type: 'text' },
          { key: 'type', label: 'النوع', type: 'select', options: [{ value: 'transfer_window', label: 'نافذة انتقالات' }, { value: 'double_rewards', label: 'مكافآت مضاعفة' }, { value: 'special_tournament', label: 'بطولة خاصة' }, { value: 'announcement', label: 'إعلان' }] },
          { key: 'startDate', label: 'تاريخ البداية', type: 'datetime-local' },
          { key: 'endDate', label: 'تاريخ النهاية', type: 'datetime-local' },
        ]
      }
      if (editingItem.achievementId) { // Achievement
        return [
          { key: 'name', label: 'الاسم', type: 'text' },
          { key: 'description', label: 'الوصف', type: 'text' },
          { key: 'icon', label: 'الأيقونة', type: 'text' },
          { key: 'category', label: 'الفئة', type: 'select', options: [{ value: 'matches', label: 'مباريات' }, { value: 'tournaments', label: 'بطولات' }, { value: 'transfers', label: 'انتقالات' }, { value: 'training', label: 'تدريب' }, { value: 'special', label: 'خاص' }] },
          { key: 'requirement', label: 'المتطلب', type: 'number' },
          { key: 'rewardCoins', label: 'جائزة العملات', type: 'number' },
          { key: 'rewardGems', label: 'جائزة الجواهر', type: 'number' },
          { key: 'rewardTitle', label: 'لقب الجائزة', type: 'text' },
        ]
      }
      return []
    }

    const fields = getFields()
    const isUser = !!editingItem.username
    const isClub = !!editingItem.formation && !editingItem.position
    const isPlayer = !!editingItem.position
    const isTournament = editingItem.participantCount !== undefined
    const isPack = editingItem.openingCount !== undefined
    const isEvent = !!editingItem.startDate && !editingItem.achievementId
    const isAchievement = !!editingItem.achievementId

    const handleSave = () => {
      if (isUser) updateAdminUser(editingItem.id, formData)
      else if (isClub) updateAdminClub(editingItem.id, formData)
      else if (isPlayer) updateAdminPlayer(editingItem.id, formData)
      else if (isTournament) updateAdminTournament(editingItem.id, formData)
      else if (isPack) updateAdminPack(editingItem.id, formData)
      else if (isEvent) updateAdminEvent(editingItem.id, formData)
      else if (isAchievement) updateAdminAchievement(editingItem.id, formData)
      setEditingItem(null)
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 bg-black/80 flex items-end justify-center"
        onClick={() => setEditingItem(null)}
      >
        <motion.div
          initial={{ y: 300 }}
          animate={{ y: 0 }}
          exit={{ y: 300 }}
          className="bg-[#0d1f35] w-full max-w-[480px] max-h-[80vh] rounded-t-2xl p-4 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold">✏️ تعديل</h3>
            <button onClick={() => setEditingItem(null)} className="text-white/40 text-xl">✕</button>
          </div>

          <div className="space-y-3">
            {fields.map((field) => (
              <div key={field.key}>
                <label className="text-white/60 text-[10px] block mb-1">{field.label}</label>
                {field.type === 'select' ? (
                  <select
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-emerald-400 focus:outline-none"
                  >
                    {field.options?.map((opt: any) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-emerald-400 focus:outline-none"
                  />
                )}
              </div>
            ))}

            <button onClick={handleSave} className="w-full bg-emerald-500/20 text-emerald-400 py-2 rounded-lg text-sm font-bold">
              حفظ التعديلات
            </button>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // ==================== CREATE MODAL ====================
  const renderCreateModal = () => {
    if (!showCreateForm) return null

    const getCreateFields = () => {
      if (adminTab === 'players') {
        return [
          { key: 'name', label: 'اسم اللاعب', type: 'text' },
          { key: 'position', label: 'المركز', type: 'select', options: [{ value: 'GK', label: 'حارس' }, { value: 'CB', label: 'قلب دفاع' }, { value: 'LB', label: 'ظهير أيسر' }, { value: 'RB', label: 'ظهير أيمن' }, { value: 'CDM', label: 'محور' }, { value: 'CM', label: 'وسط' }, { value: 'CAM', label: 'صانع لعب' }, { value: 'LW', label: 'جناح أيسر' }, { value: 'RW', label: 'جناح أيمن' }, { value: 'ST', label: 'مهاجم' }] },
          { key: 'nationality', label: 'الجنسية', type: 'text' },
          { key: 'age', label: 'العمر', type: 'number' },
          { key: 'overall', label: 'التقييم العام', type: 'number' },
          { key: 'pace', label: 'السرعة', type: 'number' },
          { key: 'shooting', label: 'التسديد', type: 'number' },
          { key: 'passing', label: 'التمرير', type: 'number' },
          { key: 'dribbling', label: 'المراوغة', type: 'number' },
          { key: 'defending', label: 'الدفاع', type: 'number' },
          { key: 'physical', label: 'البدني', type: 'number' },
          { key: 'clubId', label: 'معرف النادي', type: 'text' },
        ]
      }
      if (adminTab === 'tournaments') {
        return [
          { key: 'name', label: 'اسم البطولة', type: 'text' },
          { key: 'type', label: 'النوع', type: 'select', options: [{ value: 'league', label: 'دوري' }, { value: 'cup', label: 'كأس' }, { value: 'champions', label: 'أبطال' }, { value: 'super', label: 'سوبر' }] },
          { key: 'tier', label: 'المستوى', type: 'number' },
          { key: 'maxTeams', label: 'الحد الأقصى للفرق', type: 'number' },
          { key: 'prize', label: 'الجائزة (عملات)', type: 'number' },
          { key: 'prizeGems', label: 'الجائزة (جواهر)', type: 'number' },
        ]
      }
      if (adminTab === 'packs') {
        return [
          { key: 'name', label: 'اسم الحزمة', type: 'text' },
          { key: 'type', label: 'النوع', type: 'select', options: [{ value: 'bronze', label: 'برونزية' }, { value: 'silver', label: 'فضية' }, { value: 'gold', label: 'ذهبية' }, { value: 'legendary', label: 'أسطورية' }] },
          { key: 'price', label: 'السعر (عملات)', type: 'number' },
          { key: 'gemPrice', label: 'السعر (جواهر)', type: 'number' },
          { key: 'description', label: 'الوصف', type: 'text' },
          { key: 'minOverall', label: 'أقل تقييم', type: 'number' },
          { key: 'maxOverall', label: 'أعلى تقييم', type: 'number' },
          { key: 'playerCount', label: 'عدد اللاعبين', type: 'number' },
        ]
      }
      if (adminTab === 'events') {
        return [
          { key: 'title', label: 'العنوان', type: 'text' },
          { key: 'description', label: 'الوصف', type: 'text' },
          { key: 'type', label: 'النوع', type: 'select', options: [{ value: 'transfer_window', label: 'نافذة انتقالات' }, { value: 'double_rewards', label: 'مكافآت مضاعفة' }, { value: 'special_tournament', label: 'بطولة خاصة' }, { value: 'announcement', label: 'إعلان' }] },
          { key: 'startDate', label: 'تاريخ البداية', type: 'datetime-local' },
          { key: 'endDate', label: 'تاريخ النهاية', type: 'datetime-local' },
        ]
      }
      if (adminTab === 'achievements') {
        return [
          { key: 'achievementId', label: 'معرف الإنجاز', type: 'text' },
          { key: 'name', label: 'الاسم', type: 'text' },
          { key: 'description', label: 'الوصف', type: 'text' },
          { key: 'icon', label: 'الأيقونة', type: 'text' },
          { key: 'category', label: 'الفئة', type: 'select', options: [{ value: 'matches', label: 'مباريات' }, { value: 'tournaments', label: 'بطولات' }, { value: 'transfers', label: 'انتقالات' }, { value: 'training', label: 'تدريب' }, { value: 'special', label: 'خاص' }] },
          { key: 'requirement', label: 'المتطلب', type: 'number' },
          { key: 'rewardCoins', label: 'جائزة العملات', type: 'number' },
          { key: 'rewardGems', label: 'جائزة الجواهر', type: 'number' },
          { key: 'rewardTitle', label: 'لقب الجائزة', type: 'text' },
        ]
      }
      return []
    }

    const fields = getCreateFields()

    const handleCreate = () => {
      if (adminTab === 'players') createAdminPlayer(formData)
      else if (adminTab === 'tournaments') createAdminTournament(formData)
      else if (adminTab === 'packs') createAdminPack(formData)
      else if (adminTab === 'events') createAdminEvent(formData)
      else if (adminTab === 'achievements') createAdminAchievement(formData)
      setShowCreateForm(false)
      setFormData({})
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 bg-black/80 flex items-end justify-center"
        onClick={() => setShowCreateForm(false)}
      >
        <motion.div
          initial={{ y: 300 }}
          animate={{ y: 0 }}
          exit={{ y: 300 }}
          className="bg-[#0d1f35] w-full max-w-[480px] max-h-[80vh] rounded-t-2xl p-4 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold">+ إنشاء جديد</h3>
            <button onClick={() => setShowCreateForm(false)} className="text-white/40 text-xl">✕</button>
          </div>

          <div className="space-y-3">
            {fields.map((field) => (
              <div key={field.key}>
                <label className="text-white/60 text-[10px] block mb-1">{field.label}</label>
                {field.type === 'select' ? (
                  <select
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-emerald-400 focus:outline-none"
                  >
                    {field.options?.map((opt: any) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-emerald-400 focus:outline-none"
                  />
                )}
              </div>
            ))}

            <button onClick={handleCreate} className="w-full bg-emerald-500/20 text-emerald-400 py-2 rounded-lg text-sm font-bold">
              إنشاء
            </button>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // ==================== MAIN RENDER ====================
  return (
    <div className="space-y-3">
      {/* Admin Header */}
      <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/10 rounded-xl p-3 border border-yellow-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👑</span>
            <div>
              <h2 className="text-yellow-400 font-bold text-sm">لوحة تحكم المسؤول</h2>
              <p className="text-white/40 text-[10px]">التحكم الكامل باللعبة</p>
            </div>
          </div>
          <button
            onClick={() => fetchAdminDashboard()}
            className="bg-white/5 text-white/40 px-2 py-1 rounded-lg text-[10px] hover:bg-white/10 hover:text-white/60"
          >
            🔄 تحديث
          </button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {ADMIN_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAdminTab(tab.id)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all ${
              adminTab === tab.id
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                : 'bg-white/5 text-white/40 border border-transparent hover:bg-white/10'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={adminTab}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
        >
          {adminTab === 'dashboard' && renderDashboard()}
          {adminTab === 'users' && renderUsers()}
          {adminTab === 'clubs' && renderClubs()}
          {adminTab === 'players' && renderPlayers()}
          {adminTab === 'tournaments' && renderTournaments()}
          {adminTab === 'packs' && renderPacks()}
          {adminTab === 'events' && renderEvents()}
          {adminTab === 'achievements' && renderAchievements()}
          {adminTab === 'economy' && renderEconomy()}
          {adminTab === 'announcements' && renderAnnouncements()}
        </motion.div>
      </AnimatePresence>

      {/* Modals */}
      {editingItem && renderEditModal()}
      {showCreateForm && renderCreateModal()}
    </div>
  )
}
