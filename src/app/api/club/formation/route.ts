import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const body = await request.json()
    const { formation } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      )
    }

    if (!formation) {
      return NextResponse.json(
        { success: false, error: 'التشكيل مطلوب' },
        { status: 400 }
      )
    }

    const validFormations = ['4-3-3', '4-4-2', '3-5-2', '4-2-3-1', '5-3-2', '4-5-1', '3-4-3', '4-1-4-1']
    if (!validFormations.includes(formation)) {
      return NextResponse.json(
        { success: false, error: 'التشكيل غير صالح. التشكيلات المتاحة: ' + validFormations.join(', ') },
        { status: 400 }
      )
    }

    const club = await db.club.findUnique({
      where: { userId },
    })

    if (!club) {
      return NextResponse.json(
        { success: false, error: 'لم يتم العثور على النادي' },
        { status: 404 }
      )
    }

    const updatedClub = await db.club.update({
      where: { id: club.id },
      data: { formation },
    })

    return NextResponse.json({
      success: true,
      data: updatedClub,
    })
  } catch (error) {
    console.error('Update formation error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في تحديث التشكيل' },
      { status: 500 }
    )
  }
}
