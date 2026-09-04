import { useState, useEffect } from 'react'
import { useStore } from '../../store/useStore.js'
import { useUI } from '../../store/useUI.js'
import { fmtDate, fmtVol } from '../../lib/format.js'
import { Button } from '../../components/ui.jsx'
import Icon from '../../components/Icon.jsx'
import NewClientSheet from './NewClientSheet.jsx'
import ClientDetailView from './ClientDetailView.jsx'
import ChatView from './ChatView.jsx'

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
      <div className="hdr">
        <div>
          <h1>Clienti</h1>
          <div className="sub">
            {clients ? `${clients.length} clienti seguiti · ${totalWorkouts} allenamenti totali` : 'Caricamento…'}
          </div>
        </div>
        <Button variant="primary" size="sm" icon="plus" onClick={openNewClientModal}>
          Nuovo Cliente
        </Button>
      </div>

      {/* Tiles riassuntive del Trainer */}
      <div className="tiles" style={{ marginBottom: 16 }}>
        <div className="tile">
          <div className="l"><Icon name="person" /> Clienti Totali</div>
          <div className="v">{clients ? clients.length : '—'}</div>
        </div>
        <div className="tile">
          <div className="l"><Icon name="play" /> In Allenamento</div>
          <div className="v" style={{ color: liveClients.length ? 'var(--acc)' : undefined }}>
            {liveClients.length}
          </div>
        </div>
      </div>

      {/* Banner Allenamento in Corso (Live) */}
      {liveClients.length > 0 && (
        <div className="card" style={{ borderColor: 'var(--acc)', marginBottom: 16 }}>
          <h2 className="row" style={{ margin: '0 0 8px', gap: 6, color: 'var(--acc)', fontWeight: 600 }}>
            <Icon name="dot" style={{ fontSize: 10, color: 'var(--green)' }} />
            Clienti che si stanno allenando adesso
          </h2>
          <div className="list" style={{ gap: 6 }}>
            {liveClients.map(c => (
              <div
                key={c.id}
                className="item"
                style={{ padding: '8px 12px' }}
                onClick={() => setSelectedClientId(c.id)}
              >
                <div className="grow">
                  <div style={{ fontWeight: 600 }}>{c.name}</div>
                  <div className="dim small">
                    {c.live.name} · {c.live.setsDone}/{c.live.setsTotal} serie completate
                  </div>
                </div>
                <span className="tag acc">LIVE</span>
                <Icon name="chevronRight" className="chev" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Elenco Principale Clienti */}
      <div className="row between" style={{ marginBottom: 8 }}>
        <h4 className="sec" style={{ margin: 0 }}>Tutti i Clienti</h4>
        <button className="iconbtn" onClick={() => loadClients()} aria-label="Ricarica" style={{ width: 28, height: 28, fontSize: 14 }}>
          <Icon name="reset" />
        </button>
      </div>

      {clients && clients.length > 0 ? (
        <div className="list">
          {clients.map(c => (
            <div
              key={c.id}
              className="item"
              onClick={() => setSelectedClientId(c.id)}
              style={{ padding: '10px 14px' }}
            >
              <div className="grow">
                <div className="tt" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {c.live && (
                    <span title="In allenamento" style={{ display: 'inline-flex' }}>
                      <Icon name="dot" style={{ fontSize: 9, color: 'var(--green)' }} />
                    </span>
                  )}
                  {c.name}
                  {c.disabled && <span className="tag" style={{ color: 'var(--red)', fontSize: 10 }}>Disattivato</span>}
                </div>
                <div className="ss">
                  {c.live ? (
                    <span style={{ color: 'var(--acc)', fontWeight: 500 }}>In allenamento: {c.live.name}</span>
                  ) : c.lastWorkout ? (
                    `Ultimo: ${c.lastWorkout.name} (${fmtDate(c.lastWorkout.d, true)})`
                  ) : (
                    'Nessun workout registrato'
                  )}
                  {c.totalVolume ? ` · Vol: ${fmtVol(c.totalVolume, 'kg')}` : ''}
                </div>
              </div>

              {/* Azione rapida chat */}
              <button
                className="iconbtn"
                style={{ width: 34, height: 34, color: 'var(--acc)', marginRight: 4 }}
                onClick={(e) => {
                  e.stopPropagation()
                  setChatClient(c)
                }}
                title={`Chat con ${c.name}`}
              >
                <Icon name="message" />
              </button>

              <Icon name="chevronRight" className="chev" />
            </div>
          ))}
        </div>
      ) : loading ? (
        <div className="empty">Caricamento clienti in corso…</div>
      ) : (
        <div className="card empty">
          <div className="ico"><Icon name="person" /></div>
          Nessun cliente registrato.<br />
          Crea il tuo primo cliente e condividi il link di invito!
          <div style={{ marginTop: 14 }}>
            <Button variant="primary" icon="plus" onClick={openNewClientModal}>
              Aggiungi Primo Cliente
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
