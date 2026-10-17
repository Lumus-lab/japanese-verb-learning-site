import { Link } from 'react-router-dom'

import type { VerbEntry } from '../domain/types'

export function VerbCard({ verb }: { verb: VerbEntry }) {
  return (
    <Link className="verb-card" to={`/verbs/${verb.id}`}>
      <strong lang="ja">{verb.dictionaryForm}</strong>
      <span lang="ja">{verb.reading}</span>
      <small>
        {verb.meanings.join('、')} · {verb.jlptLevel} 參考
      </small>
    </Link>
  )
}
