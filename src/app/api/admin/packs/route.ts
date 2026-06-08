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

export async function GET(req: NextRequest) {
  try {
    const admin = await checkAdmin(req)
    if (!admin) {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 })
    }

    const packs = await prisma.playerPack.findMany({
      include: { _count: { select: { openings: true } } },
      orderBy: { price: 'asc' },
    })

    return NextResponse.json({
      success: true,
      data: packs.map(p => ({
        ...p,
        openingCount: p._count.openings,
      })),
    })
  } catch (error) {
    console.error('Admin packs list error:', error)
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

    const pack = await prisma.playerPack.create({
      data: {
        name: body.name,
        type: body.type || 'bronze',
        price: body.price || 1000,
        gemPrice: body.gemPrice || 0,
        description: body.description || '',
        minOverall: body.minOverall || 55,
        maxOverall: body.maxOverall || 70,
        playerCount: body.playerCount || 1,
        isActive: body.isActive !== undefined ? body.isActive : true,
      },
    })

    return NextResponse.json({ success: true, data: pack })
  } catch (error) {
    console.error('Admin pack create error:', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}
