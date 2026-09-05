import { useState, useEffect } from 'react'
import { useStore } from '../../store/useStore.js'
import Icon from '../../components/Icon.jsx'
import ChatView from './ChatView.jsx'

function getInitials(name) {
  if (!name) return 'AT'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function TrainerChatListView() {
  const clients = useStore(s => s.clients)
  const loadClients = useStore(s => s.loadClients)
  const [selectedClient, setSelectedClient] = useState(null)

  useEffect(() => {
    loadClients()
  }, [])

  if (selectedClient) {
    return (
      <div className="narrow">
        <ChatView
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      </div>
    )
  }

  return (
    <div className="narrow">
      <div className="hdr">
        <div>
          <h1>Messaggi Atleti</h1>
          <div className="sub">Comunicazioni dirette e feedback in tempo reale</div>
        </div>
      </div>

      {clients && clients.length > 0 ? (
        <div className="list" style={{ gap: 8 }}>
          {clients.map(c => {
            const initials = getInitials(c.name)
            return (
              <div
                key={c.id}
                className="item interactive"
                onClick={() => setSelectedClient(c)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--r-card)',
                  background: 'var(--surface)',
                  border: '1px solid var(--glass-border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(163, 230, 53, 0.22), rgba(34, 197, 94, 0.08))',
                    border: '1.5px solid color-mix(in srgb, var(--acc) 40%, transparent)',
                    color: 'var(--acc)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 14,
                    flexShrink: 0
                  }}
                >
                  {initials}
                </div>
                <div className="grow">
                  <div className="tt" style={{ fontWeight: 700, fontSize: 16 }}>{c.name}</div>
                  <div className="ss" style={{ fontSize: 13, color: 'var(--label-2)' }}>Tocca per aprire la chat con l'atleta</div>
                </div>
                <Icon name="chevronRight" className="chev" />
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card empty">
          <div className="ico"><Icon name="message" /></div>
          Nessun cliente registrato a cui inviare messaggi.<br />
          Aggiungi un cliente nella sezione Clienti per iniziare a chattare.
        </div>
      )}
    </div>
  )
}
