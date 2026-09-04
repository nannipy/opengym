import { useState, useEffect, useRef } from 'react'
import { getChat, sendChatMessage } from '../../lib/api.js'
import { useUI } from '../../store/useUI.js'
import { Button, TextField } from '../../components/ui.jsx'
import Icon from '../../components/Icon.jsx'
import { fmtDate } from '../../lib/format.js'

function formatMsgTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ChatView({ client, onClose }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const toast = useUI(s => s.toast)
  const listEndRef = useRef(null)

  const scrollToBottom = () => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadMessages = async () => {
    if (!client?.id) return
    try {
      const res = await getChat(client.id)
      setMessages(res.messages || [])
    } catch (err) {
      // silenzioso sul polling
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()
    const iv = setInterval(loadMessages, 4000)
    return () => clearInterval(iv)
  }, [client?.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e) => {
    e?.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || sending) return
    setSending(true)
    try {
      const res = await sendChatMessage(client.id, trimmed)
      setText('')
      setMessages(prev => [...prev, res.message])
    } catch (err) {
      toast(err.message || 'Errore durante l\'invio del messaggio')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="chat-container">
      <div className="row between" style={{ paddingBottom: 10, borderBottom: 'var(--hair) solid var(--sep)' }}>
        <div className="row" style={{ gap: 10 }}>
          {onClose && (
            <button className="iconbtn" onClick={onClose} aria-label="Indietro" style={{ width: 32, height: 32 }}>
              <Icon name="chevronLeft" />
            </button>
          )}
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>{client.name}</div>
            <div className="dim small">Chat con il cliente</div>
          </div>
        </div>
        <button className="iconbtn" onClick={loadMessages} aria-label="Aggiorna chat" style={{ width: 32, height: 32 }}>
          <Icon name="reset" />
        </button>
      </div>

      <div className="chat-messages">
        {loading && messages.length === 0 ? (
          <div className="empty small">Caricamento messaggi…</div>
        ) : messages.length === 0 ? (
          <div className="empty small">
            <div className="ico"><Icon name="message" /></div>
            Nessun messaggio con {client.name}.<br />Invia un saluto o un feedback sulla scheda!
          </div>
        ) : (
          messages.map((m, idx) => {
            const isMe = m.sender === 'trainer'
            return (
              <div key={m.id || idx} className={`chat-msg ${isMe ? 'me' : 'them'}`}>
                <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 2, opacity: 0.85 }}>
                  {isMe ? 'Tu (Trainer)' : m.senderName || client.name}
                </div>
                <div>{m.text}</div>
                <div className="chat-meta">
                  <span>{formatMsgTime(m.ts)}</span>
                </div>
              </div>
            )
          })
        )}
        <div ref={listEndRef} />
      </div>

      <form className="chat-input-bar" onSubmit={handleSend}>
        <TextField
          placeholder={`Scrivi a ${client.name}…`}
          value={text}
          onChange={e => setText(e.target.value)}
          disabled={sending}
          style={{ flex: 1 }}
        />
        <Button
          variant="primary"
          type="submit"
          disabled={!text.trim() || sending}
          style={{ width: 'auto', padding: '12px 16px' }}
        >
          <Icon name="arrowUp" />
        </Button>
      </form>
    </div>
  )
}
