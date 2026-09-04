import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore.js'
import { api, subscribeStoreItem } from '../lib/api.js'
import { exOr, imgSrc } from '../lib/exercises.js'
import { glyphOf } from '../lib/glyphs.js'
import { startFlow, exercisePicker } from '../sheets.jsx'
import { openChatSheet } from '../components/ChatSheet.jsx'
import Icon from '../components/Icon.jsx'
import Logo from '../components/Logo.jsx'
import { Button } from '../components/ui.jsx'

export default function AssignedPlanView({ onSwitchToCalendar }) {
  const S = useStore(s => s.S)
  const user = useStore(s => s.user)
  const update = useStore(s => s.update)
  const nav = useNavigate()

  const routines = S.routines || []
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    const clientId = user?.id || 'client-marco'
    api('/api/trainer/client/' + clientId).then(res => {
      if (res?.plan?.routines?.length) {
        update(s => {
          s.routines = res.plan.routines
          if (res.plan.week) s.week = res.plan.week
          if (res.plan.note) s.trainerNote = res.plan.note
        })
      }
    }).catch(() => {})

    const unsub = subscribeStoreItem('plan_' + clientId, newPlan => {
      if (newPlan?.routines?.length) {
        update(s => {
          s.routines = newPlan.routines
          if (newPlan.week) s.week = newPlan.week
          if (newPlan.note) s.trainerNote = newPlan.note
        })
      }
    })
    return () => unsub && unsub()
  }, [user?.id])

  if (!routines.length) {
    return (
      <div className="empty" style={{ paddingTop: 40 }}>
        <div className="ico"><Icon name="clipboard" /></div>
        <h3>Nessuna scheda assegnata</h3>
        <p className="muted small">Il tuo Personal Trainer non ha ancora caricato una scheda per te.</p>
        <Button variant="primary" icon="chat" onClick={() => openChatSheet()}>
          Contatta il Trainer
        </Button>
      </div>
    )
  }

  const curRoutine = routines[Math.min(activeTab, routines.length - 1)] || routines[0]
  const trainerName = user?.trainerName || 'Coach Marco'

  // Swap exercise if machine/spot is taken
  const handleSwap = (exIdx, currentEx) => {
    const fullEx = exOr(currentEx.id)
    exercisePicker(newEx => {
      update(s => {
        const targetR = s.routines.find(r => r.id === curRoutine.id)
        if (targetR && targetR.ex && targetR.ex[exIdx]) {
          targetR.ex[exIdx] = {
            ...targetR.ex[exIdx],
            id: newEx.id,
            swappedFrom: fullEx.n
          }
        }
      })
    }, {
      title: `Sostituisci ${fullEx.n}`,
      initialBp: fullEx.bp || ''
    })
  }

  return (
    <div className="assigned-plan-view" style={{ maxWidth: 640, margin: '0 auto' }}>
      {/* Brand Header */}
      <div style={{ marginBottom: 14 }}>
        <Logo size="sm" badge="SCHEDA ATLETA" />
      </div>

      {/* Header Banner PT */}
      <div
        className="card"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--acc-line)',
          borderRadius: 'var(--r-card)',
          padding: '16px',
          marginBottom: 16,
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
        }}
      >
        <div className="row between" style={{ alignItems: 'flex-start', gap: 12 }}>
          <div className="row" style={{ gap: 10, alignItems: 'center' }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: 'var(--acc-soft)',
                color: 'var(--acc)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20
              }}
            >
              <Icon name="person" />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--acc)', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                Scheda Personalizzata
              </div>
              <h3 style={{ margin: '2px 0 0', fontSize: 17, fontWeight: 700 }}>
                Assegnata da {trainerName}
              </h3>
            </div>
          </div>
          <Button size="sm" variant="tinted" icon="chat" onClick={() => openChatSheet()}>
            Chat PT
          </Button>
        </div>

        {/* PT Note */}
        {(S.notes || curRoutine.note) && (
          <div
            style={{
              marginTop: 12,
              padding: '10px 12px',
              borderRadius: 'var(--r-sm)',
              background: 'var(--surface-2)',
              fontSize: 13,
              lineHeight: 1.45,
              color: 'var(--label-2)',
              borderLeft: '3px solid var(--acc)'
            }}
          >
            <strong style={{ color: 'var(--label)' }}>Nota del Coach: </strong>
            “{curRoutine.note || S.notes}”
          </div>
        )}
      </div>

      {/* Routine Days Pill Switcher */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 4,
          marginBottom: 16,
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {routines.map((r, idx) => {
          const isSel = idx === activeTab
          return (
            <button
              key={r.id || idx}
              onClick={() => setActiveTab(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 20,
                border: isSel ? '1.5px solid var(--acc)' : '1px solid var(--sep)',
                background: isSel ? 'var(--acc-soft)' : 'var(--surface)',
                color: isSel ? 'var(--acc)' : 'var(--label-2)',
                fontWeight: isSel ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon name={glyphOf(r.emoji)} style={{ fontSize: 15 }} />
              <span>{r.name}</span>
              <span
                style={{
                  fontSize: 11,
                  opacity: 0.7,
                  background: isSel ? 'var(--acc)' : 'var(--surface-3)',
                  color: isSel ? 'var(--on-acc)' : 'var(--label)',
                  padding: '1px 6px',
                  borderRadius: 10
                }}
              >
                {r.ex?.length || 0}
              </span>
            </button>
          )
        })}
      </div>

      {/* Active Routine Card */}
      <div
        className="card"
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--r-card)',
          padding: '18px 16px',
          marginBottom: 20
        }}
      >
        <div className="row between" style={{ alignItems: 'center', marginBottom: 14 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
              {curRoutine.name}
            </h2>
            <div className="muted small" style={{ marginTop: 2 }}>
              {curRoutine.ex?.length || 0} esercizi programmati
            </div>
          </div>

          <Button
            variant="primary"
            icon="play"
            size="md"
            onClick={() => startFlow(curRoutine.id)}
            style={{ fontWeight: 700, padding: '8px 18px' }}
          >
            Avvia Scheda
          </Button>
        </div>

        {/* Exercises List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(curRoutine.ex || []).map((item, exIdx) => {
            const fullEx = exOr(item.id)
            const sets = item.sets || item[1] || 3
            const reps = item.reps || item[2] || '8-10'
            const rpe = item.rpe || item.targetRpe || null
            const rest = item.rest || null
            const note = item.note || null
            const swapped = item.swappedFrom || null

            return (
              <div
                key={item.id + '-' + exIdx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 'var(--r)',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--sep-op)',
                  position: 'relative'
                }}
              >
                {/* Index number badge */}
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: 'var(--surface-3)',
                    color: 'var(--label-2)',
                    fontSize: 12,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {exIdx + 1}
                </div>

                {/* Thumbnail */}
                {fullEx.img ? (
                  <img
                    src={imgSrc(fullEx)}
                    alt={fullEx.n}
                    loading="lazy"
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 8,
                      objectFit: 'cover',
                      background: 'var(--surface-3)',
                      flexShrink: 0
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 8,
                      background: 'var(--surface-3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                      flexShrink: 0
                    }}
                  >
                    🏋️
                  </div>
                )}

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--label)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {fullEx.n}
                  </div>

                  {/* Target tags */}
                  <div className="row" style={{ gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                    <span
                      style={{
                        background: 'var(--acc-soft)',
                        color: 'var(--acc)',
                        fontWeight: 700,
                        fontSize: 12,
                        padding: '2px 7px',
                        borderRadius: 6
                      }}
                    >
                      {sets} serie × {reps}
                    </span>

                    {rpe && (
                      <span
                        style={{
                          background: 'var(--surface-3)',
                          color: 'var(--label-2)',
                          fontSize: 11,
                          padding: '2px 6px',
                          borderRadius: 6
                        }}
                      >
                        RPE {rpe}
                      </span>
                    )}

                    {rest && (
                      <span
                        style={{
                          background: 'var(--surface-3)',
                          color: 'var(--label-2)',
                          fontSize: 11,
                          padding: '2px 6px',
                          borderRadius: 6
                        }}
                      >
                        ⏱️ {Math.floor(rest / 60)}' {rest % 60 ? `${rest % 60}"` : ''}
                      </span>
                    )}
                  </div>

                  {/* Exercise specific note */}
                  {note && (
                    <div className="small" style={{ color: 'var(--label-2)', marginTop: 4, fontStyle: 'italic' }}>
                      💬 {note}
                    </div>
                  )}

                  {swapped && (
                    <div className="small" style={{ color: 'var(--orange)', marginTop: 2 }}>
                      🔄 Sostituito da: {swapped}
                    </div>
                  )}
                </div>

                {/* Swap button if machine occupied */}
                <button
                  onClick={() => handleSwap(exIdx, fullEx)}
                  title="Sostituisci con alternativa se occupato"
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--sep)',
                    borderRadius: 8,
                    padding: '6px 8px',
                    color: 'var(--label-2)',
                    fontSize: 11,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    flexShrink: 0
                  }}
                >
                  <Icon name="swap" style={{ fontSize: 12 }} />
                  <span>Cambia</span>
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Switch to calendar view button */}
      <div style={{ textAlign: 'center', marginTop: 10, marginBottom: 30 }}>
        <button
          onClick={onSwitchToCalendar}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--label-3)',
            fontSize: 13,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5
          }}
        >
          <Icon name="calendar" style={{ fontSize: 14 }} />
          <span>Visualizza programmazione settimanale (Calendario)</span>
        </button>
      </div>
    </div>
  )
}
