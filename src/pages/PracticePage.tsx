import { useState } from 'react'

import { buildPracticeQuestion } from '../domain/practice'

export function PracticePage() {
  const [question, setQuestion] = useState(() => buildPracticeQuestion())
  const [selected, setSelected] = useState<string | null>(null)

  const next = () => {
    setQuestion(buildPracticeQuestion())
    setSelected(null)
  }

  return (
    <>
      <header className="page-heading">
        <p className="eyebrow">PRACTICE</p>
        <h1>快速練習</h1>
        <p>題目只使用已核對資料，不記錄進度，隨時都能重新開始。</p>
      </header>
      <section className="practice-card">
        <h2>{question.prompt}</h2>
        <div className="option-grid">
          {question.options.map((option) => (
            <button
              disabled={selected !== null}
              key={option}
              onClick={() => setSelected(option)}
            >
              {option}
            </button>
          ))}
        </div>
        {selected && (
          <div
            className={
              selected === question.answer
                ? 'feedback correct'
                : 'feedback incorrect'
            }
          >
            <strong>
              {selected === question.answer ? '答對了。' : '答錯了。'}
              正確答案：{question.answer}
            </strong>
            <p>{question.explanation}</p>
            <button onClick={next}>下一題</button>
          </div>
        )}
      </section>
    </>
  )
}
