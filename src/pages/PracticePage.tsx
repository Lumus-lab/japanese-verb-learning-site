import { useState } from 'react'

import { buildPracticeQuestion } from '../domain/practice'
import type { PracticeMode } from '../domain/practice'

const PRACTICE_MODES: { id: PracticeMode; label: string }[] = [
  { id: 'mixed', label: '混合' },
  { id: 'form', label: '變化形' },
  { id: 'group', label: '動詞分類' },
]

export function PracticePage() {
  const [mode, setMode] = useState<PracticeMode>('mixed')
  const [question, setQuestion] = useState(() =>
    buildPracticeQuestion(Math.random, 'mixed'),
  )
  const [selected, setSelected] = useState<string | null>(null)

  const chooseMode = (nextMode: PracticeMode) => {
    setMode(nextMode)
    setQuestion(buildPracticeQuestion(Math.random, nextMode))
    setSelected(null)
  }

  const next = () => {
    setQuestion(buildPracticeQuestion(Math.random, mode))
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
        <div className="mode-controls" role="group" aria-label="練習模式">
          {PRACTICE_MODES.map((option) => (
            <button
              aria-pressed={mode === option.id}
              className="mode-button"
              key={option.id}
              onClick={() => chooseMode(option.id)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
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
