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
      'name', 'logo', 'primaryColor', 'secondaryColor', 'formation',
      'morale', 'reputation', 'wins', 'draws', 'losses',
      'goalsFor', 'goalsAgainst', 'stadiumName', 'stadiumLevel',
      'kitStyle', 'kitPattern', 'seasonPoints', 'seasonNumber', 'title'
    ]
    const updateData: any = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    const club = await prisma.club.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, data: club })
  } catch (error) {
    console.error('Admin club update error:', error)
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
    await prisma.club.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'تم حذف النادي بنجاح' })
  } catch (error) {
    console.error('Admin club delete error:', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}
