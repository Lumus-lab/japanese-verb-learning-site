import { BookOpen, ListFilter, SearchCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

import { SearchBox } from '../components/SearchBox'
import { VERBS } from '../data/verbs'

export function HomePage() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">JAPANESE VERB LEARNING LAB</p>
        <h1>從規則到查詢，真正看懂日文動詞變化。</h1>
        <p>用繁體中文整理分類規則、完整變化和常見例外。先查詢，再理解。</p>
        <SearchBox />
        <p className="muted">
          {VERBS.length} 個已核對常用動詞，陌生動詞也能提供帶警告的規則推測。
        </p>
      </section>
      <section className="feature-grid" aria-label="學習入口">
        <Link className="feature-card" to="/guide">
          <BookOpen aria-hidden="true" />
          規則整理
        </Link>
        <Link className="feature-card" to="/dictionary">
          <ListFilter aria-hidden="true" />
          動詞字典
        </Link>
        <Link className="feature-card" to="/practice">
          <SearchCheck aria-hidden="true" />
          快速練習
        </Link>
      </section>
    </>
  )
}
