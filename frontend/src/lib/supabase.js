import { createClient } from '@supabase/supabase-js'

const DEFAULT_URL = 'https://kiriqpvzvpbrwylioqdg.supabase.co'
const DEFAULT_KEY = 'sb_publishable_ypS70IuhlT6uTQSz08YgAA_9ju9QCKu'

// Detect Supabase credentials from query params, localStorage, or Vite environment variables
function getCredentials() {
  if (typeof window === 'undefined') return { url: DEFAULT_URL, key: DEFAULT_KEY }

  const urlParams = new URLSearchParams(window.location.search)
  const qUrl = urlParams.get('s_url') || urlParams.get('supabase_url')
  const qKey = urlParams.get('s_key') || urlParams.get('supabase_key')

  if (qUrl && qKey) {
    try {
      localStorage.setItem('gym_supabase_url', qUrl)
      localStorage.setItem('gym_supabase_key', qKey)
    } catch {}
  }

  const url = qUrl ||
    (typeof localStorage !== 'undefined' ? localStorage.getItem('gym_supabase_url') : '') ||
    import.meta.env.VITE_SUPABASE_URL ||
    DEFAULT_URL

  const key = qKey ||
    (typeof localStorage !== 'undefined' ? localStorage.getItem('gym_supabase_key') : '') ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    DEFAULT_KEY

  return { url: url.trim(), key: key.trim() }
}

let supabaseInstance = null
let currentUrl = ''
let currentKey = ''

export function getSupabase() {
  const { url, key } = getCredentials()
  if (!url || !key) return null

  if (supabaseInstance && currentUrl === url && currentKey === key) {
    return supabaseInstance
  }

  try {
    supabaseInstance = createClient(url, key, {
      auth: { persistSession: false },
      realtime: { params: { eventsPerSecond: 10 } }
    })
    currentUrl = url
    currentKey = key
    return supabaseInstance
  } catch (err) {
    console.error('[Supabase] Init error:', err)
    return null
  }
}

export function isSupabaseConfigured() {
  return !!getSupabase()
}

export function configureSupabase(url, key) {
  if (!url || !key) return false
  try {
    localStorage.setItem('gym_supabase_url', url.trim())
    localStorage.setItem('gym_supabase_key', key.trim())
    supabaseInstance = null
    return !!getSupabase()
  } catch {
    return false
  }
}

export function clearSupabaseConfig() {
  try {
    localStorage.removeItem('gym_supabase_url')
    localStorage.removeItem('gym_supabase_key')
    supabaseInstance = null
  } catch {}
}

/**
 * Fetch a JSON document by key from the 'opengym_store' table.
 */
export async function getStoreItem(key) {
  const sb = getSupabase()
  if (!sb) return null
  try {
    const { data, error } = await sb
      .from('opengym_store')
      .select('data')
      .eq('key', key)
      .maybeSingle()

    if (error) {
      console.warn(`[Supabase] getStoreItem('${key}') failed:`, error.message)
      return null
    }
    return data ? data.data : null
  } catch (err) {
    console.warn(`[Supabase] getStoreItem error:`, err)
    return null
  }
}

/**
 * Save/upsert a JSON document by key to the 'opengym_store' table.
 */
export async function setStoreItem(key, data) {
  const sb = getSupabase()
  if (!sb) return false
  try {
    const { error } = await sb
      .from('opengym_store')
      .upsert({
        key,
        data,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' })

    if (error) {
      console.warn(`[Supabase] setStoreItem('${key}') failed:`, error.message)
      return false
    }
    return true
  } catch (err) {
    console.warn(`[Supabase] setStoreItem error:`, err)
    return false
  }
}

/**
 * Subscribe to changes for a given key in real time.
 */
export function subscribeStoreItem(key, onUpdate) {
  const sb = getSupabase()
  if (!sb) return () => {}

  try {
    const channel = sb
      .channel(`sync_${key}_${Math.random().toString(36).slice(2, 7)}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'opengym_store', filter: `key=eq.${key}` },
        payload => {
          if (payload.new && payload.new.data) {
            onUpdate(payload.new.data)
          }
        }
      )
      .subscribe()

    return () => {
      try { sb.removeChannel(channel) } catch {}
    }
  } catch (err) {
    console.warn(`[Supabase] subscribe error:`, err)
    return () => {}
  }
}
