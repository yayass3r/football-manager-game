import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/prisma-rest'

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

    const tournaments = await prisma.tournament.findMany({
      orderBy: { createdAt: 'desc' },
    })

    // Get participant and match counts
    const tournamentIds = tournaments.map((t: any) => t.id)
    const participantCounts: Record<string, number> = {}
    const matchCounts: Record<string, number> = {}
    
    if (tournamentIds.length > 0) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (supabaseUrl && supabaseKey) {
        // Get participant counts
        const pUrl = `${supabaseUrl}/rest/v1/tournament_participants?select=tournament_id&tournament_id=in.(${tournamentIds.join(',')})`
        const pRes = await fetch(pUrl, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
        })
        if (pRes.ok) {
          const data = await pRes.json()
          for (const row of data) {
            participantCounts[row.tournament_id] = (participantCounts[row.tournament_id] || 0) + 1
          }
        }
        
        // Get match counts
        const mUrl = `${supabaseUrl}/rest/v1/matches?select=tournament_id&tournament_id=in.(${tournamentIds.join(',')})`
        const mRes = await fetch(mUrl, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
        })
        if (mRes.ok) {
          const data = await mRes.json()
          for (const row of data) {
            if (row.tournament_id) {
              matchCounts[row.tournament_id] = (matchCounts[row.tournament_id] || 0) + 1
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: tournaments.map((t: any) => ({
        id: t.id,
        name: t.name,
        type: t.type,
        tier: t.tier,
        maxTeams: t.maxTeams,
        prize: t.prize,
        prizeGems: t.prizeGems,
        season: t.season,
        status: t.status,
        participantCount: participantCounts[t.id] || 0,
        matchCount: matchCounts[t.id] || 0,
        createdAt: t.createdAt,
      })),
    })
  } catch (error) {
    console.error('Admin tournaments list error:', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await checkAdmin(req)
    if (!admin) {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })
    }

    const body = await req.json()

    const tournament = await prisma.tournament.create({
      data: {
        name: body.name,
        type: body.type || 'league',
        tier: body.tier || 1,
        maxTeams: body.maxTeams || 16,
        prize: body.prize || 5000,
        prizeGems: body.prizeGems || 0,
        season: body.season || 1,
        status: body.status || 'registration',
      },
    })

    return NextResponse.json({ success: true, data: tournament })
  } catch (error) {
    console.error('Admin tournament create error:', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}
