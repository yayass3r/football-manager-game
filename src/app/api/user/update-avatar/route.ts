import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const body = await request.json()
    const { avatar } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      )
    }

    if (!avatar || typeof avatar !== 'string' || avatar.length > 10) {
      return NextResponse.json(
        { success: false, error: 'رمز الأفاتار غير صالح' },
        { status: 400 }
      )
    }

    const user = await db.user.update({
      where: { id: userId },
      data: { avatar },
    })

    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      data: userWithoutPassword,
    })
  } catch (error) {
    console.error('Update avatar error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في تحديث الأفاتار' },
      { status: 500 }
    )
  }
}
