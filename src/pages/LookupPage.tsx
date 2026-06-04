import { type FormEvent, useState } from 'react'
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'

import { SearchBox } from '../components/SearchBox'
import { StatusBadge } from '../components/StatusBadge'
import { VerbDetail } from '../components/VerbDetail'
import { VERBS } from '../data/verbs'
import { inferVerb } from '../domain/infer'
import { searchVerbs } from '../domain/search'

function ReadingPrompt({ dictionaryForm }: { dictionaryForm: string }) {
  const [reading, setReading] = useState('')
  const navigate = useNavigate()

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = reading.trim()
    if (trimmed) {
      navigate(
        `/lookup?q=${encodeURIComponent(dictionaryForm)}&reading=${encodeURIComponent(trimmed)}`,
      )
    }
  }

  return (
    <form className="reading-prompt" onSubmit={submit}>
      <label>
        補充完整假名
        <input
          aria-label="補充完整假名"
          onChange={(event) => setReading(event.target.value)}
          value={reading}
        />
      </label>
      <button type="submit">使用假名推測</button>
    </form>
  )
}

export function LookupPage() {
  const [params] = useSearchParams()
  const query = params.get('q')?.trim() ?? ''
  const suppliedReading = params.get('reading')?.trim() || undefined
  const confirmed = searchVerbs(query)

  if (!query) {
    return (
      <>
        <SearchBox />
        <p>請輸入日文動詞或繁體中文意思。</p>
      </>
    )
  }

  if (confirmed.length > 1) {
    return (
      <>
        <SearchBox initialQuery={query} />
        <h1>找到多個已核對結果</h1>
        {confirmed.map((verb) => (
          <VerbDetail key={verb.id} verb={verb} />
        ))}
      </>
    )
  }

  if (confirmed.length === 1) {
    return (
      <>
        <SearchBox initialQuery={query} />
        <StatusBadge kind="confirmed" />
        <VerbDetail verb={confirmed[0]} />
      </>
    )
  }

  const inferred = inferVerb(query, suppliedReading)

  if (inferred.status === 'unsupported') {
    return (
      <>
        <SearchBox initialQuery={query} />
        <h1>尚未收錄</h1>
        <p>{inferred.message}</p>
        {inferred.message?.includes('補充完整假名') && (
          <ReadingPrompt dictionaryForm={query} />
        )}
      </>
    )
  }

  if (inferred.status === 'ambiguous') {
    return (
      <>
        <SearchBox initialQuery={query} />
        <h1>請選擇你要查詢的動詞</h1>
        <p>{inferred.warning}</p>
        {inferred.candidates.map((verb) => (
          <VerbDetail
            key={`${verb.dictionaryForm}-${verb.group}`}
            verb={{ ...verb, meanings: [] }}
          />
        ))}
      </>
    )
  }

  const candidate = inferred.candidates[0]

  return (
    <>
      <SearchBox initialQuery={query} />
      <StatusBadge
        kind={inferred.status === 'lexicon-assisted' ? 'assisted' : 'heuristic'}
      />
      <p className="warning">{inferred.warning}</p>
      <VerbDetail verb={{ ...candidate, meanings: [] }} />
    </>
  )
}

export function VerbPage() {
  const { verbId } = useParams()
  const verbIndex = VERBS.findIndex((entry) => entry.id === verbId)
  const verb = verbIndex >= 0 ? VERBS[verbIndex] : undefined

  if (!verb) {
    return (
      <>
        <h1>找不到這個動詞</h1>
        <p>請回到動詞字典重新選擇。</p>
      </>
    )
  }

  const previousVerb = VERBS[verbIndex - 1]
  const nextVerb = VERBS[verbIndex + 1]

  return (
    <>
      <StatusBadge kind="confirmed" />
      <p className="sequence-position">
        {verbIndex + 1} / {VERBS.length}
      </p>
      <nav className="verb-sequence-nav" aria-label="動詞詳情導覽">
        {previousVerb && (
          <Link
            aria-label={`上一個 ${previousVerb.dictionaryForm}`}
            className="sequence-arrow previous"
            to={`/verbs/${previousVerb.id}`}
          >
            ←
          </Link>
        )}
        {nextVerb && (
          <Link
            aria-label={`下一個 ${nextVerb.dictionaryForm}`}
            className="sequence-arrow next"
            to={`/verbs/${nextVerb.id}`}
          >
            →
          </Link>
        )}
      </nav>
      <VerbDetail verb={verb} />
    </>
  )
}
