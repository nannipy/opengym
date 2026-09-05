import { useState, useEffect } from 'react'
import { trainerGetClient, trainerUpdateClientPlan } from '../../lib/api.js'
import { useStore } from '../../store/useStore.js'
import { useUI } from '../../store/useUI.js'
import { fmtDate, fmtNum, fmtVol, fmtDur, DAYN } from '../../lib/format.js'
import { workoutVolume, setsDone } from '../../lib/history.js'
import { glyphOf } from '../../lib/glyphs.js'
import { exOr } from '../../lib/exercises.js'
import { Button } from '../../components/ui.jsx'
import Icon from '../../components/Icon.jsx'
import ClientPlanEditor from './ClientPlanEditor.jsx'
import ChatView from './ChatView.jsx'

export default function ClientDetailView({ clientId, onBack }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editingPlan, setEditingPlan] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('plan') // 'plan' | 'workouts' | 'stats'

  const templates = useStore(s => s.templates)
  const loadTemplates = useStore(s => s.loadTemplates)
  const toast = useUI(s => s.toast)

  const reload = async () => {
    try {
      setLoading(true)
      const res = await trainerGetClient(clientId)
      setData(res)
    } catch (err) {
      toast(err.message || 'Errore nel caricamento dettagli cliente')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
    loadTemplates()
  }, [clientId])

  const handleSavePlan = async (updatedPlan) => {
    try {
      await trainerUpdateClientPlan(clientId, updatedPlan)
      toast('Scheda cliente aggiornata con successo!')
      setEditingPlan(false)
      reload()
    } catch (err) {
      toast(err.message || 'Errore durante l\'aggiornamento della scheda')
    }
  }

  if (loading && !data) {
    return (
      <div className="narrow">
        <div className="empty">Caricamento scheda cliente…</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="narrow">
        <div className="hdr">
          <button className="iconbtn" onClick={onBack}><Icon name="chevronLeft" /></button>
          <div style={{ flex: 1, margin: '0 10px' }}><h1>Cliente non trovato</h1></div>
        </div>
        <div className="empty">Impossibile trovare i dati del cliente.</div>
      </div>
    )
  }

  if (editingPlan) {
    return (
      <ClientPlanEditor
        clientData={data}
        templates={templates}
        onSave={handleSavePlan}
        onCancel={() => setEditingPlan(false)}
      />
    )
  }

  if (chatOpen) {
    return (
      <div className="narrow">
        <ChatView client={data.client} onClose={() => setChatOpen(false)} />
      </div>
    )
  }

  const u = data.client
  const workouts = data.workouts || []
  const bodyweight = data.bodyweight || []
  const routines = data.routines || []
  const week = data.week || {}
  const latestBW = bodyweight.length ? bodyweight[bodyweight.length - 1] : null

  return (
    <div className="narrow">
      <div className="hdr">
        <button className="iconbtn" onClick={onBack} aria-label="Indietro">
          <Icon name="chevronLeft" />
        </button>
        <div style={{ flex: 1, margin: '0 10px' }}>
          <h1 style={{ margin: 0, fontSize: 26 }} className="capitalize">{u.name}</h1>
          <div className="sub">
            {workouts.length} allenamenti · Iscritto il {u.created ? fmtDate(u.created.slice(0, 10)) : '—'}
          </div>
        </div>
        <button
          className="iconbtn"
          style={{ width: 40, height: 40, color: 'var(--acc)' }}
          onClick={() => setChatOpen(true)}
          title="Apri Chat"
        >
          <Icon name="message" />
        </button>
      </div>

      {/* Tiles riassuntive */}
      <div className="tiles">
        <div className="tile">
          <div className="l"><Icon name="dumbbell" /> Workout</div>
          <div className="v">{workouts.length}</div>
        </div>
        <div className="tile">
          <div className="l"><Icon name="scale" /> Peso attuale</div>
          <div className="v">{latestBW ? `${fmtNum(latestBW.w)} ${data.unit}` : '—'}</div>
        </div>
        <div className="tile">
          <div className="l"><Icon name="calendar" /> Routine attive</div>
          <div className="v">{routines.length}</div>
        </div>
        <div className="tile">
          <div className="l"><Icon name="clock" /> Ultimo sync</div>
          <div className="v" style={{ fontSize: '1.05rem' }}>
            {data.lastSync ? fmtDate(new Date(data.lastSync).toISOString().slice(0, 10)) : 'Mai'}
          </div>
        </div>
      </div>

      {/* Tab navigazione interna cliente */}
      <div className="chips" style={{ margin: '14px 0 16px' }}>
        <button
          className={'chip' + (activeTab === 'plan' ? ' on' : '')}
          onClick={() => setActiveTab('plan')}
        >
          <Icon name="calendar" style={{ display: 'inline', marginRight: 4 }} />
          Scheda & Note
        </button>
        <button
          className={'chip' + (activeTab === 'workouts' ? ' on' : '')}
          onClick={() => setActiveTab('workouts')}
        >
          <Icon name="history" style={{ display: 'inline', marginRight: 4 }} />
          Storico Allenamenti ({workouts.length})
        </button>
        <button
          className={'chip' + (activeTab === 'stats' ? ' on' : '')}
          onClick={() => setActiveTab('stats')}
        >
          <Icon name="chart" style={{ display: 'inline', marginRight: 4 }} />
          Pesate Corporee ({bodyweight.length})
        </button>
      </div>

      {/* Tab: Scheda & Note */}
      {activeTab === 'plan' && (
        <>
          <div className="card">
            <div className="row between" style={{ marginBottom: 10 }}>
              <h2 style={{ margin: 0, fontWeight: 600 }}>Scheda Assegnata</h2>
              <Button
                variant="primary"
                size="sm"
                icon="pencil"
                onClick={() => setEditingPlan(true)}
              >
                Modifica / Assegna Scheda
              </Button>
            </div>

            {data.notes && (
              <div style={{
                background: 'var(--surface-2)',
                borderRadius: 'var(--r)',
                padding: '10px 14px',
                marginBottom: 14,
                fontSize: 14,
                lineHeight: 1.45
              }}>
                <div style={{ fontWeight: 600, color: 'var(--acc)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Icon name="info" /> Note Tecniche del Trainer:
                </div>
                {data.notes}
              </div>
            )}

            {/* Split della settimana */}
            <div style={{ marginBottom: 14 }}>
              <div className="small dim" style={{ marginBottom: 6, fontWeight: 600 }}>Programma Settimanale:</div>
              <div className="list" style={{ gap: 4 }}>
                {[1, 2, 3, 4, 5, 6, 0].map(d => {
                  const rId = week[d]
                  const routine = routines.find(r => r.id === rId)
                  return (
                    <div key={d} className="item" style={{ padding: '6px 10px', minHeight: 38 }}>
                      <div className="grow" style={{ fontSize: 14 }}>{DAYN[d]}</div>
                      {routine ? (
                        <span className="tag acc" style={{ fontSize: 11 }}>
                          <Icon name={glyphOf(routine.emoji)} /> {routine.name}
                        </span>
                      ) : (
                        <span className="tag" style={{ fontSize: 11 }}>Riposo</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Elenco Routine ed esercizi */}
            {routines.length ? (
              <div>
                <div className="small dim" style={{ marginBottom: 8, fontWeight: 600 }}>Routines incluse nella scheda:</div>
                <div className="list" style={{ gap: 8 }}>
                  {routines.map(r => (
                    <div key={r.id} className="item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                      <div className="row between" style={{ width: '100%', marginBottom: 4 }}>
                        <div className="row" style={{ gap: 8 }}>
                          <Icon name={glyphOf(r.emoji)} style={{ color: 'var(--acc)', fontSize: 18 }} />
                          <div style={{ fontWeight: 600 }}>{r.name}</div>
                        </div>
                        <span className="tag">{r.ex?.length || 0} esercizi</span>
                      </div>
                      <div className="small dim" style={{ paddingLeft: 26 }}>
                        {(r.ex || []).map(e => e.id).slice(0, 5).join(', ')}
                        {(r.ex || []).length > 5 ? '…' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="empty small" style={{ padding: '20px 0' }}>
                Nessuna routine assegnata a questo cliente.
                <div style={{ marginTop: 8 }}>
                  <Button size="sm" variant="tinted" icon="plus" onClick={() => setEditingPlan(true)}>
                    Assegna una scheda ora
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Tab: Storico Allenamenti */}
      {activeTab === 'workouts' && (
        <div>
          {workouts.length ? (
            <div className="list" style={{ gap: 10 }}>
              {workouts.map(w => {
                const wName = w.name || w.title || 'Sessione Allenamento'
                const wDate = w.d || w.date || todayISO()
                const durMs = (w.end && w.start) ? (w.end - w.start) : (w.duration ? w.duration * 1000 : 3400000)
                const numSets = setsDone(w)
                const totalVol = w.vol ?? w.volume ?? workoutVolume(w)
                const entries = w.entries || w.items || []

                return (
                  <div key={w.id} className="item" style={{ flexDirection: 'column', alignItems: 'stretch', padding: '14px 16px', borderRadius: 'var(--r-card)', border: '1px solid var(--glass-border)' }}>
                    <div className="row between" style={{ width: '100%' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{wName}</div>
                        <div className="dim small" style={{ marginTop: 2 }}>
                          {fmtDate(wDate, true)} · ⏱️ {fmtDur(durMs)} · {numSets} serie
                          {w.prs?.length ? ` · 🏆 ${w.prs.length} PR` : ''}
                        </div>
                      </div>
                      <div className="tag acc" style={{ fontSize: 13, fontWeight: 700 }}>
                        {fmtVol(totalVol, data?.unit || 'kg')}
                      </div>
                    </div>

                    {/* Dettaglio serie ed esercizi dell'allenamento */}
                    {entries.length > 0 && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: 'var(--hair) solid var(--sep)' }}>
                        {entries.map((entry, eIdx) => {
                          const fullEx = exOr(entry.id)
                          const setsList = entry.sets || []
                          return (
                            <div key={eIdx} className="row between small" style={{ padding: '4px 0' }}>
                              <span style={{ fontWeight: 600, color: 'var(--label)' }}>
                                {fullEx.n || entry.id}
                              </span>
                              <span className="muted" style={{ fontWeight: 500 }}>
                                {setsList.map(s => `${s.w || 0}kg × ${s.r || 0}`).join(', ') || `${setsList.length} serie`}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="card empty small">Nessun allenamento registrato da questo cliente.</div>
          )}
        </div>
      )}

      {/* Tab: Statistiche e Peso */}
      {activeTab === 'stats' && (
        <div className="card">
          <h2 style={{ margin: '0 0 10px', fontWeight: 600 }}>Storico Pesate Corporee</h2>
          {bodyweight.length ? (
            <div className="list" style={{ gap: 4 }}>
              {bodyweight.slice().reverse().map((b, idx) => (
                <div key={idx} className="item" style={{ padding: '8px 12px', minHeight: 40 }}>
                  <div className="grow">{fmtDate(b.d, true)}</div>
                  <div style={{ fontWeight: 600 }}>{fmtNum(b.w)} {data?.unit || 'kg'}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty small">Nessuna pesata registrata.</div>
          )}
        </div>
      )}
    </div>
  )
}
