import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Supabase REST API client - works reliably over HTTPS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

let _client: SupabaseClient<Database> | null = null

export function getSupabaseClient(): SupabaseClient<Database> {
  if (!_client) {
    _client = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    })
  }
  return _client
}

// Helper for error handling
export function handleError(error: any, operation: string) {
  console.error(`${operation} error:`, error)
  return { success: false, error: error.message || 'حدث خطأ في قاعدة البيانات' }
}

export const sb = getSupabaseClient()
