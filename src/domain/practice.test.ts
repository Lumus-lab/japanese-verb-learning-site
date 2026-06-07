import { describe, expect, it } from 'vitest'

import { FORM_DEFINITIONS } from '../data/forms'
import { VERBS } from '../data/verbs'
import { conjugate } from './conjugate'
import { buildPracticeFormQueue, buildPracticeQuestion } from './practice'
import type { VerbFormId } from './types'

describe('buildPracticeQuestion', () => {
  it('generates a group question from confirmed data', () => {
    const question = buildPracticeQuestion(() => 0, 'group')

    expect(question.kind).toBe('group')
    expect(question.options).toContain(question.answer)
    expect(question.source).toBe('confirmed')
  })

  it('uses the selected mode when building questions', () => {
    expect(buildPracticeQuestion(() => 0.9, 'mixed').kind).toBe('form')
    expect(buildPracticeQuestion(() => 0, 'mixed').kind).toBe('group')
    expect(buildPracticeQuestion(() => 0.9, 'group').kind).toBe('group')
    expect(buildPracticeQuestion(() => 0, 'form').kind).toBe('form')
  })

  it('generates a form question with four distinct options', () => {
    const question = buildPracticeQuestion(() => 0.4, 'form')

    expect(question.kind).toBe('form')
    if (question.kind !== 'form') {
      throw new Error('Expected a form question')
    }
    expect(question.formId).toBeDefined()
    expect(new Set(question.options)).toHaveLength(4)
    expect(question.options).toContain(question.answer)
  })

  it('can build a form question for a requested form id', () => {
    const question = buildPracticeQuestion(() => 0.2, 'form', {
      formId: 'te',
      formIds: ['te', 'nai'],
    })

    expect(question.kind).toBe('form')
    if (question.kind !== 'form') {
      throw new Error('Expected a form question')
    }
    expect(question.formId).toBe('te')
  })

  it('builds a fair form queue that covers selected forms once per round', () => {
    const selectedForms: VerbFormId[] = ['te', 'nai', 'ta', 'potential']
    const queue = buildPracticeFormQueue(selectedForms, () => 0)

    expect(queue).toHaveLength(selectedForms.length)
    expect(new Set(queue)).toEqual(new Set(selectedForms))
  })

  it('includes the kana reading in form question prompts', () => {
    const question = buildPracticeQuestion(() => 0.4, 'form')

    expect(question.kind).toBe('form')

    const verb = VERBS.find((entry) => entry.id === question.verbId)
    expect(verb).toBeDefined()
    expect(question.prompt).toContain(
      `${verb!.dictionaryForm}（${verb!.reading}）`,
    )
  })

  it('builds form question options from the prompted verb only', () => {
    const question = buildPracticeQuestion(() => 0.05, 'form')

    expect(question.kind).toBe('form')

    const verb = VERBS.find((entry) => entry.id === question.verbId)
    expect(verb).toBeDefined()

    const sameVerbForms = new Set(
      FORM_DEFINITIONS.flatMap((form) => {
        const value = conjugate(verb!)[form.id]
        return value.status === 'not-applicable' || !value.surface
          ? []
          : [value.surface]
      }),
    )

    expect(sameVerbForms.has(question.answer)).toBe(true)
    expect(question.options).toHaveLength(4)
    for (const option of question.options) {
      expect(sameVerbForms.has(option)).toBe(true)
    }
  })

  it('can ask about the prohibitive form', () => {
    const questions = Array.from({ length: 100 }, (_, index) =>
      buildPracticeQuestion(() => index / 100, 'form'),
    )

    expect(
      questions.some(
        (question) =>
          question.kind === 'form' && question.formId === 'prohibitive',
      ),
    ).toBe(true)
  })

  it('never asks for a non-applicable form', () => {
    for (let index = 0; index < 100; index += 1) {
      expect(buildPracticeQuestion(() => index / 100, 'form').answer).not.toBe(
        '通常不使用',
      )
    }
  })
})
