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

    const allowedFields = [
      'name', 'position', 'nationality', 'age', 'overall',
      'pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical',
      'potential', 'value', 'salary', 'morale', 'fitness', 'form',
      'isStarter', 'shirtNumber', 'clubId'
    ]
    const updateData: any = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    const player = await prisma.player.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, data: player })
  } catch (error) {
    console.error('Admin player update error:', error)
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
    await prisma.player.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'تم حذف اللاعب بنجاح' })
  } catch (error) {
    console.error('Admin player delete error:', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}
