import { useState } from 'react'
import { useStore } from '../../store/useStore.js'
import { useUI } from '../../store/useUI.js'
import { Button, TextField } from '../../components/ui.jsx'
import Icon from '../../components/Icon.jsx'

export default function NewClientSheet({ close, onCreated }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [invite, setInvite] = useState(null)
  const addClient = useStore(s => s.addClient)
  const toast = useUI(s => s.toast)

  const handleCreate = async (e) => {
    e?.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      toast('Inserisci il nome del cliente')
      return
    }
    setLoading(true)
    try {
      const inv = await addClient(trimmed)
      setInvite(inv)
      toast('Cliente creato con successo!')
      if (onCreated) onCreated(inv)
    } catch (err) {
      toast(err.message || 'Errore nella creazione del cliente')
    } finally {
      setLoading(false)
    }
  }

  const copyLink = () => {
    if (!invite?.inviteLink) return
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(invite.inviteLink)
        .then(() => toast('Link di onboarding copiato!'))
        .catch(() => toast('Impossibile copiare il link'))
    } else {
      toast('Copia non supportata dal browser')
    }
  }

  return (
    <div>
      <h3 style={{ marginBottom: 6 }}>Nuovo Cliente</h3>
      <div className="muted small" style={{ marginBottom: 16 }}>
        Crea un account per il tuo cliente e inviagli il link d'accesso con Passkey.
      </div>

      {!invite ? (
        <form onSubmit={handleCreate}>
          <div style={{ marginBottom: 14 }}>
            <label className="sect-t" style={{ padding: '0 2px 4px' }}>Nome e Cognome Cliente</label>
            <TextField
              placeholder="es. Mario Rossi"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              maxLength={40}
            />
          </div>
          <Button variant="primary" type="submit" disabled={loading || !name.trim()} icon="plus">
            {loading ? 'Creazione in corso…' : 'Crea Cliente & Genera Link'}
          </Button>
          <div style={{ height: 8 }} />
          <Button variant="ghost" type="button" onClick={close}>Annulla</Button>
        </form>
      ) : (
        <div>
          <div className="card" style={{ borderColor: 'var(--acc)', background: 'var(--surface-2)', padding: 14, marginBottom: 16 }}>
            <div className="row" style={{ gap: 8, marginBottom: 8 }}>
              <Icon name="checkCircle" style={{ color: 'var(--acc)', fontSize: 20 }} />
              <div style={{ fontWeight: 600 }}>{invite.name} aggiunto!</div>
            </div>
            <div className="small muted" style={{ marginBottom: 10 }}>
              Invia questo link al cliente su WhatsApp, Telegram o via email. Potrà registrarsi all'istante con FaceID/TouchID:
            </div>
            <div style={{
              background: 'var(--surface)',
              padding: '8px 10px',
              borderRadius: 'var(--r-sm)',
              fontFamily: 'monospace',
              fontSize: '12px',
              wordBreak: 'break-all',
              userSelect: 'all',
              marginBottom: 12
            }}>
              {invite.inviteLink}
            </div>
            <Button variant="primary" icon="link" onClick={copyLink}>
              Copia Link Onboarding
            </Button>
          </div>
          <Button variant="ghost" onClick={close}>Chiudi</Button>
        </div>
      )}
    </div>
  )
}
