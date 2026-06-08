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

    const allowedFields = ['type', 'title', 'description', 'startDate', 'endDate', 'isActive']
    const updateData: any = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'startDate' || field === 'endDate') {
          updateData[field] = new Date(body[field])
        } else {
          updateData[field] = body[field]
        }
      }
    }

    const event = await prisma.gameEvent.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, data: event })
  } catch (error) {
    console.error('Admin event update error:', error)
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
    await prisma.gameEvent.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'تم حذف الحدث بنجاح' })
  } catch (error) {
    console.error('Admin event delete error:', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}
