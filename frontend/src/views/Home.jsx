import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore.js'
import { effectiveRoutine, effectiveRoutineId, streakWeeks, lastBW, setsDoneActive } from '../lib/history.js'
import { fmtNum, fmtDate, todayISO, isoOf, weekKey, DAYS } from '../lib/format.js'
import { t, dateLocale } from '../lib/i18n.js'
import { bwSheet, goalSheet, dayOverrideSheet, calendarSheet, startFlow, loadStarterPlan, bwDeltaColor, exercisePicker } from '../sheets.jsx'
import { openChatSheet } from '../components/ChatSheet.jsx'
import LineChart from '../components/LineChart.jsx'
import Icon from '../components/Icon.jsx'
import Logo from '../components/Logo.jsx'
import { Button } from '../components/ui.jsx'
import { glyphOf } from '../lib/glyphs.js'
import { exOr, imgSrc } from '../lib/exercises.js'
import { coachAvailable, hasConsent } from '../lib/coach.js'
import { useCoachStatus } from '../lib/coach-api.js'
import { DEMO } from '../lib/demo.js'
import { MOBILE } from '../lib/mobile.js'

function CoachCard({ nav }) {
  const S = useStore(s => s.S)
  const { job, pending } = useCoachStatus(hasConsent(S))
  if (!hasConsent(S) || (!job && !pending)) return null
  const ready = !!pending
  return (
    <div className="card" style={ready ? { borderColor: 'var(--acc)' } : null}>
      <div className="today-row" onClick={() => nav(ready ? '/coach/proposal' : '/coach')}>
        <div className="row" style={{ gap: 9, minWidth: 0 }}>
          <span className="lrow-i" style={{ background: ready ? 'var(--acc)' : 'var(--orange)' }}><Icon name="sparkles" /></span>
          <div style={{ minWidth: 0 }}>
            <div className="lbl2">{t('Coach')}</div>
            <div className="ttl">{ready
              ? (pending.kind === 'create'
                ? t('Your plan is ready')
                : t(pending.changes?.length === 1 ? '{0} suggestion for you' : '{0} suggestions for you', pending.changes?.length || 0))
              : t('Reading your training…')}</div>
          </div>
        </div>
        {ready ? <span className="tag acc">{t('Review')}</span> : <Icon name="chevronRight" className="chev" />}
      </div>
    </div>
  )
}

export default function Home() {
  const nav = useNavigate()
  const S = useStore(s => s.S)
  const user = useStore(s => s.user)
  const isClient = useStore(s => s.isClient())
  const config = useStore(s => s.config)
  const update = useStore(s => s.update)
  const [weekOffset, setWeekOffset] = useState(0)
  const [showExercises, setShowExercises] = useState(true)
  const coachOn = !isClient && coachAvailable(config, user, { demo: DEMO, mobile: MOBILE })

  const today = new Date()
  const routine = effectiveRoutine(S, todayISO())
  const todayOvr = S.dayPlan[todayISO()] !== undefined
  const bw = lastBW(S)
  const prevBW = S.bodyweight.length > 1 ? S.bodyweight[S.bodyweight.length - 2] : null
  const delta = bw && prevBW ? bw.w - prevBW.w : null

  const monday = new Date(today); monday.setDate(today.getDate() - ((today.getDay() + 6) % 7) + weekOffset * 7)
  const doneDays = new Set(S.workouts.map(w => w.d))
  const strip = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday); d.setDate(monday.getDate() + i)
    const iso = isoOf(d)
    const eff = effectiveRoutineId(S, iso), ovr = S.dayPlan[iso] !== undefined, done = doneDays.has(iso)
    const dot = done ? ' done' : ovr && eff ? ' ovr' : eff ? ' plan' : ''
    strip.push(
      <div key={i} className={'wday' + (iso === todayISO() ? ' today' : '')} onClick={() => dayOverrideSheet(iso)}>
        <div className="lbl">{t(DAYS[d.getDay()])}</div>
        <div className="num">{d.getDate()}</div>
        <div className={'dot' + dot} />
      </div>
    )
  }
  const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6)
  const wkLabel = weekOffset === 0 ? t('This week') : `${monday.getDate()} ${monday.toLocaleDateString(dateLocale(), { month: 'short' })} – ${sunday.getDate()} ${sunday.toLocaleDateString(dateLocale(), { month: 'short' })}`

  const wThisWeek = S.workouts.filter(w => weekKey(w.d) === weekKey(todayISO())).length
  const plannedPerWeek = Object.keys(S.week).filter(k => S.week[k]).length
  const bwPoints = S.bodyweight.slice(-30).map(b => ({ t: b.t || new Date(b.d).getTime(), y: b.w, d: b.d }))

  // Swap exercise helper
  const handleSwapExercise = (routineId, exIdx, currentExId) => {
    const fullEx = exOr(currentExId)
    exercisePicker(newEx => {
      update(s => {
        const targetR = s.routines.find(r => r.id === routineId)
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

  const trainerName = user?.trainerName || 'Coach Marco'

  return (
    <div className="narrow">
      {/* Top Bar with Brand & Contextual Badges */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Logo size="sm" badge={isClient ? 'ATLETA' : 'OPEN'} />
        
        <div className="row" style={{ gap: 8 }}>
          {isClient && (
            <button
              className="chip"
              onClick={() => openChatSheet()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 20,
                border: '1px solid var(--acc-line)',
                background: 'var(--acc-soft)',
                color: 'var(--acc)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)', animation: 'pulseGlow 2s infinite' }} />
              {trainerName}
              <Icon name="chat" style={{ fontSize: 13 }} />
            </button>
          )}
          <button
            className="iconbtn"
            onClick={() => nav('/settings')}
            aria-label={t('Settings')}
            style={{ width: 36, height: 36 }}
          >
            <Icon name="gear" />
          </button>
        </div>
      </div>

      {/* Greeting & Date Header */}
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: '-0.025em' }}>
          {user ? `Ciao ${user.name.split(' ')[0]} 👋` : 'openGym'}
        </h1>
        <div style={{ color: 'var(--label-2)', fontSize: 14, marginTop: 3 }}>
          {today.toLocaleDateString(dateLocale(), { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* HERO SECTION: TODAY'S WORKOUT MISSION */}
      {S.active ? (
        <div
          className="card"
          style={{
            borderColor: 'var(--orange)',
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--orange) 10%, var(--surface)), var(--surface))',
            padding: '18px 20px',
            marginBottom: 18,
            boxShadow: '0 6px 24px -4px rgba(255, 159, 10, 0.25)',
            borderWidth: 1.5
          }}
        >
          <div className="row between" style={{ alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: 'color-mix(in srgb, var(--orange) 20%, transparent)',
                  color: 'var(--orange)',
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '.04em'
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--orange)', animation: 'pulseGlow 1.2s infinite' }} />
                Sessione in corso
              </span>
              <h2 style={{ margin: '6px 0 0', fontSize: 22, fontWeight: 800, color: 'var(--label)' }}>
                {S.active.name}
              </h2>
            </div>
            <span
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'var(--orange)',
                color: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22
              }}
            >
              <Icon name="timer" />
            </span>
          </div>

          <div style={{ color: 'var(--label-2)', fontSize: 13, marginBottom: 14 }}>
            {setsDoneActive(S.active)} serie completate · Allenamento attivo
          </div>

          <Button
            variant="primary"
            icon="play"
            size="lg"
            onClick={() => nav('/workout')}
            style={{
              background: 'var(--orange)',
              color: '#000',
              fontWeight: 700,
              fontSize: 16,
              boxShadow: '0 4px 16px -2px rgba(255, 159, 10, 0.45)'
            }}
          >
            Riprendi Allenamento ⏱️
          </Button>
        </div>
      ) : routine ? (
        <div
          className="card"
          style={{
            borderColor: 'var(--acc)',
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--acc) 8%, var(--surface)), var(--surface))',
            padding: '18px 20px',
            marginBottom: 18,
            boxShadow: 'var(--glass-glow)',
            borderWidth: 1.5
          }}
        >
          <div className="row between" style={{ alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <div className="row" style={{ gap: 6, alignItems: 'center' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: 'var(--acc-soft)',
                    color: 'var(--acc)',
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '.04em'
                  }}
                >
                  <Icon name="flame" style={{ fontSize: 12 }} />
                  Missione di Oggi
                </span>
                {todayOvr && (
                  <span className="tag" style={{ fontSize: 10 }}>Riprogrammato</span>
                )}
              </div>
              <h2 style={{ margin: '6px 0 2px', fontSize: 24, fontWeight: 800, color: 'var(--label)', letterSpacing: '-0.02em' }}>
                {routine.name}
              </h2>
            </div>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'var(--acc-soft)',
                color: 'var(--acc)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22
              }}
            >
              <Icon name={glyphOf(routine.emoji)} />
            </div>
          </div>

          <div className="row" style={{ gap: 12, fontSize: 13, color: 'var(--label-2)', marginBottom: 14, flexWrap: 'wrap' }}>
            <span>🏋️ {routine.ex?.length || 0} esercizi</span>
            <span>⏱️ ~{(routine.ex?.length || 0) * 9 + 10} min</span>
            {isClient && <span>📋 Scheda: {trainerName}</span>}
          </div>

          {(routine.note || S.notes) && (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--r-sm)',
                background: 'var(--surface-2)',
                fontSize: 13,
                color: 'var(--label-2)',
                lineHeight: 1.4,
                marginBottom: 16,
                borderLeft: '3px solid var(--acc)'
              }}
            >
              <strong style={{ color: 'var(--label)' }}>💡 Nota del Coach: </strong>
              “{routine.note || S.notes}”
            </div>
          )}

          <Button
            variant="primary"
            icon="play"
            size="lg"
            onClick={() => startFlow(routine.id)}
            style={{
              fontWeight: 800,
              fontSize: 17,
              letterSpacing: '-0.01em',
              padding: '15px 20px',
              borderRadius: 'var(--r)',
              marginBottom: 14
            }}
          >
            Avvia Allenamento ▶
          </Button>

          {routine.ex && routine.ex.length > 0 && (
            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 12 }}>
              <div
                className="row between"
                style={{ cursor: 'pointer', padding: '4px 0', userSelect: 'none' }}
                onClick={() => setShowExercises(!showExercises)}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--label-2)' }}>
                  Esercizi in programma ({routine.ex.length})
                </div>
                <div style={{ fontSize: 12, color: 'var(--acc)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {showExercises ? 'Nascondi' : 'Mostra tutti'}
                  <Icon name={showExercises ? 'chevronUp' : 'chevronDown'} style={{ fontSize: 13 }} />
                </div>
              </div>

              {showExercises && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                  {routine.ex.map((item, idx) => {
                    const fullEx = exOr(item.id)
                    const sets = item.sets || item[1] || 3
                    const reps = item.reps || item[2] || '8-10'
                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '8px 10px',
                          background: 'var(--surface-2)',
                          borderRadius: 'var(--r-sm)',
                          border: '1px solid var(--glass-border)'
                        }}
                      >
                        <span
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            background: 'var(--surface-3)',
                            color: 'var(--label-2)',
                            fontSize: 11,
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {idx + 1}
                        </span>

                        {fullEx.img ? (
                          <img
                            src={imgSrc(fullEx)}
                            alt={fullEx.n}
                            style={{ width: 34, height: 34, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
                          />
                        ) : (
                          <div style={{ width: 34, height: 34, borderRadius: 6, background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            🏋️
                          </div>
                        )}

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--label)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {fullEx.n}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--label-2)', marginTop: 2 }}>
                            {sets} serie × {reps} {item.rpe ? `· RPE ${item.rpe}` : ''}
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSwapExercise(routine.id, idx, fullEx.id)
                          }}
                          title="Sostituisci se occupato"
                          style={{
                            background: 'transparent',
                            border: '1px solid var(--sep)',
                            borderRadius: 6,
                            padding: '4px 6px',
                            color: 'var(--label-2)',
                            fontSize: 11,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            flexShrink: 0
                          }}
                        >
                          <Icon name="swap" style={{ fontSize: 11 }} />
                          <span>Cambia</span>
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div
          className="card"
          style={{
            padding: '18px 20px',
            marginBottom: 18,
            border: '1px solid var(--glass-border)'
          }}
        >
          <div className="row between" style={{ alignItems: 'flex-start', marginBottom: 8 }}>
            <div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: 'var(--surface-2)',
                  color: 'var(--label-2)',
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase'
                }}
              >
                🧘 Recupero & Riposo
              </span>
              <h2 style={{ margin: '6px 0 2px', fontSize: 20, fontWeight: 700 }}>
                Nessuna routine programmata per oggi
              </h2>
            </div>
            <span style={{ fontSize: 28 }}>🌙</span>
          </div>

          <p style={{ fontSize: 13, color: 'var(--label-2)', margin: '0 0 14px', lineHeight: 1.4 }}>
            Il recupero muscolare è fondamentale. Se desideri allenarti comunque, seleziona una delle tue routine:
          </p>

          {S.routines.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {S.routines.map(r => (
                <div
                  key={r.id}
                  className="item interactive"
                  onClick={() => startFlow(r.id)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--r-sm)',
                    background: 'var(--surface-2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div className="row" style={{ gap: 10 }}>
                    <Icon name={glyphOf(r.emoji)} style={{ color: 'var(--acc)', fontSize: 18 }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{r.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--label-2)' }}>{r.ex?.length || 0} esercizi</div>
                    </div>
                  </div>
                  <span className="tag acc" style={{ fontWeight: 700, padding: '4px 10px' }}>
                    Avvia ▶
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <Button variant="primary" icon="sparkles" onClick={loadStarterPlan}>
              Carica Scheda Base (Push / Pull / Legs)
            </Button>
          )}
        </div>
      )}

      {coachOn && <CoachCard nav={nav} />}

      {isClient && (
        <div
          className="card interactive"
          onClick={() => openChatSheet()}
          style={{
            padding: '14px 16px',
            marginBottom: 16,
            background: 'var(--surface)',
            border: '1px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(163, 230, 53, 0.2), rgba(34, 197, 94, 0.1))',
              border: '1px solid var(--acc-line)',
              color: 'var(--acc)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              flexShrink: 0
            }}
          >
            <Icon name="chat" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--label)' }}>
              Dubbi sulla scheda o carichi?
            </div>
            <div style={{ fontSize: 13, color: 'var(--label-2)', marginTop: 2 }}>
              Tocca per inviare un messaggio diretto a {trainerName}
            </div>
          </div>
          <Icon name="chevronRight" className="chev" style={{ opacity: 0.6 }} />
        </div>
      )}

      <div className="card" style={{ marginBottom: 16, padding: '14px 16px' }}>
        <div className="row between" style={{ marginBottom: 8 }}>
          <button className="iconbtn" style={{ width: 28, height: 28, fontSize: 13 }} onClick={() => setWeekOffset(w => w - 1)} aria-label="Settimana precedente"><Icon name="chevronLeft" /></button>
          <div className="small muted" style={{ fontWeight: 600 }}>{wkLabel}</div>
          <button className="iconbtn" style={{ width: 28, height: 28, fontSize: 13 }} onClick={() => setWeekOffset(w => w + 1)} aria-label="Settimana successiva"><Icon name="chevronRight" /></button>
        </div>
        <div className="week">{strip}</div>
      </div>

      <div className="grid2" style={{ marginBottom: 16 }}>
        <div
          className="card interactive"
          onClick={() => calendarSheet()}
          style={{ padding: '14px', margin: 0 }}
        >
          <div className="row" style={{ gap: 6, color: 'var(--orange)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
            <Icon name="flame" /> Costanza
          </div>
          <div className="big" style={{ fontSize: 24, margin: '6px 0 2px' }}>
            {streakWeeks(S)} <span style={{ fontSize: 13, color: 'var(--label-2)', fontWeight: 400 }}>sett. di fila</span>
          </div>
          <div className="small muted">
            {wThisWeek}{plannedPerWeek ? `/${plannedPerWeek}` : ''} allenamenti questa settimana
          </div>
        </div>

        <div
          className="card interactive"
          onClick={() => bwSheet()}
          style={{ padding: '14px', margin: 0 }}
        >
          <div className="row between" style={{ alignItems: 'center' }}>
            <div className="row" style={{ gap: 5, color: 'var(--label-2)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
              <Icon name="scale" /> Peso
            </div>
            <span style={{ fontSize: 11, color: 'var(--acc)', fontWeight: 700 }}>+ Registra</span>
          </div>
          <div className="big" style={{ fontSize: 24, margin: '6px 0 2px' }}>
            {bw ? fmtNum(bw.w) : '—'} <span style={{ fontSize: 13, color: 'var(--label-2)', fontWeight: 400 }}>{S.unit}</span>
          </div>
          <div className="small muted">
            {delta ? (
              <span style={{ color: bwDeltaColor(delta, bw?.w), fontWeight: 600 }}>
                {delta > 0 ? '↑ +' : '↓ '}{fmtNum(Math.abs(delta))} {S.unit}
              </span>
            ) : bw ? fmtDate(bw.d, true) : 'Nessuna pesata'}
          </div>
        </div>
      </div>

      {bwPoints.length > 1 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="row between" style={{ marginBottom: 6 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Andamento Peso Corporeo</h3>
            <Button size="sm" icon="target" style={S.targetW ? { color: 'var(--yellow)' } : undefined} onClick={goalSheet}>
              {S.targetW ? `Obiettivo ${fmtNum(S.targetW)} ${S.unit}` : 'Imposta Obiettivo'}
            </Button>
          </div>
          <div className="chart" style={{ marginTop: 8 }}>
            <LineChart points={bwPoints} h={120} unit={S.unit} goal={S.targetW} />
          </div>
        </div>
      )}
    </div>
  )
}
