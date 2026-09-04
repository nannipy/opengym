import { useStore } from '../store/useStore.js'
import { useUI } from '../store/useUI.js'
import { webauthnOK, passkeyLogin, passkeyRegister, passkeyRegisterWithToken, getOnboardingInfo, api, BIO } from '../lib/api.js'
import { hasData } from '../store/useStore.js'
import { t } from '../lib/i18n.js'
import { DEMO, REPO } from '../lib/demo.js'
import { useState, useRef, useEffect } from 'react'
import Icon from '../components/Icon.jsx'
import Logo from '../components/Logo.jsx'
import { Button } from '../components/ui.jsx'

function parseOnboardToken() {
  // Check hash: #onboard=tkn_... or #/onboard=tkn_...
  const h = window.location.hash || ''
  const m = h.match(/onboard=([a-zA-Z0-9_-]+)/)
  if (m) return m[1]
  // Check search query param ?onboard=tkn_... or ?token=tkn_...
  const search = new URLSearchParams(window.location.search)
  return search.get('onboard') || search.get('token') || null
}

function RegisterSheet({ close }) {
  const { setUser, pushState, pullState } = useStore()
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [inviteOnly, setInviteOnly] = useState(false)
  const ref = useRef(null)
  useEffect(() => { setTimeout(() => ref.current?.focus(), 250) }, [])
  useEffect(() => { api('/api/config').then(c => setInviteOnly(!!c.invite_only)).catch(() => {}) }, [])
  const go = async () => {
    const n = name.trim()
    if (!n) { useUI.getState().toast(t('Enter a name')); return }
    if (inviteOnly && !code.trim()) { useUI.getState().toast(t('An invite code is required')); return }
    try {
      const u = await passkeyRegister(n, code.trim())
      setUser(u); close()
      if (hasData(useStore.getState().S)) { await pushState(); useUI.getState().toast(t('Profile created — data from this device moved into it')) }
      else { await pullState(); useUI.getState().toast(t('Welcome, {0}', u.name)) }
    } catch (e) { if (e.name !== 'NotAllowedError' && e.name !== 'AbortError') useUI.getState().toast(e.message || t('Registration failed')) }
  }
  return <>
    <h3>{t('Create your profile')}</h3>
    <div className="muted small" style={{ marginBottom: 14 }}>{t('Pick a name, then confirm with {0}. The passkey is saved in your device — no password needed.', BIO)}</div>
    <input ref={ref} className="input" placeholder={t('Your name')} maxLength={40} value={name} onChange={e => setName(e.target.value)} />
    {inviteOnly && <>
      <div style={{ height: 10 }} />
      <input className="input" placeholder={t('Invite code')} maxLength={40} value={code}
        onChange={e => setCode(e.target.value.toUpperCase())} style={{ letterSpacing: '.14em', fontWeight: 600, textAlign: 'center' }} />
      <div className="dim small" style={{ marginTop: 6 }}>{t('This app is invite-only — enter the code you were given.')}</div>
    </>}
    <div style={{ height: 12 }} />
    <Button variant="primary" onClick={go}>{t('Create passkey')}</Button>
  </>
}

export default function Login() {
  const { setUser, pullState, setGuest } = useStore()
  const [onboardToken, setOnboardToken] = useState(() => parseOnboardToken())
  const [onboardInfo, setOnboardInfo] = useState(null)
  const [loadingOnboard, setLoadingOnboard] = useState(false)
  const [registering, setRegistering] = useState(false)

  useEffect(() => {
    if (!onboardToken) return
    setLoadingOnboard(true)
    getOnboardingInfo(onboardToken)
      .then(info => {
        setOnboardInfo(info)
        setLoadingOnboard(false)
      })
      .catch(e => {
        useUI.getState().toast(t('Invito non valido o scaduto'))
        setLoadingOnboard(false)
        setOnboardToken(null)
      })
  }, [onboardToken])

  const activateOnboard = async () => {
    if (!onboardToken) return
    setRegistering(true)
    try {
      const u = await passkeyRegisterWithToken(onboardToken, onboardInfo?.name)
      setUser(u)
      // Clean up hash/url to avoid re-triggering onboarding on page refresh
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname)
      }
      await pullState()
      useUI.getState().toast(t('Benvenuto in openGym, {0}!', u.name))
    } catch (e) {
      if (e.name !== 'NotAllowedError' && e.name !== 'AbortError') {
        useUI.getState().toast(e.message || t('Attivazione passkey fallita'))
      }
    } finally {
      setRegistering(false)
    }
  }

  const signIn = async () => {
    try { const u = await passkeyLogin(); setUser(u); await pullState(); useUI.getState().toast(t('Welcome back, {0}', u.name)) }
    catch (e) { if (e.name !== 'NotAllowedError' && e.name !== 'AbortError') useUI.getState().toast(e.message || t('Sign-in failed')) }
  }
  const S = useStore(s => s.S)
  const update = useStore(s => s.update)
  const isLight = S.theme === 'light'
  const toggleTheme = () => {
    update(s => { s.theme = isLight ? 'dark' : 'light' })
  }

  const head = <>
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: -20, paddingRight: 4 }}>
      <button
        onClick={toggleTheme}
        style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--sep-op)',
          borderRadius: 16,
          padding: '4px 10px',
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--label-2)',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5
        }}
      >
        <span>{isLight ? '🌙 Tema Scuro' : '☀️ Tema Chiaro'}</span>
      </button>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '24px 0 12px' }}>
      <Logo size="xl" showText={true} badge="PRO" />
      <div style={{ fontSize: 13, color: 'var(--label-2)', marginTop: 8, letterSpacing: '0.02em' }}>
        Personal Trainer & Athlete Platform
      </div>
    </div>
  </>
  const wrap = { display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '78vh', textAlign: 'center' }

  // Onboarding screen
  if (onboardToken) {
    return (
      <div className="narrow" style={wrap}>
        {head}
        <div className="card" style={{ textAlign: 'center', marginTop: 18, padding: '24px 18px', borderColor: 'var(--acc)' }}>
          <div style={{ fontSize: 40, color: 'var(--acc)', marginBottom: 12 }}>
            <Icon name="sparkles" />
          </div>
          <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 700 }}>
            {onboardInfo?.name ? t('Benvenuto, {0}!', onboardInfo.name) : t('Benvenuto!')}
          </h2>
          <div className="muted" style={{ marginBottom: 20, fontSize: 15, lineHeight: 1.5 }}>
            {loadingOnboard
              ? t('Verifica invito in corso…')
              : t('Il tuo Personal Trainer {0} ha preparato il tuo profilo.', onboardInfo?.trainerName ? `(${onboardInfo.trainerName})` : '')}
          </div>
          <div className="small" style={{ marginBottom: 20, color: 'var(--label-2)' }}>
            {t('Tocca per attivare il tuo accesso con {0}. Non dovrai ricordare alcuna password.', BIO)}
          </div>
          {webauthnOK() ? (
            <Button
              variant="primary"
              icon="key"
              disabled={loadingOnboard || registering}
              onClick={activateOnboard}
            >
              {registering ? t('Attivazione…') : t('Attiva accesso con Passkey')}
            </Button>
          ) : (
            <div className="card small muted" style={{ textAlign: 'left' }}>
              {t("Questo browser non supporta le passkey WebAuthn.")}
            </div>
          )}
          <div style={{ height: 12 }} />
          <Button variant="ghost" className="dim" onClick={() => setOnboardToken(null)}>
            {t('Torna al login normale')}
          </Button>
        </div>
      </div>
    )
  }

  const loginAsTrainerDemo = () => {
    setUser({ id: 'trainer-demo', name: 'Coach Marco (PT)', role: 'trainer', admin: true })
    useUI.getState().toast('Accesso effettuato come Personal Trainer')
  }

  const loginAsClientDemo = () => {
    setUser({ id: 'client-marco', name: 'Marco Rossi (Cliente)', role: 'client', trainerName: 'Coach Marco' })
    useUI.getState().toast('Accesso effettuato come Cliente')
  }

  // Demo build or static hosting
  return (
    <div className="narrow" style={wrap}>
      {head}
      <div className="muted" style={{ marginBottom: 24 }}>Piattaforma Personal Trainer & Clienti</div>

      {/* Two dedicated entry points for PT and Cliente */}
      <div className="card" style={{ padding: '18px 16px', marginBottom: 20, textAlign: 'left', borderColor: 'var(--acc)' }}>
        <div style={{ fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--acc)', marginBottom: 12 }}>
          Accesso Rapido Demo
        </div>
        <Button
          variant="primary"
          icon="person"
          onClick={loginAsTrainerDemo}
          style={{ width: '100%', marginBottom: 10, justifyContent: 'center' }}
        >
          🏋️‍♂️ Accedi come Personal Trainer
        </Button>
        <Button
          variant="secondary"
          icon="dumbbell"
          onClick={loginAsClientDemo}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          🏃‍♂️ Accedi come Cliente
        </Button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0 16px', opacity: 0.4 }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <span style={{ margin: '0 10px', fontSize: 12 }}>oppure</span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      {webauthnOK() ? <>
        <Button icon="person" onClick={signIn}>{t('Sign in with passkey')}</Button>
        <div style={{ height: 10 }} />
        <Button icon="sparkles" onClick={() => useUI.getState().openSheet(close => <RegisterSheet close={close} />)}>{t('Create new profile')}</Button>
        <div style={{ height: 10 }} />
      </> : <div className="card small muted" style={{ textAlign: 'left' }}>{t("This browser doesn't support passkeys — you can still use openGym locally on this device.")}</div>}
      <Button variant="ghost" className="dim" onClick={() => setGuest(true)}>{t('Continue without account')}</Button>
      <div className="dim small" style={{ marginTop: 20, lineHeight: 1.5 }}>
        Accesso immediato senza password con Passkey o profili demo preconfigurati.
      </div>
    </div>
  )
}
