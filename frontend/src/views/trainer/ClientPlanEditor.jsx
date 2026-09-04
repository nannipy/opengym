import { useState } from 'react'
import { uid, exCount, DAYN } from '../../lib/format.js'
import { glyphOf, DEFAULT_GLYPH } from '../../lib/glyphs.js'
import { glyphPicker, exercisePicker, exConfigSheet, confirmSheet } from '../../sheets.jsx'
import { exOr } from '../../lib/exercises.js'
import { exLine } from '../../lib/history.js'
import { Thumb } from '../../components/Media.jsx'
import { Button, TextField, TextArea } from '../../components/ui.jsx'
import Icon from '../../components/Icon.jsx'

export default function ClientPlanEditor({ clientData, templates, onSave, onCancel }) {
  const [routines, setRoutines] = useState(
    clientData?.routines ? JSON.parse(JSON.stringify(clientData.routines)) : []
  )
  const [week, setWeek] = useState(
    clientData?.week && typeof clientData.week === 'object'
      ? { ...clientData.week }
      : { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 0: null }
  )
  const [notes, setNotes] = useState(clientData?.notes || '')
  const [activeRoutineIdx, setActiveRoutineIdx] = useState(0)

  const curRoutine = routines[activeRoutineIdx] || null

  const applyTemplate = (tmpl) => {
    confirmSheet({
      title: 'Applicare template?',
      message: `Vuoi sostituire le routine attuali del cliente con quelle di "${tmpl.name}"?`,
      confirmText: 'Applica Template',
      onConfirm: () => {
        const clonedRoutines = (tmpl.routines || []).map(r => ({
          ...r,
          id: 'r_' + uid(),
          ex: JSON.parse(JSON.stringify(r.ex || []))
        }))
        setRoutines(clonedRoutines)
        setActiveRoutineIdx(0)
      }
    })
  }

  const addRoutine = () => {
    const newR = {
      id: 'r_' + uid(),
      name: `Routine ${String.fromCharCode(65 + routines.length)}`,
      emoji: DEFAULT_GLYPH,
      ex: []
    }
    setRoutines([...routines, newR])
    setActiveRoutineIdx(routines.length)
  }

  const removeRoutine = (idx) => {
    confirmSheet({
      title: 'Eliminare routine?',
      message: `Rimuovere "${routines[idx].name}" dal piano del cliente?`,
      confirmText: 'Elimina',
      danger: true,
      onConfirm: () => {
        const removedId = routines[idx].id
        const next = routines.filter((_, i) => i !== idx)
        setRoutines(next)
        setActiveRoutineIdx(Math.max(0, idx - 1))
        // reset week schedule if this routine was assigned
        const nextWeek = { ...week }
        Object.keys(nextWeek).forEach(day => {
          if (nextWeek[day] === removedId) nextWeek[day] = null
        })
        setWeek(nextWeek)
      }
    })
  }

  const addExercise = () => {
    exercisePicker((ex) => {
      const next = [...routines]
      next[activeRoutineIdx].ex.push({
        id: ex.id,
        sets: 3,
        reps: 10,
        weight: 0,
        mode: 'reps'
      })
      setRoutines(next)
    })
  }

  const editExercise = (exItem, exIdx) => {
    const exObj = exOr(exItem.id)
    exConfigSheet(
      exObj,
      exItem,
      (cfg) => {
        const next = [...routines]
        next[activeRoutineIdx].ex[exIdx] = { id: exItem.id, ...cfg }
        setRoutines(next)
      },
      () => {
        const next = [...routines]
        next[activeRoutineIdx].ex.splice(exIdx, 1)
        setRoutines(next)
      },
      curRoutine
    )
  }

  const assignDay = (dayIndex) => {
    if (!routines.length) return
    const currentAssigned = week[dayIndex]
    const curIdx = routines.findIndex(r => r.id === currentAssigned)
    const nextR = curIdx === -1 ? routines[0] : routines[curIdx + 1] || null
    setWeek({ ...week, [dayIndex]: nextR ? nextR.id : null })
  }

  const handleSave = () => {
    onSave({
      routines,
      week,
      notes: notes.trim()
    })
  }

  return (
    <div className="narrow">
      <div className="hdr">
        <button className="iconbtn" onClick={onCancel} aria-label="Indietro">
          <Icon name="chevronLeft" />
        </button>
        <div style={{ flex: 1, margin: '0 12px' }}>
          <h1 style={{ fontSize: 24, margin: 0 }}>Modifica Scheda</h1>
          <div className="sub">{clientData?.client?.name}</div>
        </div>
        <Button variant="primary" size="sm" onClick={handleSave}>
          Salva Scheda
        </Button>
      </div>

      {/* Applicazione Rapida Template */}
      {templates && templates.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="row between" style={{ marginBottom: 8 }}>
            <h2 style={{ margin: 0, fontWeight: 600 }}>Applica da Template</h2>
          </div>
          <div className="small muted" style={{ marginBottom: 10 }}>
            Carica istantaneamente una combinazione di routine salvate:
          </div>
          <div className="chips">
            {templates.map(tmpl => (
              <button
                key={tmpl.id}
                className="chip"
                onClick={() => applyTemplate(tmpl)}
              >
                <Icon name={glyphOf(tmpl.emoji)} style={{ display: 'inline', marginRight: 4 }} />
                {tmpl.name} ({tmpl.routines?.length || 0} split)
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Note Tecniche del Trainer */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ margin: '0 0 8px', fontWeight: 600 }}>Note e Istruzioni per il Cliente</h2>
        <TextArea
          placeholder="es. Focus sui tempi di recupero (90s). Nella panca mantieni il fermo al petto di 1s. Bevi almeno 2L d'acqua al giorno."
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      {/* Split Settimanale */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ margin: '0 0 8px', fontWeight: 600 }}>Programmazione Settimanale</h2>
        <div className="small muted" style={{ marginBottom: 10 }}>
          Tocca un giorno per assegnare o ciclare la routine:
        </div>
        <div className="list" style={{ gap: 4 }}>
          {[1, 2, 3, 4, 5, 6, 0].map(d => {
            const rId = week[d]
            const routine = routines.find(r => r.id === rId)
            return (
              <div
                key={d}
                className="item"
                onClick={() => assignDay(d)}
                style={{ padding: '8px 12px', minHeight: 44 }}
              >
                <div className="grow" style={{ fontWeight: 500 }}>{DAYN[d]}</div>
                {routine ? (
                  <span className="tag acc">
                    <Icon name={glyphOf(routine.emoji)} />
                    {routine.name}
                  </span>
                ) : (
                  <span className="tag">Riposo</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Gestione Routine del Cliente */}
      <div className="row between" style={{ marginBottom: 10 }}>
        <h4 className="sec" style={{ margin: 0 }}>
          Routines Cliente ({routines.length})
        </h4>
        <Button size="sm" variant="tinted" icon="plus" onClick={addRoutine}>
          Aggiungi Routine
        </Button>
      </div>

      {routines.length > 0 ? (
        <>
          <div className="chips" style={{ marginBottom: 14 }}>
            {routines.map((r, i) => (
              <button
                key={r.id || i}
                className={'chip' + (activeRoutineIdx === i ? ' on' : '')}
                onClick={() => setActiveRoutineIdx(i)}
              >
                <Icon name={glyphOf(r.emoji)} style={{ display: 'inline', marginRight: 4 }} />
                {r.name || `Routine ${i + 1}`} ({r.ex?.length || 0})
              </button>
            ))}
          </div>

          {curRoutine && (
            <div className="card" style={{ padding: 14 }}>
              <div className="row between" style={{ marginBottom: 12 }}>
                <div className="row" style={{ gap: 8, flex: 1 }}>
                  <button
                    className="iconbtn"
                    style={{ width: 34, height: 34 }}
                    onClick={() => glyphPicker(curRoutine.emoji, g => {
                      const next = [...routines]
                      next[activeRoutineIdx].emoji = g
                      setRoutines(next)
                    })}
                  >
                    <Icon name={glyphOf(curRoutine.emoji)} />
                  </button>
                  <TextField
                    value={curRoutine.name}
                    onChange={e => {
                      const next = [...routines]
                      next[activeRoutineIdx].name = e.target.value
                      setRoutines(next)
                    }}
                    placeholder="Nome routine"
                    style={{ fontWeight: 600, flex: 1 }}
                  />
                </div>
                {routines.length > 1 && (
                  <button
                    className="iconbtn"
                    style={{ color: 'var(--red)', width: 34, height: 34 }}
                    onClick={() => removeRoutine(activeRoutineIdx)}
                    title="Elimina Routine"
                  >
                    <Icon name="trash" />
                  </button>
                )}
              </div>

              {/* Lista Esercizi */}
              <div>
                {curRoutine.ex?.length ? (
                  <div className="list" style={{ gap: 6 }}>
                    {curRoutine.ex.map((e, idx) => {
                      const exObj = exOr(e.id)
                      return (
                        <div
                          key={idx}
                          className="item"
                          onClick={() => editExercise(e, idx)}
                          style={{ padding: '8px 10px', minHeight: 52 }}
                        >
                          <Thumb ex={exObj} />
                          <div className="grow">
                            <div className="tt capitalize" style={{ fontSize: 15 }}>{exObj.n}</div>
                            <div className="ss">{exLine(e, 'kg')}</div>
                          </div>
                          <Icon name="chevronRight" className="chev" />
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="empty small" style={{ padding: '24px 10px' }}>
                    Nessun esercizio presente in questa routine.
                  </div>
                )}
                <div style={{ marginTop: 12 }}>
                  <Button variant="plain" icon="plus" onClick={addExercise}>
                    Aggiungi Esercizio
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="card empty">
          <div className="ico"><Icon name="clipboard" /></div>
          Nessuna scheda assegnata.<br />
          <div style={{ marginTop: 12 }}>
            <Button variant="primary" icon="plus" onClick={addRoutine}>
              Crea prima Routine
            </Button>
          </div>
        </div>
      )}

      <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
        <Button variant="primary" onClick={handleSave}>
          Aggiorna Scheda Cliente
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Annulla
        </Button>
      </div>
    </div>
  )
}
