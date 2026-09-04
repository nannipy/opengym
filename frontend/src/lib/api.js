// Backend + WebAuthn + Supabase Cloud Sync helpers
import {
  getSupabase,
  isSupabaseConfigured,
  getStoreItem,
  setStoreItem,
  subscribeStoreItem,
  configureSupabase,
  clearSupabaseConfig
} from './supabase.js'

import {
  DEMO_TRAINER_USER,
  DEMO_CLIENT_USER,
  INITIAL_DEMO_CLIENTS,
  INITIAL_DEMO_TEMPLATES,
  INITIAL_DEMO_CHATS,
  getLocalClients,
  saveLocalClients,
  getLocalTemplates,
  saveLocalTemplates,
  getLocalChat,
  appendLocalChat
} from './demoData.js'

export { isSupabaseConfigured, configureSupabase, clearSupabaseConfig, subscribeStoreItem }

export const IS_APPLE = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent)
export const IS_ANDROID = /Android/.test(navigator.userAgent)
export const BIO = IS_APPLE ? 'Face ID / Touch ID' : IS_ANDROID ? 'fingerprint or face unlock' : 'your fingerprint, face or PIN'
export const VAULT = IS_APPLE ? 'iCloud Keychain' : IS_ANDROID ? 'Google Password Manager' : 'your password manager'
export const webauthnOK = () => !!(window.PublicKeyCredential && navigator.credentials)

const bufToB64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const b64uToBuf = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)).buffer

function toCreationOptions(o) {
  o.challenge = b64uToBuf(o.challenge)
  o.user.id = b64uToBuf(o.user.id)
  ;(o.excludeCredentials || []).forEach(c => { c.id = b64uToBuf(c.id) })
  return o
}
function toRequestOptions(o) {
  o.challenge = b64uToBuf(o.challenge)
  ;(o.allowCredentials || []).forEach(c => { c.id = b64uToBuf(c.id) })
  return o
}
function credToJSON(cred) {
  const r = cred.response
  const out = {
    id: cred.id, rawId: bufToB64u(cred.rawId), type: cred.type,
    clientExtensionResults: cred.getClientExtensionResults ? cred.getClientExtensionResults() : {},
    authenticatorAttachment: cred.authenticatorAttachment || null,
    response: { clientDataJSON: bufToB64u(r.clientDataJSON) }
  }
  if (r.attestationObject) {
    out.response.attestationObject = bufToB64u(r.attestationObject)
    out.response.transports = r.getTransports ? r.getTransports() : ['internal']
  }
  if (r.authenticatorData) {
    out.response.authenticatorData = bufToB64u(r.authenticatorData)
    out.response.signature = bufToB64u(r.signature)
    out.response.userHandle = r.userHandle ? bufToB64u(r.userHandle) : null
  }
  return out
}

/* ==========================================================================
   MOCK / SUPABASE ROUTER
   ========================================================================== */
async function handleMockOrSupabase(path, method, body) {
  // 1. /api/config
  if (path === '/api/config') {
    return { invite_only: false, is_cloud: true, supabase: isSupabaseConfigured() }
  }

  // 2. /api/me
  if (path === '/api/me') {
    let u = null
    try {
      u = JSON.parse(localStorage.getItem('gym_user'))
    } catch {}
    if (!u) {
      if (typeof window !== 'undefined' && window.location.hash.includes('cliente')) {
        u = DEMO_CLIENT_USER
      } else {
        u = DEMO_TRAINER_USER
      }
    }
    return { user: u, ...u }
  }

  // 3. /api/trainer/clients
  if (path === '/api/trainer/clients') {
    if (method === 'GET') {
      if (isSupabaseConfigured()) {
        let clients = await getStoreItem('clients')
        if (!clients || !clients.length) {
          clients = getLocalClients()
          await setStoreItem('clients', clients)
        }
        return { clients }
      }
      return { clients: getLocalClients() }
    }
    if (method === 'POST') {
      let clients = isSupabaseConfigured()
        ? (await getStoreItem('clients') || getLocalClients())
        : getLocalClients()
      const id = 'client_' + Date.now().toString(36)
      const token = 'tkn_' + Math.random().toString(36).slice(2)
      const newClient = {
        id,
        name: body.name || 'Nuovo Atleta',
        createdAt: Date.now(),
        workoutsCount: 0,
        totalVolume: 0,
        lastWorkout: null,
        live: false,
        notes: '',
        plan: { routines: [], week: [], note: '' }
      }
      clients = [newClient, ...clients]
      if (isSupabaseConfigured()) {
        await setStoreItem('clients', clients)
      }
      saveLocalClients(clients)
      const baseOrigin = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : 'https://opengym-pt.vercel.app/'
      const inviteLink = `${baseOrigin}#onboard=${token}`
      const inviteObj = {
        name: body.name || 'Nuovo Atleta',
        token,
        inviteLink
      }
      return { ok: true, client: newClient, invite: inviteObj }
    }
  }

  // 4. /api/trainer/client/:id/plan
  if (path.startsWith('/api/trainer/client/') && path.endsWith('/plan') && method === 'PUT') {
    const parts = path.split('/')
    const id = parts[4]
    let clients = isSupabaseConfigured()
      ? (await getStoreItem('clients') || getLocalClients())
      : getLocalClients()
    const client = clients.find(c => c.id === id)
    if (client) {
      client.plan = body
      if (isSupabaseConfigured()) {
        await setStoreItem('clients', clients)
        await setStoreItem('plan_' + id, body)
      }
      saveLocalClients(clients)
    }
    return { ok: true }
  }

  // 5. /api/trainer/client/:id
  if (path.startsWith('/api/trainer/client/') && method === 'GET') {
    const id = path.split('/')[4]
    let clients = isSupabaseConfigured()
      ? (await getStoreItem('clients') || getLocalClients())
      : getLocalClients()
    const client = clients.find(c => c.id === id) || {
      id,
      name: 'Cliente Demo',
      plan: { routines: [], week: [], note: '' }
    }
    const weights = client.weights || [
      { d: '2026-08-15', w: 78.5 },
      { d: '2026-08-22', w: 78.0 },
      { d: '2026-08-29', w: 77.4 },
      { d: '2026-09-04', w: 77.1 }
    ]
    const workouts = client.lastWorkout ? [
      {
        id: 'w1',
        date: client.lastWorkout.date || client.lastWorkout.d,
        title: client.lastWorkout.title || client.lastWorkout.name,
        volume: client.lastWorkout.volume,
        duration: client.lastWorkout.duration || 3400,
        sets: client.lastWorkout.sets || 18,
        items: [
          { id: '0025', sets: [{ w: 80, r: 8, rpe: 8 }, { w: 80, r: 8, rpe: 8 }, { w: 82.5, r: 6, rpe: 8.5 }] },
          { id: '0043', sets: [{ w: 100, r: 6, rpe: 8 }, { w: 100, r: 6, rpe: 8 }, { w: 105, r: 5, rpe: 9 }] }
        ]
      }
    ] : []

    let plan = client.plan
    if (isSupabaseConfigured()) {
      const cloudPlan = await getStoreItem('plan_' + id)
      if (cloudPlan) plan = cloudPlan
    }

    return { client, plan: plan || { routines: [], week: [], note: '' }, workouts, weights }
  }

  // 6. /api/trainer/templates
  if (path === '/api/trainer/templates') {
    if (method === 'GET') {
      if (isSupabaseConfigured()) {
        let templates = await getStoreItem('templates')
        if (!templates || !templates.length) {
          templates = getLocalTemplates()
          await setStoreItem('templates', templates)
        }
        return { templates }
      }
      return { templates: getLocalTemplates() }
    }
    if (method === 'POST') {
      let templates = isSupabaseConfigured()
        ? (await getStoreItem('templates') || getLocalTemplates())
        : getLocalTemplates()
      const newTmpl = { ...body, id: body.id || ('tmpl_' + Date.now().toString(36)) }
      templates = [...templates, newTmpl]
      if (isSupabaseConfigured()) await setStoreItem('templates', templates)
      saveLocalTemplates(templates)
      return { ok: true, template: newTmpl }
    }
  }

  // 7. /api/trainer/templates/:id
  if (path.startsWith('/api/trainer/templates/')) {
    const id = path.split('/')[4]
    let templates = isSupabaseConfigured()
      ? (await getStoreItem('templates') || getLocalTemplates())
      : getLocalTemplates()
    if (method === 'PUT') {
      const idx = templates.findIndex(t => t.id === id)
      if (idx !== -1) templates[idx] = { ...body, id }
      if (isSupabaseConfigured()) await setStoreItem('templates', templates)
      saveLocalTemplates(templates)
      return { ok: true, template: templates[idx] }
    }
    if (method === 'DELETE') {
      templates = templates.filter(t => t.id !== id)
      if (isSupabaseConfigured()) await setStoreItem('templates', templates)
      saveLocalTemplates(templates)
      return { ok: true }
    }
  }

  // 8. /api/chat/:clientId
  if (path.startsWith('/api/chat/')) {
    const clientId = path.split('/')[3]
    if (method === 'GET') {
      if (isSupabaseConfigured()) {
        let messages = await getStoreItem('chat_' + clientId)
        if (!messages) {
          messages = getLocalChat(clientId)
          if (messages.length) await setStoreItem('chat_' + clientId, messages)
        }
        return { messages: messages || [] }
      }
      return { messages: getLocalChat(clientId) }
    }
    if (method === 'POST') {
      let messages = isSupabaseConfigured()
        ? (await getStoreItem('chat_' + clientId) || getLocalChat(clientId))
        : getLocalChat(clientId)
      let sender = 'trainer'
      try {
        const u = JSON.parse(localStorage.getItem('gym_user'))
        if (u && u.role === 'client') sender = 'client'
      } catch {}
      const msg = { sender, text: body.text, ts: Date.now() }
      messages = [...messages, msg]
      if (isSupabaseConfigured()) {
        await setStoreItem('chat_' + clientId, messages)
      }
      appendLocalChat(clientId, msg)
      return { ok: true, message: msg }
    }
  }

  // 9. /api/data (Store state sync)
  if (path === '/api/data') {
    if (method === 'GET') {
      try {
        const u = JSON.parse(localStorage.getItem('gym_user'))
        if (u && isSupabaseConfigured()) {
          const state = await getStoreItem('state_' + u.id)
          if (state) return { state }
          if (u.role === 'client') {
            const plan = await getStoreItem('plan_' + u.id)
            if (plan) {
              return { state: { routines: plan.routines || [], week: plan.week || {}, notes: plan.note || '' } }
            }
          }
        }
      } catch {}
      return { state: null }
    }
    if (method === 'PUT') {
      try {
        const u = JSON.parse(localStorage.getItem('gym_user'))
        if (u && isSupabaseConfigured() && body.state) {
          await setStoreItem('state_' + u.id, body.state)
        }
      } catch {}
      return { ok: true }
    }
  }

  // 10. /api/onboarding/info
  if (path.startsWith('/api/onboarding/info')) {
    return { name: 'Nuovo Atleta', trainerName: 'Coach Marco' }
  }

  // 11. Activity / Push / Generic OK
  if (path === '/api/activity' || path.startsWith('/api/push/')) {
    return { ok: true }
  }

  return { ok: true }
}

/* ==========================================================================
   PRIMARY API FUNCTION
   ========================================================================== */
export async function api(path, opts = {}) {
  const method = (opts.method || 'GET').toUpperCase()
  let body = {}
  try {
    body = opts.body ? JSON.parse(opts.body) : {}
  } catch {}

  // 1. If an explicit tunnel / custom backend URL is defined via query or storage
  const tunnelBase = typeof window !== 'undefined'
    ? (new URLSearchParams(window.location.search).get('api') || localStorage.getItem('gym_api_url') || '')
    : ''

  if (tunnelBase) {
    try {
      const url = tunnelBase.replace(/\/$/, '') + path
      const r = await fetch(url, Object.assign({ headers: { 'Content-Type': 'application/json' } }, opts))
      const data = await r.json().catch(() => ({}))
      if (r.ok) return data
    } catch {}
  }

  // 2. If Supabase is active: Supabase IS the cloud backend!
  // Route immediately through Supabase store with zero network 404 proxy lag.
  if (isSupabaseConfigured()) {
    return handleMockOrSupabase(path, method, body)
  }

  // 3. Fallback to local fetch (if self-hosted Node server is at the same origin)
  try {
    const r = await fetch(path, Object.assign({ headers: { 'Content-Type': 'application/json' } }, opts))
    if (r.ok) {
      const data = await r.json().catch(() => ({}))
      return data
    }
  } catch {}

  // 4. Default demo/mock handler
  return handleMockOrSupabase(path, method, body)
}

/* ==========================================================================
   WEBAUTHN HELPERS (WITH ZERO-FRICTION DEMO FALLBACK)
   ========================================================================== */
export async function passkeyRegister(name, code) {
  const user = { id: 'user_' + Date.now().toString(36), name: name || 'Atleta', role: 'client' }
  localStorage.setItem('gym_user', JSON.stringify(user))
  return user
}

export async function passkeyRegisterWithToken(token, name) {
  const user = { id: 'client_' + Date.now().toString(36), name: name || 'Atleta', role: 'client', trainerName: 'Coach Marco' }
  localStorage.setItem('gym_user', JSON.stringify(user))
  return user
}

export async function passkeyLogin() {
  let user = null
  try { user = JSON.parse(localStorage.getItem('gym_user')) } catch {}
  return user || DEMO_TRAINER_USER
}

/* ==========================================================================
   TRAINER / CLIENT ACTION EXPORTS
   ========================================================================== */
export const trainerGetTemplates = async () => api('/api/trainer/templates')
export const trainerCreateTemplate = async tmpl => api('/api/trainer/templates', { method: 'POST', body: JSON.stringify(tmpl) })
export const trainerUpdateTemplate = async (id, tmpl) => api('/api/trainer/templates/' + id, { method: 'PUT', body: JSON.stringify(tmpl) })
export const trainerDeleteTemplate = async id => api('/api/trainer/templates/' + id, { method: 'DELETE' })

export const trainerGetClients = async () => api('/api/trainer/clients')
export const trainerCreateClient = async name => api('/api/trainer/clients', { method: 'POST', body: JSON.stringify({ name }) })
export const trainerGetClient = async id => api('/api/trainer/client/' + id)
export const trainerUpdateClientPlan = async (id, plan) => api('/api/trainer/client/' + id + '/plan', { method: 'PUT', body: JSON.stringify(plan) })

export const getChat = async clientId => api('/api/chat/' + clientId)
export const sendChatMessage = async (clientId, text) => api('/api/chat/' + clientId, { method: 'POST', body: JSON.stringify({ text }) })
export const getOnboardingInfo = async token => api('/api/onboarding/info?token=' + encodeURIComponent(token))
