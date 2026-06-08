import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const body = await request.json()
    const { name, logo, primaryColor, secondaryColor, formation } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'معرف المستخدم مطلوب' },
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

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2) {
        return NextResponse.json(
          { success: false, error: 'اسم النادي يجب أن يكون حرفين على الأقل' },
          { status: 400 }
        )
      }
      updateData.name = name.trim()
    }
    if (logo !== undefined) updateData.logo = logo
    if (primaryColor !== undefined) updateData.primaryColor = primaryColor
    if (secondaryColor !== undefined) updateData.secondaryColor = secondaryColor
    if (formation !== undefined) {
      const validFormations = ['4-3-3', '4-4-2', '3-5-2', '4-2-3-1', '5-3-2', '4-5-1', '3-4-3', '4-1-4-1']
      if (!validFormations.includes(formation)) {
        return NextResponse.json(
          { success: false, error: 'التشكيل غير صالح' },
          { status: 400 }
        )
      }
      updateData.formation = formation
    }

    const updatedClub = await db.club.update({
      where: { id: club.id },
      data: updateData,
      include: {
        players: {
          orderBy: { isStarter: 'desc' },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedClub,
    })
  } catch (error) {
    console.error('Update club error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في تحديث النادي' },
      { status: 500 }
    )
  }
}
