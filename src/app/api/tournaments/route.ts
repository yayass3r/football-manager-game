import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Fetch tournaments
    const tournaments = await db.tournament.findMany({
      orderBy: { tier: 'asc' },
    })

    // Fetch participant counts separately
    const tournamentIds = tournaments.map((t: any) => t.id)
    
    let participantCounts: Record<string, number> = {}
    if (tournamentIds.length > 0) {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        
        if (supabaseUrl && supabaseKey) {
          const url = `${supabaseUrl}/rest/v1/tournament_participants?select=tournament_id&tournament_id=in.(${tournamentIds.join(',')})`
          const res = await fetch(url, {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
            },
          })
          if (res.ok) {
            const data = await res.json()
            for (const row of data) {
              participantCounts[row.tournament_id] = (participantCounts[row.tournament_id] || 0) + 1
            }
          }
        }
      } catch (e) {
        console.error('Failed to fetch participant counts:', e)
      }
    }

    const tournamentsWithCount = tournaments.map((t: any) => ({
      ...t,
      currentTeams: participantCounts[t.id] || 0,
    }))

    return NextResponse.json({
      success: true,
      data: tournamentsWithCount,
    })
  } catch (error) {
    console.error('Get tournaments error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب البطولات' },
      { status: 500 }
    )
  }
}
