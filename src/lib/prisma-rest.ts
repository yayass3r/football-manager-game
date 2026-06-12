// ============================================
// PrismaClient replacement using Supabase REST API (PostgREST)
// This replaces @prisma/client to avoid PostgreSQL
// connection issues (IPv6/pooler) on Vercel
// ============================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// ============================================
// Table & Field Mapping Configuration
// ============================================

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
  playerStat: 'player_stats',
}

// Reverse mapping: table name -> model name
const modelMap: Record<string, string> = {}
for (const [model, table] of Object.entries(tableMap)) {
  modelMap[table] = model
}

// Relation configuration per model
interface RelationConfig {
  tableName: string          // target table
  foreignKey?: string        // FK on target pointing to us (for has-many)
  thisKey?: string           // FK on this table pointing to target (for belongs-to)
  fkeyConstraint?: string    // PostgREST fkey constraint name for disambiguation
  isMany: boolean            // has-many vs belongs-to
}

const relationMap: Record<string, Record<string, RelationConfig>> = {
  user: {
    club: { tableName: 'clubs', foreignKey: 'user_id', isMany: false },
    achievements: { tableName: 'user_achievements', foreignKey: 'user_id', isMany: true },
    packOpenings: { tableName: 'pack_openings', foreignKey: 'user_id', isMany: true },
    leaderboardEntries: { tableName: 'leaderboard_entries', foreignKey: 'user_id', isMany: true },
  },
  club: {
    user: { tableName: 'users', thisKey: 'user_id', isMany: false },
    players: { tableName: 'players', foreignKey: 'club_id', isMany: true },
    tournaments: { tableName: 'tournament_participants', foreignKey: 'club_id', isMany: true },
    homeMatches: { tableName: 'matches', foreignKey: 'home_club_id', fkeyConstraint: 'matches_home_club_id_fkey', isMany: true },
    awayMatches: { tableName: 'matches', foreignKey: 'away_club_id', fkeyConstraint: 'matches_away_club_id_fkey', isMany: true },
    transferListings: { tableName: 'transfer_listings', foreignKey: 'seller_club_id', isMany: true },
    leaderboardEntries: { tableName: 'leaderboard_entries', foreignKey: 'club_id', isMany: true },
    playerStats: { tableName: 'player_stats', foreignKey: 'club_id', isMany: true },
  },
  player: {
    club: { tableName: 'clubs', thisKey: 'club_id', isMany: false },
    transferListings: { tableName: 'transfer_listings', foreignKey: 'player_id', isMany: true },
    playerStats: { tableName: 'player_stats', foreignKey: 'player_id', isMany: true },
  },
  tournament: {
    participants: { tableName: 'tournament_participants', foreignKey: 'tournament_id', isMany: true },
    matches: { tableName: 'matches', foreignKey: 'tournament_id', isMany: true },
  },
  tournamentParticipant: {
    tournament: { tableName: 'tournaments', thisKey: 'tournament_id', isMany: false },
    club: { tableName: 'clubs', thisKey: 'club_id', isMany: false },
  },
  match: {
    tournament: { tableName: 'tournaments', thisKey: 'tournament_id', isMany: false },
    homeClub: { tableName: 'clubs', thisKey: 'home_club_id', fkeyConstraint: 'matches_home_club_id_fkey', isMany: false },
    awayClub: { tableName: 'clubs', thisKey: 'away_club_id', fkeyConstraint: 'matches_away_club_id_fkey', isMany: false },
  },
  transferListing: {
    player: { tableName: 'players', thisKey: 'player_id', isMany: false },
    sellerClub: { tableName: 'clubs', thisKey: 'seller_club_id', isMany: false },
  },
  userAchievement: {
    user: { tableName: 'users', thisKey: 'user_id', isMany: false },
    achievement: { tableName: 'achievements', thisKey: 'achievement_id', isMany: false },
  },
  gameEvent: {},
  playerPack: {
    openings: { tableName: 'pack_openings', foreignKey: 'pack_id', isMany: true },
  },
  packOpening: {
    user: { tableName: 'users', thisKey: 'user_id', isMany: false },
    pack: { tableName: 'player_packs', thisKey: 'pack_id', isMany: false },
  },
  achievement: {
    userAchievements: { tableName: 'user_achievements', foreignKey: 'achievement_id', isMany: true },
  },
  season: {},
  playerStat: {
    player: { tableName: 'players', thisKey: 'player_id', isMany: false },
    club: { tableName: 'clubs', thisKey: 'club_id', isMany: false },
  },
  leaderboardEntry: {
    user: { tableName: 'users', thisKey: 'user_id', isMany: false },
    club: { tableName: 'clubs', thisKey: 'club_id', isMany: false },
  },
}

// Date fields per table that should be converted to Date objects
const dateFields: Record<string, string[]> = {
  users: ['created_at', 'updated_at'],
  clubs: ['created_at', 'updated_at'],
  players: ['created_at', 'updated_at'],
  tournaments: ['created_at', 'updated_at'],
  tournament_participants: ['created_at'],
  matches: ['played_at', 'created_at'],
  transfer_listings: ['created_at', 'updated_at'],
  user_achievements: ['unlocked_at', 'created_at'],
  game_events: ['start_date', 'end_date', 'created_at'],
  player_packs: ['created_at'],
  pack_openings: ['opened_at'],
  achievements: [],
  seasons: ['start_date', 'end_date', 'created_at'],
  player_stats: ['created_at'],
  leaderboard_entries: ['updated_at'],
}

// ============================================
// Utility Functions
// ============================================

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

function transformKeysToSnake(obj: any): any {
  if (obj === null || obj === undefined) return obj
  if (obj instanceof Date) return obj.toISOString()
  if (Array.isArray(obj)) return obj.map(transformKeysToSnake)
  if (typeof obj === 'object') {
    const result: any = {}
    for (const key of Object.keys(obj)) {
      // Don't transform operators like increment, decrement, _count, etc.
      if (['increment', 'decrement', 'multiply', 'divide', 'set', 'push', 'connect', 'create', '_count', '_sum', '_avg', '_min', '_max'].includes(key)) {
        result[key] = transformKeysToSnake(obj[key])
        continue
      }
      const snakeKey = toSnakeCase(key)
      result[snakeKey] = transformKeysToSnake(obj[key])
    }
    return result
  }
  return obj
}

function transformKeysToCamel(obj: any): any {
  if (obj === null || obj === undefined) return obj
  if (obj instanceof Date) return obj
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

function convertDates(obj: any, tableName: string): any {
  if (obj === null || obj === undefined) return obj
  if (Array.isArray(obj)) return obj.map(item => convertDates(item, tableName))
  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const fields = dateFields[tableName] || []
    const result: any = {}
    for (const key of Object.keys(obj)) {
      if (fields.includes(key) && typeof obj[key] === 'string') {
        result[key] = new Date(obj[key])
      } else {
        result[key] = obj[key]
      }
    }
    return result
  }
  return obj
}

// Convert result from DB format (snake_case) to Prisma format (camelCase with Date objects)
function formatResult(obj: any, modelName: string): any {
  if (obj === null || obj === undefined) return obj
  const tableName = tableMap[modelName] || modelName
  
  if (Array.isArray(obj)) {
    return obj.map(item => {
      const withDates = convertDates(item, tableName)
      return transformKeysToCamel(withDates)
    })
  }
  
  const withDates = convertDates(obj, tableName)
  return transformKeysToCamel(withDates)
}

// ============================================
// PostgREST REST API Client
// ============================================

async function restRequest(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  tableName: string,
  queryParams: string = '',
  body?: any,
  headers: Record<string, string> = {}
): Promise<{ data: any; count?: number; error?: string }> {
  const url = `${supabaseUrl}/rest/v1/${tableName}${queryParams ? '?' + queryParams : ''}`
  
  const requestHeaders: Record<string, string> = {
    'apikey': supabaseServiceKey,
    'Authorization': `Bearer ${supabaseServiceKey}`,
    'Content-Type': 'application/json',
    ...headers,
  }
  
  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  
  // Parse content-range for count
  let count: number | undefined
  const contentRange = response.headers.get('content-range')
  if (contentRange) {
    const parts = contentRange.split('/')
    if (parts[1] && parts[1] !== '*') {
      count = parseInt(parts[1], 10)
    }
  }
  
  if (!response.ok) {
    const errorBody = await response.text()
    console.error(`PostgREST error [${method} ${tableName}]:`, response.status, errorBody)
    throw new Error(`PostgREST error: ${response.status} - ${errorBody}`)
  }
  
  // For HEAD requests or DELETE with no return
  if (method === 'DELETE' && response.status === 204) {
    return { data: null, count }
  }
  
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json()
    return { data, count }
  }
  
  return { data: null, count }
}

// ============================================
// Build PostgREST Query Parameters
// ============================================

function buildWhereParams(where: any): string[] {
  if (!where) return []
  
  const params: string[] = []
  
  for (const [key, value] of Object.entries(where)) {
    if (key === 'AND' || key === 'OR') {
      // Handle AND/OR conditions
      if (key === 'AND' && Array.isArray(value)) {
        for (const cond of value) {
          params.push(...buildWhereParams(cond))
        }
      }
      if (key === 'OR' && Array.isArray(value)) {
        // PostgREST or syntax: or(col1.eq.val1,col2.eq.val2)
        const orParts: string[] = []
        for (const cond of value) {
          const condParams = buildWhereParams(cond)
          orParts.push(...condParams)
        }
        if (orParts.length > 0) {
          params.push(`or(${orParts.join(',')})`)
        }
      }
      continue
    }
    
    const snakeKey = toSnakeCase(key)
    
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      const v = value as any
      if ('equals' in v) {
        params.push(`${snakeKey}=eq.${v.equals}`)
      } else if ('not' in v) {
        params.push(`${snakeKey}=neq.${v.not}`)
      } else if ('in' in v) {
        if (Array.isArray(v.in) && v.in.length > 0) {
          params.push(`${snakeKey}=in.(${v.in.join(',')})`)
        }
      } else if ('notIn' in v) {
        if (Array.isArray(v.notIn) && v.notIn.length > 0) {
          params.push(`${snakeKey}=not.in.(${v.notIn.join(',')})`)
        }
      } else if ('gt' in v) {
        params.push(`${snakeKey}=gt.${v.gt instanceof Date ? v.gt.toISOString() : v.gt}`)
      } else if ('gte' in v) {
        params.push(`${snakeKey}=gte.${v.gte instanceof Date ? v.gte.toISOString() : v.gte}`)
      } else if ('lt' in v) {
        params.push(`${snakeKey}=lt.${v.lt instanceof Date ? v.lt.toISOString() : v.lt}`)
      } else if ('lte' in v) {
        params.push(`${snakeKey}=lte.${v.lte instanceof Date ? v.lte.toISOString() : v.lte}`)
      } else if ('contains' in v) {
        params.push(`${snakeKey}=ilike.*${v.contains}*`)
      } else if ('startsWith' in v) {
        params.push(`${snakeKey}=ilike.${v.startsWith}*`)
      } else if ('endsWith' in v) {
        params.push(`${snakeKey}=ilike.*${v.endsWith}`)
      } else if ('isNull' in v) {
        params.push(`${snakeKey}=is.${v.isNull ? 'null' : 'not.null'}`)
      }
    } else {
      // Direct equality
      params.push(`${snakeKey}=eq.${value}`)
    }
  }
  
  return params
}

function buildOrderByParams(orderBy: any): string[] {
  if (!orderBy) return []
  
  const params: string[] = []
  
  if (Array.isArray(orderBy)) {
    for (const item of orderBy) {
      params.push(...buildOrderByParams(item))
    }
  } else if (typeof orderBy === 'object') {
    for (const [field, direction] of Object.entries(orderBy)) {
      const snakeField = toSnakeCase(field)
      const dir = direction === 'asc' ? 'asc' : 'desc'
      // For boolean fields, desc means true first
      params.push(`${snakeField}.${dir}.nullsfirst`)
    }
  }
  
  return params
}

function buildSelectFromInclude(modelName: string, include: any): string {
  const tableName = tableMap[modelName]
  const relations = relationMap[modelName] || {}
  
  const selectParts: string[] = ['*']
  
  if (typeof include === 'object') {
    for (const key of Object.keys(include)) {
      if (key === '_count') continue // Handle _count separately
      
      const relation = relations[key]
      if (!relation) continue
      
      const value = include[key]
      const targetTable = relation.tableName
      
      // Build the select clause for this relation
      let relSelect: string
      
      if (relation.fkeyConstraint) {
        // Needs disambiguation
        if (value === true) {
          relSelect = `${key}:${targetTable}!${relation.fkeyConstraint}(*)`
        } else if (typeof value === 'object' && value.select) {
          const subFields = buildSubSelect(value.select)
          relSelect = `${key}:${targetTable}!${relation.fkeyConstraint}(${subFields})`
        } else if (typeof value === 'object' && value.orderBy) {
          // Include with orderBy - PostgREST supports order in select
          const subFields = value.select ? buildSubSelect(value.select) : '*'
          const orderParts = buildOrderByParams(value.orderBy)
          const limitPart = value.take ? `&limit=${value.take}` : ''
          relSelect = `${key}:${targetTable}!${relation.fkeyConstraint}(${subFields}${orderParts.length > 0 ? '&' + orderParts.join('&') : ''}${limitPart})`
        } else {
          relSelect = `${key}:${targetTable}!${relation.fkeyConstraint}(*)`
        }
      } else if (relation.isMany && relation.foreignKey) {
        // Has-many relation
        if (value === true) {
          relSelect = `${key}:${targetTable}(*)`
        } else if (typeof value === 'object' && value.select) {
          const subFields = buildSubSelect(value.select)
          relSelect = `${key}:${targetTable}(${subFields})`
        } else if (typeof value === 'object' && value.orderBy) {
          const subFields = value.select ? buildSubSelect(value.select) : '*'
          const orderParts = buildOrderByParams(value.orderBy)
          const limitPart = value.take ? `&limit=${value.take}` : ''
          relSelect = `${key}:${targetTable}(${subFields}${orderParts.length > 0 ? '&' + orderParts.join('&') : ''}${limitPart})`
        } else {
          relSelect = `${key}:${targetTable}(*)`
        }
      } else {
        // Belongs-to relation
        if (value === true) {
          relSelect = `${key}:${targetTable}(*)`
        } else if (typeof value === 'object' && value.select) {
          const subFields = buildSubSelect(value.select)
          relSelect = `${key}:${targetTable}(${subFields})`
        } else {
          relSelect = `${key}:${targetTable}(*)`
        }
      }
      
      selectParts.push(relSelect)
    }
  }
  
  return selectParts.join(',')
}

function buildSubSelect(select: any): string {
  if (!select) return '*'
  const fields: string[] = []
  for (const key of Object.keys(select)) {
    if (select[key] === true) {
      fields.push(toSnakeCase(key))
    }
  }
  return fields.length > 0 ? fields.join(',') : '*'
}

// ============================================
// Process data with increment/decrement operators
// ============================================

function hasAtomicOperator(data: any): boolean {
  for (const key of Object.keys(data)) {
    const val = data[key]
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      if ('increment' in val || 'decrement' in val || 'multiply' in val || 'divide' in val || 'set' in val) {
        return true
      }
    }
  }
  return false
}

async function resolveAtomicOperators(
  modelName: string,
  where: any,
  data: any
): Promise<any> {
  const tableName = tableMap[modelName]
  const resolved: any = {}
  const atomicOps: { field: string; op: string; value: any }[] = []
  
  for (const key of Object.keys(data)) {
    const val = data[key]
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      if ('increment' in val) {
        atomicOps.push({ field: key, op: 'increment', value: val.increment })
      } else if ('decrement' in val) {
        atomicOps.push({ field: key, op: 'decrement', value: val.decrement })
      } else if ('multiply' in val) {
        atomicOps.push({ field: key, op: 'multiply', value: val.multiply })
      } else if ('divide' in val) {
        atomicOps.push({ field: key, op: 'divide', value: val.divide })
      } else if ('set' in val) {
        resolved[toSnakeCase(key)] = val.set
      } else {
        resolved[toSnakeCase(key)] = transformKeysToSnake(val)
      }
    } else {
      resolved[toSnakeCase(key)] = val instanceof Date ? val.toISOString() : val
    }
  }
  
  if (atomicOps.length > 0) {
    // Need to fetch current values first to compute new values
    const whereParams = buildWhereParams(where)
    const queryParams = whereParams.length > 0 ? whereParams.join('&') : ''
    
    // Select only the fields we need
    const fieldsToFetch = atomicOps.map(op => toSnakeCase(op.field))
    const selectParam = `select=${fieldsToFetch.join(',')}`
    const fullParams = queryParams ? `${selectParam}&${queryParams}` : selectParam
    
    const result = await restRequest('GET', tableName, fullParams)
    const currentRows = result.data
    
    if (currentRows && currentRows.length > 0) {
      // For update with where, we should only have one row for update
      // but for updateMany we might have multiple
      // We'll compute for the first row and apply the same change
      // Actually for updateMany we need to handle each row
      // For simplicity, let's just compute based on the first row for single update
      // or use the value directly for updateMany
      
      // For single update (findUnique/findFirst style), just use first row
      const current = currentRows[0]
      
      for (const op of atomicOps) {
        const snakeField = toSnakeCase(op.field)
        const currentVal = Number(current[snakeField]) || 0
        
        switch (op.op) {
          case 'increment':
            resolved[snakeField] = currentVal + op.value
            break
          case 'decrement':
            resolved[snakeField] = currentVal - op.value
            break
          case 'multiply':
            resolved[snakeField] = currentVal * op.value
            break
          case 'divide':
            resolved[snakeField] = currentVal / op.value
            break
        }
      }
    }
  }
  
  return resolved
}

// ============================================
// Handle _count in include
// ============================================

async function fetchCounts(
  modelName: string,
  items: any[],
  countSelect: any
): Promise<any[]> {
  const tableName = tableMap[modelName]
  const relations = relationMap[modelName] || {}
  
  if (!countSelect || typeof countSelect !== 'object') return items
  
  const countFields = Object.keys(countSelect).filter(k => countSelect[k] === true)
  if (countFields.length === 0) return items
  
  // For each item, we need to count the related records
  for (const relName of countFields) {
    const relation = relations[relName]
    if (!relation || !relation.foreignKey) continue
    
    const targetTable = relation.tableName
    const fkField = relation.foreignKey
    
    // Get all unique IDs from items
    const ids = items.map(item => item.id).filter(Boolean)
    if (ids.length === 0) continue
    
    // Fetch counts grouped by FK
    const queryParams = `select=${fkField}&${fkField}=in.(${ids.join(',')})`
    const result = await restRequest('GET', targetTable, queryParams)
    
    if (result.data) {
      // Count occurrences per FK value
      const countMap: Record<string, number> = {}
      for (const row of result.data) {
        const fkVal = row[fkField]
        countMap[fkVal] = (countMap[fkVal] || 0) + 1
      }
      
      // Add _count to items
      for (const item of items) {
        if (!item._count) item._count = {}
        item._count[relName] = countMap[item.id] || 0
      }
    }
  }
  
  return items
}

// ============================================
// Handle nested creates in data
// ============================================

async function handleNestedCreate(
  modelName: string,
  data: any,
  createdId: string
): Promise<Record<string, any[]>> {
  const relations = relationMap[modelName] || {}
  const nestedResults: Record<string, any[]> = {}
  
  for (const key of Object.keys(data)) {
    if (key === 'players' && data[key]?.create && modelName === 'club') {
      const playersData = Array.isArray(data[key].create) ? data[key].create : [data[key].create]
      const createdPlayers: any[] = []
      
      for (const playerData of playersData) {
        const snakeData = transformKeysToSnake({ ...playerData, clubId: createdId })
        const result = await restRequest('POST', 'players', '', snakeData, { 'Prefer': 'return=representation' })
        if (result.data) {
          createdPlayers.push(...(Array.isArray(result.data) ? result.data : [result.data]))
        }
      }
      
      nestedResults[key] = createdPlayers
    }
    // Add more nested create patterns as needed
  }
  
  return nestedResults
}

// Generate a CUID-compatible ID (similar to Prisma's @default(cuid()))
function generateId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 10)
  const counter = (globalThis as any).__idCounter = ((globalThis as any).__idCounter || 0) + 1
  return 'c' + timestamp + random + counter.toString(36)
}

// ============================================
// Model Delegate - implements Prisma-like API for each model
// ============================================

class ModelDelegate {
  private modelName: string
  private tableName: string
  
  constructor(modelName: string) {
    this.modelName = modelName
    this.tableName = tableMap[modelName]
    if (!this.tableName) {
      throw new Error(`Unknown model: ${modelName}`)
    }
  }
  
  async findUnique(args: { where: any; include?: any; select?: any }): Promise<any> {
    const whereParams = buildWhereParams(args.where)
    let selectParam = '*'
    
    if (args.select) {
      selectParam = buildSubSelect(args.select)
    } else if (args.include) {
      selectParam = buildSelectFromInclude(this.modelName, args.include)
    }
    
    const params: string[] = [`select=${selectParam}`, ...whereParams, 'limit=1']
    const queryParams = params.join('&')
    
    const result = await restRequest('GET', this.tableName, queryParams)
    
    if (!result.data || result.data.length === 0) return null
    
    let item = result.data[0]
    
    // Handle _count in include
    if (args.include?._count) {
      const items = await fetchCounts(this.modelName, [item], args.include._count.select || args.include._count)
      item = items[0]
    }
    
    // Transform relations in the item
    item = this.transformResult(item, args.include)
    
    return formatResult(item, this.modelName)
  }
  
  async findFirst(args?: { where?: any; include?: any; select?: any; orderBy?: any }): Promise<any> {
    const whereParams = args?.where ? buildWhereParams(args.where) : []
    let selectParam = '*'
    
    if (args?.select) {
      selectParam = buildSubSelect(args.select)
    } else if (args?.include) {
      selectParam = buildSelectFromInclude(this.modelName, args.include)
    }
    
    const params: string[] = [`select=${selectParam}`, ...whereParams]
    
    if (args?.orderBy) {
      const orderParts = buildOrderByParams(args.orderBy)
      if (orderParts.length > 0) {
        params.push(`order=${orderParts.join(',')}`)
      }
    }
    
    params.push('limit=1')
    
    const result = await restRequest('GET', this.tableName, params.join('&'))
    
    if (!result.data || result.data.length === 0) return null
    
    let item = result.data[0]
    
    if (args?.include?._count) {
      const items = await fetchCounts(this.modelName, [item], args.include._count.select || args.include._count)
      item = items[0]
    }
    
    item = this.transformResult(item, args?.include)
    
    return formatResult(item, this.modelName)
  }
  
  async findMany(args?: { where?: any; include?: any; select?: any; orderBy?: any; skip?: number; take?: number; distinct?: any }): Promise<any[]> {
    const whereParams = args?.where ? buildWhereParams(args.where) : []
    let selectParam = '*'
    
    if (args?.select) {
      selectParam = buildSubSelect(args.select)
    } else if (args?.include) {
      selectParam = buildSelectFromInclude(this.modelName, args.include)
    }
    
    const params: string[] = [`select=${selectParam}`, ...whereParams]
    
    if (args?.orderBy) {
      const orderParts = buildOrderByParams(args.orderBy)
      if (orderParts.length > 0) {
        params.push(`order=${orderParts.join(',')}`)
      }
    }
    
    if (args?.skip !== undefined && args?.take !== undefined) {
      params.push(`offset=${args.skip}`)
      params.push(`limit=${args.take}`)
    } else if (args?.take !== undefined) {
      params.push(`limit=${args.take}`)
    } else if (args?.skip !== undefined) {
      params.push(`offset=${args.skip}`)
    }
    
    const result = await restRequest('GET', this.tableName, params.join('&'))
    
    let items = result.data || []
    
    if (args?.include?._count) {
      items = await fetchCounts(this.modelName, items, args.include._count.select || args.include._count)
    }
    
    items = items.map((item: any) => this.transformResult(item, args?.include))
    
    return formatResult(items, this.modelName)
  }
  
  async create(args: { data: any; include?: any; select?: any }): Promise<any> {
    // Check for nested creates
    const nestedCreates: string[] = []
    const cleanData: any = {}
    
    for (const key of Object.keys(args.data)) {
      const val = args.data[key]
      if (val !== null && typeof val === 'object' && !Array.isArray(val) && val.create) {
        nestedCreates.push(key)
      } else if (val instanceof Date) {
        cleanData[key] = val.toISOString()
      } else {
        cleanData[key] = val
      }
    }
    
    // Auto-generate ID if not provided (Prisma @default(cuid()))
    if (!cleanData.id) {
      cleanData.id = generateId()
    }
    
    const snakeData = transformKeysToSnake(cleanData)
    const headers: Record<string, string> = { 'Prefer': 'return=representation' }
    
    const result = await restRequest('POST', this.tableName, '', snakeData, headers)
    
    let item = result.data
    if (Array.isArray(item)) item = item[0]
    
    // Handle nested creates
    if (nestedCreates.length > 0 && item) {
      const nestedResults = await handleNestedCreate(this.modelName, args.data, item.id)
      
      // Add nested results to the item
      for (const [relName, nestedData] of Object.entries(nestedResults)) {
        const camelRelName = toCamelCase(relName)
        item[relName] = nestedData
        // Also store with camelCase key for after transformation
        
        // If include was requested with orderBy, sort the nested data
        if (args.include?.[relName]?.orderBy || args.include?.[camelRelName]?.orderBy) {
          const orderBy = args.include?.[relName]?.orderBy || args.include?.[camelRelName]?.orderBy
          for (const [field, direction] of Object.entries(orderBy)) {
            nestedData.sort((a: any, b: any) => {
              const aVal = a[toSnakeCase(field)]
              const bVal = b[toSnakeCase(field)]
              if (direction === 'desc') {
                // For booleans, desc means true first
                if (typeof aVal === 'boolean') return aVal === bVal ? 0 : aVal ? -1 : 1
                return aVal > bVal ? -1 : 1
              }
              if (typeof aVal === 'boolean') return aVal === bVal ? 0 : aVal ? 1 : -1
              return aVal > bVal ? 1 : -1
            })
          }
        }
      }
    }
    
    // If include was requested, fetch the full record with includes
    if (args.include && item) {
      try {
        const includeResult = await this.findUnique({ where: { id: item.id }, include: args.include })
        if (includeResult) return includeResult
      } catch {
        // Fall through to return the basic item
      }
    }
    
    item = this.transformResult(item, args.include)
    return formatResult(item, this.modelName)
  }
  
  async createMany(args: { data: any[]; skipDuplicates?: boolean }): Promise<{ count: number }> {
    const snakeData = args.data.map(item => {
      const cleanItem: any = {}
      for (const key of Object.keys(item)) {
        const val = item[key]
        cleanItem[key] = val instanceof Date ? val.toISOString() : val
      }
      return transformKeysToSnake(cleanItem)
    })
    
    const result = await restRequest('POST', this.tableName, '', snakeData, { 'Prefer': 'return=representation' })
    return { count: Array.isArray(result.data) ? result.data.length : (result.data ? 1 : 0) }
  }
  
  async update(args: { where: any; data: any; include?: any }): Promise<any> {
    let snakeData: any
    
    if (hasAtomicOperator(args.data)) {
      snakeData = await resolveAtomicOperators(this.modelName, args.where, args.data)
    } else {
      const cleanData: any = {}
      for (const key of Object.keys(args.data)) {
        const val = args.data[key]
        if (val instanceof Date) {
          cleanData[key] = val.toISOString()
        } else {
          cleanData[key] = val
        }
      }
      snakeData = transformKeysToSnake(cleanData)
    }
    
    const whereParams = buildWhereParams(args.where)
    const params: string[] = [...whereParams]
    
    const headers: Record<string, string> = { 'Prefer': 'return=representation' }
    
    const result = await restRequest('PATCH', this.tableName, params.join('&'), snakeData, headers)
    
    let item = result.data
    if (Array.isArray(item)) item = item[0]
    
    if (!item) {
      throw new Error(`Record not found for update in ${this.modelName}`)
    }
    
    // If include was requested, fetch the full record
    if (args.include && item.id) {
      try {
        const includeResult = await this.findUnique({ where: { id: item.id }, include: args.include })
        if (includeResult) return includeResult
      } catch {
        // Fall through
      }
    }
    
    item = this.transformResult(item, args.include)
    return formatResult(item, this.modelName)
  }
  
  async updateMany(args: { where: any; data: any }): Promise<{ count: number }> {
    let snakeData: any
    
    if (hasAtomicOperator(args.data)) {
      snakeData = await resolveAtomicOperators(this.modelName, args.where, args.data)
    } else {
      const cleanData: any = {}
      for (const key of Object.keys(args.data)) {
        const val = args.data[key]
        if (val instanceof Date) {
          cleanData[key] = val.toISOString()
        } else {
          cleanData[key] = val
        }
      }
      snakeData = transformKeysToSnake(cleanData)
    }
    
    const whereParams = buildWhereParams(args.where)
    const params: string[] = [...whereParams]
    
    const headers: Record<string, string> = { 'Prefer': 'return=representation' }
    
    const result = await restRequest('PATCH', this.tableName, params.join('&'), snakeData, headers)
    
    const items = result.data
    return { count: Array.isArray(items) ? items.length : (items ? 1 : 0) }
  }
  
  async delete(args: { where: any }): Promise<any> {
    const whereParams = buildWhereParams(args.where)
    const params: string[] = [...whereParams]
    
    const headers: Record<string, string> = { 'Prefer': 'return=representation' }
    
    const result = await restRequest('DELETE', this.tableName, params.join('&'), undefined, headers)
    
    let item = result.data
    if (Array.isArray(item)) item = item[0]
    
    if (!item) return null
    
    return formatResult(item, this.modelName)
  }
  
  async deleteMany(args?: { where?: any }): Promise<{ count: number }> {
    const whereParams = args?.where ? buildWhereParams(args.where) : []
    const params: string[] = [...whereParams]
    
    const headers: Record<string, string> = { 'Prefer': 'return=representation' }
    
    const result = await restRequest('DELETE', this.tableName, params.join('&'), undefined, headers)
    
    const items = result.data
    return { count: Array.isArray(items) ? items.length : (items ? 1 : 0) }
  }
  
  async count(args?: { where?: any }): Promise<number> {
    const whereParams = args?.where ? buildWhereParams(args.where) : []
    const params: string[] = ['select=*', ...whereParams]
    
    const headers: Record<string, string> = { 'Prefer': 'count=exact' }
    
    const result = await restRequest('GET', this.tableName, params.join('&'), undefined, headers)
    
    // Use the count from content-range header, or count the returned array
    if (result.count !== undefined) return result.count
    if (Array.isArray(result.data)) return result.data.length
    return 0
  }
  
  async aggregate(args: { _sum?: any; _avg?: any; _min?: any; _max?: any; _count?: any; where?: any }): Promise<any> {
    const whereParams = args.where ? buildWhereParams(args.where) : []
    const params: string[] = ['select=*', ...whereParams]
    
    const result = await restRequest('GET', this.tableName, params.join('&'))
    const rows = result.data || []
    
    const aggregationResult: any = {}
    
    if (args._sum) {
      aggregationResult._sum = {}
      for (const field of Object.keys(args._sum)) {
        if (args._sum[field]) {
          const snakeField = toSnakeCase(field)
          const sum = rows.reduce((acc: number, row: any) => acc + (Number(row[snakeField]) || 0), 0)
          aggregationResult._sum[field] = sum
        }
      }
    }
    
    if (args._avg) {
      aggregationResult._avg = {}
      for (const field of Object.keys(args._avg)) {
        if (args._avg[field]) {
          const snakeField = toSnakeCase(field)
          const sum = rows.reduce((acc: number, row: any) => acc + (Number(row[snakeField]) || 0), 0)
          aggregationResult._avg[field] = rows.length > 0 ? Math.round((sum / rows.length) * 100) / 100 : 0
        }
      }
    }
    
    if (args._min) {
      aggregationResult._min = {}
      for (const field of Object.keys(args._min)) {
        if (args._min[field]) {
          const snakeField = toSnakeCase(field)
          const values = rows.map((row: any) => row[snakeField]).filter((v: any) => v !== null && v !== undefined)
          aggregationResult._min[field] = values.length > 0 ? values.reduce((a: any, b: any) => a < b ? a : b) : null
        }
      }
    }
    
    if (args._max) {
      aggregationResult._max = {}
      for (const field of Object.keys(args._max)) {
        if (args._max[field]) {
          const snakeField = toSnakeCase(field)
          const values = rows.map((row: any) => row[snakeField]).filter((v: any) => v !== null && v !== undefined)
          aggregationResult._max[field] = values.length > 0 ? values.reduce((a: any, b: any) => a > b ? a : b) : null
        }
      }
    }
    
    if (args._count) {
      aggregationResult._count = rows.length
    }
    
    return aggregationResult
  }
  
  async upsert(args: { where: any; create: any; update: any; include?: any }): Promise<any> {
    // Try to find existing record
    const existing = await this.findUnique({ where: args.where })
    
    if (existing) {
      return this.update({ where: args.where, data: args.update, include: args.include })
    } else {
      return this.create({ data: args.create, include: args.include })
    }
  }
  
  // Transform nested relation results from PostgREST format
  private transformResult(item: any, include?: any): any {
    if (!include || !item) return item
    
    const relations = relationMap[this.modelName] || {}
    
    for (const key of Object.keys(include)) {
      if (key === '_count') continue
      
      const relation = relations[key]
      if (!relation) continue
      
      // The PostgREST result may have the relation data under different keys
      // depending on how the select was constructed
      // Check for the camelCase or snake_case version of the key
      const snakeKey = toSnakeCase(key)
      
      // Look for the data in the item under various possible keys
      let relData = item[key] || item[snakeKey] || item[key.replace(/([A-Z])/g, '_$1').toLowerCase()]
      
      // If we used an alias in the select (like "homeClub:clubs!..."), PostgREST returns
      // the data under the alias name
      if (relData === undefined) {
        // Try to find by the alias we used in buildSelectFromInclude
        for (const itemKey of Object.keys(item)) {
          if (itemKey.startsWith(key + ':') || itemKey === key) {
            relData = item[itemKey]
            break
          }
        }
      }
      
      if (relData !== undefined) {
        // Convert the relation data to camelCase
        const targetModel = modelMap[relation.tableName]
        item[key] = formatResult(relData, targetModel || relation.tableName)
      }
    }
    
    return item
  }
}

// ============================================
// PrismaClient Class
// ============================================

export class PrismaClient {
  user: ModelDelegate
  club: ModelDelegate
  player: ModelDelegate
  tournament: ModelDelegate
  tournamentParticipant: ModelDelegate
  match: ModelDelegate
  transferListing: ModelDelegate
  userAchievement: ModelDelegate
  gameEvent: ModelDelegate
  playerPack: ModelDelegate
  packOpening: ModelDelegate
  achievement: ModelDelegate
  season: ModelDelegate
  leaderboardEntry: ModelDelegate
  playerStat: ModelDelegate
  
  constructor() {
    this.user = new ModelDelegate('user')
    this.club = new ModelDelegate('club')
    this.player = new ModelDelegate('player')
    this.tournament = new ModelDelegate('tournament')
    this.tournamentParticipant = new ModelDelegate('tournamentParticipant')
    this.match = new ModelDelegate('match')
    this.transferListing = new ModelDelegate('transferListing')
    this.userAchievement = new ModelDelegate('userAchievement')
    this.gameEvent = new ModelDelegate('gameEvent')
    this.playerPack = new ModelDelegate('playerPack')
    this.packOpening = new ModelDelegate('packOpening')
    this.achievement = new ModelDelegate('achievement')
    this.season = new ModelDelegate('season')
    this.leaderboardEntry = new ModelDelegate('leaderboardEntry')
    this.playerStat = new ModelDelegate('playerStat')
  }
  
  async $disconnect(): Promise<void> {
    // No-op for REST API
  }
  
  async $connect(): Promise<void> {
    // No-op for REST API
  }
  
  async $queryRaw(): Promise<any[]> {
    // Not supported with REST API - return empty array
    console.warn('$queryRaw is not supported with Supabase REST API')
    return []
  }
  
  async $executeRawUnsafe(): Promise<any> {
    // Not supported with REST API
    console.warn('$executeRawUnsafe is not supported with Supabase REST API')
    return { count: 0 }
  }
  
  async $transaction(fnOrArr: any): Promise<any> {
    // REST API doesn't support transactions natively
    // Execute sequentially
    if (typeof fnOrArr === 'function') {
      const tx = new PrismaClient()
      return fnOrArr(tx)
    }
    
    if (Array.isArray(fnOrArr)) {
      const results = []
      for (const promise of fnOrArr) {
        results.push(await promise)
      }
      return results
    }
    
    return fnOrArr
  }
}

// Export a singleton instance for convenience
export const prisma = new PrismaClient()

// Default export
export default PrismaClient
