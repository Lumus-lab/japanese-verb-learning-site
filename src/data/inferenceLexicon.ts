import type { InferenceLexiconEntry } from "../domain/types";
import type { SourceRefId } from "./sourceRefs";

const GODAN_RU_SOURCE = ["jpf-te-form", "jmdict"] satisfies SourceRefId[];
const HONORIFIC_SOURCE = ["jpf-honorific", "jmdict"] satisfies SourceRefId[];

export const INFERENCE_LEXICON: InferenceLexiconEntry[] = [
  {
    dictionaryForm: "行く",
    reading: "いく",
    group: "godan",
    overrides: {
      te: { surface: "行って", reading: "いって", status: "standard" },
      ta: { surface: "行った", reading: "いった", status: "standard" },
    },
    notes: ["「て形」と「た形」は促音便になります。"],
    sourceRefs: ["jpf-te-form", "jmdict"],
  },
  {
    dictionaryForm: "ある",
    reading: "ある",
    group: "godan",
    overrides: {
      nai: { surface: "ない", reading: "ない", status: "standard" },
      potential: {
        surface: null,
        reading: null,
        status: "not-applicable",
        note: "存在を表す「ある」の可能形は通常使用しません。",
      },
      passive: {
        surface: null,
        reading: null,
        status: "not-applicable",
        note: "存在を表す「ある」の受身形は初級では通常扱いません。",
      },
      causative: {
        surface: null,
        reading: null,
        status: "not-applicable",
        note: "存在を表す「ある」の使役形は初級では通常扱いません。",
      },
      causativePassive: {
        surface: null,
        reading: null,
        status: "not-applicable",
        note: "存在を表す「ある」の使役受身形は初級では通常扱いません。",
      },
    },
    notes: ["否定形は「あらない」ではなく「ない」です。"],
    sourceRefs: ["jpf-conjugation", "jmdict"],
  },
  ...[
    ["帰る", "かえる"],
    ["入る", "はいる"],
    ["走る", "はしる"],
    ["知る", "しる"],
    ["切る", "きる"],
    ["要る", "いる"],
    ["減る", "へる"],
    ["蹴る", "ける"],
    ["滑る", "すべる"],
    ["喋る", "しゃべる"],
    ["焦る", "あせる"],
    ["限る", "かぎる"],
    ["握る", "にぎる"],
  ].map(([dictionaryForm, reading]) => ({
    dictionaryForm,
    reading,
    group: "godan" as const,
    notes: ["「-いる / -える」で終わりますが、五段動詞です。"],
    sourceRefs: [...GODAN_RU_SOURCE],
  })),
  {
    dictionaryForm: "くださる",
    reading: "くださる",
    group: "godan",
    overrides: {
      masu: {
        surface: "くださいます",
        reading: "くださいます",
        status: "standard",
      },
      imperative: { surface: "ください", reading: "ください", status: "standard" },
    },
    notes: ["尊敬語として使われる特殊な五段動詞です。"],
    sourceRefs: [...HONORIFIC_SOURCE],
  },
  {
    dictionaryForm: "なさる",
    reading: "なさる",
    group: "godan",
    overrides: {
      masu: { surface: "なさいます", reading: "なさいます", status: "standard" },
      imperative: { surface: "なさい", reading: "なさい", status: "standard" },
    },
    notes: ["尊敬語として使われる特殊な五段動詞です。"],
    sourceRefs: [...HONORIFIC_SOURCE],
  },
  {
    dictionaryForm: "いらっしゃる",
    reading: "いらっしゃる",
    group: "godan",
    overrides: {
      masu: {
        surface: "いらっしゃいます",
        reading: "いらっしゃいます",
        status: "standard",
      },
      imperative: {
        surface: "いらっしゃい",
        reading: "いらっしゃい",
        status: "standard",
      },
    },
    notes: ["尊敬語として使われる特殊な五段動詞です。"],
    sourceRefs: [...HONORIFIC_SOURCE],
  },
  {
    dictionaryForm: "おっしゃる",
    reading: "おっしゃる",
    group: "godan",
    overrides: {
      masu: {
        surface: "おっしゃいます",
        reading: "おっしゃいます",
        status: "standard",
      },
      imperative: {
        surface: "おっしゃい",
        reading: "おっしゃい",
        status: "standard",
      },
    },
    notes: ["尊敬語として使われる特殊な五段動詞です。"],
    sourceRefs: [...HONORIFIC_SOURCE],
  },
];
