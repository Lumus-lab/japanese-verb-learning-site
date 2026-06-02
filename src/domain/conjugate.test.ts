import { describe, expect, it } from "vitest";

import { FORM_DEFINITIONS } from "../data/forms";
import { conjugate } from "./conjugate";
import type {
  ConjugationTable,
  VerbEntry,
  VerbFormId,
  VerbFormValue,
  VerbGroup,
} from "./types";

function entry(
  dictionaryForm: string,
  reading: string,
  group: VerbGroup,
  overrides?: VerbEntry["overrides"],
): VerbEntry {
  return {
    id: dictionaryForm,
    dictionaryForm,
    reading,
    meanings: [],
    group,
    isException: false,
    tags: [],
    frequencyTier: "core",
    jlptLevel: "N5",
    jlptLevelType: "reference",
    notes: [],
    sourceRefs: [],
    overrides,
  };
}

function expectForm(
  table: ConjugationTable,
  id: VerbFormId,
  surface: string,
  reading: string,
) {
  expect(table[id]).toEqual({
    surface,
    reading,
    status: "standard",
  });
}

describe("conjugate", () => {
  it("generates the complete godan table for 書く", () => {
    const table = conjugate(entry("書く", "かく", "godan"));

    expect(Object.keys(table)).toEqual(FORM_DEFINITIONS.map(({ id }) => id));
    expectForm(table, "masu", "書きます", "かきます");
    expectForm(table, "nai", "書かない", "かかない");
    expectForm(table, "te", "書いて", "かいて");
    expectForm(table, "ta", "書いた", "かいた");
    expectForm(table, "potential", "書ける", "かける");
    expectForm(table, "causativePassive", "書かせられる", "かかせられる");
  });

  it("uses わ for the godan う a-row", () => {
    const table = conjugate(entry("買う", "かう", "godan"));

    expectForm(table, "nai", "買わない", "かわない");
    expectForm(table, "passive", "買われる", "かわれる");
  });

  it("generates the complete ichidan table with standard られる forms", () => {
    const table = conjugate(entry("食べる", "たべる", "ichidan"));

    expect(Object.keys(table)).toEqual(FORM_DEFINITIONS.map(({ id }) => id));
    expectForm(table, "masu", "食べます", "たべます");
    expectForm(table, "ba", "食べれば", "たべれば");
    expectForm(table, "potential", "食べられる", "たべられる");
    expectForm(table, "causativePassive", "食べさせられる", "たべさせられる");
  });

  it("supports する compounds and 来る readings", () => {
    const suru = conjugate(entry("勉強する", "べんきょうする", "irregular"));
    const kuru = conjugate(entry("来る", "くる", "irregular"));

    expectForm(suru, "potential", "勉強できる", "べんきょうできる");
    expectForm(kuru, "nai", "来ない", "こない");
    expectForm(kuru, "imperative", "来い", "こい");
  });

  it("applies explicit overrides after regular generation", () => {
    const iku = conjugate(
      entry("行く", "いく", "godan", {
        te: {
          surface: "行って",
          reading: "いって",
          status: "standard",
        },
        ta: {
          surface: "行った",
          reading: "いった",
          status: "standard",
        },
      }),
    );
    const aru = conjugate(
      entry("ある", "ある", "godan", {
        nai: {
          surface: "ない",
          reading: "ない",
          status: "standard",
        },
        potential: {
          surface: null,
          reading: null,
          status: "not-applicable",
          note: "通常不使用可能形",
        },
      }),
    );

    expectForm(iku, "te", "行って", "いって");
    expectForm(iku, "ta", "行った", "いった");
    expectForm(aru, "nai", "ない", "ない");
    expect(aru.potential).toEqual({
      surface: null,
      reading: null,
      status: "not-applicable",
      note: "通常不使用可能形",
    } satisfies VerbFormValue);
  });

  it("rejects unsupported godan reading tails", () => {
    expect(() => conjugate(entry("問ふ", "とうふ", "godan"))).toThrow(
      'Unsupported godan reading tail "ふ" for 問ふ',
    );
  });
});
