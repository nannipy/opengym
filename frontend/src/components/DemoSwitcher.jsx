import { useStore } from '../store/useStore.js'
import { useNavigate } from 'react-router-dom'
import { useUI } from '../store/useUI.js'

export default function DemoSwitcher() {
  const user = useStore(s => s.user)
  const setUser = useStore(s => s.setUser)
  const isTrainer = useStore(s => s.isTrainer())
  const nav = useNavigate()
  const toast = useUI(s => s.toast)

  if (!user) return null

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
        background: 'rgba(28, 28, 30, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: 20,
        padding: '3px 10px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 12,
        fontWeight: 600,
        boxShadow: '0 4px 14px rgba(0,0,0,0.35)'
      }}
    >
      <span style={{ color: isTrainer ? 'var(--acc)' : '#38bdf8' }}>
        {isTrainer ? '🏋️ PT' : '🏃 Cliente'}
      </span>
      <button
        onClick={isTrainer ? switchToClient : switchToTrainer}
        style={{
          background: 'rgba(255,255,255,0.08)',
          border: 'none',
          color: 'var(--label-1)',
          borderRadius: 12,
          padding: '2px 8px',
          fontSize: 11,
          cursor: 'pointer',
          fontWeight: 600
        }}
      >
        {isTrainer ? 'Vai a Cliente ↗' : 'Vai a PT ↗'}
      </button>
    </div>
  )
}
