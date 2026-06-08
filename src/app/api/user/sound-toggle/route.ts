import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { soundEnabled: !user.soundEnabled },
    })

    const { password: _, ...userWithoutPassword } = updatedUser

    return NextResponse.json({
      success: true,
      data: {
        soundEnabled: updatedUser.soundEnabled,
        user: userWithoutPassword,
      },
    })
  } catch (error) {
    console.error('Sound toggle error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في تبديل الصوت' },
      { status: 500 }
    )
  }
}
