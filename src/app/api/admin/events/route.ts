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

export async function GET(req: NextRequest) {
  try {
    const admin = await checkAdmin(req)
    if (!admin) {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })
    }

    const events = await prisma.gameEvent.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: events })
  } catch (error) {
    console.error('Admin events list error:', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await checkAdmin(req)
    if (!admin) {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })
    }

    const body = await req.json()

    const event = await prisma.gameEvent.create({
      data: {
        type: body.type || 'special_tournament',
        title: body.title,
        description: body.description || '',
        startDate: new Date(body.startDate || Date.now()),
        endDate: new Date(body.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
        isActive: body.isActive !== undefined ? body.isActive : true,
      },
    })

    return NextResponse.json({ success: true, data: event })
  } catch (error) {
    console.error('Admin event create error:', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}
