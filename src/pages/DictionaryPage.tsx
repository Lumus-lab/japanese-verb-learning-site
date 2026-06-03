import { useMemo, useState } from 'react'

import { VerbCard } from '../components/VerbCard'
import { VERBS } from '../data/verbs'
import type { JlptLevel, VerbGroup } from '../domain/types'

export function DictionaryPage() {
  const [group, setGroup] = useState<VerbGroup | 'all'>('all')
  const [jlpt, setJlpt] = useState<JlptLevel | 'all'>('all')
  const [tail, setTail] = useState('all')
  const [tag, setTag] = useState('all')
  const [exceptionsOnly, setExceptionsOnly] = useState(false)
  const [query, setQuery] = useState('')
  const tags = [...new Set(VERBS.flatMap((verb) => verb.tags))].sort()
  const trimmedQuery = query.trim()

  const verbs = useMemo(
    () =>
      VERBS.filter(
        (verb) =>
          (group === 'all' || verb.group === group) &&
          (jlpt === 'all' || verb.jlptLevel === jlpt) &&
          (tail === 'all' || verb.reading.endsWith(tail)) &&
          (tag === 'all' || verb.tags.includes(tag)) &&
          (!exceptionsOnly || verb.isException) &&
          (!trimmedQuery ||
            [verb.dictionaryForm, verb.reading, ...verb.meanings].some(
              (value) => value.includes(trimmedQuery),
            )),
      ),
    [exceptionsOnly, group, jlpt, tag, tail, trimmedQuery],
  )

  return (
    <>
      <header className="page-heading">
        <p className="eyebrow">DICTIONARY</p>
        <h1>動詞字典</h1>
        <p>{verbs.length} 個結果</p>
      </header>
      <section className="filter-bar" aria-label="字典篩選">
        <input
          aria-label="篩選關鍵字"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="漢字、假名或繁中意思"
          value={query}
        />
        <select
          aria-label="動詞分類"
          onChange={(event) => setGroup(event.target.value as VerbGroup | 'all')}
          value={group}
        >
          <option value="all">全部分類</option>
          <option value="godan">五段動詞</option>
          <option value="ichidan">一段動詞</option>
          <option value="irregular">不規則動詞</option>
        </select>
        <select
          aria-label="JLPT 參考級別"
          onChange={(event) => setJlpt(event.target.value as JlptLevel | 'all')}
          value={jlpt}
        >
          <option value="all">全部級別</option>
          <option value="N5">N5 參考</option>
          <option value="N4">N4 參考</option>
          <option value="N3">N3 參考</option>
          <option value="N2">N2 參考</option>
          <option value="N1">N1 參考</option>
        </select>
        <select
          aria-label="辭書形字尾"
          onChange={(event) => setTail(event.target.value)}
          value={tail}
        >
          <option value="all">全部字尾</option>
          {['う', 'く', 'ぐ', 'す', 'つ', 'ぬ', 'ぶ', 'む', 'る'].map(
            (value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ),
          )}
        </select>
        <select
          aria-label="主題標籤"
          onChange={(event) => setTag(event.target.value)}
          value={tag}
        >
          <option value="all">全部主題</option>
          {tags.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <label>
          <input
            checked={exceptionsOnly}
            onChange={(event) => setExceptionsOnly(event.target.checked)}
            type="checkbox"
          />
          只顯示常見例外
        </label>
      </section>
      <div className="verb-grid">
        {verbs.map((verb) => (
          <VerbCard key={verb.id} verb={verb} />
        ))}
      </div>
    </>
  )
}
