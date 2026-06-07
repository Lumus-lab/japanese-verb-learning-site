import { useState } from 'react'

import { FORM_DEFINITIONS } from '../data/forms'
import {
  DEFAULT_PRACTICE_FORM_IDS,
  buildPracticeFormQueue,
  buildPracticeQuestion,
} from '../domain/practice'
import type { PracticeMode } from '../domain/practice'
import type { VerbFormId } from '../domain/types'

const PRACTICE_MODES: { id: PracticeMode; label: string }[] = [
  { id: 'mixed', label: '混合' },
  { id: 'form', label: '變化形' },
  { id: 'group', label: '動詞分類' },
]

const nextQueuedQuestion = (
  mode: PracticeMode,
  formIds: readonly VerbFormId[],
  queue: readonly VerbFormId[],
) => {
  const buildFormQuestion = () => {
    const availableQueue = queue.filter((formId) => formIds.includes(formId))
    const readyQueue =
      availableQueue.length > 0
        ? availableQueue
        : buildPracticeFormQueue(formIds)
    const [formId, ...remainingQueue] = readyQueue

    return {
      question: buildPracticeQuestion(Math.random, 'form', {
        formId,
        formIds,
      }),
      queue: remainingQueue,
    }
  }

  if (mode === 'form') {
    return buildFormQuestion()
  }

  if (mode === 'mixed' && Math.random() >= 0.5) {
    return buildFormQuestion()
  }

  return {
    question: buildPracticeQuestion(Math.random, 'group'),
    queue: [...queue],
  }
}

export function PracticePage() {
  const [mode, setMode] = useState<PracticeMode>('mixed')
  const [selectedFormIds, setSelectedFormIds] = useState<VerbFormId[]>([
    ...DEFAULT_PRACTICE_FORM_IDS,
  ])
  const [formQueue, setFormQueue] = useState<VerbFormId[]>(() =>
    buildPracticeFormQueue(DEFAULT_PRACTICE_FORM_IDS),
  )
  const [question, setQuestion] = useState(() =>
    buildPracticeQuestion(Math.random, 'mixed', {
      formIds: DEFAULT_PRACTICE_FORM_IDS,
    }),
  )
  const [selected, setSelected] = useState<string | null>(null)

  const chooseMode = (nextMode: PracticeMode) => {
    const nextState = nextQueuedQuestion(nextMode, selectedFormIds, formQueue)
    setMode(nextMode)
    setQuestion(nextState.question)
    setFormQueue(nextState.queue)
    setSelected(null)
  }

  const next = () => {
    const nextState = nextQueuedQuestion(mode, selectedFormIds, formQueue)
    setQuestion(nextState.question)
    setFormQueue(nextState.queue)
    setSelected(null)
  }

  const toggleForm = (formId: VerbFormId) => {
    const nextFormIds = selectedFormIds.includes(formId)
      ? selectedFormIds.filter((selectedFormId) => selectedFormId !== formId)
      : [...selectedFormIds, formId]

    if (nextFormIds.length === 0) {
      return
    }

    const nextQueue = buildPracticeFormQueue(nextFormIds)
    const nextState =
      mode === 'group'
        ? {
            question,
            queue: nextQueue,
          }
        : nextQueuedQuestion(mode, nextFormIds, nextQueue)

    setSelectedFormIds(nextFormIds)
    setQuestion(nextState.question)
    setFormQueue(nextState.queue)
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
        {mode !== 'group' && (
          <fieldset className="form-scope-controls">
            <legend>練習範圍</legend>
            <div className="form-scope-grid">
              {FORM_DEFINITIONS.map((form) => {
                const isSelected = selectedFormIds.includes(form.id)
                return (
                  <label className="form-scope-option" key={form.id}>
                    <input
                      checked={isSelected}
                      disabled={isSelected && selectedFormIds.length === 1}
                      onChange={() => toggleForm(form.id)}
                      type="checkbox"
                    />
                    <span>{form.label}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>
        )}
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
