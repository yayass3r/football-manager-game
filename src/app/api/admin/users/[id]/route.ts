import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/prisma-rest'

const prisma = new PrismaClient()

async function checkAdmin(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return null
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || !user.isAdmin) return null
  return user
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await checkAdmin(req)
    if (!admin) {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()

    const allowedFields = ['coins', 'gems', 'level', 'xp', 'avatar', 'isAdmin', 'isBanned', 'banReason', 'totalWins', 'totalTrophies']
    const updateData: any = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // Prevent admin from removing their own admin status
    if (id === admin.id && updateData.isAdmin === false) {
      return NextResponse.json({ success: false, error: 'لا يمكنك إزالة صلاحيات المسؤول من حسابك' }, { status: 400 })
    }

    // Prevent admin from banning themselves
    if (id === admin.id && updateData.isBanned === true) {
      return NextResponse.json({ success: false, error: 'لا يمكنك حظر حسابك' }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: { club: { select: { name: true, logo: true } } },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        coins: user.coins,
        gems: user.gems,
        level: user.level,
        xp: user.xp,
        avatar: user.avatar,
        isAdmin: user.isAdmin,
        isBanned: user.isBanned,
        banReason: user.banReason,
        totalWins: user.totalWins,
        totalTrophies: user.totalTrophies,
        club: user.club,
      }
    })
  } catch (error) {
    console.error('Admin user update error:', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await checkAdmin(req)
    if (!admin) {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })
    }

    const { id } = await params

    // Prevent admin from deleting themselves
    if (id === admin.id) {
      return NextResponse.json({ success: false, error: 'لا يمكنك حذف حسابك' }, { status: 400 })
    }

    await prisma.user.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'تم حذف المستخدم بنجاح' })
  } catch (error) {
    console.error('Admin user delete error:', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}
