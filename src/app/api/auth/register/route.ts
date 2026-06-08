import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'اسم المستخدم وكلمة المرور مطلوبان' },
        { status: 400 }
      )
    }

    if (username.length < 3) {
      return NextResponse.json(
        { success: false, error: 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' },
        { status: 400 }
      )
    }

    const existingUser = await db.user.findUnique({
      where: { username },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'اسم المستخدم موجود بالفعل' },
        { status: 409 }
      )
    }

    const hashedPassword = await hashPassword(password)

    const user = await db.user.create({
      data: {
        username,
        password: hashedPassword,
        coins: 5000,
        gems: 50,
      },
    })

    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      data: userWithoutPassword,
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في التسجيل' },
      { status: 500 }
    )
  }
}
