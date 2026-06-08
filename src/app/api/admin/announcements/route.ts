import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAdmin(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return null
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || !user.isAdmin) return null
  return user
}

export async function POST(req: NextRequest) {
  try {
    const admin = await checkAdmin(req)
    if (!admin) {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })
    }

    const body = await req.json()
    const { title, message, type } = body

    if (!title || !message) {
      return NextResponse.json({ success: false, error: 'العنوان والرسالة مطلوبان' }, { status: 400 })
    }

    // Create an announcement as a game event so it appears to all users
    const event = await prisma.gameEvent.create({
      data: {
        type: type || 'announcement',
        title,
        description: message,
        startDate: new Date(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        isActive: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: event,
      message: 'تم إرسال الإعلان بنجاح لجميع المستخدمين',
    })
  } catch (error) {
    console.error('Admin announcement error:', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}
