import { describe, expect, it } from 'vitest'

import { buildPracticeQuestion } from './practice'

describe('buildPracticeQuestion', () => {
  it('generates a group question from confirmed data', () => {
    const question = buildPracticeQuestion(() => 0, 'group')

    expect(question.kind).toBe('group')
    expect(question.options).toContain(question.answer)
    expect(question.source).toBe('confirmed')
  })

  it('generates a form question with four distinct options', () => {
    const question = buildPracticeQuestion(() => 0.4, 'form')

    expect(question.kind).toBe('form')
    expect(new Set(question.options)).toHaveLength(4)
    expect(question.options).toContain(question.answer)
  })

  it('never asks for a non-applicable form', () => {
    for (let index = 0; index < 100; index += 1) {
      expect(buildPracticeQuestion(() => index / 100, 'form').answer).not.toBe(
        '通常不使用',
      )
    }
  })
})
