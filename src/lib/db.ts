import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ============================================
// Database Client using Supabase REST API
// This replaces Prisma to avoid PostgreSQL 
// connection issues (IPv6/pooler) on Vercel
// ============================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

let _client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    })
  }
  return _client
}

// Table name mapping (Prisma model -> DB table)
const tableMap: Record<string, string> = {
  user: 'users',
  club: 'clubs',
  player: 'players',
  tournament: 'tournaments',
  tournamentParticipant: 'tournament_participants',
  match: 'matches',
  transferListing: 'transfer_listings',
  userAchievement: 'user_achievements',
  gameEvent: 'game_events',
  playerPack: 'player_packs',
  packOpening: 'pack_openings',
  achievement: 'achievements',
  season: 'seasons',
  leaderboardEntry: 'leaderboard_entries',
}

// Field name mapping (camelCase -> snake_case)
function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

function transformKeysToSnake(obj: any): any {
  if (obj === null || obj === undefined) return obj
  if (Array.isArray(obj)) return obj.map(transformKeysToSnake)
  if (typeof obj === 'object') {
    const result: any = {}
    for (const key of Object.keys(obj)) {
      // Special handling for known camelCase fields
      const snakeKey = toSnakeCase(key)
      result[snakeKey] = transformKeysToSnake(obj[key])
    }
    return result
  }
  return obj
}

function transformKeysToCamel(obj: any): any {
  if (obj === null || obj === undefined) return obj
  if (Array.isArray(obj)) return obj.map(transformKeysToCamel)
  if (typeof obj === 'object') {
    const result: any = {}
    for (const key of Object.keys(obj)) {
      const camelKey = toCamelCase(key)
      result[camelKey] = transformKeysToCamel(obj[key])
    }
    return result
  }
  return obj
}

// Build Supabase query from Prisma-like where clause
function buildWhere(query: any, where: any): any {
  if (!where) return query
  
  for (const [key, value] of Object.entries(where)) {
    const snakeKey = toSnakeCase(key)
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      // Handle operators
      if ('equals' in (value as any)) {
        query = query.eq(snakeKey, (value as any).equals)
      } else if ('not' in (value as any)) {
        query = query.neq(snakeKey, (value as any).not)
      } else if ('in' in (value as any)) {
        query = query.in(snakeKey, (value as any).in)
      } else if ('gt' in (value as any)) {
        query = query.gt(snakeKey, (value as any).gt)
      } else if ('gte' in (value as any)) {
        query = query.gte(snakeKey, (value as any).gte)
      } else if ('lt' in (value as any)) {
        query = query.lt(snakeKey, (value as any).lt)
      } else if ('lte' in (value as any)) {
        query = query.lte(snakeKey, (value as any).lte)
      } else if ('contains' in (value as any)) {
        query = query.ilike(snakeKey, `%${(value as any).contains}%`)
      } else if ('startsWith' in (value as any)) {
        query = query.ilike(snakeKey, `${(value as any).startsWith}%`)
      } else if ('endsWith' in (value as any)) {
        query = query.ilike(snakeKey, `%${(value as any).endsWith}`)
      } else {
        // Nested object - could be AND/OR
        if (key === 'AND') {
          for (const cond of value as any[]) {
            query = buildWhere(query, cond)
          }
        } else if (key === 'OR') {
          // Supabase doesn't directly support OR in the same way
          // We'll handle this differently
        }
      }
    } else {
      query = query.eq(snakeKey, value)
    }
  }
  return query
}

// Model handler that provides Prisma-like methods
function createModelHandler(modelName: string) {
  const tableName = tableMap[modelName]
  if (!tableName) {
    throw new Error(`Unknown model: ${modelName}`)
  }

  return {
    findMany: async (args?: any) => {
      let query = getClient().from(tableName).select(args?.include ? buildSelectString(args.include, tableName) : '*')
      if (args?.where) query = buildWhere(query, args.where)
      if (args?.orderBy) {
        const orderField = Array.isArray(args.orderBy) ? args.orderBy[0] : args.orderBy
        if (typeof orderField === 'object') {
          for (const [field, direction] of Object.entries(orderField)) {
            query = query.order(toSnakeCase(field), { ascending: direction === 'asc' })
          }
        }
      }
      if (args?.skip) query = query.range(args.skip, args.skip + (args?.take || 10) - 1)
      else if (args?.take) query = query.limit(args.take)
      
      const { data, error } = await query
      if (error) throw new Error(error.message)
      return (data || []).map(transformKeysToCamel)
    },

    findUnique: async (args: any) => {
      let query = getClient().from(tableName).select(args?.include ? buildSelectString(args.include, tableName) : '*')
      query = buildWhere(query, args.where)
      query = query.limit(1)
      const { data, error } = await query
      if (error) throw new Error(error.message)
      return data && data.length > 0 ? transformKeysToCamel(data[0]) : null
    },

    findFirst: async (args?: any) => {
      let query = getClient().from(tableName).select(args?.include ? buildSelectString(args.include, tableName) : '*')
      if (args?.where) query = buildWhere(query, args.where)
      if (args?.orderBy) {
        const orderField = Array.isArray(args.orderBy) ? args.orderBy[0] : args.orderBy
        if (typeof orderField === 'object') {
          for (const [field, direction] of Object.entries(orderField)) {
            query = query.order(toSnakeCase(field), { ascending: direction === 'asc' })
          }
        }
      }
      query = query.limit(1)
      const { data, error } = await query
      if (error) throw new Error(error.message)
      return data && data.length > 0 ? transformKeysToCamel(data[0]) : null
    },

    create: async (args: any) => {
      const snakeData = transformKeysToSnake(args.data)
      const { data, error } = await getClient()
        .from(tableName)
        .insert(snakeData)
        .select()
        .single()
      if (error) throw new Error(error.message)
      return transformKeysToCamel(data)
    },

    createMany: async (args: any) => {
      const snakeData = args.data.map(transformKeysToSnake)
      const { data, error } = await getClient()
        .from(tableName)
        .insert(snakeData)
        .select()
      if (error) throw new Error(error.message)
      return { count: data?.length || 0 }
    },

    update: async (args: any) => {
      const snakeData = transformKeysToSnake(args.data)
      let query = getClient().from(tableName).update(snakeData)
      query = buildWhere(query, args.where)
      query = query.select().single()
      const { data, error } = await query
      if (error) throw new Error(error.message)
      return transformKeysToCamel(data)
    },

    updateMany: async (args: any) => {
      const snakeData = transformKeysToSnake(args.data)
      let query = getClient().from(tableName).update(snakeData)
      query = buildWhere(query, args.where)
      query = query.select()
      const { data, error } = await query
      if (error) throw new Error(error.message)
      return { count: data?.length || 0 }
    },

    delete: async (args: any) => {
      let query = getClient().from(tableName).delete()
      query = buildWhere(query, args.where)
      query = query.select().single()
      const { data, error } = await query
      if (error) throw new Error(error.message)
      return transformKeysToCamel(data)
    },

    deleteMany: async (args?: any) => {
      let query = getClient().from(tableName).delete()
      if (args?.where) query = buildWhere(query, args.where)
      query = query.select()
      const { data, error } = await query
      if (error) throw new Error(error.message)
      return { count: data?.length || 0 }
    },

    count: async (args?: any) => {
      let query = getClient().from(tableName).select('*', { count: 'exact', head: true })
      if (args?.where) query = buildWhere(query, args.where)
      const { count, error } = await query
      if (error) throw new Error(error.message)
      return count || 0
    },

    upsert: async (args: any) => {
      const snakeData = transformKeysToSnake(args.data)
      const { data, error } = await getClient()
        .from(tableName)
        .upsert(snakeData, { onConflict: args.onConflict?.map(toSnakeCase).join(',') })
        .select()
        .single()
      if (error) throw new Error(error.message)
      return transformKeysToCamel(data)
    },
  }
}

// Build select string for include relations
function buildSelectString(include: any, tableName: string): string {
  const relationMap: Record<string, Record<string, string>> = {
    users: { club: 'clubs(*)', achievements: 'user_achievements(*)', packOpenings: 'pack_openings(*)', leaderboardEntries: 'leaderboard_entries(*)' },
    clubs: { user: 'users(*)', players: 'players(*)', tournaments: 'tournament_participants(*)', homeMatches: 'matches!matches_home_club_id_fkey(*)', awayMatches: 'matches!matches_away_club_id_fkey(*)', transferListings: 'transfer_listings(*)', leaderboardEntries: 'leaderboard_entries(*)' },
    players: { club: 'clubs(*)', transferListings: 'transfer_listings(*)' },
    tournaments: { participants: 'tournament_participants(*)', matches: 'matches(*)' },
    tournament_participants: { tournament: 'tournaments(*)', club: 'clubs(*)' },
    matches: { tournament: 'tournaments(*)', homeClub: 'clubs!matches_home_club_id_fkey(*)', awayClub: 'clubs!matches_away_club_id_fkey(*)' },
    transfer_listings: { player: 'players(*)', sellerClub: 'clubs(*)' },
    user_achievements: { user: 'users(*)', achievement: 'achievements(*)' },
    player_packs: { openings: 'pack_openings(*)' },
    pack_openings: { user: 'users(*)', pack: 'player_packs(*)' },
    achievements: { userAchievements: 'user_achievements(*)' },
    leaderboard_entries: { user: 'users(*)', club: 'clubs(*)' },
  }

  const relations = relationMap[tableName] || {}
  const selectParts: string[] = ['*']
  
  if (typeof include === 'object') {
    for (const key of Object.keys(include)) {
      const snakeKey = toSnakeCase(key)
      if (relations[snakeKey]) {
        if (include[key] === true) {
          selectParts.push(relations[snakeKey])
        } else if (typeof include[key] === 'object' && include[key].select) {
          // Nested select - simplified
          selectParts.push(relations[snakeKey])
        } else if (typeof include[key] === 'object' && include[key]._count) {
          // Count relation
          selectParts.push(relations[snakeKey])
        }
      }
    }
  }
  
  return selectParts.join(',')
}

// Create the db proxy
function createDb() {
  return new Proxy({} as any, {
    get(target, prop: string) {
      if (prop === '$disconnect') return async () => {}
      if (prop === '$connect') return async () => {}
      if (prop === '$queryRaw') return async () => []
      if (prop === '$executeRawUnsafe') return async () => {}
      if (prop === '$transaction') return async (fn: any) => {
        // Supabase REST API doesn't support transactions natively
        // For now, just execute the callback
        if (typeof fn === 'function') {
          const tx = createDb()
          return fn(tx)
        }
        return Promise.all(fn)
      }
      return createModelHandler(prop)
    }
  })
}

export const db = createDb()

// Export Supabase client for direct access when needed
export const supabase = getClient()
