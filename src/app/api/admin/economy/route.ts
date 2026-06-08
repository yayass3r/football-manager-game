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
    const { action, userId: targetUserId, amount } = body

    if (!targetUserId || !amount) {
      return NextResponse.json({ success: false, error: 'معرف المستخدم والمبلغ مطلوبان' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: targetUserId } })
    if (!user) {
      return NextResponse.json({ success: false, error: 'المستخدم غير موجود' }, { status: 404 })
    }

    if (action === 'addCoins') {
      await prisma.user.update({
        where: { id: targetUserId },
        data: { coins: { increment: amount } },
      })
      return NextResponse.json({ success: true, message: `تم إضافة ${amount} عملة` })
    }

    if (action === 'removeCoins') {
      await prisma.user.update({
        where: { id: targetUserId },
        data: { coins: { decrement: Math.min(amount, user.coins) } },
      })
      return NextResponse.json({ success: true, message: `تم خصم ${amount} عملة` })
    }

    if (action === 'addGems') {
      await prisma.user.update({
        where: { id: targetUserId },
        data: { gems: { increment: amount } },
      })
      return NextResponse.json({ success: true, message: `تم إضافة ${amount} جوهرة` })
    }

    if (action === 'removeGems') {
      await prisma.user.update({
        where: { id: targetUserId },
        data: { gems: { decrement: Math.min(amount, user.gems) } },
      })
      return NextResponse.json({ success: true, message: `تم خصم ${amount} جوهرة` })
    }

    if (action === 'addAllCoins') {
      // Give coins to ALL users
      await prisma.user.updateMany({
        data: { coins: { increment: amount } },
      })
      return NextResponse.json({ success: true, message: `تم إضافة ${amount} عملة لجميع المستخدمين` })
    }

    if (action === 'addAllGems') {
      // Give gems to ALL users
      await prisma.user.updateMany({
        data: { gems: { increment: amount } },
      })
      return NextResponse.json({ success: true, message: `تم إضافة ${amount} جوهرة لجميع المستخدمين` })
    }

    return NextResponse.json({ success: false, error: 'إجراء غير معروف' }, { status: 400 })
  } catch (error) {
    console.error('Admin economy error:', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}
