import { FORM_DEFINITIONS } from '../data/forms'
import { conjugate } from '../domain/conjugate'
import type { ConjugationTable, VerbEntry, VerbGroup } from '../domain/types'

type VerbDetailValue = {
  dictionaryForm: string
  reading: string
  group: VerbGroup
  meanings: string[]
  notes: string[]
  overrides?: VerbEntry['overrides']
  forms?: ConjugationTable
}

export function VerbDetail({ verb }: { verb: VerbDetailValue }) {
  const forms = verb.forms ?? conjugate(verb)

  return (
    <article className="verb-detail">
      <header>
        <h1>{verb.dictionaryForm}</h1>
        <p className="reading">{verb.reading}</p>
        {verb.meanings.length > 0 && <p>{verb.meanings.join('、')}</p>}
        {verb.notes.length > 0 && (
          <ul className="notes">
            {verb.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        )}
      </header>
      <div className="form-grid">
        {FORM_DEFINITIONS.map((definition) => {
          const form = forms[definition.id]

          return (
            <section className={`form-card ${form.status}`} key={definition.id}>
              <h2>{definition.label}</h2>
              <p className="muted">{definition.description}</p>
              <strong>{form.surface ?? '通常不使用'}</strong>
              {form.reading && form.reading !== form.surface && (
                <small>{form.reading}</small>
              )}
              {form.note && <p className="note">{form.note}</p>}
            </section>
          )
        })}
      </div>
    </article>
  )
}
