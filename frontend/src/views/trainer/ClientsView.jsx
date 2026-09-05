import { useState, useEffect } from 'react'
import { useStore } from '../../store/useStore.js'
import { useUI } from '../../store/useUI.js'
import { fmtDate, fmtVol } from '../../lib/format.js'
import { Button } from '../../components/ui.jsx'
import Icon from '../../components/Icon.jsx'
import Logo from '../../components/Logo.jsx'
import NewClientSheet from './NewClientSheet.jsx'
import ClientDetailView from './ClientDetailView.jsx'
import ChatView from './ChatView.jsx'

function getInitials(name) {
  if (!name) return 'AT'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function ClientsView() {
  const clients = useStore(s => s.clients)
  const loading = useStore(s => s.loadingClients)
  const loadClients = useStore(s => s.loadClients)
  const openSheet = useUI(s => s.openSheet)
  const toast = useUI(s => s.toast)

  const [selectedClientMeta, setSelectedClientMeta] = useState(null) // { id, tab }
  const [chatClient, setChatClient] = useState(null)
  const [search, setSearch] = useState('')
  const [filterTab, setFilterTab] = useState('all') // 'all' | 'live'

  useEffect(() => {
    loadClients()
    const iv = setInterval(loadClients, 12000)
    return () => clearInterval(iv)
  }, [])

  const openNewClientModal = () => {
    openSheet(close => <NewClientSheet close={close} onCreated={() => loadClients()} />)
  }

  if (selectedClientMeta) {
    return (
      <ClientDetailView
        clientId={selectedClientMeta.id}
        initialTab={selectedClientMeta.tab || 'plan'}
        onBack={() => setSelectedClientMeta(null)}
      />
    )
  }

  if (chatClient) {
    return (
      <div className="narrow">
        <ChatView client={chatClient} onClose={() => setChatClient(null)} />
      </div>
    )
  }

  const liveClients = (clients || []).filter(c => c.live)
  const totalWorkouts = (clients || []).reduce((acc, c) => acc + (c.workoutsCount || 0), 0)

  // Filter clients
  const filteredClients = (clients || []).filter(c => {
    if (search.trim()) {
      const q = search.toLowerCase()
      if (!c.name.toLowerCase().includes(q)) return false
    }
    if (filterTab === 'live') {
      return !!c.live
    }
    return true
  })

  return (
    <div className="narrow">
      {/* Brand Header */}
      <div style={{ marginBottom: 18, paddingTop: 4 }}>
        <div className="row between" style={{ alignItems: 'center', marginBottom: 8 }}>
          <Logo size="md" badge="PT PRO" />
          <Button variant="primary" size="sm" icon="plus" onClick={openNewClientModal}>
            Nuovo Atleta
          </Button>
        </div>
        <div className="sub" style={{ fontSize: 13, color: 'var(--label-2)', letterSpacing: '-0.01em' }}>
          {clients ? `${clients.length} atleti seguiti · ${totalWorkouts} sessioni registrate` : 'Caricamento atleti…'}
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="tiles" style={{ marginBottom: 16 }}>
        <div className="tile" style={{ border: '1px solid var(--glass-border)' }}>
          <div className="l"><Icon name="person" /> Atleti Totali</div>
          <div className="v">{clients ? clients.length : '—'}</div>
        </div>
        <div className="tile" style={{ border: '1px solid var(--glass-border)' }}>
          <div className="l"><Icon name="play" /> In Allenamento</div>
          <div className="v" style={{ color: liveClients.length ? 'var(--acc)' : undefined, display: 'flex', alignItems: 'center', gap: 6 }}>
            {liveClients.length > 0 && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 8px var(--green)', animation: 'pulseGlow 2s infinite' }} />}
            {liveClients.length}
          </div>
        </div>
      </div>

      {/* Live in-gym banner */}
      {liveClients.length > 0 && (
        <div
          className="card"
          style={{
            borderColor: 'var(--acc)',
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--acc) 10%, var(--surface)), var(--surface))',
            marginBottom: 16,
            boxShadow: 'var(--glass-glow)'
          }}
        >
          <div className="row between" style={{ marginBottom: 10, alignItems: 'center' }}>
            <h2 className="row" style={{ margin: 0, gap: 7, color: 'var(--acc)', fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 8px var(--green)', animation: 'pulseGlow 1.5s infinite' }} />
              In Palestra Ora ({liveClients.length})
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {liveClients.map(c => (
              <div
                key={c.id}
                className="item interactive"
                style={{ padding: '10px 12px', borderRadius: 'var(--r-sm)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                onClick={() => setSelectedClientMeta({ id: c.id, tab: 'workouts' })}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--acc)', marginTop: 2 }}>
                    🏋️ {c.live.name} · {c.live.setsDone}/{c.live.setsTotal} serie
                  </div>
                </div>
                <div className="row" style={{ gap: 6 }}>
                  <button
                    className="iconbtn"
                    style={{ width: 32, height: 32, color: 'var(--acc)' }}
                    onClick={(e) => { e.stopPropagation(); setChatClient(c) }}
                    title="Scrivi all'atleta"
                  >
                    <Icon name="chat" />
                  </button>
                  <Icon name="chevronRight" className="chev" style={{ fontSize: 14 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ position: 'relative', marginBottom: 10 }}>
          <input
            type="text"
            placeholder="🔍 Cerca atleta per nome..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--r-sm)',
              background: 'var(--surface)',
              border: '1px solid var(--glass-border)',
              color: 'var(--label)',
              fontSize: 14
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--label-3)',
                fontSize: 13,
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className={'chip' + (filterTab === 'all' ? ' on' : '')}
            onClick={() => setFilterTab('all')}
            style={{ fontSize: 12, padding: '5px 12px' }}
          >
            Tutti ({clients ? clients.length : 0})
          </button>
          <button
            className={'chip' + (filterTab === 'live' ? ' on' : '')}
            onClick={() => setFilterTab('live')}
            style={{ fontSize: 12, padding: '5px 12px' }}
          >
            🔥 In Palestra ({liveClients.length})
          </button>
        </div>
      </div>

      {/* Athlete Cards List */}
      {filteredClients.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredClients.map(c => {
            const initials = getInitials(c.name)
            return (
              <div
                key={c.id}
                className="card interactive"
                onClick={() => setSelectedClientMeta({ id: c.id, tab: 'plan' })}
                style={{
                  padding: '14px 16px',
                  marginBottom: 0,
                  border: '1px solid var(--glass-border)',
                  background: 'var(--surface)',
                  borderRadius: 'var(--r-card)'
                }}
              >
                {/* Header row of Card: Avatar + Name + Live tag */}
                <div className="row between" style={{ alignItems: 'flex-start', marginBottom: 8 }}>
                  <div className="row" style={{ gap: 12, alignItems: 'center' }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(163, 230, 53, 0.22), rgba(34, 197, 94, 0.08))',
                        border: '1.5px solid color-mix(in srgb, var(--acc) 40%, transparent)',
                        color: 'var(--acc)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 15,
                        flexShrink: 0
                      }}
                    >
                      {initials}
                    </div>

                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--label)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {c.name}
                        {c.live && (
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: 'var(--green)',
                              boxShadow: '0 0 8px var(--green)',
                              animation: 'pulseGlow 1.5s infinite',
                              display: 'inline-block'
                            }}
                            title="In allenamento adesso"
                          />
                        )}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--label-2)', marginTop: 2 }}>
                        {c.live ? (
                          <span style={{ color: 'var(--acc)', fontWeight: 600 }}>In allenamento: {c.live.name}</span>
                        ) : c.lastWorkout ? (
                          `Ultimo: ${c.lastWorkout.name || c.lastWorkout.title} (${fmtDate(c.lastWorkout.d || c.lastWorkout.date, true)})`
                        ) : (
                          'Nessun workout recente'
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="tag" style={{ fontSize: 11 }}>
                    {c.workoutsCount || 0} workout
                  </span>
                </div>

                {/* Direct Action Buttons on Card */}
                <div
                  className="row"
                  style={{
                    gap: 8,
                    marginTop: 10,
                    paddingTop: 10,
                    borderTop: '1px solid var(--sep-op)'
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    onClick={() => setSelectedClientMeta({ id: c.id, tab: 'plan' })}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 5,
                      padding: '8px 10px',
                      borderRadius: 'var(--r-sm)',
                      background: 'var(--surface-2)',
                      color: 'var(--label)',
                      fontSize: 12,
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <Icon name="clipboard" style={{ fontSize: 13 }} />
                    Scheda
                  </button>

                  <button
                    onClick={() => setChatClient(c)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 5,
                      padding: '8px 10px',
                      borderRadius: 'var(--r-sm)',
                      background: 'var(--acc-soft)',
                      color: 'var(--acc)',
                      fontSize: 12,
                      fontWeight: 600,
                      border: '1px solid var(--acc-line)',
                      cursor: 'pointer'
                    }}
                  >
                    <Icon name="chat" style={{ fontSize: 13 }} />
                    Chat
                  </button>

                  <button
                    onClick={() => setSelectedClientMeta({ id: c.id, tab: 'workouts' })}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 5,
                      padding: '8px 10px',
                      borderRadius: 'var(--r-sm)',
                      background: 'var(--surface-2)',
                      color: 'var(--label-2)',
                      fontSize: 12,
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <Icon name="history" style={{ fontSize: 13 }} />
                    Storico
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : loading ? (
        <div className="empty" style={{ padding: '36px 0' }}>Caricamento atleti in corso…</div>
      ) : (
        <div className="card empty" style={{ textAlign: 'center', padding: '36px 20px' }}>
          <div className="ico" style={{ fontSize: 36, color: 'var(--acc)', marginBottom: 12 }}><Icon name="person" /></div>
          <h3 style={{ margin: '0 0 6px', fontSize: 18 }}>Nessun atleta trovato</h3>
          <p className="dim small" style={{ margin: '0 0 18px', maxWidth: 300 }}>
            {search ? 'Nessun risultato corrisponde alla ricerca.' : 'Crea il tuo primo atleta e condividi il link di onboarding.'}
          </p>
          <Button variant="primary" icon="plus" onClick={openNewClientModal}>
            Aggiungi Atleta
          </Button>
        </div>
      )}
    </div>
  )
}
