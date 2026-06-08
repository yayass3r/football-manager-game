import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { kitStyle, kitPattern } = body

    const validKitStyles = ['classic', 'striped', 'hooped', 'gradient', 'retro', 'neon']
    const validKitPatterns = ['plain', 'horizontal', 'vertical', 'diagonal', 'checker']

    if (kitStyle && !validKitStyles.includes(kitStyle)) {
      return NextResponse.json(
        { success: false, error: 'نمط الطقم غير صالح' },
        { status: 400 }
      )
    }

    if (kitPattern && !validKitPatterns.includes(kitPattern)) {
      return NextResponse.json(
        { success: false, error: 'تصميم الطقم غير صالح' },
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

    const updateData: Record<string, string> = {}
    if (kitStyle) updateData.kitStyle = kitStyle
    if (kitPattern) updateData.kitPattern = kitPattern

    const updatedClub = await db.club.update({
      where: { id: club.id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: updatedClub,
    })
  } catch (error) {
    console.error('Update kit error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في تحديث طقم النادي' },
      { status: 500 }
    )
  }
}
