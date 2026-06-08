import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      )
    }

    const club = await db.club.findUnique({
      where: { userId },
      include: {
        players: {
          orderBy: [{ isStarter: 'desc' }, { position: 'asc' }],
        },
      },
    })

    if (!club) {
      return NextResponse.json(
        { success: false, error: 'لم يتم العثور على النادي' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: club,
    })
  } catch (error) {
    console.error('Get club error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب بيانات النادي' },
      { status: 500 }
    )
  }
}
