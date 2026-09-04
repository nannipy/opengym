import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore.js'
import { DAYN, uid, exCount } from '../lib/format.js'
import { t } from '../lib/i18n.js'
import { dayAssignSheet, loadStarterPlan, planToolsSheet } from '../sheets.jsx'
import { openChatSheet } from '../components/ChatSheet.jsx'
import Icon from '../components/Icon.jsx'
import { Button, Segmented } from '../components/ui.jsx'
import { glyphOf, DEFAULT_GLYPH } from '../lib/glyphs.js'
import { coachAvailable } from '../lib/coach.js'
import { DEMO } from '../lib/demo.js'
import { MOBILE } from '../lib/mobile.js'
import AssignedPlanView from './AssignedPlanView.jsx'

export default function Plan() {
  const nav = useNavigate()
  const S = useStore(s => s.S)
  const user = useStore(s => s.user)
  const isClient = useStore(s => s.isClient())
  const config = useStore(s => s.config)
  const update = useStore(s => s.update)
  const coachOn = !isClient && coachAvailable(config, user, { demo: DEMO, mobile: MOBILE })

  // For clients, default to simple card view
  const [viewMode, setViewMode] = useState(isClient ? 'simple' : 'calendar')

  const addRoutine = () => {
    const r = { id: uid(), name: t('New routine'), emoji: DEFAULT_GLYPH, ex: [] }
    update(s => { s.routines.push(r) })
    nav('/plan/r/' + r.id)
  }

  return (
    <div className="narrow">
      <div className="hdr">
        <div>
          <h1>{isClient ? 'Scheda Assegnata' : t('Plan')}</h1>
          <div className="sub">{isClient ? 'Il tuo programma di allenamento' : t('Your weekly routine')}</div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          {isClient && (
            <button
              className="iconbtn"
              style={{ color: 'var(--acc)', background: 'color-mix(in srgb,var(--acc) 14%,transparent)' }}
              onClick={() => openChatSheet()}
              aria-label="Chat con Personal Trainer"
              title="Chat con Personal Trainer"
            >
              <Icon name="chat" />
            </button>
          )}
          {coachOn && <button className="iconbtn" onClick={() => nav('/coach')} aria-label={t('Coach')} title={t('Coach')}><Icon name="sparkles" /></button>}
          <button className="iconbtn" onClick={planToolsSheet} aria-label={t('Share your plan')} title={t('Share your plan')}><Icon name="upload" /></button>
        </div>
      </div>

      {/* Mode Switcher for Client: Scheda Semplice vs Calendario */}
      {isClient && (
        <div style={{ marginBottom: 14 }}>
          <Segmented
            value={viewMode}
            onChange={setViewMode}
            options={[
              { value: 'simple', label: '📋 Scheda Semplice' },
              { value: 'calendar', label: '📅 Calendario Settimanale' }
            ]}
          />
        </div>
      )}

      {/* Simple Assigned Card View */}
      {isClient && viewMode === 'simple' ? (
        <AssignedPlanView onSwitchToCalendar={() => setViewMode('calendar')} />
      ) : (
        /* Calendar & Routines Classic View */
        <div className="cols">
          <div>
            <h4 className="sec">{t('Week schedule')}</h4>
            <div className="list" style={{ display: 'flex', flexDirection: 'column' }}>
              {[1, 2, 3, 4, 5, 6, 0].map(d => {
                const r = S.routines.find(x => x.id === S.week[d])
                return (
                  <div key={d} className="item" onClick={() => dayAssignSheet(d)}>
                    <div className="grow"><div className="tt">{t(DAYN[d])}</div></div>
                    {r ? <span className="tag acc"><Icon name={glyphOf(r.emoji)} />{r.name}</span> : <span className="tag">{t('Rest')}</span>}
                    <Icon name="chevronRight" className="chev" />
                  </div>
                )
              })}
            </div>
          </div>
          <div>
            <div className="row between" style={{ marginTop: 22, marginBottom: 10 }}>
              <h4 className="sec" style={{ margin: 0 }}>{t('Routines')}</h4>
              <Button size="sm" variant="tinted" icon="plus" onClick={addRoutine}>{t('New')}</Button>
            </div>
            {S.routines.length ? (
              <div className="list">
                {S.routines.map(r => (
                  <div key={r.id} className="item" onClick={() => nav('/plan/r/' + r.id)}>
                    <span className="lrow-i"><Icon name={glyphOf(r.emoji)} /></span>
                    <div className="grow"><div className="tt">{r.name}</div><div className="ss">{exCount(r.ex.length)}</div></div>
                    <Icon name="chevronRight" className="chev" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="empty"><div className="ico"><Icon name="clipboard" /></div>{t('No routines yet.')}<br />{t('Create one or load the starter plan.')}</div>
                <Button icon="sparkles" onClick={loadStarterPlan}>{t('Load starter plan (Push / Pull / Legs)')}</Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
