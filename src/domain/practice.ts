import { FORM_DEFINITIONS } from '../data/forms'
import { VERBS } from '../data/verbs'
import { conjugate } from './conjugate'
import type { VerbFormId } from './types'

type PracticeQuestionBase = {
  prompt: string
  options: string[]
  answer: string
  explanation: string
  source: 'confirmed'
  verbId: string
}

export type PracticeQuestion =
  | (PracticeQuestionBase & {
      kind: 'group'
    })
  | (PracticeQuestionBase & {
      kind: 'form'
      formId: VerbFormId
    })

export type PracticeMode = PracticeQuestion['kind'] | 'mixed'

const groupLabels = {
  godan: '五段動詞',
  ichidan: '一段動詞',
  irregular: '不規則動詞',
}

const pick = <T,>(items: T[], random: () => number) =>
  items[Math.floor(random() * items.length) % items.length]

const rotate = <T,>(items: T[], random: () => number) => {
  const offset = Math.floor(random() * items.length) % items.length
  return [...items.slice(offset), ...items.slice(0, offset)]
}

const unique = (items: string[]) => [...new Set(items)]

export const buildPracticeQuestion = (
  random: () => number = Math.random,
  requestedMode: PracticeMode = 'mixed',
): PracticeQuestion => {
  const verb = pick(VERBS, random)
  const kind =
    requestedMode === 'mixed'
      ? random() < 0.5
        ? 'group'
        : 'form'
      : requestedMode

  if (kind === 'group') {
    const answer = groupLabels[verb.group]

    return {
      kind,
      prompt: `${verb.dictionaryForm}（${verb.reading}）屬於哪一類動詞？`,
      options: rotate(Object.values(groupLabels), random),
      answer,
      explanation: `${verb.dictionaryForm} 是${answer}。`,
      source: 'confirmed',
      verbId: verb.id,
    }
  }

  const forms = conjugate(verb)
  const availableForms = FORM_DEFINITIONS.filter((form) => {
    const value = forms[form.id]
    return value.status !== 'not-applicable' && Boolean(value.surface)
  })
  const form = pick(availableForms, random)
  const answer = forms[form.id].surface!
  const distractors = unique(
    availableForms
      .map((definition) => forms[definition.id].surface!)
      .filter((value) => value !== answer),
  ).slice(0, 3)

  if (distractors.length < 3) {
    throw new Error(
      `Not enough same-verb form options for ${verb.dictionaryForm}`,
    )
  }

  return {
    kind,
    prompt: `${verb.dictionaryForm}（${verb.reading}）的${form.label}是哪一個？`,
    options: rotate([answer, ...distractors], random),
    answer,
    explanation: `${verb.dictionaryForm} 的${form.label}是 ${answer}。`,
    source: 'confirmed',
    verbId: verb.id,
    formId: form.id,
  }
}
