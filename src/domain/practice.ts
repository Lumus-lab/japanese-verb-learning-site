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

export type PracticeQuestionOptions = {
  formId?: VerbFormId
  formIds?: readonly VerbFormId[]
}

export const DEFAULT_PRACTICE_FORM_IDS = FORM_DEFINITIONS.map(
  (form) => form.id,
)

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

const uniqueFormIds = (formIds: readonly VerbFormId[]) =>
  FORM_DEFINITIONS.flatMap((form) =>
    formIds.includes(form.id) ? [form.id] : [],
  )

export const buildPracticeFormQueue = (
  formIds: readonly VerbFormId[] = DEFAULT_PRACTICE_FORM_IDS,
  random: () => number = Math.random,
) => {
  const remaining = uniqueFormIds(formIds)
  const queue: VerbFormId[] = []

  while (remaining.length > 0) {
    const index = Math.floor(random() * remaining.length) % remaining.length
    queue.push(remaining.splice(index, 1)[0])
  }

  return queue
}

export const buildPracticeQuestion = (
  random: () => number = Math.random,
  requestedMode: PracticeMode = 'mixed',
  options: PracticeQuestionOptions = {},
): PracticeQuestion => {
  const kind =
    requestedMode === 'mixed'
      ? random() < 0.5
        ? 'group'
        : 'form'
      : requestedMode

  if (kind === 'group') {
    const verb = pick(VERBS, random)
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

  const selectedFormIds = uniqueFormIds(
    options.formIds ?? DEFAULT_PRACTICE_FORM_IDS,
  )
  const requestedFormIds = options.formId ? [options.formId] : selectedFormIds
  const candidateVerbs = VERBS.filter((verb) => {
    const forms = conjugate(verb)
    return requestedFormIds.some((formId) => {
      const value = forms[formId]
      return value.status !== 'not-applicable' && Boolean(value.surface)
    })
  })
  const verb = pick(candidateVerbs.length > 0 ? candidateVerbs : VERBS, random)
  const forms = conjugate(verb)
  const availableForms = FORM_DEFINITIONS.filter((form) => {
    const value = forms[form.id]
    return (
      selectedFormIds.includes(form.id) &&
      value.status !== 'not-applicable' &&
      Boolean(value.surface)
    )
  })
  const requestedForm = options.formId
    ? availableForms.find((form) => form.id === options.formId)
    : undefined
  const form = requestedForm ?? pick(availableForms, random)
  const answer = forms[form.id].surface!
  const distractors = unique(
    FORM_DEFINITIONS
      .map((definition) => forms[definition.id].surface)
      .filter((value): value is string => Boolean(value) && value !== answer),
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
