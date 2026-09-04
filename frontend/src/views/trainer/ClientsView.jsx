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

  const [selectedClientId, setSelectedClientId] = useState(null)
  const [chatClient, setChatClient] = useState(null)

  useEffect(() => {
    loadClients()
    const iv = setInterval(loadClients, 12000)
    return () => clearInterval(iv)
  }, [])

  const openNewClientModal = () => {
    openSheet(close => <NewClientSheet close={close} onCreated={() => loadClients()} />)
  }

  if (selectedClientId) {
    return (
      <ClientDetailView
        clientId={selectedClientId}
        onBack={() => setSelectedClientId(null)}
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

  return (
    <div className="narrow">
      {/* Brand Header */}
      <div style={{ marginBottom: 20, paddingTop: 4 }}>
        <div className="row between" style={{ alignItems: 'center', marginBottom: 10 }}>
          <Logo size="md" badge="PT PRO" />
          <Button variant="primary" size="sm" icon="plus" onClick={openNewClientModal}>
            Nuovo Atleta
          </Button>
        </div>
        <div className="sub" style={{ fontSize: 13, color: 'var(--label-2)', letterSpacing: '-0.01em' }}>
          {clients ? `${clients.length} atleti seguiti · ${totalWorkouts} allenamenti completati` : 'Caricamento atleti…'}
        </div>
      </div>

      {/* Tiles riassuntive del Trainer */}
      <div className="tiles" style={{ marginBottom: 18 }}>
        <div className="tile" style={{ border: '1px solid var(--glass-border)', transition: 'transform 0.2s var(--spring)' }}>
          <div className="l"><Icon name="person" /> Atleti Totali</div>
          <div className="v">{clients ? clients.length : '—'}</div>
        </div>
        <div className="tile" style={{ border: '1px solid var(--glass-border)', transition: 'transform 0.2s var(--spring)' }}>
          <div className="l"><Icon name="play" /> In Allenamento</div>
          <div className="v" style={{ color: liveClients.length ? 'var(--acc)' : undefined, display: 'flex', alignItems: 'center', gap: 6 }}>
            {liveClients.length > 0 && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 8px var(--green)', animation: 'pulseGlow 2s infinite' }} />}
            {liveClients.length}
          </div>
        </div>
      </div>

      {/* Banner Allenamento in Corso (Live) */}
      {liveClients.length > 0 && (
        <div
          className="card"
          style={{
            borderColor: 'var(--acc)',
            background: 'color-mix(in srgb, var(--acc) 6%, var(--surface))',
            marginBottom: 18,
            boxShadow: '0 4px 20px -2px rgba(163, 230, 53, 0.2)'
          }}
        >
          <h2 className="row" style={{ margin: '0 0 10px', gap: 8, color: 'var(--acc)', fontWeight: 700, fontSize: 14 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 8px var(--green)', animation: 'pulseGlow 1.5s infinite' }} />
            In Allenamento Adesso
          </h2>
          <div className="list" style={{ gap: 8 }}>
            {liveClients.map(c => (
              <div
                key={c.id}
                className="item"
                style={{ padding: '10px 14px', borderRadius: 'var(--r-sm)', background: 'var(--surface)' }}
                onClick={() => setSelectedClientId(c.id)}
              >
                <div className="grow">
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{c.name}</div>
                  <div className="dim small" style={{ marginTop: 2, color: 'var(--acc)' }}>
                    {c.live.name} · {c.live.setsDone}/{c.live.setsTotal} serie completate
                  </div>
                </div>
                <span className="tag acc" style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px' }}>LIVE</span>
                <Icon name="chevronRight" className="chev" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Elenco Principale Clienti */}
      <div className="row between" style={{ marginBottom: 10, alignItems: 'center' }}>
        <h4 className="sec" style={{ margin: 0, fontWeight: 600, fontSize: 14, color: 'var(--label)' }}>I Tuoi Atleti</h4>
        <button
          className="iconbtn"
          onClick={() => loadClients()}
          aria-label="Ricarica"
          style={{ width: 28, height: 28, fontSize: 14 }}
        >
          <Icon name="reset" />
        </button>
      </div>

      {clients && clients.length > 0 ? (
        <div className="list" style={{ gap: 10 }}>
          {clients.map(c => {
            const initials = getInitials(c.name)
            return (
              <div
                key={c.id}
                className="item"
                onClick={() => setSelectedClientId(c.id)}
                style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--r-card)',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--surface)',
                  transition: 'all 0.2s var(--spring)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14
                }}
              >
                {/* Avatar Initial Circle */}
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
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  {initials}
                </div>

                <div className="grow" style={{ minWidth: 0 }}>
                  <div className="tt" style={{ fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.name}
                    </span>
                    {c.live && (
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: 'var(--green)',
                          boxShadow: '0 0 8px var(--green)',
                          animation: 'pulseGlow 2s infinite',
                          display: 'inline-block',
                          flexShrink: 0
                        }}
                        title="In allenamento adesso"
                      />
                    )}
                    {c.disabled && <span className="tag" style={{ color: 'var(--red)', fontSize: 10 }}>Disattivato</span>}
                  </div>

                  <div className="ss" style={{ fontSize: 13, color: 'var(--label-2)', marginTop: 3 }}>
                    {c.live ? (
                      <span style={{ color: 'var(--acc)', fontWeight: 600 }}>In allenamento: {c.live.name}</span>
                    ) : c.lastWorkout ? (
                      `Ultimo: ${c.lastWorkout.name || c.lastWorkout.title} (${fmtDate(c.lastWorkout.d || c.lastWorkout.date, true)})`
                    ) : (
                      'Nessun workout recente'
                    )}
                  </div>

                  {/* Chips Metric */}
                  <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: 11,
                        background: 'var(--surface-2)',
                        padding: '2px 7px',
                        borderRadius: 6,
                        color: 'var(--label-2)',
                        fontWeight: 600
                      }}
                    >
                      🏋️ {c.workoutsCount || 0} sessioni
                    </span>
                    {c.totalVolume > 0 && (
                      <span
                        style={{
                          fontSize: 11,
                          background: 'var(--surface-2)',
                          padding: '2px 7px',
                          borderRadius: 6,
                          color: 'var(--label-2)',
                          fontWeight: 600
                        }}
                      >
                        📊 {fmtVol(c.totalVolume, 'kg')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Chat Icon */}
                <button
                  className="iconbtn"
                  style={{
                    width: 38,
                    height: 38,
                    color: 'var(--acc)',
                    background: 'color-mix(in srgb, var(--acc) 12%, transparent)',
                    borderRadius: '50%',
                    flexShrink: 0
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setChatClient(c)
                  }}
                  title={`Chat con ${c.name}`}
                >
                  <Icon name="chat" />
                </button>

                <Icon name="chevronRight" className="chev" style={{ opacity: 0.5 }} />
              </div>
            )
          })}
        </div>
      ) : loading ? (
        <div className="empty" style={{ padding: '36px 0' }}>Caricamento atleti in corso…</div>
      ) : (
        <div className="card empty" style={{ textAlign: 'center', padding: '36px 20px' }}>
          <div className="ico" style={{ fontSize: 36, color: 'var(--acc)', marginBottom: 12 }}><Icon name="person" /></div>
          <h3 style={{ margin: '0 0 6px', fontSize: 18 }}>Nessun atleta registrato</h3>
          <p className="dim small" style={{ margin: '0 0 18px', maxWidth: 300 }}>
            Crea il tuo primo atleta e condividi il link di onboarding istantaneo.
          </p>
          <Button variant="primary" icon="plus" onClick={openNewClientModal}>
            Aggiungi Primo Atleta
          </Button>
        </div>
      )}
    </div>
  )
}
