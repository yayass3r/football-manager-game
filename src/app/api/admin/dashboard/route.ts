import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAdmin(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return null
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || !user.isAdmin) return null
  return user
}

export async function GET(req: NextRequest) {
  try {
    const admin = await checkAdmin(req)
    if (!admin) {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })
    }

    const [
      totalUsers,
      totalClubs,
      totalPlayers,
      totalMatches,
      totalTournaments,
      totalTransferListings,
      totalPackOpenings,
      activeEvents,
      currentSeason,
      recentUsers,
      topClubs,
      coinDistribution,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.club.count(),
      prisma.player.count(),
      prisma.match.count(),
      prisma.tournament.count(),
      prisma.transferListing.count({ where: { status: 'active' } }),
      prisma.packOpening.count(),
      prisma.gameEvent.count({ where: { isActive: true } }),
      prisma.season.findFirst({ where: { status: 'active' } }),
      prisma.user.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { club: { select: { name: true, logo: true } } } }),
      prisma.club.findMany({ take: 10, orderBy: { reputation: 'desc' }, select: { id: true, name: true, logo: true, reputation: true, wins: true, draws: true, losses: true, primaryColor: true } }),
      prisma.user.aggregate({ _sum: { coins: true, gems: true }, _avg: { coins: true, gems: true } }),
    ])

    const bannedUsers = await prisma.user.count({ where: { isBanned: true } })
    const adminUsers = await prisma.user.count({ where: { isAdmin: true } })

    const matchesToday = await prisma.match.count({
      where: {
        playedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    })

    const newUsersToday = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalClubs,
          totalPlayers,
          totalMatches,
          totalTournaments,
          activeTransferListings: totalTransferListings,
          totalPackOpenings,
          activeEvents,
          bannedUsers,
          adminUsers,
          matchesToday,
          newUsersToday,
        },
        economy: {
          totalCoins: coinDistribution._sum.coins || 0,
          totalGems: coinDistribution._sum.gems || 0,
          avgCoins: Math.round(coinDistribution._avg.coins || 0),
          avgGems: Math.round(coinDistribution._avg.gems || 0),
        },
        currentSeason,
        recentUsers: recentUsers.map(u => ({
          id: u.id,
          username: u.username,
          avatar: u.avatar,
          coins: u.coins,
          gems: u.gems,
          level: u.level,
          isBanned: u.isBanned,
          isAdmin: u.isAdmin,
          createdAt: u.createdAt,
          club: u.club,
        })),
        topClubs,
      }
    })
  } catch (error) {
    console.error('Admin dashboard error:', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}
