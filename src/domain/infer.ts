import { INFERENCE_LEXICON } from "../data/inferenceLexicon";
import { VERBS } from "../data/verbs";
import { conjugate } from "./conjugate";
import type {
  ConjugationTable,
  InferenceStatus,
  VerbEntry,
  VerbGroup,
} from "./types";

const WARNING = "推測結果，可能未涵蓋例外，請再查字典。";
const READING_TAIL_MISMATCH_MESSAGE =
  "補充的假名和辭書形字尾不一致，請確認讀音。";
const GODAN_TAILS = new Set(["う", "く", "ぐ", "す", "つ", "ぬ", "ぶ", "む"]);
const I_E_KANA = new Set(
  "いきしちにひみりぎじぢびぴえけせてねへめれげぜでべぺ".split(""),
);

const hasKanji = (value: string) => /[\u3400-\u9fff]/u.test(value);

type InferredCandidate = {
  dictionaryForm: string;
  reading: string;
  group: VerbGroup;
  notes: string[];
  forms: ConjugationTable;
};

export type InferenceResult = {
  status: InferenceStatus;
  warning: string;
  message?: string;
  candidates: InferredCandidate[];
};

type CandidateSource = Pick<
  VerbEntry,
  "dictionaryForm" | "reading" | "group" | "overrides"
> & {
  notes?: string[];
};

const candidateFrom = (value: CandidateSource): InferredCandidate => ({
  dictionaryForm: value.dictionaryForm,
  reading: value.reading,
  group: value.group,
  notes: value.notes ?? [],
  forms: conjugate(value),
});

const unsupported = (message: string): InferenceResult => ({
  status: "unsupported",
  warning: WARNING,
  message,
  candidates: [],
});

const heuristic = (value: CandidateSource): InferenceResult => {
  try {
    return {
      status: "heuristic",
      warning: WARNING,
      candidates: [candidateFrom(value)],
    };
  } catch {
    return unsupported(READING_TAIL_MISMATCH_MESSAGE);
  }
};

export const inferVerb = (
  input: string,
  suppliedReading?: string,
): InferenceResult => {
  const dictionaryForm = input.trim();
  const normalizedReading = suppliedReading?.trim() ?? "";
  const hasSuppliedReading = normalizedReading.length > 0;
  const reading = hasSuppliedReading ? normalizedReading : dictionaryForm;

  const knownMatches = VERBS.filter(
    (verb) =>
      verb.dictionaryForm === dictionaryForm || verb.reading === dictionaryForm,
  );
  const lexiconMatches = INFERENCE_LEXICON.filter(
    (verb) =>
      verb.dictionaryForm === dictionaryForm || verb.reading === dictionaryForm,
  );
  const matches: CandidateSource[] =
    knownMatches.length > 0 ? knownMatches : lexiconMatches;

  if (matches.length > 1) {
    return {
      status: "ambiguous",
      warning: WARNING,
      candidates: matches.map(candidateFrom),
    };
  }

  if (matches.length === 1) {
    return {
      status: "lexicon-assisted",
      warning: WARNING,
      candidates: matches.map(candidateFrom),
    };
  }

  if (!dictionaryForm) {
    return unsupported("請輸入日文辭書形。");
  }

  const dictionaryTail = dictionaryForm.slice(-1);
  const looksLikeDictionaryForm =
    dictionaryForm.endsWith("する") ||
    dictionaryForm === "来る" ||
    GODAN_TAILS.has(dictionaryTail) ||
    dictionaryTail === "る";

  if (!looksLikeDictionaryForm) {
    return unsupported("目前只能推測日文動詞的辭書形。");
  }

  if (hasKanji(dictionaryForm) && !hasSuppliedReading) {
    return unsupported(
      "這個未收錄動詞需要補充完整假名，才能產生可靠的推測讀音。",
    );
  }

  if (dictionaryForm.endsWith("する")) {
    if (!reading.endsWith("する")) {
      return unsupported(READING_TAIL_MISMATCH_MESSAGE);
    }

    return heuristic({ dictionaryForm, reading, group: "irregular" });
  }

  if (dictionaryForm === "来る") {
    return heuristic({
      dictionaryForm: "来る",
      reading: "くる",
      group: "irregular",
    });
  }

  const tail = reading.slice(-1);
  const previous = reading.slice(-2, -1);
  if (hasSuppliedReading && dictionaryTail !== tail) {
    return unsupported(READING_TAIL_MISMATCH_MESSAGE);
  }

  if (!GODAN_TAILS.has(tail) && tail !== "る") {
    return unsupported("目前只能推測日文動詞的辭書形。");
  }

  const group: VerbGroup =
    tail !== "る" && GODAN_TAILS.has(tail)
      ? "godan"
      : tail === "る" && I_E_KANA.has(previous)
        ? "ichidan"
        : "godan";
  const notes =
    group === "ichidan"
      ? ["「る」前面的音位於い段或え段，因此暫時依一段動詞推測。"]
      : ["依辭書形字尾暫時套用五段動詞規則。"];

  return heuristic({ dictionaryForm, reading, group, notes });
};
