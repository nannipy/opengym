import { useState, useEffect } from 'react'
import { useStore } from '../../store/useStore.js'
import { useUI } from '../../store/useUI.js'
import { glyphOf, DEFAULT_GLYPH } from '../../lib/glyphs.js'
import { Button } from '../../components/ui.jsx'
import Icon from '../../components/Icon.jsx'
import { confirmSheet } from '../../sheets.jsx'
import TemplateEditor from './TemplateEditor.jsx'

export default function TemplatesView() {
  const templates = useStore(s => s.templates)
  const loading = useStore(s => s.loadingTemplates)
  const loadTemplates = useStore(s => s.loadTemplates)
  const saveTemplate = useStore(s => s.saveTemplate)
  const removeTemplate = useStore(s => s.removeTemplate)
  const toast = useUI(s => s.toast)

  const [editingTemplate, setEditingTemplate] = useState(null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    loadTemplates()
  }, [])

  const handleCreate = () => {
    setIsCreating(true)
    setEditingTemplate(null)
  }

  const handleEdit = (tmpl) => {
    setEditingTemplate(tmpl)
    setIsCreating(false)
  }

  const handleSave = async (tmplData) => {
    try {
      await saveTemplate(tmplData)
      toast('Template salvato con successo!')
      setEditingTemplate(null)
      setIsCreating(false)
    } catch (err) {
      toast(err.message || 'Errore durante il salvataggio del template')
    }
  }

  const handleDelete = (tmpl) => {
    confirmSheet({
      title: 'Elimina Template?',
      message: `Sei sicuro di voler eliminare il template "${tmpl.name}"? Non influenzerà le schede già assegnate ai clienti.`,
      confirmText: 'Elimina',
      danger: true,
      onConfirm: async () => {
        try {
          await removeTemplate(tmpl.id)
          toast('Template rimosso')
        } catch (err) {
          toast(err.message || 'Errore durante l\'eliminazione')
        }
      }
    })
  }

  if (isCreating || editingTemplate) {
    return (
      <TemplateEditor
        template={editingTemplate}
        onSave={handleSave}
        onCancel={() => {
          setIsCreating(false)
          setEditingTemplate(null)
        }}
      />
    )
  }

  return (
    <div className="narrow">
      <div className="hdr">
        <div>
          <h1>Template Schede</h1>
          <div className="sub">
            {templates ? `${templates.length} template salvati da assegnare ai clienti` : 'Caricamento…'}
          </div>
        </div>
        <Button variant="primary" size="sm" icon="plus" onClick={handleCreate}>
          Nuovo Template
        </Button>
      </div>

      {templates && templates.length > 0 ? (
        <div className="list">
          {templates.map(t => {
            const routinesCount = (t.routines || []).length
            const totalEx = (t.routines || []).reduce((acc, r) => acc + (r.ex?.length || 0), 0)
            return (
              <div
                key={t.id}
                className="item"
                onClick={() => handleEdit(t)}
                style={{ padding: '12px 14px' }}
              >
                <span className="lrow-i" style={{ background: 'var(--surface-2)', color: 'var(--acc)', fontSize: 20 }}>
                  <Icon name={glyphOf(t.emoji)} />
                </span>
                <div className="grow">
                  <div className="tt" style={{ fontWeight: 600 }}>{t.name}</div>
                  <div className="ss">
                    {routinesCount} split ({t.routines?.map(r => r.name).join(', ') || 'Nessuna routine'}) · {totalEx} esercizi
                  </div>
                </div>

                <button
                  className="iconbtn"
                  style={{ color: 'var(--red)', width: 32, height: 32, marginRight: 2 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(t)
                  }}
                  title="Elimina Template"
                >
                  <Icon name="trash" />
                </button>

                <Icon name="chevronRight" className="chev" />
              </div>
            )
          })}
        </div>
      ) : loading ? (
        <div className="empty">Caricamento template…</div>
      ) : (
        <div className="card empty">
          <div className="ico"><Icon name="clipboard" /></div>
          Nessun template creato.<br />
          Crea template riutilizzabili per assegnarli ai tuoi clienti in un click!
          <div style={{ marginTop: 14 }}>
            <Button variant="primary" icon="plus" onClick={handleCreate}>
              Crea Primo Template
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
