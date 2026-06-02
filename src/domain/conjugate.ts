import { FORM_DEFINITIONS } from "../data/forms";
import type {
  ConjugationTable,
  VerbEntry,
  VerbFormValue,
} from "./types";

type GodanRow = {
  a: string;
  i: string;
  e: string;
  o: string;
  te: string;
  ta: string;
};

export const GODAN_ROWS: Record<string, GodanRow> = {
  う: { a: "わ", i: "い", e: "え", o: "お", te: "って", ta: "った" },
  く: { a: "か", i: "き", e: "け", o: "こ", te: "いて", ta: "いた" },
  ぐ: { a: "が", i: "ぎ", e: "げ", o: "ご", te: "いで", ta: "いだ" },
  す: { a: "さ", i: "し", e: "せ", o: "そ", te: "して", ta: "した" },
  つ: { a: "た", i: "ち", e: "て", o: "と", te: "って", ta: "った" },
  ぬ: { a: "な", i: "に", e: "ね", o: "の", te: "んで", ta: "んだ" },
  ぶ: { a: "ば", i: "び", e: "べ", o: "ぼ", te: "んで", ta: "んだ" },
  む: { a: "ま", i: "み", e: "め", o: "も", te: "んで", ta: "んだ" },
  る: { a: "ら", i: "り", e: "れ", o: "ろ", te: "って", ta: "った" },
};

type ConjugatableVerb = Pick<
  VerbEntry,
  "dictionaryForm" | "reading" | "group" | "overrides"
>;

function standard(surface: string, reading: string): VerbFormValue {
  return { surface, reading, status: "standard" };
}

function generateGodan({
  dictionaryForm,
  reading,
}: ConjugatableVerb): ConjugationTable {
  const surfaceTail = dictionaryForm.slice(-1);
  const readingTail = reading.slice(-1);
  const row = GODAN_ROWS[readingTail];

  if (!row) {
    throw new Error(
      `Unsupported godan reading tail "${readingTail}" for ${dictionaryForm}`,
    );
  }

  if (surfaceTail !== readingTail) {
    throw new Error(
      `Godan surface/reading tail mismatch: ${dictionaryForm}/${reading}`,
    );
  }

  const surfaceStem = dictionaryForm.slice(0, -1);
  const readingStem = reading.slice(0, -1);
  const form = (ending: string) =>
    standard(`${surfaceStem}${ending}`, `${readingStem}${ending}`);

  return {
    dictionary: standard(dictionaryForm, reading),
    masu: form(`${row.i}ます`),
    nai: form(`${row.a}ない`),
    te: form(row.te),
    ta: form(row.ta),
    ba: form(`${row.e}ば`),
    tara: form(`${row.ta}ら`),
    volitional: form(`${row.o}う`),
    imperative: form(row.e),
    prohibitive: standard(`${dictionaryForm}な`, `${reading}な`),
    potential: form(`${row.e}る`),
    passive: form(`${row.a}れる`),
    causative: form(`${row.a}せる`),
    causativePassive: form(`${row.a}せられる`),
  };
}

function generateIchidan({
  dictionaryForm,
  reading,
}: ConjugatableVerb): ConjugationTable {
  if (!dictionaryForm.endsWith("る") || !reading.endsWith("る")) {
    throw new Error(
      `Invalid ichidan ending: expected dictionaryForm and reading to end with "る", received ${dictionaryForm}/${reading}`,
    );
  }

  const surfaceStem = dictionaryForm.slice(0, -1);
  const readingStem = reading.slice(0, -1);
  const form = (ending: string) =>
    standard(`${surfaceStem}${ending}`, `${readingStem}${ending}`);

  return {
    dictionary: standard(dictionaryForm, reading),
    masu: form("ます"),
    nai: form("ない"),
    te: form("て"),
    ta: form("た"),
    ba: form("れば"),
    tara: form("たら"),
    volitional: form("よう"),
    imperative: form("ろ"),
    prohibitive: standard(`${dictionaryForm}な`, `${reading}な`),
    potential: form("られる"),
    passive: form("られる"),
    causative: form("させる"),
    causativePassive: form("させられる"),
  };
}

function generateSuru(
  dictionaryForm: string,
  reading: string,
): ConjugationTable {
  const surfaceStem = dictionaryForm.slice(0, -2);
  const readingStem = reading.slice(0, -2);
  const form = (ending: string) =>
    standard(`${surfaceStem}${ending}`, `${readingStem}${ending}`);

  return {
    dictionary: standard(dictionaryForm, reading),
    masu: form("します"),
    nai: form("しない"),
    te: form("して"),
    ta: form("した"),
    ba: form("すれば"),
    tara: form("したら"),
    volitional: form("しよう"),
    imperative: form("しろ"),
    prohibitive: standard(`${dictionaryForm}な`, `${reading}な`),
    potential: form("できる"),
    passive: form("される"),
    causative: form("させる"),
    causativePassive: form("させられる"),
  };
}

function generateKuru(
  dictionaryForm: string,
  reading: string,
): ConjugationTable {
  const surfaceStem = dictionaryForm.slice(0, -2);
  const readingStem = reading.slice(0, -2);
  const form = (surfaceEnding: string, readingEnding: string) =>
    standard(
      `${surfaceStem}${surfaceEnding}`,
      `${readingStem}${readingEnding}`,
    );

  return {
    dictionary: standard(dictionaryForm, reading),
    masu: form("来ます", "きます"),
    nai: form("来ない", "こない"),
    te: form("来て", "きて"),
    ta: form("来た", "きた"),
    ba: form("来れば", "くれば"),
    tara: form("来たら", "きたら"),
    volitional: form("来よう", "こよう"),
    imperative: form("来い", "こい"),
    prohibitive: standard(`${dictionaryForm}な`, `${reading}な`),
    potential: form("来られる", "こられる"),
    passive: form("来られる", "こられる"),
    causative: form("来させる", "こさせる"),
    causativePassive: form("来させられる", "こさせられる"),
  };
}

function generateIrregular({
  dictionaryForm,
  reading,
}: ConjugatableVerb): ConjugationTable {
  if (dictionaryForm.endsWith("する") && reading.endsWith("する")) {
    return generateSuru(dictionaryForm, reading);
  }

  if (dictionaryForm.endsWith("来る") && reading.endsWith("くる")) {
    return generateKuru(dictionaryForm, reading);
  }

  throw new Error(`Unsupported irregular verb: ${dictionaryForm}/${reading}`);
}

export function conjugate(verb: ConjugatableVerb): ConjugationTable {
  const generated =
    verb.group === "godan"
      ? generateGodan(verb)
      : verb.group === "ichidan"
        ? generateIchidan(verb)
        : generateIrregular(verb);

  const table = { ...generated };
  for (const { id } of FORM_DEFINITIONS) {
    table[id] = verb.overrides?.[id] ?? table[id];
  }
  return table;
}
