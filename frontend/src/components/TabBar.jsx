import { useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore.js'
import { effectiveRoutine } from '../lib/history.js'
import { todayISO } from '../lib/format.js'
import { t } from '../lib/i18n.js'
import Icon from './Icon.jsx'

export default function TabBar({ onStart }) {
  const nav = useNavigate()
  const loc = useLocation()
  const S = useStore(s => s.S)
  const user = useStore(s => s.user)
  const isGuest = useStore(s => s.isGuest())
  const isTrainer = useStore(s => s.isTrainer())
  if (!user && !isGuest) return null
  const cur = loc.pathname.split('/')[1] || (isTrainer ? 'trainer' : 'home')
  const on = k => cur === k || (cur === 'history' && k === 'stats') || (cur === 'settings' && (k === 'home' || k === 'settings'))

  const startWorkout = () => {
    if (!S.active) {
      const r = effectiveRoutine(S, todayISO())
      if (r && r.ex.length) { onStart(r.id); return }
    }
    nav('/workout')
  }
  const Tab = ({ k, icon, to, label }) => (
    <button className={on(k) ? 'on' : ''} onClick={() => nav(to)}>
      <Icon name={icon} /><span>{label}</span>
    </button>
  )

  if (isTrainer) {
    return (
      <nav id="tabbar">
        <Tab k="trainer" icon="person" to="/trainer/clients" label="Clienti" />
        <Tab k="templates" icon="clipboard" to="/trainer/templates" label="Template" />
        <Tab k="chat" icon="message" to="/trainer/chat" label="Chat" />
        <Tab k="settings" icon="gear" to="/settings" label="Impostazioni" />
      </nav>
    )
  }

  return (
    <nav id="tabbar">
      <Tab k="home" icon="house" to="/home" label={t('Home')} />
      <Tab k="plan" icon="calendar" to="/plan" label={t('Plan')} />
      <button className={'start' + (S.active ? ' rec' : '')} onClick={startWorkout}>
        <span className="cir"><Icon name={S.active ? 'play' : 'dumbbell'} /></span>
        <span>{S.active ? t('Resume') : t('Start')}</span>
      </button>
      <Tab k="stats" icon="chart" to="/stats" label={t('Stats')} />
      <Tab k="library" icon="list" to="/library" label={t('Exercises')} />
    </nav>
  )
}
