import { Link } from 'react-router-dom'

import type { VerbEntry } from '../domain/types'

export function VerbCard({ verb }: { verb: VerbEntry }) {
  return (
    <Link className="verb-card" to={`/verbs/${verb.id}`}>
      <strong>{verb.dictionaryForm}</strong>
      <span>{verb.reading}</span>
      <small>
        {verb.meanings.join('、')} · {verb.jlptLevel} 參考
      </small>
    </Link>
  )
}
