import { useState } from 'react'
import { useStore } from '../store/useStore.js'
import { useNavigate } from 'react-router-dom'
import { useUI } from '../store/useUI.js'
import { isSupabaseConfigured } from '../lib/supabase.js'
import Logo from './Logo.jsx'

export default function DemoSwitcher() {
  const user = useStore(s => s.user)
  const setUser = useStore(s => s.setUser)
  const isTrainer = useStore(s => s.isTrainer())
  const S = useStore(s => s.S)
  const update = useStore(s => s.update)
  const nav = useNavigate()
  const toast = useUI(s => s.toast)
  const [expanded, setExpanded] = useState(false)

  if (!user) return null

  const isLight = S.theme === 'light'
  const isCloud = isSupabaseConfigured()

  const toggleTheme = (e) => {
    e.stopPropagation()
    const next = isLight ? 'dark' : 'light'
    update(s => { s.theme = next })
    toast(next === 'light' ? 'Tema Chiaro attivo ☀️' : 'Tema Scuro attivo 🌙')
  }

  const switchToTrainer = (e) => {
    e.stopPropagation()
    setUser({ id: 'trainer-demo', name: 'Coach Marco (PT)', role: 'trainer', admin: true })
    nav('/trainer/clients')
    toast('Passato alla vista: Personal Trainer 🏋️')
  }

  const switchToClient = (e) => {
    e.stopPropagation()
    setUser({ id: 'client-marco', name: 'Marco Rossi (Cliente)', role: 'client', trainerName: 'Coach Marco' })
    nav('/home')
    toast('Passato alla vista: Cliente 🏃')
  }

  return (
    <div
      className="demo-floating-island"
      style={{
        position: 'fixed',
        top: 10,
        right: 12,
        zIndex: 9999,
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        transformOrigin: 'top right'
      }}
    >
      <div
        style={{
          background: isLight ? 'rgba(255, 255, 255, 0.88)' : 'rgba(18, 20, 26, 0.82)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: isLight ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 999,
          padding: '4px 6px 4px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: isLight
            ? '0 6px 24px -4px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.04)'
            : '0 8px 32px -4px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.06)',
          cursor: 'pointer'
        }}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Role Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            color: isTrainer ? 'var(--acc)' : 'var(--blue)'
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: isCloud ? 'var(--acc)' : 'var(--orange)',
              boxShadow: isCloud ? '0 0 8px var(--acc)' : 'none',
              animation: 'pulseGlow 2s infinite'
            }}
          />
          <span>{isTrainer ? 'PT' : 'Cliente'}</span>
        </div>

        {/* Switch Profile Toggle */}
        <div
          style={{
            display: 'inline-flex',
            background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)',
            borderRadius: 999,
            padding: 2,
            border: isLight ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)'
          }}
        >
          <button
            onClick={isTrainer ? switchToClient : switchToTrainer}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--label)',
              padding: '3px 9px',
              fontSize: 11,
              fontWeight: 600,
              borderRadius: 999,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.2s var(--spring)'
            }}
          >
            <span>Passa a {isTrainer ? 'Cliente' : 'PT'}</span>
            <span style={{ fontSize: 10, opacity: 0.7 }}>⇄</span>
          </button>
        </div>

        {/* Theme Button */}
        <button
          onClick={toggleTheme}
          title={isLight ? 'Attiva tema scuro' : 'Attiva tema chiaro'}
          style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)',
            border: 'none',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s var(--spring)',
            color: 'var(--label)'
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.85)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {isLight ? '🌙' : '☀️'}
        </button>
      </div>

      {/* Expanded Cloud Sync status info */}
      {expanded && (
        <div
          style={{
            marginTop: 8,
            background: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(20, 22, 28, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--sep-op)',
            borderRadius: 16,
            padding: '10px 14px',
            fontSize: 11,
            color: 'var(--label-2)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
            animation: 'slideDownFade 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            minWidth: 190
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontWeight: 700, color: 'var(--label)' }}>Stato Sistema</span>
            <span
              style={{
                fontSize: 10,
                color: isCloud ? 'var(--acc)' : 'var(--orange)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              ● {isCloud ? 'Cloud Live' : 'Locale'}
            </span>
          </div>
          <div style={{ lineHeight: 1.4 }}>
            {isCloud ? 'Sincronizzazione Supabase Realtime attiva su entrambi i telefoni.' : 'Modalità demo locale.'}
          </div>
        </div>
      )}
    </div>
  )
}
