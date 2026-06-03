import { Search } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function SearchBox({ initialQuery = '' }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery)
  const navigate = useNavigate()

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = query.trim()
    if (trimmed) navigate(`/lookup?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <form className="search-box" onSubmit={submit}>
      <Search aria-hidden="true" size={20} />
      <input
        aria-label="搜尋動詞"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="輸入 食べる、たべる 或 吃"
        type="search"
        value={query}
      />
      <button type="submit">查詢</button>
    </form>
  )
}
