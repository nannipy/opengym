import { useState, useEffect, useRef } from 'react'
import { useStore } from '../store/useStore.js'
import { useUI } from '../store/useUI.js'
import { getChat, sendChatMessage } from '../lib/api.js'
import { t } from '../lib/i18n.js'
import Icon from '../components/Icon.jsx'
import { Button } from '../components/ui.jsx'

export default function ChatSheet({ clientId: propClientId, clientName: propClientName, close }) {
  const user = useStore(s => s.user)
  const isClient = useStore(s => s.isClient())
  const effectiveClientId = propClientId || user?.id
  const displayName = isClient ? t('Il tuo Personal Trainer') : (propClientName || t('Cliente'))

  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const listRef = useRef(null)
  const pollRef = useRef(null)

  const fetchMessages = async (silent = false) => {
    if (!effectiveClientId) return
    try {
      const res = await getChat(effectiveClientId)
      setMessages(res.messages || [])
      if (!silent) setLoading(false)
    } catch (e) {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
    pollRef.current = setInterval(() => {
      fetchMessages(true)
    }, 4000)
    return () => clearInterval(pollRef.current)
  }, [effectiveClientId])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages])

  const onSend = async e => {
    if (e) e.preventDefault()
    const msg = text.trim()
    if (!msg || sending || !effectiveClientId) return
    setSending(true)
    try {
      const res = await sendChatMessage(effectiveClientId, msg)
      if (res.message) {
        setMessages(prev => [...prev, res.message])
      }
      setText('')
    } catch (err) {
      useUI.getState().toast(err.message || t('Errore invio messaggio'))
    } finally {
      setSending(false)
    }
  }

  const fmtMsgTime = ts => {
    if (!ts) return ''
    const d = new Date(ts)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '70vh', maxHeight: 600 }}>
      {/* Header */}
      <div className="row between" style={{ paddingBottom: 12, borderBottom: '1px solid var(--sep)' }}>
        <div className="row" style={{ gap: 10 }}>
          <span className="lrow-i" style={{ background: 'var(--acc)', width: 36, height: 36, fontSize: 18 }}>
            <Icon name="chat" />
          </span>
          <div>
            <h3 style={{ margin: 0, fontSize: 18 }}>{displayName}</h3>
            <div className="dim small">
              {isClient ? t('Chiedi chiarimenti o comunica macchinari occupati') : t('Chat diretta')}
            </div>
          </div>
        </div>
      </div>

      {/* Messages list */}
      <div
        ref={listRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }}
      >
        {loading && <div className="muted small" style={{ textAlign: 'center', margin: 'auto' }}>{t('Caricamento chat…')}</div>}
        {!loading && messages.length === 0 && (
          <div className="empty" style={{ margin: 'auto 0' }}>
            <div className="ico"><Icon name="chat" /></div>
            {isClient
              ? t('Nessun messaggio ancora. Scrivi qui al tuo PT per dubbi o cambi esercizio!')
              : t('Nessun messaggio in questa conversazione.')}
          </div>
        )}
        {messages.map(m => {
          const isMine = (isClient && m.sender === 'client') || (!isClient && m.sender === 'trainer')
          return (
            <div
              key={m.id}
              style={{
                alignSelf: isMine ? 'flex-end' : 'flex-start',
                maxWidth: '82%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: isMine ? 'flex-end' : 'flex-start'
              }}
            >
              <div
                style={{
                  background: isMine ? 'var(--acc)' : 'var(--surface-2)',
                  color: isMine ? '#000' : 'var(--label-1)',
                  borderRadius: 14,
                  borderBottomRightRadius: isMine ? 2 : 14,
                  borderBottomLeftRadius: isMine ? 14 : 2,
                  padding: '8px 12px',
                  fontSize: 14,
                  lineHeight: 1.4,
                  wordBreak: 'break-word'
                }}
              >
                {m.text}
              </div>
              <div className="dim" style={{ fontSize: 10, marginTop: 2, padding: '0 4px' }}>
                {fmtMsgTime(m.createdAt)}
              </div>
            </div>
          )
        })}
      </div>

      {/* Input row */}
      <form onSubmit={onSend} className="row" style={{ gap: 8, paddingTop: 10, borderTop: '1px solid var(--sep)' }}>
        <input
          className="input"
          style={{ flex: 1 }}
          placeholder={t('Scrivi un messaggio…')}
          value={text}
          onChange={e => setText(e.target.value)}
          disabled={sending}
        />
        <Button
          variant="primary"
          icon="chevronRight"
          type="submit"
          disabled={!text.trim() || sending}
        >
          {sending ? '…' : t('Invia')}
        </Button>
      </form>
    </div>
  )
}

export function openChatSheet(opts = {}) {
  useUI.getState().openSheet(close => <ChatSheet {...opts} close={close} />)
}
