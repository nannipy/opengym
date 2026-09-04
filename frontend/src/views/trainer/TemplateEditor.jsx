import { useState } from 'react'
import { uid, exCount } from '../../lib/format.js'
import { glyphOf, DEFAULT_GLYPH } from '../../lib/glyphs.js'
import { POLICIES_FOR, POLICY_NAME, POLICY_DESC } from '../../lib/progression.js'
import { glyphPicker, exercisePicker, exConfigSheet, confirmSheet } from '../../sheets.jsx'
import { exOr } from '../../lib/exercises.js'
import { exLine } from '../../lib/history.js'
import { Thumb } from '../../components/Media.jsx'
import { Button, TextField, SelectRow } from '../../components/ui.jsx'
import Icon from '../../components/Icon.jsx'

export default function TemplateEditor({ template, onSave, onCancel }) {
  const [name, setName] = useState(template?.name || '')
  const [emoji, setEmoji] = useState(template?.emoji || DEFAULT_GLYPH)
  const [prog, setProg] = useState(template?.prog || 'double')
  const [routines, setRoutines] = useState(template?.routines ? JSON.parse(JSON.stringify(template.routines)) : [])
  const [activeRoutineIdx, setActiveRoutineIdx] = useState(0)

  const curRoutine = routines[activeRoutineIdx] || null

  const addRoutine = () => {
    const newR = {
      id: 'r_' + uid(),
      name: `Giorno ${String.fromCharCode(65 + routines.length)}`,
      emoji: DEFAULT_GLYPH,
      ex: []
    }
    setRoutines([...routines, newR])
    setActiveRoutineIdx(routines.length)
  }

  const removeRoutine = (idx) => {
    confirmSheet({
      title: 'Eliminare routine?',
      message: `Sei sicuro di voler eliminare "${routines[idx].name}"?`,
      confirmText: 'Elimina',
      danger: true,
      onConfirm: () => {
        const next = routines.filter((_, i) => i !== idx)
        setRoutines(next)
        setActiveRoutineIdx(Math.max(0, idx - 1))
      }
    })
  }

  const updateRoutineName = (val) => {
    if (!curRoutine) return
    const next = [...routines]
    next[activeRoutineIdx].name = val
    setRoutines(next)
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

  const handleSave = () => {
    if (!name.trim()) return
    onSave({
      id: template?.id,
      name: name.trim(),
      emoji,
      prog,
      routines
    })
  }

  return (
    <div className="narrow">
      <div className="hdr">
        <button className="iconbtn" onClick={onCancel} aria-label="Indietro">
          <Icon name="chevronLeft" />
        </button>
        <div style={{ flex: 1, margin: '0 12px' }}>
          <h1 style={{ fontSize: 24, margin: 0 }}>
            {template ? 'Modifica Template' : 'Nuovo Template'}
          </h1>
        </div>
        <Button variant="primary" size="sm" onClick={handleSave} disabled={!name.trim()}>
          Salva
        </Button>
      </div>

      {/* Info Generali Template */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="row" style={{ gap: 10, marginBottom: 14 }}>
          <button
            className="iconbtn"
            style={{ width: 44, height: 44, fontSize: 22 }}
            onClick={() => glyphPicker(emoji, setEmoji)}
            title="Cambia icona"
          >
            <Icon name={glyphOf(emoji)} />
          </button>
          <div style={{ flex: 1 }}>
            <label className="sect-t" style={{ padding: '0 2px 4px' }}>Nome Template</label>
            <TextField
              placeholder="es. Split 4 Giorni Ipertrofia"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ fontWeight: 600 }}
            />
          </div>
        </div>

        <SelectRow
          icon="chartLine"
          title="Progressione Predefinita"
          sheetTitle="Progressione Predefinita"
          value={prog}
          onChange={setProg}
          options={POLICIES_FOR.reps.map(p => ({
            value: p,
            label: POLICY_NAME[p] || p,
            subtitle: POLICY_DESC[p] || ''
          }))}
        />
      </div>

      {/* Schede / Giorni Split */}
      <div className="row between" style={{ marginBottom: 10 }}>
        <h4 className="sec" style={{ margin: 0 }}>
          Routines ({routines.length})
        </h4>
        <Button size="sm" variant="tinted" icon="plus" onClick={addRoutine}>
          Aggiungi Giorno
        </Button>
      </div>

      {routines.length > 0 ? (
        <>
          {/* Selettore Tab Routine */}
          <div className="chips" style={{ marginBottom: 14 }}>
            {routines.map((r, i) => (
              <button
                key={r.id || i}
                className={'chip' + (activeRoutineIdx === i ? ' on' : '')}
                onClick={() => setActiveRoutineIdx(i)}
              >
                <Icon name={glyphOf(r.emoji)} style={{ display: 'inline', marginRight: 4 }} />
                {r.name || `Giorno ${i + 1}`} ({r.ex?.length || 0})
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
                    onChange={e => updateRoutineName(e.target.value)}
                    placeholder="Nome routine (es. Push)"
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

              {/* Lista Esercizi della routine */}
              <div style={{ marginTop: 10 }}>
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
                    Nessun esercizio aggiunto a questo giorno.
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
          Nessuna routine presente nel template.<br />
          <div style={{ marginTop: 12 }}>
            <Button variant="primary" icon="plus" onClick={addRoutine}>
              Crea prima Routine
            </Button>
          </div>
        </div>
      )}

      <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
        <Button variant="primary" onClick={handleSave} disabled={!name.trim()}>
          Salva Template
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Annulla
        </Button>
      </div>
    </div>
  )
}
