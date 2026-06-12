import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { comparePassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
        { status: 400 }
      )
    }

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim()

    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
      include: { club: true },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      )
    }

    // Check if user is banned
    if (user.isBanned) {
      return NextResponse.json(
        { success: false, error: `تم حظر هذا الحساب${user.banReason ? ': ' + user.banReason : ''}` },
        { status: 403 }
      )
    }

    const isValid = await comparePassword(password, user.password)

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      )
    }

    // Get club with players separately since nested include isn't fully supported
    let clubWithPlayers = null
    if (user.club) {
      // club comes as array from prisma-rest
      const club = Array.isArray(user.club) ? user.club[0] : user.club
      if (club) {
        const players = await db.player.findMany({
          where: { clubId: club.id },
        })
        // Sort: starters first, then by overall descending
        players.sort((a: any, b: any) => {
          if (a.isStarter !== b.isStarter) return b.isStarter ? 1 : -1
          return b.overall - a.overall
        })
        clubWithPlayers = { ...club, players }
      }
    }

    const { password: _, ...userWithoutPassword } = user

    // Update last login timestamp
    try {
      await db.user.update({
        where: { id: user.id },
        data: { updatedAt: new Date() },
      })
    } catch {
      // Non-critical - don't fail login if this fails
    }

    // Return with properly structured club
    const responseData = {
      ...userWithoutPassword,
      club: clubWithPlayers,
    }

    return NextResponse.json({
      success: true,
      data: responseData,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في تسجيل الدخول' },
      { status: 500 }
    )
  }
}
