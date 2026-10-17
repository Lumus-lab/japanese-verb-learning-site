import { Link } from 'react-router-dom'
import { SearchBox } from '../components/SearchBox'
import { LumusIcon } from '../components/LumusIcon'
import { VERBS } from '../data/verbs'
import { FORM_DEFINITIONS } from '../data/forms'
import { conjugate } from '../domain/conjugate'

const sample = VERBS.find((verb) => verb.id === 'taberu')!
const forms = conjugate(sample)
const sampleForms = FORM_DEFINITIONS.filter((form) => ['masu', 'nai', 'te', 'ta'].includes(form.id))
const entries = [
  { to: '/guide', title: '規則整理', description: '分類、變化公式與常見例外。' },
  { to: '/dictionary', title: '動詞字典', description: '依分類、級別與字尾，找到要學的動詞。' },
  { to: '/practice', title: '快速練習', description: '練習分類與變化，回答後立即核對。' },
]

export function HomePage() {
  return (
    <>
      <section className="hero" aria-labelledby="home-title">
        <div className="hero-copy">
          <h1 id="home-title">日文動詞<br />全解析系統</h1>
          <p className="hero-lead">從規則到查詢，真正看懂日文動詞變化。</p>
          <p className="hero-description">用繁體中文整理分類規則、完整變化和常見例外。先查詢，再理解。</p>
          <SearchBox />
          <p className="search-note">{VERBS.length} 個已核對常用動詞；未收錄的動詞提供附警告的規則推測。</p>
        </div>
        <section className="verb-sample" aria-label="常用活用示例">
          <div className="sample-heading">
            <h2 lang="ja"><ruby>{sample.dictionaryForm}<rt>{sample.reading}</rt></ruby></h2>
            <span>{sample.meanings.join('、')} · 一段動詞</span>
          </div>
          <dl className="sample-forms">
            {sampleForms.map((form) => (
              <div key={form.id}><dt>{form.label}</dt><dd lang="ja">{forms[form.id].surface}</dd></div>
            ))}
          </dl>
          <Link className="sample-link" to={`/verbs/${sample.id}`}>看完整 {FORM_DEFINITIONS.length} 種活用<LumusIcon name="arrow" /></Link>
        </section>
      </section>
      <nav className="learning-entries" aria-label="學習入口">
        {entries.map((entry) => (
          <Link className="learning-entry" to={entry.to} key={entry.to}>
            <span className="entry-title">{entry.title}</span>
            <span className="entry-description">{entry.description}</span>
            <LumusIcon name="arrow" />
          </Link>
        ))}
      </nav>
    </>
  )
}
