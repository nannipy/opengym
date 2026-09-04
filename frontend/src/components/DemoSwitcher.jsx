import { useStore } from '../store/useStore.js'
import { useNavigate } from 'react-router-dom'
import { useUI } from '../store/useUI.js'

export default function DemoSwitcher() {
  const user = useStore(s => s.user)
  const setUser = useStore(s => s.setUser)
  const isTrainer = useStore(s => s.isTrainer())
  const S = useStore(s => s.S)
  const update = useStore(s => s.update)
  const nav = useNavigate()
  const toast = useUI(s => s.toast)

  if (!user) return null

  const isLight = S.theme === 'light'

  const toggleTheme = () => {
    const next = isLight ? 'dark' : 'light'
    update(s => { s.theme = next })
    toast(next === 'light' ? 'Tema Chiaro attivato ☀️' : 'Tema Scuro attivato 🌙')
  }

  const switchToTrainer = () => {
    setUser({ id: 'trainer-demo', name: 'Coach Marco (PT)', role: 'trainer', admin: true })
    nav('/trainer/clients')
    toast('Passato a: Vista Personal Trainer')
  }

  const switchToClient = () => {
    setUser({ id: 'client-marco', name: 'Marco Rossi (Cliente)', role: 'client', trainerName: 'Coach Marco' })
    nav('/home')
    toast('Passato a: Vista Cliente')
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 8,
        right: 10,
        zIndex: 9999,
        background: 'var(--surface)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--sep)',
        borderRadius: 20,
        padding: '3px 8px',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        fontWeight: 600,
        boxShadow: '0 4px 14px rgba(0,0,0,0.18)'
      }}
    >
      <span style={{ color: isTrainer ? 'var(--acc)' : 'var(--blue)', display: 'flex', alignItems: 'center', gap: 3 }}>
        {isTrainer ? '🏋️ PT' : '🏃 Cliente'}
      </span>
      <button
        onClick={isTrainer ? switchToClient : switchToTrainer}
        title={isTrainer ? 'Passa alla vista Cliente' : 'Passa alla vista Personal Trainer'}
        style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--sep-op)',
          color: 'var(--label)',
          borderRadius: 12,
          padding: '3px 7px',
          fontSize: 11,
          cursor: 'pointer',
          fontWeight: 600
        }}
      >
        {isTrainer ? 'Cliente ↗' : 'PT ↗'}
      </button>

      <div style={{ width: 1, height: 14, background: 'var(--sep)' }} />

      {/* Light / Dark Mode toggle */}
      <button
        onClick={toggleTheme}
        title={isLight ? 'Attiva Tema Scuro' : 'Attiva Tema Chiaro'}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '2px 4px',
          fontSize: 14,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {isLight ? '🌙' : '☀️'}
      </button>
    </div>
  )
}
