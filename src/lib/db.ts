import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Connection configuration for Supabase PostgreSQL with pooling
const prismaClientOptions = {
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] as const : ['error'] as const,
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient(prismaClientOptions)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Graceful shutdown
process.on('beforeExit', async () => {
  await db.$disconnect()
})
