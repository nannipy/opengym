// Backend + WebAuthn helpers (ported from the vanilla app).
export const IS_APPLE = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent)
export const IS_ANDROID = /Android/.test(navigator.userAgent)
export const BIO = IS_APPLE ? 'Face ID / Touch ID' : IS_ANDROID ? 'fingerprint or face unlock' : 'your fingerprint, face or PIN'
export const VAULT = IS_APPLE ? 'iCloud Keychain' : IS_ANDROID ? 'Google Password Manager' : 'your password manager'
export const webauthnOK = () => !!(window.PublicKeyCredential && navigator.credentials)

export async function api(path, opts) {
  const r = await fetch(path, Object.assign({ headers: { 'Content-Type': 'application/json' } }, opts))
  const data = await r.json().catch(() => ({}))
  if (!r.ok) { const e = new Error(data.error || ('HTTP ' + r.status)); e.status = r.status; throw e }
  return data
}

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
export async function passkeyRegister(name, code) {
  const { cid, options } = await api('/api/register/options', { method: 'POST', body: JSON.stringify({ name, code: code || '' }) })
  const cred = await navigator.credentials.create({ publicKey: toCreationOptions(options) })
  const res = await api('/api/register/verify', { method: 'POST', body: JSON.stringify({ cid, credential: credToJSON(cred) }) })
  return res.user
}
export async function passkeyRegisterWithToken(token, name) {
  const { cid, options } = await api('/api/register/options', { method: 'POST', body: JSON.stringify({ token, name: name || '' }) })
  const cred = await navigator.credentials.create({ publicKey: toCreationOptions(options) })
  const res = await api('/api/register/verify', { method: 'POST', body: JSON.stringify({ cid, credential: credToJSON(cred) }) })
  return res.user
}
export async function passkeyLogin() {
  const { cid, options } = await api('/api/login/options', { method: 'POST', body: '{}' })
  const cred = await navigator.credentials.get({ publicKey: toRequestOptions(options) })
  const res = await api('/api/login/verify', { method: 'POST', body: JSON.stringify({ cid, credential: credToJSON(cred) }) })
  return res.user
}

import {
  getLocalClients,
  saveLocalClients,
  getLocalTemplates,
  saveLocalTemplates,
  getLocalChat,
  appendLocalChat
} from './demoData.js'

/* ---------- Trainer, Client & Chat helpers with offline/demo fallbacks ---------- */
export const trainerGetTemplates = async () => {
  try {
    return await api('/api/trainer/templates')
  } catch {
    return { templates: getLocalTemplates() }
  }
}

export const trainerCreateTemplate = async tmpl => {
  try {
    return await api('/api/trainer/templates', { method: 'POST', body: JSON.stringify(tmpl) })
  } catch {
    const list = getLocalTemplates()
    const newTmpl = { ...tmpl, id: tmpl.id || ('tmpl_' + Date.now()) }
    list.push(newTmpl)
    saveLocalTemplates(list)
    return { ok: true, template: newTmpl }
  }
}

export const trainerUpdateTemplate = async (id, tmpl) => {
  try {
    return await api('/api/trainer/templates/' + id, { method: 'PUT', body: JSON.stringify(tmpl) })
  } catch {
    const list = getLocalTemplates()
    const idx = list.findIndex(t => t.id === id)
    if (idx !== -1) list[idx] = { ...tmpl, id }
    saveLocalTemplates(list)
    return { ok: true, template: list[idx] }
  }
}

export const trainerDeleteTemplate = async id => {
  try {
    return await api('/api/trainer/templates/' + id, { method: 'DELETE' })
  } catch {
    const list = getLocalTemplates().filter(t => t.id !== id)
    saveLocalTemplates(list)
    return { ok: true }
  }
}

export const trainerGetClients = async () => {
  try {
    return await api('/api/trainer/clients')
  } catch {
    return { clients: getLocalClients() }
  }
}

export const trainerCreateClient = async name => {
  try {
    return await api('/api/trainer/clients', { method: 'POST', body: JSON.stringify({ name }) })
  } catch {
    const list = getLocalClients()
    const id = 'client_' + Date.now().toString(36)
    const token = 'tkn_' + Math.random().toString(36).slice(2)
    const newClient = {
      id,
      name,
      createdAt: Date.now(),
      workoutsCount: 0,
      totalVolume: 0,
      lastWorkout: null,
      live: false,
      notes: '',
      plan: { routines: [], week: [], note: '' }
    }
    list.unshift(newClient)
    saveLocalClients(list)
    const invite = `${window.location.origin}${window.location.pathname}#onboard=${token}`
    return { ok: true, client: newClient, invite }
  }
}

export const trainerGetClient = async id => {
  try {
    return await api('/api/trainer/client/' + id)
  } catch {
    const client = getLocalClients().find(c => c.id === id) || {
      id,
      name: 'Cliente Demo',
      plan: { routines: [], week: [], note: '' }
    }
    return {
      client,
      plan: client.plan || { routines: [], week: [], note: '' },
      workouts: [
        {
          id: 'w1',
          date: Date.now() - 2 * 3600000,
          title: 'Giorno A - Spinta',
          volume: 7850,
          duration: 3420,
          sets: 18,
          items: [
            { id: '0025', sets: [{ w: 80, r: 8, rpe: 8 }, { w: 80, r: 8, rpe: 8 }, { w: 82.5, r: 6, rpe: 8.5 }] },
            { id: '0043', sets: [{ w: 100, r: 6, rpe: 8 }, { w: 100, r: 6, rpe: 8 }, { w: 105, r: 5, rpe: 9 }] }
          ]
        },
        {
          id: 'w2',
          date: Date.now() - 3 * 86400000,
          title: 'Giorno B - Trazione',
          volume: 8200,
          duration: 3600,
          sets: 19
        }
      ],
      weights: [
        { d: '2026-08-15', w: 80.2 },
        { d: '2026-08-22', w: 79.7 },
        { d: '2026-08-29', w: 79.1 },
        { d: '2026-09-04', w: 78.5 }
      ]
    }
  }
}

export const trainerUpdateClientPlan = async (id, plan) => {
  try {
    return await api('/api/trainer/client/' + id + '/plan', { method: 'PUT', body: JSON.stringify(plan) })
  } catch {
    const list = getLocalClients()
    const client = list.find(c => c.id === id)
    if (client) {
      client.plan = plan
      saveLocalClients(list)
    }
    return { ok: true }
  }
}

export const getChat = async clientId => {
  try {
    return await api('/api/chat/' + clientId)
  } catch {
    return { messages: getLocalChat(clientId) }
  }
}

export const sendChatMessage = async (clientId, text) => {
  try {
    return await api('/api/chat/' + clientId, { method: 'POST', body: JSON.stringify({ text }) })
  } catch {
    const msg = {
      sender: 'trainer',
      text,
      ts: Date.now()
    }
    appendLocalChat(clientId, msg)
    return { ok: true, message: msg }
  }
}

export const getOnboardingInfo = async token => {
  try {
    return await api('/api/onboarding/info?token=' + encodeURIComponent(token))
  } catch {
    return { name: 'Nuovo Atleta', trainerName: 'Coach Marco' }
  }
}
