# Task: Create PrismaClient REST API Replacement

## Summary
Created a drop-in PrismaClient replacement at `/home/z/my-project/src/lib/prisma-rest.ts` that uses Supabase REST API (PostgREST) instead of direct PostgreSQL connections, and updated all 19 API route files plus `db.ts` to use it.

## Files Created
- `/home/z/my-project/src/lib/prisma-rest.ts` - Full PrismaClient class replacement using direct fetch to PostgREST

## Files Modified (18 admin/setup routes - import change)
- `src/app/api/setup/route.ts` - Changed `@prisma/client` → `@/lib/prisma-rest`
- `src/app/api/admin/clubs/route.ts`
- `src/app/api/admin/clubs/[id]/route.ts`
- `src/app/api/admin/tournaments/route.ts`
- `src/app/api/admin/tournaments/[id]/route.ts`
- `src/app/api/admin/users/route.ts`
- `src/app/api/admin/users/[id]/route.ts`
- `src/app/api/admin/events/route.ts`
- `src/app/api/admin/events/[id]/route.ts`
- `src/app/api/admin/packs/route.ts`
- `src/app/api/admin/packs/[id]/route.ts`
- `src/app/api/admin/players/route.ts`
- `src/app/api/admin/players/[id]/route.ts`
- `src/app/api/admin/achievements/route.ts`
- `src/app/api/admin/achievements/[id]/route.ts`
- `src/app/api/admin/economy/route.ts`
- `src/app/api/admin/dashboard/route.ts`
- `src/app/api/admin/announcements/route.ts`

## Files Modified (db.ts - consolidation)
- `src/lib/db.ts` - Now re-exports PrismaClient from prisma-rest, so all non-admin routes using `import { db } from '@/lib/db'` also use REST API

## Files Rewritten (setup-db)
- `src/app/api/setup-db/route.ts` - Rewrote to use PrismaClient from prisma-rest instead of dynamic @prisma/client import with raw SQL

## Key Implementation Details
- Direct fetch to `${supabaseUrl}/rest/v1/{table}` with apikey and Authorization headers
- camelCase ↔ snake_case field mapping transparent to callers
- Date string → Date object conversion for all date fields
- Supports: findUnique, findFirst, findMany, create, createMany, update, updateMany, delete, deleteMany, count, aggregate, upsert
- Increment/decrement operators in update data (fetches current value first, then computes new value)
- Include/relations using PostgREST select syntax with fkey constraint disambiguation
- _count in include via separate count queries
- Nested creates (e.g., club.create with players.create)
- $transaction as sequential execution (REST API doesn't support atomic transactions)
- $queryRaw and $executeRawUnsafe as no-ops with console warnings

## Build Status
- ✅ `bun run lint` passes (only pre-existing errors unrelated to changes)
- ✅ `bun run build` succeeds with all routes compiled
