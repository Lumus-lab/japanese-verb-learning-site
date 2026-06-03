import { FORM_DEFINITIONS } from '../data/forms'
import { VERBS } from '../data/verbs'
import { conjugate } from './conjugate'

export type PracticeQuestion = {
  kind: 'group' | 'form'
  prompt: string
  options: string[]
  answer: string
  explanation: string
  source: 'confirmed'
}

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
  requestedKind?: PracticeQuestion['kind'],
): PracticeQuestion => {
  const verb = pick(VERBS, random)
  const kind = requestedKind ?? (random() < 0.5 ? 'group' : 'form')

  if (kind === 'group') {
    const answer = groupLabels[verb.group]

    return {
      kind,
      prompt: `${verb.dictionaryForm}（${verb.reading}）屬於哪一類動詞？`,
      options: rotate(Object.values(groupLabels), random),
      answer,
      explanation: `${verb.dictionaryForm} 是${answer}。`,
      source: 'confirmed',
    }
  }

  const availableForms = FORM_DEFINITIONS.filter(
    (form) => !['dictionary', 'prohibitive'].includes(form.id),
  ).filter((form) => conjugate(verb)[form.id].status !== 'not-applicable')
  const form = pick(availableForms, random)
  const answer = conjugate(verb)[form.id].surface!
  const distractors = unique(
    VERBS.flatMap((entry) => {
      const candidate = conjugate(entry)[form.id]
      return candidate.status === 'not-applicable' || !candidate.surface
        ? []
        : [candidate.surface]
    }).filter((value) => value !== answer),
  ).slice(0, 3)

  return {
    kind,
    prompt: `${verb.dictionaryForm} 的${form.label}是哪一個？`,
    options: rotate([answer, ...distractors], random),
    answer,
    explanation: `${verb.dictionaryForm} 的${form.label}是 ${answer}。`,
    source: 'confirmed',
  }
}
