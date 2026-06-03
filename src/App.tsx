import { VERBS } from './data/verbs'

function App() {
  return (
    <main className="app-shell">
      <p className="eyebrow">PUBLIC LEARNING RESOURCE</p>
      <h1>日文動詞全解析系統</h1>
      <p>規則、查詢與練習都從同一套已核對資料出發。</p>
      <strong>{VERBS.length} 個已核對常用動詞</strong>
    </main>
  )
}

export default App
