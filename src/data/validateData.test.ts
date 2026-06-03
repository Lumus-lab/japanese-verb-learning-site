import { describe, expect, it } from "vitest";

import { INFERENCE_LEXICON } from "./inferenceLexicon";
import { VERBS } from "./verbs";
import { validateData } from "./validateData";
import type { InferenceLexiconEntry, VerbEntry } from "../domain/types";

const VALID_SOURCE_REF = "irodori-about";

function verb(overrides: Partial<VerbEntry> = {}): VerbEntry {
  return {
    ...VERBS[0],
    id: "test-suru",
    sourceRefs: [VALID_SOURCE_REF],
    ...overrides,
  };
}

function inferenceEntry(
  overrides: Partial<InferenceLexiconEntry> = {},
): InferenceLexiconEntry {
  return {
    dictionaryForm: "する",
    reading: "する",
    group: "irregular",
    notes: [],
    sourceRefs: [VALID_SOURCE_REF],
    ...overrides,
  };
}

describe("validateData", () => {
  it("accepts the curated application data", () => {
    expect(validateData(VERBS, INFERENCE_LEXICON)).toEqual([]);
  });

  it("contains exactly 100 confirmed verbs", () => {
    expect(VERBS).toHaveLength(100);
  });

  it("tracks common inference exceptions with sources", () => {
    expect(INFERENCE_LEXICON.map((entry) => entry.dictionaryForm)).toEqual(
      expect.arrayContaining([
        "行く",
        "ある",
        "帰る",
        "切る",
        "要る",
        "くださる",
        "なさる",
        "いらっしゃる",
        "おっしゃる",
      ]),
    );
    expect(INFERENCE_LEXICON.every((entry) => entry.sourceRefs.length > 0)).toBe(
      true,
    );
  });

  it("covers all three groups and every godan ending", () => {
    expect(new Set(VERBS.map((verb) => verb.group))).toEqual(
      new Set(["godan", "ichidan", "irregular"]),
    );
    expect(
      new Set(
        VERBS.filter((verb) => verb.group === "godan").map((verb) =>
          verb.reading.slice(-1),
        ),
      ),
    ).toEqual(new Set(["う", "く", "ぐ", "す", "つ", "ぬ", "ぶ", "む", "る"]));
  });

  it.each([
    {
      name: "missing verb source",
      verbs: [verb({ sourceRefs: [] })],
      expected: ["verb source missing: test-suru"],
    },
    {
      name: "unknown verb source",
      verbs: [verb({ sourceRefs: ["missing-source"] })],
      expected: ["unknown source ref: test-suru:missing-source"],
    },
    {
      name: "prototype verb source",
      verbs: [verb({ sourceRefs: ["toString"] })],
      expected: ["unknown source ref: test-suru:toString"],
    },
    {
      name: "duplicate verb id",
      verbs: [verb(), verb()],
      expected: ["duplicate verb id: test-suru"],
    },
    {
      name: "invalid conjugation ending",
      verbs: [
        verb({
          id: "invalid-godan",
          dictionaryForm: "問ふ",
          reading: "とうふ",
          group: "godan",
        }),
      ],
      expected: [
        'conjugation error: invalid-godan: Unsupported godan reading tail "ふ" for 問ふ',
      ],
    },
    {
      name: "empty standard override",
      verbs: [
        verb({
          id: "empty-override",
          overrides: {
            masu: { surface: "", reading: "", status: "standard" },
          },
        }),
      ],
      expected: ["invalid form value: empty-override:masu"],
    },
    {
      name: "polluted not-applicable override",
      verbs: [
        verb({
          id: "polluted-not-applicable",
          overrides: {
            potential: {
              surface: "できる",
              reading: "できる",
              status: "not-applicable",
            },
          } as unknown as VerbEntry["overrides"],
        }),
      ],
      expected: ["invalid form value: polluted-not-applicable:potential"],
    },
  ])("rejects $name", ({ verbs, expected }) => {
    expect(validateData(verbs, [])).toEqual(expected);
  });

  it("rejects prototype inference sources", () => {
    expect(
      validateData([], [inferenceEntry({ sourceRefs: ["__proto__"] })]),
    ).toEqual(["unknown inference source: する:__proto__"]);
  });
});
