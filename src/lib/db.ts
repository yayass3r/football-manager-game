import { PrismaClient } from '@/lib/prisma-rest'

// ============================================
// Database Client using Supabase REST API
// This replaces Prisma to avoid PostgreSQL 
// connection issues (IPv6/pooler) on Vercel
// ============================================

// Re-export the PrismaClient instance as `db` for backward compatibility
// with all routes that use `import { db } from '@/lib/db'`
export const db = new PrismaClient()

// Export Supabase client for direct access when needed
export { PrismaClient }
