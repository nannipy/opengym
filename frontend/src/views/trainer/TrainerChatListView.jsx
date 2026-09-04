import { useState, useEffect } from 'react'
import { useStore } from '../../store/useStore.js'
import Icon from '../../components/Icon.jsx'
import ChatView from './ChatView.jsx'

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
          <h1>Messaggi Clienti</h1>
          <div className="sub">Comunicazioni e chiarimenti diretti con i tuoi atleti</div>
        </div>
      </div>

      {clients && clients.length > 0 ? (
        <div className="list">
          {clients.map(c => (
            <div
              key={c.id}
              className="item"
              onClick={() => setSelectedClient(c)}
              style={{ padding: '12px 14px' }}
            >
              <span
                className="lrow-i"
                style={{
                  background: 'var(--acc-soft)',
                  color: 'var(--acc)',
                  borderRadius: '50%',
                  fontSize: 18
                }}
              >
                <Icon name="person" />
              </span>
              <div className="grow">
                <div className="tt" style={{ fontWeight: 600 }}>{c.name}</div>
                <div className="ss">Tocca per aprire la conversazione</div>
              </div>
              <Icon name="chevronRight" className="chev" />
            </div>
          ))}
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
